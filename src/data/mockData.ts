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
  OrderReminder,
  Payment,
  PortalSettings,
  Recommendation,
  Vendor,
  VendorInsight,
  VendorScheduleSlot,
  VendorSelection,
  WeddingEvent,
} from '../types'
import { labeledVendors } from './vendorLabelData'
import { venueVendors } from './weddingVenueData'

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
    brideEmail: 'seoyun.kim@example.com', groomEmail: 'dohyun.lee@example.com', brideOccupation: '브랜드 마케터', groomOccupation: 'IT 서비스 기획자', address: '서울 성동구 서울숲길 24',
    acquisitionChannel: '지인 추천', referrerName: '최유진 고객', preferredContactMethod: '카카오톡', preferredContactTime: '평일 18:00 이후 · 주말 오후',
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
    brideEmail: 'minji.park@example.com', groomEmail: 'hyunwoo.choi@example.com', brideOccupation: '회계사', groomOccupation: '건축 설계사', address: '서울 송파구 올림픽로 300',
    acquisitionChannel: '인스타그램', referrerName: '없음', preferredContactMethod: '문자', preferredContactTime: '평일 점심시간',
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
    brideEmail: 'haeun.jung@example.com', groomEmail: 'jihoon.oh@example.com', brideOccupation: '제품 디자이너', groomOccupation: '개발자', address: '경기 성남시 분당구 판교역로 15',
    acquisitionChannel: '웨딩 박람회', referrerName: '박람회 상담 부스', preferredContactMethod: '카카오톡', preferredContactTime: '평일 19:00 이후',
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
    brideEmail: 'dasom.yoon@example.com', groomEmail: 'jaemin.han@example.com', brideOccupation: '교사', groomOccupation: '금융 컨설턴트', address: '서울 서초구 반포대로 122',
    acquisitionChannel: '기존 고객 추천', referrerName: '김하늘 고객', preferredContactMethod: '전화', preferredContactTime: '평일 17:00–19:00',
    contractType: '프리미엄 동행', contractDate: '2026-02-21', ceremonyDate: '2026-09-05', ceremonyPlace: '아펠가모 반포',
    note: '본식 직전 최종 확인 단계입니다.',
  },
]

export const initialEvents: WeddingEvent[] = [
  { id: 'e1', coupleId: 'c1', title: '루이즈블랑 드레스 2차 피팅', date: '2026-08-05', time: '10:30', endTime: '12:00', type: '드레스', location: '루이즈블랑, 논현동', travelMinutes: 35, visibility: 'couple-shared' },
  { id: 'e2', coupleId: 'c2', title: '클레브 스튜디오 컨셉 미팅', date: '2026-08-05', time: '14:00', endTime: '15:30', type: '스튜디오', location: '클레브 스튜디오, 성수동', travelMinutes: 42, visibility: 'couple-shared' },
  { id: 'e3', coupleId: 'c4', title: '본식 최종 체크', date: '2026-08-05', time: '17:00', endTime: '18:00', type: '미팅', location: '온라인 미팅', visibility: 'couple-shared' },
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
  // 인스타에서 수집해 사진을 판정한 실제 업체. reference.vendorId 가 이걸 가리킨다.
  ...labeledVendors,
  ...venueVendors,
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
]

export const initialRecommendations: Recommendation[] = [
]

export const initialOrderApprovals: OrderApproval[] = [
]

