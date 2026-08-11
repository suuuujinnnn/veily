export type EventType = '상담' | '스튜디오' | '드레스' | '메이크업' | '예물' | '기타' | '직접 입력' | '미팅' | '계약' | '본식'

export interface Couple {
  id: string
  partners: string
  initials: string
  weddingDate: string
  venue: string
  progress: number
  status: '준비중' | '집중관리' | '확정'
  concept: string
  tone: 'rose' | 'sage' | 'sand'
}

export type EventApprovalStatus = 'planner-proposed' | 'client-ok' | 'confirmed'

export interface WeddingEvent {
  id: string
  coupleId: string
  title: string
  date: string
  time: string
  endTime: string
  type: EventType
  location: string
  travelMinutes?: number
  approvalStatus?: EventApprovalStatus
}

export type ChecklistCategory =
  | '웨딩홀'
  | '스튜디오'
  | '드레스·촬영'
  | '드레스·본식'
  | '메이크업'
  | '본식·기록'
  | '예복·예물'
  | '초대·연출'
  | '행정·기타'

export interface ChecklistItem {
  id: string
  coupleId: string
  title: string
  dueDate: string
  phase: string
  month: string
  category: ChecklistCategory
  completed: boolean
  owner: '플래너' | '신랑·신부' | '함께'
  isTemplate?: boolean
}

export interface Vendor {
  id: string
  name: string
  category: '드레스' | '스튜디오' | '메이크업'
  summary: string
  tags: string[]
  priceRange: string
  match: number
  image: string
  location: string
  imagePosition?: string
  address: string
  hours: string
  phone: string
  instagram: string
  activeEvent: string
  gallery: string[]
}

export interface VendorScheduleSlot {
  id: string
  vendorId: string
  date: string
  time: string
  status: 'available' | 'booked'
}

export interface VendorSelection {
  coupleId: string
  vendorId: string
  slotId: string
}

export type RecommendationStatus = 'pending' | 'liked' | 'hold'

export type VendorCategory = '스드메' | '스튜디오' | '드레스' | '메이크업' | '예물' | '예식장' | '웨딩홀' | '혼수' | '기타'

export interface Recommendation {
  id: string
  coupleId: string
  vendorId: string
  status: RecommendationStatus
}

export interface ConsultationCard {
  id: string
  coupleId: string
  preferredDate: string
  shootDate: string
  coupleNames: string
  phone: string
  existingVendors: string
  studioDirection: string
  studioMood: string
  dressMood: string
  sizes: string
  makeupMood: string
  budget: string
  otherPlanner: string
  extraPlanning: string
  hallDetails: string
  meetingDetails: string
  contactPreference: string
  priorities: string
  notes: string
  source: '플래너 입력' | '고객 작성'
  createdAt: string
}

export interface Contract {
  id: string
  coupleId: string
  vendorName: string
  category: VendorCategory
  item?: string
  contractDate?: string
  contractFileName?: string
  productName?: string
  amount: string
  depositAmount?: string
  commission?: string
  payment: '미입력' | '카드' | '현금' | '계좌이체'
  vatIncluded: boolean
  status: '서명완료' | '확인필요' | '결제대기' | '대기' | '완료'
  details: string
  commissionInfo?: string
  memo?: string
  depositDate?: string
  depositType?: '입금' | '출금'
  depositAccount?: string
  depositNote?: string
  depositStatus?: '대기' | '완료'
}

export interface CommunityPost {
  id: string
  category: string
  title: string
  excerpt: string
  author: string
  time: string
  replies: number
  helpful: number
  verified: boolean
  tags: string[]
}
