import { useMemo, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { ArrowLeft, CalendarDays, Check, ChevronRight, Clock3, ExternalLink, MapPin, MessageCircle, MoreHorizontal, Plus, Sparkles } from 'lucide-react'
import { useDemoStore } from '../../app/store'
import { Badge, Button, Card, Progress } from '../../components/ui'
import type { ChecklistCategory, ChecklistItem } from '../../types'
import { CategoryChecklist } from '../checklist/CategoryChecklist'
import { ChecklistEditorModal } from '../checklist/ChecklistEditorModal'
import { MonthlyRoadmap } from '../checklist/MonthlyRoadmap'
import { ConsultationsPanel } from './ConsultationsPanel'
import { CoupleInfoPanel } from './CoupleInfoPanel'
import { EstimateSettlementPanel } from './EstimateSettlementPanel'
import { PublicLinkSettings } from './PublicLinkSettings'
import { AddEventModal } from '../calendar/AddEventModal'

type DetailTab = 'overview' | 'info' | 'timeline' | 'vendors' | 'consultations' | 'finance' | 'public-link'

const detailTabs: DetailTab[] = ['overview', 'info', 'timeline', 'vendors', 'consultations', 'finance', 'public-link']

function isDetailTab(value: string | null): value is DetailTab {
  return detailTabs.includes(value as DetailTab)
}

export function CoupleDetailPage() {
  const { id = 'c1' } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()
  const { couples, events, checklist, vendors, recommendations, toggleChecklist, addChecklist, updateChecklist, deleteChecklist } = useDemoStore()
  const couple = couples.find((item) => item.id === id) ?? couples[0]
  const requestedTab = searchParams.get('tab')
  const tab: DetailTab = isDetailTab(requestedTab) ? requestedTab : 'overview'
  const [editorOpen, setEditorOpen] = useState(false)
  const [editorItem, setEditorItem] = useState<ChecklistItem | null>(null)
  const [editorCategory, setEditorCategory] = useState<ChecklistCategory>('스튜디오')
  const [scheduleOpen, setScheduleOpen] = useState(false)
  const coupleEvents = useMemo(() => events.filter((event) => event.coupleId === couple.id), [events, couple.id])
  const coupleTasks = checklist.filter((item) => item.coupleId === couple.id)
  const recommendedVendors = recommendations.filter((item) => item.coupleId === couple.id).map((item) => ({ ...item, vendor: vendors.find((vendor) => vendor.id === item.vendorId) })).filter((item) => item.vendor)

  const openTab = (nextTab: DetailTab) => {
    const nextParams = new URLSearchParams(searchParams)
    if (nextTab === 'overview') nextParams.delete('tab')
    else nextParams.set('tab', nextTab)
    setSearchParams(nextParams)
  }

  return (
    <div className="page-stack couple-detail">
      <Link className="back-link" to="/couples"><ArrowLeft size={15} /> 모든 커플</Link>
      <section className="couple-profile">
        <div className={`couple-profile__mark couple-profile__mark--${couple.tone}`}><span>{couple.initials}</span><small>OUR DAY</small></div>
        <div className="couple-profile__main"><div><Badge tone="rose">{couple.status}</Badge><p className="eyebrow">Wedding journey</p></div><h1>{couple.partners}</h1><p>{couple.concept}</p><div className="couple-meta"><span><CalendarDays size={15} /> {couple.weddingDate.replaceAll('-', '. ')}</span><span><MapPin size={15} /> {couple.venue}</span></div></div>
        <div className="couple-profile__progress"><span>전체 준비율</span><strong>{couple.progress}<i>%</i></strong><Progress value={couple.progress} /></div>
        <div className="couple-profile__actions"><Link to={`/client/${couple.id}`} target="_blank"><Button variant="secondary" icon={<ExternalLink size={15} />}>고객 화면 미리보기</Button></Link><button className="icon-button bordered"><MoreHorizontal size={18} /></button></div>
      </section>
      <nav className="detail-tabs">{([['overview','한눈에 보기'],['info','부부정보'],['timeline','일정 & 할 일'],['vendors','추천 업체'],['consultations','상담'],['finance','견적·정산'],['public-link','고객 링크']] as [DetailTab,string][]).map(([key,label]) => <button key={key} onClick={() => openTab(key)} className={tab === key ? 'active' : ''}>{label}{key === 'timeline' && <em>{coupleTasks.filter((task) => !task.completed).length}</em>}</button>)}</nav>

      {tab === 'overview' && <div className="detail-overview">
        <section className="detail-column detail-column--wide"><div className="section-heading section-heading--compact"><div><p className="eyebrow">Coming up</p><h2>다가오는 일정</h2></div><button onClick={() => openTab('timeline')}>전체 보기 <ChevronRight size={14} /></button></div><Card padding="none" className="upcoming-list">{coupleEvents.slice(0,3).map((event) => <div className="upcoming-row" key={event.id}><div className="date-tile"><strong>{Number(event.date.slice(-2))}</strong><span>8월</span></div><div><Badge tone="rose">{event.type}</Badge><h3>{event.title}</h3><p><Clock3 size={13} /> {event.time}–{event.endTime} <i /> <MapPin size={13} /> {event.location}</p></div><ChevronRight size={17} /></div>)}</Card></section>
        <section className="detail-column"><div className="section-heading section-heading--compact"><div><p className="eyebrow">To-do</p><h2>이번 주 할 일</h2></div><button onClick={() => openTab('timeline')}>전체 보기 <ChevronRight size={14} /></button></div><Card className="task-list">{coupleTasks.slice(0,4).map((task) => <label className={`task-row ${task.completed ? 'task-row--done' : ''}`} key={task.id}><input type="checkbox" checked={task.completed} onChange={() => toggleChecklist(task.id)} /><span className="custom-check"><Check size={13} /></span><div><strong>{task.title}</strong><small>{task.category} · {task.dueDate} · {task.owner}</small></div></label>)}</Card></section>
        <Card className="couple-note"><MessageCircle size={18} /><div><span>플래너 노트</span><p>“서윤님은 장식보다 실루엣을 중요하게 생각해요. 추천 시 깨끗한 실크 소재를 우선으로 보여드리기.”</p><button>노트 편집</button></div></Card>
        <Card className="recommendation-peek"><div className="recommendation-peek__head"><span><Sparkles size={17} /> 취향 분석 리포트</span><Badge tone="sage">업데이트됨</Badge></div><h3>Clean · Timeless · Natural</h3><div className="tag-row"><span>미카도 실크</span><span>자연광</span><span>절제된 플라워</span></div><button onClick={() => openTab('vendors')}>추천 업체 보기 <ChevronRight size={14} /></button></Card>
      </div>}

      {tab === 'timeline' && <div className="checklist-workspace">
        <section className="checklist-workspace__intro"><div><p className="eyebrow">Wedding workflow</p><h2>월별 준비 로드맵</h2><p>결혼식까지 해야 할 일을 월별 흐름과 분야별 체크리스트로 동시에 관리합니다.</p></div><div className="heading-actions"><Badge tone="neutral">템플릿 {coupleTasks.filter((task) => task.isTemplate).length}개 적용</Badge><Button variant="secondary" icon={<Plus size={15} />} onClick={() => setScheduleOpen(true)}>일정 추가</Button></div></section>
        <MonthlyRoadmap tasks={coupleTasks} onToggle={toggleChecklist} />
        <div className="checklist-workspace__lower">
          <CategoryChecklist
            tasks={coupleTasks}
            onToggle={toggleChecklist}
            editable
            onAdd={(category) => { setEditorItem(null); setEditorCategory(category ?? '스튜디오'); setEditorOpen(true) }}
            onEdit={(item) => { setEditorItem(item); setEditorCategory(item.category); setEditorOpen(true) }}
          />
          <Card className="availability-summary"><CalendarDays size={20} /><h3>고객이 선택한 가능 시간</h3><p>메이크업 테스트 · 8월 8일(토) 11:00</p><span>고객 포털과 같은 상태를 사용합니다.</span></Card>
        </div>
      </div>}

      {tab === 'info' && <CoupleInfoPanel couple={couple} />}

      {tab === 'vendors' && <div className="recommended-grid">{recommendedVendors.length ? recommendedVendors.map(({ vendor, status }) => vendor && <article className="vendor-mini-card" key={vendor.id}><img src={vendor.image} style={{ objectPosition: vendor.imagePosition }} alt="" /><div><Badge tone="rose">{vendor.match}% match</Badge><h3>{vendor.name}</h3><p>{vendor.summary}</p><div className="tag-row">{vendor.tags.map((tag) => <span key={tag}>{tag}</span>)}</div><div className="vendor-mini-card__status"><span>고객 응답</span><strong className={`status-${status}`}>{status === 'liked' ? '마음에 들어요' : status === 'hold' ? '조금 더 볼게요' : '응답 대기'}</strong></div></div></article>) : <Card><p>아직 추천한 업체가 없습니다.</p></Card>}</div>}

      {tab === 'consultations' && <ConsultationsPanel coupleId={couple.id} />}
      {tab === 'finance' && <EstimateSettlementPanel coupleId={couple.id} />}
      {tab === 'public-link' && <PublicLinkSettings coupleId={couple.id} />}
      <ChecklistEditorModal
        open={editorOpen}
        coupleId={couple.id}
        defaultCategory={editorCategory}
        item={editorItem}
        onClose={() => setEditorOpen(false)}
        onCreate={addChecklist}
        onUpdate={updateChecklist}
        onDelete={deleteChecklist}
      />
      <AddEventModal open={scheduleOpen} initialCoupleId={couple.id} onClose={() => setScheduleOpen(false)} onAdded={() => undefined} />
    </div>
  )
}
