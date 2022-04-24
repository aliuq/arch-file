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
import { archive } from '../archive'

const { __ } = y18n()

type ZipOption = Pick<Option, 'context' | 'pattern' | 'cwd' | 'ignore' | 'ignoreFile' | 'prefix' | 'output' | 'dot'>

const options: Record<'zip' & 'example' & keyof ZipOption, Options> = {
  cwd: {
    string: true,
    array: false,
    type: 'string',
    alias: 's',
    describe: __`Input Sources (only one can be specified)`,
    // demandOption: true,
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
    // demandOption: true,
    coerce: (arg: string | string[]) => {
      if (Array.isArray(arg) && arg.length > 1)
        throw new Error(`[--output/-o]: ${__`Only one output file can be specified`}`)

      return arg
    },
  },
  pattern: {
    alias: 'p',
    string: true,
    describe: 'Regular expression matching input source file',
  },
  ignore: {
    alias: 'i',
    describe: 'Regular expression to ignore output',
    array: true,
  },
  ignoreFile: {
    alias: 'I',
    describe: 'File path to ignore output',
    string: true,
  },
  dot: {
    describe: __`Include dot files`,
    boolean: true,
  },
  zip: {
    describe: __`Zip option attribute in package.json file`,
    conflicts: ['cwd', 'context', 'pattern', 'ignore', 'output', 'dot'],
  },
  example: {
    describe: __`Show examples`,
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

    if (argv.zip) {
      await archive(argv.zip)
      return
    }

    const options: ZipOption = pick(argv, ['context', 'pattern', 'cwd', 'ignore', 'ignoreFile', 'output', 'dot'])
    if (options.cwd && options.output) {
      await archive(options)
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
      '1.压缩src目录下的所有文件到.output/dist.zip文件中',
      'suzip -s ./src -o ./.output/dist.zip'],
    )],
    [_([
      '2.压缩当前目录下所有除了node_modules和dist目录的文件到.output/dist.zip文件中',
      'suzip -s ./ -o ./.output/dist.zip -i node_modules/** dist/**',
    ])],
    [_([
      '3.指定ignore文件,压缩除匹配到的其他所有文件到.output/dist.zip文件中,注意,ignore文件中的规则需要补全,比如`node_modules`需要调整为`node_modules/**',
      'suzip -s ./ -o ./.output/dist.zip -I ./.gitignore --dot',
    ])],
  ]
}
