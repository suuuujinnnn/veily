import { useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight, Plus, X } from 'lucide-react'
import { Card } from '../../components/ui'
import { SegmentedTabs } from '../../components/ui'
import type { CalendarDisplayPreferences, Couple, WeddingEvent } from '../../types'
import { findCalendarConflicts } from './calendarUtils'
import { defaultCalendarDisplayPreferences, getEventAppearance, getShortCoupleLabel } from './calendarAppearance'

const weekNames = ['일', '월', '화', '수', '목', '금', '토']
const DISMISSED_CONFLICTS_KEY = 'veily.calendar.dismissed-conflict-dates'

const loadDismissedConflictDates = () => {
  try { return new Set<string>(JSON.parse(window.localStorage.getItem(DISMISSED_CONFLICTS_KEY) ?? '[]')) }
  catch { return new Set<string>() }
}

const monthDays = Array.from({ length: 42 }, (_, index) => {
  const day = index - 5
  if (day < 1) return { day: 31 + day, current: false, date: `2026-07-${String(31 + day).padStart(2, '0')}` }
  if (day > 31) return { day: day - 31, current: false, date: `2026-09-${String(day - 31).padStart(2, '0')}` }
  return { day, current: true, date: `2026-08-${String(day).padStart(2, '0')}` }
})

interface PlannerCalendarProps {
  events: WeddingEvent[]
  couples: Couple[]
  view: 'month' | 'week'
  onViewChange: (view: 'month' | 'week') => void
  selectedDate?: string
  onDayClick?: (date: string) => void
  onAdd?: (date: string) => void
  onEventClick?: (event: WeddingEvent) => void
  compact?: boolean
  displayPreferences?: CalendarDisplayPreferences
  showCustomerLabels?: boolean
  showConflictAlerts?: boolean
}

export function PlannerCalendar({ events, couples, view, onViewChange, selectedDate, onDayClick, onAdd, onEventClick, compact = false, displayPreferences = defaultCalendarDisplayPreferences, showCustomerLabels = true, showConflictAlerts = true }: PlannerCalendarProps) {
  const conflicts = useMemo(() => findCalendarConflicts(events), [events])
  const [dismissedConflictDates, setDismissedConflictDates] = useState(loadDismissedConflictDates)

  const dismissConflict = (date: string) => {
    const next = new Set(dismissedConflictDates).add(date)
    setDismissedConflictDates(next)
    window.localStorage.setItem(DISMISSED_CONFLICTS_KEY, JSON.stringify([...next]))
  }

  const openDay = (date: string) => onDayClick?.(date)

  return <div className={`planner-calendar ${compact ? 'planner-calendar--compact' : ''}`}>
    <div className="calendar-toolbar">
      <div className="month-controller"><button type="button" aria-label="이전 달"><ChevronLeft size={18} /></button><h2>2026년 8월</h2><button type="button" aria-label="다음 달"><ChevronRight size={18} /></button>{!compact && <button type="button" className="today-button" onClick={() => openDay('2026-08-05')}>오늘</button>}</div>
      <SegmentedTabs size="xs" value={view} onChange={onViewChange} ariaLabel="캘린더 보기" items={[{ value: 'month', label: '월' }, { value: 'week', label: '주' }]} />
    </div>
    <div className="calendar-layout calendar-layout--full"><Card padding="none" className="month-calendar"><div className="week-header">{weekNames.map((name) => <span key={name}>{name}</span>)}</div><div className={`month-grid ${view === 'week' ? 'month-grid--week' : ''}`}>{monthDays.map((item, index) => {
      if (view === 'week' && (index < 7 || index > 13)) return null
      const dayEvents = events.filter((event) => event.date === item.date).sort((a, b) => a.time.localeCompare(b.time))
      const visibleEvents = dayEvents.slice(0, view === 'week' ? 6 : compact ? 2 : 3)
      const isToday = item.date === '2026-08-05'
      const hasConflict = showConflictAlerts && conflicts.some((conflict) => conflict.date === item.date)
      return <div key={item.date} role="button" tabIndex={0} onClick={() => openDay(item.date)} onKeyDown={(event) => { if (event.key === 'Enter') openDay(item.date) }} className={`calendar-cell ${!item.current ? 'calendar-cell--muted' : ''} ${isToday ? 'calendar-cell--today' : ''} ${selectedDate === item.date ? 'calendar-cell--selected' : ''}`}>
        {hasConflict && !dismissedConflictDates.has(item.date) && <span className="calendar-conflict-bubble" role="status">겹치는 일정이 있습니다<button type="button" aria-label="충돌 알림 닫기" onClick={(event) => { event.stopPropagation(); dismissConflict(item.date) }}><X size={10} /></button></span>}
        <div className="calendar-cell__top"><span>{item.day}</span>{isToday && <small>오늘</small>}{onAdd && <button type="button" onClick={(event) => { event.stopPropagation(); onAdd(item.date) }} aria-label={`${item.day}일 일정 추가`}><Plus size={13} /></button>}</div>
        <div className="calendar-cell__events">{visibleEvents.map((event) => {
          const eventCouple = couples.find((couple) => couple.id === event.coupleId)
          const candidate = event.approvalStatus === 'planner-proposed'
          return <div style={getEventAppearance(event, couples, displayPreferences)} role="button" tabIndex={0} onClick={(clickEvent) => { clickEvent.stopPropagation(); candidate ? openDay(item.date) : onEventClick ? onEventClick(event) : openDay(item.date) }} onKeyDown={(keyEvent) => { if (keyEvent.key === 'Enter') candidate ? openDay(item.date) : onEventClick ? onEventClick(event) : openDay(item.date) }} className={`calendar-event ${candidate ? 'calendar-event--candidate' : ''} ${event.visibility === 'planner-private' ? 'calendar-event--private' : ''}`} key={event.id}>
            <strong>{event.time}</strong>
            {showCustomerLabels && event.visibility !== 'planner-private' && <small className="calendar-event__customer">{getShortCoupleLabel(eventCouple)}</small>}
            <span>{event.title}</span>
          </div>
        })}{dayEvents.length > visibleEvents.length && <small>+{dayEvents.length - visibleEvents.length}개 일정 더 보기</small>}</div>
      </div>
    })}</div></Card></div>
  </div>
}
