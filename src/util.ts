import path from 'path'
import { bgCyan, black } from 'kolorist'
import pkg from '../package.json'
import type { ParseArgs } from './types'

export function log(message: any) {
  const name = black(bgCyan(` ${pkg.name.toUpperCase()} `))

  if (typeof message === 'object')
    // eslint-disable-next-line no-console
    console.log(name, `\n${JSON.stringify(message, null, 2)}`)
  else if (typeof message === 'function')
    // eslint-disable-next-line no-console
    console.log(name, message, `\n${message.toString()}`)
  else
    // eslint-disable-next-line no-console
    console.log(name, message)
}

export function parseArgs<T extends {}>(options: ParseArgs): T {
  const {
    maps = {},
    start = 2,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    serialize = (value: any) => value,
  } = options
  const args = process.argv.slice(start)
  const result: Pick<T, any> = {}

  const isMatchKey = (key: string) => key.match(/^--(.+)/)
  const isMatchShortKey = (key: string) => key.match(/^-([a-zA-Z])/)
  const validKey = (key: string) => isMatchKey(key) || isMatchShortKey(key)
  const getRealKey = (key: string, maps: Record<string, any> = {}) => {
    if (isMatchKey(key))
      return key.replace(/^--/, '')
    if (isMatchShortKey(key))
      return maps[key.replace(/^-/, '')]
  }

  for (let i = 0; i < args.length; i++) {
    if (!validKey(args[i]))
      continue

    const _key = getRealKey(args[i], maps)
    const nextKey = args[i + 1]
    if (_key)
      result[_key] = nextKey && !validKey(nextKey) ? serialize(nextKey, _key) : true
  }

  return result
}

// Get absolute path
export function getAbsPath(p: string, context: string) {
  return slash(path.isAbsolute(p) ? p : path.join(context, p))
}

// convert `\/` to `path.sep`
export function slash(p: string) {
  return p.replace(/[\\\/]/g, path.sep)
}
