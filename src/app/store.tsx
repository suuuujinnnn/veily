import { createContext, type PropsWithChildren, useContext, useMemo, useReducer } from 'react'
import {
  contracts as initialContracts,
  couples as initialCouples,
  initialBudgetItems,
  initialBudgetPlans,
  initialChecklist,
  initialConsultationCards,
  initialConsultations,
  initialEvents,
  initialOrderApprovals,
  initialOrderReminders,
  initialPayments,
  initialPortalSettings,
  initialRecommendations,
  initialVendorInsights,
  initialVendorSelections,
  vendors as initialVendors,
} from '../data/mockData'
import { initialReferenceBoards } from '../data/weddingReferenceData'
import { initialCustomerRequests } from '../data/customerRequestData'
import type {
  BudgetItem,
  BudgetPlan,
  ChecklistItem,
  Consultation,
  ConsultationCard,
  Contract,
  Couple,
  OrderApproval,
  OrderReminder,
  OrderRejectionReason,
  Payment,
  PortalSettings,
  PortalOnboardingState,
  Recommendation,
  RecommendationStatus,
  Vendor,
  VendorCatalogGroup,
  VendorInsight,
  VendorSelection,
  WeddingEvent,
  ReferenceBoard,
  WeddingReference,
  CustomerReferenceSubmission,
  CustomerRequest,
  CustomerRequestStatus,
} from '../types'

export interface DemoState {
  couples: Couple[]
  events: WeddingEvent[]
  checklist: ChecklistItem[]
  vendors: Vendor[]
  recommendations: Recommendation[]
  contracts: Contract[]
  payments: Payment[]
  budgetPlans: BudgetPlan[]
  budgetItems: BudgetItem[]
  consultations: Consultation[]
  consultationCards: ConsultationCard[]
  portalSettings: PortalSettings[]
  availability: Record<string, string[]>
  vendorSelections: VendorSelection[]
  vendorInsights: VendorInsight[]
  orderApprovals: OrderApproval[]
  orderReminders: OrderReminder[]
  portalOnboardingStates: PortalOnboardingState[]
  favoriteVendorIds: string[]
  vendorCatalogGroups: VendorCatalogGroup[]
  referenceBoards: ReferenceBoard[]
  uploadedReferences: WeddingReference[]
  customerReferenceSubmissions: CustomerReferenceSubmission[]
  customerRequests: CustomerRequest[]
}

