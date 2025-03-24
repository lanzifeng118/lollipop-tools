/**
 * Options for the git merge operation
 */
export interface MergeOptions {
  /** Target branch name to merge into */
  branch: string
  /** Whether to use remote branch */
  remote?: boolean
  /** Whether to reset local branch if it exists */
  reset?: boolean
  /** 自动处理 */
  autoConfirm?: boolean
}
