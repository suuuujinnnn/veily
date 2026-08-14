/**
 * 검색 화면의 조건 묶음 정의.
 *
 * taxonomy.json 의 축을 그대로 나열하면 플래너가 쓰는 말과 어긋난다. 인터뷰에서
 * 요청받은 순서("소재 → 장식 → 상체라인 → 스커트라인 → 기타 → 색상")로 축을
 * 다시 묶고, 과세분화 지적을 받은 축(라인 5종 등)은 collapsed 로 내려둔다.
 */
export interface GroupDefinition {
  label: string
  axes: string[]
  collapsed?: boolean
}

/**
 * 여러 축을 합친 파생 조건. 인터뷰의 "실크 중심인가, 비즈 중심인가,
 * 강한 비즈인가 맑은 비즈인가"가 그대로 여기에 해당한다.
 */
export interface RollupDefinition {
  label: string
  /** 축 → 그 축에서 하나라도 걸리면 참인 값 목록. 여러 축이면 OR 로 본다. */
  any: Record<string, string[]>
}

export interface CategoryFacets {
  groups: GroupDefinition[]
  rollupLabel?: string
  rollups?: RollupDefinition[]
}

export const ROLLUP_AXIS = '성격'

export const categoryFacets: Record<string, CategoryFacets> = {
  드레스: {
    rollupLabel: '소재 성격',
    rollups: [
      { label: '실크 중심', any: { 소재: ['미카도실크', '새틴실크', '타프타'] } },
      { label: '레이스 중심', any: { 소재: ['레이스'] } },
      { label: '비침 소재', any: { 소재: ['튤', '오간자', '시폰'] } },
      { label: '강한 비즈', any: { 장식: ['굵은비즈'] } },
      { label: '맑은 비즈', any: { 장식: ['잔잔비즈·글리터'] } },
      { label: '장식 없는', any: { 장식: [] } },
    ],
    groups: [
      { label: '소재', axes: ['소재'] },
      { label: '장식', axes: ['장식'] },
      { label: '상체 라인', axes: ['넥라인', '소매'] },
      { label: '스커트 라인', axes: ['라인', '트레인'], collapsed: true },
      { label: '기타 디테일', axes: ['디테일', '오버레이'] },
      { label: '색상 (촬영·2부)', axes: ['색상'] },
      { label: '사진 종류', axes: ['프레이밍', '컷성격'], collapsed: true },
    ],
  },
  '헤어&메이크업': {
    groups: [
      { label: '메이크업', axes: ['메이크업색감', '피부'] },
      { label: '헤어 형태', axes: ['묶음형태', '묶음위치', '마감'] },
      { label: '길이·질감', axes: ['길이', '텍스처', '앞머리'] },
      { label: '헤어 장식', axes: ['헤어장식'] },
      { label: '사진 종류', axes: ['프레이밍', '인원', '촬영환경'], collapsed: true },
    ],
  },
  스튜디오: {
    groups: [
      { label: '무드', axes: ['무드'] },
      { label: '색감·조명', axes: ['색감', '조명', '시간대'] },
      { label: '배경', axes: ['배경씬', '촬영구성'] },
      { label: '소품', axes: ['소품'] },
      { label: '컷 구성', axes: ['컷구성', '인원'], collapsed: true },
    ],
  },
  웨딩홀: {
    groups: [
      { label: '홀 컨셉', axes: ['홀컨셉', '공간종류'] },
      { label: '공간 특성', axes: ['공간특성', '좌석배치'] },
      { label: '조명·밝기', axes: ['밝기', '주광원'] },
      { label: '홀 타입 (등록정보)', axes: ['홀타입'], collapsed: true },
      { label: '사진 종류', axes: ['컷성격'], collapsed: true },
    ],
  },
}

/**
 * 업체 표시 이름. labels.jsonl 에는 인스타 계정만 있어서 화면에 붙일 이름이 없다.
 * 업체 DB 가 서버로 올라오면 이 표는 지우고 DB 를 참조한다.
 */
export const vendorDirectory: Record<string, { name: string; type: string }> = {
  atelier_ohwa: { name: '아틀리에 오화', type: '드레스' },
  'choijaehoon.official': { name: '최재훈', type: '드레스' },
  eloon_official: { name: '엘룬', type: '드레스' },
  abybom__official: { name: '아비봄', type: '헤어&메이크업' },
  hinaf_wedding: { name: '히나프', type: '헤어&메이크업' },
  jsminspiration: { name: 'JSM 인스퍼레이션', type: '헤어&메이크업' },
  _bemy_studio: { name: '비마이 스튜디오', type: '스튜디오' },
  archive_boda: { name: '아카이브 보다', type: '스튜디오' },
  ccomostudio_official: { name: '꼬모 스튜디오', type: '스튜디오' },
  chouchoumonde: { name: '슈슈몽드', type: '웨딩홀' },
  hotelpj_wedding: { name: '호텔 PJ', type: '웨딩홀' },
  thechapel_official: { name: '더채플', type: '웨딩홀' },
}
