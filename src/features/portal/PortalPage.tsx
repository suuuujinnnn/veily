import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowRight, CalendarDays, Check, CheckCircle2, ChevronRight, Clock3, FolderHeart, Heart, MapPin, MessageCircle, Pause, ReceiptText, Sparkles, ThumbsUp } from 'lucide-react'
import { useDemoStore } from '../../app/store'
import { Badge, Card, Progress } from '../../components/ui'
import { imageAssets } from '../../assets/images'
import { CategoryChecklist } from '../checklist/CategoryChecklist'
import { MonthlyRoadmap } from '../checklist/MonthlyRoadmap'
import { formatChecklistDate } from '../checklist/checklistUtils'
import { PortalVendorAvailability } from './PortalVendorAvailability'
import { VendorInsightsPanel } from '../reviews/VendorInsightsPanel'
import { formatDate } from '../reminders/reminderUtils'
import { weddingReferences } from '../../data/weddingReferenceData'
import { ClientTasteDiscovery } from './ClientTasteDiscovery'
import { weddingVenues } from '../../data/weddingVenueData'

type PortalTab = 'home' | 'calendar' | 'tasks' | 'discover' | 'references' | 'vendors' | 'reviews' | 'estimate'
const slots = ['8월 8일 (토) 11:00', '8월 8일 (토) 14:00', '8월 9일 (일) 10:30']

