import { AlertTriangle, Building2, CalendarPlus, MapPin, Pencil } from 'lucide-react'
import { Badge, Button, Modal } from '../../components/ui'
import type { Couple, WeddingEvent } from '../../types'

const eventTone: Record<string, 'rose' | 'sage' | 'amber' | 'neutral'> = { 미팅: 'amber', 드레스: 'rose', 스튜디오: 'sage', 메이크업: 'rose', 계약: 'neutral', 본식: 'rose' }

interface CalendarDayModalProps {
  open: boolean
  date: string
  events: WeddingEvent[]
  couples: Couple[]
  conflictIds: Set<string>
  onClose: () => void
  onAdd: () => void
  onEdit: (event: WeddingEvent) => void
}

export function CalendarDayModal({ open, date, events, couples, conflictIds, onClose, onAdd, onEdit }: CalendarDayModalProps) {
  const dateObject = new Date(`${date}T00:00:00`)
  const hasConflict = events.some((event) => conflictIds.has(event.id))
  return <Modal open={open} onClose={onClose} eyebrow="Daily schedule" title={`${dateObject.getMonth() + 1}월 ${dateObject.getDate()}일 · ${dateObject.toLocaleDateString('ko-KR', { weekday: 'long' })}`} footer={<><Button variant="ghost" onClick={onClose}>닫기</Button><Button icon={<CalendarPlus size={14} />} onClick={onAdd}>이 날 일정 추가</Button></>}>
    <div className="calendar-day-modal">
      <div className="calendar-day-modal__summary"><span><strong>{events.length}</strong>개의 일정</span>{hasConflict && <em><AlertTriangle size={13} /> 시간이 겹치는 일정이 있습니다.</em>}</div>
      <div className="calendar-day-modal__list">{events.length ? events.map((event) => { const couple = couples.find((item) => item.id === event.coupleId); return <button className={`calendar-day-modal__event ${conflictIds.has(event.id) ? 'has-conflict' : ''}`} onClick={() => onEdit(event)} key={event.id}><time><strong>{event.time}</strong><span>{event.endTime}</span></time><i /><div><div><Badge tone={event.visibility === 'planner-private' ? 'neutral' : eventTone[event.type] ?? 'neutral'}>{event.visibility === 'planner-private' ? '개인 일정' : event.type}</Badge>{conflictIds.has(event.id) && <em><AlertTriangle size={11} /> 겹침</em>}</div><h3>{event.title}</h3><p>{event.visibility === 'planner-private' ? '나에게만 표시' : couple?.partners}</p><small><MapPin size={12} /> {event.location}</small></div><Pencil size={14} /></button> }) : <div className="calendar-day-modal__empty"><Building2 size={22} /><strong>등록된 일정이 없습니다.</strong><p>아래 버튼으로 이 날짜의 첫 일정을 추가해 보세요.</p></div>}</div>
    </div>
  </Modal>
}