export type DemoAction =
  | { type: 'ADD_EVENT'; payload: WeddingEvent }
  | { type: 'UPDATE_EVENT'; payload: WeddingEvent }
  | { type: 'DELETE_EVENT'; payload: string }
  | { type: 'UPDATE_COUPLE'; payload: Couple }
  | { type: 'TOGGLE_CHECKLIST'; payload: string }
  | { type: 'ADD_CHECKLIST'; payload: ChecklistItem }
  | { type: 'UPDATE_CHECKLIST'; payload: ChecklistItem }
  | { type: 'DELETE_CHECKLIST'; payload: string }
  | { type: 'ADD_CONSULTATION'; payload: Consultation }
  | { type: 'SAVE_CONSULTATION_CARD'; payload: ConsultationCard }
  | { type: 'ADD_CONTRACT'; payload: Contract }
  | { type: 'UPDATE_CONTRACT'; payload: Contract }
  | { type: 'DELETE_CONTRACT'; payload: string }
  | { type: 'ADD_PAYMENT'; payload: Payment }
  | { type: 'UPDATE_PAYMENT'; payload: Payment }
  | { type: 'DELETE_PAYMENT'; payload: string }
  | { type: 'UPDATE_BUDGET_PLAN'; payload: BudgetPlan }
  | { type: 'ADD_BUDGET_ITEM'; payload: BudgetItem }
  | { type: 'UPDATE_BUDGET_ITEM'; payload: BudgetItem }
  | { type: 'DELETE_BUDGET_ITEM'; payload: string }
  | { type: 'ADD_VENDOR'; payload: Vendor }
  | { type: 'UPDATE_VENDOR'; payload: Vendor }
  | { type: 'TOGGLE_FAVORITE_VENDOR'; payload: string }
  | { type: 'ADD_VENDOR_CATALOG_GROUP'; payload: VendorCatalogGroup }
  | { type: 'RENAME_VENDOR_CATALOG_GROUP'; payload: { id: string; name: string } }
  | { type: 'TOGGLE_VENDOR_CATALOG_ITEM'; payload: { groupId: string; vendorId: string } }
  | { type: 'UPDATE_PORTAL_SETTINGS'; payload: PortalSettings }
  | { type: 'SET_RECOMMENDATION'; payload: { coupleId: string; vendorId: string; status: RecommendationStatus } }
  | { type: 'SEND_RECOMMENDATION'; payload: { coupleId: string; vendorId: string; sourceReferenceId?: string } }
  | { type: 'REMOVE_RECOMMENDATION'; payload: { coupleId: string; vendorId: string } }
  | { type: 'TOGGLE_AVAILABILITY'; payload: { eventId: string; slot: string } }
  | { type: 'SELECT_VENDOR_SLOT'; payload: VendorSelection }
  | { type: 'ADD_VENDOR_INSIGHT'; payload: VendorInsight }
  | { type: 'REQUEST_ORDER_APPROVAL'; payload: OrderApproval }
  | { type: 'UPDATE_ORDER_APPROVAL'; payload: OrderApproval }
  | { type: 'APPROVE_ORDER'; payload: { id: string; confirmedAt: string; respondedAt: string } }
  | { type: 'REJECT_ORDER'; payload: { id: string; reason: OrderRejectionReason; respondedAt: string } }
  | { type: 'RETRY_ORDER'; payload: { id: string; requestedAt: string; approvalDeadline: string; viewedAt: string } }
  | { type: 'SAVE_REFERENCE_BOARD'; payload: ReferenceBoard }
  | { type: 'ADD_UPLOADED_REFERENCE'; payload: WeddingReference }
  | { type: 'SAVE_CUSTOMER_REFERENCE_SUBMISSION'; payload: CustomerReferenceSubmission }
  | { type: 'ADD_CUSTOMER_REQUEST'; payload: CustomerRequest }
  | { type: 'UPDATE_CUSTOMER_REQUEST'; payload: CustomerRequest }
  | { type: 'COMPLETE_PORTAL_ONBOARDING'; payload: PortalOnboardingState }
  | { type: 'ADD_ORDER_REMINDER'; payload: OrderReminder }
  | { type: 'APPROVE_ORDER_REMINDER'; payload: { id: string; approvedAt: string } }

export const initialState: DemoState = {
  couples: initialCouples,
  events: initialEvents,
  checklist: initialChecklist,
  vendors: initialVendors,
  recommendations: initialRecommendations,
  contracts: initialContracts,
  payments: initialPayments,
  budgetPlans: initialBudgetPlans,
  budgetItems: initialBudgetItems,
  consultations: initialConsultations,
  consultationCards: initialConsultationCards,
  portalSettings: initialPortalSettings,
  availability: { e4: ['8월 8일 (토) 11:00'] },
  vendorSelections: initialVendorSelections,
  vendorInsights: initialVendorInsights,
  orderApprovals: initialOrderApprovals,
  orderReminders: initialOrderReminders,
  portalOnboardingStates: [],
  favoriteVendorIds: ['vp-d1', 'vp-d4', 'vp-s1', 'vp-m3'],
  vendorCatalogGroups: [
    { id: 'catalog-dress-tour', name: '드레스 투어 후보', vendorIds: ['vp-d1', 'vp-d4'] },
    { id: 'catalog-studio', name: '자연광 스튜디오', vendorIds: ['vp-s1'] },
  ],
  referenceBoards: initialReferenceBoards,
  uploadedReferences: [],
  customerReferenceSubmissions: [{
    id: 'customer-ref-c1',
    coupleId: 'c1',
    selections: [
      { referenceId: 'ref-드레스-vp-d4-1', note: '깨끗한 실크와 단정한 탑이 좋아요.' },
      { referenceId: 'ref-드레스-vp-d2-1', note: '풍성한 실루엣도 함께 보고 싶어요.' },
    ],
    preferredTags: ['미카도 실크', '일자탑', 'A라인'],
    categoryCounts: { 드레스: 2 },
    submittedAt: '2026-08-05T10:30:00+09:00',
    status: '전송완료',
  }],
  customerRequests: initialCustomerRequests,
}

