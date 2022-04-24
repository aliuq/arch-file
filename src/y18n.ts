import path from 'path'
// @ts-expect-error global
import _y18n from 'y18n'

export default function y18n(locale?: string) {
  return _y18n({
    directory: path.join(__dirname, '../locales'),
    updateFiles: false,
    locale: locale || getLocale(),
  })
}

function getLocale() {
  const locale = process.env.LC_ALL || process.env.LC_MESSAGES || process.env.LANG || process.env.LANGUAGE || 'en_US'
  return locale.replace(/[.:].*/, '')
}
