const path = require('path')
const webpack = require('webpack')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')

module.exports = {
  // mode: 'development',
  mode: 'none',
  entry: './src/index.js',
  output: {
    filename: 'index.js',
    path: path.resolve(__dirname, 'lib')
  },
  target: 'node',
  stats: {
    assets: true
  },
  infrastructureLogging: {
    level: 'info',
    debug: [
      name => name.includes('NodeArch')
    ]
  },
  externals: ['archiver', 'chalk', 'fs-extra', 'lodash', 'schema-utils', 'byte-size'],
  plugins: [
    new CleanWebpackPlugin(),
    new webpack.ProgressPlugin()
  ]
}
