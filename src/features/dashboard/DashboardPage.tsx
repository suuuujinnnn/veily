import { Link } from 'react-router-dom'
import { CalendarDays, ChevronRight, UsersRound } from 'lucide-react'
import { useDemoStore } from '../../app/store'
import { Badge, Card, Progress } from '../../components/ui'
import { couples } from '../../data/mockData'
export function DashboardPage(){
 const { events, checklist, coordination }=useDemoStore()
 const todayEvents=events.filter(event=>event.date===new Date().toISOString().slice(0,10))
 const pending=coordination.reduce((count,item)=>count+item.responses.filter(response=>response.state==='available').length,0)
 return <div className="dashboard-page page-stack">
  <section className="dashboard-command"><div className="dashboard-command__top"><div><p className="eyebrow">플래너 워크스페이스</p><h1>안녕하세요, 플래너님.</h1><p>일정, 고객 응답, 상담 메모를 한곳에서 확인하세요.</p></div><div className="dashboard-command__actions"><Link to="/calendar">캘린더 열기 <ChevronRight size={15}/></Link></div></div><div className="dashboard-metrics"><article><span className="metric-icon"><CalendarDays size={18}/></span><div><small>오늘 일정</small><strong>{todayEvents.length}<em> 건</em></strong><p>오늘 일정을 준비해요</p></div></article><article><span className="metric-icon"><UsersRound size={18}/></span><div><small>진행 중인 커플</small><strong>{couples.length}<em> 팀</em></strong><p>고객 관리 화면</p></div></article></div></section>
  <section className="section-block"><div className="section-heading"><div><p className="eyebrow">활성 고객</p><h2>진행 중인 커플</h2></div><Link to="/couples">전체 보기 <ChevronRight size={15}/></Link></div><div className="couple-grid couple-grid--dashboard">{couples.map(couple=><Link key={couple.id} to={`/couples/${couple.id}`} className={`couple-card couple-card--${couple.tone}`}><div className="couple-card__top"><span className="monogram">{couple.initials}</span><Badge tone="neutral">{couple.status}</Badge></div><h3>{couple.partners}</h3><p>{couple.venue}</p><div className="couple-card__date"><span>예식일</span><strong>{couple.weddingDate}</strong></div><Progress value={couple.progress} label={`${couple.progress}%`}/></Link>)}</div></section>
  <Card><p className="eyebrow">체크리스트 현황</p><h2>{checklist.filter(item=>!item.completed).length} 개의 작업이 확인을 기다립니다</h2></Card>
 </div>
}