import { useMemo, useState, type CSSProperties } from 'react'
import { AlertTriangle, CalendarClock, Check, ChevronDown, ChevronLeft, ChevronRight, Clock3, Eye, MapPin, Pencil, Plus, RotateCcw, X } from 'lucide-react'
import { useDemoStore } from '../../app/store'
import { Badge, Button, Card } from '../../components/ui'
import { mockScheduleCoordinationRequests, type MockCandidateSlot, type MockCoordinationRequest } from '../../data/scheduleCoordinationMock'
import type { WeddingEvent } from '../../types'
import { AddEventModal } from '../calendar/AddEventModal'
import { candidateConflicts, coordinationStatusMeta, formatCoordinationDate, latestCoordinationResponse } from '../calendar/scheduleCoordination'
import { ScheduleCoordinationDrawer } from './ScheduleCoordinationDrawer'

const weekdays = ['일', '월', '화', '수', '목', '금', '토']
const hours = Array.from({ length: 24 }, (_, index) => index)
const HOUR_HEIGHT = 36
const monthKey = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
const timeMinutes = (value: string) => { const [hour, minute] = value.split(':').map(Number); return hour * 60 + minute }
type DisplayItem = { id: string; date: string; time: string; endTime: string; title: string; location: string; event?: WeddingEvent; request?: MockCoordinationRequest; slot?: MockCandidateSlot; context?: boolean }

function plannerStyle(item: DisplayItem, dayItems: DisplayItem[]): CSSProperties {
  const start = timeMinutes(item.time)
  const end = Math.max(start + 30, timeMinutes(item.endTime))
  const overlapping = dayItems.filter((candidate) => timeMinutes(candidate.time) < end && timeMinutes(candidate.endTime) > start)
  const lane = Math.max(0, overlapping.findIndex((candidate) => candidate.id === item.id))
  const laneCount = Math.max(1, overlapping.length)
  return { top: `${(start / 60) * HOUR_HEIGHT}px`, height: `${Math.max(34, ((end - start) / 60) * HOUR_HEIGHT)}px`, left: `calc(${(lane / laneCount) * 100}% + 6px)`, width: `calc(${100 / laneCount}% - 12px)` }
}

