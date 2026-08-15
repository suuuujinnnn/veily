import type { ReferenceCategory } from './referenceKeywordData'

/**
 * L0(사진에서 판정한 원자 라벨) → L1(UI 키워드) 변환.
 *
 * 화면은 `WeddingReference.tags` 라는 평평한 문자열 배열만 읽는다. 이 파일이
 * 그 배열을 만든다. UI가 또 개편되어도 여기만 고치면 되고, 사진 1,000장을
 * 다시 인식하는 일은 생기지 않는다. 이번에 라벨링을 처음부터 다시 하게 된
 * 이유가 정확히 그 다시 인식하는 일이었다.
 *
 * 규칙은 data/taxonomy.v3.json 과 짝을 이룬다.
 */

/** 사진 한 장의 L0 라벨. 축 이름 → 값 목록. 판정 못 한 축은 키 자체가 없다. */
export type AtomicLabels = Record<string, string[]>

export interface LabelRecord {
  path: string
  vendor: string
  vendorName: string
  category: ReferenceCategory
  postId: string
  childIndex: number | null
  usable: boolean
  subject: string
  l0: AtomicLabels
  confidence?: Record<string, '확실' | '추정'>
  abstained?: string[]
}

/** 값을 그대로 L1 키워드로 넘기는 축들. 대부분이 여기 해당한다. */
const PASS_THROUGH: Record<ReferenceCategory, string[]> = {
  드레스: ['넥라인', '소매', '소재', '장식', '스커트라인', '특별디자인', '색상'],
  헤어: [],
  메이크업: ['피부표현', '무드컬러'],
  스튜디오: ['화면구성', '무드', '빛컬러', '공간장면', '시간구도', '소품'],
  웨딩홀: [],
}

/** 화면에 안 나가는 축. 게이팅·보정 전용이다. */
const INTERNAL_ONLY = new Set(['프레이밍', '오버레이', '조명조건', '샷타입', '기립', '각도'])

const 묶음위치 = { 로우: '로우', 미들: '미들', 하이: '하이' } as const
const 묶음형태 = { 번: '번', 포니테일: '포니테일' } as const

/**
 * 헤어만 조합 규칙이 필요하다. UI 키워드가 '로우 번'처럼 위치와 형태를 붙여 쓰는데
 * L0는 두 축으로 나눠 판정하기 때문이다. 둘 중 하나라도 비면 키워드를 만들지 않는다.
 * 반쪽짜리 추정으로 '하이 번'을 붙이면 검색이 조용히 틀린다.
 */
function hairTags(l0: AtomicLabels): string[] {
  const tags: string[] = []
  const position = l0.묶음위치?.[0]
  const shape = l0.묶음형태?.[0]

  if (shape === '땋음') tags.push('땋은 머리')
  else if (position && shape && position in 묶음위치 && shape in 묶음형태) {
    // 로우/미들/하이 번은 셋 다 있지만 포니테일은 로우·하이만 UI에 있다.
    const candidate = `${position} ${shape}`
    const 업스타일 = ['로우 번', '미들 번', '하이 번', '로우 포니테일', '하이 포니테일']
    if (업스타일.includes(candidate)) tags.push(candidate)
  }

  if (l0.반묶음?.[0] === '반묶음') tags.push('반묶음')
  if (l0.길이?.[0] === '단발') tags.push('단발')
  if (l0.텍스처?.[0]) tags.push(l0.텍스처[0])

  return tags
}

/** L0 라벨 한 벌을 화면이 읽는 태그 배열로 바꾼다. */
export function toReferenceTags(category: ReferenceCategory, l0: AtomicLabels): string[] {
  if (category === '헤어') return [...new Set(hairTags(l0))]

  const axes = PASS_THROUGH[category]
  const tags = axes
    .filter((axis) => !INTERNAL_ONLY.has(axis))
    .flatMap((axis) => l0[axis] ?? [])

  return [...new Set(tags)]
}

/**
 * L2(업체 등록정보)에서 온 값을 같은 태그 배열에 합류시킨다.
 * 헤어의 단독룸·원장 지정처럼 사진에 없는 정보가 여기로 들어온다.
 */
export function withVendorFacts(tags: string[], facts: string[] = []): string[] {
  return [...new Set([...tags, ...facts])]
}
