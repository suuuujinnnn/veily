import type { WeddingEvent } from '../../types'

export type TransitPreference = 'bus' | 'subway' | 'car'

export interface TravelLeg {
  minutes: number
  mode: TransitPreference
  from: string
  to: string
  usesBase: boolean
}

export interface EventTravelPlan {
  eventId: string
  before: TravelLeg
  after: TravelLeg
}

export interface CalendarConflict {
  date: string
  first: WeddingEvent
  second: WeddingEvent
}

const toMinutes = (time: string) => {
  const [hour, minute] = time.split(':').map(Number)
  return hour * 60 + minute
}

const estimateMinutes = (from: string, to: string, mode: TransitPreference) => {
  const signature = [...`${from}-${to}`].reduce((sum, character) => sum + character.charCodeAt(0), 0)
  const base = 18 + (signature % 24)
  if (mode === 'bus') return Math.round(base * 1.18)
  if (mode === 'subway') return Math.round(base * 1.08)
  return base
}

const legMode = (legIndex: number, preferred: TransitPreference, useCar: boolean): TransitPreference => {
  if (preferred === 'car') return 'car'
  return useCar && legIndex % 3 === 1 ? 'car' : preferred
}

export function buildTravelPlans(
  events: WeddingEvent[],
  baseLocation: string,
  preferred: TransitPreference,
  useCar: boolean,
): EventTravelPlan[] {
  const sorted = [...events].sort((a, b) => a.time.localeCompare(b.time))
  if (!sorted.length) return []
  const legs: TravelLeg[] = Array.from({ length: sorted.length + 1 }, (_, legIndex) => {
    const previous = sorted[legIndex - 1]
    const next = sorted[legIndex]
    const mode = next?.travelMode ?? (next ? legMode(legIndex, preferred, useCar) : previous?.travelMode ?? legMode(legIndex, preferred, useCar))
    const from = previous?.location ?? baseLocation
    const to = next?.location ?? baseLocation
    return {
      minutes: next?.travelMinutes ?? estimateMinutes(from, to, mode),
      mode,
      from,
      to,
      usesBase: !previous || !next,
    }
  })
  return sorted.map((event, index) => ({ eventId: event.id, before: legs[index], after: legs[index + 1] }))
}

export function findCalendarConflicts(events: WeddingEvent[]): CalendarConflict[] {
  const byDate = new Map<string, WeddingEvent[]>()
  events.forEach((event) => byDate.set(event.date, [...(byDate.get(event.date) ?? []), event]))
  const conflicts: CalendarConflict[] = []
  byDate.forEach((dayEvents, date) => {
    const sorted = [...dayEvents].sort((a, b) => a.time.localeCompare(b.time))
    for (let firstIndex = 0; firstIndex < sorted.length; firstIndex += 1) {
      for (let secondIndex = firstIndex + 1; secondIndex < sorted.length; secondIndex += 1) {
        if (toMinutes(sorted[secondIndex].time) < toMinutes(sorted[firstIndex].endTime)) {
          conflicts.push({ date, first: sorted[firstIndex], second: sorted[secondIndex] })
        }
      }
    }
  })
  return conflicts
}
