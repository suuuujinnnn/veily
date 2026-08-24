import { useMemo, useState } from 'react'
import { Check, Clock3, PackageCheck, Plus, Search, Send } from 'lucide-react'
import { Link, useSearchParams } from 'react-router-dom'
import { useDemoStore } from '../../app/store'
import { Badge, Button, Card, ReminderDDay, SegmentedTabs } from '../../components/ui'
import { OrderReminderStatusControl } from '../../components/reminders/OrderReminderStatusControl'
import { OrderReminderModal } from './OrderReminderModal'
import { buildPlannerTodos, todoCounts, type PlannerTodoItem, type PlannerTodoKind } from './todoUtils'

type ReminderView = 'all' | 'order' | 'follow-up'
const TODAY = '2026-08-05'
const viewMeta: Array<[ReminderView, string]> = [['all', '전체'], ['order', '발주 확인'], ['follow-up', '회신 요청']]
const kindLabel: Record<PlannerTodoKind, string> = { order: '발주 확인', 'follow-up': '회신 요청' }
const kindIcon = { order: PackageCheck, 'follow-up': Clock3 }
const kindTone = { order: 'amber', 'follow-up': 'sage' } as const
const displayDate = (value: string) => value.slice(0, 10).replaceAll('-', '.')

function DDay({ dueAt, completed = false }: { dueAt: string; completed?: boolean }) {
  return completed ? <Badge tone="sage">완료</Badge> : <ReminderDDay dueAt={dueAt} today={TODAY} />
}

