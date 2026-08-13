import type { Config } from '../config.js'
import { PublicError } from '../lib/errors.js'
import { type BusinessDiscovery, graphErrorSchema, graphResponseSchema } from './types.js'

const GRAPH_HOST = 'https://graph.facebook.com'

/** username 은 fields 문자열에 그대로 박히므로 화이트리스트로 막는다. */
const USERNAME_PATTERN = /^[A-Za-z0-9._]{1,30}$/

/**
 * business_discovery 가 확장 가능한 필드만 나열한다. 목록에 없는 필드를 넣으면
 * 요청 전체가 실패하므로 임의로 늘리지 않는다.
 */
const MEDIA_FIELDS = [
  'id',
  'media_type',
  'media_product_type',
  'media_url',
  'thumbnail_url',
  'permalink',
  'caption',
  'timestamp',
  'children{id,media_type,media_url}',
].join(',')

const PROFILE_FIELDS = [
  'username',
  'name',
  'biography',
  'website',
  'profile_picture_url',
  'followers_count',
  'follows_count',
  'media_count',
].join(',')

export interface FetchPortfolioParams {
  account: string
  limit: number
  after?: string
}

export interface AppUsage {
  callCount?: number
  totalTime?: number
  totalCPUTime?: number
}

export interface GraphFetchResult {
  discovery: BusinessDiscovery
  appUsage?: AppUsage
}

function buildFields({ account, limit, after }: FetchPortfolioParams): string {
  const mediaArgs = after ? `.after(${after}).limit(${limit})` : `.limit(${limit})`
  return `business_discovery.username(${account}){${PROFILE_FIELDS},media${mediaArgs}{${MEDIA_FIELDS}}}`
}

/**
 * 앱 단위 Platform Rate Limit 을 추적한다. business_discovery 는 계정별이 아니라
 * 앱 전체 쿼터를 쓰므로, 업체 수가 늘면 여기가 병목이 된다.
 */
function parseAppUsage(header: string | null): AppUsage | undefined {
  if (!header) return undefined
  try {
    const parsed: unknown = JSON.parse(header)
    if (typeof parsed !== 'object' || parsed === null) return undefined
    const usage = parsed as Record<string, unknown>
    return {
      callCount: typeof usage.call_count === 'number' ? usage.call_count : undefined,
      totalTime: typeof usage.total_time === 'number' ? usage.total_time : undefined,
      totalCPUTime: typeof usage.total_cputime === 'number' ? usage.total_cputime : undefined,
    }
  } catch {
    return undefined
  }
}

function toPublicError(body: unknown, status: number): PublicError {
  const parsed = graphErrorSchema.safeParse(body)
  if (!parsed.success) {
    return new PublicError(502, 'GRAPH_UNKNOWN', `Instagram 응답을 해석하지 못했습니다. (HTTP ${status})`)
  }

  const { code, error_subcode: subcode, message } = parsed.data.error

  // 110/2207013 은 대상 계정을 찾지 못한 경우다. 비공개·개인 계정도 여기로 떨어진다.
  if (code === 110 || subcode === 2207013) {
    return new PublicError(404, 'ACCOUNT_NOT_FOUND', '해당 사용자명의 공개 프로페셔널 계정을 찾을 수 없습니다.')
  }
  if (code === 80002) {
    return new PublicError(429, 'RATE_LIMITED', '요청이 많아 잠시 후 다시 시도해야 합니다.')
  }
  if (code === 190) {
    return new PublicError(500, 'TOKEN_INVALID', '서버 토큰이 만료되었거나 유효하지 않습니다.')
  }
  return new PublicError(502, 'GRAPH_ERROR', `Instagram 조회에 실패했습니다. (${message})`)
}

export async function fetchBusinessDiscovery(config: Config, params: FetchPortfolioParams): Promise<GraphFetchResult> {
  if (!USERNAME_PATTERN.test(params.account)) {
    throw new PublicError(400, 'INVALID_ACCOUNT', '사용자명 형식이 올바르지 않습니다.')
  }

  const url = new URL(`${GRAPH_HOST}/${config.GRAPH_API_VERSION}/${config.IG_USER_ID}`)
  url.searchParams.set('fields', buildFields(params))
  url.searchParams.set('access_token', config.IG_ACCESS_TOKEN)

  const response = await fetch(url, { headers: { Accept: 'application/json' } })
  const appUsage = parseAppUsage(response.headers.get('x-app-usage'))
  const body: unknown = await response.json().catch(() => null)

  if (!response.ok) {
    throw toPublicError(body, response.status)
  }

  const parsed = graphResponseSchema.safeParse(body)
  if (!parsed.success || !parsed.data.business_discovery) {
    throw new PublicError(502, 'GRAPH_SHAPE', 'Instagram 응답 형식이 예상과 다릅니다.')
  }

  return { discovery: parsed.data.business_discovery, appUsage }
}
