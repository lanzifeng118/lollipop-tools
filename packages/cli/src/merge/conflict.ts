import Enquirer from 'enquirer'
import { GitError, MergeError, MergeErrorCode } from '../helper/error'
import { SimpleGit } from '../helper/git'
import { error, success, warn } from '../helper/logger'
import chalk from 'chalk'

async function deleteTempBranch(tempBranch: string, targetBranch: string): Promise<void> {
  try {
    // 确保我们在非临时分支上
    const { current, conflicted } = await SimpleGit.status()

    if (conflicted.length) {
      await SimpleGit.raw(['merge', '--abort'])
    }
    if (current === tempBranch) {
      await SimpleGit.checkout(targetBranch)
    }

    await SimpleGit.deleteLocalBranch(tempBranch, true)
    success(`已删除临时分支 ${tempBranch}`)
  } catch (error) {
    warn(`无法清理临时分支 ${tempBranch}，请手动删除`)
    throw error
  }
}

/**
 * 解决合并冲突
 * @param targetBranch - 目标分支
 * @param currentBranch - 当前分支
 */
export async function resolveConflicts(targetBranch: string, currentBranch: string): Promise<void> {
  // 1. 终止当前合并操作
  await SimpleGit.raw(['merge', '--abort'])
  warn('已终止合并操作，准备创建临时分支解决冲突')

  // 2. 创建唯一的临时分支
  const timestamp = Date.now()
  const tempBranch = `conflict-resolution-${timestamp}`

  try {
    // 从目标分支创建临时分支
    await SimpleGit.checkoutBranch(tempBranch, targetBranch)
    success(`从目标分支 ${targetBranch} 创建临时分支: ${tempBranch}`)

    // 3. 合并当前分支到临时分支
    try {
      await SimpleGit.merge([currentBranch])
    } finally {
      // 预期会有冲突
      const conflictStatus = await SimpleGit.status()
      if (conflictStatus.conflicted.length > 0) {
        warn(`需要手动解决以下文件的冲突: ${conflictStatus.conflicted.join(', ')}`)
      }
    }

    // 4. 提示用户解决冲突
    const { isResolved } = await Enquirer.prompt<{ isResolved: boolean }>({
      type: 'confirm',
      name: 'isResolved',
      message: chalk.bold(chalk.red(`请手动解决冲突后，将更改添加到暂存区 (git add .)，然后确认继续`)),
    })

    if (!isResolved) {
      warn('操作已取消，请手动处理冲突')
      throw new MergeError('操作已取消，请手动处理冲突', MergeErrorCode.manualExit)
    }
    // 5. 解决冲突后，将更改添加到暂存区并提交
    // 验证冲突是否已解决
    const resolvedStatus = await SimpleGit.status()
    if (resolvedStatus.conflicted.length > 0) {
      throw new GitError('仍有未解决的冲突，请解决所有冲突后再继续')
    }

    // 提交解决的冲突
    await SimpleGit.commit(`Resolved conflicts between ${targetBranch} and ${currentBranch}`)
    success('已提交冲突解决')

    // 5. 切回目标分支并合并临时分支

    await SimpleGit.checkout(targetBranch)
    await SimpleGit.merge([tempBranch])
    const { conflicted } = await SimpleGit.status()
    if (conflicted.length) {
      error(`合并后仍有冲突，请手动解决`)
    } else {
      success(`已将解决冲突的临时分支 ${tempBranch} 合并至 ${targetBranch}`)
    }
  } catch (error) {
    throw error
  } finally {
    // 6. 尝试清理临时分支（即使前面步骤出错也要尝试清理）
    await deleteTempBranch(tempBranch, targetBranch)
  }
}
