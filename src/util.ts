/* eslint-disable no-console */
import path from 'path'
import { bgCyan, black, blue, gray, green, lightBlue, lightGray, lightMagenta, lightRed, lightYellow } from 'kolorist'
import pkg from '../package.json'
import type { LogLevel } from './types'

// Get absolute path
export function getAbsPath(p: string, context: string) {
  return slash(path.isAbsolute(p) ? p : path.join(context, p))
}

// convert `\/` to `path.sep`
export function slash(p: string) {
  return p.replace(/[\/]/g, path.sep)
}

export function createLogger(level: LogLevel = 'info') {
  const levelMaps = {
    error: 0,
    warn: 1,
    info: 2,
    debug: 3,
  }
  const levelInt = typeof levelMaps[level] === 'undefined' ? levelMaps.info : levelMaps[level]
  const name = black(bgCyan(` ${pkg.name.toUpperCase()} `))
  const log = (...args: any) => console.log(`${name} ${args}`)
  const now = () => gray(new Date().toISOString())
  return {

    debug(message: any) {
      if (levelInt >= 3)
        log(`${lightBlue('[debug]')} ${now()} ${message}`)
    },

    debugNormal(...message: any) {
      if (levelInt >= 3)
        console.log(...message)
    },

    info(message: any) {
      if (levelInt >= 2)
        log(`${lightGray('[info]')} ${now()} ${message}`)
    },

    warn(message: any) {
      if (levelInt >= 1)
        log(`${lightYellow('[warn]')} ${now()} ${message}`)
    },

    error(message: any) {
      if (levelInt >= 0)
        log(`${lightRed('[error]')} ${now()} ${message}`)
    },

    table(...message: any) {
      if (levelInt >= 3)
        console.table(...message)
    },

    pretter(msgs: any, opts: PretterOptions) {
      if (levelInt >= 3)
        pretterInfo(msgs, opts)
    },

    group(message: any) {
      if (levelInt >= 3)
        console.group(message)
    },

    groupEnd() {
      if (levelInt >= 3)
        console.groupEnd()
    },
  }
}

interface PretterOptions {
  title: string
  root?: boolean
}

function pretterInfo(data: any, opts: PretterOptions) {
  const root = typeof opts.root === 'undefined' ? true : opts.root
  opts.title = UpperFirstWord(opts.title)
  // Start
  if (root)
    console.group(`${lightMagenta('Tasks:')} ${green(opts.title)}`)

  // Array
  if (Array.isArray(data)) {
    const hasObject = data.some(item => typeof item === 'object')
    if (!root && hasObject)
      console.groupCollapsed(`${gray(opts.title)}:`)

    if (hasObject) {
      data.forEach((d, i) => {
        pretterInfo(d, { title: `${opts.title} ${i + 1}`, root: false })
        if (i === data.length - 1)
          console.groupEnd()
      })
    }
    else {
      console.log(`${gray(opts.title)}: ${data.map(d => blue(d)).join(' 、 ')}`)
    }
  }
  // Object
  else if (typeof data === 'object') {
    const keys = Object.keys(data)
    if (!keys.length) {
      console.log(`${gray(opts.title)}: ${data}`)
    }
    else {
      if (!root)
        console.groupCollapsed(`${gray(opts.title)}:`)

      keys.forEach((key, i) => {
        pretterInfo(data[key], { title: key, root: false })
        if (i === keys.length - 1)
          console.groupEnd()
      })
    }
  }
  // Other types
  else {
    console.log(`${gray(opts.title)}: ${green(data)}`)
  }
}

function UpperFirstWord(str: string) {
  return str.replace(/^\w/, c => c.toUpperCase())
}
