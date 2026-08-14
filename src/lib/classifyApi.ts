/**
 * 인스타 사진 자동 라벨링 API 클라이언트.
 * 서버 계약은 server/src/classify/ingest.ts 의 IngestResult 와 일치해야 한다.
 */

export interface ClassifyVendor {
  account: string
  name: string
  category: string
}

export interface ClassifyStatus {
  /** ANTHROPIC_API_KEY 가 설정돼 있는지. false 면 분류 버튼을 눌러도 막힌다. */
  ready: boolean
  model: string
  labelled: number
  vendors: ClassifyVendor[]
  running: string[]
}

export interface ClassifyFailure {
  path: string
  reason: string
}

export interface ClassifiedRecord {
  path: string
  vendor: string
  category: string
  subject: string
  labels: Record<string, string[]>
  confidence: Record<string, string>
}

export interface ClassifyResult {
  account: string
  vendorName: string
  category: string
  taxonomyVersion: string
  /** 조회한 게시물 수. 캐러셀은 한 건이 여러 장이다. */
  posts: number
  candidates: number
  /** 이미 라벨이 있어 건너뛴 사진 수. */
  skipped: number
  /** 실물이 없는 브랜드 그래픽이라 버린 수. */
  rejected: number
  classified: number
  failures: ClassifyFailure[]
  added: ClassifiedRecord[]
}

export class ClassifyApiError extends Error {
  readonly code: string

  constructor(code: string, message: string) {
    super(message)
    this.name = 'ClassifyApiError'
    this.code = code
  }
}

async function readBody<T>(response: Response): Promise<T> {
  const body = (await response.json().catch(() => null)) as
    | { success: true; data: T }
    | { success: false; code?: string; error: string }
    | null

  if (!body) {
    throw new ClassifyApiError('NETWORK', '서버 응답을 읽지 못했습니다. server/ 가 떠 있는지 확인해 주세요.')
  }
  if (!body.success) {
    throw new ClassifyApiError(body.code ?? 'UNKNOWN', body.error)
  }
  return body.data
}

export async function getClassifyStatus(signal?: AbortSignal): Promise<ClassifyStatus> {
  const response = await fetch('/api/classify/status', {
    headers: { Accept: 'application/json' },
    ...(signal ? { signal } : {}),
  })
  return readBody<ClassifyStatus>(response)
}

export interface ClassifyVendorOptions {
  /** 가져올 게시물 수. */
  limit?: number
  /** 분류할 사진 수 상한. 사진 한 장이 API 호출 하나라 기본을 낮게 둔다. */
  maxImages?: number
  /** true 면 내려받기·분류 없이 대상 개수만 센다. */
  dryRun?: boolean
  signal?: AbortSignal
}

export async function classifyVendor(account: string, options: ClassifyVendorOptions = {}): Promise<ClassifyResult> {
  const { signal, ...body } = options
  const response = await fetch(`/api/vendors/${encodeURIComponent(account)}/classify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(body),
    ...(signal ? { signal } : {}),
  })
  return readBody<ClassifyResult>(response)
}
