import { useEffect } from 'react'
import { Building2, CalendarClock, CalendarPlus, MapPin, Pencil, X } from 'lucide-react'
import { Badge, Button } from '../../components/ui'
import type { CalendarDisplayPreferences, Couple, WeddingEvent } from '../../types'
import { getCalendarCategoryMeta, getEventAppearance } from './calendarAppearance'

const eventTone: Record<string, 'rose' | 'sage' | 'amber' | 'neutral'> = { 미팅: 'amber', 드레스: 'rose', 스튜디오: 'sage', 메이크업: 'rose', 계약: 'neutral', 본식: 'rose' }

interface CalendarDayDrawerProps {
  open: boolean
  date: string
  events: WeddingEvent[]
  couples: Couple[]
  displayPreferences: CalendarDisplayPreferences
  onClose: () => void
  onAdd: () => void
  onEdit: (event: WeddingEvent) => void
}

export function CalendarDayDrawer({ open, date, events, couples, displayPreferences, onClose, onAdd, onEdit }: CalendarDayDrawerProps) {
  useEffect(() => {
    const handler = (event: KeyboardEvent) => event.key === 'Escape' && onClose()
    if (open) window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onClose])

  if (!open) return null
  const dateObject = new Date(`${date}T00:00:00`)
  const title = `${dateObject.getMonth() + 1}월 ${dateObject.getDate()}일`
  const weekday = dateObject.toLocaleDateString('ko-KR', { weekday: 'long' })

  return <div className="calendar-day-drawer-layer" role="presentation" onMouseDown={onClose}>
    <aside className="calendar-day-drawer" role="dialog" aria-modal="true" aria-labelledby="calendar-day-drawer-title" onMouseDown={(event) => event.stopPropagation()}>
      <header className="calendar-day-drawer__header">
        <div><p className="eyebrow">Daily schedule</p><h2 id="calendar-day-drawer-title">{title}</h2><span>{weekday}</span></div>
        <button className="icon-button" onClick={onClose} aria-label="하루 일정 닫기"><X size={18} /></button>
      </header>
      <div className="calendar-day-drawer__body">
        <div className="calendar-day-modal__summary"><span><strong>{events.length}</strong>개의 일정</span></div>
        <div className="calendar-day-modal__list">{events.length ? events.map((event) => {
          const couple = couples.find((item) => item.id === event.coupleId)
          const candidate = event.approvalStatus === 'planner-proposed'
          const category = getCalendarCategoryMeta(event)
          return <button style={getEventAppearance(event, couples, displayPreferences)} className={`calendar-day-modal__event ${candidate ? 'is-candidate' : ''}`} onClick={() => onEdit(event)} key={event.id}>
            <time><strong>{event.time}</strong><span>{event.endTime}</span></time><i />
            <div><div><Badge tone={candidate ? 'amber' : event.visibility === 'planner-private' ? 'neutral' : eventTone[event.type] ?? 'neutral'}>{candidate ? '조율 후보' : event.visibility === 'planner-private' ? '개인 일정' : category.label}</Badge></div><h3>{event.title}</h3><p>{event.visibility === 'planner-private' ? '나에게만 표시' : couple?.partners}</p><small><MapPin size={12} /> {event.location}</small></div>
            {candidate ? <CalendarClock size={14} /> : <Pencil size={14} />}
          </button>
        }) : <div className="calendar-day-modal__empty"><Building2 size={22} /><strong>등록된 일정이 없습니다.</strong><p>이 날짜의 첫 일정을 추가해 보세요.</p></div>}</div>
      </div>
      <footer className="calendar-day-drawer__footer"><Button icon={<CalendarPlus size={14} />} onClick={onAdd}>이 날 일정 추가</Button></footer>
    </aside>
  </div>
}
