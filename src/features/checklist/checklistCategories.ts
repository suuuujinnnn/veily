import type { ChecklistCategory } from '../../types'

export const checklistCategories: { id: ChecklistCategory; description: string }[] = [
  { id: '웨딩홀', description: '계약·식사·하객 동선' },
  { id: '스튜디오', description: '촬영 콘셉트·원본 셀렉' },
  { id: '드레스·촬영', description: '촬영용 드레스·소품' },
  { id: '드레스·본식', description: '본식 가봉·최종 피팅' },
  { id: '메이크업', description: '테스트·헤어·최종 시안' },
  { id: '본식·기록', description: '본식 스냅·영상' },
  { id: '예복·예물', description: '예복·반지·혼주 의상' },
  { id: '초대·연출', description: '청첩장·식순·플라워' },
  { id: '행정·기타', description: '신고·정산·제출 서류' },
]
