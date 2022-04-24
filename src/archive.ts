import path from 'path'
import fs from 'fs-extra'
import { merge, pick } from 'lodash'
// @ts-expect-error global
import archiver from 'archiver'
// @ts-expect-error global
import byteSize from 'byte-size'
import { green } from 'kolorist'
import type { ArchiveOption, ArchiverTarOptions, ArchiverZipOptions, Format, Option, Source } from './types'

import { getAbsPath, log, slash } from './util'

// Execute archive action
export async function archive(options: Option | Option[]) {
  const archiveOptions = await resolveOptions(options)
  archiveOptions.map(async(option) => {
    // eslint-disable-next-line no-async-promise-executor
    return new Promise(async(resolve, reject) => {
      const { format, path: outputPath, filename, sources, archiverOption } = option
      // Check output path
      await fs.ensureDir(outputPath)
      const dest = path.join(outputPath, filename)
      // Write stream file. [see all](http://nodejs.cn/api/fs.html#fs_fs_createwritestream_path_options)
      const output = fs.createWriteStream(dest)
      const archive = archiver(format, archiverOption)
      const files: any = []

      output.on('close', () => {
        log(`Compressed done at ${green(`${green(dest)}`)} [${green(byteSize(archive.pointer()))}]`)
        // log(files)
        resolve(dest)
      })

      archive.on('error', (err: Error) => {
        reject(err)
      })

      archive.on('entry', (entry: Record<string, any>) => {
        files.push(slash(entry.name))
      })

      archive.pipe(output)

      await Promise.all(sources.map(async(source: any) => {
        const { pattern, globOption, globEntryData } = source
        await archive.glob(pattern, globOption, globEntryData)
      }))

      await archive.finalize()
    })
  })
}

export function resolveOptions(options: Option | Option[]): Promise<ArchiveOption[]> {
  options = Array.isArray(options) ? options : [options]
  const sourceAttr = ['pattern', 'cwd', 'ignore', 'ignoreFile', 'prefix', 'dot', 'globOption', 'globEntryData']
  // Priority: In Source > Out Source > Default
  // Iterate over the options and rebuild the options
  return Promise.all(options.map(async(option: Option) => {
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
    const mergeSources: Source[] = await Promise.all((sources.length ? sources : [source]).map(async(inSource = {}) => {
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
      const ignore = await resolveIgnore(mergeSource, { path: _path, filename })
      return {
        pattern: mergeSource.pattern,
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
  const { cwd, ignore, ignoreFile } = source

  const dest = path.join(outputPath, filename)

  let _ignore = (Array.isArray(ignore) ? ignore : [ignore]).filter(ig => !!ig)
  if (dest.startsWith(cwd + path.sep))
    _ignore = _ignore.concat((dest.split(cwd + path.sep))[1])

  if (typeof ignoreFile !== 'undefined' && ignoreFile) {
    const ignoreFilePath = getAbsPath(typeof ignoreFile === 'string' ? ignoreFile : '.gitignore', cwd as string)
    const exist = await fs.pathExists(ignoreFilePath)
    if (exist) {
      const ignoreFileContent = await fs.readFile(ignoreFilePath, 'utf-8')
      _ignore = _ignore.concat(ignoreFileContent.split('\r\n').filter(ig => !!ig))
    }
  }

  return _ignore
}
