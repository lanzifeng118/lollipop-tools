import { warn } from 'console'
import { LOGO } from '../helper/constants'
import { SimpleGit } from '../helper/git'
import { success } from '../helper/logger'

export async function stash() {
  await SimpleGit.stash(['push', '-m', `${LOGO} merge temp ${new Date().toLocaleString()}`])
  success('stash成功')
}

export async function stashList() {
  const list = await SimpleGit.stash(['list'])
  success(list)
}

export async function stashPop() {
  await SimpleGit.stash(['pop'])
  success('stash pop成功')
}
