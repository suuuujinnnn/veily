/**
 * 라벨링된 업체 사진 검색 API 클라이언트.
 * 서버 계약은 server/src/references/types.ts 와 일치해야 한다.
 */

export const ROLLUP_AXIS = '성격'

export interface ReferenceItem {
  id: string
  imageUrl: string
  vendor: string
  vendorName: string
  vendorType: string
  category: string
  subject: string
  labels: Record<string, string[]>
  confidence: Record<string, string>
  matched: string[]
}

export interface FacetValue {
  axis: string
  value: string
  count: number
}

export interface FacetGroup {
  label: string
  kind: 'axis' | 'rollup'
  collapsed: boolean
  values: FacetValue[]
}

export interface CategoryCount {
  category: string
  count: number
}

export interface ReferenceSearchResult {
  total: number
  items: ReferenceItem[]
  groups: FacetGroup[]
  categories: CategoryCount[]
}

export class ReferenceApiError extends Error {
  readonly code: string

  constructor(code: string, message: string) {
    super(message)
    this.name = 'ReferenceApiError'
    this.code = code
  }
}

export interface SearchReferencesOptions {
  category: string
  /** 축 → 선택한 값들. 같은 축은 OR, 축끼리는 AND 로 검색된다. */
  filters?: Record<string, string[]>
  q?: string
  limit?: number
  offset?: number
  signal?: AbortSignal
}

export async function searchReferences({
  category,
  filters = {},
  q = '',
  limit = 60,
  offset = 0,
  signal,
}: SearchReferencesOptions): Promise<ReferenceSearchResult> {
  const params = new URLSearchParams({ category, limit: String(limit), offset: String(offset) })
  if (q.trim()) params.set('q', q.trim())
  for (const [axis, values] of Object.entries(filters)) {
    for (const value of values) params.append('f', `${axis}:${value}`)
  }

  const response = await fetch(`/api/references/search?${params}`, {
    headers: { Accept: 'application/json' },
    ...(signal ? { signal } : {}),
  })

  const body = (await response.json().catch(() => null)) as
    | { success: true; data: ReferenceSearchResult }
    | { success: false; code?: string; error: string }
    | null

  if (!body) {
    throw new ReferenceApiError('NETWORK', '서버 응답을 읽지 못했습니다. server/ 가 떠 있는지 확인해 주세요.')
  }
  if (!body.success) {
    throw new ReferenceApiError(body.code ?? 'UNKNOWN', body.error)
  }
  return body.data
}
