const path = require('path')
const fs = require('fs-extra')
const archiver = require('archiver')
const _ = require('lodash')
const byteSize = require('byte-size')
const chalk = require('chalk')

// Resolve plugin options
exports.resolveOptions = (options = {}, defaultOption) => {

  options = Array.isArray(options) ? options : [options]
  const sourceAttr = ['pattern', 'cwd', 'ignore', 'prefix', 'globOption']
  // Priority: inSource > outSource > defaultSource
  // Iterate over the options and rebuild the options
  return options.map(option => {
    const { source = {}, sources = [] } = option
    const context = option.context || defaultOption.context
    const archiverOption = option.archiverOption || defaultOption.archiverOption
    const contextAbs = path.isAbsolute(context) ? convertSlash(context) : convertSlash(path.resolve(context))
    const parseOutput = resolveOutput(option.output, defaultOption.output, contextAbs)

    const outSource = _.pick(option, sourceAttr)

    const mergeSources = (sources.length ? sources : [source]).map((inSource = {}) => {
      const mergeSource = _.merge({}, defaultOption.source, outSource, inSource)
      const cwdAbs = path.isAbsolute(mergeSource.cwd)
        ? convertSlash(mergeSource.cwd)
        : convertSlash(path.resolve(context, mergeSource.cwd))

      return { ...mergeSource, cwdAbs }
    })
    return {
      context,
      contextAbs,
      output: option.output,
      ...parseOutput,
      source,
      sources,
      parseSources: mergeSources,
      archiverOption
    }
  })
}

// execute the queue
exports.execActions = async(options, logger) => {
  const result = await Promise.all(options.map(async option => {
    return await archiverAction(option, logger)
  }))
  logger.info(chalk.green('All action is executed ') + JSON.stringify(result))
  return result
}

// convert `\/` to `path.sep`
function convertSlash(str) {
  return str.replace(/[\\\/]/g, path.sep)
}

// Generate `path` `filename` `dest` `pathAbs` `destAbs`
function resolveOutput(output, defaultOutput, context) {
  // Resolve absolute path
  const resolveAbsolute = str => {
    if (!str) return ''
    const getRealPath = cStr => path.extname(cStr) ? path.dirname(cStr) : cStr
    return path.isAbsolute(str)
      ? getRealPath(str)
      : convertSlash(path.join(context, getRealPath(str)))
  }
  // Resolve filename
  const resolveFilename = str => !str || !path.extname(str) ? '' : path.basename(str)
  defaultOutput = path.isAbsolute(defaultOutput) ? defaultOutput : path.join(context, defaultOutput)
  const defaultOutputPath = path.dirname(defaultOutput)
  const defaultOutputFilename = path.basename(defaultOutput)
  const outputPath = (!output || typeof output === 'string' ? output : output.path) || defaultOutputPath
  const outputFilename = (!output || typeof output === 'string' ? output : output.filename) || defaultOutputFilename

  const _path = resolveAbsolute(outputPath) || convertSlash(path.resolve(context))
  const _filename = resolveFilename(outputFilename) || 'dist.zip'
  return {
    filename: _filename,
    path: _path,
    dest: convertSlash(path.join(_path, _filename)),
    format: path.extname(_filename).substr(1)
  }
}

// Execute archive action
function archiverAction({ format, path: outputPath, dest, parseSources, archiverOption }, logger) {
  return new Promise(async (resolve, reject) => {
    // Check destination directory path
    await fs.ensureDir(outputPath)
    // Write stream file. [see all](http://nodejs.cn/api/fs.html#fs_fs_createwritestream_path_options)
    const output = fs.createWriteStream(dest)
    const archive = archiver(format, archiverOption)
    const files = []

    output.on('close', function() {
      logger.info('archiver has been finalized and the output file descriptor has closed.')
      logger.debug(`output path on ${chalk.green(dest)} [${chalk.green(byteSize(archive.pointer()))}]`)
      const list = files.map((file, index) => `${index + 1}. ${file.name} [${file.type}]`)
      logger.debug(`file list:\n\t${list.join('\n\t')}`)
      resolve(dest)
    })

    archive.on('error', function(err) {
      logger.error(err)
      reject(err)
    })

    archive.on('entry', function(entry) {
      files.push(entry)
    })

    archive.pipe(output)
    parseSources.map(async source => {
      const { pattern, cwdAbs, ignore, globOption, prefix } = source

      let _ignore = (Array.isArray(ignore) ? ignore : [ignore]).filter(ig => !!ig)
      if (dest.startsWith(cwdAbs + path.sep)) {
        _ignore = _ignore.concat((dest.split(cwdAbs + path.sep))[1])
      }
      await archive.glob(pattern, { cwd: cwdAbs, ignore: _ignore, ...globOption }, { prefix })
    })
    await archive.finalize()
  })
}
