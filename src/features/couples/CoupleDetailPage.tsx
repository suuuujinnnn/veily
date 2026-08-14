import { useMemo, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { ArrowLeft, CalendarDays, Check, ChevronRight, Clock3, ExternalLink, FolderHeart, Heart, MapPin, MessageCircle, MoreHorizontal, Plus, Sparkles } from 'lucide-react'
import { useDemoStore } from '../../app/store'
import { Badge, Button, Card, Progress } from '../../components/ui'
import type { ChecklistCategory, ChecklistItem } from '../../types'
import { CategoryChecklist } from '../checklist/CategoryChecklist'
import { ChecklistEditorModal } from '../checklist/ChecklistEditorModal'
import { MonthlyRoadmap } from '../checklist/MonthlyRoadmap'
import { formatChecklistDate } from '../checklist/checklistUtils'
import { ConsultationsPanel } from './ConsultationsPanel'
import { CoupleInfoPanel } from './CoupleInfoPanel'
import { EstimateSettlementPanel } from './EstimateSettlementPanel'
import { PublicLinkSettings } from './PublicLinkSettings'
import { ScheduleCoordinationPanel } from './ScheduleCoordinationPanel'
import { AddEventModal } from '../calendar/AddEventModal'
import { OrderApprovalPanel } from './OrderApprovalPanel'
import { formatDate } from '../reminders/reminderUtils'
import { weddingReferences } from '../../data/weddingReferenceData'

type DetailTab = 'overview' | 'info' | 'timeline' | 'coordination' | 'vendors' | 'orders' | 'consultations' | 'finance' | 'public-link'

const detailTabs: DetailTab[] = ['overview', 'info', 'timeline', 'coordination', 'vendors', 'orders', 'consultations', 'finance', 'public-link']

function isDetailTab(value: string | null): value is DetailTab {
  return detailTabs.includes(value as DetailTab)
}

export function CoupleDetailPage() {
  const { id = 'c1' } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()
  const { couples, events, checklist, vendors, recommendations, referenceBoards, uploadedReferences, setRecommendation, toggleChecklist, addChecklist, updateChecklist, deleteChecklist } = useDemoStore()
  const couple = couples.find((item) => item.id === id) ?? couples[0]
  const requestedTab = searchParams.get('tab')
  const tab: DetailTab = isDetailTab(requestedTab) ? requestedTab : 'overview'
  const [editorOpen, setEditorOpen] = useState(false)
  const [editorItem, setEditorItem] = useState<ChecklistItem | null>(null)
  const [editorCategory, setEditorCategory] = useState<ChecklistCategory>('스튜디오')
  const [scheduleOpen, setScheduleOpen] = useState(false)
  const coupleEvents = useMemo(() => events.filter((event) => event.coupleId === couple.id && event.visibility === 'couple-shared'), [events, couple.id])
  const coupleTasks = checklist.filter((item) => item.coupleId === couple.id).sort((a, b) => a.dueDate.localeCompare(b.dueDate))
  const referenceBoard = referenceBoards.find((item) => item.coupleId === couple.id)
  const referenceLibrary = [...uploadedReferences, ...weddingReferences]
  const boardReferences = (referenceBoard?.items ?? []).map((item) => referenceLibrary.find((reference) => reference.id === item.referenceId)).filter(Boolean)
  const boardVendorIds = boardReferences.map((reference) => reference?.vendorId).filter((vendorId): vendorId is string => Boolean(vendorId))
  const recommendationVendorIds = recommendations.filter((item) => item.coupleId === couple.id).map((item) => item.vendorId)
  const recommendedVendors = Array.from(new Set([...boardVendorIds, ...recommendationVendorIds])).map((vendorId) => ({
    vendor: vendors.find((vendor) => vendor.id === vendorId),
    recommendation: recommendations.find((item) => item.coupleId === couple.id && item.vendorId === vendorId),
    fromBoard: boardVendorIds.includes(vendorId),
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
        <div className="couple-profile__main"><div><Badge tone="rose">{couple.status}</Badge><p className="eyebrow">Wedding journey</p></div><h1>{couple.partners}</h1><p>{couple.concept}</p><div className="couple-meta"><span><CalendarDays size={15} /> {couple.weddingDate.replaceAll('-', '. ')}</span><span><MapPin size={15} /> {couple.venue}</span></div></div>
        <div className="couple-profile__progress"><span>전체 준비율</span><strong>{couple.progress}<i>%</i></strong><Progress value={couple.progress} /></div>
        <div className="couple-profile__actions"><Link to={`/client/${couple.id}`} target="_blank"><Button variant="secondary" icon={<ExternalLink size={15} />}>고객 화면 미리보기</Button></Link><button className="icon-button bordered"><MoreHorizontal size={18} /></button></div>
      </section>
      <nav className="detail-tabs">{([['overview','한눈에 보기'],['info','부부정보'],['timeline', 'TODO'],['coordination','일정 조율'],['vendors','추천 업체'],['orders','발주 현황'],['consultations','상담'],['finance','견적·정산'],['public-link','고객 링크']] as [DetailTab,string][]).map(([key,label]) => <button key={key} onClick={() => openTab(key)} className={tab === key ? 'active' : ''}>{label}{key === 'timeline' && <em>{coupleTasks.filter((task) => task.status !== 'completed').length}</em>}</button>)}</nav>

      {tab === 'overview' && <div className="detail-overview">
        <section className="detail-column overview-schedule"><div className="section-heading section-heading--compact"><div><p className="eyebrow">Coming up</p><h2>다가오는 일정</h2></div><button onClick={() => openTab('timeline')}>전체 보기 <ChevronRight size={14} /></button></div><Card padding="none" className="upcoming-list">{coupleEvents.slice(0,3).map((event) => <div className="upcoming-row" key={event.id}><div className="date-tile"><strong>{Number(event.date.slice(-2))}</strong><span>{Number(event.date.slice(5, 7))}월</span></div><div><Badge tone="rose">{event.type}</Badge><h3>{event.title}</h3><p><Clock3 size={13} /> {event.time}–{event.endTime} <i /> <MapPin size={13} /> {event.location}</p></div><ChevronRight size={17} /></div>)}</Card></section>
        <section className="detail-column overview-tasks"><div className="section-heading section-heading--compact"><div><p className="eyebrow">To-do</p><h2>이번 주 할 일</h2></div><button onClick={() => openTab('timeline')}>전체 보기 <ChevronRight size={14} /></button></div><Card className="task-list">{coupleTasks.slice(0,4).map((task) => <label className={`task-row ${task.status === 'completed' ? 'task-row--done' : ''}`} key={task.id}><input type="checkbox" checked={task.status === 'completed'} onChange={() => toggleChecklist(task.id)} /><span className="custom-check"><Check size={13} /></span><div><strong>{task.title}</strong><small>{task.kind === 'decision' && task.status === 'pending' ? '미결정' : task.category} · {formatChecklistDate(task.dueDate)} · {task.owner}</small></div></label>)}</Card></section>
        <Card className="couple-note overview-note"><MessageCircle size={18} /><div><span>Planner note</span><strong>플래너 노트</strong><p>“서윤님은 장식보다 실루엣을 중요하게 생각해요. 추천 시 깨끗한 실크 소재를 우선으로 보여드리기.”</p><button>노트 편집</button></div></Card>
        <Card className="recommendation-peek overview-preference"><div className="recommendation-peek__head"><span><Sparkles size={17} /> 취향 분석 리포트</span><Badge tone="sage">업데이트됨</Badge></div><h3>Clean · Timeless · Natural</h3><div className="tag-row"><span>미카도 실크</span><span>자연광</span><span>절제된 플라워</span></div><button onClick={() => openTab('vendors')}>추천 업체 보기 <ChevronRight size={14} /></button></Card>
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
        <section className="vendor-board-integration"><div><p className="eyebrow">Reference board + vendors</p><h2>{referenceBoard?.title ?? `${couple.partners} 추천 보드`}</h2><p>{referenceBoard?.memo || '레퍼런스 보드에 이미지를 담으면 해당 업체가 아래 추천 후보에 함께 표시됩니다.'}</p>{boardReferences.length > 0 && <div className="vendor-board-thumbnails">{boardReferences.slice(0, 6).map((reference) => reference && <img key={reference.id} src={reference.image} style={{ objectPosition: reference.imagePosition }} alt="" />)}</div>}</div><Link to={`/vendors?coupleId=${couple.id}`}><FolderHeart size={15} /> 레퍼런스 보드 편집</Link></section>
        <div className="vendor-tour-summary"><div><Heart size={16} fill="currentColor" /><strong>하트를 누른 업체만 실제 투어 업체로 관리됩니다.</strong></div><span>투어 예정 {tourVendorCount}곳 · 추천 후보 {recommendedVendors.length}곳</span></div>
        <div className="recommended-grid">{recommendedVendors.length ? recommendedVendors.map(({ vendor, recommendation, fromBoard }) => vendor && <article className="vendor-mini-card" key={vendor.id}><img src={vendor.image} style={{ objectPosition: vendor.imagePosition }} alt="" /><button className={`vendor-tour-heart ${recommendation?.status === 'liked' ? 'active' : ''}`} aria-label={recommendation?.status === 'liked' ? `${vendor.name} 투어 취소` : `${vendor.name} 투어 업체로 선택`} onClick={() => setRecommendation(couple.id, vendor.id, recommendation?.status === 'liked' ? 'pending' : 'liked')}><Heart size={17} fill={recommendation?.status === 'liked' ? 'currentColor' : 'none'} /></button><div><div className="vendor-tour-label"><Badge tone={fromBoard ? 'sage' : 'neutral'}>{fromBoard ? '레퍼런스 보드 후보' : '추천 후보'}</Badge>{recommendation?.status === 'liked' && <strong>♥ 투어 예정</strong>}</div><h3>{vendor.name}</h3><p>{vendor.summary}</p><div className="tag-row">{vendor.tags.map((tag) => <span key={tag}>{tag}</span>)}</div>{recommendation?.selectionDeadline && <div className="vendor-mini-card__deadline"><span>선택 기한</span><strong>{formatDate(recommendation.selectionDeadline)}</strong></div>}<div className="vendor-mini-card__status"><span>선택 상태</span><strong className={`status-${recommendation?.status ?? 'pending'}`}>{recommendation?.status === 'liked' ? '투어 예정' : recommendation?.status === 'hold' ? '보류' : '추천 검토 중'}</strong></div>{recommendation?.status === 'liked' && <div className="vendor-mini-card__order-action"><Button size="sm" onClick={() => openTab('orders')}>발주 승인 요청</Button></div>}</div></article>) : <Card><p>아직 추천한 업체가 없습니다. 레퍼런스 보드에서 이미지를 담아보세요.</p></Card>}</div>
      </div>}

      {tab === 'orders' && <OrderApprovalPanel coupleId={couple.id} />}

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
