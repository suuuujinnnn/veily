import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Check, ChevronRight, Clock3, PackageCheck } from 'lucide-react'
import { useDemoStore } from '../../app/store'
import { Badge, Card, ReminderDDay } from '../../components/ui'
import { OrderReminderCompleteButton } from '../../components/reminders/OrderReminderStatusControl'
import { PlannerCalendar } from '../calendar/PlannerCalendar'
import { buildPlannerTodos, type PlannerTodoKind } from '../todo/todoUtils'

const TODAY = '2026-08-05'
const weekDates = Array.from({ length: 7 }, (_, index) => {
  const date = new Date('2026-08-03T12:00:00')
  date.setDate(date.getDate() + index)
  return date.toISOString().slice(0, 10)
})
const todoIcon: Record<PlannerTodoKind, typeof PackageCheck> = { order: PackageCheck, 'follow-up': Clock3 }

export function DashboardPage() {
  const store = useDemoStore()
  const navigate = useNavigate()
  const [calendarView, setCalendarView] = useState<'week' | 'month'>('week')
  const { couples, events, orderReminders, vendors, customerFollowUps, completeOrderReminder, calendarDisplayPreferences } = store
  const weekEventCount = events.filter((event) => weekDates.includes(event.date)).length
  const todos = buildPlannerTodos({ couples, vendors, orderReminders, customerFollowUps }, TODAY).filter((item) => !item.completed)
  const overdueTodos = todos.filter((item) => item.urgency === 'overdue').length
  const openCalendar = () => navigate('/calendar')

  return <div className="dashboard-page dashboard-page--focused">
    <header className="dashboard-welcome">
      <div className="dashboard-welcome__date"><strong>05</strong><span>AUG<br />WED</span></div>
      <div className="dashboard-welcome__copy"><p>2026년 8월 5일 수요일</p><h1>좋은 아침이에요, 이지윤 플래너님.</h1><span>이번 주 일정과 처리할 리마인더를 함께 확인하세요.</span></div>
      <div className="dashboard-welcome__counts"><span><i>{weekEventCount}</i> 이번 주 일정</span><span><i>{todos.length}</i> 미완료 리마인더</span><span><i>{overdueTodos}</i> 기한 지남</span></div>
    </header>

    <section className="dashboard-workspace-grid">
      <div className="dashboard-shared-calendar">
        <PlannerCalendar events={events} couples={couples} view={calendarView} onViewChange={setCalendarView} selectedDate={TODAY} onDayClick={openCalendar} onEventClick={openCalendar} compact displayPreferences={calendarDisplayPreferences} />
        <Link className="dashboard-shared-calendar__link" to="/calendar">전체 일정 관리 <ChevronRight size={14} /></Link>
      </div>

      <Card padding="none" className="dashboard-home-todo">
        <header><div><p className="eyebrow">REMINDER</p><h2>리마인더</h2></div><Link to="/reminders"><Badge tone="neutral">{todos.length}건</Badge><ChevronRight size={14} /></Link></header>
        <div className="dashboard-home-todo__list">{todos.slice(0, 8).map((item) => {
          const Icon = todoIcon[item.kind]
          return <article className={`is-${item.urgency}`} key={item.id}>
            <span><Icon size={14} /></span>
            <Link to={item.href}><div><strong>{item.title}</strong><ReminderDDay dueAt={item.dueAt} today={TODAY} /></div><p>{item.customerName} · {item.context}</p></Link>
            {item.kind === 'order' ? <OrderReminderCompleteButton onComplete={() => completeOrderReminder(item.sourceId)} /> : <Link className="dashboard-home-todo__open" to={item.href}>열기</Link>}
          </article>
        })}{!todos.length && <div className="dashboard-home-todo__empty"><Check size={18} /><span>처리할 리마인더가 없습니다.</span></div>}</div>
      </Card>
    </section>
  </div>
}
