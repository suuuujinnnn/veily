import { chmodSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname } from 'node:path'
import { z } from 'zod'
import type { Config } from '../config.js'
import { PublicError } from '../lib/errors.js'

const GRAPH_HOST = 'https://graph.facebook.com'
/** 만료 7일 전부터 갱신을 시도한다. 문서의 D-7 알림 규칙과 같은 기준이다. */
const RENEW_WINDOW_MS = 7 * 24 * 60 * 60 * 1000
/**
 * 갱신 재시도 간격. 만료 시점을 모르는 토큰은 갱신 조건을 영원히 만족하므로,
 * 이 간격이 없으면 요청 하나마다 Graph 로 교환 요청이 한 번씩 나간다.
 */
const REFRESH_COOLDOWN_MS = 5 * 60 * 1000

const storedTokenSchema = z.object({
  userToken: z.string().min(1),
  /** epoch ms. null 은 "만료 시점을 모름"이다. "만료 없음"은 neverExpires 로 따로 표시한다. */
  userTokenExpiresAt: z.number().nullable().default(null),
  /**
   * 만료가 아예 없는 토큰인지. 시스템 사용자 토큰과, 장기 사용자 토큰에서 파생된 페이지 토큰이 여기 해당한다.
   * Graph 는 이런 토큰의 debug_token 에 expires_at: 0 을 준다.
   *
   * 예전에는 이걸 userTokenExpiresAt=null 로만 표현했는데, null 이 "모름"과 겹쳐서
   * 만료 없는 토큰을 매번 재교환하고 "만료 시점 미확인" 경고까지 띄웠다. 그래서 필드를 나눴다.
   */
  neverExpires: z.boolean().default(false),
  pageToken: z.string().optional(),
  igUserId: z.string().optional(),
  scopes: z.array(z.string()).default([]),
  updatedAt: z.string(),
  source: z.enum(['env', 'oauth', 'manual']).default('manual'),
})

export type StoredToken = z.infer<typeof storedTokenSchema>

export interface TokenStatus {
  hasToken: boolean
  /** 실제 Graph 호출에 쓰는 토큰의 종류. */
  using: 'page' | 'user' | 'none'
  source: StoredToken['source'] | null
  /** true 면 재발급 자체가 필요 없다. expiresAt·daysLeft 는 null 이 된다. */
  neverExpires: boolean
  expiresAt: string | null
  daysLeft: number | null
  igUserId: string | null
  scopes: string[]
  canRefresh: boolean
  warning: string | null
}

/** debug_token 이 알려주는 사실들. */
interface TokenFacts {
  neverExpires: boolean
  expiresAt: number | null
  scopes: string[]
  type: string | null
  isValid: boolean
}

const exchangeSchema = z.object({
  access_token: z.string(),
  token_type: z.string().optional(),
  expires_in: z.number().optional(),
})

const debugTokenSchema = z.object({
  data: z.object({
    is_valid: z.boolean().optional(),
    expires_at: z.number().optional(),
    data_access_expires_at: z.number().optional(),
    scopes: z.array(z.string()).optional(),
    type: z.string().optional(),
  }),
})

const accountsSchema = z.object({
  data: z.array(
    z.object({
      id: z.string(),
      name: z.string().optional(),
      access_token: z.string().optional(),
      instagram_business_account: z.object({ id: z.string() }).optional(),
    }),
  ),
})

async function graphGet<T>(schema: z.ZodType<T>, url: URL, context: string): Promise<T> {
  const response = await fetch(url, { headers: { Accept: 'application/json' } })
  const body: unknown = await response.json().catch(() => null)
  if (!response.ok) {
    const message = extractGraphMessage(body)
    throw new PublicError(502, 'TOKEN_EXCHANGE_FAILED', `${context} 실패: ${message}`)
  }
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    throw new PublicError(502, 'TOKEN_EXCHANGE_SHAPE', `${context} 응답 형식이 예상과 다릅니다.`)
  }
  return parsed.data
}

function extractGraphMessage(body: unknown): string {
  if (typeof body === 'object' && body !== null && 'error' in body) {
    const error = (body as { error?: { message?: string } }).error
    if (error?.message) return error.message
  }
  return '알 수 없는 오류'
}

/**
 * 액세스 토큰의 수명을 관리한다.
 *
 * 첫 토큰만 사람이 한 번 로그인해서 넘겨주면(OAuth 콜백 또는 붙여넣기), 그 뒤로는
 * 서버가 알아서 산다:
 *   단기(1~2시간) → fb_exchange_token → 장기(60일) → /me/accounts → 페이지 토큰(만료 없음)
 *
 * 페이지 토큰은 장기 사용자 토큰에서 파생된 것이면 만료되지 않으므로, 이게 잡히면
 * 갱신 자체가 필요 없어진다. 페이지 토큰을 못 얻는 경우에만 60일 토큰을 D-7 에 재교환한다.
 */
