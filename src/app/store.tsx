import { createContext, type PropsWithChildren, useContext, useMemo, useReducer } from 'react'
import { initialChecklist, initialEvents, initialRecommendations } from '../data/mockData'
import type { ChecklistItem, Recommendation, RecommendationStatus, WeddingEvent } from '../types'

export interface DemoState {
  events: WeddingEvent[]
  checklist: ChecklistItem[]
  recommendations: Recommendation[]
  availability: Record<string, string[]>
}

export type DemoAction =
  | { type: 'ADD_EVENT'; payload: WeddingEvent }
  | { type: 'TOGGLE_CHECKLIST'; payload: string }
  | { type: 'SET_RECOMMENDATION'; payload: { coupleId: string; vendorId: string; status: RecommendationStatus } }
  | { type: 'TOGGLE_AVAILABILITY'; payload: { eventId: string; slot: string } }

export const initialState: DemoState = {
  events: initialEvents,
  checklist: initialChecklist,
  recommendations: initialRecommendations,
  availability: { e4: ['8월 8일 (토) 11:00'] },
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
    default:
      return state
  }
}

interface DemoContextValue extends DemoState {
  addEvent: (event: Omit<WeddingEvent, 'id'>) => void
  toggleChecklist: (id: string) => void
  setRecommendation: (coupleId: string, vendorId: string, status: RecommendationStatus) => void
  toggleAvailability: (eventId: string, slot: string) => void
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
      setRecommendation: (coupleId, vendorId, status) =>
        dispatch({ type: 'SET_RECOMMENDATION', payload: { coupleId, vendorId, status } }),
      toggleAvailability: (eventId, slot) =>
        dispatch({ type: 'TOGGLE_AVAILABILITY', payload: { eventId, slot } }),
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
