import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowRight, CalendarDays, Check, CheckCircle2, ChevronRight, Clock3, Heart, MapPin, MessageCircle, Pause, Sparkles, ThumbsUp } from 'lucide-react'
import { useDemoStore } from '../../app/store'
import { Badge, Progress } from '../../components/ui'
import { couples, vendors } from '../../data/mockData'
import { imageAssets } from '../../assets/images'
import { CategoryChecklist } from '../checklist/CategoryChecklist'
import { MonthlyRoadmap } from '../checklist/MonthlyRoadmap'
import { PortalVendorAvailability } from './PortalVendorAvailability'

type PortalTab = 'home' | 'calendar' | 'tasks' | 'vendors'
const slots = ['8월 8일 (토) 11:00', '8월 8일 (토) 14:00', '8월 9일 (일) 10:30']

export function PortalPage() {
  const { coupleId = 'c1', section } = useParams()
  const navigate = useNavigate()
  const couple = couples.find((item) => item.id === coupleId) ?? couples[0]
  const { events, checklist, recommendations, availability, toggleChecklist, setRecommendation, toggleAvailability } = useDemoStore()
  const initialTab = (['home', 'calendar', 'tasks', 'vendors'] as PortalTab[]).includes(section as PortalTab) ? section as PortalTab : 'home'
  const [tab, setTab] = useState<PortalTab>(initialTab)
  const [message, setMessage] = useState(false)
  const coupleEvents = events.filter((event) => event.coupleId === couple.id)
  const tasks = checklist.filter((item) => item.coupleId === couple.id)
  const recs = recommendations.filter((item) => item.coupleId === couple.id).map((item) => ({ ...item, vendor: vendors.find((vendor) => vendor.id === item.vendorId) })).filter((item) => item.vendor)
  const completed = tasks.filter((task) => task.completed).length
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
        </>}

        {tab === 'calendar' && <section className="portal-subpage portal-calendar-page"><div className="portal-subpage__intro"><p className="eyebrow">Shared calendar</p><h2>공유 일정</h2><p>업체가 공개한 주간 일정, 두 분의 가능 시간과 확정 일정을 한곳에서 확인하세요.</p></div><div className="availability-card"><div><span className="availability-icon"><CalendarDays size={22} /></span><div><Badge tone="amber">두 분의 응답</Badge><h3>메이크업 테스트가 가능한 시간을 표시해 주세요</h3><p>여기서는 두 분의 가능 시간을 알려주고, 아래에서는 업체가 공개한 일정을 함께 확인합니다.</p></div></div><div className="slot-list">{slots.map((slot) => { const selected = (availability.e4 ?? []).includes(slot); return <button key={slot} onClick={() => toggleAvailability('e4', slot)} className={selected ? 'selected' : ''}><span>{selected && <Check size={13} />}</span>{slot}</button>})}</div><small>여러 시간을 표시할 수 있습니다 · 플래너 화면과 바로 동기화됩니다</small></div><PortalVendorAvailability vendors={recs.flatMap(({ vendor }) => vendor ? [vendor] : [])} coupleId={couple.id} /><div className="portal-event-list"><h3>확정된 8월 일정</h3>{coupleEvents.map((event) => <article key={event.id}><div className="portal-date"><strong>{event.date.slice(-2)}</strong><span>AUG</span></div><div><Badge tone="rose">{event.type}</Badge><h4>{event.title}</h4><p>{event.time}–{event.endTime} · {event.location}</p></div><span className="event-confirmed"><CheckCircle2 size={14} /> 확정</span></article>)}</div></section>}

        {tab === 'tasks' && <section className="portal-subpage portal-tasks-page"><div className="portal-subpage__intro"><p className="eyebrow">Shared checklist</p><h2>준비 할 일</h2><p>월별 흐름으로 먼저 보고, 분야별 체크리스트에서 완료 여부를 표시할 수 있습니다.</p></div><MonthlyRoadmap tasks={tasks} onToggle={toggleChecklist} /><CategoryChecklist tasks={tasks} onToggle={toggleChecklist} /></section>}

        {tab === 'vendors' && <section className="portal-subpage portal-vendors"><div className="portal-subpage__intro"><p className="eyebrow">Curated by your planner</p><h2>두 분을 위한 셀렉션</h2><p>마음에 드는 곳을 표시해주세요. 지윤 플래너님이 다음 단계를 도와드릴게요.</p></div><div className="portal-vendor-grid">{recs.map(({ vendor, status }) => vendor && <article key={vendor.id}><div className="portal-vendor-image"><img src={vendor.image} style={{ objectPosition: vendor.imagePosition }} alt={vendor.name} /><Badge tone="dark">{vendor.match}% MATCH</Badge></div><div className="portal-vendor-body"><span>{vendor.category} · {vendor.location}</span><h3>{vendor.name}</h3><p>{vendor.summary}</p><div className="tag-row">{vendor.tags.map((tag) => <span key={tag}>{tag}</span>)}</div><div className="portal-response"><button className={status === 'liked' ? 'active-like' : ''} onClick={() => setRecommendation(couple.id, vendor.id, 'liked')}><Heart size={15} fill={status === 'liked' ? 'currentColor' : 'none'} /> 마음에 들어요</button><button className={status === 'hold' ? 'active-hold' : ''} onClick={() => setRecommendation(couple.id, vendor.id, 'hold')}><Pause size={15} /> 조금 더 볼게요</button></div></div></article>)}</div></section>}
      </main>
      {message && <div className="portal-toast"><ThumbsUp size={17} /><div><strong>메시지 창을 준비했어요</strong><span>데모에서는 플래너에게 알림만 전송됩니다.</span></div></div>}
    </div>
  )
}
