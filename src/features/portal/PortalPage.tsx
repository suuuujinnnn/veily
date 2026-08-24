import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { ArrowRight, CalendarRange, Check, CheckCircle2, ChevronRight, Clock3, Heart, LayoutGrid, MapPin, Pause, Sparkles } from 'lucide-react'
import { useDemoStore } from '../../app/store'
import { Badge, Card, Progress, SegmentedTabs } from '../../components/ui'
import { imageAssets } from '../../assets/images'
import { CategoryChecklist } from '../checklist/CategoryChecklist'
import { MonthlyRoadmap } from '../checklist/MonthlyRoadmap'
import { formatChecklistDate } from '../checklist/checklistUtils'
import { PortalSharedCalendar } from './PortalSharedCalendar'
import { VendorInsightsPanel } from '../reviews/VendorInsightsPanel'
import { formatDate } from '../reminders/reminderUtils'
import { weddingReferences } from '../../data/weddingReferenceData'
import { ClientTasteDiscovery } from './ClientTasteDiscovery'
import { BudgetPlanSection } from '../../components/budget/BudgetPlanSection'

type PortalTab = 'home' | 'calendar' | 'tasks' | 'discover' | 'vendors' | 'reviews' | 'estimate'
type PreparationView = 'monthly' | 'category'

