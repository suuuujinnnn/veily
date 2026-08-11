import { useMemo, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { ArrowLeft, CalendarDays, Check, ChevronRight, Copy, Clock3, ExternalLink, Heart, MapPin, MessageCircle, MoreHorizontal, Plus, Sparkles } from 'lucide-react'
import { useDemoStore } from '../../app/store'
import { Badge, Button, Card, Progress } from '../../components/ui'
import { vendors } from '../../data/mockData'
import type { ChecklistCategory, ChecklistItem, EventType, WeddingEvent } from '../../types'
import { CategoryChecklist } from '../checklist/CategoryChecklist'
import { ChecklistEditorModal } from '../checklist/ChecklistEditorModal'
import { MonthlyRoadmap } from '../checklist/MonthlyRoadmap'
import { ContractsSection } from '../contracts/ContractsSection'

type DetailTab = 'overview' | 'timeline' | 'vendors' | 'contracts'
type PlannerTaskMode = 'template' | 'custom' | null

const detailTabs: [DetailTab, string][] = [
  ['overview', '한눈에 보기'],
  ['timeline', '일정 & 할 일'],
  ['vendors', '추천 업체'],
  ['contracts', '계약'],
]
const vendorCategories = ['전체', '스튜디오', '드레스', '메이크업', '예물']
const scheduleTypes: EventType[] = ['상담', '스튜디오', '드레스', '메이크업', '기타']

function isDetailTab(value: string | null): value is DetailTab {
  return detailTabs.some(([key]) => key === value)
}

function statusLabel(event: WeddingEvent) {
  if ((event.approvalStatus ?? 'confirmed') === 'confirmed') return '확정 일정'
  if (event.approvalStatus === 'client-ok') return '고객 오케이'
  return '플래너 제안'
}

export function CoupleDetailPage() {
  const { id = 'c1' } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()
  const {
    couples,
    events,
    checklist,
    recommendations,
    consultationCards,
    contracts,
    toggleChecklist,
    addChecklist,
    updateChecklist,
    deleteChecklist,
    addEvent,
    updateEvent,
    addContract,
    updateContract,
    deleteContract,
  } = useDemoStore()
  const couple = couples.find((item) => item.id === id) ?? couples[0]
  const requestedTab = searchParams.get('tab')
  const tab: DetailTab = isDetailTab(requestedTab) ? requestedTab : 'overview'
  const [editorOpen, setEditorOpen] = useState(false)
  const [linkCopied, setLinkCopied] = useState(false)
  const [vendorCategory, setVendorCategory] = useState('전체')
  const [plannerTaskMode, setPlannerTaskMode] = useState<PlannerTaskMode>(null)
  const [editorItem, setEditorItem] = useState<ChecklistItem | null>(null)
  const [editorCategory, setEditorCategory] = useState<ChecklistCategory>('스튜디오')
  const [scheduleDraft, setScheduleDraft] = useState({
    title: '상담 일정 조율',
    date: '',
    time: '10:00',
    endTime: '11:00',
    type: '상담' as EventType,
    location: '플래너 미팅',
  })

  const coupleEvents = useMemo(() => events.filter((event) => event.coupleId === couple.id), [events, couple.id])
  const coordinationEvents = coupleEvents.filter((event) => (event.approvalStatus ?? 'confirmed') !== 'confirmed')
  const plannerCalendarDates = Array.from({ length: 31 }, (_, index) => '2026-08-' + String(index + 1).padStart(2, '0'))
  const plannerCalendarLeadingBlanks = new Date('2026-08-01').getDay()
  const coupleTasks = checklist.filter((item) => item.coupleId === couple.id)
  const directTasks = coupleTasks.filter((task) => !task.isTemplate)
  const visibleTasks = plannerTaskMode === 'custom' ? directTasks : coupleTasks
  const consultationCard = consultationCards.find((item) => item.coupleId === couple.id) ?? {
    id: `cc-empty-${couple.id}`,
    coupleId: couple.id,
    preferredDate: couple.weddingDate,
    shootDate: '',
    coupleNames: couple.partners,
    phone: '',
    existingVendors: '',
    studioDirection: '',
    studioMood: '',
    dressMood: '',
    sizes: '',
    makeupMood: '',
    budget: '',
    otherPlanner: '',
    extraPlanning: '',
    hallDetails: '',
    meetingDetails: '',
    contactPreference: '',
    priorities: '',
    notes: '',
    source: '플래너 입력' as const,
    createdAt: '2026-08-11',
  }
  const coupleContracts = contracts.filter((item) => item.coupleId === couple.id)
  const recommendedVendors = recommendations
    .filter((item) => item.coupleId === couple.id)
    .map((item) => ({ ...item, vendor: vendors.find((vendor) => vendor.id === item.vendorId) }))
    .filter((item) => item.vendor && (vendorCategory === '전체' || item.vendor.category === vendorCategory))

  const openTab = (nextTab: DetailTab) => {
    const nextParams = new URLSearchParams(searchParams)
    if (nextTab === 'overview') nextParams.delete('tab')
    else nextParams.set('tab', nextTab)
    setSearchParams(nextParams)
  }

  const proposeSchedule = () => {
    if (!scheduleDraft.date || !scheduleDraft.title.trim()) return
    addEvent({
      coupleId: couple.id,
      title: scheduleDraft.title,
      date: scheduleDraft.date,
      time: scheduleDraft.time,
      endTime: scheduleDraft.endTime,
      type: scheduleDraft.type,
      location: scheduleDraft.location,
      approvalStatus: 'planner-proposed',
    })
    setScheduleDraft((current) => ({ ...current, title: '상담 일정 조율', date: '' }))
  }

  const openTaskEditor = (category?: ChecklistCategory) => {
    setEditorItem(null)
    setEditorCategory(category ?? '스튜디오')
    setEditorOpen(true)
  }

  const copyPortalLink = async () => {
    await navigator.clipboard?.writeText(`${window.location.origin}/portal/${couple.id}`)
    setLinkCopied(true)
    window.setTimeout(() => setLinkCopied(false), 1600)
  }

  return (
    <div className="page-stack couple-detail">
      <Link className="back-link" to="/couples"><ArrowLeft size={15} /> 모든 커플</Link>

      <section className="couple-profile">
        <div className={`couple-profile__mark couple-profile__mark--${couple.tone}`}><span>{couple.initials}</span><small>OUR DAY</small></div>
        <div className="couple-profile__main">
          <div><Badge tone="rose">{couple.status}</Badge><p className="eyebrow">Wedding journey</p></div>
          <h1>{couple.partners}</h1>
          <p>{couple.concept}</p>
          <div className="couple-meta"><span><CalendarDays size={15} /> {couple.weddingDate.replaceAll('-', '. ')}</span><span><MapPin size={15} /> {couple.venue}</span></div>
        </div>
        <div className="couple-profile__progress"><span>전체 준비율</span><strong>{couple.progress}<i>%</i></strong><Progress value={couple.progress} /></div>
        <div className="couple-profile__actions">
          <Link to={`/portal/${couple.id}`} target="_blank"><Button variant="secondary" icon={<ExternalLink size={15} />}>고객 화면 미리보기</Button></Link>
          <div className="customer-link-copy"><input readOnly value={`${window.location.origin}/portal/${couple.id}`} aria-label="생성된 고객 페이지 링크" /><button onClick={copyPortalLink}><Copy size={13} /> {linkCopied ? '복사됨' : '링크 복사'}</button></div>
          <button className="icon-button bordered"><MoreHorizontal size={18} /></button>
        </div>
      </section>

      <nav className="detail-tabs">
        {detailTabs.map(([key, label]) => <button key={key} onClick={() => openTab(key)} className={tab === key ? 'active' : ''}>{label}{key === 'timeline' && <em>{coupleTasks.filter((task) => !task.completed).length}</em>}</button>)}
      </nav>

      {tab === 'overview' && <div className="detail-overview">
        <section className="detail-column detail-column--wide">
          <div className="section-heading section-heading--compact"><div><p className="eyebrow">Coming up</p><h2>다가오는 일정</h2></div><button onClick={() => openTab('timeline')}>전체 보기 <ChevronRight size={14} /></button></div>
          <Card padding="none" className="upcoming-list">
            {coupleEvents.slice(0, 3).map((event) => <div className="upcoming-row" key={event.id}><div className="date-tile"><strong>{Number(event.date.slice(-2))}</strong><span>{event.date.slice(5, 7)}월</span></div><div><Badge tone="rose">{event.type}</Badge><h3>{event.title}</h3><p><Clock3 size={13} /> {event.time}–{event.endTime} <i /> <MapPin size={13} /> {event.location}</p></div>{event.approvalStatus === 'client-ok' && <button onClick={() => updateEvent({ ...event, approvalStatus: 'confirmed' })}>최종 확정</button>}<ChevronRight size={17} /></div>)}
          </Card>
        </section>
        <section className="detail-column"><div className="section-heading section-heading--compact"><div><p className="eyebrow">To-do</p><h2>이번 주 할 일</h2></div><button onClick={() => openTab('timeline')}>전체 보기 <ChevronRight size={14} /></button></div><Card className="task-list">{coupleTasks.slice(0, 4).map((task) => <label className={`task-row ${task.completed ? 'task-row--done' : ''}`} key={task.id}><input type="checkbox" checked={task.completed} onChange={() => toggleChecklist(task.id)} /><span className="custom-check"><Check size={13} /></span><div><strong>{task.title}</strong><small>{task.category} · {task.dueDate} · {task.owner}</small></div></label>)}</Card></section>
        <Card className="consultation-card"><div className="section-heading section-heading--compact"><div><p className="eyebrow">Consultation card</p><h2>상담 카드</h2></div><Badge tone="sage">{consultationCard.source}</Badge></div><div className="consultation-card__grid"><div><span>희망 예식일</span><strong>{consultationCard.preferredDate}</strong></div><div><span>촬영 일정</span><strong>{consultationCard.shootDate || '-'}</strong></div><div><span>스튜디오</span><p>{consultationCard.studioDirection} · {consultationCard.studioMood}</p></div><div><span>드레스/메이크업</span><p>{consultationCard.dressMood} · {consultationCard.makeupMood}</p></div><div><span>예산</span><strong>{consultationCard.budget || '-'}</strong></div><div><span>메모</span><p>{consultationCard.notes || '-'}</p></div></div></Card>`r`n        <Card className="couple-note"><MessageCircle size={18} /><div><span>플래너 노트</span><p>상담 카드 내용을 기준으로 우선순위와 추천 방향을 정리해 주세요.</p><button>노트 편집</button></div></Card>
        <Card className="recommendation-peek"><div className="recommendation-peek__head"><span><Sparkles size={17} /> 커플 요약</span><Badge tone="sage">업데이트됨</Badge></div><h3>Clean · Timeless · Natural</h3><div className="tag-row"><span>스튜디오 무드</span><span>드레스 취향</span><span>예산 기준</span></div><button onClick={() => openTab('vendors')}>추천 업체 보기 <ChevronRight size={14} /></button></Card>
      </div>}

      {tab === 'timeline' && <div className="checklist-workspace">
        <section className="planner-schedule-panel">
          <div className="section-heading section-heading--compact"><div><p className="eyebrow">Planner proposal</p><h2>플래너 일정 조율</h2></div><Badge tone="amber">고객 오케이 후 최종 확정</Badge></div>
          <div className="planner-schedule-form">
            <label><span>일정명</span><input value={scheduleDraft.title} onChange={(event) => setScheduleDraft((current) => ({ ...current, title: event.target.value }))} /></label>
            <label><span>유형</span><select value={scheduleDraft.type} onChange={(event) => setScheduleDraft((current) => ({ ...current, type: event.target.value as EventType }))}>{scheduleTypes.map((type) => <option key={type}>{type}</option>)}</select></label>
            <label><span>날짜</span><input type="date" value={scheduleDraft.date} onChange={(event) => setScheduleDraft((current) => ({ ...current, date: event.target.value }))} /></label>
            <label><span>시작</span><input type="time" value={scheduleDraft.time} onChange={(event) => setScheduleDraft((current) => ({ ...current, time: event.target.value }))} /></label>
            <label><span>종료</span><input type="time" value={scheduleDraft.endTime} onChange={(event) => setScheduleDraft((current) => ({ ...current, endTime: event.target.value }))} /></label>
            <label><span>장소</span><input value={scheduleDraft.location} onChange={(event) => setScheduleDraft((current) => ({ ...current, location: event.target.value }))} /></label>
            <Button icon={<Plus size={15} />} onClick={proposeSchedule} disabled={!scheduleDraft.date || !scheduleDraft.title.trim()}>일정 제안</Button>
          </div>
          <div className="planner-schedule-calendar">
            <div className="planner-schedule-calendar__head"><strong>8월 일정 조율 캘린더</strong><div><span className="legend-proposed">제안 일정</span><span className="legend-confirmed">확정 일정</span></div></div>
            <div className="planner-schedule-calendar__weekdays">{['일', '월', '화', '수', '목', '금', '토'].map((day) => <span key={day}>{day}</span>)}</div>
            <div className="planner-schedule-calendar__grid">
              {Array.from({ length: plannerCalendarLeadingBlanks }).map((_, index) => <div className="planner-schedule-calendar__blank" key={`blank-${index}`} />)}
              {plannerCalendarDates.map((date) => { const dayEvents = coordinationEvents.filter((event) => event.date === date); return <div className="planner-schedule-calendar__cell" key={date}><strong>{Number(date.slice(-2))}</strong>{dayEvents.map((event) => <span className={`planner-calendar-event planner-calendar-event--${(event.approvalStatus ?? 'confirmed') === 'confirmed' ? 'confirmed' : 'proposed'}`} key={event.id}>{event.title}</span>)}</div> })}
            </div>
          </div>
          <div className="planner-schedule-list">
            {coordinationEvents.length ? coordinationEvents.map((event) => <article key={event.id}><div><Badge tone="amber">{statusLabel(event)}</Badge><h3>{event.title}</h3><p>{event.date} · {event.time}–{event.endTime} · {event.location}</p></div>{event.approvalStatus === 'client-ok' ? <Button size="sm" onClick={() => updateEvent({ ...event, approvalStatus: 'confirmed' })}>최종 확정</Button> : <span className={`coordination-status coordination-status--${event.approvalStatus ?? 'planner-proposed'}`}>{statusLabel(event)}</span>}</article>) : <p className="planner-schedule-empty">현재 조율 중인 일정이 없습니다.</p>}
          </div>
        </section>

        <section className="checklist-workspace__intro"><div><p className="eyebrow">Wedding workflow</p><h2>분야별 할 일</h2><p>기본 템플릿을 적용하거나, 비어 있는 상태에서 직접 작성할 수 있습니다.</p></div>{plannerTaskMode && <Badge tone="neutral">{plannerTaskMode === 'template' ? '템플릿 사용' : '직접 작성'}</Badge>}</section>
        {!plannerTaskMode && <div className="task-template-prompt planner-task-choice"><strong>분야별 할 일을 어떻게 시작할까요?</strong><p>현재 저장된 기본 템플릿을 쓰거나, 공란에서 직접 구성할 수 있습니다.</p><div><button onClick={() => setPlannerTaskMode('template')}>기본 템플릿 사용</button><button className="secondary" onClick={() => setPlannerTaskMode('custom')}>직접 작성</button></div></div>}
        {plannerTaskMode === 'template' && <MonthlyRoadmap tasks={coupleTasks} onToggle={toggleChecklist} />}
        {plannerTaskMode && <div className="checklist-workspace__lower"><CategoryChecklist tasks={visibleTasks} onToggle={toggleChecklist} editable onAdd={openTaskEditor} onEdit={(item) => { setEditorItem(item); setEditorCategory(item.category); setEditorOpen(true) }} />{plannerTaskMode === 'custom' && !visibleTasks.length && <Card className="availability-summary"><Plus size={20} /><h3>직접 작성 모드</h3><p>분야별 추가 버튼으로 필요한 할 일을 등록하세요.</p><span>기본 템플릿 항목은 숨겨둔 상태입니다.</span></Card>}</div>}
      </div>}

      {tab === 'vendors' && <><div className="portal-vendor-category-tabs">{vendorCategories.map((category) => <button key={category} className={vendorCategory === category ? 'active' : ''} onClick={() => setVendorCategory(category)}>{category}</button>)}</div><div className="recommended-grid">{recommendedVendors.length ? recommendedVendors.map(({ vendor, status }) => vendor && <article className="vendor-mini-card" key={vendor.id}><img src={vendor.image} style={{ objectPosition: vendor.imagePosition }} alt="" /><div><Badge tone="rose">{vendor.match}% match</Badge><h3>{vendor.name}</h3><p>{vendor.summary}</p><div className="tag-row">{vendor.tags.map((tag) => <span key={tag}>{tag}</span>)}</div><div className="vendor-mini-card__status"><span>고객 응답</span><strong className={`status-${status}`}>{status === 'liked' ? '마음에 들어요' : status === 'hold' ? '조금 더 볼게요' : '응답 대기'}</strong></div></div></article>) : <Card><p>아직 추천한 업체가 없습니다.</p></Card>}</div></>}

      {tab === 'contracts' && <ContractsSection coupleId={couple.id} contracts={coupleContracts} addContract={addContract} updateContract={updateContract} deleteContract={deleteContract} />}

      <ChecklistEditorModal open={editorOpen} coupleId={couple.id} defaultCategory={editorCategory} item={editorItem} onClose={() => setEditorOpen(false)} onCreate={addChecklist} onUpdate={updateChecklist} onDelete={deleteChecklist} />
    </div>
  )
}
