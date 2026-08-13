import type {
  BudgetItem,
  BudgetPlan,
  ChecklistItem,
  CommunityPost,
  Consultation,
  ConsultationCard,
  Contract,
  Couple,
  OrderApproval,
  Payment,
  PortalSettings,
  Recommendation,
  Vendor,
  VendorReview,
  VendorScheduleSlot,
  VendorSelection,
  WeddingEvent,
} from '../types'
import { vendorStyleProfiles } from './vendorStyleData'

export const couples: Couple[] = [
  {
    id: 'c1',
    partners: '김서윤 & 이도현',
    initials: '서 · 도',
    weddingDate: '2026-10-17',
    venue: '남산 라루체 가든홀',
    progress: 68,
    status: '집중관리',
    concept: '절제된 클래식, 내추럴 가든',
    tone: 'rose',
    brideName: '김서윤', groomName: '이도현', bridePhone: '010-2451-7820', groomPhone: '010-7382-4410',
    brideEmail: 'seoyun.kim@example.com', groomEmail: 'dohyun.lee@example.com', address: '서울 성동구 서울숲길 24',
    contractType: '프리미엄 동행', contractDate: '2026-04-12', ceremonyDate: '2026-10-17', ceremonyPlace: '남산 라루체 가든홀',
    note: '자연광과 실크 소재를 선호하며 주말 오후 연락을 선호합니다.',
  },
  {
    id: 'c2',
    partners: '박민지 & 최현우',
    initials: '민 · 현',
    weddingDate: '2026-12-12',
    venue: '그랜드 인터컨티넨탈',
    progress: 43,
    status: '준비중',
    concept: '화려한 호텔, 모던 로맨틱',
    tone: 'sage',
    brideName: '박민지', groomName: '최현우', bridePhone: '010-3901-2284', groomPhone: '010-8824-9103',
    brideEmail: 'minji.park@example.com', groomEmail: 'hyunwoo.choi@example.com', address: '서울 송파구 올림픽로 300',
    contractType: '베이직 관리', contractDate: '2026-06-08', ceremonyDate: '2026-12-12', ceremonyPlace: '그랜드 인터컨티넨탈',
    note: '호텔 예식 동선과 하객 숙박 안내를 함께 정리합니다.',
  },
  {
    id: 'c3',
    partners: '정하은 & 오지훈',
    initials: '하 · 지',
    weddingDate: '2027-02-20',
    venue: '빌라드지디 청담',
    progress: 26,
    status: '준비중',
    concept: '시크 미니멀, 모노톤',
    tone: 'sand',
    brideName: '정하은', groomName: '오지훈', bridePhone: '010-5502-4120', groomPhone: '010-6044-3328',
    brideEmail: 'haeun.jung@example.com', groomEmail: 'jihoon.oh@example.com', address: '경기 성남시 분당구 판교역로 15',
    contractType: '부분 동행', contractDate: '2026-07-16', ceremonyDate: '2027-02-20', ceremonyPlace: '빌라드지디 청담',
    note: '평일 저녁 상담 가능. 흑백 레퍼런스를 선호합니다.',
  },
  {
    id: 'c4',
    partners: '윤다솜 & 한재민',
    initials: '다 · 재',
    weddingDate: '2026-09-05',
    venue: '아펠가모 반포',
    progress: 91,
    status: '확정',
    concept: '따뜻한 채플, 프렌치 클래식',
    tone: 'rose',
    brideName: '윤다솜', groomName: '한재민', bridePhone: '010-7420-1852', groomPhone: '010-9921-6604',
    brideEmail: 'dasom.yoon@example.com', groomEmail: 'jaemin.han@example.com', address: '서울 서초구 반포대로 122',
    contractType: '프리미엄 동행', contractDate: '2026-02-21', ceremonyDate: '2026-09-05', ceremonyPlace: '아펠가모 반포',
    note: '본식 직전 최종 확인 단계입니다.',
  },
]

export const initialEvents: WeddingEvent[] = [
  { id: 'e1', coupleId: 'c1', title: '루이즈블랑 드레스 2차 피팅', date: '2026-08-05', time: '10:30', endTime: '12:00', type: '드레스', location: '루이즈블랑, 논현동', travelMinutes: 35, visibility: 'couple-shared' },
  { id: 'e2', coupleId: 'c2', title: '클레브 스튜디오 컨셉 미팅', date: '2026-08-05', time: '14:00', endTime: '15:30', type: '스튜디오', location: '클레브 스튜디오, 성수동', travelMinutes: 42, visibility: 'couple-shared' },
  { id: 'e3', coupleId: 'c4', title: '본식 최종 체크', date: '2026-08-05', time: '17:00', endTime: '18:00', type: '미팅', location: '온라인 미팅', visibility: 'couple-shared' },
  { id: 'e4', coupleId: 'c1', vendorId: 'vp-m3', title: '메이크업 테스트', date: '2026-08-08', time: '11:00', endTime: '13:00', type: '메이크업', location: '정샘물 인스피레이션', approvalStatus: 'confirmed', visibility: 'couple-shared', reminderOffsets: [14, 7, 1] },
  { id: 'e5', coupleId: 'c3', title: '웨딩홀 투어', date: '2026-08-12', time: '15:00', endTime: '17:00', type: '미팅', location: '빌라드지디 청담', visibility: 'couple-shared' },
  { id: 'e9', coupleId: 'c1', title: '루이즈블랑 드레스 최종 셀렉', date: '2026-08-12', time: '16:00', endTime: '17:30', type: '드레스', location: '루이즈블랑, 논현동', approvalStatus: 'planner-proposed', visibility: 'couple-shared' },
  { id: 'e6', coupleId: 'c2', title: '클레브 스튜디오 촬영', date: '2026-08-18', time: '09:00', endTime: '15:00', type: '스튜디오', location: '클레브 스튜디오, 성수동', visibility: 'couple-shared' },
  { id: 'e7', coupleId: 'c1', title: '예물 계약', date: '2026-08-22', time: '13:30', endTime: '15:00', type: '계약', location: '아크레도 청담', visibility: 'couple-shared' },
  { id: 'e8', coupleId: 'c4', title: '본식', date: '2026-09-05', time: '11:30', endTime: '14:30', type: '본식', location: '아펠가모 반포', approvalStatus: 'confirmed', visibility: 'couple-shared', reminderOffsets: [21, 7, 1] },
  { id: 'e-private-1', title: '치과 예약', date: '2026-08-05', time: '15:20', endTime: '16:10', type: '미팅', location: '한남동', visibility: 'planner-private', memo: '플래너 개인 일정' },
]

