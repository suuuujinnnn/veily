import { createContext, type PropsWithChildren, useContext, useMemo, useReducer } from 'react'
import {
  contracts as initialContracts,
  couples as initialCouples,
  initialChecklist,
  initialConsultations,
  initialEvents,
  initialPayments,
  initialPortalSettings,
  initialRecommendations,
  initialVendorSelections,
  vendors as initialVendors,
} from '../data/mockData'
import type {
  ChecklistItem,
  Consultation,
  Contract,
  Couple,
  Payment,
  PortalSettings,
  Recommendation,
  RecommendationStatus,
  Vendor,
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
  consultations: Consultation[]
  portalSettings: PortalSettings[]
  availability: Record<string, string[]>
  vendorSelections: VendorSelection[]
}

export type DemoAction =
  | { type: 'ADD_EVENT'; payload: WeddingEvent }
  | { type: 'UPDATE_COUPLE'; payload: Couple }
  | { type: 'TOGGLE_CHECKLIST'; payload: string }
  | { type: 'ADD_CHECKLIST'; payload: ChecklistItem }
  | { type: 'UPDATE_CHECKLIST'; payload: ChecklistItem }
  | { type: 'DELETE_CHECKLIST'; payload: string }
  | { type: 'ADD_CONSULTATION'; payload: Consultation }
  | { type: 'ADD_CONTRACT'; payload: Contract }
  | { type: 'UPDATE_CONTRACT'; payload: Contract }
  | { type: 'DELETE_CONTRACT'; payload: string }
  | { type: 'ADD_PAYMENT'; payload: Payment }
  | { type: 'UPDATE_PAYMENT'; payload: Payment }
  | { type: 'DELETE_PAYMENT'; payload: string }
  | { type: 'ADD_VENDOR'; payload: Vendor }
  | { type: 'UPDATE_VENDOR'; payload: Vendor }
  | { type: 'UPDATE_PORTAL_SETTINGS'; payload: PortalSettings }
  | { type: 'SET_RECOMMENDATION'; payload: { coupleId: string; vendorId: string; status: RecommendationStatus } }
  | { type: 'TOGGLE_AVAILABILITY'; payload: { eventId: string; slot: string } }
  | { type: 'SELECT_VENDOR_SLOT'; payload: VendorSelection }

export const initialState: DemoState = {
  couples: initialCouples,
  events: initialEvents,
  checklist: initialChecklist,
  vendors: initialVendors,
  recommendations: initialRecommendations,
  contracts: initialContracts,
  payments: initialPayments,
  consultations: initialConsultations,
  portalSettings: initialPortalSettings,
  availability: { e4: ['8월 8일 (토) 11:00'] },
  vendorSelections: initialVendorSelections,
}

