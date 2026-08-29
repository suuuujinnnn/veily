import { useMemo, useState } from 'react'
import { CalendarPlus, Palette } from 'lucide-react'
import { useDemoStore } from '../../app/store'
import { Button, SegmentedTabs } from '../../components/ui'
import { mockScheduleCoordinationRequests } from '../../data/scheduleCoordinationMock'
import type { CalendarColorMode, CalendarWorkCategory, WeddingEvent } from '../../types'
import { AddEventModal } from './AddEventModal'
import { CalendarColorSettingsModal } from './CalendarColorSettingsModal'
import { CalendarDayDrawer } from './CalendarDayDrawer'
import { PlannerCalendar } from './PlannerCalendar'
import { calendarCategoryForWorkflow, calendarWorkCategories, defaultCoupleColor, getCalendarCategory } from './calendarAppearance'

export function CalendarPage() {
  const { couples, events, calendarDisplayPreferences, setCalendarColorMode, setCalendarCoupleColors } = useDemoStore()
  const [view, setView] = useState<'month' | 'week'>('month')
  const [showPersonalEvents, setShowPersonalEvents] = useState(true)
  const [showCandidateEvents, setShowCandidateEvents] = useState(true)
  const [selectedCoupleId, setSelectedCoupleId] = useState<'all' | string>('all')
  const [selectedCategories, setSelectedCategories] = useState<Set<CalendarWorkCategory>>(() => new Set(calendarWorkCategories.map((item) => item.value)))
  const [selectedDate, setSelectedDate] = useState('2026-08-05')
  const [dayDrawerOpen, setDayDrawerOpen] = useState(false)
  const [eventModalOpen, setEventModalOpen] = useState(false)
  const [editingEvent, setEditingEvent] = useState<WeddingEvent | null>(null)
  const [toast, setToast] = useState(false)
  const [colorSettingsOpen, setColorSettingsOpen] = useState(false)
  const candidateEvents = useMemo<WeddingEvent[]>(() => mockScheduleCoordinationRequests
    .filter((request) => request.status === 'awaiting-client' || request.status === 'client-responded')
    .flatMap((request) => request.slots.map((slot) => ({
      id: `candidate-${slot.id}`, coupleId: request.coupleId, vendorId: request.vendorId,
      title: request.title, date: slot.date, time: slot.time, endTime: slot.endTime,
      type: request.type, location: request.location, workflowType: request.workflowId,
      calendarCategory: request.calendarCategory ?? calendarCategoryForWorkflow(request.workflowId, request.type),
      durationMinutes: request.durationMinutes, approvalStatus: 'planner-proposed' as const,
      visibility: 'couple-shared' as const,
    }))), [])
  const filteredEvents = useMemo(() => {
    const sharedEvents = events.filter((event) => event.visibility !== 'planner-private' && event.approvalStatus !== 'planner-proposed')
    const visibleSources = [...sharedEvents, ...(showPersonalEvents ? events.filter((event) => event.visibility === 'planner-private') : []), ...(showCandidateEvents ? candidateEvents : [])]
    return visibleSources.filter((event) => selectedCategories.has(getCalendarCategory(event)) && (event.visibility === 'planner-private' || selectedCoupleId === 'all' || event.coupleId === selectedCoupleId))
  }, [candidateEvents, events, selectedCategories, selectedCoupleId, showCandidateEvents, showPersonalEvents])
  const selectedEvents = useMemo(() => filteredEvents.filter((event) => event.date === selectedDate).sort((a, b) => a.time.localeCompare(b.time)), [filteredEvents, selectedDate])

  const added = () => { setToast(true); window.setTimeout(() => setToast(false), 2400) }
  const openDay = (date: string) => { setSelectedDate(date); setDayDrawerOpen(true) }
  const openNew = (date = selectedDate) => { setSelectedDate(date); setDayDrawerOpen(false); setEditingEvent(null); setEventModalOpen(true) }
  const openEdit = (event: WeddingEvent) => { if (event.approvalStatus === 'planner-proposed') return; setDayDrawerOpen(false); setEditingEvent(event); setEventModalOpen(true) }
  const toggleCategory = (category: CalendarWorkCategory) => setSelectedCategories((current) => { const next = new Set(current); if (next.has(category)) next.delete(category); else next.add(category); return next })
  const selectCouple = (coupleId: 'all' | string) => setSelectedCoupleId(coupleId)
  const resetFilters = () => { setShowPersonalEvents(true); setShowCandidateEvents(true); setSelectedCoupleId('all'); setSelectedCategories(new Set(calendarWorkCategories.map((item) => item.value))) }

  return <div className="page-stack calendar-page calendar-page--simple">
    <section className="page-intro"><div><p className="eyebrow">Shared calendar</p><h1>일정</h1><p>커플 일정과 개인 일정을 월간·주간 캘린더에서 확인하세요.</p></div><Button icon={<CalendarPlus size={16} />} onClick={() => openNew()}>새 일정 등록</Button></section>
    <div className="calendar-workspace">
      <aside className="calendar-filter-sidebar">
        <header><div><strong>내 캘린더</strong><span>{filteredEvents.length}개 일정 표시 중</span></div><button type="button" onClick={resetFilters}>필터 초기화</button></header>
        <section className="calendar-color-mode"><div className="calendar-filter-section-title"><h2>색상 기준</h2>{calendarDisplayPreferences.colorMode === 'customer' && <button type="button" onClick={() => setColorSettingsOpen(true)}><Palette size={11} /> 색상 관리</button>}</div><SegmentedTabs size="xs" value={calendarDisplayPreferences.colorMode} onChange={(value) => setCalendarColorMode(value as CalendarColorMode)} ariaLabel="일정 색상 기준" fluid items={[{ value: 'work-category', label: '업무 유형별' }, { value: 'customer', label: '고객별' }]} /></section>
        <section><h2>일정 표시</h2><div className="calendar-source-switches"><label><span><i className="calendar-source-dot is-private" />개인 일정</span><input type="checkbox" role="switch" checked={showPersonalEvents} onChange={(event) => setShowPersonalEvents(event.target.checked)} /><em aria-hidden="true" /></label><label><span><i className="calendar-source-dot is-candidate" />후보 일정</span><input type="checkbox" role="switch" checked={showCandidateEvents} onChange={(event) => setShowCandidateEvents(event.target.checked)} /><em aria-hidden="true" /></label></div></section>
        <section className="calendar-couple-filters"><h2>고객별 일정</h2><div className="calendar-couple-switches" role="radiogroup" aria-label="조회할 고객"><button type="button" role="radio" aria-checked={selectedCoupleId === 'all'} className={selectedCoupleId === 'all' ? 'active' : ''} onClick={() => selectCouple('all')}><i className="calendar-couple-dot is-all" /><span>전체 고객</span><em>ALL</em></button>{couples.map((couple) => <button type="button" role="radio" aria-checked={selectedCoupleId === couple.id} className={selectedCoupleId === couple.id ? 'active' : ''} onClick={() => selectCouple(couple.id)} key={couple.id}><i className="calendar-couple-dot" style={{ background: calendarDisplayPreferences.coupleColors[couple.id] ?? defaultCoupleColor(couple.id, couples) }} /><span>{couple.partners}</span><em>{selectedCoupleId === couple.id ? 'ON' : ''}</em></button>)}</div></section>
        <section><h2>업무 유형</h2>{calendarWorkCategories.map((category) => <label key={category.value}><input type="checkbox" checked={selectedCategories.has(category.value)} onChange={() => toggleCategory(category.value)} /><i className={`calendar-category-dot is-${category.value}`} /><span>{category.label}</span></label>)}</section>
      </aside>
      <div className="calendar-surface"><PlannerCalendar events={filteredEvents} couples={couples} view={view} onViewChange={setView} selectedDate={selectedDate} onDayClick={openDay} onAdd={openNew} onEventClick={openEdit} displayPreferences={calendarDisplayPreferences} /></div>
    </div>
    <CalendarDayDrawer open={dayDrawerOpen} date={selectedDate} events={selectedEvents} couples={couples} displayPreferences={calendarDisplayPreferences} onClose={() => setDayDrawerOpen(false)} onAdd={() => openNew(selectedDate)} onEdit={openEdit} />
    <CalendarColorSettingsModal open={colorSettingsOpen} couples={couples} colors={calendarDisplayPreferences.coupleColors} onChange={setCalendarCoupleColors} onClose={() => setColorSettingsOpen(false)} />
    <AddEventModal open={eventModalOpen} initialDate={selectedDate} initialEvent={editingEvent} onClose={() => { setEventModalOpen(false); setEditingEvent(null) }} onAdded={added} />
    {toast && <div className="toast"><span>✓</span><div><strong>일정을 등록했어요.</strong><p>캘린더에 바로 반영했습니다.</p></div></div>}
  </div>
}
