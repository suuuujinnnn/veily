import { z } from 'zod'

/**
 * data/labels.jsonl 한 줄. 라벨링 파이프라인이 축을 추가해도 서버가 죽지 않도록
 * labels/confidence 는 열린 레코드로 받는다.
 */
export const labelRecordSchema = z.object({
  path: z.string().min(1),
  vendor: z.string().min(1),
  category: z.string().min(1),
  subject: z.string().default(''),
  labels: z.record(z.string(), z.array(z.string())).default({}),
  confidence: z.record(z.string(), z.string()).default({}),
})

export type LabelRecord = z.infer<typeof labelRecordSchema>

/** 화면 계약 — src/lib/referenceApi.ts 의 타입과 일치해야 한다. */
export interface ReferenceItem {
  /** data/vendors 기준 상대 경로. 이미지 URL 과 선택 상태의 키로 쓴다. */
  id: string
  imageUrl: string
  vendor: string
  vendorName: string
  vendorType: string
  category: string
  subject: string
  labels: Record<string, string[]>
  confidence: Record<string, string>
  /** 지금 선택한 조건 중 이 사진이 실제로 만족한 값. 카드에서 강조 표시한다. */
  matched: string[]
}

export interface FacetValue {
  axis: string
  value: string
  count: number
}

export interface FacetGroup {
  label: string
  /** rollup 그룹의 값은 taxonomy 축이 아니라 여러 축을 묶은 파생 조건이다. */
  kind: 'axis' | 'rollup'
  /** 접어둘 그룹. 인터뷰에서 "과세분화" 지적을 받은 축을 여기로 내린다. */
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
