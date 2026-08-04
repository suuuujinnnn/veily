import { useMemo, useState } from 'react'
import { CalendarPlus, ChevronLeft, ChevronRight, Clock3, MapPin, Navigation, Plus } from 'lucide-react'
import { useDemoStore } from '../../app/store'
import { Badge, Button, Card } from '../../components/ui'
import { couples } from '../../data/mockData'
import { AddEventModal } from './AddEventModal'

const weekNames = ['일', '월', '화', '수', '목', '금', '토']
const filters = ['전체', '미팅', '드레스', '스튜디오', '메이크업', '계약']
const eventClass: Record<string, string> = { 미팅: 'amber', 드레스: 'rose', 스튜디오: 'sage', 메이크업: 'lilac', 계약: 'sand', 본식: 'dark' }

export function CalendarPage() {
  const { events } = useDemoStore()
  const [view, setView] = useState<'month' | 'week'>('month')
  const [filter, setFilter] = useState('전체')
  const [modalOpen, setModalOpen] = useState(false)
  const [toast, setToast] = useState(false)
  const filteredEvents = useMemo(() => events.filter((event) => filter === '전체' || event.type === filter), [events, filter])
  const today = filteredEvents.filter((event) => event.date === '2026-08-05')
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

  return (
    <div className="page-stack calendar-page">
      <section className="page-intro"><div><p className="eyebrow">Shared calendar</p><h1>일정</h1><p>커플별 일정과 이동 시간을 한눈에 조율하세요.</p></div><Button icon={<CalendarPlus size={16} />} onClick={() => setModalOpen(true)}>새 일정 등록</Button></section>
      <div className="calendar-toolbar">
        <div className="month-controller"><button aria-label="이전 달"><ChevronLeft size={18} /></button><h2>2026년 8월</h2><button aria-label="다음 달"><ChevronRight size={18} /></button><button className="today-button">오늘</button></div>
        <div className="calendar-view-toggle"><button onClick={() => setView('month')} className={view === 'month' ? 'active' : ''}>월</button><button onClick={() => setView('week')} className={view === 'week' ? 'active' : ''}>주</button></div>
      </div>
      <div className="calendar-filter-row"><span>일정 유형</span>{filters.map((item) => <button key={item} onClick={() => setFilter(item)} className={filter === item ? 'active' : ''}><i className={`filter-dot filter-dot--${eventClass[item] ?? 'all'}`} />{item}</button>)}</div>
      <div className="calendar-layout">
        <Card padding="none" className="month-calendar">
          <div className="week-header">{weekNames.map((name) => <span key={name}>{name}</span>)}</div>
          <div className={`month-grid ${view === 'week' ? 'month-grid--week' : ''}`}>
            {monthDays.map((item, index) => {
              const dayEvents = filteredEvents.filter((event) => event.date === item.date)
              const isToday = item.date === '2026-08-05'
              if (view === 'week' && (index < 2 || index > 8)) return null
              return <div key={item.date} className={`calendar-cell ${!item.current ? 'calendar-cell--muted' : ''} ${isToday ? 'calendar-cell--today' : ''}`}><div className="calendar-cell__top"><span>{item.day}</span>{isToday && <small>오늘</small>}<button onClick={() => setModalOpen(true)} aria-label={`${item.day}일 일정 추가`}><Plus size={13} /></button></div><div className="calendar-cell__events">{dayEvents.slice(0, view === 'week' ? 5 : 3).map((event) => <div key={event.id} className={`calendar-event calendar-event--${eventClass[event.type]}`}><strong>{event.time}</strong><span>{event.title}</span></div>)}{dayEvents.some((event) => event.travelMinutes) && <div className="travel-event"><Navigation size={11} /> 이동 {dayEvents.find((event) => event.travelMinutes)?.travelMinutes}분</div>}{dayEvents.length > 3 && view === 'month' && <small>+{dayEvents.length - 3}개 더 보기</small>}</div></div>
            })}
          </div>
        </Card>
        <aside className="day-panel">
          <div className="day-panel__heading"><div><span>05</span><p><strong>수요일</strong><small>2026년 8월</small></p></div><Badge tone="rose">{today.length} 일정</Badge></div>
          <div className="day-schedule">{today.map((event, index) => { const couple = couples.find((item) => item.id === event.coupleId); return <div className="day-event" key={event.id}><span className={`day-event__line day-event__line--${eventClass[event.type]}`} /><div className="day-event__time"><strong>{event.time}</strong><span>{event.endTime}</span></div><div className="day-event__body"><Badge tone={index === 1 ? 'sage' : 'rose'}>{event.type}</Badge><h3>{event.title}</h3><p>{couple?.partners}</p><small><MapPin size={12} /> {event.location}</small></div>{event.travelMinutes && <div className="day-travel"><Clock3 size={13} /> 다음 장소까지<br /><strong>{event.travelMinutes}분 예상</strong></div>}</div>})}</div>
          <button className="day-panel__add" onClick={() => setModalOpen(true)}><Plus size={15} /> 이 날 일정 추가</button>
        </aside>
      </div>
      <AddEventModal open={modalOpen} onClose={() => setModalOpen(false)} onAdded={added} />
      {toast && <div className="toast"><span>✓</span><div><strong>일정이 등록되었어요.</strong><p>캘린더와 커플 상세에 바로 반영했습니다.</p></div></div>}
    </div>
  )
}
