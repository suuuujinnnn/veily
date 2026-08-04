import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { ArrowRight, CalendarDays, Check, CheckCircle2, ChevronRight, Clock3, Heart, MapPin, MessageCircle, Pause, Sparkles, ThumbsUp } from 'lucide-react'
import { useDemoStore } from '../../app/store'
import { Badge, Progress } from '../../components/ui'
import { couples, vendors } from '../../data/mockData'
import { imageAssets } from '../../assets/images'

type PortalTab = 'home' | 'calendar' | 'tasks' | 'vendors'
const slots = ['8월 8일 (토) 11:00', '8월 8일 (토) 14:00', '8월 9일 (일) 10:30']

export function PortalPage() {
  const { coupleId = 'c1' } = useParams()
  const couple = couples.find((item) => item.id === coupleId) ?? couples[0]
  const { events, checklist, recommendations, availability, toggleChecklist, setRecommendation, toggleAvailability } = useDemoStore()
  const [tab, setTab] = useState<PortalTab>('home')
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

  return (
    <div className="portal-page">
      <section className="portal-hero">
        <img src={imageAssets.weddingGarden} alt="정원에서 함께 걷는 신랑 신부" />
        <div className="portal-hero__shade" />
        <div className="portal-hero__copy"><p>OUR WEDDING JOURNEY</p><h1>{couple.partners.replace('&', 'and')}</h1><div><span>{couple.weddingDate.replaceAll('-', '. ')}</span><i /><span>{couple.venue}</span></div></div>
        <div className="d-day"><small>OUR DAY</small><strong>D—{dDay}</strong><span>함께 준비한 지 42일</span></div>
      </section>
      <nav className="portal-nav"><div>{([['home','우리의 홈'],['calendar','공유 캘린더'],['tasks','준비 타임라인'],['vendors','추천 업체']] as [PortalTab,string][]).map(([key,label]) => <button className={tab === key ? 'active' : ''} onClick={() => setTab(key)} key={key}>{label}{key === 'tasks' && <em>{tasks.filter((task) => !task.completed).length}</em>}</button>)}</div><button className="planner-message" onClick={() => { setMessage(true); window.setTimeout(() => setMessage(false), 1800) }}><MessageCircle size={15} /> 플래너에게 메시지</button></nav>

      <main className="portal-content">
        {tab === 'home' && <>
          <section className="portal-welcome"><div><p className="eyebrow">Hello, our lovely couple</p><h2>{partnerGreeting}.<br /><em>오늘도 설레는 <br className="mobile-break" />준비를 시작해볼까요?</em></h2><p>결혼식까지 {dDay}일, 지금까지 아주 잘 준비하고 있어요.</p></div><div className="portal-progress"><div><span>전체 준비율</span><strong>{couple.progress}%</strong></div><Progress value={couple.progress} /><div className="milestones"><span className="done"><i><Check size={12} /></i>베뉴</span><span className="done"><i><Check size={12} /></i>스드메</span><span className="active"><i>3</i>예복·예물</span><span><i>4</i>본식 준비</span></div></div></section>
          <section className="portal-grid">
            <div className="portal-section portal-section--wide"><div className="portal-section__head"><div><p className="eyebrow">Next schedule</p><h2>다가오는 일정</h2></div><button onClick={() => setTab('calendar')}>전체 보기 <ChevronRight size={14} /></button></div><div className="portal-schedule">{coupleEvents.slice(0,3).map((event, index) => <article key={event.id} className={index === 0 ? 'featured' : ''}><div className="portal-date"><strong>{event.date.slice(-2)}</strong><span>AUG</span></div><div><Badge tone={index === 0 ? 'rose' : 'neutral'}>{event.type}</Badge><h3>{event.title}</h3><p><Clock3 size={13} /> {event.time}–{event.endTime}</p><p><MapPin size={13} /> {event.location}</p></div>{index === 0 && <span className="schedule-note">준비물 체크 필요</span>}</article>)}</div></div>
            <div className="portal-section"><div className="portal-section__head"><div><p className="eyebrow">This week</p><h2>이번 주 할 일</h2></div><span>{completed}/{tasks.length}</span></div><div className="portal-tasks">{tasks.slice(0,4).map((task) => <label key={task.id} className={task.completed ? 'done' : ''}><input type="checkbox" checked={task.completed} onChange={() => toggleChecklist(task.id)} /><span><Check size={13} /></span><div><strong>{task.title}</strong><small>{task.dueDate}까지 · {task.owner}</small></div></label>)}</div><button className="portal-full-button" onClick={() => setTab('tasks')}>타임라인 전체 보기 <ArrowRight size={14} /></button></div>
          </section>
          <section className="portal-recommend-banner"><div><span><Sparkles size={18} /></span><div><p className="eyebrow">A note from your planner</p><h2>두 분을 닮은 드레스 숍을 골라봤어요.</h2><p>보내주신 이미지에서 공통으로 보이는 깨끗한 실크와 구조적인 라인을 중심으로 찾았어요.</p><button onClick={() => setTab('vendors')}>추천 컬렉션 보기 <ArrowRight size={14} /></button></div></div><img src={imageAssets.atelierDress} alt="추천 실크 웨딩드레스" /></section>
        </>}

        {tab === 'calendar' && <section className="portal-subpage"><div className="portal-subpage__intro"><p className="eyebrow">Shared calendar</p><h2>우리의 일정</h2><p>플래너님과 함께 정한 일정, 그리고 조율이 필요한 시간을 확인해보세요.</p></div><div className="availability-card"><div><span className="availability-icon"><CalendarDays size={22} /></span><div><Badge tone="amber">시간 선택 필요</Badge><h3>메이크업 테스트 가능한 시간을 알려주세요</h3><p>선택한 시간은 지윤 플래너님에게 바로 공유돼요.</p></div></div><div className="slot-list">{slots.map((slot) => { const selected = (availability.e4 ?? []).includes(slot); return <button key={slot} onClick={() => toggleAvailability('e4', slot)} className={selected ? 'selected' : ''}><span>{selected && <Check size={13} />}</span>{slot}</button>})}</div><small>여러 시간을 선택할 수 있어요 · 8월 7일까지 응답</small></div><div className="portal-event-list"><h3>8월 일정</h3>{coupleEvents.map((event) => <article key={event.id}><div className="portal-date"><strong>{event.date.slice(-2)}</strong><span>AUG</span></div><div><Badge tone="rose">{event.type}</Badge><h4>{event.title}</h4><p>{event.time}–{event.endTime} · {event.location}</p></div><span className="event-confirmed"><CheckCircle2 size={14} /> 확정</span></article>)}</div></section>}

        {tab === 'tasks' && <section className="portal-subpage"><div className="portal-subpage__intro"><p className="eyebrow">Wedding timeline</p><h2>차근차근, 우리의 속도로</h2><p>완료한 항목을 체크하면 플래너님도 바로 확인할 수 있어요.</p></div><div className="portal-timeline"><div className="timeline-phase"><span>NOW</span><h3>D—73 · 예복과 예물</h3></div>{tasks.map((task) => <label key={task.id} className={`portal-timeline-item ${task.completed ? 'done' : ''}`}><input type="checkbox" checked={task.completed} onChange={() => toggleChecklist(task.id)} /><span className="timeline-check"><Check size={15} /></span><div><small>{task.phase}</small><h4>{task.title}</h4><p>{task.dueDate}까지 · 담당 {task.owner}</p></div><Badge tone={task.completed ? 'sage' : 'neutral'}>{task.completed ? '완료했어요' : '준비 중'}</Badge></label>)}</div></section>}

        {tab === 'vendors' && <section className="portal-subpage portal-vendors"><div className="portal-subpage__intro"><p className="eyebrow">Curated by your planner</p><h2>두 분을 위한 셀렉션</h2><p>마음에 드는 곳을 표시해주세요. 지윤 플래너님이 다음 단계를 도와드릴게요.</p></div><div className="portal-vendor-grid">{recs.map(({ vendor, status }) => vendor && <article key={vendor.id}><div className="portal-vendor-image"><img src={vendor.image} style={{ objectPosition: vendor.imagePosition }} alt={vendor.name} /><Badge tone="dark">{vendor.match}% MATCH</Badge></div><div className="portal-vendor-body"><span>{vendor.category} · {vendor.location}</span><h3>{vendor.name}</h3><p>{vendor.summary}</p><div className="tag-row">{vendor.tags.map((tag) => <span key={tag}>{tag}</span>)}</div><div className="portal-response"><button className={status === 'liked' ? 'active-like' : ''} onClick={() => setRecommendation(couple.id, vendor.id, 'liked')}><Heart size={15} fill={status === 'liked' ? 'currentColor' : 'none'} /> 마음에 들어요</button><button className={status === 'hold' ? 'active-hold' : ''} onClick={() => setRecommendation(couple.id, vendor.id, 'hold')}><Pause size={15} /> 조금 더 볼게요</button></div></div></article>)}</div></section>}
      </main>
      {message && <div className="portal-toast"><ThumbsUp size={17} /><div><strong>메시지 창을 준비했어요</strong><span>데모에서는 플래너에게 알림만 전송됩니다.</span></div></div>}
    </div>
  )
}
