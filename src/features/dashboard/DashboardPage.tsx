import { useState } from 'react'
import { Link } from 'react-router-dom'
import { AlertTriangle, CalendarDays, Check, ChevronRight, Clock3, FolderHeart, Inbox, MapPin, MessageCircle, PackageCheck, Plus } from 'lucide-react'
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
  'reference-undecided': FolderHeart,
  'taste-unsubmitted': FolderHeart,
  'overdue-task': AlertTriangle,
}

const dDayLabel = (days: number) => days === 0 ? 'D-0' : days > 0 ? `D-${days}` : `⚠ D+${Math.abs(days)}`
const dDayTone = (days: number) => days < 0 ? 'over' : days <= 3 ? 'critical' : days <= 7 ? 'warning' : days <= 14 ? 'safe' : 'calm'
const addDays = (date: string, days: number) => { const next = new Date(`${date}T12:00:00`); next.setDate(next.getDate() + days); return next.toISOString().slice(0, 10) }

export function DashboardPage() {
  const { couples, events, checklist, orderReminders, vendors, customerRequests, customerReferenceSubmissions, addVendor, addOrderReminder, completeOrderReminder } = useDemoStore()
  const [orderModalOpen, setOrderModalOpen] = useState(false)
  const [orderDraft, setOrderDraft] = useState({ coupleId: couples[0]?.id ?? '', vendorId: '', title: '', orderDate: TODAY, reminderDate: addDays(TODAY, 7) })
  const [vendorQuery, setVendorQuery] = useState('')
  const [vendorPickerOpen, setVendorPickerOpen] = useState(false)
  const matchedVendors = vendors.filter((vendor) => `${vendor.name} ${vendor.category} ${vendor.location}`.toLowerCase().includes(vendorQuery.trim().toLowerCase())).slice(0, 6)
  const todayEvents = events.filter((event) => event.date === TODAY).sort((a, b) => a.time.localeCompare(b.time))
  const reminders = buildDashboardReminders({ couples, checklist, orderReminders, vendors, customerRequests, customerReferenceSubmissions }, TODAY)
  const deadlines = checklist
    .filter((item) => item.status !== 'completed' && item.dueDate >= TODAY)
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
    .slice(0, 6)
  const submitOrderReminder = () => {
    if (!orderDraft.coupleId) return
    if (!orderDraft.title.trim()) return
    addOrderReminder({ ...orderDraft, vendorId: orderDraft.vendorId || undefined, title: orderDraft.title.trim(), memo: '' })
    setOrderDraft({ coupleId: orderDraft.coupleId, vendorId: '', title: '', orderDate: TODAY, reminderDate: addDays(TODAY, 7) })
    setVendorQuery('')
    setOrderModalOpen(false)
  }
  const selectVendor = (vendorId: string, name: string) => {
    setOrderDraft({ ...orderDraft, vendorId })
    setVendorQuery(name)
    setVendorPickerOpen(false)
  }
  const registerVendor = () => {
    const name = vendorQuery.trim()
    if (!name) return
    const base = vendors[0]
    const id = addVendor({
      name,
      category: '기타',
      summary: '플래너가 직접 등록한 업체',
      tags: [],
      priceRange: '가격 협의',
      match: 0,
      image: base?.image ?? '',
      location: '지역 미등록',
      address: '주소 미등록',
      hours: '운영시간 미등록',
      phone: '연락처 미등록',
      instagram: '',
      activeEvent: '직접 등록',
      gallery: base?.gallery?.slice(0, 3) ?? [],
      updatedAt: TODAY,
    })
    selectVendor(id, name)
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
        <div className="dashboard-reminder-list">{reminders.length ? reminders.slice(0, 8).map((reminder) => {
          const Icon = reminderIcon[reminder.kind]
          const action = reminder.kind === 'order'
            ? <button className="dashboard-reminder-action dashboard-reminder-action--approve" onClick={() => reminder.sourceId && completeOrderReminder(reminder.sourceId)}><Check size={13} /> 확인 완료</button>
            : reminder.kind === 'reference-undecided'
              ? <Link className="dashboard-reminder-action dashboard-reminder-action--message" to={`/couples/${reminder.coupleId}?tab=consultations`}><MessageCircle size={13} /> 메시지 보내기</Link>
              : null
          return <div className={`dashboard-reminder-row is-${reminder.urgency}`} key={reminder.id}>
            <span><Icon size={15} /></span>
            <Link className="dashboard-reminder-copy" to={reminder.href}>
              <span className="dashboard-reminder-title"><strong>{reminder.title}</strong>{reminder.days !== undefined && <em className={`dashboard-dday is-${dDayTone(reminder.days)}`}>{dDayLabel(reminder.days)}</em>}</span>
              <p>{reminder.message}</p>
            </Link>
            {action}
          </div>
        }) : <div className="dashboard-focus-empty"><span>처리할 리마인더가 없습니다.</span></div>}</div>
      </Card>

      <Card padding="none" className="dashboard-focus dashboard-focus--deadline">
        <header><div><p className="eyebrow">Upcoming deadlines</p><h2>다가오는 마감</h2></div><Badge tone="neutral">{deadlines.length}개</Badge></header>
        <div className="dashboard-deadline-list">{deadlines.map((task) => <Link to={`/couples/${task.coupleId}?tab=timeline`} key={task.id}><time>{formatChecklistDate(task.dueDate).replace('월 ', '/').replace('일', '')}</time><div><strong>{task.title}</strong><span>{couples.find((item) => item.id === task.coupleId)?.partners} · {task.kind === 'decision' ? '결정 필요' : task.category}</span></div><ChevronRight size={14} /></Link>)}</div>
      </Card>
    </section>
    <Modal open={orderModalOpen} onClose={() => setOrderModalOpen(false)} eyebrow="Manual reminder" title="발주 리마인더 추가" footer={<><Button variant="ghost" onClick={() => setOrderModalOpen(false)}>취소</Button><Button icon={<Check size={14} />} disabled={!orderDraft.title.trim()} onClick={submitOrderReminder}>리마인더 등록</Button></>}>
      <div className="order-reminder-form order-reminder-form--simple">
        <div className="order-reminder-form__notice"><PackageCheck size={18} /><div><strong>업체 상태와 연동되지 않는 수동 확인 리마인더입니다.</strong><span>외부 채널에서 확인을 마친 뒤 홈에서 확인 완료로 처리하세요.</span></div></div>
        <label><span>커플</span><select value={orderDraft.coupleId} onChange={(event) => setOrderDraft({ ...orderDraft, coupleId: event.target.value })}>{couples.map((couple) => <option value={couple.id} key={couple.id}>{couple.partners}</option>)}</select></label>
        <div className="order-vendor-field">
          <span>업체</span>
          <div className="order-vendor-combobox">
            <input value={vendorQuery} onFocus={() => setVendorPickerOpen(true)} onChange={(event) => { setVendorQuery(event.target.value); setOrderDraft({ ...orderDraft, vendorId: '' }); setVendorPickerOpen(true) }} placeholder="업체명을 검색하세요" />
            {vendorPickerOpen && <div className="order-vendor-options">
              {matchedVendors.map((vendor) => <button type="button" key={vendor.id} onClick={() => selectVendor(vendor.id, vendor.name)}><strong>{vendor.name}</strong><span>{vendor.category} · {vendor.location}</span></button>)}
              {vendorQuery.trim() && !vendors.some((vendor) => vendor.name.toLowerCase() === vendorQuery.trim().toLowerCase()) && <button type="button" className="order-vendor-register" onClick={registerVendor}><Plus size={14} /><span><strong>‘{vendorQuery.trim()}’ 직접 등록</strong><small>업체 DB에 기타 업체로 추가하고 선택합니다.</small></span></button>}
              {!matchedVendors.length && !vendorQuery.trim() && <p>업체명을 입력하면 검색 결과가 표시됩니다.</p>}
            </div>}
          </div>
        </div>
        <label className="wide"><span>발주명</span><input value={orderDraft.title} onChange={(event) => setOrderDraft({ ...orderDraft, title: event.target.value })} placeholder="예: 스튜디오 촬영 패키지 발주 확인" /></label>
        <label><span>발주일</span><input type="date" value={orderDraft.orderDate} onChange={(event) => { const orderDate = event.target.value; setOrderDraft({ ...orderDraft, orderDate, reminderDate: addDays(orderDate, 7) }) }} /></label>
        <label><span>확인 예정일</span><input type="date" value={orderDraft.reminderDate} min={orderDraft.orderDate} onChange={(event) => setOrderDraft({ ...orderDraft, reminderDate: event.target.value })} /></label>
      </div>
    </Modal>
  </div>
}
