import path from 'path'
import { performance } from 'perf_hooks'
import fs from 'fs-extra'
import { merge, pick } from 'lodash'
// @ts-expect-error No type declaration
import archiver from 'archiver'
// @ts-expect-error No type declaration
import byteSize from 'byte-size'
import { cyan, dim, green } from 'kolorist'

import type { ArchiveOption, ArchiverTarOptions, ArchiverZipOptions, Format, LogLevel, Option, Source } from './types'

import { createLogger, getAbsPath, slash } from './util'

let logger = createLogger(process.env.SUZIP_DEBUG as LogLevel)

// Execute archive action
export async function zip(options: Option | Option[]) {
  logger = createLogger(process.env.SUZIP_DEBUG as LogLevel)
  globalThis.__start_time = performance.now()
  const archiveOptions = await resolveOptions(options)
  logger.pretter(archiveOptions, { title: 'Task' })
  for await (const option of archiveOptions)
    await archive(option)

  const time = Math.round(performance.now() - globalThis.__start_time)
  logger.debugNormal()
  logger.debug(`Total used ${cyan(`${time}ms`)}`)
}

// Archive function
async function archive(option: ArchiveOption) {
// eslint-disable-next-line no-async-promise-executor
  return new Promise(async (resolve, reject) => {
    globalThis.__start_once_time = performance.now()
    const { format, path: outputPath, filename, sources, archiverOption } = option
    // Check output path
    await fs.ensureDir(outputPath)
    const dest = path.join(outputPath, filename)
    // Write stream file. [see all](http://nodejs.cn/api/fs.html#fs_fs_createwritestream_path_options)
    const output = fs.createWriteStream(dest)
    const archive = archiver(format, archiverOption)
    const files: any = []

    output.on('open', () => {
      logger.debugNormal()
      logger.debugNormal()
      logger.group(cyan(`Archiving ${option.filename}`))
    })

    output.on('close', () => {
      const time = Math.round(performance.now() - globalThis.__start_once_time)
      const size = byteSize(archive.pointer())
      logger.groupEnd()
      logger.debugNormal()
      logger.info(`Saved in ${green(dest)} / ${green(files.length)} files / ${green(size)} / ${green(`${time}ms`)}`)
      resolve(dest)
    })

    archive.on('entry', (entry: Record<string, any>) => {
      files.push({
        name: slash(entry.name),
        source: slash(entry.sourcePath),
        size: entry.stats.size,
      })
    })

    archive.on('progress', async (entry: Record<string, any>) => {
      const currIndex = entry.entries.processed - 1
      const file = files[currIndex]
      const size = byteSize(file.size)
      logger.debugNormal(`${dim(currIndex + 1)} ${green(file.source)} [${dim(size.value + size.unit)}] ${dim(file.name)}`)
    })

    archive.on('error', (err: Error) => {
      logger.error(err.message)
      reject(err)
    })

    archive.on('warning', (err: Error) => {
      logger.warn(err.message)
    })

    archive.pipe(output)

    await Promise.all(sources.map(async (source: Source) => {
      const { pattern, globOption, globEntryData } = source
      const [defaultPattern, anotherPattern] = pattern as string[]
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { ignore, ...anotherGlobOption } = globOption as Record<string, any>
      await archive.glob(defaultPattern, globOption, globEntryData)
      anotherPattern && await archive.glob(anotherPattern, anotherGlobOption, globEntryData)
    }))

    await archive.finalize()
  })
}

function resolveOptions(options: Option | Option[]): Promise<ArchiveOption[]> {
  options = Array.isArray(options) ? options : [options]
  logger.debug(`Get ${green(options.length)} task`)
  const sourceAttr = ['pattern', 'cwd', 'ignore', 'ignoreFile', 'prefix', 'dot', 'globOption', 'globEntryData']
  // Priority: In Source > Out Source > Default
  // Iterate over the options and rebuild the options
  return Promise.all(options.map(async (option: Option) => {
    const { source = {}, sources = [] } = option
    // Root for resolve output path
    const context = getAbsPath(option.context || process.cwd(), process.cwd())
    /**
     * Resolve output path
     * 1. './dist.zip'
     * 2. 'd:/xxx/dist.zip'
     * 3. undefined
     */
    let output = option.output || './dist.zip'
    output = path.extname(output) ? output : path.join(output, 'dist.zip')
    const _path = getAbsPath(path.dirname(output), context)
    const filename = path.basename(output)
    // Through file name to get the format and default archiver option
    const { format, archiverOption } = resolveFormat(filename)
    const outSource = pick(option, sourceAttr)
    const mergeSources: Source[] = await Promise.all((sources.length ? sources : [source]).map(async (inSource = {}) => {
      const mergeSource = merge({
        pattern: '**/*',
        cwd: __dirname,
        ignore: '',
        prefix: '/',
        globOption: {},
        globEntryData: {},
      }, outSource, inSource)
      // Absolute cwd path
      mergeSource.cwd = getAbsPath(mergeSource.cwd, context)
      const { ignore, pattern } = await resolveIgnore(mergeSource, { path: _path, filename })
      return {
        pattern: pattern.length ? [mergeSource.pattern, pattern] : [mergeSource.pattern],
        globOption: {
          ...mergeSource.globOption,
          ignore: ignore as string[],
          cwd: mergeSource.cwd,
          dot: mergeSource.dot,
        },
        globEntryData: {
          ...mergeSource.globEntryData,
          prefix: mergeSource.prefix,
        },
      }
    }))

    return {
      format,
      path: _path,
      filename,
      sources: mergeSources,
      archiverOption: Object.assign(archiverOption, option.archiverOption || {}),
    }
  }))
}

