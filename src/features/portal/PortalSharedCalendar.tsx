import { useMemo, useState, type CSSProperties } from 'react'
import { AlertTriangle, CalendarCheck2, CalendarClock, Check, ChevronLeft, ChevronRight, Clock3, MapPin, Send } from 'lucide-react'
import { useDemoStore } from '../../app/store'
import { Badge, Button, Card } from '../../components/ui'
import type { EventApprovalStatus, WeddingEvent } from '../../types'

const weekdays = ['일', '월', '화', '수', '목', '금', '토']
const hours = Array.from({ length: 24 }, (_, index) => index)
const HOUR_HEIGHT = 36
const availableSlots = [
  { value: '8월 8일 (토) 11:00', date: '8월 8일', day: '토요일', time: '11:00', endTime: '13:00' },
  { value: '8월 8일 (토) 14:00', date: '8월 8일', day: '토요일', time: '14:00', endTime: '16:00' },
  { value: '8월 9일 (일) 10:30', date: '8월 9일', day: '일요일', time: '10:30', endTime: '12:30' },
  { value: '8월 12일 (수) 16:00', date: '8월 12일', day: '수요일', time: '16:00', endTime: '18:00' },
]

const statusMeta: Record<EventApprovalStatus, { label: string; tone: 'amber' | 'rose' | 'sage' }> = {
  'planner-proposed': { label: '확인 요청', tone: 'amber' },
  'client-ok': { label: '확인 완료', tone: 'rose' },
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

export function PortalSharedCalendar({ coupleId }: { coupleId: string }) {
  const { events, updateEvent, availability, toggleAvailability } = useDemoStore()
  const [visibleMonth, setVisibleMonth] = useState(new Date('2026-08-01T00:00:00'))
  const [selectedDate, setSelectedDate] = useState('2026-08-12')
  const [focusedEventId, setFocusedEventId] = useState<string | null>(null)
  const [sent, setSent] = useState(false)

  const coordinationEvents = useMemo(() => events.filter((event) => event.coupleId === coupleId && event.visibility === 'couple-shared' && event.approvalStatus), [coupleId, events])
  const selectedEvents = coordinationEvents.filter((event) => event.date === selectedDate).sort((a, b) => a.time.localeCompare(b.time))
  const focusedEvent = selectedEvents.find((event) => event.id === focusedEventId) ?? selectedEvents[0]
  const selectedSlots = availability.e4 ?? []
  const currentMonth = monthKey(visibleMonth)
  const monthEvents = coordinationEvents.filter((event) => event.date.startsWith(currentMonth))
  const firstWeekday = new Date(`${currentMonth}-01T00:00:00`).getDay()
  const daysInMonth = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1, 0).getDate()
  const overlappingEventIds = new Set(selectedEvents.flatMap((event, index) => selectedEvents.slice(index + 1).flatMap((candidate) => {
    const overlaps = timeMinutes(event.time) < timeMinutes(candidate.endTime) && timeMinutes(event.endTime) > timeMinutes(candidate.time)
    return overlaps ? [event.id, candidate.id] : []
  })))

  const selectDate = (date: string) => { setSelectedDate(date); setFocusedEventId(null) }
  const moveMonth = (offset: number) => setVisibleMonth((current) => new Date(current.getFullYear(), current.getMonth() + offset, 1))
  const confirmEvent = (event: WeddingEvent) => updateEvent({ ...event, approvalStatus: 'client-ok' })
  const toggleSlot = (slot: string) => { setSent(false); toggleAvailability('e4', slot) }
  const sendAvailability = () => setSent(true)

  return <section className="portal-shared-calendar">
    <div className="portal-shared-calendar__heading">
      <div><p className="eyebrow">Shared calendar</p><h2>공유 캘린더</h2><p>월별 일정과 선택한 날짜의 시간을 한눈에 확인하세요.</p></div>
      <div className="coordination-status-summary"><span><i className="is-proposed" />확인 요청</span><span><i className="is-client-ok" />확인 완료</span><span><i className="is-confirmed" />최종 확정</span></div>
    </div>

    <section className="portal-schedule-options">
      <header>
        <div className="portal-schedule-options__title"><span><CalendarClock size={18} /></span><div><p className="eyebrow">Planner proposal</p><h3>플래너가 보낸 일정 후보</h3><small>가능한 일정을 여러 개 선택해 주세요. 플래너가 확인한 뒤 최종 일정을 확정해 드려요.</small></div></div>
        <div className="portal-schedule-options__selection"><strong>{selectedSlots.length}</strong><span>개 선택</span></div>
      </header>
      <div className="portal-schedule-options__grid">
        {availableSlots.map((slot) => {
          const selected = selectedSlots.includes(slot.value)
          return <button type="button" className={selected ? 'selected' : ''} onClick={() => toggleSlot(slot.value)} aria-pressed={selected} key={slot.value}>
            <span className="portal-schedule-options__check">{selected && <Check size={13} />}</span>
            <span className="portal-schedule-options__date"><strong>{slot.date}</strong><small>{slot.day}</small></span>
            <span className="portal-schedule-options__time">{slot.time}<i>–</i>{slot.endTime}</span>
          </button>
        })}
      </div>
      <footer><span className={sent ? 'is-sent' : ''}>{sent ? <><Check size={13} /> 선택한 일정이 플래너에게 전달되었어요.</> : '복수 선택할 수 있어요.'}</span><Button size="sm" icon={<Send size={14} />} disabled={selectedSlots.length === 0} onClick={sendAvailability}>{sent ? '다시 보내기' : '선택 일정 보내기'}</Button></footer>
    </section>

    <div className="coordination-main coordination-main--planner portal-coordination-main">
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
          <div className="coordination-time-grid" style={{ height: HOUR_HEIGHT * 24 }}>{hours.map((hour) => <i style={{ top: hour * HOUR_HEIGHT }} key={hour} />)}{selectedEvents.map((event) => { const meta = statusMeta[eventStatus(event)]; return <button className={`coordination-planner-event is-${eventStatus(event)} ${focusedEvent?.id === event.id ? 'active' : ''}`} style={plannerStyle(event, selectedEvents)} onClick={() => setFocusedEventId(event.id)} key={event.id}><strong>{event.time}–{event.endTime}</strong><span>{event.title}</span><small>{meta.label}</small></button> })}</div>
        </div>
        {focusedEvent ? <Card className="coordination-day-detail"><div><Badge tone={statusMeta[eventStatus(focusedEvent)].tone}>{statusMeta[eventStatus(focusedEvent)].label}</Badge><h3>{focusedEvent.title}</h3><p><Clock3 size={13} /> {focusedEvent.time}–{focusedEvent.endTime}<i /><MapPin size={13} /> {focusedEvent.location}</p></div><div>{eventStatus(focusedEvent) === 'planner-proposed' && <Button size="sm" icon={<Check size={13} />} onClick={() => confirmEvent(focusedEvent)}>이 일정 가능해요</Button>}{eventStatus(focusedEvent) === 'client-ok' && <span><Check size={15} /> 플래너 확인 대기</span>}{eventStatus(focusedEvent) === 'confirmed' && <span><CalendarCheck2 size={15} /> 확정됨</span>}</div></Card> : <Card className="coordination-empty"><CalendarClock size={22} /><strong>이 날짜에는 공유 일정이 없습니다.</strong></Card>}
      </section>
    </div>
  </section>
}
