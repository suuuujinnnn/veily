import { Router } from 'express'
import { z } from 'zod'
import { Ingestor } from '../classify/ingest.js'
import type { Config } from '../config.js'
import type { TokenStore } from '../instagram/tokenStore.js'
import { vendorDirectory } from '../references/facets.js'
import type { ReferenceStore } from '../references/store.js'
import { PublicError } from '../lib/errors.js'

const paramsSchema = z.object({ account: z.string().min(1).max(30) })

const bodySchema = z.object({
  // business_discovery 의 media.limit 상한과 같은 값으로 막는다.
  limit: z.coerce.number().int().min(1).max(25).default(6),
  // 분류는 사진 한 장이 곧 API 호출 하나다. 실수로 수백 장이 나가지 않게 기본을 낮게 둔다.
  maxImages: z.coerce.number().int().min(1).max(60).default(12),
  dryRun: z.boolean().default(false),
})

/**
 * 인스타 게시물을 가져와 taxonomy 기준으로 자동 라벨링하는 라우트.
 *
 * 사진은 data/vendors 아래로 내려받아 저장한다. 인스타 CDN URL 은 서명이 붙어 있어
 * 며칠이면 만료되므로, 원격 URL 을 그대로 라벨에 박아두면 보드가 조용히 깨진다.
 */
export function createClassifyRouter(config: Config, tokens: TokenStore, store: ReferenceStore, dataDir: string): Router {
  const router = Router()
  const ingestor = new Ingestor(config, tokens, store, dataDir)
  /** 같은 계정에 대해 동시에 두 번 돌지 않게 막는다. 중복 분류는 곧 중복 과금이다. */
  const running = new Set<string>()

  router.get('/classify/status', (_req, res) => {
    res.json({
      success: true,
      data: {
        ready: Boolean(config.ANTHROPIC_API_KEY),
        model: config.CLASSIFY_MODEL,
        labelled: store.size,
        vendors: Object.entries(vendorDirectory).map(([account, profile]) => ({
          account,
          name: profile.name,
          category: profile.type,
        })),
        running: [...running],
      },
    })
  })

  router.post('/vendors/:account/classify', async (req, res, next) => {
    const params = paramsSchema.safeParse(req.params)
    if (!params.success) {
      next(new PublicError(400, 'INVALID_ACCOUNT', '사용자명이 올바르지 않습니다.'))
      return
    }
    const account = params.data.account.replace(/^@/, '').trim()

    const body = bodySchema.safeParse(req.body ?? {})
    if (!body.success) {
      next(new PublicError(400, 'INVALID_BODY', body.error.issues[0]?.message ?? '요청 본문이 올바르지 않습니다.'))
      return
    }

    if (running.has(account)) {
      next(new PublicError(409, 'ALREADY_RUNNING', `'${account}' 분류가 이미 돌고 있습니다.`))
      return
    }

    running.add(account)
    try {
      const result = await ingestor.run({ account, ...body.data })
      res.json({ success: true, data: result })
    } catch (error: unknown) {
      next(error)
    } finally {
      running.delete(account)
    }
  })

  return router
}
