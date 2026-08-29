import type { WeddingEvent } from '../../types'

export interface CalendarConflict {
  date: string
  first: WeddingEvent
  second: WeddingEvent
}

const toMinutes = (time: string) => {
  const [hour, minute] = time.split(':').map(Number)
  return hour * 60 + minute
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
