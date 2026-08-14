import express, { type NextFunction, type Request, type Response } from 'express'
import type { Config } from './config.js'
import { TokenStore } from './instagram/tokenStore.js'
import { findDataDir } from './references/paths.js'
import { ReferenceStore } from './references/store.js'
import { createAuthRouter } from './routes/auth.js'
import { createClassifyRouter } from './routes/classify.js'
import { createInstagramRouter } from './routes/instagram.js'
import { createReferencesRouter } from './routes/references.js'
import { PublicError, getErrorMessage } from './lib/errors.js'

export function createApp(config: Config, tokens: TokenStore = new TokenStore(config)): express.Express {
  const app = express()
  app.use(express.json())

  const dataDir = findDataDir()
  // 라벨은 부팅 때 한 번 읽어 메모리에 둔다. 검색과 분류가 같은 인스턴스를 공유해야
  // 방금 분류한 사진이 재시작 없이 보드에 뜬다.
  const references = new ReferenceStore(dataDir)

  app.get('/api/health', (_req, res) => {
    const token = tokens.status()
    res.json({
      success: true,
      data: {
        status: 'ok',
        graphVersion: config.GRAPH_API_VERSION,
        // 토큰 값은 절대 내려보내지 않는다. 상태만 노출한다.
        instagram: token.hasToken,
        tokenType: token.using,
        tokenDaysLeft: token.daysLeft,
      },
    })
  })

  app.use('/api', createAuthRouter(config, tokens))
  app.use('/api', createInstagramRouter(config, tokens))
  app.use('/api', createReferencesRouter(references, dataDir))
  app.use('/api', createClassifyRouter(config, tokens, references, dataDir))

  app.use((_req, res) => {
    res.status(404).json({ success: false, error: '요청하신 경로를 찾을 수 없습니다.' })
  })

  app.use((error: unknown, _req: Request, res: Response, _next: NextFunction) => {
    // 잘못된 JSON 본문은 서버 잘못이 아니다. 500 으로 뭉뚱그리면 원인 추적이 어려워진다.
    if (error instanceof SyntaxError && 'body' in error) {
      res.status(400).json({ success: false, code: 'INVALID_JSON', error: '요청 본문이 올바른 JSON 이 아닙니다.' })
      return
    }
    if (error instanceof PublicError) {
      // 계정 오타나 비공개 계정은 운영상 정상 흐름이라 경고로 남기지 않는다.
      res.status(error.status).json({ success: false, code: error.code, error: error.message })
      return
    }
    process.stderr.write(`[error] ${getErrorMessage(error)}\n`)
    res.status(500).json({ success: false, code: 'INTERNAL', error: '서버 오류가 발생했습니다.' })
  })

  return app
}