export const contracts: Contract[] = [
  { id: 'ct1', coupleId: 'c1', vendorName: '남산 라루체', category: '웨딩홀', contractDate: '', productName: '', packageDetails: '보증인원 250명 · 식대 82,000원 · 가든홀', paymentMethod: '카드', vatType: '포함', totalPrice: 18500000, commission: 0, deposit: 18500000, paymentDate: '', status: '서명완료', contractFile: '', memo: '', budgetItemId: 'bi1' },
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
  { id: 'p3', category: '견적·계약', title: '호텔 예식 플라워 추가 견적 최근 범위 공유해요', excerpt: '기본 생화에서 버진로드 장식을 추가한 최근 진행 건의 항목별 범위를 정리했습니다.', author: '익명 플래너 19', time: '1시간 전', replies: 17, helpful: 35, verified: true, tags: ['웨딩홀', '견적'] },
  { id: 'p4', category: '현장 노하우', title: '비 오는 날 야외 촬영 체크리스트', excerpt: '신발 커버, 드레스 밑단 보호, 실내 대체 세트 확인 순서까지 현장 기준으로 정리했습니다.', author: '익명 플래너 12', time: '2시간 전', replies: 6, helpful: 52, verified: true, tags: ['스튜디오', '우천'] },
  { id: 'p5', category: '자유게시판', title: '성수 쪽 상담 세 건 연속일 때 쉬기 좋은 곳', excerpt: '이동 동선 짧고 노트북 펼치기 괜찮았던 장소들 가볍게 공유해요.', author: '익명 플래너 31', time: '3시간 전', replies: 21, helpful: 18, verified: true, tags: ['일상', '성수'] },
  { id: 'p7', category: '현장 노하우', title: '첫 드레스 투어 고객 취향 좁히는 질문 5개', excerpt: '소재보다 실루엣부터 물어보면 상담 시간이 줄었던 질문 순서를 공유합니다.', author: '익명 플래너 09', time: '어제', replies: 14, helpful: 67, verified: true, tags: ['드레스', '상담'] },
  { id: 'p8', category: '견적·계약', title: '스튜디오 원본·수정본 추가금 표기 팁', excerpt: '고객 견적서에서 오해가 잦은 원본 구매와 페이지 추가 비용 표기 예시입니다.', author: '익명 플래너 22', time: '어제', replies: 5, helpful: 39, verified: true, tags: ['스튜디오', '추가금'] },
  { id: 'p10', category: '자유게시판', title: '요즘 고객 상담 전에 어떤 자료 먼저 보내세요?', excerpt: '레퍼런스 보드와 체크리스트 중 무엇을 먼저 전달하는지 서로의 루틴이 궁금해요.', author: '익명 플래너 38', time: '2일 전', replies: 33, helpful: 44, verified: true, tags: ['일상', '상담루틴'] },
]

export const initialOrderReminders: OrderReminder[] = [
]

