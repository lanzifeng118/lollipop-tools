import enquirer from 'enquirer'
import { MergeOptions } from './type'
import { getMergeChoices, SimpleGit } from '../helper/git'
import { GitError } from '../helper/error'
import { success } from '../helper/logger'

interface Option extends MergeOptions {
  /** 本地分支列表 */
  localBranches: string[]
  /** 远程分支列表 */
  remoteBranches: string[]
  /** 当前分支 */
  currentBranch: string
}

/**
 * 确定目标分支
 * @param option - 合并选项
 * @returns 目标分支名称
 */
export async function determineTargetBranch(option: Option): Promise<string> {
  // 如果指定了分支名称，直接使用
  const { branch, remote, localBranches, remoteBranches, currentBranch } = option

  if (branch) {
    return branch
  }

  // 否则让用户选择分支
  const choices = getMergeChoices(remote ? remoteBranches : localBranches, currentBranch)

  if (!choices.length) {
    throw new GitError('无可选择的分支')
  }

  const res = await enquirer.prompt<{ branch: string }>({
    type: 'select',
    name: 'branch',
    message: `选择目标分支 ${option.remote ? '（远程）' : '（本地）'}`,
    choices,
  })

  return res.branch
}

export async function checkoutBranch(branch: string) {
  const status = await SimpleGit.status()
  if (status.current !== branch) {
    await SimpleGit.checkout(branch)
    success('检出分支:', branch)
  }
}