export function demoReducer(state: DemoState, action: DemoAction): DemoState {
  switch (action.type) {
    case 'ADD_EVENT':
      return { ...state, events: [...state.events, action.payload] }
    case 'UPDATE_EVENT':
      return { ...state, events: state.events.map((item) => item.id === action.payload.id ? action.payload : item) }
    case 'DELETE_EVENT':
      return { ...state, events: state.events.filter((item) => item.id !== action.payload) }
    case 'UPDATE_COUPLE':
      return { ...state, couples: state.couples.map((couple) => couple.id === action.payload.id ? action.payload : couple) }
    case 'TOGGLE_CHECKLIST':
      return { ...state, checklist: state.checklist.map((item) => item.id === action.payload ? { ...item, status: item.status === 'completed' ? 'pending' : 'completed' } : item) }
    case 'ADD_CHECKLIST':
      return { ...state, checklist: [...state.checklist, action.payload] }
    case 'UPDATE_CHECKLIST':
      return { ...state, checklist: state.checklist.map((item) => item.id === action.payload.id ? action.payload : item) }
    case 'DELETE_CHECKLIST':
      return { ...state, checklist: state.checklist.filter((item) => item.id !== action.payload) }
    case 'ADD_CONSULTATION':
      return { ...state, consultations: [action.payload, ...state.consultations] }
    case 'SAVE_CONSULTATION_CARD': {
      const exists = state.consultationCards.some((item) => item.coupleId === action.payload.coupleId)
      return {
        ...state,
        consultationCards: exists
          ? state.consultationCards.map((item) => item.coupleId === action.payload.coupleId ? action.payload : item)
          : [action.payload, ...state.consultationCards],
      }
    }
    case 'ADD_CONTRACT':
      return { ...state, contracts: [...state.contracts, action.payload] }
    case 'UPDATE_CONTRACT':
      return { ...state, contracts: state.contracts.map((item) => item.id === action.payload.id ? action.payload : item) }
    case 'DELETE_CONTRACT':
      return { ...state, contracts: state.contracts.filter((item) => item.id !== action.payload) }
    case 'ADD_PAYMENT':
      return { ...state, payments: [...state.payments, action.payload] }
    case 'UPDATE_PAYMENT':
      return { ...state, payments: state.payments.map((item) => item.id === action.payload.id ? action.payload : item) }
    case 'DELETE_PAYMENT':
      return { ...state, payments: state.payments.filter((item) => item.id !== action.payload) }
    case 'UPDATE_BUDGET_PLAN': {
      const exists = state.budgetPlans.some((item) => item.coupleId === action.payload.coupleId)
      return { ...state, budgetPlans: exists ? state.budgetPlans.map((item) => item.coupleId === action.payload.coupleId ? action.payload : item) : [...state.budgetPlans, action.payload] }
    }
    case 'ADD_BUDGET_ITEM':
      return { ...state, budgetItems: [...state.budgetItems, action.payload] }
    case 'UPDATE_BUDGET_ITEM':
      return { ...state, budgetItems: state.budgetItems.map((item) => item.id === action.payload.id ? action.payload : item) }
    case 'DELETE_BUDGET_ITEM':
      return { ...state, budgetItems: state.budgetItems.filter((item) => item.id !== action.payload), contracts: state.contracts.map((item) => item.budgetItemId === action.payload ? { ...item, budgetItemId: undefined } : item) }
    case 'ADD_VENDOR':
      return { ...state, vendors: [...state.vendors, action.payload] }
    case 'UPDATE_VENDOR':
      return { ...state, vendors: state.vendors.map((item) => item.id === action.payload.id ? action.payload : item) }
    case 'TOGGLE_FAVORITE_VENDOR':
      return { ...state, favoriteVendorIds: state.favoriteVendorIds.includes(action.payload) ? state.favoriteVendorIds.filter((id) => id !== action.payload) : [...state.favoriteVendorIds, action.payload] }
    case 'ADD_VENDOR_CATALOG_GROUP':
      return { ...state, vendorCatalogGroups: [...state.vendorCatalogGroups, action.payload] }
    case 'RENAME_VENDOR_CATALOG_GROUP':
      return { ...state, vendorCatalogGroups: state.vendorCatalogGroups.map((group) => group.id === action.payload.id ? { ...group, name: action.payload.name } : group) }
    case 'TOGGLE_VENDOR_CATALOG_ITEM':
      return { ...state, vendorCatalogGroups: state.vendorCatalogGroups.map((group) => group.id === action.payload.groupId ? { ...group, vendorIds: group.vendorIds.includes(action.payload.vendorId) ? group.vendorIds.filter((id) => id !== action.payload.vendorId) : [...group.vendorIds, action.payload.vendorId] } : group) }
    case 'UPDATE_PORTAL_SETTINGS':
      return { ...state, portalSettings: state.portalSettings.map((item) => item.coupleId === action.payload.coupleId ? action.payload : item) }
    case 'SET_RECOMMENDATION': {
      const existing = state.recommendations.find((item) => item.coupleId === action.payload.coupleId && item.vendorId === action.payload.vendorId)
      return {
        ...state,
        recommendations: existing
          ? state.recommendations.map((item) => item.id === existing.id ? { ...item, status: action.payload.status } : item)
          : [...state.recommendations, { id: `r-${action.payload.coupleId}-${action.payload.vendorId}`, ...action.payload, proposedAt: DEMO_TODAY, selectionDeadline: addDays(DEMO_TODAY, 7) }],
      }
    }
    case 'SEND_RECOMMENDATION': {
      const existing = state.recommendations.find((item) => item.coupleId === action.payload.coupleId && item.vendorId === action.payload.vendorId)
      return {
        ...state,
        recommendations: existing
          ? state.recommendations.map((item) => item.id === existing.id ? { ...item, sourceReferenceId: action.payload.sourceReferenceId ?? item.sourceReferenceId } : item)
          : [...state.recommendations, { id: `r-${action.payload.coupleId}-${action.payload.vendorId}`, ...action.payload, status: 'pending', proposedAt: DEMO_TODAY, selectionDeadline: addDays(DEMO_TODAY, 7) }],
      }
    }
    case 'REMOVE_RECOMMENDATION':
      return { ...state, recommendations: state.recommendations.filter((item) => item.coupleId !== action.payload.coupleId || item.vendorId !== action.payload.vendorId) }
    case 'TOGGLE_AVAILABILITY': {
      const current = state.availability[action.payload.eventId] ?? []
      const next = current.includes(action.payload.slot) ? current.filter((slot) => slot !== action.payload.slot) : [...current, action.payload.slot]
      return { ...state, availability: { ...state.availability, [action.payload.eventId]: next } }
    }
    case 'SELECT_VENDOR_SLOT': {
      const others = state.vendorSelections.filter((selection) => !(selection.coupleId === action.payload.coupleId && selection.vendorId === action.payload.vendorId))
      return { ...state, vendorSelections: [...others, action.payload] }
    }
    case 'ADD_VENDOR_INSIGHT':
      return { ...state, vendorInsights: [action.payload, ...state.vendorInsights] }
    case 'REQUEST_ORDER_APPROVAL':
      return { ...state, orderApprovals: [action.payload, ...state.orderApprovals] }
    case 'UPDATE_ORDER_APPROVAL':
      return { ...state, orderApprovals: state.orderApprovals.map((item) => item.id === action.payload.id ? action.payload : item) }
    case 'APPROVE_ORDER': {
      const order = state.orderApprovals.find((item) => item.id === action.payload.id)
      return {
        ...state,
        orderApprovals: state.orderApprovals.map((item) => item.id === action.payload.id ? { ...item, status: 'approved', confirmedAt: action.payload.confirmedAt, respondedAt: action.payload.respondedAt, rejectionReason: undefined } : item),
        events: order?.relatedEventId
          ? state.events.map((event) => event.id === order.relatedEventId ? { ...event, approvalStatus: 'confirmed' } : event)
          : state.events,
      }
    }
    case 'REJECT_ORDER':
      return { ...state, orderApprovals: state.orderApprovals.map((item) => item.id === action.payload.id ? { ...item, status: 'rejected', rejectionReason: action.payload.reason, respondedAt: action.payload.respondedAt, confirmedAt: undefined } : item) }
    case 'RETRY_ORDER':
      return { ...state, orderApprovals: state.orderApprovals.map((item) => item.id === action.payload.id ? { ...item, status: 'reverse-pending', requestedAt: action.payload.requestedAt, approvalDeadline: action.payload.approvalDeadline, viewedAt: action.payload.viewedAt, rejectionReason: undefined, confirmedAt: undefined, respondedAt: undefined } : item) }
    case 'SAVE_REFERENCE_BOARD': {
      const exists = state.referenceBoards.some((item) => item.id === action.payload.id)
      return { ...state, referenceBoards: exists ? state.referenceBoards.map((item) => item.id === action.payload.id ? action.payload : item) : [...state.referenceBoards, action.payload] }
    }
    case 'ADD_UPLOADED_REFERENCE':
      return { ...state, uploadedReferences: [action.payload, ...state.uploadedReferences] }
    case 'SAVE_CUSTOMER_REFERENCE_SUBMISSION': {
      const exists = state.customerReferenceSubmissions.some((item) => item.coupleId === action.payload.coupleId)
      return { ...state, customerReferenceSubmissions: exists ? state.customerReferenceSubmissions.map((item) => item.coupleId === action.payload.coupleId ? action.payload : item) : [action.payload, ...state.customerReferenceSubmissions] }
    }
    case 'ADD_CUSTOMER_REQUEST':
      return { ...state, customerRequests: [action.payload, ...state.customerRequests] }
    case 'UPDATE_CUSTOMER_REQUEST':
      return { ...state, customerRequests: state.customerRequests.map((item) => item.id === action.payload.id ? action.payload : item) }
    case 'COMPLETE_PORTAL_ONBOARDING': {
      const exists = state.portalOnboardingStates.some((item) => item.coupleId === action.payload.coupleId)
      return { ...state, portalOnboardingStates: exists ? state.portalOnboardingStates.map((item) => item.coupleId === action.payload.coupleId ? action.payload : item) : [...state.portalOnboardingStates, action.payload] }
    }
    case 'ADD_ORDER_REMINDER':
      return { ...state, orderReminders: [action.payload, ...state.orderReminders] }
    case 'APPROVE_ORDER_REMINDER':
      return { ...state, orderReminders: state.orderReminders.map((item) => item.id === action.payload.id ? { ...item, status: 'approved', approvedAt: action.payload.approvedAt } : item) }
    default:
      return state
  }
}

