# SUZIP

A simple and easy-to-use file compression tool

## Features

+ Supports zip, tar, gzip formats
+ Provides command line tools and support for configuration files

## Installation

```bash
npm install suzip -D
# or
yarn add suzip -D
# or
pnpm add suzip -D
```

## Useage

Node

```ts
import { zip } from 'suzip'

zip({
 cwd: '. /',
 output: '. /.output/dist.zip',
 ignore: ['node_modules/**', '.output/**', 'dist/**'],
 dot: true,
})
```

Command Line

```bash
suzip [command] [option]

Commands:
  suzip zip [options]  Compression files or directories
  suzip                Compression files or directories                [default]

Options:
  -s, --cwd         Input Sources (only one can be specified)           [string]
  -c, --context     Working directory path, default to current directory[string]
  -o, --output      Output File Path
  -p, --pattern     Regular expression matching input source file       [string]
  -i, --ignore      Regular expression to ignore output                  [array]
  -I, --ignoreFile  File path to ignore output                          [string]
      --dot         Include dot files                                  [boolean]
      --zip         Zip option attribute in package.json file
      --example     Show examples                                      [boolean]
  -h, --help        Show help                                          [boolean]
  -v, --version     Show version number                                [boolean]
```

See more [examples](./examples/)

## Options

For detailed option types, refer to [source](https://github.com/aliuq/suzip/blob/ca4c97e3265a4d3a115460fa8d9ba2f25a66d447/src/types.ts#L96)

+ **context**: `{string}`, Default is current directory `process.cwd()`, it affects other option parameters with relative path values
+ **output**: `{string}`, output file path, Default is `dist.zip`
+ **cwd**: `{string}`, the input source, only one can be specified
+ **pattern**: `{string}`, regular expression to match the input source file, Default is `**/*`
+ **ignore**: `{string | string[]}`, regular expression ignore output
+ **ignoreFile**: `{string | boolean}`, specify an ignore file, if `true`, then use the `.gitignore` file in the cwd directory
+ **prefix**: `{string}`, the output file prefix
+ **dot**: `{boolean}`, whether to include files starting with `.`
+ **globOption**: `{object}`, options for the glob module, see [node-readdir-glob](https://github.com/yqnn/node-readdir-glob#options)、[node-glob](https://github.com/isaacs/node-glob#options) for more details
+ **globEntryData**: `{object}`, input parameter for glob module, see [node-archiver](https://www.archiverjs.com/docs/archiver#entry-data) for more details
+ **archiverOption**: `{object}`, the options for the archiver module, see [node-archiver](https://www.archiverjs.com/docs/archiver#options) for more details
+ **sources**: `{object[]}`, input source group, each object contains `cwd, pattern, ignore, ignoreFile, prefix, dot, globOption, globEntryData` attributes

## About suzip

suzip is based on the original `arch-file` refactoring and renaming, using typescript for type management, using unbuild (rollup + esbuild) for packaging build, new command line tools, which can make the compressed file operation out of the webpack or vite compilation process, can be directly in the command line, It is also easy to integrate with the corresponding hooks.

## License

[MIT](./LICENSE)

