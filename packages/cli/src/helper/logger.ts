import chalk from 'chalk'
import util from 'util'
import { LOGO } from './constants'

function format(args: Array<any>, customPrefix?: string) {
  let fullPrefix = LOGO + ' ' + (customPrefix === undefined ? '' : ' ' + customPrefix)
  return (
    fullPrefix +
    util
      .format('', ...args)
      .split('\n')
      .join('\n' + fullPrefix + ' ')
  )
}

export function error(...args: Array<any>) {
  console.error(format(args, chalk.red('Error')))
}

export function info(...args: Array<any>) {
  console.info(format(args, chalk.cyan('Info')))
}

export function log(...args: Array<any>) {
  console.log(format(args))
}

export function success(...args: Array<any>) {
  console.log(format(args, chalk.green('Success')))
}

export function warn(...args: Array<any>) {
  console.warn(format(args, chalk.yellow('Warn')))
}