interface DemoContextValue extends DemoState {
  addEvent: (event: Omit<WeddingEvent, 'id'>) => void
  updateEvent: (event: WeddingEvent) => void
  deleteEvent: (id: string) => void
  updateCouple: (couple: Couple) => void
  toggleChecklist: (id: string) => void
  addChecklist: (item: Omit<ChecklistItem, 'id'>) => void
  updateChecklist: (item: ChecklistItem) => void
  deleteChecklist: (id: string) => void
  addConsultation: (item: Omit<Consultation, 'id'>) => void
  saveConsultationCard: (card: Omit<ConsultationCard, 'id' | 'createdAt'> & Partial<Pick<ConsultationCard, 'id' | 'createdAt'>>) => void
  addContract: (item: Omit<Contract, 'id'>) => void
  updateContract: (item: Contract) => void
  deleteContract: (id: string) => void
  addPayment: (item: Omit<Payment, 'id'>) => void
  updatePayment: (item: Payment) => void
  deletePayment: (id: string) => void
  updateBudgetPlan: (plan: BudgetPlan) => void
  addBudgetItem: (item: Omit<BudgetItem, 'id'>) => void
  updateBudgetItem: (item: BudgetItem) => void
  deleteBudgetItem: (id: string) => void
  addVendor: (item: Omit<Vendor, 'id'>) => void
  updateVendor: (item: Vendor) => void
  toggleFavoriteVendor: (id: string) => void
  addVendorCatalogGroup: (name: string) => void
  renameVendorCatalogGroup: (id: string, name: string) => void
  toggleVendorCatalogItem: (groupId: string, vendorId: string) => void
  updatePortalSettings: (settings: PortalSettings) => void
  setRecommendation: (coupleId: string, vendorId: string, status: RecommendationStatus) => void
  sendRecommendation: (coupleId: string, vendorId: string, sourceReferenceId?: string) => void
  removeRecommendation: (coupleId: string, vendorId: string) => void
  toggleAvailability: (eventId: string, slot: string) => void
  selectVendorSlot: (coupleId: string, vendorId: string, slotId: string) => void
  addVendorInsight: (insight: Omit<VendorInsight, 'id' | 'createdAt'>) => void
  requestOrderApproval: (order: Omit<OrderApproval, 'id' | 'requestedAt' | 'approvalDeadline' | 'reviewerName' | 'reviewerRole' | 'reviewerTeam' | 'viewedAt' | 'status' | 'confirmedAt' | 'respondedAt'>) => void
  updateOrderApproval: (id: string, update: Partial<Pick<OrderApproval, 'status' | 'memo' | 'confirmedAt' | 'respondedAt'>>) => void
  approveOrder: (id: string) => void
  rejectOrder: (id: string, reason: OrderRejectionReason) => void
  retryOrder: (id: string) => void
  saveReferenceBoard: (board: ReferenceBoard) => void
  addUploadedReference: (reference: Omit<WeddingReference, 'id'>) => void
  saveCustomerReferenceSubmission: (submission: CustomerReferenceSubmission) => void
  addCustomerRequest: (request: Omit<CustomerRequest, 'id' | 'createdAt' | 'updatedAt' | 'status'>) => void
  updateCustomerRequest: (id: string, update: Partial<Pick<CustomerRequest, 'status' | 'resultNote'>>) => void
  setCustomerRequestStatus: (id: string, status: CustomerRequestStatus) => void
  completePortalOnboarding: (state: PortalOnboardingState) => void
  addOrderReminder: (reminder: Omit<OrderReminder, 'id' | 'status' | 'approvedAt'>) => void
  approveOrderReminder: (id: string) => void
}

