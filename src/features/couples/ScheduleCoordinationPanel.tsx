import { useMemo, useState, type CSSProperties } from 'react'
import { AlertTriangle, CalendarCheck2, CalendarClock, Check, ChevronLeft, ChevronRight, Clock3, MapPin, Pencil, Plus } from 'lucide-react'
import { useDemoStore } from '../../app/store'
import { Badge, Button, Card } from '../../components/ui'
import type { EventApprovalStatus, WeddingEvent } from '../../types'
import { AddEventModal } from '../calendar/AddEventModal'

const weekdays = ['일', '월', '화', '수', '목', '금', '토']
const hours = Array.from({ length: 24 }, (_, index) => index)
const HOUR_HEIGHT = 36

const statusMeta: Record<EventApprovalStatus, { label: string; tone: 'amber' | 'rose' | 'sage' }> = {
  'planner-proposed': { label: '고객 확인 대기', tone: 'amber' },
  'client-ok': { label: '고객 확인 완료', tone: 'rose' },
  confirmed: { label: '최종 확정', tone: 'sage' },
}

const eventStatus = (event: WeddingEvent): EventApprovalStatus => event.approvalStatus ?? 'confirmed'
const monthKey = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
const timeMinutes = (value: string) => { const [hour, minute] = value.split(':').map(Number); return hour * 60 + minute }

function plannerStyle(event: WeddingEvent, dayEvents: WeddingEvent[]): CSSProperties {
  const start = timeMinutes(event.time)
  const end = Math.max(start + 30, timeMinutes(event.endTime))
  const overlapping = dayEvents.filter((item) => timeMinutes(item.time) < end && timeMinutes(item.endTime) > start)
  const lane = Math.max(0, overlapping.findIndex((item) => item.id === event.id))
  const laneCount = Math.max(1, overlapping.length)
  return {
    top: `${(start / 60) * HOUR_HEIGHT}px`,
    height: `${Math.max(34, ((end - start) / 60) * HOUR_HEIGHT)}px`,
    left: `calc(${(lane / laneCount) * 100}% + 6px)`,
    width: `calc(${100 / laneCount}% - 12px)`,
  }
}

