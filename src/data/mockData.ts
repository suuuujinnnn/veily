import type {
  ChecklistItem,
  CommunityPost,
  Consultation,
  Contract,
  Couple,
  Payment,
  PortalSettings,
  Recommendation,
  Vendor,
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
  { id: 'e1', coupleId: 'c1', title: '루이즈블랑 드레스 2차 피팅', date: '2026-08-05', time: '10:30', endTime: '12:00', type: '드레스', location: '루이즈블랑, 논현동', travelMinutes: 35 },
  { id: 'e2', coupleId: 'c2', title: '클레브 스튜디오 컨셉 미팅', date: '2026-08-05', time: '14:00', endTime: '15:30', type: '스튜디오', location: '클레브 스튜디오, 성수동', travelMinutes: 42 },
  { id: 'e3', coupleId: 'c4', title: '본식 최종 체크', date: '2026-08-05', time: '17:00', endTime: '18:00', type: '미팅', location: '온라인 미팅' },
  { id: 'e4', coupleId: 'c1', title: '메이크업 테스트', date: '2026-08-08', time: '11:00', endTime: '13:00', type: '메이크업', location: '정샘물 인스피레이션' },
  { id: 'e5', coupleId: 'c3', title: '웨딩홀 투어', date: '2026-08-12', time: '15:00', endTime: '17:00', type: '미팅', location: '빌라드지디 청담' },
  { id: 'e9', coupleId: 'c1', title: '루이즈블랑 드레스 최종 셀렉', date: '2026-08-12', time: '16:00', endTime: '17:30', type: '드레스', location: '루이즈블랑, 논현동' },
  { id: 'e6', coupleId: 'c2', title: '클레브 스튜디오 촬영', date: '2026-08-18', time: '09:00', endTime: '15:00', type: '스튜디오', location: '클레브 스튜디오, 성수동' },
  { id: 'e7', coupleId: 'c1', title: '예물 계약', date: '2026-08-22', time: '13:30', endTime: '15:00', type: '계약', location: '아크레도 청담' },
  { id: 'e8', coupleId: 'c4', title: '본식', date: '2026-09-05', time: '11:30', endTime: '14:30', type: '본식', location: '아펠가모 반포' },
]

