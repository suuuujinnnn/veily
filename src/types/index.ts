export type EventType = '미팅' | '드레스' | '스튜디오' | '메이크업' | '계약' | '본식'

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
}

export type ChecklistCategory = '베뉴' | '스드메' | '예복·예물' | '초대·연출' | '행정·기타'

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

export interface Recommendation {
  id: string
  coupleId: string
  vendorId: string
  status: RecommendationStatus
}

export interface Contract {
  id: string
  coupleId: string
  vendorName: string
  category: string
  amount: string
  payment: '카드' | '현금' | '계좌이체'
  vatIncluded: boolean
  status: '서명완료' | '확인필요' | '결제대기'
  details: string
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
