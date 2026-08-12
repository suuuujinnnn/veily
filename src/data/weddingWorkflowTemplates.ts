import type { WeddingWorkflowTemplate } from '../types'

export const workflowStages = [
  { id: '365', label: 'D-365', min: -999, max: -241 },
  { id: '240', label: 'D-240', min: -240, max: -181 },
  { id: '180', label: 'D-180', min: -180, max: -121 },
  { id: '120', label: 'D-120', min: -120, max: -91 },
  { id: '90', label: 'D-90', min: -90, max: -61 },
  { id: '60', label: 'D-60', min: -60, max: -31 },
  { id: '30', label: 'D-30', min: -30, max: -15 },
  { id: '14', label: 'D-14', min: -14, max: -8 },
  { id: '7', label: 'D-7', min: -7, max: -1 },
  { id: 'day', label: '당일', min: 0, max: 0 },
  { id: 'after', label: '본식 후', min: 1, max: 999 },
] as const

export function workflowStageFor(offsetDays: number) {
  return workflowStages.find((stage) => offsetDays >= stage.min && offsetDays <= stage.max) ?? workflowStages[0]
}

export const weddingWorkflowTemplates: WeddingWorkflowTemplate[] = [
  { id: 'budget-scope', title: '전체 예산과 우선순위 정하기', category: '행정·기타', offsetDays: -365, defaultOwner: '함께', summary: '총예산, 양가 지원 범위와 가장 중요한 세 가지를 먼저 합의합니다.', checkpoints: ['예산 상한선', '양가 분담 범위', '우선순위 3가지'], optional: false },
  { id: 'venue-search', title: '웨딩홀 후보와 투어 일정 정하기', category: '웨딩홀', offsetDays: -330, defaultOwner: '플래너', summary: '지역, 날짜, 예상 하객 수에 맞춰 비교 가능한 후보를 좁힙니다.', checkpoints: ['희망 지역·시간', '예상 보증인원', '대관료·식대·주차'], optional: false },
  { id: 'venue-contract', title: '웨딩홀 계약 조건 검토하기', category: '웨딩홀', offsetDays: -300, defaultOwner: '함께', summary: '계약금뿐 아니라 보증인원과 취소·변경 규정을 함께 확인합니다.', checkpoints: ['최소 보증인원', '식대와 음주류', '취소·일정 변경 규정'], optional: false },
  { id: 'planner-schedule', title: '전체 준비 일정표 확정하기', category: '행정·기타', offsetDays: -240, defaultOwner: '플래너', summary: '촬영일과 본식 납기를 기준으로 주요 계약 일정을 배치합니다.', checkpoints: ['촬영 희망일', '청첩장 배포일', '본식 납기 역산'], optional: false },
  { id: 'sdm-contract', title: '스드메 구성과 추가금 확인하기', category: '스튜디오', offsetDays: -220, defaultOwner: '함께', summary: '기본 패키지와 현장에서 발생할 수 있는 추가금을 분리해 확인합니다.', checkpoints: ['원본·수정본', '드레스 추가금', '얼리 스타트·출장비'], optional: false },
  { id: 'main-photo', title: '본식 스냅·영상 업체 확정하기', category: '본식·기록', offsetDays: -200, defaultOwner: '플래너', summary: '홀 동선과 원하는 기록 스타일에 맞춰 스냅과 영상을 예약합니다.', checkpoints: ['촬영 인원', '원본 제공 범위', '납품 일정'], optional: false },
  { id: 'honeymoon-plan', title: '허니문 일정과 여권 확인하기', category: '행정·기타', offsetDays: -180, defaultOwner: '신랑·신부', summary: '성수기 항공권과 여권 유효기간을 일찍 확인합니다.', checkpoints: ['여권 유효기간', '항공·숙소 취소 조건', '여행자 보험'], optional: true },
  { id: 'hanbok-suit', title: '신랑 예복·혼주 의상 준비하기', category: '예복·예물', offsetDays: -160, defaultOwner: '신랑·신부', summary: '제작 기간과 양가 방문 가능일을 고려해 피팅을 시작합니다.', checkpoints: ['대여·맞춤 여부', '양가 색상 조율', '가봉 일정'], optional: false },
  { id: 'shoot-dress', title: '촬영 드레스와 소품 셀렉하기', category: '드레스·촬영', offsetDays: -130, defaultOwner: '함께', summary: '촬영 콘셉트별 의상과 부케·액세서리 조합을 정합니다.', checkpoints: ['드레스 벌수', '개인 소품', '헬퍼비·피팅비'], optional: false },
  { id: 'shoot-concept', title: '촬영 콘셉트·준비물 확정하기', category: '스튜디오', offsetDays: -120, defaultOwner: '플래너', summary: '촬영 시안과 타임라인을 업체별로 공유합니다.', checkpoints: ['헤어 변형', '의상 순서', '간식·이동 동선'], optional: false },
  { id: 'rings', title: '예물·웨딩링 계약하기', category: '예복·예물', offsetDays: -110, defaultOwner: '신랑·신부', summary: '제작 및 각인 기간을 고려해 수령일을 확정합니다.', checkpoints: ['사이즈', '각인 문구', 'A/S와 수령일'], optional: true },
  { id: 'guest-list', title: '양가 하객 명단 1차 취합하기', category: '초대·연출', offsetDays: -90, defaultOwner: '신랑·신부', summary: '모바일·종이 청첩장 수량과 보증인원 판단에 쓸 명단을 만듭니다.', checkpoints: ['양가별 예상 인원', '종이 청첩장 수량', '연락처 누락'], optional: false },
  { id: 'invitation', title: '청첩장 문구와 디자인 확정하기', category: '초대·연출', offsetDays: -75, defaultOwner: '함께', summary: '예식 정보와 교통 안내를 교정하고 인쇄 일정을 확정합니다.', checkpoints: ['예식 정보 교정', '계좌 공개 범위', '주차·셔틀 안내'], optional: false },
  { id: 'makeup-test', title: '메이크업 테스트와 헤어 시안 정리하기', category: '메이크업', offsetDays: -70, defaultOwner: '플래너', summary: '본식 의상과 얼굴형에 맞춘 시안을 사진으로 남깁니다.', checkpoints: ['피부 표현', '헤어 변형', '혼주 메이크업 인원'], optional: true },
  { id: 'optional-pyebaek', title: '폐백·예단 진행 여부 확정하기', category: '행정·기타', offsetDays: -60, defaultOwner: '함께', summary: '양가 의사를 확인하고 진행할 경우 품목과 시간을 정합니다.', checkpoints: ['양가 합의', '폐백실 사용', '준비 품목'], optional: true },
  { id: 'ceremony-roles', title: '사회·축가·주례 여부 확정하기', category: '초대·연출', offsetDays: -55, defaultOwner: '신랑·신부', summary: '섭외자에게 식순과 리허설 가능 시간을 안내합니다.', checkpoints: ['주례 여부', '사회자·축가자', '사례 및 식사'], optional: false },
  { id: 'original-select', title: '촬영 원본 셀렉과 보정 요청하기', category: '스튜디오', offsetDays: -50, defaultOwner: '신랑·신부', summary: '앨범과 청첩장 납기에 맞춰 셀렉을 완료합니다.', checkpoints: ['셀렉 마감', '추가 보정 비용', '청첩장용 선출고'], optional: false },
  { id: 'bouquet-flower', title: '부케·본식 플라워 시안 확정하기', category: '초대·연출', offsetDays: -45, defaultOwner: '플래너', summary: '드레스와 홀 분위기에 맞춰 색감과 제외 꽃을 전달합니다.', checkpoints: ['부케 형태', '계절 수급', '부토니에·코사지'], optional: false },
  { id: 'final-guest', title: '최종 하객 수와 좌석 계획 정리하기', category: '초대·연출', offsetDays: -30, defaultOwner: '함께', summary: '홀 보증인원 조정 마감 전에 양가 인원을 다시 확인합니다.', checkpoints: ['보증인원 변경 마감', '지정석 여부', '유아·채식 식사'], optional: false },
  { id: 'dress-final', title: '본식 드레스 최종 가봉하기', category: '드레스·본식', offsetDays: -23, defaultOwner: '신랑·신부', summary: '슈즈 높이와 속옷, 베일까지 실제 착장으로 점검합니다.', checkpoints: ['사이즈와 기장', '베일·액세서리', '헬퍼 연락처'], optional: false },
  { id: 'return-gift', title: '답례품·답례 방식 정하기', category: '초대·연출', offsetDays: -20, defaultOwner: '신랑·신부', summary: '직장과 불참 하객을 포함해 수량과 전달 방식을 정합니다.', checkpoints: ['대상과 수량', '배송 일정', '메시지 카드'], optional: true },
  { id: 'final-payment', title: '업체별 잔금과 결제 수단 확인하기', category: '행정·기타', offsetDays: -14, defaultOwner: '플래너', summary: '당일 결제와 사전 이체를 구분해 누락을 막습니다.', checkpoints: ['잔금일', '현금영수증·세금계산서', '당일 봉투'], optional: false },
  { id: 'ceremony-sheet', title: '식순·음원·영상 최종 제출하기', category: '본식·기록', offsetDays: -10, defaultOwner: '함께', summary: '홀과 사회자에게 동일한 최종본을 전달합니다.', checkpoints: ['식순 버전', '음원 파일 형식', '영상 재생 테스트'], optional: false },
  { id: 'vendor-confirm', title: '모든 업체 일정과 연락망 재확인하기', category: '행정·기타', offsetDays: -7, defaultOwner: '플래너', summary: '도착 시간, 담당자 연락처와 비상 대안을 한 장으로 정리합니다.', checkpoints: ['도착 시간', '담당자 연락처', '우천·지연 대응'], optional: false },
  { id: 'day-kit', title: '본식 준비물과 사례비 인계하기', category: '행정·기타', offsetDays: -3, defaultOwner: '함께', summary: '반지, 혼인서약서, 식권과 결제 봉투의 담당자를 지정합니다.', checkpoints: ['반지·서약서', '식권·주차권', '사례비·잔금 봉투'], optional: false },
  { id: 'wedding-day', title: '본식 현장 최종 운영 확인하기', category: '본식·기록', offsetDays: 0, defaultOwner: '플래너', summary: '신랑·신부가 식에 집중할 수 있도록 동선과 시간을 관리합니다.', checkpoints: ['대기실·포토테이블', '본식 진행 시간', '분실물·물품 회수'], optional: false },
  { id: 'after-settlement', title: '업체 정산과 대여품 반납 확인하기', category: '행정·기타', offsetDays: 2, defaultOwner: '플래너', summary: '잔금, 추가 비용, 의상과 소품 반납을 마감합니다.', checkpoints: ['추가금 영수증', '대여품 반납', '계약별 정산 완료'], optional: false },
  { id: 'marriage-report', title: '혼인신고·증명서 준비 확인하기', category: '행정·기타', offsetDays: 7, defaultOwner: '신랑·신부', summary: '두 사람의 일정과 필요에 따라 신고 시점과 서류를 확인합니다.', checkpoints: ['신분증·신고서', '증인 서명', '후속 행정 변경'], optional: true },
]