export function ScheduleCoordinationPanel({ coupleId }: { coupleId: string }) {
  const { events, updateEvent } = useDemoStore()
  const [visibleMonth, setVisibleMonth] = useState(new Date('2026-08-01T00:00:00'))
  const [selectedDate, setSelectedDate] = useState('2026-08-12')
  const [focusedEventId, setFocusedEventId] = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingEvent, setEditingEvent] = useState<WeddingEvent | null>(null)
  const coupleEvents = useMemo(() => events.filter((event) => event.coupleId === coupleId && event.visibility === 'couple-shared'), [coupleId, events])
  const coordinationEvents = coupleEvents.filter((event) => event.approvalStatus)
  const selectedEvents = coordinationEvents.filter((event) => event.date === selectedDate).sort((a, b) => a.time.localeCompare(b.time))
  const overlappingEventIds = new Set(selectedEvents.flatMap((event, index) => selectedEvents.slice(index + 1).flatMap((candidate) => {
    const overlaps = timeMinutes(event.time) < timeMinutes(candidate.endTime) && timeMinutes(event.endTime) > timeMinutes(candidate.time)
    return overlaps ? [event.id, candidate.id] : []
  })))
  const focusedEvent = selectedEvents.find((event) => event.id === focusedEventId) ?? selectedEvents[0]
  const currentMonth = monthKey(visibleMonth)
  const monthEvents = coordinationEvents.filter((event) => event.date.startsWith(currentMonth))
  const firstWeekday = new Date(`${currentMonth}-01T00:00:00`).getDay()
  const daysInMonth = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1, 0).getDate()

  const selectDate = (date: string) => { setSelectedDate(date); setFocusedEventId(null) }
  const moveMonth = (offset: number) => setVisibleMonth((current) => new Date(current.getFullYear(), current.getMonth() + offset, 1))
  const setStatus = (event: WeddingEvent, approvalStatus: EventApprovalStatus) => updateEvent({ ...event, approvalStatus })
  const openNew = () => { setEditingEvent(null); setModalOpen(true) }
  const openEdit = (event: WeddingEvent) => { setEditingEvent(event); setModalOpen(true) }

  return <div className="coordination-workspace coordination-workspace--day-planner">
    <div className="feature-panel-heading"><div><p className="eyebrow">Shared calendar</p><h2>공유 캘린더</h2><p>월간 흐름과 선택한 날짜의 24시간 일정을 함께 보고 고객 확인 상태를 관리합니다.</p></div><Button icon={<Plus size={15} />} onClick={openNew}>새 일정 추가</Button></div>
    <div className="coordination-status-summary"><span><i className="is-proposed" />고객 확인 대기</span><span><i className="is-client-ok" />고객 확인 완료</span><span><i className="is-confirmed" />최종 확정</span><Badge tone="neutral">조율 중 {coordinationEvents.filter((event) => eventStatus(event) !== 'confirmed').length}건</Badge></div>

    <div className="coordination-main coordination-main--planner">
      <Card padding="none" className="coordination-calendar">
        <header className="coordination-calendar__header"><button onClick={() => moveMonth(-1)} aria-label="이전 달"><ChevronLeft size={17} /></button><div><p className="eyebrow">Monthly view</p><h3>{visibleMonth.getFullYear()}년 {visibleMonth.getMonth() + 1}월</h3></div><button onClick={() => moveMonth(1)} aria-label="다음 달"><ChevronRight size={17} /></button></header>
        <div className="coordination-calendar__weekdays">{weekdays.map((day) => <span key={day}>{day}</span>)}</div>
        <div className="coordination-calendar__grid">
          {Array.from({ length: firstWeekday }).map((_, index) => <div className="coordination-calendar__blank" key={`blank-${index}`} />)}
          {Array.from({ length: daysInMonth }, (_, index) => index + 1).map((day) => {
            const date = `${currentMonth}-${String(day).padStart(2, '0')}`
            const dayEvents = monthEvents.filter((event) => event.date === date)
            return <button className={`coordination-calendar__day ${selectedDate === date ? 'selected' : ''}`} onClick={() => selectDate(date)} key={date}><strong>{day}</strong>{dayEvents.slice(0, 2).map((event) => <span className={`coordination-calendar-event is-${eventStatus(event)}`} title={event.title} key={event.id}>{event.title}</span>)}</button>
          })}
        </div>
      </Card>

      <section className="coordination-day-section">
        <header><div><p className="eyebrow">24 hour planner</p><h2>{Number(selectedDate.slice(5, 7))}월 {Number(selectedDate.slice(8, 10))}일 일정</h2></div><div className="coordination-day-badges">{overlappingEventIds.size > 0 && <Badge tone="amber"><AlertTriangle size={12} /> 시간 겹침</Badge>}<Badge tone="neutral">{selectedEvents.length}건</Badge></div></header>
        <div className="coordination-day-planner">
          <div className="coordination-time-axis">{hours.map((hour) => <span style={{ height: HOUR_HEIGHT }} key={hour}>{String(hour).padStart(2, '0')}:00</span>)}</div>
          <div className="coordination-time-grid" style={{ height: HOUR_HEIGHT * 24 }}>{hours.map((hour) => <i style={{ top: hour * HOUR_HEIGHT }} key={hour} />)}{selectedEvents.map((event) => { const meta = statusMeta[eventStatus(event)]; return <button className={`coordination-planner-event is-${eventStatus(event)} ${focusedEvent?.id === event.id ? 'active' : ''} ${overlappingEventIds.has(event.id) ? 'has-conflict' : ''}`} style={plannerStyle(event, selectedEvents)} onClick={() => setFocusedEventId(event.id)} key={event.id}><strong>{event.time}–{event.endTime}</strong><span>{event.title}</span><small>{overlappingEventIds.has(event.id) && <AlertTriangle size={11} />}{meta.label}</small></button> })}</div>
        </div>
        {focusedEvent ? <Card className="coordination-day-detail"><div><Badge tone={statusMeta[eventStatus(focusedEvent)].tone}>{statusMeta[eventStatus(focusedEvent)].label}</Badge><h3>{focusedEvent.title}</h3><p><Clock3 size={13} /> {focusedEvent.time}–{focusedEvent.endTime}<i /><MapPin size={13} /> {focusedEvent.location}</p></div><div><Button size="sm" variant="ghost" icon={<Pencil size={13} />} onClick={() => openEdit(focusedEvent)}>수정</Button>{eventStatus(focusedEvent) === 'planner-proposed' && <Button size="sm" variant="secondary" onClick={() => setStatus(focusedEvent, 'client-ok')}>고객 확인 처리</Button>}{eventStatus(focusedEvent) === 'client-ok' && <Button size="sm" icon={<Check size={13} />} onClick={() => setStatus(focusedEvent, 'confirmed')}>최종 확정</Button>}{eventStatus(focusedEvent) === 'confirmed' && <span><CalendarCheck2 size={15} /> 확정됨</span>}</div></Card> : <Card className="coordination-empty"><CalendarClock size={22} /><strong>이 날짜에 공유 일정이 없습니다.</strong><Button size="sm" variant="secondary" onClick={openNew}>이 날 일정 추가</Button></Card>}
      </section>
    </div>
    <AddEventModal open={modalOpen} initialDate={selectedDate} initialCoupleId={coupleId} initialEvent={editingEvent} context="couple-coordination" onClose={() => { setModalOpen(false); setEditingEvent(null) }} onAdded={() => undefined} />
  </div>
}