export class TokenStore {
  private token: StoredToken | null = null
  /** 마지막으로 갱신을 시도한 시각. 실패한 갱신을 매 요청마다 되풀이하지 않기 위한 것이다. */
  private lastRefreshAttempt = 0

  constructor(private readonly config: Config) {
    this.token = this.readFromDisk() ?? this.readFromEnv()
  }

  get canRefresh(): boolean {
    return Boolean(this.config.FB_APP_ID && this.config.FB_APP_SECRET)
  }

  /** Graph 호출에 쓸 토큰. 페이지 토큰이 있으면 그쪽이 우선이다(만료 없음). */
  getAccessToken(): string | null {
    if (!this.token) return null
    return this.token.pageToken ?? this.token.userToken
  }

  getIgUserId(): string | null {
    return this.token?.igUserId ?? (this.config.IG_USER_ID || null)
  }

  status(now = Date.now()): TokenStatus {
    const token = this.token
    if (!token) {
      return {
        hasToken: false,
        using: 'none',
        source: null,
        neverExpires: false,
        expiresAt: null,
        daysLeft: null,
        igUserId: this.config.IG_USER_ID || null,
        scopes: [],
        canRefresh: this.canRefresh,
        warning: this.canRefresh
          ? '토큰이 없습니다. /api/auth/instagram/start 로 한 번 로그인하면 그 뒤로는 서버가 갱신합니다.'
          : '토큰이 없고 FB_APP_ID/FB_APP_SECRET 도 없어 자동 갱신을 할 수 없습니다.',
      }
    }

    // 페이지 토큰은 장기 사용자 토큰에서 파생된 것이면 만료가 없다.
    const neverExpires = token.neverExpires || Boolean(token.pageToken)
    const expiresAt = neverExpires ? null : token.userTokenExpiresAt
    const daysLeft = expiresAt === null ? null : Math.floor((expiresAt - now) / (24 * 60 * 60 * 1000))
    return {
      hasToken: true,
      using: token.pageToken ? 'page' : 'user',
      source: token.source,
      neverExpires,
      expiresAt: expiresAt === null ? null : new Date(expiresAt).toISOString(),
      daysLeft,
      igUserId: this.getIgUserId(),
      scopes: token.scopes,
      canRefresh: this.canRefresh,
      warning: buildWarning(neverExpires, daysLeft, this.canRefresh),
    }
  }

  /**
   * 만료가 가까우면 조용히 재교환한다. 네트워크 호출은 갱신이 필요할 때만 일어난다.
   * 갱신에 실패해도 예외를 올리지 않는다 — 남은 유효기간 동안은 기존 토큰이 여전히 쓸모 있다.
   */
  async ensureFresh(now = Date.now()): Promise<void> {
    const token = this.token
    if (!token || !this.canRefresh) return
    // 만료가 없는 토큰은 갱신할 것이 없다. 여기서 빠져나가지 못하면 매 호출마다 재교환이 나간다.
    if (token.neverExpires || token.pageToken) return
    if (token.userTokenExpiresAt !== null && token.userTokenExpiresAt - now > RENEW_WINDOW_MS) return
    if (now - this.lastRefreshAttempt < REFRESH_COOLDOWN_MS) return
    this.lastRefreshAttempt = now

    try {
      await this.adopt(token.userToken, token.source)
    } catch (error: unknown) {
      process.stderr.write(`[token] 자동 갱신 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}\n`)
    }
  }

  /**
   * Graph 가 TOKEN_INVALID 를 돌려줬을 때 한 번 시도하는 복구.
   *
   * 페이지 토큰만 무효화된 경우(권한 재설정 등)는 사용자 토큰으로 다시 받아오면 살아난다.
   * 사용자 토큰 자체가 만료됐으면 여기서도 실패한다 — 만료된 토큰은 교환이 안 되고,
   * 그때는 사람이 한 번 다시 로그인하는 수밖에 없다.
   */
  async recoverFromInvalidToken(now = Date.now()): Promise<boolean> {
    const token = this.token
    if (!token || !this.canRefresh) return false
    // 토큰이 죽어 있으면 들어오는 요청마다 교환을 시도하게 된다. ensureFresh 와 같은 시계를 쓰므로,
    // 방금 갱신을 시도했다가 실패한 직후라면 같은 요청을 한 번 더 보내지 않는다.
    if (now - this.lastRefreshAttempt < REFRESH_COOLDOWN_MS) return false
    this.lastRefreshAttempt = now
    try {
      await this.adopt(token.userToken, token.source)
      return true
    } catch {
      return false
    }
  }

