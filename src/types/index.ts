export type EventType = '미팅' | '드레스' | '스튜디오' | '메이크업' | '계약' | '본식'
export type EventApprovalStatus = 'planner-proposed' | 'client-ok' | 'confirmed'
export type ScheduleVisibility = 'couple-shared' | 'planner-private'

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
  brideOccupation: string
  groomOccupation: string
  address: string
  acquisitionChannel: string
  referrerName: string
  preferredContactMethod: '카카오톡' | '문자' | '전화' | '이메일'
  preferredContactTime: string
  contractType: string
  contractDate: string
  ceremonyDate: string
  ceremonyPlace: string
  note: string
}

export interface WeddingEvent {
  id: string
  coupleId?: string
  vendorId?: string
  title: string
  date: string
  time: string
  endTime: string
  type: EventType
  location: string
  workflowType?: string
  durationMinutes?: number
  memo?: string
  approvalStatus?: EventApprovalStatus
  visibility: ScheduleVisibility
  reminderOffsets?: number[]
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
  kind: 'preparation' | 'decision'
  status: 'pending' | 'in-progress' | 'completed'
  owner: '플래너' | '신랑·신부' | '함께'
}

export interface CustomerMessageAttachment {
  id: string
  type: 'image' | 'file' | 'link'
  name: string
  url: string
  size?: number
}

export interface CustomerMessage {
  id: string
  coupleId: string
  category: '레퍼런스' | '업체 문의' | '일정' | '계약·견적' | '기타'
  originalText: string
  createdAt: string
  updatedAt: string
  sender: 'customer' | 'planner'
  answerStatus?: 'unanswered' | 'answered'
  readByPlannerAt?: string
  readByCustomerAt?: string
  attachments: CustomerMessageAttachment[]
}

/** @deprecated Use CustomerMessage. Kept as a compatibility alias for mock data imports. */
export type CustomerRequest = CustomerMessage

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
  updatedAt: string
  memo?: string
  evidenceSource?: 'analyzed' | 'tag'
  operationalDetails?: VendorOperationalDetails
}

export interface VerifiedFact<T> {
  value: T
  verifiedAt: string
}

export interface StudioVendorOperationalDetails {
  kind: 'studio'
  bouquetProvided: VerifiedFact<boolean>
  propsProvided: VerifiedFact<boolean>
  veilProvided: VerifiedFact<boolean>
  backgrounds: VerifiedFact<string[]>
  outdoorShooting: VerifiedFact<boolean>
  parking: VerifiedFact<boolean>
  elevator: VerifiedFact<boolean>
  shootingDuration: VerifiedFact<string>
  extensionAvailable: VerifiedFact<boolean>
  surchargeConditions: VerifiedFact<string>
}

export interface DressVendorOperationalDetails {
  kind: 'dress'
  fittingFee: VerifiedFact<string>
  fittingCount: VerifiedFact<number>
  shootingAvailable: VerifiedFact<boolean>
  surchargeConditions: VerifiedFact<string>
  parking: VerifiedFact<boolean>
}

export interface MakeupVendorOperationalDetails {
  kind: 'makeup'
  earlyStartFee: VerifiedFact<string>
  directorRequestAvailable: VerifiedFact<boolean>
  hairpieces: VerifiedFact<string>
  parentMakeup: VerifiedFact<string>
  parking: VerifiedFact<boolean>
}

export type VendorOperationalDetails = StudioVendorOperationalDetails | DressVendorOperationalDetails | MakeupVendorOperationalDetails

export type VendorInsightCategory = '업체별 최근 경험' | '담당자 성향' | '담당자 이직·퇴사' | '업체 변경사항' | '실제 진행 후기' | '업체별 유의사항'

export interface VendorInsight {
  id: string
  vendorId: string
  category: VendorInsightCategory
  title: string
  experienceContext: string
  staffName?: string
  highlights: string
  considerations: string
  tags: string[]
  createdAt: string
  helpfulCount: number
  authorLabel: '인증 플래너'
  experienceBand: string
}

