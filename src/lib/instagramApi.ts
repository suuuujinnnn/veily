import type { InstagramPortfolio } from '../data/instagramPortfolioData'

interface ApiSuccess {
  success: true
  data: InstagramPortfolio
  cached?: boolean
}

interface ApiFailure {
  success: false
  code?: string
  error: string
}

export class InstagramApiError extends Error {
  readonly code: string

  constructor(code: string, message: string) {
    super(message)
    this.name = 'InstagramApiError'
    this.code = code
  }
}

export interface FetchPortfolioOptions {
  limit?: number
  /** 캐시를 건너뛰고 Graph API 를 다시 호출한다. 갱신 버튼에서만 쓴다. */
  refresh?: boolean
  signal?: AbortSignal
}

/**
 * 서버가 Graph API 응답을 화면 계약대로 변환해 돌려준다.
 * access token 은 서버에만 있고 이 경로로 절대 내려오지 않는다.
 */
export async function fetchInstagramPortfolio(
  account: string,
  { limit = 24, refresh = false, signal }: FetchPortfolioOptions = {},
): Promise<InstagramPortfolio> {
  const params = new URLSearchParams({ limit: String(limit) })
  if (refresh) params.set('refresh', '1')

  const response = await fetch(`/api/vendors/${encodeURIComponent(account)}/instagram?${params}`, {
    headers: { Accept: 'application/json' },
    ...(signal ? { signal } : {}),
  })

  const body = (await response.json().catch(() => null)) as ApiSuccess | ApiFailure | null
  if (!body) {
    throw new InstagramApiError('NETWORK', '서버 응답을 읽지 못했습니다.')
  }
  if (!body.success) {
    throw new InstagramApiError(body.code ?? 'UNKNOWN', body.error)
  }
  return body.data
}