  /**
   * 사람이 한 번 건네준 토큰(단기든 장기든)을 받아 장기 토큰과 페이지 토큰까지 끌어올린 뒤 저장한다.
   * 이 메서드 하나가 OAuth 콜백과 수동 붙여넣기 양쪽의 종착점이다.
   */
  async adopt(rawToken: string, source: StoredToken['source']): Promise<TokenStatus> {
    const trimmed = rawToken.trim()
    if (!trimmed) {
      throw new PublicError(400, 'TOKEN_EMPTY', '토큰이 비어 있습니다.')
    }

    // 앱 자격증명이 없으면 교환 없이 그대로 쓰게 되므로, 최소한 살아 있는 토큰인지는 확인한다.
    // 죽은 토큰을 저장해두면 나중에 "저장은 됐는데 왜 안 되지"로 원인을 헷갈리게 만든다.
    if (!this.canRefresh) await this.assertUsable(trimmed)

    // 넘어온 토큰이 이미 만료 없는 것(시스템 사용자 토큰 등)이면 교환하지 않는다.
    // fb_exchange_token 을 태워도 얻을 게 없고, set_token_expires_in_60_days 규격상
    // 되레 60일짜리로 깎일 여지만 생긴다.
    const incoming = this.canRefresh ? await this.inspect(trimmed) : null
    const keepAsIs = !this.canRefresh || incoming?.neverExpires === true

    const longLived = keepAsIs ? { token: trimmed, expiresAt: null } : await this.exchangeForLongLived(trimmed)
    const inspected = keepAsIs ? incoming : await this.inspect(longLived.token)
    const page = await this.findPageToken(longLived.token)

    const next: StoredToken = {
      userToken: longLived.token,
      userTokenExpiresAt: inspected?.expiresAt ?? longLived.expiresAt,
      neverExpires: inspected?.neverExpires ?? false,
      ...(page?.pageToken ? { pageToken: page.pageToken } : {}),
      ...(page?.igUserId ? { igUserId: page.igUserId } : {}),
      scopes: inspected?.scopes ?? [],
      updatedAt: new Date().toISOString(),
      source,
    }
    this.token = next
    this.writeToDisk(next)
    return this.status()
  }

  /** 토큰이 실제로 Graph 를 부를 수 있는 상태인지 확인한다. */
  private async assertUsable(token: string): Promise<void> {
    const url = new URL(`${GRAPH_HOST}/${this.config.GRAPH_API_VERSION}/me`)
    url.searchParams.set('fields', 'id')
    url.searchParams.set('access_token', token)

    const response = await fetch(url, { headers: { Accept: 'application/json' } })
    if (response.ok) return
    const body: unknown = await response.json().catch(() => null)
    throw new PublicError(400, 'TOKEN_REJECTED', `토큰이 유효하지 않아 저장하지 않았습니다: ${extractGraphMessage(body)}`)
  }

  /** 단기 → 장기(60일) 교환. 이미 장기 토큰이어도 호출은 성공하고 만료가 다시 늘어난다. */
  private async exchangeForLongLived(token: string): Promise<{ token: string; expiresAt: number | null }> {
    const url = new URL(`${GRAPH_HOST}/${this.config.GRAPH_API_VERSION}/oauth/access_token`)
    url.searchParams.set('grant_type', 'fb_exchange_token')
    url.searchParams.set('client_id', this.config.FB_APP_ID)
    url.searchParams.set('client_secret', this.config.FB_APP_SECRET)
    url.searchParams.set('fb_exchange_token', token)

    const result = await graphGet(exchangeSchema, url, '장기 토큰 교환')
    return {
      token: result.access_token,
      expiresAt: result.expires_in ? Date.now() + result.expires_in * 1000 : null,
    }
  }

  /** OAuth 콜백의 code 를 토큰으로 바꾼다. */
  async exchangeCode(code: string, redirectUri: string): Promise<string> {
    if (!this.canRefresh) {
      throw new PublicError(503, 'APP_CREDENTIALS_MISSING', 'FB_APP_ID/FB_APP_SECRET 이 없어 코드를 토큰으로 바꿀 수 없습니다.')
    }
    const url = new URL(`${GRAPH_HOST}/${this.config.GRAPH_API_VERSION}/oauth/access_token`)
    url.searchParams.set('client_id', this.config.FB_APP_ID)
    url.searchParams.set('client_secret', this.config.FB_APP_SECRET)
    url.searchParams.set('redirect_uri', redirectUri)
    url.searchParams.set('code', code)

    const result = await graphGet(exchangeSchema, url, '인증 코드 교환')
    return result.access_token
  }

