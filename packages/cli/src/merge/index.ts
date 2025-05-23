import { info, success, warn } from '../helper/logger'
import chalk from 'chalk'
import enquirer from 'enquirer'
import { MergeOptions } from './type'
import { checkoutBranch, determineTargetBranch } from './branch'
import { getBranches, SimpleGit } from '../helper/git'
import { MergeError, MergeErrorCode } from '../helper/error'
import { checkConflict, mergeIgnoreConflict, resolveConflicts } from './conflict'
import { stash, stashList, stashPop } from './stash'
import { GitError } from 'simple-git'

/**
 * Execute a git merge operation with the given options
 * @param options - Merge operation options
 */
export async function gitMerge(option: MergeOptions) {
  const { autoConfirm = false, reset = false, remote = false } = option

  info(`开始合并至${chalk.bold(`${remote ? '远端' : '本地'}分支`)}`)
  await SimpleGit.fetch()
  const { localBranches, remoteBranches, currentBranch } = await getBranches()

  let hasStash = false

  try {
    // 确定目标分支
    const targetBranch = await determineTargetBranch({ ...option, currentBranch, localBranches, remoteBranches })

    info(chalk.bold(chalk.green(`${currentBranch} -> ${targetBranch}`)))

    // 先同步远程分支
    try {
      await SimpleGit.pull()
      success('git pull成功')
    } catch (e) {}

    // 本地是否存在
    const isLocalExit = localBranches.includes(targetBranch)
    const isResetLocal = remote && isLocalExit && reset

    if (isResetLocal) {
      warn(`分支同步警告：本地分支 ${targetBranch} 即将被强制更新至远程分支状态`)
    }
    // 确认

    let isConfirm = false

    if (autoConfirm) {
      isConfirm = true
    } else {
      const res = await enquirer.prompt<{ isConfirm: boolean }>({
        type: 'confirm',
        name: 'isConfirm',
        message: `${chalk.bold(chalk.blue(currentBranch))}(当前分支) -> ${chalk.bold(chalk.green(targetBranch))}(目标分支)，是否继续?`,
      })

      isConfirm = res.isConfirm
    }

    if (!isConfirm) {
      warn('操作已取消')
      throw new MergeError('操作已取消', MergeErrorCode.manualExit)
    }

    // 如果需要重置本地分支
    if (isResetLocal) {
      await SimpleGit.deleteLocalBranch(targetBranch, true)
      success('删除本地分支', targetBranch)
    }

    // 切换到目标分支 如果失败，检查status是否有未提交的文件
    try {
      await checkoutBranch(targetBranch)
    } catch (e) {
      const status = await SimpleGit.status()
      if (status.modified.length > 0) {
        warn(chalk.bgYellow(`存在未提交的文件, 将被 stash`))
        await stash()
        hasStash = true
        await stashList()
        await checkoutBranch(targetBranch)
      } else {
        throw e
      }
    }

    // 执行合并操作 冲突的时候，有的版本会有error信息，有的版本不会
    await mergeIgnoreConflict(currentBranch)

    // 有的merge conflict没有进到catch里，所以统一在这里检查是否有冲突
    if (await checkConflict()) {
      await resolveConflicts(targetBranch, currentBranch)
    }

    success('完成合并', `${currentBranch} -> ${targetBranch}`)

    // 如果是远程分支，推送更改
    if (remote) {
      await SimpleGit.push()
      success('推送更改到远程分支', targetBranch)
    }

    await resetEnv({ currentBranch, hasStash })
  } catch (err) {
    await resetEnv({ currentBranch, hasStash })

    if (MergeError.isManualExit((err as unknown as any)?.code)) {
      process.exit(1)
    }
    throw err
  }
}

/**
 * 重置环境
 */
async function resetEnv(options: { currentBranch: string; hasStash: boolean }) {
  const { currentBranch, hasStash } = options
  await checkoutBranch(currentBranch)
  if (hasStash) {
    await stashPop()
  }
}
