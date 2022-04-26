/**
 * Compress a file or a directory.
 *
 * @examples see {@link generateExamples}
 */

import type { CommandModule, Options } from 'yargs'
import yargs from 'yargs'
import { pick } from 'lodash'
import { red } from 'kolorist'
import type { Option } from '../types'
import y18n from '../y18n'
import { zip } from '../archive'

const { __ } = y18n()

type ZipOption = Pick<Option, 'context' | 'pattern' | 'cwd' | 'ignore' | 'ignoreFile' | 'prefix' | 'output' | 'dot'>

const options: Record<'zip' & 'debug' & 'example' & keyof ZipOption, Options> = {
  cwd: {
    string: true,
    array: false,
    type: 'string',
    alias: 's',
    describe: __`Input Sources (only one can be specified)`,
    coerce: (arg: string | string[]) => {
      if (Array.isArray(arg) && arg.length > 1)
        throw new Error(`[--cwd/-s]: ${__`Only one input source can be specified`}`)

      return arg
    },
  },
  context: {
    alias: 'c',
    describe: __`Working directory path, default to current directory`,
    string: true,
  },
  output: {
    alias: 'o',
    describe: __`Output File Path`,
    coerce: (arg: string | string[]) => {
      if (Array.isArray(arg) && arg.length > 1)
        throw new Error(`[--output/-o]: ${__`Only one output file can be specified`}`)

      return arg
    },
  },
  pattern: {
    alias: 'p',
    string: true,
    describe: __`Regular expression matching input source file`,
  },
  ignore: {
    alias: 'i',
    describe: __`Regular expression to ignore output`,
    array: true,
  },
  ignoreFile: {
    alias: 'I',
    describe: __`File path to ignore output`,
    string: true,
  },
  dot: {
    describe: __`Include dot files`,
    boolean: true,
  },
  zip: {
    describe: __`Zip option attribute in package-json file`,
    conflicts: ['cwd', 'context', 'pattern', 'ignore', 'output', 'dot'],
  },
  example: {
    describe: __`Show examples`,
    boolean: true,
  },
  debug: {
    describe: __`Debug mode, print more information, modified by process.env.SUZIP_DEBUG environment variable`,
    boolean: true,
  },
}

const Zip: CommandModule<{}, ZipOption> = {
  command: 'zip [options]',
  describe: __`Compression files or directories`,
  builder: (yargs) => {
    return yargs.options(options)
  },
  async handler(argv: any) {
    // Show examples
    if (argv.example) {
      yargs.example(generateExamples() as any).showHelp()
      return
    }

    if (argv.debug)
      process.env.SUZIP_DEBUG = 'debug'

    if (argv.zip) {
      await zip(argv.zip)
      return
    }

    const options: ZipOption = pick(argv, ['context', 'pattern', 'cwd', 'ignore', 'ignoreFile', 'output', 'dot'])
    if (options.cwd && options.output) {
      await zip(options)
      return
    }

    console.error(red(`\n[SUZIP]: ${__`Please specify the input source and output file`}\n`))
    yargs.showHelp()
  },
}

export default Zip

// Functions

// Generate examples
function generateExamples(): string[][] {
  const _ = (arr: string[]) => `${arr.join('\n\n')}\n`
  return [
    [_([
      __`Example 1`,
      'suzip -s ./src -o ./.output/dist.zip'],
    )],
    [_([
      __`Example 2`,
      'suzip -s ./ -o ./.output/dist.zip -i node_modules/** dist/**',
    ])],
    [_([
      __`Example 3`,
      'suzip -s ./ -o ./.output/dist.zip -I ./.gitignore --dot',
    ])],
  ]
}