export interface VendorCatalogGroup {
  id: string
  name: string
  vendorIds: string[]
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

export type RecommendationStatus = 'pending' | 'liked' | 'confirmed' | 'hold'

export interface Recommendation {
  id: string
  coupleId: string
  vendorId: string
  status: RecommendationStatus
  proposedAt: string
  selectionDeadline: string
  sourceReferenceId?: string
}

export interface PortalOnboardingState {
  coupleId: string
  completedAt: string
  skippedSteps: Array<'profile' | 'taste' | 'budget'>
}

export interface OrderReminder {
  id: string
  coupleId: string
  vendorId?: string
  title: string
  orderDate: string
  reminderDate: string
  status: 'pending' | 'completed'
  completedAt?: string
  memo: string
}

export type ReferenceCategory = '드레스' | '헤어' | '메이크업' | '스튜디오' | '웨딩홀'
export type ReferenceSource = '검수 아카이브' | '플래너 업로드' | '고객 업로드'

export type VenueRegionGroup = '서울' | '경기·인천'
export type VenueMealType = '뷔페' | '한식' | '양식' | '기타'
export type VenueType =
  | '일반·컨벤션예식장(어두운 홀)'
  | '호텔예식'
  | '채플홀'
  | '하우스웨딩(밝은 홀)'
  | '스몰웨딩(100명 이하)'
  | '야외웨딩'
  | '한옥웨딩'
export type VenueWish = '밝은 홀' | '어두운 홀' | '높은 천고' | '원형 테이블' | '화려한 꽃 장식' | '단독홀' | '단독건물'
export type VenueAccessKind = '지하철역' | '기차역' | '터미널'
export type VenueAccessOption = '도보 10분 이내' | '셔틀 운행' | '대형 주차'
export type VenueMealPriceRange = '7만원 이하' | '7~8만원' | '8~9만원' | '9만원 이상'

export interface VenueAccessPoint {
  id: string
  name: string
  kind: VenueAccessKind
  mode: '도보' | '차량' | '셔틀'
  minutes: number
  tagLabel: string
}

export interface WeddingVenue {
  id: string
  vendorId: string
  name: string
  regionGroup: VenueRegionGroup
  locality: string
  address: string
  mealTypes: VenueMealType[]
  mealDetail: string
  mealPrice: number
  venueType: VenueType
  wishes: VenueWish[]
  accessPoints: VenueAccessPoint[]
  accessOptions: VenueAccessOption[]
  shuttleNote: string
  parkingNote: string
  summary: string
  referenceImageIds: string[]
}

export interface VenueFilterState {
  regionGroup: VenueRegionGroup | ''
  localities: string[]
  accessKinds: VenueAccessKind[]
  accessPointIds: string[]
  accessOptions: VenueAccessOption[]
  mealTypes: VenueMealType[]
  mealPriceRanges: VenueMealPriceRange[]
  venueTypes: VenueType[]
  wishes: VenueWish[]
  query: string
}

export interface WeddingReference {
  id: string
  category: ReferenceCategory
  image: string
  vendorId?: string
  venueId?: string
  vendorName: string
  account: string
  tags: string[]
  purpose: string
  source: ReferenceSource
  reviewStatus: '검수완료' | '확인필요'
  imagePosition?: string
}

export interface ReferenceBoardItem {
  referenceId: string
  comment: string
}

export interface ReferenceBoard {
  id: string
  coupleId: string
  title: string
  memo: string
  items: ReferenceBoardItem[]
  status: '작성 중' | '공유됨'
  updatedAt: string
}

export interface CustomerReferenceSelection {
  referenceId: string
  note: string
}

export interface CustomerReferenceSubmission {
  id: string
  coupleId: string
  selections: CustomerReferenceSelection[]
  preferredTags: string[]
  categoryCounts: Partial<Record<ReferenceCategory, number>>
  submittedAt: string
  status: '작성 중' | '전송완료' | '재전송됨'
}

export type ReminderKind = 'selection-deadline' | 'confirmed-schedule' | 'task-deadline' | 'vendor-stale'

export interface ReminderItem {
  id: string
  kind: ReminderKind
  audience: 'planner' | 'client'
  sourceId: string
  coupleId?: string
  title: string
  message: string
  dueAt: string
  urgency: 'normal' | 'soon' | 'overdue'
  href: string
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
  messagingEnabled: boolean
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
  vendorId?: string
}
