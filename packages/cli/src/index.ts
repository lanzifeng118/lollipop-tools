import fs from 'fs'
import path from 'path'
import yargs from 'yargs/yargs'
import { hideBin } from 'yargs/helpers'
import { gitMerge } from './merge'
import { error, info, log } from './helper/logger'

const packageJson = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../package.json'), 'utf8'))

yargs(hideBin(process.argv))
  .version(packageJson.version)
  // 合并命令
  .command(
    'merge [branch]',
    '合并命令',
    (yargs) => {
      return yargs
        .positional('branch', {
          describe: '分支名称',
          default: '',
        })
        .option('reset', {
          type: 'boolean',
          description: '是否重置本地分支',
        })
        .option('remote', {
          type: 'boolean',
          description: '是否合并到远程',
        })
        .option('auto-confirm', {
          type: 'boolean',
          description: '是否自动确认，不需要二次询问',
        })
    },
    (argv) => gitMerge(argv),
  )
  .fail(function (msg, err, yargs) {
    if (err) {
      error(err)
    }
    if (msg) {
      info('msg', msg)
    }
    log(yargs.help())
    process.exit(1)
  })
  .parse()
