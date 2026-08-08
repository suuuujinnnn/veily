import type {
  ChecklistItem,
  CommunityPost,
  Contract,
  Couple,
  Recommendation,
  Vendor,
  VendorScheduleSlot,
  VendorSelection,
  WeddingEvent,
} from '../types'
import { imageAssets } from '../assets/images'
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
  },
]

export const initialEvents: WeddingEvent[] = [
  { id: 'e1', coupleId: 'c1', title: '아틀리에 드레스 2차 피팅', date: '2026-08-05', time: '10:30', endTime: '12:00', type: '드레스', location: '르블랑 브라이드, 청담', travelMinutes: 35 },
  { id: 'e2', coupleId: 'c2', title: '스튜디오 컨셉 미팅', date: '2026-08-05', time: '14:00', endTime: '15:30', type: '스튜디오', location: '오브제 스튜디오, 성수', travelMinutes: 42 },
  { id: 'e3', coupleId: 'c4', title: '본식 최종 체크', date: '2026-08-05', time: '17:00', endTime: '18:00', type: '미팅', location: '온라인 미팅' },
  { id: 'e4', coupleId: 'c1', title: '메이크업 테스트', date: '2026-08-08', time: '11:00', endTime: '13:00', type: '메이크업', location: '정샘물 인스피레이션' },
  { id: 'e5', coupleId: 'c3', title: '웨딩홀 투어', date: '2026-08-12', time: '15:00', endTime: '17:00', type: '미팅', location: '빌라드지디 청담' },
  { id: 'e9', coupleId: 'c1', title: '드레스 최종 셀렉', date: '2026-08-12', time: '16:00', endTime: '17:30', type: '드레스', location: '르블랑 브라이드, 청담' },
  { id: 'e6', coupleId: 'c2', title: '스튜디오 촬영', date: '2026-08-18', time: '09:00', endTime: '15:00', type: '스튜디오', location: '오브제 스튜디오' },
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
  { id: 'v1', name: '르블랑 브라이드', category: '드레스', summary: '구조적인 실크 라인과 섬세한 드레이핑이 강점인 청담 아틀리에', tags: ['미카도 실크', '미니멀', '클래식'], priceRange: '280–420만원', match: 96, image: imageAssets.vendorDressGallery, location: '청담동', address: '서울 강남구 도산대로 89길 18, 3F', hours: '화–일 10:00–19:00', phone: '02-541-2088', instagram: '@leblanc_bride', activeEvent: '8월 SILK FITTING WEEK · 피팅비 50% 지원', gallery: [imageAssets.vendorDressGallery, imageAssets.vendorStudioGallery, imageAssets.vendorMakeupGallery] },
  { id: 'v2', name: '메종 드 누아', category: '드레스', summary: '과하지 않은 볼륨감과 프렌치 무드의 독창적인 컬렉션', tags: ['프렌치', '러블리', '오간자'], priceRange: '240–380만원', match: 91, image: imageAssets.atelierDress, location: '신사동', imagePosition: '35% 58%', address: '서울 강남구 압구정로 12길 28', hours: '화–일 10:30–19:30', phone: '02-512-3321', instagram: '@maison_de_noir', activeEvent: 'NEW COLLECTION 프리뷰 예약 오픈', gallery: [imageAssets.vendorDressGallery, imageAssets.atelierDress, imageAssets.vendorMakeupGallery] },
  { id: 'v3', name: '오브제 스튜디오', category: '스튜디오', summary: '자연광과 정돈된 건축미를 담는 감각적인 인물 중심 스튜디오', tags: ['자연광', '인물중심', '내추럴'], priceRange: '190–260만원', match: 88, image: imageAssets.vendorStudioGallery, location: '성수동', imagePosition: '50% 40%', address: '서울 성동구 연무장길 42, B1', hours: '매일 09:00–20:00', phone: '02-467-9012', instagram: '@objet_wedding', activeEvent: '평일 오전 자연광 촬영 업그레이드', gallery: [imageAssets.vendorStudioGallery, imageAssets.weddingGarden, imageAssets.vendorDressGallery] },
  { id: 'v4', name: '무드 앤 결', category: '메이크업', summary: '본연의 결을 살린 투명한 피부 표현과 절제된 음영 메이크업', tags: ['투명피부', '내추럴', '음영'], priceRange: '110–170만원', match: 84, image: imageAssets.vendorMakeupGallery, location: '청담동', imagePosition: '50% 35%', address: '서울 강남구 선릉로 152길 22', hours: '화–일 05:00–18:00', phone: '02-3446-1004', instagram: '@mood_and_gyeol', activeEvent: '9월 본식 얼리타임 헤어피스 증정', gallery: [imageAssets.vendorMakeupGallery, imageAssets.vendorDressGallery, imageAssets.vendorStudioGallery] },
  ...vendorStyleProfiles.map((profile) => profile.vendor),
]

