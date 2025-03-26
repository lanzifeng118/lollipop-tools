import { info, success, warn } from '../helper/logger'
import chalk from 'chalk'
import enquirer from 'enquirer'
import { MergeOptions } from './type'
import { checkoutBranch, determineTargetBranch } from './branch'
import { getBranches, SimpleGit } from '../helper/git'
import { MergeError, MergeErrorCode } from '../helper/error'
import { resolveConflicts } from './conflict'

/**
 * Execute a git merge operation with the given options
 * @param options - Merge operation options
 */
export async function gitMerge(option: MergeOptions) {
  const { autoConfirm = false, reset = false, remote = false } = option

  info(`开始合并至${chalk.bold(`${remote ? '远端' : '本地'}分支`)}`)
  await SimpleGit.fetch()
  const { localBranches, remoteBranches, currentBranch } = await getBranches()

  try {
    // 确定目标分支
    const targetBranch = await determineTargetBranch({ ...option, currentBranch, localBranches, remoteBranches })

    info(chalk.bold(chalk.green(`${currentBranch} -> ${targetBranch}`)))

    // 先同步远程分支
    try {
      await SimpleGit.pull()
    } catch (error) {}

    // 本地是否存在
    const isLocalExit = localBranches.includes(targetBranch)
    const isResetLocal = remote && isLocalExit && reset

    if (isResetLocal) {
      warn(chalk.bgYellow(`本地已存在${targetBranch}, 将被重置！！！`))
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

    // 切换到目标分支
    await checkoutBranch(targetBranch)

    // 执行合并操作
    await SimpleGit.merge([currentBranch])

    // 检查是否有冲突
    const status = await SimpleGit.status()
    if (status.conflicted.length > 0) {
      warn(`检测到合并冲突，文件: ${status.conflicted.join(', ')}`)
      await resolveConflicts(targetBranch, currentBranch)
    }

    success('完成合并', `${currentBranch} -> ${targetBranch}`)

    // 如果是远程分支，推送更改
    if (remote) {
      await SimpleGit.push()
      success('推送更改到远程分支', targetBranch)
    }

    await checkoutBranch(currentBranch)
  } catch (err) {
    await checkoutBranch(currentBranch)
    if (MergeError.isManualExit((err as unknown as any)?.code)) {
      process.exit(1)
    }
    throw err
  }
}
