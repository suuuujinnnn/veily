import 'dotenv/config'
import { z } from 'zod'

const envSchema = z.object({
  // 토큰이 없어도 프런트엔드가 목업 포트폴리오로 폴백할 수 있도록 선택값으로 둔다.
  // .env 를 Windows 에서 저장하면 값 끝에 CR 이 붙는다. 그대로 Graph 에 실어 보내면
  // 토큰이 멀쩡한데 인증 실패로 보인다. 읽는 즉시 잘라낸다.
  IG_ACCESS_TOKEN: z.string().trim().default(''),
  IG_USER_ID: z.string().trim().regex(/^\d*$/, 'IG_USER_ID 는 숫자만으로 이뤄진 Instagram 프로 계정 ID 여야 합니다.').default(''),
  GRAPH_API_VERSION: z.string().default('v26.0'),
  PORT: z.coerce.number().int().positive().default(4000),
  // 앱 자격증명이 있으면 서버가 토큰을 스스로 장기 토큰·페이지 토큰으로 끌어올린다.
  // 없으면 손으로 넣은 토큰을 그대로 쓰고 만료되면 다시 넣어야 한다.
  FB_APP_ID: z.string().trim().default(''),
  FB_APP_SECRET: z.string().trim().default(''),
  /** OAuth 콜백 주소를 만들 기준 주소. Meta 앱의 유효한 리디렉션 URI 와 같아야 한다. */
  PUBLIC_BASE_URL: z.string().url().default('http://localhost:4000'),
  /** 갱신한 토큰을 두는 곳. .env 는 서버가 고쳐 쓸 파일이 아니라 별도 파일에 둔다. */
  TOKEN_STORE_PATH: z.string().default('.secrets/instagram-token.json'),
  // 가져온 인스타 사진을 taxonomy 기준으로 자동 라벨링할 때 쓴다. 없으면 분류 라우트만
  // 막히고 검색·포트폴리오는 그대로 동작한다.
  ANTHROPIC_API_KEY: z.string().trim().default(''),
  CLASSIFY_MODEL: z.string().trim().default('claude-opus-5'),
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
