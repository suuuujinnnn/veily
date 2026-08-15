import { useState } from 'react'
import { Link } from 'react-router-dom'
import { AlertTriangle, CalendarDays, Check, ChevronRight, Clock3, FolderHeart, Inbox, MapPin, PackageCheck, Plus } from 'lucide-react'
import { useDemoStore } from '../../app/store'
import { Badge, Button, Card, Modal } from '../../components/ui'
import { formatChecklistDate } from '../checklist/checklistUtils'
import { buildDashboardReminders, type DashboardReminderKind } from '../reminders/reminderUtils'

const TODAY = '2026-08-05'
const typeTone: Record<string, 'rose' | 'sage' | 'amber' | 'neutral'> = {
  드레스: 'rose', 스튜디오: 'sage', 미팅: 'amber', 메이크업: 'rose', 계약: 'neutral', 본식: 'rose',
}
const reminderIcon: Record<DashboardReminderKind, typeof AlertTriangle> = {
  order: PackageCheck,
  'customer-request': Inbox,
  'vendor-undecided': FolderHeart,
  'taste-unsubmitted': FolderHeart,
  'overdue-task': AlertTriangle,
}

export function DashboardPage() {
  const { couples, events, checklist, recommendations, orderReminders, vendors, customerRequests, customerReferenceSubmissions, addOrderReminder, approveOrderReminder } = useDemoStore()
  const [orderModalOpen, setOrderModalOpen] = useState(false)
  const [orderDraft, setOrderDraft] = useState({ coupleId: couples[0]?.id ?? '', orderDate: TODAY, memo: '' })
  const todayEvents = events.filter((event) => event.date === TODAY).sort((a, b) => a.time.localeCompare(b.time))
  const reminders = buildDashboardReminders({ couples, checklist, recommendations, orderReminders, vendors, customerRequests, customerReferenceSubmissions }, TODAY)
  const deadlines = checklist
    .filter((item) => item.status !== 'completed' && item.dueDate >= TODAY)
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
    .slice(0, 6)
  const submitOrderReminder = () => {
    if (!orderDraft.coupleId) return
    addOrderReminder({ ...orderDraft, vendorId: undefined, title: '발주 승인 확인', memo: orderDraft.memo.trim() })
    setOrderDraft({ coupleId: orderDraft.coupleId, orderDate: TODAY, memo: '' })
    setOrderModalOpen(false)
  }

  return <div className="dashboard-page dashboard-page--focused">
    <header className="dashboard-welcome">
      <div className="dashboard-welcome__date"><strong>05</strong><span>AUG<br />WED</span></div>
      <div className="dashboard-welcome__copy"><p>2026년 8월 5일 수요일</p><h1>좋은 아침이에요, 이지윤 플래너님.</h1><span>오늘 처리할 흐름을 우선순위대로 정리했습니다.</span></div>
      <div className="dashboard-welcome__counts"><span><i>{todayEvents.length}</i> 오늘 일정</span><span><i>{reminders.length}</i> 확인 필요</span><span><i>{deadlines.length}</i> 다가오는 마감</span></div>
    </header>

    <section className="dashboard-focus-grid">
      <Card padding="none" className="dashboard-focus dashboard-focus--schedule">
        <header><div><p className="eyebrow">Today's schedule</p><h2>오늘 일정</h2></div><Link to="/calendar">전체 캘린더 <ChevronRight size={14} /></Link></header>
        <div className="dashboard-today-list">{todayEvents.length ? todayEvents.map((event) => {
          const couple = couples.find((item) => item.id === event.coupleId)
          return <Link to="/calendar" className="dashboard-today-row" key={event.id}><time><Clock3 size={12} /><strong>{event.time}</strong><span>{event.endTime}</span></time><div><div><Badge tone={typeTone[event.type] ?? 'neutral'}>{event.type}</Badge><span>{couple?.partners ?? '개인 일정'}</span></div><h3>{event.title}</h3><p><MapPin size={12} /> {event.location}</p></div><ChevronRight size={15} /></Link>
        }) : <div className="dashboard-focus-empty"><CalendarDays size={20} /><span>오늘 등록된 일정이 없습니다.</span></div>}</div>
      </Card>

      <Card padding="none" className="dashboard-focus dashboard-focus--reminder">
        <header><div><p className="eyebrow">Priority inbox</p><h2>REMINDER</h2></div><div className="dashboard-reminder-actions"><Badge tone="rose">{reminders.length}건</Badge><Button size="sm" variant="secondary" icon={<Plus size={13} />} onClick={() => setOrderModalOpen(true)}>발주 추가</Button></div></header>
        <div className="dashboard-reminder-list">{reminders.length ? reminders.slice(0, 8).map((reminder) => { const Icon = reminderIcon[reminder.kind]; return reminder.kind === 'order' ? <div className={`dashboard-reminder-row dashboard-reminder-row--order is-${reminder.urgency}`} key={reminder.id}><span><Icon size={15} /></span><div><strong>{reminder.title}</strong><p>{reminder.message}</p></div><em>{reminder.meta}</em><button className="order-reminder-approve" onClick={() => reminder.sourceId && approveOrderReminder(reminder.sourceId)}><Check size={13} /> 승인</button></div> : <Link className={`dashboard-reminder-row is-${reminder.urgency}`} to={reminder.href} key={reminder.id}><span><Icon size={15} /></span><div><strong>{reminder.title}</strong><p>{reminder.message}</p></div><em>{reminder.meta}</em></Link> }) : <div className="dashboard-focus-empty"><span>처리할 리마인더가 없습니다.</span></div>}</div>
      </Card>

      <Card padding="none" className="dashboard-focus dashboard-focus--deadline">
        <header><div><p className="eyebrow">Upcoming deadlines</p><h2>다가오는 마감</h2></div><Badge tone="neutral">{deadlines.length}개</Badge></header>
        <div className="dashboard-deadline-list">{deadlines.map((task) => <Link to={`/couples/${task.coupleId}?tab=timeline`} key={task.id}><time>{formatChecklistDate(task.dueDate).replace('월 ', '/').replace('일', '')}</time><div><strong>{task.title}</strong><span>{couples.find((item) => item.id === task.coupleId)?.partners} · {task.kind === 'decision' ? '결정 필요' : task.category}</span></div><ChevronRight size={14} /></Link>)}</div>
      </Card>
    </section>
    <Modal open={orderModalOpen} onClose={() => setOrderModalOpen(false)} eyebrow="Manual reminder" title="발주 리마인더 추가" footer={<><Button variant="ghost" onClick={() => setOrderModalOpen(false)}>취소</Button><Button icon={<Check size={14} />} onClick={submitOrderReminder}>미승인으로 등록</Button></>}><div className="order-reminder-form order-reminder-form--simple"><div className="order-reminder-form__notice"><PackageCheck size={18} /><div><strong>등록 즉시 미승인 상태로 표시됩니다.</strong><span>발주 확인이 끝나면 홈 목록에서 승인 버튼을 눌러 완료하세요.</span></div></div><label><span>커플</span><select value={orderDraft.coupleId} onChange={(event) => setOrderDraft({ ...orderDraft, coupleId: event.target.value })}>{couples.map((couple) => <option value={couple.id} key={couple.id}>{couple.partners}</option>)}</select></label><label><span>발주일</span><input type="date" value={orderDraft.orderDate} onChange={(event) => setOrderDraft({ ...orderDraft, orderDate: event.target.value })} /></label><label className="wide"><span>기타 · 메모</span><textarea rows={4} value={orderDraft.memo} onChange={(event) => setOrderDraft({ ...orderDraft, memo: event.target.value })} placeholder="추가로 기억할 내용을 적어주세요." /></label></div></Modal>
  </div>
}