export function demoReducer(state: DemoState, action: DemoAction): DemoState {
  switch (action.type) {
    case 'ADD_EVENT':
      return { ...state, events: [...state.events, action.payload] }
    case 'UPDATE_COUPLE':
      return { ...state, couples: state.couples.map((couple) => couple.id === action.payload.id ? action.payload : couple) }
    case 'TOGGLE_CHECKLIST':
      return { ...state, checklist: state.checklist.map((item) => item.id === action.payload ? { ...item, completed: !item.completed } : item) }
    case 'ADD_CHECKLIST':
      return { ...state, checklist: [...state.checklist, action.payload] }
    case 'UPDATE_CHECKLIST':
      return { ...state, checklist: state.checklist.map((item) => item.id === action.payload.id ? action.payload : item) }
    case 'DELETE_CHECKLIST':
      return { ...state, checklist: state.checklist.filter((item) => item.id !== action.payload) }
    case 'ADD_CONSULTATION':
      return { ...state, consultations: [action.payload, ...state.consultations] }
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
    case 'ADD_VENDOR':
      return { ...state, vendors: [...state.vendors, action.payload] }
    case 'UPDATE_VENDOR':
      return { ...state, vendors: state.vendors.map((item) => item.id === action.payload.id ? action.payload : item) }
    case 'UPDATE_PORTAL_SETTINGS':
      return { ...state, portalSettings: state.portalSettings.map((item) => item.coupleId === action.payload.coupleId ? action.payload : item) }
    case 'SET_RECOMMENDATION': {
      const existing = state.recommendations.find((item) => item.coupleId === action.payload.coupleId && item.vendorId === action.payload.vendorId)
      return {
        ...state,
        recommendations: existing
          ? state.recommendations.map((item) => item.id === existing.id ? { ...item, status: action.payload.status } : item)
          : [...state.recommendations, { id: `r-${action.payload.coupleId}-${action.payload.vendorId}`, ...action.payload }],
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
    default:
      return state
  }
}

interface DemoContextValue extends DemoState {
  addEvent: (event: Omit<WeddingEvent, 'id'>) => void
  updateCouple: (couple: Couple) => void
  toggleChecklist: (id: string) => void
  addChecklist: (item: Omit<ChecklistItem, 'id'>) => void
  updateChecklist: (item: ChecklistItem) => void
  deleteChecklist: (id: string) => void
  addConsultation: (item: Omit<Consultation, 'id'>) => void
  addContract: (item: Omit<Contract, 'id'>) => void
  updateContract: (item: Contract) => void
  deleteContract: (id: string) => void
  addPayment: (item: Omit<Payment, 'id'>) => void
  updatePayment: (item: Payment) => void
  deletePayment: (id: string) => void
  addVendor: (item: Omit<Vendor, 'id'>) => void
  updateVendor: (item: Vendor) => void
  updatePortalSettings: (settings: PortalSettings) => void
  setRecommendation: (coupleId: string, vendorId: string, status: RecommendationStatus) => void
  toggleAvailability: (eventId: string, slot: string) => void
  selectVendorSlot: (coupleId: string, vendorId: string, slotId: string) => void
}

const DemoContext = createContext<DemoContextValue | null>(null)
const makeId = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`

export function DemoProvider({ children }: PropsWithChildren) {
  const [state, dispatch] = useReducer(demoReducer, initialState)
  const value = useMemo<DemoContextValue>(() => ({
    ...state,
    addEvent: (event) => dispatch({ type: 'ADD_EVENT', payload: { ...event, id: makeId('e') } }),
    updateCouple: (couple) => dispatch({ type: 'UPDATE_COUPLE', payload: couple }),
    toggleChecklist: (id) => dispatch({ type: 'TOGGLE_CHECKLIST', payload: id }),
    addChecklist: (item) => dispatch({ type: 'ADD_CHECKLIST', payload: { ...item, id: makeId('t') } }),
    updateChecklist: (item) => dispatch({ type: 'UPDATE_CHECKLIST', payload: item }),
    deleteChecklist: (id) => dispatch({ type: 'DELETE_CHECKLIST', payload: id }),
    addConsultation: (item) => dispatch({ type: 'ADD_CONSULTATION', payload: { ...item, id: makeId('con') } }),
    addContract: (item) => dispatch({ type: 'ADD_CONTRACT', payload: { ...item, id: makeId('ct') } }),
    updateContract: (item) => dispatch({ type: 'UPDATE_CONTRACT', payload: item }),
    deleteContract: (id) => dispatch({ type: 'DELETE_CONTRACT', payload: id }),
    addPayment: (item) => dispatch({ type: 'ADD_PAYMENT', payload: { ...item, id: makeId('pay') } }),
    updatePayment: (item) => dispatch({ type: 'UPDATE_PAYMENT', payload: item }),
    deletePayment: (id) => dispatch({ type: 'DELETE_PAYMENT', payload: id }),
    addVendor: (item) => dispatch({ type: 'ADD_VENDOR', payload: { ...item, id: makeId('v') } }),
    updateVendor: (item) => dispatch({ type: 'UPDATE_VENDOR', payload: item }),
    updatePortalSettings: (settings) => dispatch({ type: 'UPDATE_PORTAL_SETTINGS', payload: settings }),
    setRecommendation: (coupleId, vendorId, status) => dispatch({ type: 'SET_RECOMMENDATION', payload: { coupleId, vendorId, status } }),
    toggleAvailability: (eventId, slot) => dispatch({ type: 'TOGGLE_AVAILABILITY', payload: { eventId, slot } }),
    selectVendorSlot: (coupleId, vendorId, slotId) => dispatch({ type: 'SELECT_VENDOR_SLOT', payload: { coupleId, vendorId, slotId } }),
  }), [state])

  return <DemoContext.Provider value={value}>{children}</DemoContext.Provider>
}

export function useDemoStore() {
  const context = useContext(DemoContext)
  if (!context) throw new Error('useDemoStore must be used inside DemoProvider')
  return context
}
