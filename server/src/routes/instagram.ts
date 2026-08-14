import { Router } from 'express'
import { z } from 'zod'
import type { Config } from '../config.js'
import { fetchBusinessDiscovery } from '../instagram/graphClient.js'
import type { TokenStore } from '../instagram/tokenStore.js'
import { toPortfolio } from '../instagram/mapper.js'
import type { InstagramPortfolio } from '../instagram/types.js'
import { PublicError } from '../lib/errors.js'
import { TtlCache } from '../lib/cache.js'

const CACHE_TTL_MS = 10 * 60 * 1000

const querySchema = z.object({
  // media.limit 의 상한이 문서에 없어 실측 전까지 보수적으로 25 로 막는다.
  limit: z.coerce.number().int().min(1).max(25).default(24),
  after: z.string().max(512).optional(),
  refresh: z.enum(['0', '1']).optional(),
})

const paramsSchema = z.object({
  account: z.string().min(1).max(30),
})

export function createInstagramRouter(config: Config, tokens: TokenStore): Router {
  const router = Router()
  const cache = new TtlCache<InstagramPortfolio>(CACHE_TTL_MS)

  /** 만료가 가까우면 먼저 갱신하고, 그래도 무효면 한 번만 복구를 시도한 뒤 다시 부른다. */
  async function fetchWithTokenRecovery(params: { account: string; limit: number; after?: string }) {
    await tokens.ensureFresh()
    const credentials = () => {
      const token = tokens.getAccessToken()
      const igUserId = tokens.getIgUserId()
      if (!token || !igUserId) {
        throw new PublicError(
          503,
          'TOKEN_MISSING',
          '인스타그램 토큰이 없습니다. /api/auth/instagram/start 로 한 번 로그인해 주세요.',
        )
      }
      return { token, igUserId }
    }

    try {
      return await fetchBusinessDiscovery(config, credentials(), params)
    } catch (error: unknown) {
      if (!(error instanceof PublicError) || error.code !== 'TOKEN_INVALID') throw error
      if (!(await tokens.recoverFromInvalidToken())) {
        throw new PublicError(
          401,
          'TOKEN_INVALID',
          '토큰이 만료돼 자동 갱신에 실패했습니다. /api/auth/instagram/start 로 다시 로그인해 주세요.',
        )
      }
      return await fetchBusinessDiscovery(config, credentials(), params)
    }
  }

  router.get('/vendors/:account/instagram', async (req, res, next) => {
    try {
      const params = paramsSchema.safeParse(req.params)
      if (!params.success) {
        throw new PublicError(400, 'INVALID_ACCOUNT', '사용자명이 올바르지 않습니다.')
      }
      const query = querySchema.safeParse(req.query)
      if (!query.success) {
        throw new PublicError(400, 'INVALID_QUERY', '요청 파라미터가 올바르지 않습니다.')
      }

      const account = params.data.account.replace(/^@/, '').trim()
      const { limit, after, refresh } = query.data
      const cacheKey = `${account}:${limit}:${after ?? ''}`
      const now = Date.now()

      if (refresh === '1') {
        cache.delete(cacheKey)
      } else {
        const cached = cache.get(cacheKey, now)
        if (cached) {
          res.json({ success: true, data: cached, cached: true })
          return
        }
      }

      const { discovery, appUsage } = await fetchWithTokenRecovery({
        account,
        limit,
        ...(after ? { after } : {}),
      })
      const portfolio = toPortfolio(discovery, account, new Date(now).toISOString())
      cache.set(cacheKey, portfolio, now)

      if (appUsage?.callCount !== undefined && appUsage.callCount >= 80) {
        res.setHeader('X-Graph-App-Usage', String(appUsage.callCount))
      }
      res.json({ success: true, data: portfolio, cached: false })
    } catch (error: unknown) {
      next(error)
    }
  })

  return router
}