export const initialVendorInsights: VendorInsight[] = [
  {
    id: 'vi1', vendorId: 'v1', category: '실제 진행 후기', title: '현장 진행 경험 공유', tags: ['실제진행', '플래너정보'], helpfulCount: 10,
    experienceContext: '2026년 6월 본식 · 키가 작은 실크 선호 신부와 최종 피팅 동행',
    highlights: '신부님이 체구가 작아 미카도 실크가 너무 무거워 보일까 걱정했는데, 실장님이 허리선과 베일 길이를 바로 조정해 세 벌만에 방향을 잡아주셨어요. 제가 옆에서 별도로 설명하지 않아도 신부님 어머님까지 이해할 수 있게 원단과 사진발 차이를 차분히 짚어준 점이 특히 좋았습니다.',
    considerations: '토요일 오후에는 앞 팀 피팅이 길어져 15분 정도 기다린 적이 있습니다. 뒤에 메이크업 상담을 붙이기보다 최소 30분 여유를 두고, 원하는 넥라인 사진을 두세 장 준비해 가면 상담 밀도가 훨씬 높아집니다.',
    createdAt: '2026-08-11T09:20:00+09:00', authorLabel: '인증 플래너', experienceBand: '경력 5–10년',
  },
  {
    id: 'vi2', vendorId: 'v1', category: '실제 진행 후기', title: '현장 진행 경험 공유', tags: ['실제진행', '플래너정보'], helpfulCount: 11,
    experienceContext: '2026년 4월 촬영 드레스 셀렉 · 결정을 어려워하는 신부와 방문',
    highlights: '신부님이 다섯 벌을 입고도 결정을 못 하셨는데 재촉하지 않고 처음 두 벌을 다시 비교하게 해주셨어요. 사진으로 봤을 때 어깨선이 어떻게 달라지는지 태블릿으로 나란히 보여줘서 결국 신부님 스스로 확신을 갖고 고르셨고, 상담 뒤 만족도가 높았습니다.',
    considerations: '인기 실크 라인은 촬영일 기준 두 달 전에도 선택지가 빠듯했습니다. 촬영용과 본식용을 함께 볼 예정이라면 예약할 때 두 목적을 명확히 전달해야 충분한 피팅 시간을 받을 수 있어요.',
    createdAt: '2026-07-28T14:10:00+09:00', authorLabel: '인증 플래너', experienceBand: '경력 10년 이상',
  },
  {
    id: 'vi3', vendorId: 'v2', category: '실제 진행 후기', title: '현장 진행 경험 공유', tags: ['실제진행', '플래너정보'], helpfulCount: 12,
    experienceContext: '2026년 7월 드레스 투어 · 프렌치 무드와 가벼운 볼륨을 원한 신부',
    highlights: '레퍼런스에는 오간자 볼륨이 많았지만 신부님은 실제로 입으니 풍성한 라인이 부담스럽다고 하셨어요. 담당자분이 바로 한 겹 가벼운 스커트와 잔잔한 레이스로 방향을 틀어주셨고, “사진보다 움직일 때 예쁜 드레스”를 찾던 신부님이 마지막 피팅에서 정말 좋아하셨습니다.',
    considerations: '드레스마다 분위기 차이가 커서 막연히 러블리하다고만 요청하면 피팅 범위가 넓어집니다. 소매 유무, 스커트 볼륨, 선호 소재까지 미리 정리해 전달하는 편이 좋아요.',
    createdAt: '2026-08-09T13:30:00+09:00', authorLabel: '인증 플래너', experienceBand: '경력 3–5년',
  },
  {
    id: 'vi4', vendorId: 'v3', category: '실제 진행 후기', title: '현장 진행 경험 공유', tags: ['실제진행', '플래너정보'], helpfulCount: 13,
    experienceContext: '2026년 5월 리뉴얼 후 첫 촬영 · 카메라가 어색한 커플 진행',
    highlights: '두 분 모두 사진 찍히는 걸 어려워해서 초반 표정이 굳어 있었는데 작가님이 걷는 동작부터 시작해 자연스럽게 긴장을 풀어주셨어요. 제가 요청한 부모님 선물용 정면 컷도 촬영 후반에 잊지 않고 챙겼고, 원본을 보니 자연광과 인물 비율이 기대 이상으로 안정적이었습니다.',
    considerations: '오후에는 창가 세트의 빛이 빠르게 달라집니다. 자연광 컷이 최우선이면 오전 타임을 추천하고, 우천 예보가 있으면 전날 실내 대체 세트와 촬영 순서를 확인해 두는 게 안전합니다.',
    createdAt: '2026-08-10T16:40:00+09:00', authorLabel: '인증 플래너', experienceBand: '경력 3–5년',
  },
  {
    id: 'vi5', vendorId: 'v3', category: '실제 진행 후기', title: '현장 진행 경험 공유', tags: ['실제진행', '플래너정보'], helpfulCount: 14,
    experienceContext: '2026년 3월 촬영 · 반려견 동반 커플의 야외 장면 진행',
    highlights: '반려견 컨디션 때문에 계획한 순서대로 촬영하기 어려웠는데 스태프가 야외 장면을 먼저 당겨 유연하게 대응해줬습니다. 강아지가 카메라를 보는 짧은 순간을 놓치지 않았고, 두 분 위주 컷과 가족 컷 비중도 현장에서 바로 조절해 만족스러웠어요.',
    considerations: '반려동물 동반은 이동장, 보호자 한 명, 간식 준비 여부에 따라 진행 속도 차이가 큽니다. 예약 단계에서 동반 사실을 알리고 전체 촬영 시간을 20분 정도 넉넉히 잡는 것을 권합니다.',
    createdAt: '2026-07-31T10:15:00+09:00', authorLabel: '인증 플래너', experienceBand: '경력 5–10년',
  },
  {
    id: 'vi6', vendorId: 'v4', category: '실제 진행 후기', title: '현장 진행 경험 공유', tags: ['실제진행', '플래너정보'], helpfulCount: 15,
    experienceContext: '2026년 6월 본식 · 평소 화장을 거의 하지 않는 신부 진행',
    highlights: '테스트 때 신부님이 아이라인만 진해져도 낯설어하셨는데, 담당 원장님이 한쪽씩 농도를 달리해 거울과 휴대폰 카메라로 비교하게 해주셨어요. 본식 날에는 울고 난 뒤에도 피부 표현이 무너지지 않았고 혼주 메이크업과 시간 배분도 매끄러웠습니다.',
    considerations: '새벽 첫 타임은 담당자 도착과 헤어 시작 시간이 빠듯할 수 있어 전날 배정표를 다시 받는 편이 좋습니다. 속눈썹이나 음영을 거의 원하지 않는다면 “내추럴”보다 평소 민낯 사진을 보여주는 게 정확해요.',
    createdAt: '2026-08-06T12:10:00+09:00', authorLabel: '인증 플래너', experienceBand: '경력 5–10년',
  },
  {
    id: 'vi26', vendorId: 'v2', category: '업체별 최근 경험', title: '최근 드레스 투어 진행 정보', tags: ['최근경험', '드레스투어'], helpfulCount: 17,
    experienceContext: '2026년 8월 주말 드레스 투어 동행',
    highlights: '오간자와 레이스 후보를 함께 비교하기 좋았고 피팅 뒤 담당자가 소재별 차이를 사진과 함께 정리해 주었습니다.',
    considerations: '주말 마지막 타임은 피팅 가능한 벌 수가 달라질 수 있어 예약 전에 후보 수와 종료 시간을 확인하는 편이 좋습니다.',
    createdAt: '2026-08-14T10:00:00+09:00', authorLabel: '인증 플래너', experienceBand: '경력 3–5년',
  },
]