export const initialChecklist: ChecklistItem[] = [
  { id: 't1', coupleId: 'c1', title: '예식장 계약금 납부', dueDate: '2026-06-18', category: '웨딩홀', kind: 'preparation', status: 'completed', owner: '함께', isTemplate: true },
  { id: 't2', coupleId: 'c1', title: '스튜디오 촬영 콘셉트 확정', dueDate: '2026-06-26', category: '스튜디오', kind: 'preparation', status: 'completed', owner: '플래너', isTemplate: true },
  { id: 't3', coupleId: 'c1', title: '신랑 예복 1차 가봉', dueDate: '2026-07-09', category: '예복·예물', kind: 'preparation', status: 'completed', owner: '신랑·신부', isTemplate: true },
  { id: 't4', coupleId: 'c1', title: '본식 스냅 업체 확정', dueDate: '2026-07-16', category: '본식·기록', kind: 'decision', status: 'completed', owner: '함께', isTemplate: true },
  { id: 't5', coupleId: 'c1', title: '본식 드레스 2차 피팅 준비사항 확인', dueDate: '2026-08-05', category: '드레스·본식', kind: 'preparation', status: 'pending', owner: '신랑·신부', isTemplate: true },
  { id: 't6', coupleId: 'c1', title: '본식 스냅 촬영 구성 확정', dueDate: '2026-08-09', category: '본식·기록', kind: 'preparation', status: 'completed', owner: '함께', isTemplate: true },
  { id: 't7', coupleId: 'c1', title: '청첩장 문구 최종 확인', dueDate: '2026-08-12', category: '초대·연출', kind: 'preparation', status: 'pending', owner: '신랑·신부', isTemplate: true },
  { id: 't8', coupleId: 'c1', title: '부케 미선택', dueDate: '2026-08-10', category: '초대·연출', kind: 'decision', status: 'pending', owner: '플래너', isTemplate: true },
  { id: 't9', coupleId: 'c1', title: '혼인서약서 초안 작성', dueDate: '2026-09-03', category: '행정·기타', kind: 'preparation', status: 'pending', owner: '신랑·신부', isTemplate: true },
  { id: 't10', coupleId: 'c1', title: '예물 수령 및 사이즈 확인', dueDate: '2026-09-08', category: '예복·예물', kind: 'preparation', status: 'pending', owner: '신랑·신부', isTemplate: true },
  { id: 't11', coupleId: 'c1', title: '하객 좌석 배치 1차 정리', dueDate: '2026-09-17', category: '초대·연출', kind: 'preparation', status: 'pending', owner: '함께', isTemplate: true },
  { id: 't12', coupleId: 'c1', title: '본식 메이크업 최종 시안 확인', dueDate: '2026-10-02', category: '메이크업', kind: 'preparation', status: 'pending', owner: '플래너', isTemplate: true },
  { id: 't13', coupleId: 'c1', title: '식순 및 음원 최종 제출', dueDate: '2026-10-07', category: '초대·연출', kind: 'preparation', status: 'pending', owner: '함께', isTemplate: true },
  { id: 't14', coupleId: 'c1', title: '혼인신고 준비 서류 확인', dueDate: '2026-10-12', category: '행정·기타', kind: 'preparation', status: 'pending', owner: '신랑·신부', isTemplate: true },
  { id: 't15', coupleId: 'c2', title: '스튜디오 상품 옵션 미선택', dueDate: '2026-08-07', category: '스튜디오', kind: 'decision', status: 'in-progress', owner: '플래너', isTemplate: true },
  { id: 't16', coupleId: 'c3', title: '웨딩홀 투어 동선 확정', dueDate: '2026-08-10', category: '웨딩홀', kind: 'preparation', status: 'completed', owner: '함께', isTemplate: true },
  { id: 't17', coupleId: 'c1', title: '촬영 드레스 3벌·액세서리 셀렉', dueDate: '2026-07-02', category: '드레스·촬영', kind: 'preparation', status: 'completed', owner: '함께', isTemplate: true },
  { id: 't18', coupleId: 'c1', title: '스튜디오 원본 셀렉 및 보정 요청', dueDate: '2026-08-28', category: '스튜디오', kind: 'preparation', status: 'pending', owner: '함께', isTemplate: true },
  { id: 't19', coupleId: 'c1', title: '본식 드레스 최종 가봉·베일 확정', dueDate: '2026-09-24', category: '드레스·본식', kind: 'preparation', status: 'pending', owner: '신랑·신부', isTemplate: true },
  { id: 't20', coupleId: 'c1', title: '메이크업 테스트 결과·헤어 변형안 정리', dueDate: '2026-08-30', category: '메이크업', kind: 'preparation', status: 'pending', owner: '플래너', isTemplate: true },
  { id: 't21', coupleId: 'c1', title: '본식 영상 업체 미결정', dueDate: '2026-08-04', category: '본식·기록', kind: 'decision', status: 'pending', owner: '함께', isTemplate: true },
]

export const initialBudgetPlans: BudgetPlan[] = couples.map((couple) => ({
  coupleId: couple.id,
  targetAmount: couple.id === 'c1' ? 35_000_000 : 0,
}))

export const initialBudgetItems: BudgetItem[] = [
  { id: 'bi1', coupleId: 'c1', category: '웨딩홀·식대', title: '웨딩홀 대관·식대', plannedAmount: 20_000_000, memo: '보증인원 250명 기준' },
  { id: 'bi2', coupleId: 'c1', category: '스튜디오·드레스·메이크업', title: '드레스 패키지', plannedAmount: 3_000_000, memo: '추가금 별도 확인' },
  { id: 'bi3', coupleId: 'c1', category: '본식·기록', title: '본식 스냅·영상', plannedAmount: 2_500_000, memo: '' },
  { id: 'bi4', coupleId: 'c1', category: '예복·예물', title: '예복·웨딩링', plannedAmount: 4_000_000, memo: '' },
  { id: 'bi5', coupleId: 'c1', category: '초대·하객', title: '청첩장·답례품', plannedAmount: 1_200_000, memo: '' },
]

const verified = <T,>(value: T, verifiedAt: string) => ({ value, verifiedAt })