function resolveFormat(filename: string) {
  let format: Format = 'zip'
  let archiverOption: ArchiverZipOptions | ArchiverTarOptions = {}
  if (filename.match(/\.zip$/)) {
    format = 'zip'
    archiverOption = { zlib: { level: 9 } }
  }
  else if (filename.match(/\.json$/)) {
    format = 'json'
  }
  else if (filename.match(/\.tar\.gz$/)) {
    format = 'tar'
    archiverOption = {
      gzip: true,
      gzipOptions: {
        level: 9,
      },
    }
  }
  else if (filename.match(/\.tar$/)) {
    format = 'tar'
  }
  return { format, archiverOption }
}

/**
 * Resolved ignore file, returned as an array
 * 1. ignore - string | string[]
 * 2. ignoreFile - string | boolean, if got boolean, will use default `.gitignore` file related with `cwd`
 */
async function resolveIgnore(source: Source, option: { path: string; filename: string }) {
  const { path: outputPath, filename } = option
  const { cwd, ignore, ignoreFile, dot } = source

  const dest = slash(path.join(outputPath, filename))

  let _ignore = (Array.isArray(ignore) ? ignore : [ignore]).filter(ig => !!ig)
  let bPattern = []

  if (dot)
    _ignore.push('.git/**')

  if (typeof ignoreFile !== 'undefined' && ignoreFile) {
    const ignoreFilePath = getAbsPath(
      typeof ignoreFile === 'string' ? ignoreFile : '.gitignore',
      cwd as string,
    )
    const exist = await fs.pathExists(ignoreFilePath)
    if (exist) {
      const ignoreFileContent = await fs.readFile(ignoreFilePath, 'utf-8')
      const ignoreFile = ignoreFileContent.split(/\r?\n/)
      const ignoreFileGlob = gitignoreToGlob(ignoreFile)
      const [_bPattern, bIgnore] = bifurcate(ignoreFileGlob, (ig: string) => ig.startsWith('!'))
      bPattern = _bPattern.map((p: string) => p.substring(1))
      _ignore = _ignore.concat(bIgnore)
    }
  }

  // Auto complete '**' in prefix and suffix
  // _ignore = gitignoreToGlob(_ignore as string[])

  if (dest.startsWith(cwd as string))
    _ignore = _ignore.concat((dest.split(cwd as string))[1])

  // const [bPatter, bIgnore] = bifurcate(_ignore, (ig: string) => ig.startsWith('!'))

  return {
    ignore: _ignore,
    pattern: bPattern,
  }
}

function gitignoreToGlob(ignorePathArray: string[]) {
  return Array.from(new Set(ignorePathArray
    // Filter out empty lines and comments.
    .filter(pattern => !!pattern && pattern[0] !== '#')
    // Split '!' and pattern.
    .map(pattern => pattern[0] === '!' ? ['!', pattern.substring(1)] : ['', pattern])
    // Add prefix '**' to every valid pattern.
    .map((patternPair) => {
      const pattern = patternPair[1]
      if (pattern[0] !== '/') {
        return [
          patternPair[0],
          pattern.startsWith('**') ? pattern : `**/${pattern}`,
        ]
      }
      return [patternPair[0], pattern.substring(1)]
    })
    // Add suffix '**' to every valid pattern.
    .reduce((result, patternPair) => {
      const pattern = patternPair.join('')
      result.push(pattern)
      result.push(pattern.endsWith('*') ? pattern : `${pattern}/**`)
      return result
    }, [])))
}

function bifurcate(arr: any[], filter: Function) {
  return arr.reduce((acc, val, i) => {
    acc[filter(val, i) ? 0 : 1].push(val)
    return acc
  }, [[], []])
}

declare global {
  // eslint-disable-next-line vars-on-top, no-var
  var __start_time: number
  // eslint-disable-next-line vars-on-top, no-var
  var __start_once_time: number
}
