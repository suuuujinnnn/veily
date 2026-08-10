import { createContext, type PropsWithChildren, useContext, useEffect, useMemo, useReducer } from 'react'
import { couples as initialCouples, initialChecklist, initialEvents, initialRecommendations, initialVendorSelections } from '../data/mockData'
import type { ChecklistItem, ConsultationCard, Couple, CoordinationOption, Recommendation, RecommendationStatus, VendorSelection, WeddingEvent } from '../types'
export interface DemoState { couples:Couple[]; events:WeddingEvent[]; checklist:ChecklistItem[]; recommendations:Recommendation[]; availability:Record<string,string[]>; vendorSelections:VendorSelection[]; coordination:CoordinationOption[]; consultations:ConsultationCard[] }
export type DemoAction =
  | {type:'ADD_COUPLE';payload:{ couple: Couple; consultation: ConsultationCard }}
  | {type:'ADD_EVENT';payload:WeddingEvent}
  | {type:'TOGGLE_CHECKLIST';payload:string}
  | {type:'ADD_CHECKLIST';payload:ChecklistItem}
  | {type:'UPDATE_CHECKLIST';payload:ChecklistItem}
  | {type:'DELETE_CHECKLIST';payload:string}
  | {type:'SET_RECOMMENDATION';payload:{coupleId:string;vendorId:string;status:RecommendationStatus}}
  | {type:'TOGGLE_AVAILABILITY';payload:{eventId:string;slot:string}}
  | {type:'SELECT_VENDOR_SLOT';payload:VendorSelection}
  | {type:'RESPOND_COORDINATION';payload:{optionId:string;response:CoordinationOption['responses'][number]}}
  | {type:'ADD_COORDINATION';payload:CoordinationOption}
  | {type:'FINALIZE_COORDINATION';payload:{optionId:string;responseId:string;event:WeddingEvent}}
  | {type:'SAVE_CONSULTATION';payload:ConsultationCard}
