import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowRight, CalendarDays, Check, CheckCircle2, ChevronRight, Clock3, Heart, MapPin, MessageCircle, Pause, Sparkles, ThumbsUp } from 'lucide-react'
import { useDemoStore } from '../../app/store'
import { Badge, Progress } from '../../components/ui'
import { couples, vendors } from '../../data/mockData'
import { imageAssets } from '../../assets/images'
import { CategoryChecklist } from '../checklist/CategoryChecklist'
import { ChecklistEditorModal } from '../checklist/ChecklistEditorModal'
import type { ChecklistCategory, ChecklistItem } from '../../types'
import { MonthlyRoadmap } from '../checklist/MonthlyRoadmap'

type PortalTab = 'home' | 'calendar' | 'tasks' | 'vendors'
const slots = ['8월 8일 (토) 11:00', '8월 8일 (토) 14:00', '8월 9일 (일) 10:30']
const vendorCategories = ['전체', '스튜디오', '드레스', '메이크업', '예물'] as const

export function PortalPage() {
  const { coupleId = 'c1', section } = useParams()
  const navigate = useNavigate()
  const couple = couples.find((item) => item.id === coupleId) ?? couples[0]
  const { events, checklist, recommendations, contracts, toggleChecklist, addChecklist, updateChecklist, deleteChecklist, setRecommendation, updateEvent } = useDemoStore()
  const initialTab = (['home', 'calendar', 'tasks', 'vendors'] as PortalTab[]).includes(section as PortalTab) ? section as PortalTab : 'home'
  const [tab, setTab] = useState<PortalTab>(initialTab)
  const [message, setMessage] = useState(false)
  const [vendorCategory, setVendorCategory] = useState<(typeof vendorCategories)[number]>('전체')
  const [calendarView, setCalendarView] = useState<'week' | 'month'>('month')
  const [coordinationTab, setCoordinationTab] = useState<'coordination' | 'confirmed'>('coordination')
  const [taskTemplateAsked, setTaskTemplateAsked] = useState(false)
  const [taskTemplateEnabled, setTaskTemplateEnabled] = useState(false)
  const [editorOpen, setEditorOpen] = useState(false)
  const [editorItem, setEditorItem] = useState<ChecklistItem | null>(null)
  const [editorCategory, setEditorCategory] = useState<ChecklistCategory>('스튜디오')
  const coupleEvents = events.filter((event) => event.coupleId === couple.id)
  const tasks = checklist.filter((item) => item.coupleId === couple.id)
  const recs = recommendations.filter((item) => item.coupleId === couple.id).map((item) => ({ ...item, vendor: vendors.find((vendor) => vendor.id === item.vendorId) })).filter((item) => item.vendor)
  const confirmedVendorGroups = [
    { label: '스드메', items: recs.filter(({ status, vendor }) => status === 'liked' && vendor && ['스튜디오', '드레스', '메이크업'].includes(vendor.category)).map(({ vendor }) => ({ id: vendor!.id, name: vendor!.name, category: vendor!.category, summary: vendor!.summary })) },
    { label: '혼수', items: contracts.filter((contract) => contract.coupleId === couple.id && ['예물', '혼수', '기타'].includes(contract.category)).map((contract) => ({ id: contract.id, name: contract.vendorName, category: contract.category, summary: contract.details })) },
    { label: '예식장', items: contracts.filter((contract) => contract.coupleId === couple.id && contract.category === '예식장').map((contract) => ({ id: contract.id, name: contract.vendorName, category: contract.category, summary: contract.details })) },
  ]
  const completed = tasks.filter((task) => task.completed).length
  const visibleCalendarEvents = calendarView === 'week' ? coupleEvents.filter((event) => event.date >= '2026-08-01' && event.date <= '2026-08-07') : coupleEvents
  const monthlyDays = Array.from({ length: 31 }, (_, index) => '2026-08-' + String(index + 1).padStart(2, '0'))
  const partnerGreeting = couple.partners
    .split(' & ')
    .map((name) => `${name.slice(1)}님`)
    .join(', ')
  const dDay = Math.max(0, Math.ceil((new Date(couple.weddingDate).getTime() - new Date('2026-08-05').getTime()) / 86_400_000))
  const openTab = (nextTab: PortalTab) => {
    setTab(nextTab)
    navigate(`/portal/${couple.id}${nextTab === 'home' ? '' : `/${nextTab}`}`)
  }

  return (
    <div className="portal-page">
      <section className="portal-hero">
        <img src={imageAssets.weddingGarden} alt="정원에서 함께 걷는 신랑 신부" />
        <div className="portal-hero__shade" />
        <div className="portal-hero__copy"><p>OUR WEDDING JOURNEY</p><h1>{couple.partners.replace('&', 'and')}</h1><div><span>{couple.weddingDate.replaceAll('-', '. ')}</span><i /><span>{couple.venue}</span></div></div>
        <div className="d-day"><small>OUR DAY</small><strong>D—{dDay}</strong><span>함께 준비한 지 42일</span></div>
      </section>
      <div className="portal-context-strip"><span><strong>신랑·신부 전용 포털</strong> · 플래너 관리 화면과 분리되어 있습니다.</span><Link to={`/client/${couple.id}`}>접속 화면으로</Link></div>
      <nav className="portal-nav"><div>{([['home','우리의 홈'],['calendar','공유 캘린더'],['tasks','할 일'],['vendors','추천 업체']] as [PortalTab,string][]).map(([key,label]) => <button className={tab === key ? 'active' : ''} onClick={() => openTab(key)} key={key}>{label}{key === 'tasks' && <em>{tasks.filter((task) => !task.completed).length}</em>}</button>)}</div><button className="planner-message" onClick={() => { setMessage(true); window.setTimeout(() => setMessage(false), 1800) }}><MessageCircle size={15} /> 플래너에게 메시지</button></nav>

      <main className="portal-content">
        {tab === 'home' && <>
          <section className="portal-welcome"><div><p className="eyebrow">Hello, our lovely couple</p><h2>{partnerGreeting}.<br /><em>오늘도 설레는 준비를 시작해볼까요?</em></h2><p>결혼식까지 {dDay}일, 지금까지 아주 잘 준비하고 있어요.</p></div><div className="portal-progress"><div><span>전체 준비율</span><strong>{couple.progress}%</strong></div><Progress value={couple.progress} /><div className="milestones"><span className="done"><i><Check size={12} /></i>베뉴</span><span className="done"><i><Check size={12} /></i>스드메</span><span className="active"><i>3</i>예복·예물</span><span><i>4</i>본식 준비</span></div></div></section>
          <section className="portal-grid">
            <div className="portal-section portal-section--wide"><div className="portal-section__head"><div><p className="eyebrow">Next schedule</p><h2>다가오는 일정</h2></div><button onClick={() => openTab('calendar')}>전체 보기 <ChevronRight size={14} /></button></div><div className="portal-schedule">{coupleEvents.slice(0,3).map((event, index) => <article key={event.id} className={index === 0 ? 'featured' : ''}><div className="portal-date"><strong>{event.date.slice(-2)}</strong><span>AUG</span></div><div><Badge tone={index === 0 ? 'rose' : 'neutral'}>{event.type}</Badge><h3>{event.title}</h3><p><Clock3 size={13} /> {event.time}–{event.endTime}</p><p><MapPin size={13} /> {event.location}</p></div>{index === 0 && <span className="schedule-note">준비물 체크 필요</span>}</article>)}</div></div>
            <div className="portal-section"><div className="portal-section__head"><div><p className="eyebrow">This week</p><h2>이번 주 할 일</h2></div><span>{completed}/{tasks.length}</span></div><div className="portal-tasks">{tasks.slice(0,4).map((task) => <label key={task.id} className={task.completed ? 'done' : ''}><input type="checkbox" checked={task.completed} onChange={() => toggleChecklist(task.id)} /><span><Check size={13} /></span><div><strong>{task.title}</strong><small>{task.dueDate}까지 · {task.owner}</small></div></label>)}</div><button className="portal-full-button" onClick={() => openTab('tasks')}>할 일 전체 보기 <ArrowRight size={14} /></button></div>
          </section>
          <section className="portal-recommend-banner"><div><span><Sparkles size={18} /></span><div><p className="eyebrow">Planner selection</p><h2>새 추천 업체 3곳이 등록되었습니다.</h2><p>선호한 스타일 태그와 예상 예산을 기준으로 정리한 업체입니다.</p><button onClick={() => openTab('vendors')}>추천 목록 보기 <ArrowRight size={14} /></button></div></div><img src={imageAssets.vendorDressGallery} alt="추천 실크 웨딩드레스" /></section>
          <section className="portal-confirmed-vendors">
            {confirmedVendorGroups.map((group) => <article className="portal-confirmed-vendors__group" key={group.label}><header><p className="eyebrow">Confirmed</p><h3>{group.label}</h3></header>{group.items.length ? group.items.map((item) => <div className="portal-confirmed-vendor" key={item.id}><strong>{item.name}</strong><span>{item.category}</span><p>{item.summary}</p></div>) : <p className="portal-empty-state">아직 확정된 업체가 없습니다.</p>}</article>)}
          </section>
        </>}

        {tab === 'calendar' && <section className="portal-subpage portal-calendar-page"><div className="portal-subpage__intro"><p className="eyebrow">Planner coordination</p><h2>플래너와 일정 조율</h2><p>플래너가 제안한 일정만 확인하고 오케이하거나, 확정된 일정으로 이동할 수 있습니다.</p></div><div className="portal-coordination-calendar"><div className="portal-calendar-list-head"><div><p className="eyebrow">Schedule calendar</p><h3>{calendarView === 'week' ? '주간 일정 조율 캘린더' : '월간 일정 조율 캘린더'}</h3></div><div className="portal-calendar-list-toggle"><button className={calendarView === 'week' ? 'active' : ''} onClick={() => setCalendarView('week')}>주간</button><button className={calendarView === 'month' ? 'active' : ''} onClick={() => setCalendarView('month')}>월간</button></div></div>{calendarView === 'month' ? <div className="portal-month-calendar"><div className="portal-month-weekdays">{['일', '월', '화', '수', '목', '금', '토'].map((day) => <span key={day}>{day}</span>)}</div><div className="portal-month-grid">{monthlyDays.map((date) => { const dayEvents = coupleEvents.filter((event) => event.date === date); return <div className={`portal-month-cell ${dayEvents.some((event) => event.approvalStatus === 'confirmed') ? 'has-confirmed' : ''}`} key={date}><strong>{Number(date.slice(-2))}</strong>{dayEvents.map((event) => <span className={`portal-month-event portal-month-event--${event.approvalStatus ?? 'planner-proposed'}`} key={event.id}>{event.title}</span>)}</div> })}</div></div> : <div className="portal-event-list portal-event-list--embedded">{visibleCalendarEvents.length ? visibleCalendarEvents.map((event) => <article key={event.id}><div className="portal-date"><strong>{event.date.slice(-2)}</strong><span>{event.date.slice(5,7)}월</span></div><div><Badge tone={event.approvalStatus === 'confirmed' ? 'sage' : 'amber'}>{event.approvalStatus === 'confirmed' ? '확정 일정' : '조율 중'}</Badge><h4>{event.title}</h4><p>{event.date} · {event.time}–{event.endTime}</p></div><span className={`coordination-status coordination-status--${event.approvalStatus ?? 'planner-proposed'}`}>{event.approvalStatus === 'confirmed' ? '확정' : event.approvalStatus === 'client-ok' ? '오케이 완료' : '플래너 제안'}</span></article>) : <p className="portal-empty-state">이 보기에는 일정이 없습니다.</p>}</div>}</div><div className="portal-coordination-tabs"><button className={coordinationTab === 'coordination' ? 'active' : ''} onClick={() => setCoordinationTab('coordination')}>일정 조율</button><button className={coordinationTab === 'confirmed' ? 'active' : ''} onClick={() => setCoordinationTab('confirmed')}>확정 일정</button></div><section className="portal-event-list">{coordinationTab === 'coordination' ? <>{coupleEvents.filter((event) => event.approvalStatus !== 'confirmed').map((event) => <article key={event.id}><div><Badge tone="amber">플래너 제안</Badge><h4>{event.title}</h4><p>{event.date} · {event.time}–{event.endTime} · {event.location}</p></div><button className="event-confirmed event-confirmed--planner-proposed" onClick={() => event.approvalStatus === 'planner-proposed' && updateEvent({ ...event, approvalStatus: 'client-ok' })}>{event.approvalStatus === 'client-ok' ? '오케이 완료' : '오케이하기'}</button></article>)}{!coupleEvents.some((event) => event.approvalStatus !== 'confirmed') && <p className="portal-empty-state">현재 조율 중인 일정이 없습니다.</p>}</> : <>{coupleEvents.filter((event) => event.approvalStatus === 'confirmed').map((event) => <article key={event.id}><div><Badge tone="sage">확정</Badge><h4>{event.title}</h4><p>{event.date} · {event.time}–{event.endTime} · {event.location}</p></div><span className="coordination-status coordination-status--confirmed">확정 일정</span></article>)}{!coupleEvents.some((event) => event.approvalStatus === 'confirmed') && <p className="portal-empty-state">아직 확정된 일정이 없습니다.</p>}</>}</section></section>}
        {tab === 'tasks' && <section className="portal-subpage portal-tasks-page"><div className="portal-subpage__intro"><p className="eyebrow">Shared checklist</p><h2>준비 할 일</h2><p>처음에는 비어 있습니다. 기본 템플릿을 불러오거나 직접 시작할 수 있어요.</p></div>{!taskTemplateAsked && <div className="task-template-prompt"><strong>기본 템플릿을 사용해 볼까요?</strong><p>플래너가 저장해 둔 월별 준비 항목을 한 번에 불러옵니다.</p><div><button onClick={() => { setTaskTemplateEnabled(true); setTaskTemplateAsked(true) }}>기본 템플릿 사용</button><button className="secondary" onClick={() => setTaskTemplateAsked(true)}>빈 화면에서 시작</button></div></div>}{taskTemplateAsked && !taskTemplateEnabled && <><div className="task-template-empty"><strong>아직 등록된 할 일이 없습니다.</strong><p>원하는 항목을 직접 추가해 보세요.</p></div><CategoryChecklist tasks={[]} onToggle={toggleChecklist} editable onAdd={(category) => { setEditorItem(null); setEditorCategory(category ?? '스튜디오'); setEditorOpen(true) }} /></>}{taskTemplateEnabled && <><MonthlyRoadmap tasks={tasks} onToggle={toggleChecklist} /><CategoryChecklist tasks={tasks} onToggle={toggleChecklist} editable onAdd={(category) => { setEditorItem(null); setEditorCategory(category ?? '스튜디오'); setEditorOpen(true) }} onEdit={(item) => { setEditorItem(item); setEditorCategory(item.category); setEditorOpen(true) }} /></>}</section>}
        {tab === 'vendors' && <section className="portal-subpage portal-vendors"><div className="portal-subpage__intro"><p className="eyebrow">Curated by your planner</p><h2>두 분을 위한 셀렉션</h2><p>마음에 드는 곳을 표시해주세요. 지윤 플래너님이 다음 단계를 도와드릴게요.</p></div><div className="portal-vendor-category-tabs">{vendorCategories.map((category) => <button key={category} className={vendorCategory === category ? 'active' : ''} onClick={() => setVendorCategory(category)}>{category}</button>)}</div><div className="portal-vendor-grid">{recs.filter(({ vendor }) => vendor && (vendorCategory === '전체' || vendor.category === vendorCategory)).map(({ vendor, status }) => vendor && <article key={vendor.id}><div className="portal-vendor-image"><img src={vendor.image} style={{ objectPosition: vendor.imagePosition }} alt={vendor.name} /><Badge tone="dark">{vendor.match}% MATCH</Badge></div><div className="portal-vendor-body"><span>{vendor.category} · {vendor.location}</span><h3>{vendor.name}</h3><p>{vendor.summary}</p><div className="tag-row">{vendor.tags.map((tag) => <span key={tag}>{tag}</span>)}</div><div className="portal-response"><button className={status === 'liked' ? 'active-like' : ''} onClick={() => setRecommendation(couple.id, vendor.id, 'liked')}><Heart size={15} fill={status === 'liked' ? 'currentColor' : 'none'} /> 마음에 들어요</button><button className={status === 'hold' ? 'active-hold' : ''} onClick={() => setRecommendation(couple.id, vendor.id, 'hold')}><Pause size={15} /> 조금 더 볼게요</button></div></div></article>)}</div></section>}
      </main>
      <ChecklistEditorModal open={editorOpen} coupleId={couple.id} defaultCategory={editorCategory} item={editorItem} onClose={() => setEditorOpen(false)} onCreate={addChecklist} onUpdate={updateChecklist} onDelete={deleteChecklist} />      {message && <div className="portal-toast"><ThumbsUp size={17} /><div><strong>메시지 창을 준비했어요</strong><span>데모에서는 플래너에게 알림만 전송됩니다.</span></div></div>}
    </div>
  )
}
