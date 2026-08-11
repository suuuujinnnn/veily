import { createContext, type PropsWithChildren, useContext, useEffect, useMemo, useReducer } from 'react'
import { contracts as initialContracts, couples, initialChecklist, initialConsultationCards, initialEvents, initialRecommendations, initialVendorSelections } from '../data/mockData'
import type { ChecklistItem, ConsultationCard, Contract, Couple, Recommendation, RecommendationStatus, VendorSelection, WeddingEvent } from '../types'

export interface DemoState {
  couples: Couple[]
  events: WeddingEvent[]
  checklist: ChecklistItem[]
  recommendations: Recommendation[]
  availability: Record<string, string[]>
  vendorSelections: VendorSelection[]
  consultationCards: ConsultationCard[]
  contracts: Contract[]
}

export type DemoAction =
  | { type: 'ADD_COUPLE'; payload: Couple }
  | { type: 'ADD_EVENT'; payload: WeddingEvent }
  | { type: 'UPDATE_EVENT'; payload: WeddingEvent }
  | { type: 'UPDATE_EVENT'; payload: WeddingEvent }
  | { type: 'TOGGLE_CHECKLIST'; payload: string }
  | { type: 'ADD_CHECKLIST'; payload: ChecklistItem }
  | { type: 'UPDATE_CHECKLIST'; payload: ChecklistItem }
  | { type: 'DELETE_CHECKLIST'; payload: string }
  | { type: 'SET_RECOMMENDATION'; payload: { coupleId: string; vendorId: string; status: RecommendationStatus } }
  | { type: 'TOGGLE_AVAILABILITY'; payload: { eventId: string; slot: string } }
  | { type: 'SELECT_VENDOR_SLOT'; payload: VendorSelection }
  | { type: 'ADD_CONSULTATION_CARD'; payload: ConsultationCard }
  | { type: 'UPDATE_CONSULTATION_CARD'; payload: ConsultationCard }
  | { type: 'ADD_CONTRACT'; payload: Contract }
  | { type: 'UPDATE_CONTRACT'; payload: Contract }
  | { type: 'DELETE_CONTRACT'; payload: string }

export const initialState: DemoState = {
  couples,
  events: initialEvents.map((event) => ({ ...event, approvalStatus: 'confirmed' })),
  checklist: initialChecklist,
  recommendations: initialRecommendations,
  availability: { e4: ['8월 8일 (토) 11:00'] },
  vendorSelections: initialVendorSelections,
  consultationCards: initialConsultationCards,
  contracts: initialContracts,
}

export function demoReducer(state: DemoState, action: DemoAction): DemoState {
  switch (action.type) {
    case 'ADD_COUPLE':
      return { ...state, couples: [...state.couples, action.payload] }
    case 'ADD_EVENT':
      return { ...state, events: [...state.events, action.payload] }
    case 'UPDATE_EVENT':
      return { ...state, events: state.events.map((item) => item.id === action.payload.id ? action.payload : item) }
    case 'UPDATE_EVENT':
      return { ...state, events: state.events.map((item) => item.id === action.payload.id ? action.payload : item) }
    case 'TOGGLE_CHECKLIST':
      return {
        ...state,
        checklist: state.checklist.map((item) =>
          item.id === action.payload ? { ...item, completed: !item.completed } : item,
        ),
      }
    case 'ADD_CHECKLIST':
      return { ...state, checklist: [...state.checklist, action.payload] }
    case 'UPDATE_CHECKLIST':
      return { ...state, checklist: state.checklist.map((item) => item.id === action.payload.id ? action.payload : item) }
    case 'DELETE_CHECKLIST':
      return { ...state, checklist: state.checklist.filter((item) => item.id !== action.payload) }
    case 'SET_RECOMMENDATION': {
      const existing = state.recommendations.find(
        (item) => item.coupleId === action.payload.coupleId && item.vendorId === action.payload.vendorId,
      )
      return {
        ...state,
        recommendations: existing
          ? state.recommendations.map((item) =>
              item.id === existing.id ? { ...item, status: action.payload.status } : item,
            )
          : [
              ...state.recommendations,
              {
                id: `r-${action.payload.coupleId}-${action.payload.vendorId}`,
                ...action.payload,
              },
            ],
      }
    }
    case 'TOGGLE_AVAILABILITY': {
      const current = state.availability[action.payload.eventId] ?? []
      const next = current.includes(action.payload.slot)
        ? current.filter((slot) => slot !== action.payload.slot)
        : [...current, action.payload.slot]
      return { ...state, availability: { ...state.availability, [action.payload.eventId]: next } }
    }
    case 'SELECT_VENDOR_SLOT': {
      const otherSelections = state.vendorSelections.filter(
        (selection) => !(selection.coupleId === action.payload.coupleId && selection.vendorId === action.payload.vendorId),
      )
      return { ...state, vendorSelections: [...otherSelections, action.payload] }
    }
    case 'ADD_CONSULTATION_CARD':
      return { ...state, consultationCards: [...state.consultationCards, action.payload] }
    case 'UPDATE_CONSULTATION_CARD':
      return { ...state, consultationCards: state.consultationCards.map((item) => item.id === action.payload.id ? action.payload : item) }
    case 'ADD_CONTRACT':
      return { ...state, contracts: [...state.contracts, action.payload] }
    case 'UPDATE_CONTRACT':
      return { ...state, contracts: state.contracts.map((item) => item.id === action.payload.id ? action.payload : item) }
    case 'DELETE_CONTRACT':
      return { ...state, contracts: state.contracts.filter((item) => item.id !== action.payload) }
    default:
      return state
  }
}

