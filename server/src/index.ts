import { createApp } from './app.js'
import { loadConfig } from './config.js'
import { TokenStore, type TokenStatus } from './instagram/tokenStore.js'
import { getErrorMessage } from './lib/errors.js'

/**
 * 토큰 상태를 한 줄로 알린다. .env 에 붙여넣은 단기 토큰은 부팅 때 승격되므로,
 * 여기서 찍히는 건 승격이 끝난 뒤의 실제 상태다.
 */
function reportToken(status: TokenStatus): void {
  if (!status.hasToken) {
    process.stdout.write('[warn] 인스타그램 토큰이 없어 포트폴리오는 데모 데이터로 폴백됩니다.\n')
    if (status.warning) process.stdout.write(`[token] ${status.warning}\n`)
    return
  }

  const remaining = status.neverExpires
    ? '만료 없음 — 재발급 불필요'
    : status.daysLeft === null
      ? '만료 시점 미확인'
      : `${status.daysLeft}일 남음`
  process.stdout.write(`[token] ${status.using} 토큰(${status.source}) — ${remaining}\n`)
  if (status.warning) process.stdout.write(`[token] ${status.warning}\n`)
}

function main(): void {
  const config = loadConfig()
  const tokens = new TokenStore(config)

  const app = createApp(config, tokens)
  app.listen(config.PORT, () => {
    process.stdout.write(`veily server listening on http://localhost:${config.PORT}\n`)
  })

  // 부팅 직후 한 번 정리한다. 단기 토큰이면 여기서 장기·페이지 토큰으로 승격돼 디스크에 저장되고,
  // 만료 없는 토큰이면 그 사실이 확인돼 이후 갱신 시도가 멈춘다. 실패해도 서버는 그대로 뜬다.
  void tokens
    .ensureFresh()
    .catch(() => undefined)
    .then(() => {
      reportToken(tokens.status())
    })
}

try {
  main()
} catch (error: unknown) {
  process.stderr.write(`${getErrorMessage(error)}\n`)
  process.exit(1)
}
