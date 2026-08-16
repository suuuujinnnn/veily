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
  메이크업: [],
  스튜디오: ['화면구성', '무드', '빛컬러', '공간장면', '시간구도', '소품'],
  웨딩홀: [],
}

/** 화면에 안 나가는 축. 게이팅·보정 전용이다. */
const INTERNAL_ONLY = new Set(['프레이밍', '오버레이', '조명조건', '샷타입', '기립', '각도'])

/**
 * 헤어는 시안 찾기 카테고리로 바뀌었다. 지금 L0 로는 채울 수 없는 값이 많다.
 * 번의 종류(클래식·내추럴·가시·슬립), 펌의 종류(물결·s컬·히피), 땋기 방식,
 * 베일 위치는 판정한 적이 없어 비워 둔다. 재판정 때 채운다.
 * 억지로 로우 번을 클래식 로우번으로 넘기면 없는 사실을 만드는 셈이다.
 */
function hairTags(l0: AtomicLabels): string[] {
  const tags: string[] = []
  const 단발 = l0.길이?.[0] === '단발'

  if (단발) {
    // 단발은 별도 그룹이라 접두어를 붙인 값으로 넘긴다.
    if (l0.텍스처?.[0] === '생머리') tags.push('단발 생머리')
    if (l0.텍스처?.[0] === '웨이브') tags.push('단발 웨이브')
    if (l0.반묶음?.[0] === '반묶음') tags.push('단발 반묶음')
    return [...new Set(tags)]
  }

  const position = l0.묶음위치?.[0]
  const shape = l0.묶음형태?.[0]
  if (position === '하이' && shape === '번') tags.push('하이 번')
  if (shape === '포니테일' && (position === '로우' || position === '하이')) tags.push(`${position} 포니테일`)
  if (l0.반묶음?.[0] === '반묶음') tags.push('반묶음')
  if (l0.반묶음?.[0] === '내림' && l0.텍스처?.[0] === '생머리') tags.push('생머리')

  return [...new Set(tags)]
}


/** L0 라벨 한 벌을 화면이 읽는 태그 배열로 바꾼다. */
/**
 * 메이크업은 피부표현과 무드컬러를 조합해 스타일 하나로 넘긴다.
 * 화면 키워드가 '깔끔+단아+청순' 처럼 합쳐진 표현이라 축을 그대로 못 넘긴다.
 * 단독룸·담당자 베이스는 사진으로 알 수 없어 L2 에서 채워야 한다.
 */
function makeupTags(l0: AtomicLabels): string[] {
  const skin = l0.피부표현?.[0]
  const mood = l0.무드컬러?.[0]

  if (mood === '과즙') return ['뽀용 과즙']
  if (mood === '강한') return ['세련·음영·펄감']
  if (mood === '음영') return skin === '물광' ? ['세련·음영·펄감'] : ['깔끔·은은한 음영']
  if (mood === '깔끔') return skin === '물광' ? ['깔끔·단아·청순'] : ['깔끔·단아·청순']
  return []
}

/**
 * 스튜디오는 화면 키워드가 L0 값과 이름이 다른 게 셋 있다.
 * 나머지는 그대로 넘어간다.
 */
const STUDIO_RENAME: Record<string, string> = {
  '인물 중심': '깔끔한 인물 중심',
  '인물+배경': '인물+배경 적당히',
  '배경 중심': '배경·컨셉 중심',
}

export function toReferenceTags(category: ReferenceCategory, l0: AtomicLabels): string[] {
  if (category === '헤어') return hairTags(l0)
  if (category === '메이크업') return makeupTags(l0)

  const axes = PASS_THROUGH[category]
  const tags = axes
    .filter((axis) => !INTERNAL_ONLY.has(axis))
    .flatMap((axis) => l0[axis] ?? [])
    .map((value) => (category === '스튜디오' ? (STUDIO_RENAME[value] ?? value) : value))

  return [...new Set(tags)]
}

/**
 * L2(업체 등록정보)에서 온 값을 같은 태그 배열에 합류시킨다.
 * 헤어의 단독룸·원장 지정처럼 사진에 없는 정보가 여기로 들어온다.
 */
export function withVendorFacts(tags: string[], facts: string[] = []): string[] {
  return [...new Set([...tags, ...facts])]
}
