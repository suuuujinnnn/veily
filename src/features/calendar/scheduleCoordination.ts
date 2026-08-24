import type { MockCandidateSlot, MockCoordinationRequest, MockCoordinationResponse } from '../../data/scheduleCoordinationMock'
import type { WeddingEvent } from '../../types'

export const coordinationStatusMeta = {
  'awaiting-client': { label: '고객 확인 대기', className: 'is-awaiting' },
  'client-responded': { label: '고객 회신 완료', className: 'is-responded' },
  confirmed: { label: '최종 확정', className: 'is-confirmed' },
  cancelled: { label: '취소', className: 'is-cancelled' },
} as const

export const latestCoordinationResponse = (request: MockCoordinationRequest): MockCoordinationResponse | undefined => request.response

export const addMinutes = (time: string, duration: number) => {
  const [hour, minute] = time.split(':').map(Number)
  const total = Math.min(1439, hour * 60 + minute + duration)
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`
}

export const formatCoordinationDate = (date: string) => new Intl.DateTimeFormat('ko-KR', {
  month: 'long', day: 'numeric', weekday: 'short',
}).format(new Date(`${date}T12:00:00`))

export const candidateConflicts = (slot: MockCandidateSlot, events: WeddingEvent[]) => events.some((event) => {
  if (event.date !== slot.date) return false
  return event.time < slot.endTime && event.endTime > slot.time
})