export function PortalPage() {
  const { coupleId = 'c1', section } = useParams()
  const navigate = useNavigate()
  const { couples, events, checklist, vendors, contracts, payments, portalSettings, recommendations, orderApprovals, availability, referenceBoards, uploadedReferences, setRecommendation, toggleAvailability } = useDemoStore()
  const couple = couples.find((item) => item.id === coupleId) ?? couples[0]
  const settings = portalSettings.find((item) => item.coupleId === couple.id) ?? { coupleId: couple.id, showSchedule: true, showFullEstimate: true, receiveMessages: true, showChecklist: true }
  const requestedTab = (['home', 'calendar', 'tasks', 'discover', 'references', 'vendors', 'reviews', 'estimate'] as PortalTab[]).includes(section as PortalTab) ? section as PortalTab : 'home'
  const allowedRequestedTab = (requestedTab === 'calendar' && !settings.showSchedule) || (requestedTab === 'tasks' && !settings.showChecklist) ? 'home' : requestedTab
  const initialTab = allowedRequestedTab
  const [tab, setTab] = useState<PortalTab>(initialTab)
  const [message, setMessage] = useState(false)
  const coupleEvents = events.filter((event) => event.coupleId === couple.id && event.visibility === 'couple-shared')
  const tasks = checklist.filter((item) => item.coupleId === couple.id && item.owner !== '플래너').sort((a, b) => a.dueDate.localeCompare(b.dueDate))
  const coupleContracts = contracts.filter((item) => item.coupleId === couple.id)
  const couplePayments = payments.filter((item) => item.coupleId === couple.id)
  const totalContractAmount = coupleContracts.reduce((sum, item) => sum + item.totalPrice, 0)
  const totalPaymentAmount = couplePayments.reduce((sum, item) => sum + (item.type === '환불' ? -item.amount : item.amount), 0)
  const remainingAmount = Math.max(0, totalContractAmount - totalPaymentAmount)
  const recs = recommendations.filter((item) => item.coupleId === couple.id).map((item) => ({ ...item, vendor: vendors.find((vendor) => vendor.id === item.vendorId) })).filter((item) => item.vendor)
  const referenceBoard = referenceBoards.find((item) => item.coupleId === couple.id && item.status === '공유됨')
  const referenceLibrary = [...uploadedReferences, ...weddingReferences]
  const boardReferences = referenceBoard?.items.map((item) => { const reference = referenceLibrary.find((entry) => entry.id === item.referenceId); return { item, reference, venue: reference?.venueId ? weddingVenues.find((venue) => venue.id === reference.venueId) : undefined } }).filter((entry) => entry.reference) ?? []
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

  return (
    <div className="portal-page">
      <section className="portal-hero">
        <img src={imageAssets.weddingGarden} alt="정원에서 함께 걷는 신랑 신부" />
        <div className="portal-hero__shade" />
        <div className="portal-hero__copy"><p>OUR WEDDING JOURNEY</p><h1>{couple.partners.replace('&', 'and')}</h1><div><span>{couple.weddingDate.replaceAll('-', '. ')}</span><i /><span>{couple.venue}</span></div></div>
        <div className="d-day"><small>OUR DAY</small><strong>D—{dDay}</strong><span>함께 준비한 지 42일</span></div>
      </section>
      <div className="portal-context-strip"><span><strong>신랑·신부 전용 포털</strong> · 플래너 관리 화면과 분리되어 있습니다.</span><Link to={`/client/${couple.id}`}>접속 화면으로</Link></div>
      <nav className="portal-nav"><div>{([['home','우리의 홈'], ...(settings.showSchedule ? [['calendar','공유 캘린더']] : []), ...(settings.showChecklist ? [['tasks','할 일']] : []), ['discover','내 취향 찾기'], ...(referenceBoard ? [['references','플래너 레퍼런스']] : []), ['vendors','추천 업체'], ['reviews','업체 정보'], ['estimate','견적']] as [PortalTab,string][]).map(([key,label]) => <button className={tab === key ? 'active' : ''} onClick={() => openTab(key)} key={key}>{label}{key === 'tasks' && <em>{tasks.filter((task) => task.status !== 'completed').length}</em>}</button>)}</div>{settings.receiveMessages && <button className="planner-message" onClick={() => { setMessage(true); window.setTimeout(() => setMessage(false), 1800) }}><MessageCircle size={15} /> 플래너에게 메시지</button>}</nav>

      <main className="portal-content">
        {tab === 'home' && <>
          <section className="portal-welcome"><div><p className="eyebrow">Hello, our lovely couple</p><h2>{partnerGreeting}.<br /><em>오늘도 설레는 준비를 시작해볼까요?</em></h2><p>결혼식까지 {dDay}일, 지금까지 아주 잘 준비하고 있어요.</p></div><div className="portal-progress"><div><span>전체 준비율</span><strong>{couple.progress}%</strong></div><Progress value={couple.progress} /><div className="milestones"><span className="done"><i><Check size={12} /></i>베뉴</span><span className="done"><i><Check size={12} /></i>스드메</span><span className="active"><i>3</i>예복·예물</span><span><i>4</i>본식 준비</span></div></div></section>
          <section className={`portal-grid ${!settings.showSchedule || !settings.showChecklist ? 'portal-grid--single' : ''}`}>
            {settings.showSchedule && <div className="portal-section portal-section--wide"><div className="portal-section__head"><div><p className="eyebrow">Next schedule</p><h2>다가오는 일정</h2></div><button onClick={() => openTab('calendar')}>전체 보기 <ChevronRight size={14} /></button></div><div className="portal-schedule">{coupleEvents.slice(0,3).map((event, index) => <article key={event.id} className={index === 0 ? 'featured' : ''}><div className="portal-date"><strong>{event.date.slice(-2)}</strong><span>AUG</span></div><div><Badge tone={index === 0 ? 'rose' : 'neutral'}>{event.type}</Badge><h3>{event.title}</h3><p><Clock3 size={13} /> {event.time}–{event.endTime}</p><p><MapPin size={13} /> {event.location}</p></div>{index === 0 && <span className="schedule-note">준비물 체크 필요</span>}</article>)}</div></div>}
            {settings.showChecklist && <div className="portal-section"><div className="portal-section__head"><div><p className="eyebrow">This week</p><h2>이번 주 할 일</h2></div><span>{completed}/{tasks.length}</span></div><div className="portal-tasks">{tasks.slice(0,4).map((task) => <label key={task.id} className={task.status === 'completed' ? 'done' : ''}><span><Check size={13} /></span><div><strong>{task.title}</strong><small>{task.kind === 'decision' && task.status === 'pending' ? '미결정 · ' : ''}{formatChecklistDate(task.dueDate)}까지 · {task.owner}</small></div></label>)}</div><button className="portal-full-button" onClick={() => openTab('tasks')}>할 일 전체 보기 <ArrowRight size={14} /></button></div>}
          </section>
          <section className="portal-recommend-banner"><div><span><Sparkles size={18} /></span><div><p className="eyebrow">Planner selection</p><h2>분석 DB 추천 업체 {recs.length}곳이 등록되었습니다.</h2><p>검수된 포트폴리오 스타일 라벨과 두 분의 취향을 기준으로 정리했습니다.</p><button onClick={() => openTab('vendors')}>추천 목록 보기 <ArrowRight size={14} /></button></div></div><img src={recs[0]?.vendor?.image ?? imageAssets.vendorDressGallery} alt={recs[0]?.vendor ? `${recs[0].vendor.name} 포트폴리오` : '추천 웨딩 포트폴리오'} /></section>
          {referenceBoard && <section className="portal-reference-banner"><div><span><FolderHeart size={19} /></span><div><p className="eyebrow">Reference board</p><h2>플래너가 준비한 레퍼런스 {boardReferences.length}장</h2><p>{referenceBoard.memo || '상담에서 나눈 취향을 기준으로 모은 시안이에요.'}</p><button onClick={() => openTab('references')}>레퍼런스 보기 <ArrowRight size={14} /></button></div></div>{boardReferences[0]?.reference && <img src={boardReferences[0].reference.image} alt="플래너 레퍼런스 미리보기" />}</section>}
        </>}

        {tab === 'calendar' && <section className="portal-subpage portal-calendar-page"><div className="portal-subpage__intro"><p className="eyebrow">Shared calendar</p><h2>공유 일정</h2><p>업체가 공개한 주간 일정, 두 분의 가능 시간과 확정 일정을 한곳에서 확인하세요.</p></div><div className="availability-card"><div><span className="availability-icon"><CalendarDays size={22} /></span><div><Badge tone="amber">두 분의 응답</Badge><h3>메이크업 테스트가 가능한 시간을 표시해 주세요</h3><p>여기서는 두 분의 가능 시간을 알려주고, 아래에서는 업체가 공개한 일정을 함께 확인합니다.</p></div></div><div className="slot-list">{slots.map((slot) => { const selected = (availability.e4 ?? []).includes(slot); return <button key={slot} onClick={() => toggleAvailability('e4', slot)} className={selected ? 'selected' : ''}><span>{selected && <Check size={13} />}</span>{slot}</button>})}</div><small>여러 시간을 표시할 수 있습니다 · 플래너 화면과 바로 동기화됩니다</small></div><PortalVendorAvailability vendors={recs.flatMap(({ vendor }) => vendor ? [vendor] : [])} coupleId={couple.id} /><div className="portal-event-list"><h3>확정된 8월 일정</h3>{coupleEvents.map((event) => <article key={event.id}><div className="portal-date"><strong>{event.date.slice(-2)}</strong><span>AUG</span></div><div><Badge tone="rose">{event.type}</Badge><h4>{event.title}</h4><p>{event.time}–{event.endTime} · {event.location}</p></div><span className="event-confirmed"><CheckCircle2 size={14} /> 확정</span></article>)}</div></section>}

        {tab === 'tasks' && <section className="portal-subpage portal-tasks-page"><div className="portal-subpage__intro"><p className="eyebrow">Shared checklist</p><h2>준비 할 일</h2><p>플래너가 정리한 준비 흐름과 현재 상태를 확인할 수 있습니다.</p></div><MonthlyRoadmap tasks={tasks} onToggle={() => undefined} readOnly /><CategoryChecklist tasks={tasks} onToggle={() => undefined} readOnly /></section>}

        {tab === 'discover' && <ClientTasteDiscovery coupleId={couple.id} />}

        {tab === 'references' && referenceBoard && <section className="portal-subpage portal-reference-board"><Card padding="lg" className="portal-reference-header"><span className="portal-reference-header__icon"><FolderHeart size={20} /></span><div><p className="eyebrow">Curated by your planner</p><h2>{referenceBoard.title}</h2><p>{referenceBoard.memo || '상담에서 나눈 취향을 기준으로 플래너가 고른 자료입니다.'}</p></div><Badge tone="sage"><CheckCircle2 size={12} /> 열람 전용</Badge></Card><div className="portal-reference-grid">{boardReferences.map(({ item, reference, venue }, index) => reference && <Card padding="none" className="portal-reference-card" key={reference.id}><div className="portal-reference-image"><img src={reference.image} style={{ objectPosition: reference.imagePosition }} alt={`${reference.vendorName} 레퍼런스`} /><span>{String(index + 1).padStart(2, '0')}</span></div><div className="portal-reference-body"><div><Badge tone="neutral">{venue ? `${venue.locality} · ${venue.mealTypes.join('·')}` : `${reference.category} · ${reference.purpose}`}</Badge><strong>{reference.vendorName}</strong><small>{venue ? `${venue.accessPoints[0].name} ${venue.accessPoints[0].mode} ${venue.accessPoints[0].minutes}분` : `@${reference.account}`}</small></div><div className="tag-row">{(venue ? [venue.accessPoints[0].tagLabel, ...venue.wishes] : reference.tags).slice(0, 4).map((tag) => <span key={tag}>#{tag}</span>)}</div>{item.comment && <blockquote><span>PLANNER NOTE</span>“{item.comment}”</blockquote>}</div></Card>)}</div></section>}

        {tab === 'vendors' && <section className="portal-subpage portal-vendors"><div className="portal-subpage__intro"><p className="eyebrow">Curated by your planner</p><h2>두 분을 위한 셀렉션</h2><p>실제로 투어하고 싶은 업체에 하트를 눌러주세요. 하트한 업체만 플래너의 투어 목록에 반영됩니다.</p></div><div className="portal-vendor-grid">{recs.map(({ vendor, status, selectionDeadline }) => { if (!vendor) return null; const order = orderApprovals.find((item) => item.coupleId === couple.id && item.vendorId === vendor.id); const confirmedEvent = order?.relatedEventId ? events.find((item) => item.id === order.relatedEventId) : undefined; return <article key={vendor.id}><div className="portal-vendor-image"><img src={vendor.image} style={{ objectPosition: vendor.imagePosition }} alt={vendor.name} /><Badge tone="dark">{vendor.match}% MATCH</Badge></div><div className="portal-vendor-body"><span>{vendor.category} · {vendor.location}</span><h3>{vendor.name}</h3><p>{vendor.summary}</p><div className="tag-row">{vendor.tags.map((tag) => <span key={tag}>{tag}</span>)}</div><p className="portal-selection-deadline">후보 선택 기한 <strong>{formatDate(selectionDeadline)}</strong></p>{order && <div className={`portal-order-status portal-order-status--${order.status}`}><strong>{order.status === 'approved' ? '예약 확정' : order.status === 'rejected' ? '다른 일정을 확인 중이에요' : order.status === 'expired' ? '플래너가 다시 확인하고 있어요' : '예약 확인 중'}</strong><span>{order.status === 'approved' ? confirmedEvent ? `${formatDate(confirmedEvent.date)} ${confirmedEvent.time}로 확정되었어요.` : '업체 확인이 완료되었어요.' : order.status === 'rejected' ? '해당 일정 진행이 어려워 다른 후보를 확인하고 있어요.' : '업체에서 일정을 확인하고 있어요.'}</span></div>}<div className="portal-response"><button className={status === 'liked' ? 'active-like' : ''} onClick={() => setRecommendation(couple.id, vendor.id, status === 'liked' ? 'pending' : 'liked')}><Heart size={15} fill={status === 'liked' ? 'currentColor' : 'none'} /> {status === 'liked' ? '투어 예정' : '투어 희망'}</button><button className={status === 'hold' ? 'active-hold' : ''} onClick={() => setRecommendation(couple.id, vendor.id, 'hold')}><Pause size={15} /> 조금 더 볼게요</button></div></div></article>})}</div></section>}

        {tab === 'reviews' && <section className="portal-subpage portal-reviews"><div className="portal-subpage__intro"><p className="eyebrow">Verified partner information</p><h2>업체 실무 정보</h2><p>인증 플래너가 현장에서 확인한 특장점과 유의할 점을 업체별로 살펴보세요.</p></div><VendorInsightsPanel availableVendors={vendors} showFilters featuredVendorIds={recs.map((recommendation) => recommendation.vendorId)} title="제휴업체 정보" description="두 분께 추천된 업체의 정보가 먼저 표시됩니다." /></section>}

        {tab === 'estimate' && <section className="portal-subpage portal-estimate">
          <div className="portal-subpage__intro"><p className="eyebrow">Estimate</p><h2>계약·견적 현황</h2><p>{settings.showFullEstimate ? '업체별 계약 금액과 입금·잔금 현황을 간단히 확인하세요.' : '플래너가 공개한 계약 진행 상태입니다.'}</p></div>
          {settings.showFullEstimate && <div className="portal-estimate-summary"><article><span>총 계약금액</span><strong>{totalContractAmount.toLocaleString('ko-KR')}원</strong></article><article><span>입금</span><strong>{totalPaymentAmount.toLocaleString('ko-KR')}원</strong></article><article><span>잔금</span><strong>{remainingAmount.toLocaleString('ko-KR')}원</strong></article></div>}
          <div className="portal-contract-list">{coupleContracts.map((contract) => <article key={contract.id}><span className="portal-contract-icon"><ReceiptText size={18} /></span><div><Badge tone={contract.status === '서명완료' ? 'sage' : contract.status === '확인필요' ? 'amber' : 'neutral'}>{contract.status}</Badge><h3>{contract.vendorName}</h3><p>{contract.category} · {contract.packageDetails || '세부 구성 확인 중'}</p><small>{contract.paymentMethod} · VAT {contract.vatType}</small></div>{settings.showFullEstimate && <strong>{contract.totalPrice.toLocaleString('ko-KR')}원</strong>}</article>)}</div>
        </section>}
      </main>
      {message && <div className="portal-toast"><ThumbsUp size={17} /><div><strong>메시지 창을 준비했어요</strong><span>데모에서는 플래너에게 알림만 전송됩니다.</span></div></div>}
    </div>
  )
}
