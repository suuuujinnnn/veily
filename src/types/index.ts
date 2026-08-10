export type EventType = '미팅' | '드레스' | '스튜디오' | '메이크업' | '계약' | '본식'

export type TravelMode = 'bus' | 'subway' | 'car'
export type VendorCategory = '드레스' | '메이크업' | '스튜디오' | '웨딩홀' | '예물' | '기타'
export type AnalyzedVendorCategory = Extract<VendorCategory, '드레스' | '메이크업' | '스튜디오'>

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
  brideName: string
  groomName: string
  bridePhone: string
  groomPhone: string
  brideEmail: string
  groomEmail: string
  address: string
  contractType: string
  contractDate: string
  ceremonyDate: string
  ceremonyPlace: string
  note: string
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
  workflowType?: string
  durationMinutes?: number
  travelMode?: TravelMode
  memo?: string
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
  category: ChecklistCategory
  completed: boolean
  owner: '플래너' | '신랑·신부' | '함께'
  isTemplate?: boolean
  templateId?: string
}

export interface WeddingWorkflowTemplate {
  id: string
  title: string
  category: ChecklistCategory
  offsetDays: number
  defaultOwner: ChecklistItem['owner']
  summary: string
  checkpoints: string[]
  optional: boolean
}

export type BudgetCategory =
  | '웨딩홀·식대'
  | '스튜디오·드레스·메이크업'
  | '본식·기록'
  | '예복·예물'
  | '초대·하객'
  | '연출·플라워'
  | '혼주·교통'
  | '허니문·행정'
  | '기타'

export interface BudgetPlan {
  coupleId: string
  targetAmount: number
}

export interface BudgetItem {
  id: string
  coupleId: string
  category: BudgetCategory
  title: string
  plannedAmount: number
  memo: string
}

export interface Vendor {
  id: string
  name: string
  category: VendorCategory
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
  website?: string
  lastContact?: string
  memo?: string
  evidenceSource?: 'analyzed' | 'tag'
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
  vendorId?: string
  category: string
  contractDate: string
  productName: string
  packageDetails: string
  paymentMethod: '카드' | '현금' | '계좌이체'
  vatType: '포함' | '별도' | '면세'
  totalPrice: number
  commission: number
  deposit: number
  paymentDate: string
  status: '서명완료' | '확인필요' | '결제대기' | '계약진행'
  contractFile: string
  memo: string
  budgetItemId?: string
}

export interface Consultation {
  id: string
  coupleId: string
  date: string
  originalText: string
  requests: string[]
  decisions: string[]
  nextActions: string[]
}

export interface Payment {
  id: string
  coupleId: string
  paymentDate: string
  type: '계약금' | '중도금' | '잔금' | '환불' | '기타'
  account: string
  amount: number
  status: '입금완료' | '입금예정' | '확인필요'
  memo: string
}

export interface PortalSettings {
  coupleId: string
  showSchedule: boolean
  showFullEstimate: boolean
  receiveMessages: boolean
  showChecklist: boolean
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
