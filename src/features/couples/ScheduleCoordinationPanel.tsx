import { useMemo, useState } from 'react'
import { CalendarCheck2, CalendarClock, Check, ChevronLeft, ChevronRight, Clock3, MapPin, Plus } from 'lucide-react'
import { useDemoStore } from '../../app/store'
import { Badge, Button, Card } from '../../components/ui'
import type { EventApprovalStatus, EventType, WeddingEvent } from '../../types'

const eventTypes: EventType[] = ['미팅', '드레스', '스튜디오', '메이크업', '계약', '본식']
const weekdays = ['일', '월', '화', '수', '목', '금', '토']

const statusMeta: Record<EventApprovalStatus, { label: string; tone: 'amber' | 'rose' | 'sage' }> = {
  'planner-proposed': { label: '고객 확인 대기', tone: 'amber' },
  'client-ok': { label: '고객 확인 완료', tone: 'rose' },
  confirmed: { label: '최종 확정', tone: 'sage' },
}

function eventStatus(event: WeddingEvent): EventApprovalStatus {
  return event.approvalStatus ?? 'confirmed'
}

function monthKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

export function ScheduleCoordinationPanel({ coupleId }: { coupleId: string }) {
  const { events, addEvent, updateEvent } = useDemoStore()
  const [visibleMonth, setVisibleMonth] = useState(new Date('2026-08-01T00:00:00'))
  const [draft, setDraft] = useState({ title: '상담 일정 조율', type: '미팅' as EventType, date: '2026-08-20', time: '10:00', endTime: '11:00', location: '플래너 미팅' })
  const coupleEvents = useMemo(() => events.filter((event) => event.coupleId === coupleId), [coupleId, events])
  const coordinationEvents = coupleEvents.filter((event) => event.approvalStatus)
  const currentMonth = monthKey(visibleMonth)
  const monthEvents = coordinationEvents.filter((event) => event.date.startsWith(currentMonth))
  const firstWeekday = new Date(`${currentMonth}-01T00:00:00`).getDay()
  const daysInMonth = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1, 0).getDate()

  const moveMonth = (offset: number) => setVisibleMonth((current) => new Date(current.getFullYear(), current.getMonth() + offset, 1))
  const propose = () => {
    if (!draft.title.trim() || !draft.date) return
    addEvent({ ...draft, coupleId, approvalStatus: 'planner-proposed', workflowType: '일정 조율', durationMinutes: 60, travelMode: 'subway', visibility: 'couple-shared' })
    setVisibleMonth(new Date(`${draft.date.slice(0, 7)}-01T00:00:00`))
    setDraft((current) => ({ ...current, title: '상담 일정 조율' }))
  }
  const setStatus = (event: WeddingEvent, approvalStatus: EventApprovalStatus) => updateEvent({ ...event, approvalStatus })

  return <div className="coordination-workspace">
    <div className="feature-panel-heading"><div><p className="eyebrow">Schedule coordination</p><h2>일정 조율</h2><p>플래너가 일정을 제안하고 고객 확인을 거쳐 최종 일정으로 확정합니다.</p></div><Badge tone="amber">고객 확인 후 최종 확정</Badge></div>

    <Card className="coordination-proposal-card">
      <div className="section-heading section-heading--compact"><div><p className="eyebrow">Planner proposal</p><h2>새 일정 제안</h2></div><CalendarClock size={20} /></div>
      <div className="coordination-proposal-form">
        <label className="form-field coordination-proposal-form__title"><span>일정명</span><input value={draft.title} onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value }))} /></label>
        <label className="form-field"><span>유형</span><select value={draft.type} onChange={(event) => setDraft((current) => ({ ...current, type: event.target.value as EventType }))}>{eventTypes.map((type) => <option key={type}>{type}</option>)}</select></label>
        <label className="form-field"><span>날짜</span><input type="date" value={draft.date} onChange={(event) => setDraft((current) => ({ ...current, date: event.target.value }))} /></label>
        <label className="form-field"><span>시작</span><input type="time" value={draft.time} onChange={(event) => setDraft((current) => ({ ...current, time: event.target.value }))} /></label>
        <label className="form-field"><span>종료</span><input type="time" value={draft.endTime} onChange={(event) => setDraft((current) => ({ ...current, endTime: event.target.value }))} /></label>
        <label className="form-field coordination-proposal-form__location"><span>장소</span><input value={draft.location} onChange={(event) => setDraft((current) => ({ ...current, location: event.target.value }))} /></label>
        <Button icon={<Plus size={15} />} onClick={propose} disabled={!draft.date || !draft.title.trim()}>일정 제안</Button>
      </div>
    </Card>

    <div className="coordination-main">
      <Card padding="none" className="coordination-calendar">
        <header className="coordination-calendar__header"><button onClick={() => moveMonth(-1)} aria-label="이전 달"><ChevronLeft size={17} /></button><div><p className="eyebrow">Coordination calendar</p><h3>{visibleMonth.getFullYear()}년 {visibleMonth.getMonth() + 1}월</h3></div><button onClick={() => moveMonth(1)} aria-label="다음 달"><ChevronRight size={17} /></button></header>
        <div className="coordination-calendar__legend"><span><i className="is-proposed" />제안 일정</span><span><i className="is-client-ok" />고객 확인</span><span><i className="is-confirmed" />확정 일정</span></div>
        <div className="coordination-calendar__weekdays">{weekdays.map((day) => <span key={day}>{day}</span>)}</div>
        <div className="coordination-calendar__grid">
          {Array.from({ length: firstWeekday }).map((_, index) => <div className="coordination-calendar__blank" key={`blank-${index}`} />)}
          {Array.from({ length: daysInMonth }, (_, index) => index + 1).map((day) => {
            const date = `${currentMonth}-${String(day).padStart(2, '0')}`
            const dayEvents = monthEvents.filter((event) => event.date === date)
            return <div className="coordination-calendar__day" key={date}><strong>{day}</strong>{dayEvents.slice(0, 2).map((event) => <span className={`coordination-calendar-event is-${eventStatus(event)}`} title={event.title} key={event.id}>{event.title}</span>)}</div>
          })}
        </div>
      </Card>

      <section className="coordination-list-section">
        <div className="section-heading section-heading--compact"><div><p className="eyebrow">In progress</p><h2>조율 중인 일정</h2></div><Badge tone="neutral">{coordinationEvents.filter((event) => eventStatus(event) !== 'confirmed').length}건</Badge></div>
        <div className="coordination-list">{coordinationEvents.length ? coordinationEvents.sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`)).map((event) => {
          const status = eventStatus(event)
          const meta = statusMeta[status]
          return <Card className="coordination-item" key={event.id}><div className="date-tile"><strong>{Number(event.date.slice(-2))}</strong><span>{Number(event.date.slice(5, 7))}월</span></div><div className="coordination-item__main"><Badge tone={meta.tone}>{meta.label}</Badge><h3>{event.title}</h3><p><Clock3 size={13} /> {event.time}–{event.endTime}<i /><MapPin size={13} /> {event.location}</p></div><div className="coordination-item__actions">{status === 'planner-proposed' && <Button size="sm" variant="secondary" onClick={() => setStatus(event, 'client-ok')}>고객 확인 처리</Button>}{status === 'client-ok' && <Button size="sm" icon={<Check size={14} />} onClick={() => setStatus(event, 'confirmed')}>최종 확정</Button>}{status === 'confirmed' && <span className="coordination-confirmed"><CalendarCheck2 size={16} /> 확정됨</span>}</div></Card>
        }) : <Card className="coordination-empty"><CalendarClock size={22} /><strong>조율 중인 일정이 없습니다.</strong><p>위 제안 폼에서 고객에게 확인받을 일정을 등록하세요.</p></Card>}</div>
      </section>
    </div>
  </div>
}
