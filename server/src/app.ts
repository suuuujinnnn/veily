import express, { type NextFunction, type Request, type Response } from 'express'
import type { Config } from './config.js'
import { createInstagramRouter } from './routes/instagram.js'
import { PublicError, getErrorMessage } from './lib/errors.js'

export function createApp(config: Config): express.Express {
  const app = express()
  app.use(express.json())

  app.get('/api/health', (_req, res) => {
    res.json({ success: true, data: { status: 'ok', graphVersion: config.GRAPH_API_VERSION } })
  })

  app.use('/api', createInstagramRouter(config))

  app.use((_req, res) => {
    res.status(404).json({ success: false, error: '요청하신 경로를 찾을 수 없습니다.' })
  })

  app.use((error: unknown, _req: Request, res: Response, _next: NextFunction) => {
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