const initialConsultation: ConsultationCard = { id:'consult-c1', coupleId:'c1', weddingDate:'2026-10-24', venue:'', budget:'', preferredStyle:'', priorities:'', requestedTopics:'', notes:'', submittedAt:'', plannerResult:'', plannerFollowUp:'' }
export const initialState:DemoState = { couples:initialCouples, events:initialEvents, checklist:initialChecklist, recommendations:initialRecommendations, availability:{}, vendorSelections:initialVendorSelections, coordination:[{id:'co1',coupleId:'c1',category:'기타',dates:[{date:'2026-08-08',startTime:'11:00',endTime:'13:00'},{date:'2026-08-09',startTime:'14:00',endTime:'16:00'}],note:'플래너가 제안한 일정입니다.',responses:[]}], consultations:[initialConsultation] }
const persistedState = (): DemoState => {
 if (typeof window === 'undefined') return initialState
 try {
  const saved = window.localStorage.getItem('veily-demo-state')
  if (!saved) return initialState
  const parsed = JSON.parse(saved) as Partial<DemoState>
  return {
   ...initialState,
   couples: Array.isArray(parsed.couples) ? parsed.couples : initialState.couples,
   events: Array.isArray(parsed.events) ? parsed.events : initialState.events,
   checklist: Array.isArray(parsed.checklist) ? parsed.checklist : initialState.checklist,
   recommendations: Array.isArray(parsed.recommendations) ? parsed.recommendations : initialState.recommendations,
   vendorSelections: Array.isArray(parsed.vendorSelections) ? parsed.vendorSelections : initialState.vendorSelections,
   coordination: Array.isArray(parsed.coordination) ? parsed.coordination : initialState.coordination,
   consultations: Array.isArray(parsed.consultations) ? parsed.consultations : initialState.consultations,
  }
 } catch { return initialState }
}
export function demoReducer(state:DemoState, action:DemoAction):DemoState {
 switch(action.type) {
  case 'ADD_COUPLE': return {...state,couples:[...state.couples,action.payload.couple],consultations:[...state.consultations,action.payload.consultation]}
  case 'ADD_EVENT': return {...state,events:[...state.events,action.payload]}
  case 'TOGGLE_CHECKLIST': return {...state,checklist:state.checklist.map(item=>item.id===action.payload?{...item,completed:!item.completed}:item)}
  case 'ADD_CHECKLIST': return {...state,checklist:[...state.checklist,action.payload]}
  case 'UPDATE_CHECKLIST': return {...state,checklist:state.checklist.map(item=>item.id===action.payload.id?action.payload:item)}
  case 'DELETE_CHECKLIST': return {...state,checklist:state.checklist.filter(item=>item.id!==action.payload)}
  case 'SET_RECOMMENDATION': { const existing=state.recommendations.find(item=>item.coupleId===action.payload.coupleId&&item.vendorId===action.payload.vendorId); return {...state,recommendations:existing?state.recommendations.map(item=>item.id===existing.id?{...item,status:action.payload.status}:item):[...state.recommendations,{id:`r-${action.payload.coupleId}-${action.payload.vendorId}`,...action.payload}] } }
  case 'TOGGLE_AVAILABILITY': { const current=state.availability[action.payload.eventId]??[]; const next=current.includes(action.payload.slot)?current.filter(slot=>slot!==action.payload.slot):[...current,action.payload.slot]; return {...state,availability:{...state.availability,[action.payload.eventId]:next}} }
  case 'SELECT_VENDOR_SLOT': return {...state,vendorSelections:[...state.vendorSelections.filter(item=>!(item.coupleId===action.payload.coupleId&&item.vendorId===action.payload.vendorId)),action.payload]}
  case 'RESPOND_COORDINATION': return {...state,coordination:state.coordination.map(option=>option.id===action.payload.optionId?{...option,responses:[...option.responses.filter(item=>item.id!==action.payload.response.id),action.payload.response]}:option)}
  case 'ADD_COORDINATION': return {...state,coordination:[...state.coordination,action.payload]}
  case 'FINALIZE_COORDINATION': return {...state,coordination:state.coordination.filter(option=>option.id!==action.payload.optionId),events:[...state.events,action.payload.event]}
  case 'SAVE_CONSULTATION': return {...state,consultations:state.consultations.some(item=>item.id===action.payload.id)?state.consultations.map(item=>item.id===action.payload.id?action.payload:item):[...state.consultations,action.payload]}
  default: return state
 }
}
interface DemoContextValue extends DemoState { addCouple:(couple:Couple, consultation:ConsultationCard)=>void; addEvent:(event:Omit<WeddingEvent,'id'>)=>void; toggleChecklist:(id:string)=>void; addChecklist:(item:Omit<ChecklistItem,'id'>)=>void; updateChecklist:(item:ChecklistItem)=>void; deleteChecklist:(id:string)=>void; setRecommendation:(coupleId:string,vendorId:string,status:RecommendationStatus)=>void; toggleAvailability:(eventId:string,slot:string)=>void; selectVendorSlot:(coupleId:string,vendorId:string,slotId:string)=>void; respondCoordination:(optionId:string,response:CoordinationOption['responses'][number])=>void; addCoordination:(option:CoordinationOption)=>void; finalizeCoordination:(optionId:string,responseId:string,event:WeddingEvent)=>void; saveConsultation:(card:ConsultationCard)=>void }
const DemoContext=createContext<DemoContextValue|null>(null)
export function DemoProvider({children}:PropsWithChildren) { const [state,dispatch]=useReducer(demoReducer,initialState,persistedState); useEffect(() => {
  window.localStorage.setItem('veily-demo-state', JSON.stringify({
   couples: state.couples,
   events: state.events,
   checklist: state.checklist,
   recommendations: state.recommendations,
   vendorSelections: state.vendorSelections,
   coordination: state.coordination,
   consultations: state.consultations,
  }))
 }, [state.couples, state.events, state.checklist, state.recommendations, state.vendorSelections, state.coordination, state.consultations]); const value=useMemo<DemoContextValue>(()=>({...state,addCouple:(couple,consultation)=>dispatch({type:'ADD_COUPLE',payload:{couple,consultation}}),addEvent:event=>dispatch({type:'ADD_EVENT',payload:{...event,id:`e-${Date.now()}`}}),toggleChecklist:id=>dispatch({type:'TOGGLE_CHECKLIST',payload:id}),addChecklist:item=>dispatch({type:'ADD_CHECKLIST',payload:{...item,id:`t-${Date.now()}`}}),updateChecklist:item=>dispatch({type:'UPDATE_CHECKLIST',payload:item}),deleteChecklist:id=>dispatch({type:'DELETE_CHECKLIST',payload:id}),setRecommendation:(coupleId,vendorId,status)=>dispatch({type:'SET_RECOMMENDATION',payload:{coupleId,vendorId,status}}),toggleAvailability:(eventId,slot)=>dispatch({type:'TOGGLE_AVAILABILITY',payload:{eventId,slot}}),selectVendorSlot:(coupleId,vendorId,slotId)=>dispatch({type:'SELECT_VENDOR_SLOT',payload:{coupleId,vendorId,slotId}}),respondCoordination:(optionId,response)=>dispatch({type:'RESPOND_COORDINATION',payload:{optionId,response}}),addCoordination:option=>dispatch({type:'ADD_COORDINATION',payload:option}),finalizeCoordination:(optionId,responseId,event)=>dispatch({type:'FINALIZE_COORDINATION',payload:{optionId,responseId,event}}),saveConsultation:card=>dispatch({type:'SAVE_CONSULTATION',payload:card})}),[state]); return <DemoContext.Provider value={value}>{children}</DemoContext.Provider> }
export function useDemoStore(){const context=useContext(DemoContext);if(!context)throw new Error('useDemoStore must be used inside DemoProvider');return context}