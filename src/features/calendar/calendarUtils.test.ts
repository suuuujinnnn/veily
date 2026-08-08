import { describe, expect, it } from 'vitest'
import type { WeddingEvent } from '../../types'
import { buildTravelPlans, findCalendarConflicts } from './calendarUtils'

const events: WeddingEvent[] = [
  { id: 'a', coupleId: 'c1', title: '드레스 피팅', date: '2026-08-12', time: '15:00', endTime: '17:00', type: '드레스', location: '청담' },
  { id: 'b', coupleId: 'c2', title: '스튜디오 미팅', date: '2026-08-12', time: '16:00', endTime: '17:30', type: '스튜디오', location: '성수' },
]

describe('calendar travel and conflict helpers', () => {
  it('detects overlapping schedules on the same date', () => {
    expect(findCalendarConflicts(events)).toHaveLength(1)
  })

  it('uses the selected base for the first and last travel legs', () => {
    const plans = buildTravelPlans(events, 'VEILY 오피스', 'bus', true)
    expect(plans[0].before.from).toBe('VEILY 오피스')
    expect(plans.at(-1)?.after.to).toBe('VEILY 오피스')
    expect(plans[0].after).toEqual(plans[1].before)
  })
})