export function ScheduleCoordinationPanel({ coupleId }: { coupleId: string }) {
  const { couples, events, vendors } = useDemoStore()
  const [mockRequests, setMockRequests] = useState(() => mockScheduleCoordinationRequests.filter((request) => request.coupleId === coupleId))
  const [visibleMonth, setVisibleMonth] = useState(new Date('2026-08-01T00:00:00'))
  const [selectedDate, setSelectedDate] = useState('2026-08-12')
  const [focusedId, setFocusedId] = useState<string | null>(null)
  const [expandedRequestId, setExpandedRequestId] = useState<string | null>('coord-dress-c1')
  const [showAllPlannerEvents, setShowAllPlannerEvents] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editingRequest, setEditingRequest] = useState<MockCoordinationRequest | null>(null)
  const [eventModalOpen, setEventModalOpen] = useState(false)
  const [editingEvent, setEditingEvent] = useState<WeddingEvent | null>(null)

  const requests = useMemo(() => [...mockRequests].sort((a, b) => b.sentAt.localeCompare(a.sentAt)), [mockRequests])
  const activeCandidates: DisplayItem[] = requests.filter((request) => request.status === 'awaiting-client' || request.status === 'client-responded').flatMap((request) => request.slots.map((slot) => ({ id: slot.id, date: slot.date, time: slot.time, endTime: slot.endTime, title: request.title, location: request.location, request, slot })))
  const baseEvents = (showAllPlannerEvents ? events : events.filter((event) => event.coupleId === coupleId && event.visibility === 'couple-shared')).filter((event) => event.approvalStatus !== 'planner-proposed')
  const eventItems: DisplayItem[] = baseEvents.map((event) => ({ ...event, id: event.id, event, context: event.coupleId !== coupleId }))
  const visibleItems = [...eventItems, ...activeCandidates]
  const selectedItems = visibleItems.filter((item) => item.date === selectedDate).sort((a, b) => a.time.localeCompare(b.time))
  const focused = selectedItems.find((item) => item.id === focusedId) ?? selectedItems.find((item) => item.request) ?? selectedItems[0]
  const currentMonth = monthKey(visibleMonth)
  const monthItems = visibleItems.filter((item) => item.date.startsWith(currentMonth))
  const firstWeekday = new Date(`${currentMonth}-01T00:00:00`).getDay()
  const daysInMonth = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1, 0).getDate()
  const overlapIds = new Set(selectedItems.flatMap((item, index) => selectedItems.slice(index + 1).flatMap((candidate) => timeMinutes(item.time) < timeMinutes(candidate.endTime) && timeMinutes(item.endTime) > timeMinutes(candidate.time) ? [item.id, candidate.id] : [])))
  const openRequestEdit = (request: MockCoordinationRequest) => { setEditingRequest(request); setDrawerOpen(true) }
  const saveMockRequest = (request: MockCoordinationRequest) => setMockRequests((current) => current.some((item) => item.id === request.id) ? current.map((item) => item.id === request.id ? request : item) : [request, ...current])
  const confirmMockSlot = (requestId: string, slotId: string) => setMockRequests((current) => current.map((item) => item.id === requestId ? { ...item, status: 'confirmed', response: { ...(item.response ?? { selectedSlotIds: [slotId], noneAvailable: false, note: '', respondedAt: '2026-08-05T10:30:00+09:00' }), selectedSlotIds: [slotId] } } : item))
  const cancelMockRequest = (requestId: string) => setMockRequests((current) => current.map((item) => item.id === requestId ? { ...item, status: 'cancelled' } : item))

  return <div className="coordination-workspace coordination-workspace--day-planner">
    <section className="coordination-request-board">
      <header><div><strong>일정 조율 요청</strong><span>고객에게 보낸 후보와 회신 상태를 관리합니다.</span></div><Button size="sm" icon={<Plus size={14} />} onClick={() => { setEditingRequest(null); setDrawerOpen(true) }}>일정 조율 요청</Button></header>
      <div className="coordination-request-list">{requests.map((request) => {
        const vendor = vendors.find((item) => item.id === request.vendorId)
        const response = latestCoordinationResponse(request)
        const meta = coordinationStatusMeta[request.status]
        const expanded = expandedRequestId === request.id
        return <article className={`${meta.className} ${expanded ? 'is-open' : ''}`} key={request.id}>
          <button className="coordination-request-row" onClick={() => setExpandedRequestId(expanded ? null : request.id)}><span className="coordination-request-row__state"><i />{meta.label}</span><strong>{request.title}</strong><span>{vendor?.category ?? '업체'} · 후보 {request.slots.length}개</span><time>{request.sentAt.slice(5, 10).replace('-', '.')} 발송</time><ChevronDown size={15} /></button>
          {expanded && <div className="coordination-request-detail">
            <div className="coordination-request-detail__meta"><span><strong>{vendor?.name}</strong>{request.location}</span><span><strong>{request.durationMinutes}분</strong>예상 소요 시간</span>{response && <span><strong>{response.noneAvailable ? '가능한 후보 없음' : `${response.selectedSlotIds.length}개 가능`}</strong>{response.respondedAt.slice(5, 10).replace('-', '.')} 회신</span>}</div>
            {response?.note && <blockquote>{response.note}</blockquote>}
            <div className="coordination-request-slots">{request.slots.map((slot) => { const selected = Boolean(response?.selectedSlotIds.includes(slot.id)); const conflict = candidateConflicts(slot, events); return <div className={selected ? 'is-selected' : ''} key={slot.id}><span>{formatCoordinationDate(slot.date)}</span><strong>{slot.time}–{slot.endTime}</strong>{conflict && <em><AlertTriangle size={12} /> 기존 일정과 겹침</em>}{selected && request.status === 'client-responded' && <Button size="xs" variant="success" icon={<Check size={12} />} onClick={() => confirmMockSlot(request.id, slot.id)}>이 시간 확정</Button>}</div> })}</div>
            <footer>{request.status !== 'confirmed' && request.status !== 'cancelled' && <><Button size="xs" variant="ghost" icon={<Pencil size={12} />} onClick={() => openRequestEdit(request)}>{response?.noneAvailable ? '후보 수정 후 재발송' : '후보 수정'}</Button><Button size="xs" variant="ghost" icon={<X size={12} />} onClick={() => cancelMockRequest(request.id)}>요청 취소</Button></>}</footer>
          </div>}
        </article>
      })}</div>
    </section>

    <div className="coordination-main coordination-main--planner">
      <Card padding="none" className="coordination-calendar">
        <header className="coordination-calendar__header"><button onClick={() => setVisibleMonth((current) => new Date(current.getFullYear(), current.getMonth() - 1, 1))} aria-label="이전 달"><ChevronLeft size={17} /></button><div><p className="eyebrow">Monthly view</p><h3>{visibleMonth.getFullYear()}년 {visibleMonth.getMonth() + 1}월</h3></div><button onClick={() => setVisibleMonth((current) => new Date(current.getFullYear(), current.getMonth() + 1, 1))} aria-label="다음 달"><ChevronRight size={17} /></button></header>
        <div className="coordination-calendar__status-legend"><label className="coordination-load-all"><input type="checkbox" checked={showAllPlannerEvents} onChange={(event) => { setShowAllPlannerEvents(event.target.checked); setFocusedId(null) }} /><span>전체 일정 불러오기</span></label>{showAllPlannerEvents && <span><i className="is-planner-context" />다른 고객·개인</span>}<span><i className="is-candidate" />조율 후보</span><span><i className="is-confirmed" />확정 일정</span></div>
        <div className="coordination-calendar__weekdays">{weekdays.map((day) => <span key={day}>{day}</span>)}</div>
        <div className="coordination-calendar__grid">{Array.from({ length: firstWeekday }).map((_, index) => <div className="coordination-calendar__blank" key={`blank-${index}`} />)}{Array.from({ length: daysInMonth }, (_, index) => index + 1).map((day) => { const date = `${currentMonth}-${String(day).padStart(2, '0')}`; const dayItems = monthItems.filter((item) => item.date === date).sort((a, b) => Number(Boolean(a.context)) - Number(Boolean(b.context)) || a.time.localeCompare(b.time)); return <button className={`coordination-calendar__day ${selectedDate === date ? 'selected' : ''}`} onClick={() => { setSelectedDate(date); setFocusedId(null) }} key={date}><strong>{day}</strong>{dayItems.slice(0, 3).map((item) => <span className={`coordination-calendar-event ${item.request ? 'is-candidate' : item.context ? 'is-planner-context' : 'is-confirmed'}`} title={item.title} key={item.id}>{item.time} {item.title}</span>)}</button> })}</div>
      </Card>

      <section className="coordination-day-section"><header><div><p className="eyebrow">24 hour planner</p><h2>{Number(selectedDate.slice(5, 7))}월 {Number(selectedDate.slice(8, 10))}일 일정</h2></div><div className="coordination-day-badges">{overlapIds.size > 0 && <Badge tone="amber"><AlertTriangle size={12} /> 시간 겹침</Badge>}<Badge tone="neutral">{selectedItems.length}건</Badge></div></header>
        <div className="coordination-day-planner"><div className="coordination-time-axis">{hours.map((hour) => <span style={{ height: HOUR_HEIGHT }} key={hour}>{String(hour).padStart(2, '0')}:00</span>)}</div><div className="coordination-time-grid" style={{ height: HOUR_HEIGHT * 24 }}>{hours.map((hour) => <i style={{ top: hour * HOUR_HEIGHT }} key={hour} />)}{selectedItems.map((item) => <button className={`coordination-planner-event ${item.request ? 'is-candidate' : item.context ? 'is-planner-context' : 'is-confirmed'} ${focused?.id === item.id ? 'active' : ''} ${overlapIds.has(item.id) ? 'has-conflict' : ''}`} style={plannerStyle(item, selectedItems)} onClick={() => setFocusedId(item.id)} key={item.id}><strong>{item.time}–{item.endTime}</strong><span>{item.title}</span><small>{item.request ? coordinationStatusMeta[item.request.status].label : item.context ? couples.find((couple) => couple.id === item.event?.coupleId)?.partners ?? '개인 일정' : '확정 일정'}</small></button>)}</div></div>
        {focused ? <Card className={`coordination-day-detail ${focused.context ? 'is-planner-context' : ''}`}><div><Badge tone={focused.request ? 'amber' : focused.context ? 'neutral' : 'sage'}>{focused.request ? '조율 후보' : focused.context ? '플래너 일정' : '확정 일정'}</Badge><h3>{focused.title}</h3><p><Clock3 size={13} /> {focused.time}–{focused.endTime}<i /><MapPin size={13} /> {focused.location}</p></div><div>{focused.context ? <span className="coordination-context-readonly"><Eye size={14} /> 일정 확인용</span> : focused.event ? <Button size="sm" variant="ghost" icon={<Pencil size={13} />} onClick={() => { setEditingEvent(focused.event!); setEventModalOpen(true) }}>수정</Button> : focused.request && <Button size="sm" variant="ghost" icon={<RotateCcw size={13} />} onClick={() => { setExpandedRequestId(focused.request!.id); document.querySelector('.coordination-request-board')?.scrollIntoView({ behavior: 'smooth' }) }}>요청 보기</Button>}</div></Card> : <Card className="coordination-empty"><CalendarClock size={22} /><strong>이 날짜에 공유 일정이 없습니다.</strong></Card>}
      </section>
    </div>
    <ScheduleCoordinationDrawer open={drawerOpen} coupleId={coupleId} request={editingRequest} onSubmit={saveMockRequest} onClose={() => { setDrawerOpen(false); setEditingRequest(null) }} />
    <AddEventModal open={eventModalOpen} initialDate={selectedDate} initialCoupleId={coupleId} initialEvent={editingEvent} context="couple-coordination" onClose={() => { setEventModalOpen(false); setEditingEvent(null) }} onAdded={() => undefined} />
  </div>
}