export const vendors: Vendor[] = [
  ...vendorStyleProfiles.map(({ vendor }, index) => ({
    ...vendor,
    updatedAt: index === 0 ? '2025-06-18' : index % 5 === 0 ? '2024-12-01' : '2026-07-14',
    operationalDetails: vendor.category === '스튜디오'
      ? { kind: 'studio' as const, bouquetProvided: verified(index % 2 === 0, '2026-07-14'), propsProvided: verified(true, '2026-06-20'), veilProvided: verified(index % 3 !== 0, '2026-07-01'), backgrounds: verified(['자연광', index % 2 ? '클래식 세트' : '화이트 호리존'], '2026-07-14'), outdoorShooting: verified(index % 2 === 0, index === 0 ? '2025-06-18' : '2026-07-14'), parking: verified(true, '2026-06-20'), elevator: verified(index % 3 !== 0, '2026-06-20'), shootingDuration: verified('기본 5시간', '2026-07-14'), extensionAvailable: verified(index % 2 === 0, '2026-07-14'), surchargeConditions: verified('야외 이동·주말 촬영 추가금 별도', '2026-07-14') }
      : vendor.category === '드레스'
        ? { kind: 'dress' as const, fittingFee: verified(index % 2 ? '5만원' : '무료', '2026-07-02'), fittingCount: verified(index % 2 ? 4 : 3, '2026-07-02'), shootingAvailable: verified(true, '2026-07-02'), surchargeConditions: verified(index % 2 ? '수입 라인·프리미엄 소재 별도' : '지정 외 액세서리 추가 시 별도', '2026-07-02'), parking: verified(index % 2 === 0, '2026-07-02') }
        : vendor.category === '메이크업'
          ? { kind: 'makeup' as const, earlyStartFee: verified('시간당 5만원', '2026-07-20'), directorRequestAvailable: verified(true, '2026-07-20'), hairpieces: verified('기본 2종 포함 · 추가 대여 가능', '2026-07-20'), parentMakeup: verified('양가 혼주 패키지 상담 가능', '2026-07-20'), parking: verified(index % 2 === 0, '2026-07-20') }
          : undefined,
  })),
]

export const vendorScheduleSlots: VendorScheduleSlot[] = [
  { id: 'vs1', vendorId: 'schedule-template', date: '2026-08-09', time: '11:00', status: 'booked' },
  { id: 'vs2', vendorId: 'schedule-template', date: '2026-08-12', time: '14:00', status: 'booked' },
  { id: 'vs3', vendorId: 'schedule-template', date: '2026-08-14', time: '16:30', status: 'available' },
  { id: 'vs4', vendorId: 'schedule-template', date: '2026-08-21', time: '11:00', status: 'available' },
  { id: 'vs5', vendorId: 'schedule-template', date: '2026-08-25', time: '15:00', status: 'booked' },
  { id: 'vs6', vendorId: 'schedule-template', date: '2026-08-28', time: '13:30', status: 'available' },
  { id: 'vs7', vendorId: 'schedule-template', date: '2026-09-02', time: '10:30', status: 'available' },
  { id: 'vs8', vendorId: 'schedule-template', date: '2026-09-05', time: '14:00', status: 'booked' },
  { id: 'vs9', vendorId: 'schedule-template', date: '2026-09-11', time: '16:00', status: 'available' },
  { id: 'vs10', vendorId: 'schedule-template', date: '2026-09-18', time: '11:30', status: 'booked' },
  { id: 'vs11', vendorId: 'schedule-template', date: '2026-09-24', time: '14:30', status: 'available' },
  { id: 'vs12', vendorId: 'schedule-template', date: '2026-10-01', time: '13:00', status: 'booked' },
  { id: 'vs13', vendorId: 'schedule-template', date: '2026-10-06', time: '10:30', status: 'available' },
  { id: 'vs14', vendorId: 'schedule-template', date: '2026-10-10', time: '15:30', status: 'booked' },
  { id: 'vs15', vendorId: 'schedule-template', date: '2026-10-13', time: '11:00', status: 'available' },
  { id: 'vs16', vendorId: 'schedule-template', date: '2026-08-18', time: '10:00', status: 'available' },
  { id: 'vs17', vendorId: 'schedule-template', date: '2026-08-18', time: '15:30', status: 'booked' },
  { id: 'vs18', vendorId: 'schedule-template', date: '2026-08-19', time: '11:30', status: 'available' },
  { id: 'vs19', vendorId: 'schedule-template', date: '2026-08-20', time: '14:00', status: 'booked' },
  { id: 'vs20', vendorId: 'schedule-template', date: '2026-08-22', time: '10:30', status: 'available' },
]

export const initialVendorSelections: VendorSelection[] = [
  { coupleId: 'c1', vendorId: 'vp-d4', slotId: 'vp-d4-vs4' },
]

export const initialRecommendations: Recommendation[] = [
  { id: 'r1', coupleId: 'c1', vendorId: 'vp-d4', status: 'liked', proposedAt: '2026-07-28', selectionDeadline: '2026-08-04' },
  { id: 'r2', coupleId: 'c1', vendorId: 'vp-s1', status: 'pending', proposedAt: '2026-08-01', selectionDeadline: '2026-08-08' },
  { id: 'r3', coupleId: 'c1', vendorId: 'vp-m3', status: 'hold', proposedAt: '2026-08-02', selectionDeadline: '2026-08-09' },
  { id: 'r4', coupleId: 'c2', vendorId: 'vp-d1', status: 'pending', proposedAt: '2026-07-27', selectionDeadline: '2026-08-03' },
  { id: 'r5', coupleId: 'c2', vendorId: 'vp-s4', status: 'liked', proposedAt: '2026-07-30', selectionDeadline: '2026-08-06' },
  { id: 'r6', coupleId: 'c2', vendorId: 'vp-m2', status: 'pending', proposedAt: '2026-08-03', selectionDeadline: '2026-08-10' },
  { id: 'r7', coupleId: 'c3', vendorId: 'vp-d5', status: 'hold', proposedAt: '2026-07-29', selectionDeadline: '2026-08-05' },
  { id: 'r8', coupleId: 'c3', vendorId: 'vp-s3', status: 'pending', proposedAt: '2026-08-02', selectionDeadline: '2026-08-09' },
  { id: 'r9', coupleId: 'c3', vendorId: 'vp-m5', status: 'liked', proposedAt: '2026-08-01', selectionDeadline: '2026-08-08' },
  { id: 'r10', coupleId: 'c4', vendorId: 'vp-d3', status: 'liked', proposedAt: '2026-07-31', selectionDeadline: '2026-08-07' },
  { id: 'r11', coupleId: 'c4', vendorId: 'vp-s2', status: 'pending', proposedAt: '2026-07-25', selectionDeadline: '2026-08-01' },
  { id: 'r12', coupleId: 'c4', vendorId: 'vp-m1', status: 'pending', proposedAt: '2026-08-04', selectionDeadline: '2026-08-11' },
]