const DemoContext = createContext<DemoContextValue | null>(null)
const makeId = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
export const DEMO_TODAY = '2026-08-05'
export const DEMO_NOW = '2026-08-05T10:30:00+09:00'
const addDays = (date: string, days: number) => {
  const next = new Date(`${date}T12:00:00`)
  next.setDate(next.getDate() + days)
  return next.toISOString().slice(0, 10)
}
const addDaysTimestamp = (value: string, days: number) => {
  const next = new Date(value)
  next.setDate(next.getDate() + days)
  return next.toISOString()
}

export function DemoProvider({ children }: PropsWithChildren) {
  const [state, dispatch] = useReducer(demoReducer, initialState)
  const value = useMemo<DemoContextValue>(() => ({
    ...state,
    addEvent: (event) => dispatch({ type: 'ADD_EVENT', payload: { ...event, id: makeId('e') } }),
    updateEvent: (event) => dispatch({ type: 'UPDATE_EVENT', payload: event }),
    deleteEvent: (id) => dispatch({ type: 'DELETE_EVENT', payload: id }),
    updateCouple: (couple) => dispatch({ type: 'UPDATE_COUPLE', payload: couple }),
    toggleChecklist: (id) => dispatch({ type: 'TOGGLE_CHECKLIST', payload: id }),
    addChecklist: (item) => dispatch({ type: 'ADD_CHECKLIST', payload: { ...item, id: makeId('t') } }),
    updateChecklist: (item) => dispatch({ type: 'UPDATE_CHECKLIST', payload: item }),
    deleteChecklist: (id) => dispatch({ type: 'DELETE_CHECKLIST', payload: id }),
    addConsultation: (item) => dispatch({ type: 'ADD_CONSULTATION', payload: { ...item, id: makeId('con') } }),
    saveConsultationCard: (card) => dispatch({
      type: 'SAVE_CONSULTATION_CARD',
      payload: {
        ...card,
        id: card.id ?? makeId('cc'),
        createdAt: card.createdAt ?? new Date().toISOString().slice(0, 10),
      },
    }),
    addContract: (item) => dispatch({ type: 'ADD_CONTRACT', payload: { ...item, id: makeId('ct') } }),
    updateContract: (item) => dispatch({ type: 'UPDATE_CONTRACT', payload: item }),
    deleteContract: (id) => dispatch({ type: 'DELETE_CONTRACT', payload: id }),
    addPayment: (item) => dispatch({ type: 'ADD_PAYMENT', payload: { ...item, id: makeId('pay') } }),
    updatePayment: (item) => dispatch({ type: 'UPDATE_PAYMENT', payload: item }),
    deletePayment: (id) => dispatch({ type: 'DELETE_PAYMENT', payload: id }),
    updateBudgetPlan: (plan) => dispatch({ type: 'UPDATE_BUDGET_PLAN', payload: plan }),
    addBudgetItem: (item) => dispatch({ type: 'ADD_BUDGET_ITEM', payload: { ...item, id: makeId('bi') } }),
    updateBudgetItem: (item) => dispatch({ type: 'UPDATE_BUDGET_ITEM', payload: item }),
    deleteBudgetItem: (id) => dispatch({ type: 'DELETE_BUDGET_ITEM', payload: id }),
    addVendor: (item) => dispatch({ type: 'ADD_VENDOR', payload: { ...item, id: makeId('v') } }),
    updateVendor: (item) => dispatch({ type: 'UPDATE_VENDOR', payload: item }),
    toggleFavoriteVendor: (id) => dispatch({ type: 'TOGGLE_FAVORITE_VENDOR', payload: id }),
    addVendorCatalogGroup: (name) => dispatch({ type: 'ADD_VENDOR_CATALOG_GROUP', payload: { id: makeId('catalog'), name, vendorIds: [] } }),
    renameVendorCatalogGroup: (id, name) => dispatch({ type: 'RENAME_VENDOR_CATALOG_GROUP', payload: { id, name } }),
    toggleVendorCatalogItem: (groupId, vendorId) => dispatch({ type: 'TOGGLE_VENDOR_CATALOG_ITEM', payload: { groupId, vendorId } }),
    updatePortalSettings: (settings) => dispatch({ type: 'UPDATE_PORTAL_SETTINGS', payload: settings }),
    setRecommendation: (coupleId, vendorId, status) => dispatch({ type: 'SET_RECOMMENDATION', payload: { coupleId, vendorId, status } }),
    sendRecommendation: (coupleId, vendorId, sourceReferenceId) => dispatch({ type: 'SEND_RECOMMENDATION', payload: { coupleId, vendorId, sourceReferenceId } }),
    removeRecommendation: (coupleId, vendorId) => dispatch({ type: 'REMOVE_RECOMMENDATION', payload: { coupleId, vendorId } }),
    toggleAvailability: (eventId, slot) => dispatch({ type: 'TOGGLE_AVAILABILITY', payload: { eventId, slot } }),
    selectVendorSlot: (coupleId, vendorId, slotId) => dispatch({ type: 'SELECT_VENDOR_SLOT', payload: { coupleId, vendorId, slotId } }),
    addVendorInsight: (insight) => dispatch({
      type: 'ADD_VENDOR_INSIGHT',
      payload: { ...insight, id: makeId('vi'), createdAt: new Date().toISOString() },
    }),
    requestOrderApproval: (order) => dispatch({ type: 'REQUEST_ORDER_APPROVAL', payload: { ...order, id: makeId('oa'), requestedAt: DEMO_NOW, approvalDeadline: addDaysTimestamp(DEMO_NOW, 7), reviewerName: '정하린', reviewerRole: '실장', reviewerTeam: '예약관리팀', viewedAt: '2026-08-05T10:42:18+09:00', status: 'reverse-pending' } }),
    updateOrderApproval: (id, update) => {
      const current = state.orderApprovals.find((item) => item.id === id)
      if (current) dispatch({ type: 'UPDATE_ORDER_APPROVAL', payload: { ...current, ...update } })
    },
    approveOrder: (id) => dispatch({ type: 'APPROVE_ORDER', payload: { id, confirmedAt: DEMO_NOW, respondedAt: DEMO_NOW } }),
    rejectOrder: (id, reason) => dispatch({ type: 'REJECT_ORDER', payload: { id, reason, respondedAt: DEMO_NOW } }),
    retryOrder: (id) => dispatch({ type: 'RETRY_ORDER', payload: { id, requestedAt: DEMO_NOW, approvalDeadline: addDaysTimestamp(DEMO_NOW, 7), viewedAt: '2026-08-05T10:42:18+09:00' } }),
    saveReferenceBoard: (board) => dispatch({ type: 'SAVE_REFERENCE_BOARD', payload: board }),
    addUploadedReference: (reference) => dispatch({ type: 'ADD_UPLOADED_REFERENCE', payload: { ...reference, id: makeId('ref-upload') } }),
    saveCustomerReferenceSubmission: (submission) => dispatch({ type: 'SAVE_CUSTOMER_REFERENCE_SUBMISSION', payload: submission }),
    addCustomerRequest: (request) => dispatch({ type: 'ADD_CUSTOMER_REQUEST', payload: { ...request, id: makeId('request'), status: 'requested', createdAt: DEMO_NOW, updatedAt: DEMO_NOW } }),
    updateCustomerRequest: (id, update) => {
      const current = state.customerRequests.find((item) => item.id === id)
      if (current) dispatch({ type: 'UPDATE_CUSTOMER_REQUEST', payload: { ...current, ...update, updatedAt: DEMO_NOW } })
    },
    setCustomerRequestStatus: (id, status) => {
      const current = state.customerRequests.find((item) => item.id === id)
      if (current) dispatch({ type: 'UPDATE_CUSTOMER_REQUEST', payload: { ...current, status, updatedAt: DEMO_NOW } })
    },
    completePortalOnboarding: (onboardingState) => dispatch({ type: 'COMPLETE_PORTAL_ONBOARDING', payload: onboardingState }),
    addOrderReminder: (reminder) => dispatch({ type: 'ADD_ORDER_REMINDER', payload: { ...reminder, id: makeId('or'), status: 'pending' } }),
    approveOrderReminder: (id) => dispatch({ type: 'APPROVE_ORDER_REMINDER', payload: { id, approvedAt: DEMO_NOW } }),
  }), [state])

  return <DemoContext.Provider value={value}>{children}</DemoContext.Provider>
}

export function useDemoStore() {
  const context = useContext(DemoContext)
  if (!context) throw new Error('useDemoStore must be used inside DemoProvider')
  return context
}