export function PortalPage() {
  const { coupleId = 'c1', section } = useParams()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const { couples, events, checklist, vendors, contracts, portalSettings, recommendations, uploadedReferences, setRecommendation } = useDemoStore()
  const couple = couples.find((item) => item.id === coupleId) ?? couples[0]
  const storedSettings = portalSettings.find((item) => item.coupleId === couple.id)
  const hasPortal = Boolean(storedSettings) && couple.status !== '취소'
  const settings = storedSettings ?? { coupleId: couple.id, showSchedule: true, showFullEstimate: true, showChecklist: true }
  const requestedTab = (['home', 'calendar', 'tasks', 'discover', 'vendors', 'reviews', 'estimate'] as PortalTab[]).includes(section as PortalTab) ? section as PortalTab : 'home'
  const allowedRequestedTab = (requestedTab === 'calendar' && !settings.showSchedule) || (requestedTab === 'tasks' && !settings.showChecklist) ? 'home' : requestedTab
  const initialTab = allowedRequestedTab
  const [tab, setTab] = useState<PortalTab>(initialTab)
  const preparationView: PreparationView = searchParams.get('taskView') === 'category' ? 'category' : 'monthly'
  const coupleEvents = events.filter((event) => event.coupleId === couple.id && event.visibility === 'couple-shared')
  const tasks = checklist.filter((item) => item.coupleId === couple.id && item.owner !== '플래너').sort((a, b) => a.dueDate.localeCompare(b.dueDate))
  const coupleContracts = contracts.filter((item) => item.coupleId === couple.id)
  const referenceLibrary = [...uploadedReferences, ...weddingReferences]
  const recs = recommendations.filter((item) => item.coupleId === couple.id).map((item) => ({ ...item, vendor: vendors.find((vendor) => vendor.id === item.vendorId), sourceReference: referenceLibrary.find((reference) => reference.id === item.sourceReferenceId) })).filter((item) => item.vendor)
  const completed = tasks.filter((task) => task.status === 'completed').length
  const partnerGreeting = couple.partners
    .split(' & ')
    .map((name) => `${name.slice(1)}님`)
    .join(', ')
  const dDay = Math.max(0, Math.ceil((new Date(couple.weddingDate).getTime() - new Date('2026-08-05').getTime()) / 86_400_000))
  useEffect(() => {
    setTab(allowedRequestedTab)
    if (requestedTab !== allowedRequestedTab) navigate(`/portal/${couple.id}`, { replace: true })
  }, [allowedRequestedTab, couple.id, navigate, requestedTab])
  const openTab = (nextTab: PortalTab) => {
    setTab(nextTab)
    navigate(`/portal/${couple.id}${nextTab === 'home' ? '' : `/${nextTab}`}`)
  }
  const openPreparationView = (nextView: PreparationView) => {
    const nextParams = new URLSearchParams(searchParams)
    if (nextView === 'monthly') nextParams.delete('taskView')
    else nextParams.set('taskView', nextView)
    setSearchParams(nextParams)
  }

  if (!hasPortal) return <div className="portal-page portal-page--unavailable"><main className="portal-content"><Card className="portal-unavailable-card"><Sparkles size={22} /><strong>생성된 고객 포털이 없습니다.</strong><p>상담 종료 고객에게는 공유 링크가 발급되지 않습니다.</p></Card></main></div>

  return (
    <div className="portal-page">
      <section className="portal-hero">
        <img src={imageAssets.weddingGarden} alt="정원에서 함께 걷는 신랑 신부" />
        <div className="portal-hero__shade" />
        <div className="portal-hero__copy"><p>OUR WEDDING JOURNEY</p><h1>{couple.partners.replace('&', 'and')}</h1><div><span>{couple.weddingDate.replaceAll('-', '. ')}</span><i /><span>{couple.venue}</span></div></div>
        <div className="d-day"><small>OUR DAY</small><strong>D—{dDay}</strong><span>함께 준비한 지 42일</span></div>
      </section>
      <div className="portal-context-strip"><span><strong>신랑·신부 전용 포털</strong> · 플래너 관리 화면과 분리되어 있습니다.</span><Link to={`/client/${couple.id}`}>접속 화면으로</Link></div>
      <nav className="portal-nav"><div>{([['home','우리의 홈'], ...(settings.showSchedule ? [['calendar','공유 캘린더']] : []), ...(settings.showChecklist ? [['tasks','로드맵']] : []), ['discover','내 취향 찾기'], ['vendors','추천 업체'], ['reviews','업체 정보'], ['estimate','견적']] as [PortalTab,string][]).map(([key,label]) => <button className={tab === key ? 'active' : ''} onClick={() => openTab(key)} key={key}>{label}{key === 'tasks' && <em>{tasks.filter((task) => task.status !== 'completed').length}</em>}</button>)}</div></nav>

      <main className="portal-content">
        {tab === 'home' && <>
          <section className="portal-welcome"><div><p className="eyebrow">Hello, our lovely couple</p><h2>{partnerGreeting}.<br /><em>오늘도 설레는 준비를 시작해볼까요?</em></h2><p>결혼식까지 {dDay}일, 지금까지 아주 잘 준비하고 있어요.</p></div><div className="portal-progress"><div><span>전체 준비율</span><strong>{couple.progress}%</strong></div><Progress value={couple.progress} /><div className="milestones"><span className="done"><i><Check size={12} /></i>베뉴</span><span className="done"><i><Check size={12} /></i>스드메</span><span className="active"><i>3</i>예복·예물</span><span><i>4</i>본식 준비</span></div></div></section>
          <section className={`portal-grid ${!settings.showSchedule || !settings.showChecklist ? 'portal-grid--single' : ''}`}>
            {settings.showSchedule && <div className="portal-section portal-section--wide"><div className="portal-section__head"><div><p className="eyebrow">Next schedule</p><h2>다가오는 일정</h2></div><button onClick={() => openTab('calendar')}>전체 보기 <ChevronRight size={14} /></button></div><div className="portal-schedule">{coupleEvents.slice(0,3).map((event, index) => <article key={event.id} className={index === 0 ? 'featured' : ''}><div className="portal-date"><strong>{event.date.slice(-2)}</strong><span>AUG</span></div><div><Badge tone={index === 0 ? 'rose' : 'neutral'}>{event.type}</Badge><h3>{event.title}</h3><p><Clock3 size={13} /> {event.time}–{event.endTime}</p><p><MapPin size={13} /> {event.location}</p></div>{index === 0 && <span className="schedule-note">준비물 체크 필요</span>}</article>)}</div></div>}
            {settings.showChecklist && <div className="portal-section"><div className="portal-section__head"><div><p className="eyebrow">This week</p><h2>이번 주 할 일</h2></div><span>{completed}/{tasks.length}</span></div><div className="portal-tasks">{tasks.slice(0,4).map((task) => <label key={task.id} className={task.status === 'completed' ? 'done' : ''}><span><Check size={13} /></span><div><strong>{task.title}</strong><small>{task.kind === 'decision' && task.status === 'pending' ? '미결정 · ' : ''}{formatChecklistDate(task.dueDate)}까지 · {task.owner}</small></div></label>)}</div><button className="portal-full-button" onClick={() => openTab('tasks')}>할 일 전체 보기 <ArrowRight size={14} /></button></div>}
          </section>
          <section className="portal-recommend-banner"><div><span><Sparkles size={18} /></span><div><p className="eyebrow">Planner selection</p><h2>분석 DB 추천 업체 {recs.length}곳이 등록되었습니다.</h2><p>검수된 포트폴리오 스타일 라벨과 두 분의 취향을 기준으로 정리했습니다.</p><button onClick={() => openTab('vendors')}>추천 목록 보기 <ArrowRight size={14} /></button></div></div><img src={recs[0]?.vendor?.image ?? imageAssets.vendorDressGallery} alt={recs[0]?.vendor ? `${recs[0].vendor.name} 포트폴리오` : '추천 웨딩 포트폴리오'} /></section>
        </>}

        {tab === 'calendar' && <PortalSharedCalendar coupleId={couple.id} />}

        {tab === 'tasks' && <section className="portal-subpage portal-tasks-page"><div className="portal-subpage__intro"><p className="eyebrow">Shared checklist</p><h2>준비 할 일</h2><p>플래너가 정리한 준비 흐름과 현재 상태를 확인할 수 있습니다.</p></div><div className="checklist-workspace"><SegmentedTabs value={preparationView} onChange={openPreparationView} ariaLabel="할 일 보기" items={[{ value: 'monthly', label: '월별 로드맵', icon: <CalendarRange size={13} /> }, { value: 'category', label: '분야별 체크리스트', icon: <LayoutGrid size={13} /> }]} />{preparationView === 'monthly' && <MonthlyRoadmap tasks={tasks} onToggle={() => undefined} readOnly />}{preparationView === 'category' && <div className="checklist-workspace__lower"><CategoryChecklist tasks={tasks} onToggle={() => undefined} readOnly /></div>}</div></section>}

        {tab === 'discover' && <ClientTasteDiscovery coupleId={couple.id} />}


        {tab === 'vendors' && <section className="portal-subpage portal-vendors"><div className="portal-subpage__intro"><p className="eyebrow">Curated by your planner</p><h2>두 분을 위한 추천 업체</h2><p>마음에 드는 후보에 하트를 눌러 투어 의사를 알려주세요. 최종 확정은 플래너가 함께 확인해요.</p></div><div className="portal-vendor-grid">{recs.map(({ vendor, status, selectionDeadline, sourceReference }) => { if (!vendor) return null; const confirmed = status === 'confirmed'; return <article className={`portal-vendor-card--${status}`} key={vendor.id}><div className="portal-vendor-image"><img src={sourceReference?.image ?? vendor.image} style={{ objectPosition: sourceReference?.imagePosition ?? vendor.imagePosition }} alt={vendor.name} /><Badge tone={confirmed ? 'sage' : status === 'liked' ? 'amber' : 'dark'}>{confirmed ? '확정' : status === 'liked' ? '투어 예정' : status === 'hold' ? '보류' : '추천 후보'}</Badge></div><div className="portal-vendor-body"><span>{vendor.category} · {vendor.location}</span><h3>{vendor.name}</h3><p>{vendor.summary}</p><div className="tag-row">{vendor.tags.slice(0, 5).map((tag) => <span key={tag}>{tag}</span>)}</div><p className="portal-selection-deadline">후보 선택 기한 <strong>{formatDate(selectionDeadline)}</strong></p>{confirmed ? <div className="portal-vendor-confirmed"><CheckCircle2 size={16} /><div><strong>최종 확정된 업체예요</strong><span>변경이 필요하면 플래너에게 문의해 주세요.</span></div></div> : <div className="portal-response"><button className={status === 'liked' ? 'active-like' : ''} onClick={() => setRecommendation(couple.id, vendor.id, status === 'liked' ? 'pending' : 'liked')}><Heart size={15} fill={status === 'liked' ? 'currentColor' : 'none'} /> {status === 'liked' ? '투어 예정' : '투어 희망'}</button><button className={status === 'hold' ? 'active-hold' : ''} onClick={() => setRecommendation(couple.id, vendor.id, 'hold')}><Pause size={15} /> 조금 더 볼게요</button></div>}</div></article>})}</div></section>}

        {tab === 'reviews' && <section className="portal-subpage portal-reviews"><div className="portal-subpage__intro"><p className="eyebrow">Verified partner information</p><h2>업체 실무 정보</h2><p>인증 플래너가 현장에서 확인한 특장점과 유의할 점을 업체별로 살펴보세요.</p></div><VendorInsightsPanel availableVendors={vendors} showFilters featuredVendorIds={recs.map((recommendation) => recommendation.vendorId)} title="제휴업체 정보" description="두 분께 추천된 업체의 정보가 먼저 표시됩니다." /></section>}

        {tab === 'estimate' && <section className="portal-subpage portal-estimate">
          <div className="portal-subpage__intro"><p className="eyebrow">Estimate</p><h2>계획 예산</h2><p>처음 세운 예산과 실제 계약 금액의 차이를 확인하세요.</p></div>
          <BudgetPlanSection coupleId={couple.id} readOnly />
          {coupleContracts.length > 0 && <section className="portal-contracted-vendors"><div><p className="eyebrow">Contracted vendors</p><h3>계약한 업체</h3></div><div>{coupleContracts.map((contract) => <article key={contract.id}><Badge tone="neutral">{contract.category}</Badge><strong>{contract.vendorName}</strong></article>)}</div></section>}
        </section>}
      </main>
    </div>
  )
}
