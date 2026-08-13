import { Link } from 'react-router-dom'
import { Activity, AlertTriangle, ArrowUpRight, CalendarDays, CalendarPlus, CheckCircle2, ChevronRight, Clock3, MapPin, MessageSquareText, TrendingUp } from 'lucide-react'
import { useDemoStore } from '../../app/store'
import { formatChecklistDate } from '../checklist/checklistUtils'
import { Badge, Button, Card, Progress } from '../../components/ui'
import { ReminderListItem } from '../../components/reminders/ReminderListItem'
import { buildReminders } from '../reminders/reminderUtils'

const typeTone: Record<string, 'rose' | 'sage' | 'amber' | 'neutral'> = {
  드레스: 'rose', 스튜디오: 'sage', 미팅: 'amber', 메이크업: 'rose', 계약: 'neutral', 본식: 'rose',
}

export function DashboardPage() {
  const { couples, events, checklist, recommendations, orderApprovals, vendors } = useDemoStore()
  const reminders = buildReminders({ couples, events, recommendations, orderApprovals, vendors }, 'planner')
  const todayEvents = events.filter((event) => event.date === '2026-08-05')
  const remainingTasks = checklist.filter((item) => !item.completed).length
  const waitingResponses = recommendations.filter((item) => item.status === 'pending').length
  const activeCouples = couples.filter((couple) => couple.status !== '확정')

  return (
    <div className="dashboard-page page-stack">
      <section className="dashboard-command">
        <div className="dashboard-command__top">
          <div><p className="eyebrow">PLANNER WORKSPACE · 2026.08.05</p><h1>운영 대시보드</h1><p>오늘 일정과 고객 응답, 마감 업무를 기준으로 정리했습니다.</p></div>
          <div className="dashboard-command__actions"><span><i /> 모든 데이터 동기화됨</span><Link to="/calendar"><Button icon={<CalendarPlus size={16} />}>일정 등록</Button></Link></div>
        </div>
        <div className="dashboard-metrics">
          <article><span className="metric-icon"><CalendarDays size={18} /></span><div><small>오늘 일정</small><strong>{todayEvents.length}<em>건</em></strong><p>다음 일정 10:30</p></div></article>
          <article><span className="metric-icon"><AlertTriangle size={18} /></span><div><small>확인 필요</small><strong>{reminders.length}<em>건</em></strong><p>발주·선택 기한 중심</p></div></article>
          <article><span className="metric-icon"><MessageSquareText size={18} /></span><div><small>고객 응답 대기</small><strong>{waitingResponses + 2}<em>건</em></strong><p>어제보다 2건 감소</p></div></article>
          <article><span className="metric-icon"><CheckCircle2 size={18} /></span><div><small>이번 주 완료</small><strong>18<em>건</em></strong><p><TrendingUp size={11} /> 완료율 81%</p></div></article>
        </div>
      </section>

      <section className="dashboard-primary">
        <div className="dashboard-primary__heading"><div><p className="eyebrow">Today · August 05</p><h2>오늘 일정</h2></div><Link to="/calendar">전체 일정 <ChevronRight size={15} /></Link></div>
        <div className="dashboard-primary-grid">
          <Card className="timeline-card" padding="none">
            {todayEvents.map((event, index) => {
              const couple = couples.find((item) => item.id === event.coupleId)
              return (
                <div className="timeline-row" key={event.id}>
                  <div className="timeline-time"><strong>{event.time}</strong><span>{event.endTime}</span></div>
                  <span className={`timeline-dot timeline-dot--${index + 1}`} />
                  <div className="timeline-info"><div><Badge tone={typeTone[event.type]}>{event.type}</Badge><span className="muted">{couple?.partners}</span></div><h3>{event.title}</h3><p><MapPin size={13} /> {event.location}</p></div>
                  {event.travelMinutes && <div className="travel-chip"><Clock3 size={14} /><span>이동 {event.travelMinutes}분</span></div>}
                </div>
              )
            })}
          </Card>
          <Card className="dashboard-todo">
            <div className="dashboard-card-heading"><div><p className="eyebrow">TODO</p><h2>오늘 할 일</h2></div><Badge tone="amber">{reminders.length}건</Badge></div>
            <div className="dashboard-todo-list">
              {reminders.slice(0, 3).map((reminder) => <ReminderListItem key={reminder.id} reminder={reminder} compact />)}
              {!reminders.length && <p className="dashboard-todo-empty">지금 처리할 알림이 없습니다.</p>}
            </div>
            <Link className="dashboard-todo__all" to="/couples">고객별 업무 보기 <ArrowUpRight size={14} /></Link>
          </Card>
        </div>
      </section>

      <section className="section-block">
        <div className="section-heading"><div><p className="eyebrow">Active clients</p><h2>진행 중인 담당 커플</h2></div><Link to="/couples">전체 커플 <ChevronRight size={15} /></Link></div>
        <div className="couple-grid couple-grid--dashboard">
          {activeCouples.map((couple) => (
            <Link key={couple.id} to={`/couples/${couple.id}`} className={`couple-card couple-card--${couple.tone}`}>
              <div className="couple-card__top"><span className="monogram">{couple.initials}</span><Badge tone={couple.status === '집중관리' ? 'rose' : couple.status === '확정' ? 'sage' : 'neutral'}>{couple.status}</Badge></div>
              <h3>{couple.partners}</h3><p>{couple.venue}</p><div className="couple-card__date"><span>WEDDING DAY</span><strong>{couple.weddingDate.replaceAll('-', '. ')}</strong></div>
              <Progress value={couple.progress} label={`${couple.progress}%`} />
            </Link>
          ))}
        </div>
      </section>

      <section className="dashboard-secondary-grid">
        <Card className="dashboard-workload">
          <div className="dashboard-card-heading"><div><p className="eyebrow">Weekly capacity</p><h2>이번 주 업무량</h2></div><span className="workload-total">32 / 40h</span></div>
          <div className="workload-chart">
            {[['월',62],['화',84],['수',78],['목',46],['금',70],['토',35]].map(([day, value]) => <div key={day}><span><i style={{ height: `${value}%` }} /></span><small>{day}</small></div>)}
          </div>
          <div className="workload-footer"><Activity size={15} /><div><strong>수요일 14:00–18:00 집중 구간</strong><span>이동 포함 3개 일정이 연속되어 있습니다.</span></div></div>
        </Card>
        <Card className="dashboard-deadlines">
          <div className="dashboard-card-heading"><div><p className="eyebrow">Deadlines</p><h2>다가오는 마감</h2></div><span>{remainingTasks}개 남음</span></div>
          {checklist.filter((item) => !item.completed).slice(0, 4).map((task) => <div className="deadline-row" key={task.id}><span>{formatChecklistDate(task.dueDate).replace('월 ', '/').replace('일', '')}</span><div><strong>{task.title}</strong><small>{task.category} · {task.owner}</small></div></div>)}
          <Link to="/couples/c1">체크리스트 관리 <ArrowUpRight size={14} /></Link>
        </Card>
      </section>
    </div>
  )
}
