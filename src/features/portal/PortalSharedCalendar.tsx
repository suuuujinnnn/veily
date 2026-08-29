import { useMemo, useState } from 'react'
import { CalendarCheck2, CalendarClock, Check, ChevronDown, Clock3, MapPin, Send } from 'lucide-react'
import { useDemoStore } from '../../app/store'
import { Button } from '../../components/ui'
import { mockScheduleCoordinationRequests, type MockCoordinationRequest } from '../../data/scheduleCoordinationMock'
import type { WeddingEvent } from '../../types'
import { PlannerCalendar } from '../calendar/PlannerCalendar'
import { formatCoordinationDate } from '../calendar/scheduleCoordination'

export function PortalSharedCalendar({ coupleId }: { coupleId: string }) {
  const { couples, events, vendors } = useDemoStore()
  const requests = useMemo(() => mockScheduleCoordinationRequests.filter((request) => request.coupleId === coupleId && request.status !== 'cancelled'), [coupleId])
  const activeRequests = requests.filter((request) => request.status !== 'confirmed')
  const [view, setView] = useState<'month' | 'week'>('month')
  const [selectedDate, setSelectedDate] = useState('2026-08-12')
  const [expandedRequestId, setExpandedRequestId] = useState<string | null>(() => activeRequests.find((request) => request.status === 'awaiting-client')?.id ?? activeRequests[0]?.id ?? null)
  const [selectedByRequest, setSelectedByRequest] = useState<Record<string, string[]>>(() => Object.fromEntries(requests.map((request) => [request.id, request.response?.selectedSlotIds ?? []])))
  const [noneByRequest, setNoneByRequest] = useState<Record<string, boolean>>(() => Object.fromEntries(requests.map((request) => [request.id, request.response?.noneAvailable ?? false])))
  const [notes, setNotes] = useState<Record<string, string>>(() => Object.fromEntries(requests.map((request) => [request.id, request.response?.note ?? ''])))
  const [sentRequestIds, setSentRequestIds] = useState<string[]>(requests.filter((request) => request.status === 'client-responded').map((request) => request.id))

  const coupleEvents = events.filter((event) => event.coupleId === coupleId && event.visibility === 'couple-shared' && event.approvalStatus !== 'planner-proposed')
  const candidateItems = activeRequests.flatMap((request) => request.slots.map((slot) => ({ ...slot, request })))
  const candidateEvents: WeddingEvent[] = candidateItems.map((item) => ({
    id: item.id,
    coupleId,
    vendorId: item.request.vendorId,
    title: item.request.title,
    date: item.date,
    time: item.time,
    endTime: item.endTime,
    type: item.request.type,
    calendarCategory: item.request.calendarCategory,
    location: item.request.location,
    workflowType: item.request.workflowId,
    durationMinutes: item.request.durationMinutes,
    approvalStatus: 'planner-proposed',
    visibility: 'couple-shared',
  }))
  const selectedEvents = coupleEvents.filter((event) => event.date === selectedDate)
  const selectedCandidates = candidateItems.filter((item) => item.date === selectedDate)

  const toggleSlot = (request: MockCoordinationRequest, slotId: string) => {
    if (noneByRequest[request.id]) return
    setSentRequestIds((current) => current.filter((id) => id !== request.id))
    setSelectedByRequest((current) => {
      const selected = current[request.id] ?? []
      return { ...current, [request.id]: selected.includes(slotId) ? selected.filter((id) => id !== slotId) : [...selected, slotId] }
    })
  }

  const toggleNone = (requestId: string) => {
    setSentRequestIds((current) => current.filter((id) => id !== requestId))
    setNoneByRequest((current) => ({ ...current, [requestId]: !current[requestId] }))
    setSelectedByRequest((current) => ({ ...current, [requestId]: [] }))
  }

  return <section className="portal-shared-calendar portal-shared-calendar--coordination">
    <div className="portal-shared-calendar__heading">
      <div><p className="eyebrow">Shared calendar</p><h2>공유 캘린더</h2><p>플래너가 보낸 후보 중 가능한 시간을 선택해 주세요.</p></div>
      <div className="coordination-status-summary"><span><i className="is-proposed" />조율 후보</span><span><i className="is-client-ok" />회신 완료</span><span><i className="is-confirmed" />최종 확정</span></div>
    </div>

    {activeRequests.length > 0 && <div className="portal-coordination-requests">
      {activeRequests.map((request) => {
        const vendor = vendors.find((item) => item.id === request.vendorId)
        const selected = selectedByRequest[request.id] ?? []
        const noneAvailable = Boolean(noneByRequest[request.id])
        const sent = sentRequestIds.includes(request.id)
        const expanded = expandedRequestId === request.id
        return <section className={`portal-coordination-request ${sent ? 'is-sent' : ''} ${expanded ? 'is-expanded' : ''}`} key={request.id}>
          <button type="button" className="portal-coordination-request__summary" aria-expanded={expanded} onClick={() => setExpandedRequestId(expanded ? null : request.id)}>
            <span className="portal-coordination-request__state">{sent ? <><Check size={12} /> 회신 완료</> : '응답 필요'}</span>
            <span className="portal-coordination-request__copy"><small>{vendor?.category} · {vendor?.name}</small><strong>{request.title}</strong></span>
            <span className="portal-coordination-request__meta">후보 {request.slots.length}개 · {request.durationMinutes}분</span>
            <ChevronDown className="portal-coordination-request__chevron" size={15} />
          </button>

          {expanded && <div className="portal-coordination-request__body">
            <p className="portal-coordination-request__location"><MapPin size={12} />{request.location}</p>
            <div className="portal-coordination-slot-groups">
              {[...new Set(request.slots.map((slot) => slot.date))].map((date) => <div key={date}>
                <strong>{formatCoordinationDate(date)}</strong>
                <div>{request.slots.filter((slot) => slot.date === date).map((slot) => {
                  const active = selected.includes(slot.id)
                  return <button type="button" className={active ? 'selected' : ''} disabled={noneAvailable} onClick={() => toggleSlot(request, slot.id)} key={slot.id}><span>{active && <Check size={12} />}</span><b>{slot.time}</b><i>–</i>{slot.endTime}</button>
                })}</div>
              </div>)}
            </div>
            <label className="portal-none-available"><input type="checkbox" checked={noneAvailable} onChange={() => toggleNone(request.id)} /><span><strong>가능한 일정이 없어요</strong><small>다른 후보가 필요하면 알려주세요.</small></span></label>
            {noneAvailable && <textarea rows={2} value={notes[request.id] ?? ''} onChange={(event) => setNotes((current) => ({ ...current, [request.id]: event.target.value }))} placeholder="가능한 요일이나 시간을 적어주세요." />}
            <footer><span>{sent ? '선택한 내용이 플래너에게 전달되었어요.' : '가능한 시간은 여러 개 선택할 수 있어요.'}</span><Button size="sm" icon={<Send size={13} />} disabled={!noneAvailable && selected.length === 0} onClick={() => setSentRequestIds((current) => current.includes(request.id) ? current : [...current, request.id])}>{sent ? '응답 수정하기' : '선택 일정 보내기'}</Button></footer>
          </div>}
        </section>
      })}
    </div>}

    <div className="portal-coordination-calendar-grid">
      <div className="portal-shared-calendar__calendar">
        <PlannerCalendar
          events={[...coupleEvents, ...candidateEvents]}
          couples={couples.filter((couple) => couple.id === coupleId)}
          view={view}
          onViewChange={setView}
          selectedDate={selectedDate}
          onDayClick={setSelectedDate}
          showCustomerLabels={false}
          showConflictAlerts={false}
        />
      </div>
      <section className="portal-selected-day">
        <header><span>{Number(selectedDate.slice(5, 7))}월 {Number(selectedDate.slice(8, 10))}일</span><strong>이 날의 일정</strong></header>
        <div>
          {selectedCandidates.map((item) => <article className={(selectedByRequest[item.request.id] ?? []).includes(item.id) ? 'is-selected' : ''} key={item.id}><CalendarClock size={15} /><div><small>조율 후보</small><strong>{item.time}–{item.endTime}</strong><span>{item.request.title}</span></div></article>)}
          {selectedEvents.map((event) => <article className="is-confirmed" key={event.id}><CalendarCheck2 size={15} /><div><small>최종 확정</small><strong>{event.time}–{event.endTime}</strong><span>{event.title}</span></div></article>)}
          {selectedCandidates.length + selectedEvents.length === 0 && <div className="portal-selected-day__empty"><Clock3 size={19} /><span>등록된 일정이 없습니다.</span></div>}
        </div>
      </section>
    </div>
  </section>
}
