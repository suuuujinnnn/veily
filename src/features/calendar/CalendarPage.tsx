import { useMemo, useState } from 'react'
import { AlertTriangle, ArrowRight, CalendarPlus, ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import { useDemoStore } from '../../app/store'
import { Button, Card } from '../../components/ui'
import type { WeddingEvent } from '../../types'
import { AddEventModal } from './AddEventModal'
import { CalendarDayModal } from './CalendarDayModal'
import { findCalendarConflicts } from './calendarUtils'

const weekNames = ['일', '월', '화', '수', '목', '금', '토']
const filters = ['전체', '미팅', '드레스', '스튜디오', '메이크업', '계약', '본식']
const eventClass: Record<string, string> = { 미팅: 'meeting', 드레스: 'dress', 스튜디오: 'studio', 메이크업: 'makeup', 계약: 'contract', 본식: 'ceremony' }

export function CalendarPage() {
  const { couples, events } = useDemoStore()
  const [view, setView] = useState<'month' | 'week'>('month')
  const [filter, setFilter] = useState('전체')
  const [selectedDate, setSelectedDate] = useState('2026-08-05')
  const [dayModalOpen, setDayModalOpen] = useState(false)
  const [eventModalOpen, setEventModalOpen] = useState(false)
  const [editingEvent, setEditingEvent] = useState<WeddingEvent | null>(null)
  const [toast, setToast] = useState(false)
  const filteredEvents = useMemo(() => events.filter((event) => filter === '전체' || event.type === filter), [events, filter])
  const conflicts = useMemo(() => findCalendarConflicts(events), [events])
  const conflictIds = useMemo(() => new Set(conflicts.flatMap((conflict) => [conflict.first.id, conflict.second.id])), [conflicts])
  const selectedEvents = useMemo(() => filteredEvents.filter((event) => event.date === selectedDate).sort((a, b) => a.time.localeCompare(b.time)), [filteredEvents, selectedDate])
  const monthDays = Array.from({ length: 42 }, (_, index) => { const day = index - 5; if (day < 1) return { day: 31 + day, current: false, date: `2026-07-${String(31 + day).padStart(2,'0')}` }; if (day > 31) return { day: day - 31, current: false, date: `2026-09-${String(day - 31).padStart(2,'0')}` }; return { day, current: true, date: `2026-08-${String(day).padStart(2,'0')}` } })

  const added = () => { setToast(true); window.setTimeout(() => setToast(false), 2400) }
  const openDay = (date: string) => { setSelectedDate(date); setDayModalOpen(true) }
  const openNew = (date = selectedDate) => { setSelectedDate(date); setDayModalOpen(false); setEditingEvent(null); setEventModalOpen(true) }
  const openEdit = (event: WeddingEvent) => { setDayModalOpen(false); setEditingEvent(event); setEventModalOpen(true) }
  const openConflict = () => { if (conflicts[0]) openDay(conflicts[0].date) }

  return <div className="page-stack calendar-page calendar-page--simple">
    <section className="page-intro"><div><p className="eyebrow">Shared calendar</p><h1>일정</h1><p>커플 일정과 개인 일정을 월간·주간 캘린더에서 확인하세요.</p></div><Button icon={<CalendarPlus size={16} />} onClick={() => openNew()}>새 일정 등록</Button></section>
    {conflicts.length > 0 && <section className="calendar-conflict-alert" role="alert"><span><AlertTriangle size={19} /></span><div><strong>겹치는 일정 {conflicts.length}건이 있습니다.</strong><p>{Number(conflicts[0].date.slice(-2))}일 {conflicts[0].first.time} {conflicts[0].first.title}과 {conflicts[0].second.time} {conflicts[0].second.title}</p></div><button onClick={openConflict}>일정 확인 <ArrowRight size={14} /></button></section>}
    <div className="calendar-toolbar"><div className="month-controller"><button aria-label="이전 달"><ChevronLeft size={18} /></button><h2>2026년 8월</h2><button aria-label="다음 달"><ChevronRight size={18} /></button><button className="today-button" onClick={() => openDay('2026-08-05')}>오늘</button></div><div className="calendar-view-toggle"><button onClick={() => setView('month')} className={view === 'month' ? 'active' : ''}>월</button><button onClick={() => setView('week')} className={view === 'week' ? 'active' : ''}>주</button></div></div>
    <div className="calendar-filter-row"><span>일정 유형</span>{filters.map((item) => <button key={item} onClick={() => setFilter(item)} className={filter === item ? 'active' : ''}><i className={`filter-dot filter-dot--${eventClass[item] ?? 'all'}`} />{item}</button>)}</div>
    <div className="calendar-layout calendar-layout--full"><Card padding="none" className="month-calendar"><div className="week-header">{weekNames.map((name) => <span key={name}>{name}</span>)}</div><div className={`month-grid ${view === 'week' ? 'month-grid--week' : ''}`}>{monthDays.map((item, index) => {
      const dayEvents = filteredEvents.filter((event) => event.date === item.date).sort((a, b) => a.time.localeCompare(b.time))
      const visibleEvents = dayEvents.slice(0, view === 'week' ? 6 : 3)
      const isToday = item.date === '2026-08-05'
      const hasConflict = conflicts.some((conflict) => conflict.date === item.date)
      if (view === 'week' && (index < 7 || index > 13)) return null
      return <div key={item.date} role="button" tabIndex={0} onClick={() => openDay(item.date)} onKeyDown={(event) => { if (event.key === 'Enter') openDay(item.date) }} className={`calendar-cell ${!item.current ? 'calendar-cell--muted' : ''} ${isToday ? 'calendar-cell--today' : ''} ${selectedDate === item.date ? 'calendar-cell--selected' : ''} ${hasConflict ? 'calendar-cell--conflict' : ''}`}><div className="calendar-cell__top"><span>{item.day}</span>{hasConflict ? <small className="cell-conflict"><AlertTriangle size={10} /> 겹침</small> : isToday && <small>오늘</small>}<button onClick={(event) => { event.stopPropagation(); openNew(item.date) }} aria-label={`${item.day}일 일정 추가`}><Plus size={13} /></button></div><div className="calendar-cell__events">{visibleEvents.map((event) => <div role="button" tabIndex={0} onClick={(clickEvent) => { clickEvent.stopPropagation(); openEdit(event) }} className={`calendar-event calendar-event--${event.visibility === 'planner-private' ? 'private' : eventClass[event.type]} ${conflictIds.has(event.id) ? 'calendar-event--conflict' : ''}`} key={event.id}><strong>{event.time}</strong><span>{event.title}</span>{event.visibility === 'planner-private' && <small>개인</small>}{conflictIds.has(event.id) && <AlertTriangle size={10} />}</div>)}{dayEvents.length > visibleEvents.length && <small>+{dayEvents.length - visibleEvents.length}개 일정 더 보기</small>}</div></div>
    })}</div></Card></div>
    <CalendarDayModal open={dayModalOpen} date={selectedDate} events={selectedEvents} couples={couples} conflictIds={conflictIds} onClose={() => setDayModalOpen(false)} onAdd={() => openNew(selectedDate)} onEdit={openEdit} />
    <AddEventModal open={eventModalOpen} initialDate={selectedDate} initialEvent={editingEvent} onClose={() => { setEventModalOpen(false); setEditingEvent(null) }} onAdded={added} />
    {toast && <div className="toast"><span>✓</span><div><strong>일정이 등록되었어요.</strong><p>캘린더에 바로 반영했습니다.</p></div></div>}
  </div>
}
