export type ReferenceCategory = '드레스' | '헤어' | '메이크업' | '스튜디오' | '웨딩홀'

export interface ReferenceKeywordGroup {
  label: string
  keywords: string[]
}

export interface ReferenceCategoryDefinition {
  label: ReferenceCategory
  englishLabel: string
  description: string
  searchHint: string
  groups: ReferenceKeywordGroup[]
}

export const referenceCategories: ReferenceCategoryDefinition[] = [
  {
    label: '드레스',
    englishLabel: 'DRESS',
    description: '라인부터 소재와 장식까지',
    searchHint: '예: 미카도 실크 A라인, 맑은 비즈',
    groups: [
      { label: '라인·실루엣', keywords: ['A라인', '벨라인', '머메이드', '엠파이어', 'H라인', '프린세스', '모던 미니멀'] },
      { label: '트레인', keywords: ['롱 트레인', '숏 트레인'] },
      { label: '소재', keywords: ['튤', '레이스', '미카도 실크', '새틴 실크', '도비 실크', '오간자', '시폰', '타프타'] },
      { label: '디테일', keywords: ['볼드한 비즈', '맑고 은은한 비즈', '비딩'] },
    ],
  },
  {
    label: '헤어',
    englishLabel: 'HAIR',
    description: '기장과 업스타일 높이까지',
    searchHint: '예: 로우 번, 웨이브 반묶음',
    groups: [
      { label: '내추럴·다운', keywords: ['생머리', '웨이브', '단발', '반묶음'] },
      { label: '번 스타일', keywords: ['로우 번', '미들 번', '하이 번'] },
      { label: '포니테일', keywords: ['로우 포니테일', '로우 포니테일 변형', '하이 포니테일', '하이 포니테일 변형'] },
      { label: '포인트', keywords: ['양갈래', '땋은 머리'] },
    ],
  },
  {
    label: '메이크업',
    englishLabel: 'MAKEUP',
    description: '피부 표현과 컬러 무드를 함께',
    searchHint: '예: 투명한 피부, 과즙 메이크업',
    groups: [
      { label: '피부 표현', keywords: ['물광', '세미 매트', '투명', '누드'] },
      { label: '무드·컬러', keywords: ['과즙', '음영', '글램', '강한', '깔끔'] },
    ],
  },
  {
    label: '스튜디오',
    englishLabel: 'STUDIO',
    description: '구도·공간·빛을 조합해서',
    searchHint: '예: 자연광 정원, 인물 중심 클래식',
    groups: [
      { label: '화면 구성', keywords: ['인물 중심', '배경 중심', '인물+배경'] },
      { label: '무드·분위기', keywords: ['모던', '클래식', '내추럴', '따뜻한', '감성', '사랑스러운', '러블리', '드라마틱', '깔끔', '장난스러운', '일상', '단아한', '화보', '빈티지', '화려한', '도시적인', '로맨틱', '몽환적인', '청순한', '성숙한', '고급스러운', '중세'] },
      { label: '빛·컬러', keywords: ['자연광', '화이트톤', '선명한', '밝은', '고채도', '싱그러운', '초록', '흑백'] },
      { label: '공간·장면', keywords: ['심플 배경', '실내 세트', '정원', '자연', '도시', '한옥', '분수', '아치', '저택', '롯데타워', '루프탑', '온실', '도로', '흑백 씬'] },
      { label: '시간·구도', keywords: ['낮', '밤', '클로즈업', '독사진', '타이트', '전신', '계란후라이'] },
      { label: '소품', keywords: ['콘셉트 소품', '베일', '생화 부케', '컨페티', '풍선'] },
    ],
  },
  {
    label: '웨딩홀',
    englishLabel: 'WEDDING HALL',
    description: '홀 유형과 공간 조건을 한 번에',
    searchHint: '예: 밝은 채플, 높은 층고 단독홀',
    groups: [
      { label: '유형', keywords: ['일반 예식장', '컨벤션', '호텔', '하우스', '레스토랑', '한옥', '교회·성당', '기타'] },
      { label: '콘셉트', keywords: ['채플', '소규모', '야외·가든', '전통혼례'] },
      { label: '공간', keywords: ['높은 층고', '단독홀', '긴 버진로드', '통창', '실내', '야외'] },
      { label: '빛·무드', keywords: ['밝은 홀', '어두운 홀', '자연광', '인공 조명', '초록', '싱그러운'] },
    ],
  },
]

export const vendorReferenceKeywords: Record<string, Partial<Record<ReferenceCategory, string[]>>> = {
  'vp-d1': { 드레스: ['A라인', '롱 트레인', '레이스', '볼드한 비즈', '비딩'] },
  'vp-d2': { 드레스: ['벨라인', '롱 트레인', '미카도 실크', '볼드한 비즈'] },
  'vp-d3': { 드레스: ['머메이드', '레이스', '맑고 은은한 비즈', '비딩'] },
  'vp-d4': { 드레스: ['A라인', '모던 미니멀', '숏 트레인', '미카도 실크', '새틴 실크'] },
  'vp-d5': { 드레스: ['프린세스', '롱 트레인', '튤', '레이스', '맑고 은은한 비즈'] },
  'vp-m1': {
    헤어: ['웨이브', '반묶음', '로우 번', '로우 포니테일 변형'],
    메이크업: ['물광', '투명', '과즙', '깔끔'],
  },
  'vp-m2': {
    헤어: ['생머리', '하이 번', '하이 포니테일'],
    메이크업: ['물광', '투명', '과즙', '글램'],
  },
  'vp-m3': {
    헤어: ['웨이브', '반묶음', '미들 번'],
    메이크업: ['세미 매트', '누드', '음영', '깔끔'],
  },
  'vp-m4': {
    헤어: ['단발', '로우 번', '땋은 머리'],
    메이크업: ['물광', '누드', '과즙', '강한'],
  },
  'vp-m5': {
    헤어: ['웨이브', '로우 번', '로우 포니테일'],
    메이크업: ['투명', '누드', '과즙', '깔끔'],
  },
  'vp-s1': { 스튜디오: ['인물+배경', '화려한', '클래식', '비비드', '실내 세트', '아치', '전신', '콘셉트 소품'] },
  'vp-s2': { 스튜디오: ['인물 중심', '깔끔', '내추럴', '자연광', '화이트톤', '정원', '낮', '클로즈업', '생화 부케'] },
  'vp-s3': { 스튜디오: ['배경 중심', '빈티지', '감성', '따뜻한', '저택', '도로', '밤', '흑백'] },
  'vp-s4': { 스튜디오: ['인물 중심', '모던', '깔끔', '화이트톤', '심플 배경', '실내 세트', '타이트', '베일'] },
  'vp-s5': { 스튜디오: ['인물+배경', '내추럴', '러블리', '자연광', '초록', '정원', '온실', '낮', '전신', '컨페티'] },
}

export function getReferenceCategory(label: ReferenceCategory) {
  return referenceCategories.find((category) => category.label === label) ?? referenceCategories[0]
}