export const initialOrderApprovals: OrderApproval[] = [
  { id: 'oa1', coupleId: 'c1', vendorId: 'vp-m3', recommendationId: 'r3', productName: '신부 메이크업 테스트', relatedEventId: 'e4', requestedAt: '2026-07-29T10:14:32+09:00', approvalDeadline: '2026-08-05T10:14:32+09:00', reviewerName: '박수진', reviewerRole: '실장', reviewerTeam: '예약관리팀', viewedAt: '2026-07-29T10:22:08+09:00', status: 'approved', confirmedAt: '2026-08-01T14:05:19+09:00', respondedAt: '2026-08-01T14:05:19+09:00' },
  { id: 'oa2', coupleId: 'c2', vendorId: 'vp-s4', recommendationId: 'r5', productName: '스튜디오 촬영 패키지', relatedEventId: 'e6', requestedAt: '2026-08-02T09:30:12+09:00', approvalDeadline: '2026-08-09T09:30:12+09:00', reviewerName: '김태훈', reviewerRole: '팀장', reviewerTeam: '촬영운영팀', viewedAt: '2026-08-02T11:42:51+09:00', status: 'pending' },
  { id: 'oa3', coupleId: 'c3', vendorId: 'vp-d5', recommendationId: 'r7', productName: '본식 드레스 피팅', requestedAt: '2026-08-01T15:08:44+09:00', approvalDeadline: '2026-08-08T15:08:44+09:00', reviewerName: '이현정', reviewerRole: '수석실장', reviewerTeam: '피팅팀', viewedAt: '2026-08-01T15:37:20+09:00', status: 'rejected', rejectionReason: 'schedule-unavailable', respondedAt: '2026-08-01T16:02:11+09:00' },
  { id: 'oa4', coupleId: 'c4', vendorId: 'vp-s2', recommendationId: 'r11', productName: '본식 스냅 촬영', requestedAt: '2026-07-20T13:21:09+09:00', approvalDeadline: '2026-07-27T13:21:09+09:00', reviewerName: '최민석', reviewerRole: '팀장', reviewerTeam: '스냅1팀', viewedAt: '2026-07-20T17:05:33+09:00', status: 'expired' },
]

export const contracts: Contract[] = [
  { id: 'ct1', coupleId: 'c1', vendorName: '남산 라루체', category: '웨딩홀', contractDate: '', productName: '', packageDetails: '보증인원 250명 · 식대 82,000원 · 가든홀', paymentMethod: '카드', vatType: '포함', totalPrice: 18500000, commission: 0, deposit: 18500000, paymentDate: '', status: '서명완료', contractFile: '', memo: '', budgetItemId: 'bi1' },
  { id: 'ct2', coupleId: 'c1', vendorId: 'vp-d5', vendorName: '르블랑 브라이드', category: '드레스', contractDate: '', productName: '', packageDetails: '본식 1벌 · 촬영 3벌 · 2차 피팅 포함', paymentMethod: '계좌이체', vatType: '별도', totalPrice: 3200000, commission: 0, deposit: 3200000, paymentDate: '', status: '확인필요', contractFile: '', memo: '', budgetItemId: 'bi2' },
  { id: 'ct3', coupleId: 'c2', vendorId: 'vp-s1', vendorName: '클레브 스튜디오', category: '스튜디오', contractDate: '2026-07-02', productName: '스튜디오 촬영 패키지', packageDetails: '원본 전체 · 수정본 20P · 앨범 2권', paymentMethod: '카드', vatType: '포함', totalPrice: 2150000, commission: 215000, deposit: 500000, paymentDate: '2026-07-02', status: '결제대기', contractFile: '', memo: '촬영일 잔금 결제' },
  { id: 'ct4', coupleId: 'c4', vendorName: '아펠가모 반포', category: '웨딩홀', contractDate: '2026-03-05', productName: '채플홀 본식', packageDetails: '보증인원 280명 · 채플홀 · 생화 장식', paymentMethod: '현금', vatType: '포함', totalPrice: 21800000, commission: 872000, deposit: 4000000, paymentDate: '2026-03-05', status: '서명완료', contractFile: '아펠가모_계약서.pdf', memo: '최종 인원 D-14 확정' },
]

export const initialPayments: Payment[] = [
  { id: 'pay1', coupleId: 'c1', paymentDate: '', type: '계약금', account: '국민 000-00-0000', amount: 18500000, status: '입금완료', memo: '계약금 입금' },
  { id: 'pay2', coupleId: 'c1', paymentDate: '', type: '계약금', account: '국민 000-00-0000', amount: 3200000, status: '입금예정', memo: '계약금 입금' },
  { id: 'pay4', coupleId: 'c2', paymentDate: '2026-07-02', type: '계약금', account: '클레브 스튜디오', amount: 500000, status: '입금완료', memo: '' },
]

export const initialConsultations: Consultation[] = [
  { id: 'con1', coupleId: 'c1', date: '2026-08-01T19:00', originalText: '본식 드레스는 미카도 실크 위주로 다시 보고 싶어요. 예물 수령일도 확인 부탁드려요.', requests: ['실크 드레스 후보 재정리', '예물 수령일 확인'], decisions: ['2차 피팅에 플래너 동행'], nextActions: ['르블랑에 피팅 가능 시간 문의', '예물 업체 일정 확인'] },
  { id: 'con2', coupleId: 'c2', date: '2026-07-28T20:00', originalText: '스튜디오 촬영 때 야외 컷 비중을 늘리고 싶습니다.', requests: ['야외 컷 비중 확대'], decisions: ['오전 촬영 유지'], nextActions: ['우천 시 대체 세트 확인'] },
]

