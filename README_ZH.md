<!-- markdownlint-disable no-inline-html -->
<h1 align='center'>SUZIP</h1>

<p align="center">
  <a href="./README.md">English</a>&nbsp;&nbsp;|&nbsp;&nbsp;中文
  <br />
  <br />
  <samp>一个简单好用的文件压缩工具</samp>
  <br />
  <br />
  <img src="https://img.shields.io/npm/l/suzip" alt="license">
  <img src="https://img.shields.io/github/workflow/status/aliuq/suzip/Release" alt="build">
  <img src="https://img.shields.io/npm/v/suzip" alt="version">
  <img src="https://img.shields.io/npm/dw/suzip" alt="download">
</p>

## 功能

+ 支持zip、tar、gzip格式
+ 提供命令行工具，支持配置文件

## 安装

```bash
npm install suzip -D
# or
yarn add suzip -D
# or
pnpm add suzip -D
```

## 使用

Node

```ts
import { zip } from 'suzip'

zip({
  cwd: './',
  output: './.output/dist.zip',
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

查看更多示例，参考[examples](./examples/)目录

## 选项

详细选项类型，参考[源文件](https://github.com/aliuq/suzip/blob/ca4c97e3265a4d3a115460fa8d9ba2f25a66d447/src/types.ts#L96)

+ context: string, 默认为当前目录`process.cwd()`，它会影响其他值为相对路径的选项参数
+ output: string, 输出文件路径，默认为当前目录下的dist.zip
+ cwd: string, 输入源，只能指定一个
+ pattern: string, 正则表达式匹配输入源文件，默认为cwd指定路径下所有文件
+ ignore: string | string[], 正则表达式忽略输出，默认为空
+ ignoreFile: string | boolean, 指定一个ignore文件，如果为true，则使用cwd目录下的**.gitignore**文件
+ prefix: string，输出文件前缀
+ dot: boolean，是否包含`·`开头的文件
+ globOption: object，glob模块的选项, 更多详情参考[node-readdir-glob](https://github.com/yqnn/node-readdir-glob#options)、[node-glob](https://github.com/isaacs/node-glob#options)
+ globEntryData: object，glob模块的输入参数，更多详情参考[node-archiver](https://www.archiverjs.com/docs/archiver#entry-data)
+ archiverOption: object，archiver模块的选项，更多详情参考[node-archiver](https://www.archiverjs.com/docs/archiver#options)
+ sources: object[]，输入源组，每个对象包含cwd、pattern、ignore、ignoreFile、prefix、dot、globOption、globEntryData属性

## 关于suzip

suzip是在原来arch-file的基础上进行了重构和重命名，使用typescript进行类型管理，使用unbuild(rollup + esbuild)进行打包构建，新增了命令行工具，这能让压缩文件操作脱离webpack或vite编译流程，可以直接在命令行中使用，同样，在对应的hooks下，也能很方便的集成。

## License

[MIT](./LICENSE)