export const initialChecklist: ChecklistItem[] = [
  { id: 't1', coupleId: 'c1', title: '예식장 계약금 납부', dueDate: '6월 18일', phase: 'D-121', month: '6월', category: '웨딩홀', completed: true, owner: '함께', isTemplate: true },
  { id: 't2', coupleId: 'c1', title: '스튜디오 촬영 콘셉트 확정', dueDate: '6월 26일', phase: 'D-113', month: '6월', category: '스튜디오', completed: true, owner: '플래너', isTemplate: true },
  { id: 't3', coupleId: 'c1', title: '신랑 예복 1차 가봉', dueDate: '7월 9일', phase: 'D-100', month: '7월', category: '예복·예물', completed: true, owner: '신랑·신부', isTemplate: true },
  { id: 't4', coupleId: 'c1', title: '본식 스냅 업체 확정', dueDate: '7월 16일', phase: 'D-93', month: '7월', category: '본식·기록', completed: true, owner: '함께', isTemplate: true },
  { id: 't5', coupleId: 'c1', title: '본식 드레스 2차 피팅 준비사항 확인', dueDate: '8월 5일', phase: 'D-73', month: '8월', category: '드레스·본식', completed: false, owner: '신랑·신부', isTemplate: true },
  { id: 't6', coupleId: 'c1', title: '본식 스냅 촬영 구성 확정', dueDate: '8월 9일', phase: 'D-69', month: '8월', category: '본식·기록', completed: true, owner: '함께', isTemplate: true },
  { id: 't7', coupleId: 'c1', title: '청첩장 문구 최종 확인', dueDate: '8월 12일', phase: 'D-66', month: '8월', category: '초대·연출', completed: false, owner: '신랑·신부', isTemplate: true },
  { id: 't8', coupleId: 'c1', title: '부케 레퍼런스 전달', dueDate: '8월 16일', phase: 'D-62', month: '8월', category: '초대·연출', completed: false, owner: '플래너', isTemplate: true },
  { id: 't9', coupleId: 'c1', title: '혼인서약서 초안 작성', dueDate: '9월 3일', phase: 'D-44', month: '9월', category: '행정·기타', completed: false, owner: '신랑·신부', isTemplate: true },
  { id: 't10', coupleId: 'c1', title: '예물 수령 및 사이즈 확인', dueDate: '9월 8일', phase: 'D-39', month: '9월', category: '예복·예물', completed: false, owner: '신랑·신부', isTemplate: true },
  { id: 't11', coupleId: 'c1', title: '하객 좌석 배치 1차 정리', dueDate: '9월 17일', phase: 'D-30', month: '9월', category: '초대·연출', completed: false, owner: '함께', isTemplate: true },
  { id: 't12', coupleId: 'c1', title: '본식 메이크업 최종 시안 확인', dueDate: '10월 2일', phase: 'D-15', month: '10월', category: '메이크업', completed: false, owner: '플래너', isTemplate: true },
  { id: 't13', coupleId: 'c1', title: '식순 및 음원 최종 제출', dueDate: '10월 7일', phase: 'D-10', month: '10월', category: '초대·연출', completed: false, owner: '함께', isTemplate: true },
  { id: 't14', coupleId: 'c1', title: '혼인신고 준비 서류 확인', dueDate: '10월 12일', phase: 'D-5', month: '10월', category: '행정·기타', completed: false, owner: '신랑·신부', isTemplate: true },
  { id: 't15', coupleId: 'c2', title: '스튜디오 의상 리스트 공유', dueDate: '8월 7일', phase: 'D-127', month: '8월', category: '스튜디오', completed: false, owner: '플래너', isTemplate: true },
  { id: 't16', coupleId: 'c3', title: '웨딩홀 투어 동선 확정', dueDate: '8월 10일', phase: 'D-194', month: '8월', category: '웨딩홀', completed: true, owner: '함께', isTemplate: true },
  { id: 't17', coupleId: 'c1', title: '촬영 드레스 3벌·액세서리 셀렉', dueDate: '7월 2일', phase: 'D-107', month: '7월', category: '드레스·촬영', completed: true, owner: '함께', isTemplate: true },
  { id: 't18', coupleId: 'c1', title: '스튜디오 원본 셀렉 및 보정 요청', dueDate: '8월 28일', phase: 'D-50', month: '8월', category: '스튜디오', completed: false, owner: '함께', isTemplate: true },
  { id: 't19', coupleId: 'c1', title: '본식 드레스 최종 가봉·베일 확정', dueDate: '9월 24일', phase: 'D-23', month: '9월', category: '드레스·본식', completed: false, owner: '신랑·신부', isTemplate: true },
  { id: 't20', coupleId: 'c1', title: '메이크업 테스트 결과·헤어 변형안 정리', dueDate: '8월 30일', phase: 'D-48', month: '8월', category: '메이크업', completed: false, owner: '플래너', isTemplate: true },
  { id: 't21', coupleId: 'c1', title: '본식 영상 BGM·인터뷰 구성 확정', dueDate: '9월 20일', phase: 'D-27', month: '9월', category: '본식·기록', completed: false, owner: '함께', isTemplate: true },
]

export const vendors: Vendor[] = [
  ...vendorStyleProfiles.map((profile) => profile.vendor),
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
  { id: 'r1', coupleId: 'c1', vendorId: 'vp-d4', status: 'liked' },
  { id: 'r2', coupleId: 'c1', vendorId: 'vp-s1', status: 'pending' },
  { id: 'r3', coupleId: 'c1', vendorId: 'vp-m3', status: 'hold' },
  { id: 'r4', coupleId: 'c2', vendorId: 'vp-d1', status: 'pending' },
  { id: 'r5', coupleId: 'c2', vendorId: 'vp-s4', status: 'liked' },
  { id: 'r6', coupleId: 'c2', vendorId: 'vp-m2', status: 'pending' },
  { id: 'r7', coupleId: 'c3', vendorId: 'vp-d5', status: 'hold' },
  { id: 'r8', coupleId: 'c3', vendorId: 'vp-s3', status: 'pending' },
  { id: 'r9', coupleId: 'c3', vendorId: 'vp-m5', status: 'liked' },
  { id: 'r10', coupleId: 'c4', vendorId: 'vp-d3', status: 'liked' },
  { id: 'r11', coupleId: 'c4', vendorId: 'vp-s2', status: 'pending' },
  { id: 'r12', coupleId: 'c4', vendorId: 'vp-m1', status: 'pending' },
]

