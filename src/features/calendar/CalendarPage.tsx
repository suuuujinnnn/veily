import { Fragment, useMemo, useState } from 'react'
import { AlertTriangle, ArrowRight, Building2, CalendarPlus, Car, ChevronLeft, ChevronRight, Home, MapPin, Plus, Settings2 } from 'lucide-react'
import { useDemoStore } from '../../app/store'
import { Badge, Button, Card } from '../../components/ui'
import { couples } from '../../data/mockData'
import type { WeddingEvent } from '../../types'
import { AddEventModal } from './AddEventModal'
import { buildTravelPlans, findCalendarConflicts, type TransitPreference } from './calendarUtils'
import { TravelLegBlock } from './TravelLegBlock'

const weekNames = ['일', '월', '화', '수', '목', '금', '토']
const filters = ['전체', '미팅', '드레스', '스튜디오', '메이크업', '계약', '본식']
const eventClass: Record<string, string> = {
  미팅: 'meeting', 드레스: 'dress', 스튜디오: 'studio', 메이크업: 'makeup', 계약: 'contract', 본식: 'ceremony',
}

export function CalendarPage() {
  const { events } = useDemoStore()
  const [view, setView] = useState<'month' | 'week'>('month')
  const [filter, setFilter] = useState('전체')
  const [selectedDate, setSelectedDate] = useState('2026-08-05')
  const [transitPreference, setTransitPreference] = useState<TransitPreference>('bus')
  const [baseLocation, setBaseLocation] = useState('VEILY 오피스 · 한남')
  const [useCar, setUseCar] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [toast, setToast] = useState(false)

  const filteredEvents = useMemo(() => events.filter((event) => filter === '전체' || event.type === filter), [events, filter])
  const conflicts = useMemo(() => findCalendarConflicts(events), [events])
  const conflictIds = useMemo(() => new Set(conflicts.flatMap((conflict) => [conflict.first.id, conflict.second.id])), [conflicts])
  const selectedEvents = useMemo(
    () => filteredEvents.filter((event) => event.date === selectedDate).sort((a, b) => a.time.localeCompare(b.time)),
    [filteredEvents, selectedDate],
  )
  const travelPlans = useMemo(
    () => buildTravelPlans(selectedEvents, baseLocation, transitPreference, useCar),
    [selectedEvents, baseLocation, transitPreference, useCar],
  )
  const travelPlanByEvent = new Map(travelPlans.map((plan) => [plan.eventId, plan]))
  const selectedDateObject = new Date(`${selectedDate}T00:00:00`)
  const selectedDayConflict = conflicts.some((conflict) => conflict.date === selectedDate)

  const monthDays = Array.from({ length: 42 }, (_, index) => {
    const day = index - 5
    if (day < 1) return { day: 31 + day, current: false, date: `2026-07-${String(31 + day).padStart(2,'0')}` }
    if (day > 31) return { day: day - 31, current: false, date: `2026-09-${String(day - 31).padStart(2,'0')}` }
    return { day, current: true, date: `2026-08-${String(day).padStart(2,'0')}` }
  })

  const added = () => {
    setToast(true)
    window.setTimeout(() => setToast(false), 2400)
  }

  const openConflict = () => {
    if (conflicts[0]) setSelectedDate(conflicts[0].date)
  }

  return (
    <div className="page-stack calendar-page">
      <section className="page-intro"><div><p className="eyebrow">Shared calendar</p><h1>일정</h1><p>일정 사이 이동시간과 겹치는 시간을 함께 확인하세요.</p></div><Button icon={<CalendarPlus size={16} />} onClick={() => setModalOpen(true)}>새 일정 등록</Button></section>

      <section className="calendar-route-settings">
        <div className="calendar-route-settings__intro"><span><Settings2 size={18} /></span><div><strong>이동 기준 설정</strong><p>첫 일정 전과 마지막 일정 후에는 선택한 기준 위치를 사용합니다.</p></div></div>
        <label><span>자주 이용하는 교통</span><select value={transitPreference} onChange={(event) => setTransitPreference(event.target.value as TransitPreference)}><option value="bus">버스 중심</option><option value="subway">지하철 중심</option><option value="car">자차 중심</option></select></label>
        <label><span>기준 위치</span><select value={baseLocation} onChange={(event) => setBaseLocation(event.target.value)}><option>VEILY 오피스 · 한남</option><option>집 · 잠실</option><option>집 · 성수</option></select></label>
        <label className="car-toggle"><input type="checkbox" checked={useCar} disabled={transitPreference === 'car'} onChange={(event) => setUseCar(event.target.checked)} /><span><Car size={14} /></span><div><strong>자차 병행</strong><small>일부 구간 자동 추천</small></div></label>
      </section>

      {conflicts.length > 0 && <section className="calendar-conflict-alert" role="alert"><span><AlertTriangle size={19} /></span><div><strong>겹치는 일정 {conflicts.length}건이 있습니다.</strong><p>{Number(conflicts[0].date.slice(-2))}일 {conflicts[0].first.time} {conflicts[0].first.title}과 {conflicts[0].second.time} {conflicts[0].second.title}</p></div><button onClick={openConflict}>일정 확인 <ArrowRight size={14} /></button></section>}

      <div className="calendar-toolbar">
        <div className="month-controller"><button aria-label="이전 달"><ChevronLeft size={18} /></button><h2>2026년 8월</h2><button aria-label="다음 달"><ChevronRight size={18} /></button><button className="today-button" onClick={() => setSelectedDate('2026-08-05')}>오늘</button></div>
        <div className="calendar-view-toggle"><button onClick={() => setView('month')} className={view === 'month' ? 'active' : ''}>월</button><button onClick={() => setView('week')} className={view === 'week' ? 'active' : ''}>주</button></div>
      </div>
      <div className="calendar-filter-row"><span>일정 유형</span>{filters.map((item) => <button key={item} onClick={() => setFilter(item)} className={filter === item ? 'active' : ''}><i className={`filter-dot filter-dot--${eventClass[item] ?? 'all'}`} />{item}</button>)}</div>
      <div className="calendar-layout calendar-layout--routes">
        <Card padding="none" className="month-calendar">
          <div className="week-header">{weekNames.map((name) => <span key={name}>{name}</span>)}</div>
          <div className={`month-grid ${view === 'week' ? 'month-grid--week' : ''}`}>
            {monthDays.map((item, index) => {
              const dayEvents = filteredEvents.filter((event) => event.date === item.date).sort((a, b) => a.time.localeCompare(b.time))
              const dayPlans = buildTravelPlans(dayEvents, baseLocation, transitPreference, useCar)
              const dayPlanByEvent = new Map(dayPlans.map((plan) => [plan.eventId, plan]))
              const visibleEvents = dayEvents.slice(0, view === 'week' ? 5 : 3)
              const finalVisiblePlan = visibleEvents.length === dayEvents.length ? dayPlanByEvent.get(visibleEvents.at(-1)?.id ?? '') : undefined
              const isToday = item.date === '2026-08-05'
              const hasConflict = conflicts.some((conflict) => conflict.date === item.date)
              if (view === 'week' && (index < 7 || index > 13)) return null
              return <div
                key={item.date}
                role="button"
                tabIndex={0}
                onClick={() => setSelectedDate(item.date)}
                onKeyDown={(event) => { if (event.key === 'Enter') setSelectedDate(item.date) }}
                className={`calendar-cell ${!item.current ? 'calendar-cell--muted' : ''} ${isToday ? 'calendar-cell--today' : ''} ${selectedDate === item.date ? 'calendar-cell--selected' : ''} ${hasConflict ? 'calendar-cell--conflict' : ''}`}
              >
                <div className="calendar-cell__top"><span>{item.day}</span>{hasConflict ? <small className="cell-conflict"><AlertTriangle size={10} /> 겹침</small> : isToday && <small>오늘</small>}<button onClick={(event) => { event.stopPropagation(); setModalOpen(true) }} aria-label={`${item.day}일 일정 추가`}><Plus size={13} /></button></div>
                <div className="calendar-cell__events calendar-cell__events--timeline">
                  {visibleEvents.map((event) => {
                    const plan = dayPlanByEvent.get(event.id)
                    return <Fragment key={event.id}>
                      {plan && <TravelLegBlock leg={plan.before} position="before" />}
                      <div className={`calendar-event calendar-event--${eventClass[event.type]} ${conflictIds.has(event.id) ? 'calendar-event--conflict' : ''}`}><strong>{event.time}</strong><span>{event.title}</span>{conflictIds.has(event.id) && <AlertTriangle size={10} />}</div>
                    </Fragment>
                  })}
                  {finalVisiblePlan && <TravelLegBlock leg={finalVisiblePlan.after} position="after" />}
                  {dayEvents.length > visibleEvents.length && <small>+{dayEvents.length - visibleEvents.length}개 일정 더 보기</small>}
                </div>
              </div>
            })}
          </div>
        </Card>
        <aside className={`day-panel day-panel--routes ${selectedDayConflict ? 'day-panel--conflict' : ''}`}>
          <div className="day-panel__heading"><div><span>{String(selectedDateObject.getDate()).padStart(2, '0')}</span><p><strong>{selectedDateObject.toLocaleDateString('ko-KR', { weekday: 'long' })}</strong><small>{selectedDateObject.getFullYear()}년 {selectedDateObject.getMonth() + 1}월</small></p></div><Badge tone={selectedDayConflict ? 'amber' : 'rose'}>{selectedEvents.length} 일정</Badge></div>
          {selectedDayConflict && <div className="day-conflict-note"><AlertTriangle size={14} /> 이 날짜에 겹치는 일정이 있습니다.</div>}
          <div className="day-schedule">
            {selectedEvents.length ? selectedEvents.map((event, index) => {
              const couple = couples.find((item) => item.id === event.coupleId)
              const plan = travelPlanByEvent.get(event.id)
              return <div className="day-route-group" key={event.id}>
                {plan && <TravelLegBlock leg={plan.before} position="before" variant="panel" />}
                <div className={`day-event day-event--${eventClass[event.type]} ${conflictIds.has(event.id) ? 'day-event--conflict' : ''}`}><span className={`day-event__line day-event__line--${eventClass[event.type]}`} /><div className="day-event__time"><strong>{event.time}</strong><span>{event.endTime}</span></div><div className="day-event__body"><span className={`event-type-pill event-type-pill--${eventClass[event.type]}`}>{event.type}</span><h3>{event.title}</h3><p>{couple?.partners}</p><small><MapPin size={12} /> {event.location}</small></div>{conflictIds.has(event.id) && <AlertTriangle className="day-event__warning" size={15} />}</div>
                {plan && index === selectedEvents.length - 1 && <TravelLegBlock leg={plan.after} position="after" variant="panel" />}
              </div>
            }) : <div className="day-empty"><Building2 size={20} /><strong>등록된 일정이 없습니다.</strong><p>{baseLocation}을 기준으로 새 일정을 추가할 수 있습니다.</p></div>}
          </div>
          <div className="day-base-location">{baseLocation.startsWith('집') ? <Home size={13} /> : <Building2 size={13} />}<span>기준 위치</span><strong>{baseLocation}</strong></div>
          <button className="day-panel__add" onClick={() => setModalOpen(true)}><Plus size={15} /> 이 날 일정 추가</button>
        </aside>
      </div>
      <AddEventModal open={modalOpen} onClose={() => setModalOpen(false)} onAdded={added} />
      {toast && <div className="toast"><span>✓</span><div><strong>일정이 등록되었어요.</strong><p>캘린더와 커플 상세에 바로 반영했습니다.</p></div></div>}
    </div>
  )
}
