const path = require('path')
const chalk = require('chalk')
const _ = require('lodash')
const Schema = require('./shema.json')
const { validate } = require('schema-utils')
const { resolveOptions, execActions } = require('./util')

const PLUGIN_NAME = 'NodeArch'

// Schema configuration, Make it stand out when it's wrong.
const configuration = {
  name: PLUGIN_NAME,
  baseDataPath: 'options',
  postFormatter: (formattedError, error) => {
    return chalk.bgRed.white(formattedError)
  }
}

const DEFAULT_OPTION = {
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

const DEBUG_LEVELS = ['warning', 'info', 'debug']
const logger = debug => {
  debug = typeof debug === 'boolean' && debug ? 'debug' : debug
  const levelIndex = DEBUG_LEVELS.indexOf(debug)
  const name = chalk.bold(`[${PLUGIN_NAME}]`)
  return {
    warning: (...args) => levelIndex >= 0 && console.warn(name, ...args),
    info: (...args) => levelIndex >= 1 && console.log(name, ...args),
    debug: (...args) => levelIndex >= 2 && console.debug(name, ...args)
  }
}

class NodeArch {

  constructor(sources = {}, debug = false) {
    if (typeof sources === 'boolean') {
      debug = sources
    } else if ((Array.isArray(sources) && sources.length) || Object.keys(sources).length) {
      validate(Schema, sources, configuration)
      this.sources = sources
    }
    this.logger = logger(debug)
  }

  async run(sources, debug) {
    this.sources = resolveOptions(sources || this.sources, DEFAULT_OPTION)
    const privateLogger = typeof debug === 'undefined' ? this.logger : logger(debug)
    return await execActions(this.sources, privateLogger)
  }

  // Support Webpack
  apply(compiler) {

    if (!compiler.hooks && !compiler.plugin) {
      this.logger.warning('Not Supported!!!')
      return true
    }

    const resolveCompilerOption = compilation => {
      const mergeDefaultOption = _.merge({}, DEFAULT_OPTION, {
        output: path.join(compilation.outputPath, 'dist.zip'),
        context: compilation.context,
        source: { cwd: compilation.outputPath },
        ignore: ['node_modules/**', 'dist/**']
      })
      this.logger.debug('Default option', mergeDefaultOption)
      this.sources = resolveOptions(this.sources, mergeDefaultOption)
    }

    if (compiler.hooks) { // webpack version >= 4
      this.logger = compiler.getInfrastructureLogger(PLUGIN_NAME)

      compiler.hooks.beforeRun.tap(PLUGIN_NAME, compilation => {
        this.logger.debug('Starting beforeRun')
        resolveCompilerOption(compilation)
      })

      compiler.hooks.afterEmit.tapAsync(PLUGIN_NAME, async (compilation, callback) => {
        this.logger.debug('Starting afterEmit')
        await execActions(this.sources, this.logger)
        return callback()
      })
    } else { // webpack version < 4
      compiler.plugin('before-run', (compilation, cb) => {
        this.logger.debug('Starting before-run')
        resolveCompilerOption(compilation)
        return cb()
      })

      compiler.plugin('after-emit', async (compilation, cb) => {
        this.logger.debug('Starting after-emit')
        await execActions(this.sources, this.logger)
        return cb()
      })
    }
  }
}

module.exports = NodeArch