interface DemoContextValue extends DemoState {
  addCouple: (couple: Couple) => void
  addEvent: (event: Omit<WeddingEvent, 'id'>) => void
  updateEvent: (event: WeddingEvent) => void
  toggleChecklist: (id: string) => void
  addChecklist: (item: Omit<ChecklistItem, 'id'>) => void
  updateChecklist: (item: ChecklistItem) => void
  deleteChecklist: (id: string) => void
  setRecommendation: (coupleId: string, vendorId: string, status: RecommendationStatus) => void
  toggleAvailability: (eventId: string, slot: string) => void
  selectVendorSlot: (coupleId: string, vendorId: string, slotId: string) => void
  addConsultationCard: (card: Omit<ConsultationCard, 'id' | 'createdAt'>) => void
  updateConsultationCard: (card: ConsultationCard) => void
  addContract: (contract: Omit<Contract, 'id'>) => void
  updateContract: (contract: Contract) => void
  deleteContract: (id: string) => void
}

const DemoContext = createContext<DemoContextValue | null>(null)

export function DemoProvider({ children }: PropsWithChildren) {
const [state, dispatch] = useReducer(demoReducer, initialState, (base) => {
    if (typeof window === 'undefined') return base
    try { const saved = window.localStorage.getItem('veily-demo-state'); return saved ? { ...base, ...JSON.parse(saved) } : base } catch { return base }
  })
  useEffect(() => { window.localStorage.setItem('veily-demo-state', JSON.stringify(state)) }, [state])
  const value = useMemo<DemoContextValue>(
    () => ({
      ...state,
      addCouple: (couple) => dispatch({ type: 'ADD_COUPLE', payload: couple }),
      addEvent: (event) =>
        dispatch({ type: 'ADD_EVENT', payload: { ...event, id: `e-${Date.now()}`, approvalStatus: 'planner-proposed' } }),
      updateEvent: (event) => dispatch({ type: 'UPDATE_EVENT', payload: event }),      toggleChecklist: (id) => dispatch({ type: 'TOGGLE_CHECKLIST', payload: id }),
      addChecklist: (item) => dispatch({ type: 'ADD_CHECKLIST', payload: { ...item, id: `t-${Date.now()}` } }),
      updateChecklist: (item) => dispatch({ type: 'UPDATE_CHECKLIST', payload: item }),
      deleteChecklist: (id) => dispatch({ type: 'DELETE_CHECKLIST', payload: id }),
      setRecommendation: (coupleId, vendorId, status) =>
        dispatch({ type: 'SET_RECOMMENDATION', payload: { coupleId, vendorId, status } }),
      toggleAvailability: (eventId, slot) =>
        dispatch({ type: 'TOGGLE_AVAILABILITY', payload: { eventId, slot } }),
      selectVendorSlot: (coupleId, vendorId, slotId) =>
        dispatch({ type: 'SELECT_VENDOR_SLOT', payload: { coupleId, vendorId, slotId } }),
      addConsultationCard: (card) => dispatch({ type: 'ADD_CONSULTATION_CARD', payload: { ...card, id: `cc-${Date.now()}`, createdAt: new Date().toISOString().slice(0, 10) } }),
      updateConsultationCard: (card) => dispatch({ type: 'UPDATE_CONSULTATION_CARD', payload: card }),
      addContract: (contract) => dispatch({ type: 'ADD_CONTRACT', payload: { ...contract, id: `ct-${Date.now()}` } }),
      updateContract: (contract) => dispatch({ type: 'UPDATE_CONTRACT', payload: contract }),
      deleteContract: (id) => dispatch({ type: 'DELETE_CONTRACT', payload: id }),
    }),
    [state],
  )
  return <DemoContext.Provider value={value}>{children}</DemoContext.Provider>
}

export function useDemoStore() {
  const context = useContext(DemoContext)
  if (!context) throw new Error('useDemoStore must be used inside DemoProvider')
  return context
}
