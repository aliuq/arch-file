import type { ZlibOptions } from 'zlib'
import type { Stats } from 'fs'
import type { IOptions } from 'glob'

interface EntryData {
  /** Sets the entry name including internal path */
  name?: string
  /** Sets the entry date */
  date?: Date | string
  /** Sets the entry permissions */
  mode?: number
  /**
   * Sets a path prefix for the entry name. Useful when working with methods like directory or glob
   * @link https://www.archiverjs.com/docs/archiver/#directory
   * @link https://www.archiverjs.com/docs/archiver/#glob
   */
  prefix?: string
  /** Sets the stat data for this entry allowing for reduction of fs.stat calls. */
  stats?: Stats
}

interface EntryZipData {
  /** Prepends a forward slash to archive file paths */
  namePrependSlash?: boolean
  /** Sets the compression method to STORE */
  store?: boolean
}

interface ArchiveCoreOptions {
  /**
   * Sets the number of workers used to process the internal fs stat queue.
   * @default 4
   */
  statConcurrency?: number
}

export interface ArchiverZipOptions extends ArchiveCoreOptions {
  /** Sets the zip archive comment */
  comment?: string
  /** Forces the archive to contain local file times instead of UTC */
  forceLocalTime?: boolean
  /** Forces the archive to contain ZIP64 headers */
  forceZip64?: boolean
  /** Prepends a forward slash to archive file paths */
  namePrependSlash?: boolean
  /** Sets the compression method to STORE */
  store?: boolean
  /**
   * Passed to zlib to control compression
   * @link https://nodejs.org/api/zlib.html#zlib_class_options
   */
  zlib?: ZlibOptions
}

/**
 * @link https://www.archiverjs.com/docs/archiver#constructor
 * @link https://www.npmjs.com/package/tar-stream
 */
export interface ArchiverTarOptions extends ArchiveCoreOptions {
  /** Compress the tar archive using gzip */
  gzip?: boolean
  /** Passed to zlib to control compression. */
  gzipOptions?: ZlibOptions
}

export interface Source {
  /**
   * The current working directory in which to search
   * @default `process.cwd()`
   */
  cwd?: string
  /** pattern to search for */
  pattern?: string
  /** Add a pattern or an array of glob patterns to exclude matches. */
  ignore?: string | string[]
  /** ignore file, likes `.gitignore` */
  ignoreFile?: string | boolean
  /** prefix directory to the pattern */
  prefix?: string
  /**
   * Allow pattern to match filenames starting with a period,
   * even if the pattern does not explicitly have a period in that spot.
   */
  dot?: boolean
  /**
   * glob another option
   *
   * @see node-readdir-glob / https://github.com/yqnn/node-readdir-glob#options
   * @see node-glob / https://github.com/isaacs/node-glob#options
   */
  globOption?: IOptions
  /** The entry data object */
  globEntryData?: EntryData & EntryZipData
}

export interface Option extends Source {
  context?: string
  archiverOption?: ArchiverZipOptions | ArchiverTarOptions
  source?: Source
  sources?: Source[]
  output?: string
}

export type Format = 'zip' | 'tar' | 'json'

export interface ArchiveOption {
  format: Format
  sources: Source[]
  path: string
  filename: string
  archiverOption: ArchiverZipOptions | ArchiverTarOptions
}
