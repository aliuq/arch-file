import path from 'path'
import { bgCyan, black } from 'kolorist'
import pkg from '../package.json'

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

// Get absolute path
export function getAbsPath(p: string, context: string) {
  return slash(path.isAbsolute(p) ? p : path.join(context, p))
}

// convert `\/` to `path.sep`
export function slash(p: string) {
  return p.replace(/[\\\/]/g, path.sep)
}
