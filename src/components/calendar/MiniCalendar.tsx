import { useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { WeddingEvent } from '../../types'

const weekdays = ['일', '월', '화', '수', '목', '금', '토']
const monthKey = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`

export function MiniCalendar({ events, initialDate = '2026-08-05', onSelect }: { events: WeddingEvent[]; initialDate?: string; onSelect: (date: string) => void }) {
  const [visibleMonth, setVisibleMonth] = useState(() => new Date(`${initialDate.slice(0, 7)}-01T12:00:00`))
  const [selectedDate, setSelectedDate] = useState(initialDate)
  const currentMonth = monthKey(visibleMonth)
  const firstWeekday = new Date(`${currentMonth}-01T12:00:00`).getDay()
  const daysInMonth = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1, 0).getDate()
  const eventDates = useMemo(() => new Set(events.map((event) => event.date)), [events])
  const select = (date: string) => { setSelectedDate(date); onSelect(date) }

  return <div className="mini-calendar">
    <header className="mini-calendar__header"><button type="button" aria-label="이전 달" onClick={() => setVisibleMonth((month) => new Date(month.getFullYear(), month.getMonth() - 1, 1))}><ChevronLeft size={15} /></button><strong>{visibleMonth.getFullYear()}년 {visibleMonth.getMonth() + 1}월</strong><button type="button" aria-label="다음 달" onClick={() => setVisibleMonth((month) => new Date(month.getFullYear(), month.getMonth() + 1, 1))}><ChevronRight size={15} /></button></header>
    <div className="mini-calendar__weekdays">{weekdays.map((day) => <span key={day}>{day}</span>)}</div>
    <div className="mini-calendar__grid">{Array.from({ length: firstWeekday }).map((_, index) => <i key={`blank-${index}`} />)}{Array.from({ length: daysInMonth }, (_, index) => index + 1).map((day) => { const date = `${currentMonth}-${String(day).padStart(2, '0')}`; return <button type="button" className={selectedDate === date ? 'is-selected' : ''} onClick={() => select(date)} key={date}><span>{day}</span>{eventDates.has(date) && <i />}</button> })}</div>
  </div>
}