export const initialConsultationCards: ConsultationCard[] = [
  {
    id: 'cc1',
    coupleId: 'c1',
    preferredDate: '2026-10-17',
    shootDate: '2026-08-18',
    coupleNames: '김서윤 & 이동현',
    phone: '010-2451-7820',
    existingVendors: '예식장 계약 완료, 스드메 미정',
    studioDirection: '일반',
    studioMood: '인물중심',
    dressMood: '실크',
    sizes: '신랑 상의 100 / 신부 66',
    makeupMood: '깔끔',
    budget: '스드메 300만원 내외',
    otherPlanner: '없다',
    extraPlanning: '예식 일정 기준 월별 플랜',
    hallDetails: '남산 라루체 가든홀, 보증 인원 250명',
    meetingDetails: '평일 저녁 7시 이후 선호',
    contactPreference: '카톡 상담',
    priorities: '자연스러운 인물 사진 · 미카도 실크 · 과하지 않은 메이크업',
    notes: '업체별 이동 동선과 추가 비용을 함께 비교하고 싶어요.',
    source: '고객 작성',
    createdAt: '2026-08-05',
  },
]

export const initialPortalSettings: PortalSettings[] = couples.map((couple) => ({
  coupleId: couple.id,
  showSchedule: true,
  showFullEstimate: true,
  receiveMessages: true,
  showChecklist: true,
}))

export const communityPosts: CommunityPost[] = [
  { id: 'p1', category: '업체 후기', title: '라포레 담당자님과 진행해보신 분?', excerpt: '다음 달 투어 예정인데 피팅 진행 스타일과 응대가 어떤지 궁금해요.', author: '익명 플래너 28', time: '18분 전', replies: 12, helpful: 24, verified: true, tags: ['드레스', '청담'] },
  { id: 'p2', category: '정보 공유', title: '8월 스튜디오 촬영 시 꼭 챙길 체크리스트 공유해요', excerpt: '장마 이후라 습도와 야외 컷 변수를 고려해서 정리했습니다.', author: '익명 플래너 07', time: '1시간 전', replies: 8, helpful: 41, verified: true, tags: ['스튜디오', '체크리스트'] },
  { id: 'p3', category: '질문', title: '호텔 예식 플라워 추가 견적, 어느 정도가 적정선일까요?', excerpt: '기본 생화에서 버진로드 장식을 추가하려고 하는데 최근 시세 부탁드려요.', author: '익명 플래너 19', time: '3시간 전', replies: 17, helpful: 15, verified: true, tags: ['웨딩홀', '견적'] },
  { id: 'p4', category: '업체 후기', title: '클레브 스튜디오 촬영 후기', excerpt: '자연광 세트가 훨씬 좋았고 작가님 디렉팅도 꼼꼼했습니다.', author: '익명 플래너 41', time: '어제', replies: 6, helpful: 32, verified: true, tags: ['스튜디오', '성수'] },
]