export function TodoPage() {
  const store = useDemoStore()
  const [searchParams, setSearchParams] = useSearchParams()
  const requestedView = searchParams.get('view') as ReminderView | null
  const view: ReminderView = viewMeta.some(([key]) => key === requestedView) ? requestedView! : 'all'
  const focusedId = searchParams.get('item')
  const [query, setQuery] = useState('')
  const [coupleId, setCoupleId] = useState('all')
  const [includeCompleted, setIncludeCompleted] = useState(false)
  const [orderModalOpen, setOrderModalOpen] = useState(false)
  const allItems = useMemo(() => buildPlannerTodos(store, TODAY), [store])
  const counts = todoCounts(allItems)
  const items = allItems
    .filter((item) => includeCompleted || !item.completed)
    .filter((item) => view === 'all' || item.kind === view)
    .filter((item) => coupleId === 'all' || item.coupleId === coupleId)
    .filter((item) => !query.trim() || `${item.title} ${item.customerName} ${item.context}`.toLocaleLowerCase('ko').includes(query.trim().toLocaleLowerCase('ko')))

  const updateLocation = (nextView: ReminderView) => {
    const params = new URLSearchParams(searchParams)
    if (nextView === 'all') params.delete('view')
    else params.set('view', nextView)
    params.delete('item')
    setSearchParams(params)
  }

  const requestFollowUp = (sourceId: string) => store.requestCustomerFollowUp(sourceId)
  const empty = <div className="empty-state"><span className="empty-state__icon"><Check size={20} /></span><strong>현재 조건의 리마인더가 없습니다.</strong><p>모든 항목을 처리했거나 필터 조건에 맞는 항목이 없습니다.</p></div>

  return <div className="page-stack todo-page">
    <section className="page-intro"><div><p className="eyebrow">Reminder</p><h1>리마인더</h1><p>발주 확인과 고객 화면의 회신 상태를 한곳에서 확인하세요.</p></div>{view === 'order' && <Button size="sm" icon={<Plus size={15} />} onClick={() => setOrderModalOpen(true)}>발주 추가</Button>}</section>
    <div className="todo-controls"><SegmentedTabs value={view} onChange={updateLocation} ariaLabel="리마인더 유형" items={viewMeta.map(([key, label]) => ({ value: key, label, count: key === 'all' ? counts.all : key === 'order' ? counts.order : counts.followUp }))} /><div className="toolbar todo-toolbar"><label className="search-field"><Search size={16} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="고객 또는 리마인더 검색" /></label><select value={coupleId} onChange={(event) => setCoupleId(event.target.value)}><option value="all">모든 고객</option>{store.couples.map((couple) => <option value={couple.id} key={couple.id}>{couple.partners}</option>)}</select><label className="todo-completed-toggle"><input type="checkbox" checked={includeCompleted} onChange={(event) => setIncludeCompleted(event.target.checked)} /> 완료 포함</label></div></div>

    {view === 'all' && <Card padding="none" className="todo-list todo-list--all"><header><span>유형</span><span>리마인더</span><span>고객</span><span>기한</span><span>처리</span></header>{items.map((item) => { const Icon = kindIcon[item.kind]; return <article className={`kind-${item.kind} is-${item.urgency} ${item.completed ? 'is-completed' : ''} ${focusedId === item.id ? 'is-focused' : ''}`} key={item.id}><span className="todo-kind"><i className="todo-kind-icon"><Icon size={16} /></i><Badge tone={kindTone[item.kind]}>{kindLabel[item.kind]}</Badge></span><div className="todo-copy"><div className="todo-title"><strong>{item.title}</strong><DDay dueAt={item.dueAt} completed={item.completed} /></div><small>{item.context}</small></div><Link to={`/couples/${item.coupleId}`}>{item.customerName}</Link><div className="todo-date">{displayDate(item.dueAt)}</div><ReminderActions item={item} onRequestFollowUp={requestFollowUp} /></article> })}{!items.length && empty}</Card>}

    {view === 'order' && <Card padding="none" className="todo-list todo-order-list"><header><span>고객</span><span>업체</span><span>구분</span><span>발주 메모</span><span>발주일</span><span>확인 예정일</span><span>처리</span></header>{items.map((item) => { const order = store.orderReminders.find((reminder) => reminder.id === item.sourceId); const vendor = store.vendors.find((candidate) => candidate.id === order?.vendorId); return <article className={`is-${item.urgency} ${item.completed ? 'is-completed' : ''}`} key={item.id}><Link to={`/couples/${item.coupleId}`}>{item.customerName}</Link><strong>{vendor?.name ?? '업체 미지정'}</strong><Badge tone="neutral">{vendor?.category ?? '기타'}</Badge><div className="todo-copy"><strong>{item.title}</strong></div><time>{displayDate(order?.orderDate ?? item.createdAt)}</time><span className="todo-date-with-dday"><time>{displayDate(item.dueAt)}</time>{!item.completed && <DDay dueAt={item.dueAt} />}</span><OrderReminderStatusControl completed={item.completed} onComplete={() => store.completeOrderReminder(item.sourceId)} /></article> })}{!items.length && empty}</Card>}

    {view === 'follow-up' && <Card padding="none" className="todo-list todo-followup-list"><header><span>고객</span><span>회신 받을 내용</span><span>요청 정보</span><span>회신 예정일</span><span>처리</span></header>{items.map((item) => <article className={`is-${item.urgency} ${item.completed ? 'is-completed' : ''}`} key={item.id}><Link to={`/couples/${item.coupleId}`}>{item.customerName}</Link><div className="todo-copy"><div className="todo-title"><strong>{item.title}</strong>{item.completed ? <Badge tone="sage">회신 완료</Badge> : <DDay dueAt={item.dueAt} />}</div></div><small>{item.context}</small><time>{displayDate(item.dueAt)}</time><div className="todo-actions">{!item.completed && <Button size="xs" variant="secondary" icon={<Send size={13} />} onClick={() => requestFollowUp(item.sourceId)}>회신 요청</Button>}</div></article>)}{!items.length && empty}</Card>}
    <OrderReminderModal open={orderModalOpen} onClose={() => setOrderModalOpen(false)} defaultCoupleId={coupleId === 'all' ? undefined : coupleId} today={TODAY} />
  </div>
}

function ReminderActions({ item, onRequestFollowUp }: { item: PlannerTodoItem; onRequestFollowUp: (sourceId: string) => void }) {
  const store = useDemoStore()
  if (item.completed) return <span />
  return <div className="todo-actions">{item.kind === 'order' ? <Button variant="success" size="xs" onClick={() => store.completeOrderReminder(item.sourceId)} icon={<Check size={13} />}>완료</Button> : <Button size="xs" variant="secondary" icon={<Send size={13} />} onClick={() => onRequestFollowUp(item.sourceId)}>회신 요청</Button>}</div>
}
