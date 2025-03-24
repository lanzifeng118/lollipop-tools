import { ExtendableError } from 'extendable-error'

const ERROR_CODE = {
  git: 10000,
}

export class GitError extends ExtendableError {
  constructor(
    message: string,
    public readonly code: number = ERROR_CODE.git,
  ) {
    super(message)
  }
}

export class ExitError extends ExtendableError {
  constructor(public readonly code: number) {
    super(`The process exited with code: ${code}`)
  }
}

export class InternalError extends ExtendableError {
  constructor(message: string) {
    super(message)
  }
}

export enum MergeErrorCode {
  default = 20000,
  /** 手动退出 */
  manualExit = 20001,
}

export class MergeError extends ExtendableError {
  constructor(
    message: string,
    public readonly code: number = MergeErrorCode.default,
  ) {
    super(message)
  }

  static isManualExit(code: number) {
    return code === MergeErrorCode.manualExit
  }
}
