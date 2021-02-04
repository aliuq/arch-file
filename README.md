# 🚀 Welcome to arch-file!

## Install

```shell
$ npm install arch-file --save
# or
$ npm i arch-file --save
```

## Usage

### normal

```js
const NodeArch = require('arch-file')
const arch = new NodeArch()
arch.run()
```

### webpack

```js
const NodeArch = require('arch-file')
module.exports = {
  plugins: [
    new NodeArch()
  ]
}
```

## Options

`{object|array<object>}`

### Property

+ `output` `{string|object}` `./dist.zip` archived file output path.
  + `path` output directory.
  + `filename` output file name.
+ `context` `{string}` `.` all path related properties depend on this value, unless others provided absolute path.
+ `pattern` `{string}` `**/*` match pattern, default means match all files under the `cwd` directory, [see more](https://github.com/isaacs/minimatch).
+ `cwd` `{string}` `__dirname` in the current working directory to use matching pattern.
+ `ignore` `{string|array}` glob patterns to exclude matched.
+ `prefix` `{string}` `/` all files will be under the directory.
+ `globOption` `{object}` used node-archiver, [glob option](https://github.com/isaacs/node-glob#options)
+ `archiverOption` `{object}` archiver option [see more](https://www.archiverjs.com/archiver).
+ `source` `{object}` the same as outer\`s property, if provided, will override outer\`s value.
  + `pattern` `{string}` `**/*` 
  + `cwd` `{string}` `__dirname`
  + `ignore` `{string|array}`
  + `prefix` `{string}` `/`
  + `globOption` `{object}`
+ `sources` `{array<source>}` source array, if provided, will add all `source` matched files.

### Default Option

**Normal**

```js
DEFAULT_OPTION = {
  output: './dist.zip',
  context: '.',
  archiverOption: { zlib: { level: 9 } },
  source: {
    pattern: '**/*',
    cwd: __dirname,
    ignore: '',
    prefix: '/',
    globOption: {}
  }
}

```

**Webpack**

```js
DEFAULT_OPTION = {
  output: path.join(compilation.outputPath, 'dist.zip'),
  context: compilation.context,
  archiverOption: { zlib: { level: 9 } },
  source: {
    pattern: '**/*',
    cwd: compilation.outputPath,
    ignore: '',
    prefix: '/',
    globOption: {}
  }
}
```


## Scenes

1. archive all files under the `example` directory and output to `example`.
```js
const NodeArch = require('arch-file')
const options = {
  output: './example/scene1.zip',
  cwd: './example'
}
const arch = new NodeArch()
arch.run(options)
```

2. archive `example` directory\`s all files and output to `example`, exclude `.js` and `demo1` directory.
```js
const NodeArch = require('arch-file')
const options = {
  output: './example/scene2.zip',
  cwd: './example',
  ignore: ['*.js', 'demo1/**']
}
const arch = new NodeArch()
arch.run(options)
```

3. archive `example/demo1` directory\`s files to `example1` and archive `example/demo2` directory\`s files to `example2`.
```js
const NodeArch = require('arch-file')
const options = {
  output: './example/scene3.zip',
  sources: [
    { cwd: './example/demo1', prefix: 'example1' },
    { cwd: './example/demo2', prefix: 'example2' }
  ]
}
const arch = new NodeArch()
arch.run(options)
```

4. archive `example/demo1` directory\`s files and `example/*.md` files and output to `example/example_demo1.zip. archive  `example/demo2` directory\`s files and `example/*.js` to `example/example_demo2.zip`.
```js
const NodeArch = require('arch-file')
const options = [
  {
    output: './example/example_demo1.zip',
    sources: [
      { cwd: './example/demo1', prefix: 'demo1' },
      { cwd: './example/', pattern: '*.md' }
    ]
  },
  {
    output: './example/example_demo2.zip',
    sources: [
      { cwd: './example/demo2', prefix: 'demo2' },
      { cwd: './example/', pattern: '*.js' }
    ]
  }
]
const arch = new NodeArch()
arch.run(options)
```

5. in webpack, archive project\`s all source files to `output.path/scene5.zip`
```js
const NodeArch = require('arch-file')
module.exports = {
  plugins: [
    new NodeArch({
      output: {
        filename: 'scene5.zip'
      },
      cwd: __dirname,
      ignore: ['node_modules/**', 'dist/**']
    })
  ]
}
```