export const contracts: Contract[] = [
  { id: 'ct1', coupleId: 'c1', vendorName: '남산 라루체', category: '웨딩홀', contractDate: '2026-04-20', productName: '가든홀 본식', packageDetails: '보증인원 250명 · 식대 · 생화 장식', paymentMethod: '카드', vatType: '포함', totalPrice: 18500000, commission: 740000, deposit: 3000000, paymentDate: '2026-04-20', status: '서명완료', contractFile: '라루체_계약서.pdf', memo: '잔금은 본식 14일 전 납부' },
  { id: 'ct2', coupleId: 'c1', vendorId: 'vp-d5', vendorName: '루이즈블랑', category: '드레스', contractDate: '2026-05-03', productName: '촬영·본식 드레스 패키지', packageDetails: '본식 1벌 · 촬영 3벌 · 2차 피팅', paymentMethod: '계좌이체', vatType: '별도', totalPrice: 3200000, commission: 320000, deposit: 800000, paymentDate: '2026-05-03', status: '확인필요', contractFile: '루이즈블랑_계약서.pdf', memo: 'VAT 별도 확인 필요' },
  { id: 'ct3', coupleId: 'c2', vendorId: 'vp-s1', vendorName: '클레브 스튜디오', category: '스튜디오', contractDate: '2026-07-02', productName: '스튜디오 촬영 패키지', packageDetails: '원본 전체 · 수정본 20P · 앨범 2권', paymentMethod: '카드', vatType: '포함', totalPrice: 2150000, commission: 215000, deposit: 500000, paymentDate: '2026-07-02', status: '결제대기', contractFile: '', memo: '촬영일 잔금 결제' },
  { id: 'ct4', coupleId: 'c4', vendorName: '아펠가모 반포', category: '웨딩홀', contractDate: '2026-03-05', productName: '채플홀 본식', packageDetails: '보증인원 280명 · 채플홀 · 생화 장식', paymentMethod: '현금', vatType: '포함', totalPrice: 21800000, commission: 872000, deposit: 4000000, paymentDate: '2026-03-05', status: '서명완료', contractFile: '아펠가모_계약서.pdf', memo: '최종 인원 D-14 확정' },
]

export const initialPayments: Payment[] = [
  { id: 'pay1', coupleId: 'c1', paymentDate: '2026-04-20', type: '계약금', account: '남산 라루체', amount: 3000000, status: '입금완료', memo: '웨딩홀 계약금' },
  { id: 'pay2', coupleId: 'c1', paymentDate: '2026-05-03', type: '계약금', account: '루이즈블랑', amount: 800000, status: '입금완료', memo: '드레스 계약금' },
  { id: 'pay3', coupleId: 'c1', paymentDate: '2026-09-25', type: '잔금', account: '남산 라루체', amount: 15500000, status: '입금예정', memo: '본식 3주 전 안내' },
  { id: 'pay4', coupleId: 'c2', paymentDate: '2026-07-02', type: '계약금', account: '클레브 스튜디오', amount: 500000, status: '입금완료', memo: '' },
]

export const initialConsultations: Consultation[] = [
  { id: 'con1', coupleId: 'c1', date: '2026-08-01T19:00', originalText: '본식 드레스는 미카도 실크 위주로 다시 보고 싶어요. 예물 수령일도 확인 부탁드려요.', requests: ['실크 드레스 후보 재정리', '예물 수령일 확인'], decisions: ['2차 피팅에 플래너 동행'], nextActions: ['르블랑에 피팅 가능 시간 문의', '예물 업체 일정 확인'] },
  { id: 'con2', coupleId: 'c2', date: '2026-07-28T20:00', originalText: '스튜디오 촬영 때 야외 컷 비중을 늘리고 싶습니다.', requests: ['야외 컷 비중 확대'], decisions: ['오전 촬영 유지'], nextActions: ['우천 시 대체 세트 확인'] },
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
