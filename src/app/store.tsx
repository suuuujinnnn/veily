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
  initialPayments,
  initialPortalSettings,
  initialRecommendations,
  initialVendorReviews,
  initialVendorSelections,
  vendors as initialVendors,
} from '../data/mockData'
import type {
  BudgetItem,
  BudgetPlan,
  ChecklistItem,
  Consultation,
  ConsultationCard,
  Contract,
  Couple,
  OrderApproval,
  OrderRejectionReason,
  Payment,
  PortalSettings,
  Recommendation,
  RecommendationStatus,
  Vendor,
  VendorReview,
  VendorSelection,
  WeddingEvent,
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
  vendorReviews: VendorReview[]
  orderApprovals: OrderApproval[]
  favoriteVendorIds: string[]
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
  | { type: 'UPDATE_PORTAL_SETTINGS'; payload: PortalSettings }
  | { type: 'SET_RECOMMENDATION'; payload: { coupleId: string; vendorId: string; status: RecommendationStatus } }
  | { type: 'TOGGLE_AVAILABILITY'; payload: { eventId: string; slot: string } }
  | { type: 'SELECT_VENDOR_SLOT'; payload: VendorSelection }
  | { type: 'ADD_VENDOR_REVIEW'; payload: VendorReview }
  | { type: 'REQUEST_ORDER_APPROVAL'; payload: OrderApproval }
  | { type: 'APPROVE_ORDER'; payload: { id: string; confirmedAt: string; respondedAt: string } }
  | { type: 'REJECT_ORDER'; payload: { id: string; reason: OrderRejectionReason; respondedAt: string } }
  | { type: 'RETRY_ORDER'; payload: { id: string; requestedAt: string; approvalDeadline: string; viewedAt: string } }

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
  vendorReviews: initialVendorReviews,
  orderApprovals: initialOrderApprovals,
  favoriteVendorIds: ['vp-d1', 'vp-d4', 'vp-s1', 'vp-m3'],
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
    case 'TOGGLE_AVAILABILITY': {
      const current = state.availability[action.payload.eventId] ?? []
      const next = current.includes(action.payload.slot) ? current.filter((slot) => slot !== action.payload.slot) : [...current, action.payload.slot]
      return { ...state, availability: { ...state.availability, [action.payload.eventId]: next } }
    }
    case 'SELECT_VENDOR_SLOT': {
      const others = state.vendorSelections.filter((selection) => !(selection.coupleId === action.payload.coupleId && selection.vendorId === action.payload.vendorId))
      return { ...state, vendorSelections: [...others, action.payload] }
    }
    case 'ADD_VENDOR_REVIEW':
      return { ...state, vendorReviews: [action.payload, ...state.vendorReviews] }
    case 'REQUEST_ORDER_APPROVAL':
      return { ...state, orderApprovals: [action.payload, ...state.orderApprovals] }
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
      return { ...state, orderApprovals: state.orderApprovals.map((item) => item.id === action.payload.id ? { ...item, status: 'pending', requestedAt: action.payload.requestedAt, approvalDeadline: action.payload.approvalDeadline, viewedAt: action.payload.viewedAt, rejectionReason: undefined, confirmedAt: undefined, respondedAt: undefined } : item) }
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
  updatePortalSettings: (settings: PortalSettings) => void
  setRecommendation: (coupleId: string, vendorId: string, status: RecommendationStatus) => void
  toggleAvailability: (eventId: string, slot: string) => void
  selectVendorSlot: (coupleId: string, vendorId: string, slotId: string) => void
  addVendorReview: (review: Omit<VendorReview, 'id' | 'createdAt'>) => void
  requestOrderApproval: (order: Omit<OrderApproval, 'id' | 'requestedAt' | 'approvalDeadline' | 'reviewerName' | 'reviewerRole' | 'reviewerTeam' | 'viewedAt' | 'status' | 'confirmedAt' | 'respondedAt'>) => void
  approveOrder: (id: string) => void
  rejectOrder: (id: string, reason: OrderRejectionReason) => void
  retryOrder: (id: string) => void
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
    updatePortalSettings: (settings) => dispatch({ type: 'UPDATE_PORTAL_SETTINGS', payload: settings }),
    setRecommendation: (coupleId, vendorId, status) => dispatch({ type: 'SET_RECOMMENDATION', payload: { coupleId, vendorId, status } }),
    toggleAvailability: (eventId, slot) => dispatch({ type: 'TOGGLE_AVAILABILITY', payload: { eventId, slot } }),
    selectVendorSlot: (coupleId, vendorId, slotId) => dispatch({ type: 'SELECT_VENDOR_SLOT', payload: { coupleId, vendorId, slotId } }),
    addVendorReview: (review) => dispatch({
      type: 'ADD_VENDOR_REVIEW',
      payload: { ...review, id: makeId('vr'), createdAt: new Date().toISOString() },
    }),
    requestOrderApproval: (order) => dispatch({ type: 'REQUEST_ORDER_APPROVAL', payload: { ...order, id: makeId('oa'), requestedAt: DEMO_NOW, approvalDeadline: addDaysTimestamp(DEMO_NOW, 7), reviewerName: '정하린', reviewerRole: '실장', reviewerTeam: '예약관리팀', viewedAt: '2026-08-05T10:42:18+09:00', status: 'pending' } }),
    approveOrder: (id) => dispatch({ type: 'APPROVE_ORDER', payload: { id, confirmedAt: DEMO_NOW, respondedAt: DEMO_NOW } }),
    rejectOrder: (id, reason) => dispatch({ type: 'REJECT_ORDER', payload: { id, reason, respondedAt: DEMO_NOW } }),
    retryOrder: (id) => dispatch({ type: 'RETRY_ORDER', payload: { id, requestedAt: DEMO_NOW, approvalDeadline: addDaysTimestamp(DEMO_NOW, 7), viewedAt: '2026-08-05T10:42:18+09:00' } }),
  }), [state])

  return <DemoContext.Provider value={value}>{children}</DemoContext.Provider>
}

export function useDemoStore() {
  const context = useContext(DemoContext)
  if (!context) throw new Error('useDemoStore must be used inside DemoProvider')
  return context
}
