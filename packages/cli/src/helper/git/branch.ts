import { SimpleGit } from './simpleGit'

const REMOTE_PREFIX = 'remotes/origin/'

/**
 * 远端的分支
 */
export async function getBranches() {
  const branches = await SimpleGit.branch()
  const remoteBranches = branches.all.filter((item) => item.startsWith(REMOTE_PREFIX))
  const localBranches = branches.all.filter((item) => !item.startsWith(REMOTE_PREFIX))
  const currentBranch = branches.current
  return {
    remoteBranches,
    localBranches,
    currentBranch,
  }
}

export async function getLocalBranches(): Promise<string[]> {
  const branches = await SimpleGit.branchLocal()
  return branches.all
}

export async function getCurrentBranch(): Promise<string> {
  const branches = await SimpleGit.branchLocal()
  return branches.current
}

export function getMergeChoices(branches: string[], current: string): string[] {
  return branches.filter((item) => item !== current && item !== `${REMOTE_PREFIX}${current}`).map((item) => item.replace(REMOTE_PREFIX, ''))
}
