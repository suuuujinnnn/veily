import { useMemo, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { ArrowLeft, Check, ChevronRight, Clock3, ExternalLink, Heart, MapPin, MoreHorizontal, Plus, Sparkles } from 'lucide-react'
import { useDemoStore } from '../../app/store'
import { Badge, Button, Card, Progress } from '../../components/ui'
import type { ChecklistCategory, ChecklistItem, RecommendationStatus } from '../../types'
import { CategoryChecklist } from '../checklist/CategoryChecklist'
import { ChecklistEditorModal } from '../checklist/ChecklistEditorModal'
import { MonthlyRoadmap } from '../checklist/MonthlyRoadmap'
import { formatChecklistDate } from '../checklist/checklistUtils'
import { CoupleInfoPanel } from './CoupleInfoPanel'
import { EstimateSettlementPanel } from './EstimateSettlementPanel'
import { ScheduleCoordinationPanel } from './ScheduleCoordinationPanel'
import { AddEventModal } from '../calendar/AddEventModal'
import { formatDate } from '../reminders/reminderUtils'
import { weddingReferences } from '../../data/weddingReferenceData'

type DetailTab = 'overview' | 'info' | 'timeline' | 'coordination' | 'vendors' | 'finance'

const detailTabs: DetailTab[] = ['overview', 'info', 'timeline', 'coordination', 'vendors', 'finance']
const vendorStatusMeta: Record<RecommendationStatus, { label: string; tone: 'neutral' | 'amber' | 'sage' }> = {
  pending: { label: '추천 후보', tone: 'neutral' }, liked: { label: '투어 예정', tone: 'amber' }, confirmed: { label: '확정', tone: 'sage' }, hold: { label: '보류', tone: 'neutral' },
}

function isDetailTab(value: string | null): value is DetailTab {
  return detailTabs.includes(value as DetailTab)
}

export function CoupleDetailPage() {
  const { id = 'c1' } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()
  const { couples, events, checklist, vendors, recommendations, uploadedReferences, setRecommendation, toggleChecklist, addChecklist, updateChecklist, deleteChecklist } = useDemoStore()
  const couple = couples.find((item) => item.id === id) ?? couples[0]
  const requestedTab = searchParams.get('tab')
  const tab: DetailTab = isDetailTab(requestedTab) ? requestedTab : 'overview'
  const [editorOpen, setEditorOpen] = useState(false)
  const [editorItem, setEditorItem] = useState<ChecklistItem | null>(null)
  const [editorCategory, setEditorCategory] = useState<ChecklistCategory>('스튜디오')
  const [scheduleOpen, setScheduleOpen] = useState(false)
  const coupleEvents = useMemo(() => events.filter((event) => event.coupleId === couple.id && event.visibility === 'couple-shared'), [events, couple.id])
  const coupleTasks = checklist.filter((item) => item.coupleId === couple.id).sort((a, b) => a.dueDate.localeCompare(b.dueDate))
  const referenceLibrary = [...uploadedReferences, ...weddingReferences]
  const recommendedVendors = recommendations.filter((item) => item.coupleId === couple.id).map((recommendation) => ({
    vendor: vendors.find((vendor) => vendor.id === recommendation.vendorId),
    recommendation,
    reference: referenceLibrary.find((reference) => reference.id === recommendation.sourceReferenceId),
  })).filter((item) => item.vendor)
  const tourVendorCount = recommendedVendors.filter((item) => item.recommendation?.status === 'liked').length

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
        <div className="couple-profile__main"><div><Badge tone="rose">{couple.status}</Badge><p className="eyebrow">Wedding journey</p></div><h1>{couple.partners}</h1><p>{couple.concept}</p></div>
        <div className="couple-profile__progress"><span>전체 준비율</span><strong>{couple.progress}<i>%</i></strong><Progress value={couple.progress} /></div>
        <div className="couple-profile__actions"><Link className="couple-profile__client-url" to={`/client/${couple.id}`} target="_blank"><span>고객전용 URL</span><strong>/client/{couple.id}</strong><ExternalLink size={14} /></Link><button className="icon-button bordered"><MoreHorizontal size={18} /></button></div>
      </section>
      <nav className="detail-tabs">{([['overview','한눈에 보기'],['info','부부정보·상담'],['timeline', 'TODO'],['coordination','공유 캘린더'],['vendors','업체 관리'],['finance','견적·정산']] as [DetailTab,string][]).map(([key,label]) => <button key={key} onClick={() => openTab(key)} className={tab === key ? 'active' : ''}>{label}{key === 'timeline' && <em>{coupleTasks.filter((task) => task.status !== 'completed').length}</em>}</button>)}</nav>

      {tab === 'overview' && <div className="detail-overview">
        <section className="detail-column overview-schedule"><div className="section-heading section-heading--compact"><div><p className="eyebrow">Coming up</p><h2>다가오는 일정</h2></div><button onClick={() => openTab('coordination')}>전체 보기 <ChevronRight size={14} /></button></div><Card padding="none" className="upcoming-list">{coupleEvents.slice(0,3).map((event) => <div className="upcoming-row" key={event.id}><div className="date-tile"><strong>{Number(event.date.slice(-2))}</strong><span>{Number(event.date.slice(5, 7))}월</span></div><div><Badge tone="rose">{event.type}</Badge><h3>{event.title}</h3><p><Clock3 size={13} /> {event.time}–{event.endTime} <i /> <MapPin size={13} /> {event.location}</p></div><ChevronRight size={17} /></div>)}</Card></section>
        <section className="detail-column overview-tasks"><div className="section-heading section-heading--compact"><div><p className="eyebrow">To-do</p><h2>이번 주 할 일</h2></div><button onClick={() => openTab('timeline')}>전체 보기 <ChevronRight size={14} /></button></div><Card className="task-list">{coupleTasks.slice(0,4).map((task) => <label className={`task-row ${task.status === 'completed' ? 'task-row--done' : ''}`} key={task.id}><input type="checkbox" checked={task.status === 'completed'} onChange={() => toggleChecklist(task.id)} /><span className="custom-check"><Check size={13} /></span><div><strong>{task.title}</strong><small>{task.kind === 'decision' && task.status === 'pending' ? '미결정' : task.category} · {formatChecklistDate(task.dueDate)} · {task.owner}</small></div></label>)}</Card></section>
        <Card className="recommendation-peek overview-preference"><div className="recommendation-peek__head"><span><Sparkles size={17} /> 취향 분석 리포트</span><Badge tone="sage">업데이트됨</Badge></div><h3>Clean · Timeless · Natural</h3><div className="tag-row"><span>미카도 실크</span><span>자연광</span><span>절제된 플라워</span></div><button onClick={() => openTab('vendors')}>업체 관리 보기 <ChevronRight size={14} /></button></Card>
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
        </div>
      </div>}

      {tab === 'info' && <CoupleInfoPanel couple={couple} />}

      {tab === 'coordination' && <ScheduleCoordinationPanel coupleId={couple.id} />}

      {tab === 'vendors' && <div className="page-stack">
        <section className="vendor-management-heading"><div><p className="eyebrow">Vendor pipeline</p><h2>{couple.partners} 업체 관리</h2><p>고객에게 보낸 후보부터 투어 예정과 최종 확정까지 한곳에서 관리합니다.</p></div><Link to={`/vendors?coupleId=${couple.id}`}><Button variant="secondary">업체 추천 추가</Button></Link></section>
        <div className="vendor-tour-summary"><div><Heart size={16} fill="currentColor" /><strong>고객의 하트는 투어 예정까지 반영되며 최종 확정은 플래너가 처리합니다.</strong></div><span>투어 예정 {tourVendorCount}곳 · 전체 {recommendedVendors.length}곳</span></div>
        <div className="recommended-grid">{recommendedVendors.length ? recommendedVendors.map(({ vendor, recommendation, reference }) => vendor && <article className={`vendor-mini-card vendor-mini-card--${recommendation.status}`} key={vendor.id}><img src={reference?.image ?? vendor.image} style={{ objectPosition: reference?.imagePosition ?? vendor.imagePosition }} alt="" /><div><div className="vendor-tour-label"><Badge tone={vendorStatusMeta[recommendation.status].tone}>{vendorStatusMeta[recommendation.status].label}</Badge><span>{vendor.category}</span></div><h3>{vendor.name}</h3><p>{vendor.summary}</p><div className="tag-row">{vendor.tags.slice(0, 5).map((tag) => <span key={tag}>{tag}</span>)}</div><div className="vendor-mini-card__deadline"><span>선택 기한</span><strong>{formatDate(recommendation.selectionDeadline)}</strong></div><label className="vendor-status-control"><span>현재 상태</span><select value={recommendation.status} onChange={(event) => setRecommendation(couple.id, vendor.id, event.target.value as RecommendationStatus)}><option value="pending">추천 후보</option><option value="liked">투어 예정</option><option value="confirmed">확정</option><option value="hold">보류</option></select></label></div></article>) : <Card><p>아직 추천한 업체가 없습니다. 레퍼런스·업체 화면에서 고객에게 업체를 추천해 주세요.</p></Card>}</div>
      </div>}

      {tab === 'finance' && <EstimateSettlementPanel coupleId={couple.id} />}
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