  private async inspect(token: string): Promise<TokenFacts | null> {
    const url = new URL(`${GRAPH_HOST}/${this.config.GRAPH_API_VERSION}/debug_token`)
    url.searchParams.set('input_token', token)
    url.searchParams.set('access_token', `${this.config.FB_APP_ID}|${this.config.FB_APP_SECRET}`)

    try {
      const result = await graphGet(debugTokenSchema, url, '토큰 정보 조회')
      // expires_at 은 0 과 부재의 뜻이 다르다. 0 은 "만료 없음", 없는 건 "모름"이다.
      // 둘을 null 하나로 뭉개면 만료 없는 토큰을 만료 임박으로 오해한다.
      const raw = result.data.expires_at
      const neverExpires = raw === 0 || result.data.type === 'SYSTEM_USER'
      return {
        neverExpires,
        expiresAt: neverExpires || !raw ? null : raw * 1000,
        scopes: result.data.scopes ?? [],
        type: result.data.type ?? null,
        isValid: result.data.is_valid !== false,
      }
    } catch (error: unknown) {
      process.stderr.write(`[token] debug_token 조회 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}\n`)
      return null
    }
  }

  /**
   * 페이지 토큰과 ig-user-id 를 찾는다. 장기 사용자 토큰에서 파생된 페이지 토큰은
   * 만료되지 않으므로, 여기까지 오면 갱신 걱정이 사라진다.
   */
  private async findPageToken(userToken: string): Promise<{ pageToken?: string; igUserId?: string } | null> {
    const url = new URL(`${GRAPH_HOST}/${this.config.GRAPH_API_VERSION}/me/accounts`)
    url.searchParams.set('fields', 'name,access_token,instagram_business_account')
    url.searchParams.set('access_token', userToken)

    try {
      const result = await graphGet(accountsSchema, url, '연결된 페이지 조회')
      const configured = this.config.IG_USER_ID
      const page =
        result.data.find((entry) => configured && entry.instagram_business_account?.id === configured) ??
        result.data.find((entry) => entry.instagram_business_account?.id)
      if (!page) {
        // 권한 6개 중 ads_read/business_management 가 빠지면 여기가 빈 배열로 온다.
        process.stderr.write('[token] me/accounts 에 Instagram 연결 페이지가 없습니다. 권한 범위를 확인하세요.\n')
        return null
      }
      return {
        ...(page.access_token ? { pageToken: page.access_token } : {}),
        ...(page.instagram_business_account?.id ? { igUserId: page.instagram_business_account.id } : {}),
      }
    } catch (error: unknown) {
      process.stderr.write(`[token] 페이지 토큰 조회 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}\n`)
      return null
    }
  }

  private readFromEnv(): StoredToken | null {
    if (!this.config.IG_ACCESS_TOKEN) return null
    return {
      userToken: this.config.IG_ACCESS_TOKEN,
      // .env 토큰의 만료는 붙여넣은 시점에는 알 수 없다. 부팅 직후 debug_token 으로 확인해
      // 만료 없는 토큰이면 neverExpires 가 켜지고, 단기 토큰이면 장기·페이지 토큰으로 승격된다.
      userTokenExpiresAt: null,
      neverExpires: false,
      scopes: [],
      updatedAt: new Date().toISOString(),
      source: 'env',
      ...(this.config.IG_USER_ID ? { igUserId: this.config.IG_USER_ID } : {}),
    }
  }

  private readFromDisk(): StoredToken | null {
    const path = this.config.TOKEN_STORE_PATH
    if (!existsSync(path)) return null
    try {
      const parsed = storedTokenSchema.safeParse(JSON.parse(readFileSync(path, 'utf8')))
      if (!parsed.success) {
        process.stderr.write(`[token] ${path} 형식이 올바르지 않아 무시합니다.\n`)
        return null
      }
      return parsed.data
    } catch (error: unknown) {
      process.stderr.write(`[token] ${path} 를 읽지 못했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}\n`)
      return null
    }
  }

  private writeToDisk(token: StoredToken): void {
    const path = this.config.TOKEN_STORE_PATH
    try {
      mkdirSync(dirname(path), { recursive: true })
      writeFileSync(path, `${JSON.stringify(token, null, 2)}\n`, { encoding: 'utf8', mode: 0o600 })
      chmodSync(path, 0o600)
    } catch (error: unknown) {
      process.stderr.write(`[token] 토큰을 저장하지 못했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}\n`)
    }
  }
}

function buildWarning(neverExpires: boolean, daysLeft: number | null, canRefresh: boolean): string | null {
  if (neverExpires) return null
  if (!canRefresh) return 'FB_APP_ID/FB_APP_SECRET 이 없어 만료되면 손으로 다시 넣어야 합니다.'
  if (daysLeft === null) {
    return '만료 시점을 모르는 토큰입니다. 만료가 없는 시스템 사용자 토큰을 POST /api/auth/instagram/token 으로 넣으면 재발급이 사라집니다.'
  }
  if (daysLeft <= 7) return `토큰이 ${daysLeft}일 뒤 만료됩니다. 다음 호출에서 자동 갱신을 시도합니다.`
  return null
}