export const vendorScheduleSlots: VendorScheduleSlot[] = [
  { id: 'vs1', vendorId: 'v1', date: '2026-08-09', time: '11:00', status: 'booked' },
  { id: 'vs2', vendorId: 'v1', date: '2026-08-12', time: '14:00', status: 'booked' },
  { id: 'vs3', vendorId: 'v1', date: '2026-08-14', time: '16:30', status: 'available' },
  { id: 'vs4', vendorId: 'v1', date: '2026-08-21', time: '11:00', status: 'available' },
  { id: 'vs5', vendorId: 'v1', date: '2026-08-25', time: '15:00', status: 'booked' },
  { id: 'vs6', vendorId: 'v1', date: '2026-08-28', time: '13:30', status: 'available' },
  { id: 'vs7', vendorId: 'v1', date: '2026-09-02', time: '10:30', status: 'available' },
  { id: 'vs8', vendorId: 'v1', date: '2026-09-05', time: '14:00', status: 'booked' },
  { id: 'vs9', vendorId: 'v1', date: '2026-09-11', time: '16:00', status: 'available' },
  { id: 'vs10', vendorId: 'v1', date: '2026-09-18', time: '11:30', status: 'booked' },
  { id: 'vs11', vendorId: 'v1', date: '2026-09-24', time: '14:30', status: 'available' },
  { id: 'vs12', vendorId: 'v1', date: '2026-10-01', time: '13:00', status: 'booked' },
  { id: 'vs13', vendorId: 'v1', date: '2026-10-06', time: '10:30', status: 'available' },
  { id: 'vs14', vendorId: 'v1', date: '2026-10-10', time: '15:30', status: 'booked' },
  { id: 'vs15', vendorId: 'v1', date: '2026-10-13', time: '11:00', status: 'available' },
  { id: 'vs16', vendorId: 'v1', date: '2026-08-18', time: '10:00', status: 'available' },
  { id: 'vs17', vendorId: 'v1', date: '2026-08-18', time: '15:30', status: 'booked' },
  { id: 'vs18', vendorId: 'v1', date: '2026-08-19', time: '11:30', status: 'available' },
  { id: 'vs19', vendorId: 'v1', date: '2026-08-20', time: '14:00', status: 'booked' },
  { id: 'vs20', vendorId: 'v1', date: '2026-08-22', time: '10:30', status: 'available' },
]

export const initialVendorSelections: VendorSelection[] = [
  { coupleId: 'c1', vendorId: 'v1', slotId: 'vs4' },
]

export const initialRecommendations: Recommendation[] = [
  { id: 'r1', coupleId: 'c1', vendorId: 'v1', status: 'liked' },
  { id: 'r2', coupleId: 'c1', vendorId: 'v2', status: 'pending' },
  { id: 'r3', coupleId: 'c1', vendorId: 'v3', status: 'hold' },
]

export const contracts: Contract[] = [
  { id: 'ct1', coupleId: 'c1', vendorName: '남산 라루체', category: '웨딩홀', amount: '18,500,000원', payment: '카드', vatIncluded: true, status: '서명완료', details: '보증인원 250명 · 식대 82,000원 · 가든홀' },
  { id: 'ct2', coupleId: 'c1', vendorName: '르블랑 브라이드', category: '드레스', amount: '3,200,000원', payment: '계좌이체', vatIncluded: false, status: '확인필요', details: '본식 1벌 · 촬영 3벌 · 2차 피팅 포함' },
  { id: 'ct3', coupleId: 'c2', vendorName: '오브제 스튜디오', category: '스튜디오', amount: '2,150,000원', payment: '카드', vatIncluded: true, status: '결제대기', details: '원본 전체 · 수정본 20P · 앨범 2권' },
  { id: 'ct4', coupleId: 'c4', vendorName: '아펠가모 반포', category: '웨딩홀', amount: '21,800,000원', payment: '현금', vatIncluded: true, status: '서명완료', details: '보증인원 280명 · 채플홀 · 생화 장식' },
]

export const communityPosts: CommunityPost[] = [
  { id: 'p1', category: '업체 후기', title: '르블랑 브라이드 김○○ 실장님과 진행해보신 분?', excerpt: '다음 달 투어 예정인데 피팅 진행 스타일과 응대가 어떤지 궁금해요.', author: '익명 플래너 28', time: '18분 전', replies: 12, helpful: 24, verified: true, tags: ['드레스', '청담'] },
  { id: 'p2', category: '정보 공유', title: '8월 스튜디오 촬영 시 꼭 챙길 체크리스트 공유해요', excerpt: '장마 이후라 습도와 야외 컷 변수를 고려해서 정리했습니다.', author: '익명 플래너 07', time: '1시간 전', replies: 8, helpful: 41, verified: true, tags: ['스튜디오', '체크리스트'] },
  { id: 'p3', category: '질문', title: '호텔 예식 플라워 추가 견적, 어느 정도가 적정선일까요?', excerpt: '기본 생화에서 버진로드 장식을 추가하려고 하는데 최근 시세 부탁드려요.', author: '익명 플래너 19', time: '3시간 전', replies: 17, helpful: 15, verified: true, tags: ['웨딩홀', '견적'] },
  { id: 'p4', category: '업체 후기', title: '오브제 스튜디오 리뉴얼 후 첫 촬영 후기', excerpt: '자연광 세트가 훨씬 좋아졌고 작가님 디렉팅도 꼼꼼했습니다.', author: '익명 플래너 41', time: '어제', replies: 6, helpful: 32, verified: true, tags: ['스튜디오', '성수'] },
]
