import { Link } from 'react-router-dom'
import { ArrowUpRight, CalendarPlus, Check, ChevronRight, Clock3, FileWarning, MapPin, Sparkles, UsersRound } from 'lucide-react'
import { useDemoStore } from '../../app/store'
import { Badge, Button, Card, Progress } from '../../components/ui'
import { couples } from '../../data/mockData'
import { imageAssets } from '../../assets/images'

const typeTone: Record<string, 'rose' | 'sage' | 'amber' | 'neutral'> = {
  드레스: 'rose', 스튜디오: 'sage', 미팅: 'amber', 메이크업: 'rose', 계약: 'neutral', 본식: 'rose',
}

export function DashboardPage() {
  const { events, checklist } = useDemoStore()
  const todayEvents = events.filter((event) => event.date === '2026-08-05')
  const remainingTasks = checklist.filter((item) => !item.completed).length

  return (
    <div className="dashboard-page page-stack">
      <section className="page-intro dashboard-intro">
        <div><p className="eyebrow">Wednesday, 05 August</p><h1>좋은 아침이에요, 지윤님.</h1><p>오늘도 두 사람의 가장 좋은 날을 함께 준비해볼까요?</p></div>
        <Link to="/calendar"><Button icon={<CalendarPlus size={16} />}>새 일정 등록</Button></Link>
      </section>

      <section className="editorial-hero">
        <div className="editorial-hero__copy">
          <span className="overline">Today at a glance</span>
          <h2>차분하게,<br /><em>놓치는 일 없이.</em></h2>
          <p>오늘 {todayEvents.length}개의 일정과 {remainingTasks}개의 할 일이 기다리고 있어요. 이동 시간이 빠듯한 일정이 하나 있습니다.</p>
          <Link to="/calendar" className="text-link">오늘 일정 확인하기 <ArrowUpRight size={15} /></Link>
          <div className="hero-stats">
            <div><strong>04</strong><span>담당 커플</span></div>
            <div><strong>73%</strong><span>평균 준비율</span></div>
            <div><strong>12</strong><span>이번 주 일정</span></div>
          </div>
        </div>
        <div className="editorial-hero__image"><img src={imageAssets.weddingGarden} alt="정원에서 걷는 신랑 신부" /><span>Seo-yoon & Do-hyun<br />October, 2026</span></div>
      </section>

      <section className="section-block">
        <div className="section-heading"><div><p className="eyebrow">Your day</p><h2>오늘의 일정</h2></div><Link to="/calendar">전체 일정 <ChevronRight size={15} /></Link></div>
        <div className="today-layout">
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
          <div className="attention-list">
            <Card className="attention-card attention-card--rose"><span className="attention-icon"><FileWarning size={19} /></span><div><small>확인이 필요해요</small><strong>르블랑 계약서의<br />VAT 항목을 확인해주세요</strong><Link to="/contracts">계약서 보기 <ArrowUpRight size={13} /></Link></div></Card>
            <Card className="attention-card attention-card--sage"><span className="attention-icon"><Sparkles size={19} /></span><div><small>AI 추천 준비 완료</small><strong>서윤 & 도현님의 취향에 맞는<br />업체 8곳을 찾았어요</strong><Link to="/vendors">추천 확인하기 <ArrowUpRight size={13} /></Link></div></Card>
          </div>
        </div>
      </section>

      <section className="section-block">
        <div className="section-heading"><div><p className="eyebrow">My couples</p><h2>함께 준비하고 있는 커플</h2></div><Link to="/couples">전체 커플 <ChevronRight size={15} /></Link></div>
        <div className="couple-grid couple-grid--dashboard">
          {couples.map((couple) => (
            <Link key={couple.id} to={`/couples/${couple.id}`} className={`couple-card couple-card--${couple.tone}`}>
              <div className="couple-card__top"><span className="monogram">{couple.initials}</span><Badge tone={couple.status === '집중관리' ? 'rose' : couple.status === '확정' ? 'sage' : 'neutral'}>{couple.status}</Badge></div>
              <h3>{couple.partners}</h3><p>{couple.venue}</p><div className="couple-card__date"><span>WEDDING DAY</span><strong>{couple.weddingDate.replaceAll('-', '. ')}</strong></div>
              <Progress value={couple.progress} label={`${couple.progress}%`} />
            </Link>
          ))}
        </div>
      </section>

      <section className="dashboard-bottom">
        <div className="tip-line"><span><Check size={16} /></span><p><strong>오늘의 작은 팁</strong> 드레스 피팅 전, 신부님의 최근 저장 이미지를 다시 확인해보세요.</p></div>
        <div className="mini-metric"><UsersRound size={17} /><span>이번 달 새 커플</span><strong>+2</strong></div>
      </section>
    </div>
  )
}
