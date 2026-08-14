/**
 * 클라이언트에 그대로 노출해도 되는 오류. message 는 UI 문구로 쓰인다.
 */
export class PublicError extends Error {
  readonly status: number
  readonly code: string

  constructor(status: number, code: string, message: string) {
    super(message)
    this.name = 'PublicError'
    this.status = status
    this.code = code
  }
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message
  return '알 수 없는 오류가 발생했습니다.'
}
