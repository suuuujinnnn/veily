import 'dotenv/config'
import { z } from 'zod'

const envSchema = z.object({
  IG_ACCESS_TOKEN: z.string().min(1, 'IG_ACCESS_TOKEN 이 비어 있습니다. server/.env.example 을 참고하세요.'),
  IG_USER_ID: z.string().regex(/^\d+$/, 'IG_USER_ID 는 숫자만으로 이뤄진 Instagram 프로 계정 ID 여야 합니다.'),
  GRAPH_API_VERSION: z.string().default('v26.0'),
  PORT: z.coerce.number().int().positive().default(4000),
})

export type Config = Readonly<z.infer<typeof envSchema>>

/**
 * 부팅 시 한 번만 검증한다. 토큰이 없는 채로 서버가 뜨면 첫 요청에서야
 * 실패하고, 그때는 원인이 인증인지 설정인지 구분하기 어려워진다.
 */
export function loadConfig(): Config {
  const parsed = envSchema.safeParse(process.env)
  if (!parsed.success) {
    const details = parsed.error.issues.map((issue) => `  - ${issue.path.join('.')}: ${issue.message}`).join('\n')
    throw new Error(`환경변수 설정이 올바르지 않습니다.\n${details}`)
  }
  return Object.freeze(parsed.data)
}
