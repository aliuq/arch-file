/* eslint-disable no-unused-expressions */
import { bold, gray, green, red, reset, underline } from 'kolorist'
import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'
import fs from 'fs-extra'
import y18n from '../y18n'
import { bugs, name, version } from '../../package.json'
import zip from './zip'

(async () => {
  const { __ } = y18n()
  let config
  let configPath
  try {
    const { findUp } = await import('find-up')
    configPath = await findUp(['.suziprc', '.suziprc.json'])
    config = configPath ? JSON.parse(await fs.readFile(configPath, 'utf-8')) : {}
  }
  catch (err: any) {
    console.error(`${gray(`[${name.toUpperCase()}]`)} ${bold(red('An internal error occurred.'))}`)
    console.error(`${gray(`[${name.toUpperCase()}]`)} Found a config file path at ${green(configPath as string)} but failed to parse it.\n`)
    console.error(red(err.message))
    console.error(err)
    process.exit(1)
  }

  yargs(hideBin(process.argv))
    .scriptName('suzip')
    .usage('$0 [command] [option]')
    .command(zip)
    .command('*', __`Compression files or directories`, zip)
    .strict()
    .alias('h', 'help')
    .version(`v${version}`)
    .alias('v', 'version')
    .config(config)
    .pkgConf('suzip')
    .showHelpOnFail(false)
    .fail((msg, err, yargs) => {
      if (msg) {
        console.error(`\n${red(msg)}\n`)
        yargs.showHelp()
        process.exit(1)
      }
      else {
        console.error(`\n${gray(`[${name.toUpperCase()}]`)} ${bold(red('An internal error occurred.'))}`)
        console.error(`${gray(`[${name.toUpperCase()}]`)} ${reset(`Please report an issue, if none already exists: ${underline(bugs)}`)}`)
        yargs.exit(1, err)
      }
    })
    .argv
})()
