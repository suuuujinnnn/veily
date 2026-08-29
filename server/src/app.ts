import express, { type NextFunction, type Request, type Response } from 'express'
import type { Config } from './config.js'
import { TokenStore } from './instagram/tokenStore.js'
import { PublicError, getErrorMessage } from './lib/errors.js'
import { createAuthRouter } from './routes/auth.js'
import { createInstagramRouter } from './routes/instagram.js'
import { createSurveyRouter } from './routes/surveys.js'

/**
 * 현재 화면과 데이터 구조는 프런트엔드 목업을 기준으로 유지한다.
 * 이 서버는 업체 상세의 Instagram 포트폴리오 연동만 담당하며,
 * 기능 브랜치의 별도 레퍼런스 보드 UI/API는 의도적으로 연결하지 않는다.
 */
export function createApp(config: Config, tokens: TokenStore = new TokenStore(config)): express.Express {
  const app = express()
  app.use(express.json())

  app.get('/api/health', (_req, res) => {
    const token = tokens.status()
    res.json({
      success: true,
      data: {
        status: 'ok',
        graphVersion: config.GRAPH_API_VERSION,
        instagram: token.hasToken,
        tokenType: token.using,
        tokenDaysLeft: token.daysLeft,
      },
    })
  })

  app.use('/api', createAuthRouter(config, tokens))
  app.use('/api', createInstagramRouter(config, tokens))
  app.use('/api', createSurveyRouter())

  app.use((_req, res) => {
    res.status(404).json({ success: false, error: '요청하신 경로를 찾을 수 없습니다.' })
  })

  app.use((error: unknown, _req: Request, res: Response, _next: NextFunction) => {
    if (error instanceof SyntaxError && 'body' in error) {
      res.status(400).json({ success: false, code: 'INVALID_JSON', error: '요청 본문이 올바른 JSON이 아닙니다.' })
      return
    }
    if (error instanceof PublicError) {
      res.status(error.status).json({ success: false, code: error.code, error: error.message })
      return
    }
    process.stderr.write(`[error] ${getErrorMessage(error)}\n`)
    res.status(500).json({ success: false, code: 'INTERNAL', error: '서버 오류가 발생했습니다.' })
  })

  return app
}
