import { randomUUID } from 'node:crypto'
import { Router } from 'express'
import { z } from 'zod'
import type { Config } from '../config.js'
import type { TokenStore } from '../instagram/tokenStore.js'
import { PublicError } from '../lib/errors.js'

/** business_discovery 에 필요한 권한. 페이지가 비즈니스 포트폴리오 소유면 뒤의 둘도 있어야 한다. */
const SCOPES = [
  'instagram_basic',
  'instagram_manage_insights',
  'pages_show_list',
  'pages_read_engagement',
  'ads_read',
  'business_management',
].join(',')

const STATE_TTL_MS = 10 * 60 * 1000

const callbackSchema = z.object({
  code: z.string().min(1).optional(),
  state: z.string().min(1).optional(),
  error: z.string().optional(),
  error_description: z.string().optional(),
})

const manualSchema = z.object({
  token: z.string().min(20, '토큰이 너무 짧습니다.'),
})

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char] ?? char)
}

function resultPage(title: string, lines: string[]): string {
  return `<!doctype html><html lang="ko"><meta charset="utf-8"><title>${escapeHtml(title)}</title>
<body style="font-family:system-ui,-apple-system,'Segoe UI',sans-serif;max-width:520px;margin:80px auto;padding:0 20px;color:#1c2b38">
<h1 style="font-size:20px">${escapeHtml(title)}</h1>
${lines.map((line) => `<p style="font-size:13px;line-height:1.7;color:#5d6b77">${line}</p>`).join('\n')}
</body></html>`
}

/**
 * 토큰 수명 관리 라우트.
 *
 * 첫 토큰은 사람이 한 번 Facebook 에 로그인해야 나온다 — OAuth 규격이라 서버가
 * 대신 만들 수 없다. 대신 그 "한 번"을 Graph API Explorer 에서 복사해 오는 대신
 * 이 링크를 눌러 끝내게 하고, 그 뒤의 교환·갱신은 서버가 맡는다.
 */
export function createAuthRouter(config: Config, tokens: TokenStore): Router {
  const router = Router()
  // CSRF 방지용 state. 재시작하면 사라지지만 유효기간이 10분이라 문제되지 않는다.
  const pendingStates = new Map<string, number>()
  const redirectUri = `${config.PUBLIC_BASE_URL.replace(/\/$/, '')}/api/auth/instagram/callback`

  router.get('/auth/instagram/status', async (_req, res) => {
    await tokens.ensureFresh()
    res.json({ success: true, data: { ...tokens.status(), loginUrl: '/api/auth/instagram/start', redirectUri } })
  })

  router.get('/auth/instagram/start', (_req, res, next) => {
    try {
      if (!config.FB_APP_ID || !config.FB_APP_SECRET) {
        throw new PublicError(
          503,
          'APP_CREDENTIALS_MISSING',
          'server/.env 에 FB_APP_ID/FB_APP_SECRET 을 넣어야 로그인 흐름을 쓸 수 있습니다.',
        )
      }

      const now = Date.now()
      for (const [state, createdAt] of pendingStates) {
        if (now - createdAt > STATE_TTL_MS) pendingStates.delete(state)
      }
      const state = randomUUID()
      pendingStates.set(state, now)

      const dialog = new URL(`https://www.facebook.com/${config.GRAPH_API_VERSION}/dialog/oauth`)
      dialog.searchParams.set('client_id', config.FB_APP_ID)
      dialog.searchParams.set('redirect_uri', redirectUri)
      dialog.searchParams.set('response_type', 'code')
      dialog.searchParams.set('scope', SCOPES)
      dialog.searchParams.set('state', state)
      // Instagram 온보딩 채널로 열어야 페이지·인스타 연결 선택 화면이 함께 뜬다.
      dialog.searchParams.set('extras', JSON.stringify({ setup: { channel: 'IG_API_ONBOARDING' } }))

      res.redirect(dialog.toString())
    } catch (error: unknown) {
      next(error)
    }
  })

  router.get('/auth/instagram/callback', async (req, res, next) => {
    try {
      const query = callbackSchema.safeParse(req.query)
      if (!query.success) {
        throw new PublicError(400, 'INVALID_CALLBACK', '콜백 파라미터가 올바르지 않습니다.')
      }
      const { code, state, error, error_description: description } = query.data

      if (error) {
        res.status(400).send(resultPage('로그인이 취소됐습니다', [escapeHtml(description ?? error)]))
        return
      }
      if (!code || !state || !pendingStates.delete(state)) {
        throw new PublicError(400, 'INVALID_STATE', '만료됐거나 알 수 없는 로그인 요청입니다. 다시 시도해 주세요.')
      }

      const shortLived = await tokens.exchangeCode(code, redirectUri)
      const status = await tokens.adopt(shortLived, 'oauth')

      res.send(
        resultPage('토큰을 저장했습니다', [
          status.using === 'page'
            ? '<b>페이지 토큰</b>을 받았습니다. 이 토큰은 만료되지 않으므로 재발급이 필요 없습니다.'
            : `사용자 토큰을 저장했습니다. 만료: ${status.expiresAt ?? '알 수 없음'} — 만료 7일 전부터 서버가 스스로 갱신합니다.`,
          `연결된 Instagram 계정 ID: <code>${escapeHtml(status.igUserId ?? '확인 실패')}</code>`,
          '이 창은 닫아도 됩니다.',
        ]),
      )
    } catch (error: unknown) {
      next(error)
    }
  })

  /**
   * Graph API Explorer 에서 받은 토큰을 붙여넣는 경로.
   * 리디렉션 URI 를 앱에 아직 등록하지 못했을 때 쓰는 우회로다.
   */
  router.post('/auth/instagram/token', async (req, res, next) => {
    try {
      const body = manualSchema.safeParse(req.body)
      if (!body.success) {
        throw new PublicError(400, 'INVALID_TOKEN', body.error.issues[0]?.message ?? '토큰이 올바르지 않습니다.')
      }
      const status = await tokens.adopt(body.data.token, 'manual')
      res.json({ success: true, data: status })
    } catch (error: unknown) {
      next(error)
    }
  })

  return router
}
