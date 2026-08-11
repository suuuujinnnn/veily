import { createContext, type PropsWithChildren, useContext, useMemo, useReducer } from 'react'
import { initialChecklist, initialEvents, initialRecommendations, initialVendorReviews, initialVendorSelections } from '../data/mockData'
import type { ChecklistItem, Recommendation, RecommendationStatus, VendorReview, VendorSelection, WeddingEvent } from '../types'

export interface DemoState {
  events: WeddingEvent[]
  checklist: ChecklistItem[]
  recommendations: Recommendation[]
  availability: Record<string, string[]>
  vendorSelections: VendorSelection[]
  vendorReviews: VendorReview[]
}

export type DemoAction =
  | { type: 'ADD_EVENT'; payload: WeddingEvent }
  | { type: 'TOGGLE_CHECKLIST'; payload: string }
  | { type: 'ADD_CHECKLIST'; payload: ChecklistItem }
  | { type: 'UPDATE_CHECKLIST'; payload: ChecklistItem }
  | { type: 'DELETE_CHECKLIST'; payload: string }
  | { type: 'SET_RECOMMENDATION'; payload: { coupleId: string; vendorId: string; status: RecommendationStatus } }
  | { type: 'TOGGLE_AVAILABILITY'; payload: { eventId: string; slot: string } }
  | { type: 'SELECT_VENDOR_SLOT'; payload: VendorSelection }
  | { type: 'ADD_VENDOR_REVIEW'; payload: VendorReview }

export const initialState: DemoState = {
  events: initialEvents,
  checklist: initialChecklist,
  recommendations: initialRecommendations,
  availability: { e4: ['8월 8일 (토) 11:00'] },
  vendorSelections: initialVendorSelections,
  vendorReviews: initialVendorReviews,
}

export function demoReducer(state: DemoState, action: DemoAction): DemoState {
  switch (action.type) {
    case 'ADD_EVENT':
      return { ...state, events: [...state.events, action.payload] }
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
    case 'ADD_VENDOR_REVIEW':
      return { ...state, vendorReviews: [action.payload, ...state.vendorReviews] }
    default:
      return state
  }
}

interface DemoContextValue extends DemoState {
  addEvent: (event: Omit<WeddingEvent, 'id'>) => void
  toggleChecklist: (id: string) => void
  addChecklist: (item: Omit<ChecklistItem, 'id'>) => void
  updateChecklist: (item: ChecklistItem) => void
  deleteChecklist: (id: string) => void
  setRecommendation: (coupleId: string, vendorId: string, status: RecommendationStatus) => void
  toggleAvailability: (eventId: string, slot: string) => void
  selectVendorSlot: (coupleId: string, vendorId: string, slotId: string) => void
  addVendorReview: (review: Omit<VendorReview, 'id' | 'createdAt'>) => void
}

const DemoContext = createContext<DemoContextValue | null>(null)

export function DemoProvider({ children }: PropsWithChildren) {
  const [state, dispatch] = useReducer(demoReducer, initialState)
  const value = useMemo<DemoContextValue>(
    () => ({
      ...state,
      addEvent: (event) =>
        dispatch({ type: 'ADD_EVENT', payload: { ...event, id: `e-${Date.now()}` } }),
      toggleChecklist: (id) => dispatch({ type: 'TOGGLE_CHECKLIST', payload: id }),
      addChecklist: (item) => dispatch({ type: 'ADD_CHECKLIST', payload: { ...item, id: `t-${Date.now()}` } }),
      updateChecklist: (item) => dispatch({ type: 'UPDATE_CHECKLIST', payload: item }),
      deleteChecklist: (id) => dispatch({ type: 'DELETE_CHECKLIST', payload: id }),
      setRecommendation: (coupleId, vendorId, status) =>
        dispatch({ type: 'SET_RECOMMENDATION', payload: { coupleId, vendorId, status } }),
      toggleAvailability: (eventId, slot) =>
        dispatch({ type: 'TOGGLE_AVAILABILITY', payload: { eventId, slot } }),
      selectVendorSlot: (coupleId, vendorId, slotId) =>
        dispatch({ type: 'SELECT_VENDOR_SLOT', payload: { coupleId, vendorId, slotId } }),
      addVendorReview: (review) =>
        dispatch({ type: 'ADD_VENDOR_REVIEW', payload: { ...review, id: `vr-${Date.now()}`, createdAt: new Date().toISOString() } }),
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
