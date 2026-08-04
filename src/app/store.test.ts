import { describe, expect, it } from 'vitest'
import { demoReducer, initialState } from './store'

describe('demoReducer', () => {
  it('adds an event that can be shared by planner and portal views', () => {
    const next = demoReducer(initialState, { type: 'ADD_EVENT', payload: { id: 'new', coupleId: 'c1', title: '부케 미팅', date: '2026-08-24', time: '11:00', endTime: '12:00', type: '미팅', location: '한남동' } })
    expect(next.events.at(-1)?.title).toBe('부케 미팅')
  })

  it('toggles checklist completion', () => {
    const before = initialState.checklist.find((item) => item.id === 't1')!
    const next = demoReducer(initialState, { type: 'TOGGLE_CHECKLIST', payload: 't1' })
    expect(next.checklist.find((item) => item.id === 't1')?.completed).toBe(!before.completed)
  })

  it('updates a recommendation response', () => {
    const next = demoReducer(initialState, { type: 'SET_RECOMMENDATION', payload: { coupleId: 'c1', vendorId: 'v2', status: 'liked' } })
    expect(next.recommendations.find((item) => item.vendorId === 'v2')?.status).toBe('liked')
  })

  it('stores multiple availability choices', () => {
    const next = demoReducer(initialState, { type: 'TOGGLE_AVAILABILITY', payload: { eventId: 'e4', slot: '8월 9일 (일) 10:30' } })
    expect(next.availability.e4).toContain('8월 9일 (일) 10:30')
  })

  it('creates, updates and deletes planner checklist items', () => {
    const created = { ...initialState.checklist[0], id: 'new-task', title: '새 템플릿 항목' }
    const withTask = demoReducer(initialState, { type: 'ADD_CHECKLIST', payload: created })
    expect(withTask.checklist.at(-1)?.title).toBe('새 템플릿 항목')

    const updated = demoReducer(withTask, { type: 'UPDATE_CHECKLIST', payload: { ...created, title: '수정된 항목' } })
    expect(updated.checklist.find((item) => item.id === 'new-task')?.title).toBe('수정된 항목')

    const deleted = demoReducer(updated, { type: 'DELETE_CHECKLIST', payload: 'new-task' })
    expect(deleted.checklist.some((item) => item.id === 'new-task')).toBe(false)
  })

  it('replaces a vendor slot selection for the shared couple calendar', () => {
    const next = demoReducer(initialState, { type: 'SELECT_VENDOR_SLOT', payload: { coupleId: 'c1', vendorId: 'v1', slotId: 'vs9' } })
    const selections = next.vendorSelections.filter((item) => item.coupleId === 'c1' && item.vendorId === 'v1')
    expect(selections).toEqual([{ coupleId: 'c1', vendorId: 'v1', slotId: 'vs9' }])
  })
})