export const initialVendorReviews: VendorReview[] = [
  {
    id: 'vr1', vendorId: 'v1', overallRating: 4.8, responseRating: 4.9, expertiseRating: 4.8, punctualityRating: 4.7,
    experienceContext: '2026년 6월 본식 · 키가 작은 실크 선호 신부와 최종 피팅 동행',
    strengths: '신부님이 체구가 작아 미카도 실크가 너무 무거워 보일까 걱정했는데, 실장님이 허리선과 베일 길이를 바로 조정해 세 벌만에 방향을 잡아주셨어요. 제가 옆에서 별도로 설명하지 않아도 신부님 어머님까지 이해할 수 있게 원단과 사진발 차이를 차분히 짚어준 점이 특히 좋았습니다.',
    considerations: '토요일 오후에는 앞 팀 피팅이 길어져 15분 정도 기다린 적이 있습니다. 뒤에 메이크업 상담을 붙이기보다 최소 30분 여유를 두고, 원하는 넥라인 사진을 두세 장 준비해 가면 상담 밀도가 훨씬 높아집니다.',
    createdAt: '2026-08-11T09:20:00+09:00', authorLabel: '인증 플래너', experienceBand: '경력 5–10년',
  },
  {
    id: 'vr2', vendorId: 'v1', overallRating: 4.6, responseRating: 4.7, expertiseRating: 4.8, punctualityRating: 4.4,
    experienceContext: '2026년 4월 촬영 드레스 셀렉 · 결정을 어려워하는 신부와 방문',
    strengths: '신부님이 다섯 벌을 입고도 결정을 못 하셨는데 재촉하지 않고 처음 두 벌을 다시 비교하게 해주셨어요. 사진으로 봤을 때 어깨선이 어떻게 달라지는지 태블릿으로 나란히 보여줘서 결국 신부님 스스로 확신을 갖고 고르셨고, 상담 뒤 만족도가 높았습니다.',
    considerations: '인기 실크 라인은 촬영일 기준 두 달 전에도 선택지가 빠듯했습니다. 촬영용과 본식용을 함께 볼 예정이라면 예약할 때 두 목적을 명확히 전달해야 충분한 피팅 시간을 받을 수 있어요.',
    createdAt: '2026-07-28T14:10:00+09:00', authorLabel: '인증 플래너', experienceBand: '경력 10년 이상',
  },
  {
    id: 'vr3', vendorId: 'v2', overallRating: 4.7, responseRating: 4.8, expertiseRating: 4.6, punctualityRating: 4.7,
    experienceContext: '2026년 7월 드레스 투어 · 프렌치 무드와 가벼운 볼륨을 원한 신부',
    strengths: '레퍼런스에는 오간자 볼륨이 많았지만 신부님은 실제로 입으니 풍성한 라인이 부담스럽다고 하셨어요. 담당자분이 바로 한 겹 가벼운 스커트와 잔잔한 레이스로 방향을 틀어주셨고, “사진보다 움직일 때 예쁜 드레스”를 찾던 신부님이 마지막 피팅에서 정말 좋아하셨습니다.',
    considerations: '드레스마다 분위기 차이가 커서 막연히 러블리하다고만 요청하면 피팅 범위가 넓어집니다. 소매 유무, 스커트 볼륨, 선호 소재까지 미리 정리해 전달하는 편이 좋아요.',
    createdAt: '2026-08-09T13:30:00+09:00', authorLabel: '인증 플래너', experienceBand: '경력 3–5년',
  },
  {
    id: 'vr4', vendorId: 'v3', overallRating: 4.9, responseRating: 4.8, expertiseRating: 5, punctualityRating: 4.9,
    experienceContext: '2026년 5월 리뉴얼 후 첫 촬영 · 카메라가 어색한 커플 진행',
    strengths: '두 분 모두 사진 찍히는 걸 어려워해서 초반 표정이 굳어 있었는데 작가님이 걷는 동작부터 시작해 자연스럽게 긴장을 풀어주셨어요. 제가 요청한 부모님 선물용 정면 컷도 촬영 후반에 잊지 않고 챙겼고, 원본을 보니 자연광과 인물 비율이 기대 이상으로 안정적이었습니다.',
    considerations: '오후에는 창가 세트의 빛이 빠르게 달라집니다. 자연광 컷이 최우선이면 오전 타임을 추천하고, 우천 예보가 있으면 전날 실내 대체 세트와 촬영 순서를 확인해 두는 게 안전합니다.',
    createdAt: '2026-08-10T16:40:00+09:00', authorLabel: '인증 플래너', experienceBand: '경력 3–5년',
  },
  {
    id: 'vr5', vendorId: 'v3', overallRating: 4.7, responseRating: 4.7, expertiseRating: 4.9, punctualityRating: 4.5,
    experienceContext: '2026년 3월 촬영 · 반려견 동반 커플의 야외 장면 진행',
    strengths: '반려견 컨디션 때문에 계획한 순서대로 촬영하기 어려웠는데 스태프가 야외 장면을 먼저 당겨 유연하게 대응해줬습니다. 강아지가 카메라를 보는 짧은 순간을 놓치지 않았고, 두 분 위주 컷과 가족 컷 비중도 현장에서 바로 조절해 만족스러웠어요.',
    considerations: '반려동물 동반은 이동장, 보호자 한 명, 간식 준비 여부에 따라 진행 속도 차이가 큽니다. 예약 단계에서 동반 사실을 알리고 전체 촬영 시간을 20분 정도 넉넉히 잡는 것을 권합니다.',
    createdAt: '2026-07-31T10:15:00+09:00', authorLabel: '인증 플래너', experienceBand: '경력 5–10년',
  },
  {
    id: 'vr6', vendorId: 'v4', overallRating: 4.6, responseRating: 4.7, expertiseRating: 4.8, punctualityRating: 4.4,
    experienceContext: '2026년 6월 본식 · 평소 화장을 거의 하지 않는 신부 진행',
    strengths: '테스트 때 신부님이 아이라인만 진해져도 낯설어하셨는데, 담당 원장님이 한쪽씩 농도를 달리해 거울과 휴대폰 카메라로 비교하게 해주셨어요. 본식 날에는 울고 난 뒤에도 피부 표현이 무너지지 않았고 혼주 메이크업과 시간 배분도 매끄러웠습니다.',
    considerations: '새벽 첫 타임은 담당자 도착과 헤어 시작 시간이 빠듯할 수 있어 전날 배정표를 다시 받는 편이 좋습니다. 속눈썹이나 음영을 거의 원하지 않는다면 “내추럴”보다 평소 민낯 사진을 보여주는 게 정확해요.',
    createdAt: '2026-08-06T12:10:00+09:00', authorLabel: '인증 플래너', experienceBand: '경력 5–10년',
  },
  {
    id: 'vr7', vendorId: 'vp-d1', overallRating: 4.7, responseRating: 4.6, expertiseRating: 4.9, punctualityRating: 4.6,
    experienceContext: '2026년 5월 호텔 예식 · 화려한 비즈 드레스를 원한 신부 투어',
    strengths: '대형 홀 조명에서 묻히지 않는 드레스를 찾고 있었는데 비즈 반사와 트레인 길이를 홀 사진에 맞춰 비교해줬습니다. 신부님이 장식이 과해 보일까 망설이자 베일과 귀걸이를 덜어 전체 균형을 보여준 제안이 설득력 있었어요.',
    considerations: '볼륨과 장식이 강한 샘플이 많아 미니멀한 후보를 함께 보고 싶다면 예약 메모에 꼭 남겨야 합니다. 본식 동선에 계단이 있다면 최종 가봉 때 트레인 고정 방식도 확인하세요.',
    createdAt: '2026-08-05T15:20:00+09:00', authorLabel: '인증 플래너', experienceBand: '경력 10년 이상',
  },
  {
    id: 'vr8', vendorId: 'vp-d2', overallRating: 4.5, responseRating: 4.5, expertiseRating: 4.8, punctualityRating: 4.3,
    experienceContext: '2026년 4월 야간 예식 · 선명한 실루엣을 선호한 신부 피팅',
    strengths: '처음부터 취향이 확실한 신부라 화려한 라인만 빠르게 추려달라고 요청했는데, 담당자분이 체형별로 세 벌을 정확히 골라 상담 시간이 효율적이었습니다. 조명을 낮춘 상태에서도 비즈가 어떻게 보이는지 확인시켜준 점이 실제 홀 선택에 도움이 됐어요.',
    considerations: '예약이 겹치는 날에는 액세서리 비교 시간이 짧게 느껴질 수 있습니다. 왕관, 이어링, 베일 중 우선순위를 미리 정하고 최종 가봉 때 사진 촬영 가능 범위도 확인하는 것이 좋습니다.',
    createdAt: '2026-07-24T18:00:00+09:00', authorLabel: '인증 플래너', experienceBand: '경력 3–5년',
  },
  {
    id: 'vr9', vendorId: 'vp-d3', overallRating: 4.8, responseRating: 4.8, expertiseRating: 4.9, punctualityRating: 4.7,
    experienceContext: '2026년 7월 채플 예식 · 레이스 선호 신부와 본식 드레스 셀렉',
    strengths: '신부님이 레이스는 좋아하지만 올드해 보일까 걱정했는데 무늬 크기와 비즈 밀도가 다른 샘플을 나란히 보여주며 얼굴에 잘 받는 쪽을 설명해줬어요. 최종적으로 채플홀의 따뜻한 조명과도 잘 맞았고 어머님 의견까지 자연스럽게 조율해준 응대가 인상적이었습니다.',
    considerations: '섬세한 디테일은 휴대폰 사진만으로 차이가 잘 안 보여 동영상도 함께 남겨두는 편이 좋습니다. 투어 당일에는 피부 톤과 비슷한 이너웨어를 준비하면 레이스 색감 비교가 더 정확해요.',
    createdAt: '2026-08-08T11:45:00+09:00', authorLabel: '인증 플래너', experienceBand: '경력 5–10년',
  },
  {
    id: 'vr10', vendorId: 'vp-d4', overallRating: 4.9, responseRating: 4.9, expertiseRating: 5, punctualityRating: 4.8,
    experienceContext: '2026년 6월 가든 예식 · 장식 없는 실크만 원한 신부 진행',
    strengths: '신부님이 레퍼런스를 열 장 넘게 가져갔는데 공통점이 허리 절개와 스커트의 힘이라는 걸 바로 찾아줬습니다. 비슷해 보이는 실크 세 벌도 걸을 때 생기는 주름과 야외 빛 반사를 각각 설명해줘서, 제가 이후 홀 동선까지 연결해 안내하기 수월했어요.',
    considerations: '장식이 적은 만큼 사이즈 보정과 이너웨어 핏이 결과에 크게 영향을 줍니다. 최종 가봉 때 본식 슈즈를 반드시 가져가고, 야외 이동이 있다면 밑단 오염 대비 방법을 미리 상의하세요.',
    createdAt: '2026-08-07T09:50:00+09:00', authorLabel: '인증 플래너', experienceBand: '경력 10년 이상',
  },
  {
    id: 'vr11', vendorId: 'vp-d5', overallRating: 4.6, responseRating: 4.8, expertiseRating: 4.6, punctualityRating: 4.5,
    experienceContext: '2026년 5월 첫 드레스 투어 · 취향이 정해지지 않은 신부 동행',
    strengths: '실크와 레이스 사이에서 고민하던 신부에게 극단적으로 다른 두 벌부터 입혀 취향을 찾게 해준 방식이 좋았습니다. 피팅 후 담당자분이 신부 반응과 어울린 요소를 짧게 정리해줘서 다음 숍에서도 비교 기준을 유지할 수 있었어요.',
    considerations: '컬렉션 폭이 넓어 사전 취향 없이 방문하면 피팅 수가 늘어날 수 있습니다. 첫 두 벌을 입은 뒤 좋았던 점과 싫었던 점을 바로 메모하면서 진행하면 훨씬 효율적입니다.',
    createdAt: '2026-07-27T14:35:00+09:00', authorLabel: '인증 플래너', experienceBand: '경력 1–3년',
  },
  {
    id: 'vr12', vendorId: 'vp-s1', overallRating: 4.7, responseRating: 4.7, expertiseRating: 4.8, punctualityRating: 4.6,
    experienceContext: '2026년 6월 촬영 · 화보 컷과 자연스러운 야외 컷을 함께 원한 커플',
    strengths: '신랑님은 정적인 포즈를, 신부님은 움직임 있는 컷을 선호해 취향이 달랐는데 두 스타일을 번갈아 촬영해 두 분 모두 지치지 않게 진행했습니다. 오후 야외 촬영에서는 바람 방향까지 보고 베일 장면을 먼저 잡아준 현장 판단이 좋았어요.',
    considerations: '세트 이동이 잦은 구성이라 드레스가 세 벌 이상이면 환복 시간이 촬영을 압박할 수 있습니다. 욕심내기보다 핵심 의상 두 벌과 야외용 한 벌 정도로 우선순위를 정하는 걸 추천합니다.',
    createdAt: '2026-08-04T17:10:00+09:00', authorLabel: '인증 플래너', experienceBand: '경력 5–10년',
  },
  {
    id: 'vr13', vendorId: 'vp-s2', overallRating: 4.6, responseRating: 4.7, expertiseRating: 4.6, punctualityRating: 4.6,
    experienceContext: '2026년 4월 촬영 · 과한 연출 없이 인물 중심 사진을 원한 커플',
    strengths: '두 분이 소품이나 드라마틱한 포즈를 부담스러워했는데 대화하는 모습과 가볍게 기대는 동작 위주로 디렉팅해 편안한 표정을 잘 끌어냈습니다. 촬영 중간 원본을 보여주며 표정과 자세를 조율해 신부님이 안심했던 점도 좋았어요.',
    considerations: '깔끔한 배경은 자세와 손 모양이 더 잘 보여 사전에 기본 포즈를 조금 연습하면 결과가 좋아집니다. 화려한 세트 컷이 꼭 필요하다면 가능한 공간이 제한적이므로 상담 단계에서 확인하세요.',
    createdAt: '2026-07-22T10:25:00+09:00', authorLabel: '인증 플래너', experienceBand: '경력 3–5년',
  },
  {
    id: 'vr14', vendorId: 'vp-s3', overallRating: 4.8, responseRating: 4.6, expertiseRating: 5, punctualityRating: 4.7,
    experienceContext: '2026년 5월 촬영 · 패션 화보와 필름 질감을 선호한 커플',
    strengths: '신부님이 저장해온 해외 화보 레퍼런스를 작가님이 그대로 따라 하기보다 두 분 체형과 의상에 맞게 재해석해줬습니다. 평소 무표정한 신랑님의 분위기를 억지로 바꾸지 않고 장점으로 살린 컷이 많아 셀렉 때 두 분 만족도가 특히 높았어요.',
    considerations: '작가 색이 분명해서 밝고 전형적인 웨딩 사진을 기대하면 취향 차이가 날 수 있습니다. 상담 전에 원하는 명암과 보정 톤을 대표 사진 다섯 장 정도로 좁혀 합의하는 과정이 필요해요.',
    createdAt: '2026-08-02T12:40:00+09:00', authorLabel: '인증 플래너', experienceBand: '경력 10년 이상',
  },
  {
    id: 'vr15', vendorId: 'vp-s4', overallRating: 4.7, responseRating: 4.8, expertiseRating: 4.7, punctualityRating: 4.6,
    experienceContext: '2026년 7월 촬영 · 부모님용 정석 사진과 트렌디한 컷이 모두 필요했던 커플',
    strengths: '두 분 취향은 화보형이었지만 부모님께 드릴 단정한 사진도 필요하다고 전달하니 초반에 정석 컷을 충분히 확보한 뒤 분위기를 바꿔줬습니다. 촬영 종료 전 요청 목록을 다시 확인해 빠진 소품 컷까지 챙긴 점이 플래너 입장에서 믿음직했어요.',
    considerations: '선택 가능한 콘셉트가 많아 현장에서 즉흥적으로 고르면 시간이 분산됩니다. 촬영 전날 필수 컷, 가능하면 찍을 컷, 제외할 컷으로 나눠 전달하면 결과물이 더 일관됩니다.',
    createdAt: '2026-08-09T08:30:00+09:00', authorLabel: '인증 플래너', experienceBand: '경력 5–10년',
  },
  {
    id: 'vr16', vendorId: 'vp-s5', overallRating: 4.5, responseRating: 4.6, expertiseRating: 4.6, punctualityRating: 4.3,
    experienceContext: '2026년 5월 하우스 촬영 · 초록 배경을 최우선으로 둔 커플',
    strengths: '비가 오다 그친 날이라 야외 촬영 여부가 애매했는데 스태프가 바닥 상태와 빛을 계속 확인하다가 가장 좋은 20분에 야외 장면을 몰아서 찍어줬습니다. 실내에서도 창가와 식물을 활용해 전체 앨범의 초록 분위기가 끊기지 않았어요.',
    considerations: '서울에서 이동 시간이 길고 주말 교통 변수가 큽니다. 헤어·메이크업 아웃 시간을 평소보다 30분 당겨 잡고, 우천 시 신발과 드레스 밑단을 보호할 준비물을 별도로 챙기세요.',
    createdAt: '2026-07-18T16:55:00+09:00', authorLabel: '인증 플래너', experienceBand: '경력 3–5년',
  },
  {
    id: 'vr17', vendorId: 'vp-m1', overallRating: 4.7, responseRating: 4.8, expertiseRating: 4.8, punctualityRating: 4.5,
    experienceContext: '2026년 6월 본식 · 웜톤과 쿨톤 사이에서 고민한 신부 진행',
    strengths: '테스트 때 양쪽 볼과 립 컬러를 다르게 올려 자연광과 실내 조명에서 직접 비교하게 해줬습니다. 신부님이 좋아하는 색보다 사진에서 얼굴이 맑아 보이는 색을 근거 있게 설명해줘서 최종 선택에 대한 만족감이 높았어요.',
    considerations: '혼주와 신부 메이크업이 같은 시간대에 겹치면 대기 동선이 복잡할 수 있습니다. 가족별 도착 시간을 10분 단위로 나눠 전달하고, 알레르기가 있다면 사용하는 베이스 제품을 테스트 전에 확인하세요.',
    createdAt: '2026-08-03T11:10:00+09:00', authorLabel: '인증 플래너', experienceBand: '경력 5–10년',
  },
  {
    id: 'vr18', vendorId: 'vp-m2', overallRating: 4.8, responseRating: 4.9, expertiseRating: 4.9, punctualityRating: 4.7,
    experienceContext: '2026년 7월 본식 · 생기 있는 메이크업을 원했지만 홍조가 고민인 신부',
    strengths: '신부님은 과즙 메이크업을 원하면서도 홍조가 더 도드라질까 걱정했는데 피부 베이스는 차분히 잡고 립과 눈 밑에만 생기를 더해 균형을 맞췄습니다. 본식 직전 사진에서도 목과 얼굴 톤 차이가 거의 없었고 수정 메이크업 설명도 세심했어요.',
    considerations: '대표 이미지처럼 색감을 선명하게 원한다면 평소 사용하는 립 사진만 보여주기보다 드레스와 부케 색까지 함께 전달해야 합니다. 테스트 결과는 창가에서 동영상으로 남겨두면 본식 전 농도 조율에 유용해요.',
    createdAt: '2026-08-10T09:05:00+09:00', authorLabel: '인증 플래너', experienceBand: '경력 3–5년',
  },
  {
    id: 'vr19', vendorId: 'vp-m3', overallRating: 4.6, responseRating: 4.6, expertiseRating: 4.8, punctualityRating: 4.5,
    experienceContext: '2026년 4월 본식 · 또렷하지만 색조가 튀지 않는 메이크업 요청',
    strengths: '신부님이 눈매는 또렷하게 보이되 색조 느낌은 거의 없기를 원했는데 속눈썹 방향과 음영만으로 인상을 정리해줬습니다. 헤어도 잔머리 양을 단계별로 보여줘 신부님이 부담 없이 선택할 수 있었고, 베일을 쓴 뒤 옆모습까지 꼼꼼히 확인했어요.',
    considerations: '누디 톤은 조명에 따라 얼굴이 평면적으로 보일 수 있어 본식 홀 조명 사진을 가져가는 편이 좋습니다. 테스트 때 만족한 포인트를 담당자 메모와 본인 사진 양쪽으로 남겨두세요.',
    createdAt: '2026-07-21T13:15:00+09:00', authorLabel: '인증 플래너', experienceBand: '경력 10년 이상',
  },
  {
    id: 'vr20', vendorId: 'vp-m4', overallRating: 4.7, responseRating: 4.8, expertiseRating: 4.7, punctualityRating: 4.6,
    experienceContext: '2026년 5월 본식 · 촬영 때와 다른 분위기를 원한 신부 진행',
    strengths: '촬영 때 누디 메이크업이 너무 밋밋하게 느껴졌던 신부라 본식에는 생기를 조금 더 원했습니다. 담당자분이 촬영 사진의 아쉬운 부분을 먼저 듣고 베이스는 유지하되 립과 속눈썹만 조절해 “다른 사람 같지 않은 변화”를 만들어줬어요.',
    considerations: '과즙과 누디 모두 가능한 만큼 요청이 추상적이면 결과도 중간 지점에 머물 수 있습니다. 유지할 요소와 반드시 바꿀 요소를 각각 두 가지씩 정리해 가는 것이 가장 효과적이었습니다.',
    createdAt: '2026-07-30T15:45:00+09:00', authorLabel: '인증 플래너', experienceBand: '경력 5–10년',
  },
  {
    id: 'vr21', vendorId: 'vp-m5', overallRating: 4.6, responseRating: 4.7, expertiseRating: 4.6, punctualityRating: 4.6,
    experienceContext: '2026년 6월 본식 · 사진에서는 또렷하고 실제로는 자연스럽길 원한 신부',
    strengths: '신부님 요구가 서로 모순되는 것처럼 들렸지만 담당자분이 눈썹과 윤곽은 깔끔하게 잡고 피부와 립은 맑게 두는 방식으로 풀어냈습니다. 메이크업을 마친 뒤 휴대폰 기본 카메라와 전문 카메라 모두에서 확인해 농도를 한 번 더 조정한 점이 좋았어요.',
    considerations: '유분이 빨리 올라오는 피부라면 본식 전에 사용할 수정 제품과 방법을 꼭 물어보세요. 헤어 변형을 추가할 경우 액세서리 교체 순서와 비용을 예약서에 구체적으로 남기는 편이 안전합니다.',
    createdAt: '2026-07-25T09:40:00+09:00', authorLabel: '인증 플래너', experienceBand: '경력 1–3년',
  },
]
