import { useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { ArrowLeft, ExternalLink, Heart, Plus } from 'lucide-react'
import { useDemoStore } from '../../app/store'
import { Badge, Button, Card, Progress } from '../../components/ui'
import type { ChecklistCategory, ChecklistItem, RecommendationStatus } from '../../types'
import { ChecklistEditorModal } from '../checklist/ChecklistEditorModal'
import { PreparationWorkspace } from '../checklist/PreparationWorkspace'
import { CoupleInfoPanel } from './CoupleInfoPanel'
import { EstimateSettlementPanel } from './EstimateSettlementPanel'
import { ScheduleCoordinationPanel } from './ScheduleCoordinationPanel'
import { AddEventModal } from '../calendar/AddEventModal'
import { formatDate } from '../reminders/reminderUtils'
import { weddingReferences } from '../../data/weddingReferenceData'

type DetailTab = 'info' | 'timeline' | 'coordination' | 'vendors' | 'finance'

const detailTabs: DetailTab[] = ['info', 'timeline', 'coordination', 'vendors', 'finance']
const vendorStatusMeta: Record<RecommendationStatus, { label: string; tone: 'neutral' | 'amber' | 'sage' }> = {
  pending: { label: '추천 후보', tone: 'neutral' }, liked: { label: '투어 예정', tone: 'amber' }, confirmed: { label: '확정', tone: 'sage' }, hold: { label: '보류', tone: 'neutral' },
}

function isDetailTab(value: string | null): value is DetailTab {
  return detailTabs.includes(value as DetailTab)
}

export function CoupleDetailPage() {
  const { id = 'c1' } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()
  const { couples, checklist, vendors, recommendations, uploadedReferences, setRecommendation, toggleChecklist, addChecklist, updateChecklist, deleteChecklist } = useDemoStore()
  const couple = couples.find((item) => item.id === id) ?? couples[0]
  const requestedTab = searchParams.get('tab')
  const tab: DetailTab = isDetailTab(requestedTab) ? requestedTab : 'info'
  const [editorOpen, setEditorOpen] = useState(false)
  const [editorItem, setEditorItem] = useState<ChecklistItem | null>(null)
  const [editorCategory, setEditorCategory] = useState<ChecklistCategory>('스튜디오')
  const [scheduleOpen, setScheduleOpen] = useState(false)
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
    if (nextTab === 'info') nextParams.delete('tab')
    else nextParams.set('tab', nextTab)
    setSearchParams(nextParams)
  }

  return (
    <div className="page-stack couple-detail">
      <Link className="back-link" to="/couples"><ArrowLeft size={15} /> 모든 커플</Link>
      <section className="couple-profile">
        <div className={`couple-profile__mark couple-profile__mark--${couple.tone}`}><span>{couple.initials}</span></div>
        <div className="couple-profile__main"><Badge tone="rose">{couple.status}</Badge><h1>{couple.partners}</h1></div>
        <div className="couple-profile__progress"><span>전체 준비율</span><strong>{couple.progress}<i>%</i></strong><Progress value={couple.progress} /></div>
        <div className="couple-profile__actions"><Link className="couple-profile__client-url" to={`/client/${couple.id}`} target="_blank"><span>고객 URL</span><strong>/client/{couple.id}</strong><ExternalLink size={14} /></Link></div>
      </section>
      <nav className="detail-tabs">{([['info','부부정보·상담'],['timeline', 'TODO'],['coordination','공유 캘린더'],['vendors','업체 관리'],['finance','견적·정산']] as [DetailTab,string][]).map(([key,label]) => <button key={key} onClick={() => openTab(key)} className={tab === key ? 'active' : ''}>{label}{key === 'timeline' && <em>{coupleTasks.filter((task) => task.status !== 'completed').length}</em>}</button>)}</nav>

      {tab === 'timeline' && <div className="checklist-workspace">
        <section className="checklist-workspace__intro"><div><p className="eyebrow">Wedding workflow</p><h2>월별 준비 로드맵</h2><p>결혼식까지 해야 할 일을 월별 흐름과 분야별 체크리스트로 동시에 관리합니다.</p></div><div className="heading-actions"><Button variant="secondary" icon={<Plus size={15} />} onClick={() => setScheduleOpen(true)}>일정 추가</Button></div></section>
        <PreparationWorkspace tasks={coupleTasks} onToggle={toggleChecklist} editable onAdd={(category) => { setEditorItem(null); setEditorCategory(category ?? '스튜디오'); setEditorOpen(true) }} onEdit={(item) => { setEditorItem(item); setEditorCategory(item.category); setEditorOpen(true) }} />
      </div>}

      {tab === 'info' && <CoupleInfoPanel couple={couple} />}

      {tab === 'coordination' && <ScheduleCoordinationPanel coupleId={couple.id} />}

      {tab === 'vendors' && <div className="page-stack">
        <section className="vendor-management-heading"><div><p className="eyebrow">Vendor pipeline</p><h2>{couple.partners} 업체 관리</h2><p>고객에게 보낸 후보부터 투어 예정과 최종 확정까지 한곳에서 관리합니다.</p></div><Link to={`/vendors?coupleId=${couple.id}`}><Button variant="secondary">업체 추천 추가</Button></Link></section>
        <div className="vendor-tour-summary"><div><Heart size={16} fill="currentColor" /><strong>고객의 하트는 투어 예정까지 반영되며 최종 확정은 플래너가 처리합니다.</strong></div><span>투어 예정 {tourVendorCount}곳 · 전체 {recommendedVendors.length}곳</span></div>
        <div className="recommended-grid">{recommendedVendors.length ? recommendedVendors.map(({ vendor, recommendation, reference }) => vendor && <article className={`vendor-mini-card vendor-mini-card--${recommendation.status}`} key={vendor.id}><img src={reference?.image ?? vendor.image} style={{ objectPosition: reference?.imagePosition ?? vendor.imagePosition }} alt="" /><div><div className="vendor-tour-label"><Badge tone={vendorStatusMeta[recommendation.status].tone}>{vendorStatusMeta[recommendation.status].label}</Badge><span>{vendor.category}</span></div><h3>{vendor.name}</h3><p>{vendor.summary}</p><div className="tag-row">{vendor.tags.slice(0, 5).map((tag) => <span key={tag}>{tag}</span>)}</div><div className="vendor-mini-card__deadline"><span>선택 기한</span><strong>{formatDate(recommendation.selectionDeadline)}</strong></div><label className="vendor-status-control"><span>현재 상태</span><select value={recommendation.status} onChange={(event) => setRecommendation(couple.id, vendor.id, event.target.value as RecommendationStatus)}><option value="pending">추천 후보</option><option value="liked">투어 예정</option><option value="confirmed">확정</option><option value="hold">보류</option></select></label></div></article>) : <Card><p>아직 추천한 업체가 없습니다. 업체 찾기 화면에서 고객에게 업체를 추천해 주세요.</p></Card>}</div>
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
