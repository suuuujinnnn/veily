import { useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { ArrowLeft, CalendarRange, Check, ExternalLink, LayoutGrid, Plus } from 'lucide-react'
import { useDemoStore } from '../../app/store'
import { Badge, Button, Card, Modal, Progress, SegmentedTabs } from '../../components/ui'
import type { ChecklistCategory, ChecklistItem, RecommendationStatus, Vendor } from '../../types'
import { CategoryChecklist } from '../checklist/CategoryChecklist'
import { ChecklistEditorModal } from '../checklist/ChecklistEditorModal'
import { MonthlyRoadmap } from '../checklist/MonthlyRoadmap'
import { CoupleInfoPanel } from './CoupleInfoPanel'
import { EstimateSettlementPanel } from './EstimateSettlementPanel'
import { ScheduleCoordinationPanel } from './ScheduleCoordinationPanel'
import { CoupleSurveyResponsesPanel } from './CoupleSurveyResponsesPanel'
import { weddingReferences } from '../../data/weddingReferenceData'

type DetailTab = 'info' | 'survey' | 'timeline' | 'coordination' | 'vendors' | 'finance'
type PreparationView = 'monthly' | 'category'
const coupleStatusTone = { '집중 관리': 'rose', 상담중: 'amber', 완료: 'sage', 취소: 'neutral' } as const

const detailTabs: DetailTab[] = ['info', 'survey', 'timeline', 'coordination', 'vendors', 'finance']
const vendorStatusMeta: Record<RecommendationStatus, { label: string }> = {
  pending: { label: '추천 후보' }, liked: { label: '투어 예정' }, confirmed: { label: '확정' }, hold: { label: '보류' },
}

const vendorGroups = ['드레스', '헤어', '메이크업', '스튜디오', '웨딩홀'] as const
type VendorGroup = typeof vendorGroups[number]

function getVendorGroup(vendor: Vendor): VendorGroup | null {
  if (vendor.category === '헤어&메이크업') return /헤어/.test(`${vendor.name} ${vendor.tags.join(' ')}`) ? '헤어' : '메이크업'
  if (vendor.category === '드레스' || vendor.category === '스튜디오' || vendor.category === '웨딩홀') return vendor.category
  return null
}

function isDetailTab(value: string | null): value is DetailTab {
  return detailTabs.includes(value as DetailTab)
}

export function CoupleDetailPage() {
  const { id = 'c1' } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()
  const { couples, checklist, vendors, recommendations, uploadedReferences, consultationCards, toggleChecklist, addChecklist, updateChecklist, deleteChecklist } = useDemoStore()
  const couple = couples.find((item) => item.id === id) ?? couples[0]
  const requestedTab = searchParams.get('tab')
  const consultationCard = consultationCards.find((item) => item.coupleId === couple.id)
  const hasSurveyResponses = Boolean(consultationCard?.surveyResponses && Object.keys(consultationCard.surveyResponses).length)
  const tab: DetailTab = requestedTab === 'survey' && hasSurveyResponses ? 'survey' : isDetailTab(requestedTab) ? requestedTab : 'info'
  const preparationView: PreparationView = searchParams.get('taskView') === 'category' ? 'category' : 'monthly'
  const [editorOpen, setEditorOpen] = useState(false)
  const [editorItem, setEditorItem] = useState<ChecklistItem | null>(null)
  const [editorCategory, setEditorCategory] = useState<ChecklistCategory>('스튜디오')
  const [conversionOpen, setConversionOpen] = useState(false)
  const coupleTasks = checklist.filter((item) => item.coupleId === couple.id).sort((a, b) => a.dueDate.localeCompare(b.dueDate))
  const referenceLibrary = [...uploadedReferences, ...weddingReferences]
  const recommendedVendors = recommendations.filter((item) => item.coupleId === couple.id).map((recommendation) => ({
    vendor: vendors.find((vendor) => vendor.id === recommendation.vendorId),
    recommendation,
    reference: referenceLibrary.find((reference) => reference.id === recommendation.sourceReferenceId),
  })).filter((item) => item.vendor)
  const groupedVendors = vendorGroups.map((group) => ({
    group,
    items: recommendedVendors.filter(({ vendor }) => vendor && getVendorGroup(vendor) === group),
  }))

  const openTab = (nextTab: DetailTab) => {
    const nextParams = new URLSearchParams(searchParams)
    if (nextTab === 'info') nextParams.delete('tab')
    else nextParams.set('tab', nextTab)
    setSearchParams(nextParams)
  }

  const openPreparationView = (nextView: PreparationView) => {
    const nextParams = new URLSearchParams(searchParams)
    if (nextView === 'monthly') nextParams.delete('taskView')
    else nextParams.set('taskView', nextView)
    setSearchParams(nextParams)
  }

  return (
    <div className="page-stack couple-detail">
      <header className="couple-workspace-head">
        <div className="couple-workspace-head__utility">
          <Link className="back-link" to="/couples"><ArrowLeft size={15} /> 모든 커플</Link>
          {couple.status === '취소'
            ? <div className="couple-workspace-head__portal is-disabled"><span>고객 URL</span><strong>포털 미생성 · 상담 종료</strong></div>
            : <Link className="couple-workspace-head__portal" to={`/client/${couple.id}`} target="_blank"><span>고객 URL</span><strong>/client/{couple.id}</strong><ExternalLink size={14} /></Link>}
        </div>
        <div className="couple-workspace-head__main">
          <div className={`couple-workspace-head__mark couple-workspace-head__mark--${couple.tone}`}><span>{couple.initials}</span></div>
          <div className="couple-workspace-head__identity"><div><Badge tone={coupleStatusTone[couple.status]}>{couple.status}</Badge><span>Customer workspace</span></div><h1>{couple.partners}</h1></div>
          {couple.status === '상담중' && hasSurveyResponses && <Button variant="secondary" icon={<Check size={15} />} onClick={() => setConversionOpen(true)}>정식 고객 전환</Button>}<div className="couple-workspace-head__progress"><div><span>전체 준비율</span><strong>{couple.progress}<i>%</i></strong></div><Progress value={couple.progress} /></div>
        </div>
      </header>
      <nav className="detail-tabs">{([['info','부부정보·상담'], ...(hasSurveyResponses ? [['survey','설문 응답'] as [DetailTab,string]] : []), ['timeline', '로드맵'],['coordination','공유 캘린더'],['vendors','업체 관리'],['finance','견적·정산']] as [DetailTab,string][]).map(([key,label]) => <button key={key} onClick={() => openTab(key)} className={tab === key ? 'active' : ''}>{label}{key === 'timeline' && <em>{coupleTasks.filter((task) => task.status !== 'completed').length}</em>}</button>)}</nav>

      {tab === 'timeline' && <div className="checklist-workspace">
        <SegmentedTabs value={preparationView} onChange={openPreparationView} ariaLabel="로드맵 보기" items={[{ value: 'monthly', label: '월별 로드맵', icon: <CalendarRange size={13} /> }, { value: 'category', label: '분야별 체크리스트', icon: <LayoutGrid size={13} /> }]} />
        {preparationView === 'monthly' && <MonthlyRoadmap tasks={coupleTasks} onToggle={toggleChecklist} />}
        {preparationView === 'category' && <div className="checklist-workspace__lower">
          <CategoryChecklist
            tasks={coupleTasks}
            onToggle={toggleChecklist}
            editable
            onAdd={(category) => { setEditorItem(null); setEditorCategory(category ?? '스튜디오'); setEditorOpen(true) }}
            onEdit={(item) => { setEditorItem(item); setEditorCategory(item.category); setEditorOpen(true) }}
          />
        </div>}
      </div>}

      {tab === 'info' && <CoupleInfoPanel couple={couple} />}
      {tab === 'survey' && consultationCard && <CoupleSurveyResponsesPanel card={consultationCard} />}

      {tab === 'coordination' && <ScheduleCoordinationPanel coupleId={couple.id} />}

      {tab === 'vendors' && <section className="vendor-recommendation-panel">
        <header className="vendor-recommendation-heading">
          <div><h2>업체 추천</h2><p>카테고리별 추천 현황을 한눈에 확인합니다.</p></div>
          <Link to={`/vendors?coupleId=${couple.id}`}><Button variant="secondary" size="sm" icon={<Plus size={14} />}>업체 추천 추가</Button></Link>
        </header>
        <div className="vendor-status-legend" aria-label="추천 상태 색상 안내">
          {(['liked', 'pending', 'hold'] as RecommendationStatus[]).map((status) => <span key={status}><i className={`vendor-status-swatch vendor-status-swatch--${status}`} />{vendorStatusMeta[status].label}</span>)}
        </div>
        {recommendedVendors.length ? <div className="vendor-recommendation-table">
          {groupedVendors.map(({ group, items }) => <section className="vendor-recommendation-group" key={group}>
            <header><h3>{group}</h3><span>{items.length}</span></header>
            <div className="vendor-recommendation-group__rows">
              {items.length ? items.map(({ vendor, recommendation, reference }) => vendor && <article className={`vendor-recommendation-card vendor-recommendation-card--${recommendation.status}`} key={vendor.id} title={vendorStatusMeta[recommendation.status].label}>
                <img src={reference?.image ?? vendor.image} style={{ objectPosition: reference?.imagePosition ?? vendor.imagePosition }} alt="" />
                <div className="vendor-recommendation-card__body"><strong>{vendor.name}</strong><div className="vendor-recommendation-card__tags">{vendor.tags.slice(0, 3).map((tag) => <span key={tag}>#{tag.replace(/^#/, '')}</span>)}</div></div>
                <span className="sr-only">상태: {vendorStatusMeta[recommendation.status].label}</span>
              </article>) : <p className="vendor-recommendation-empty">추천 업체 없음</p>}
            </div>
          </section>)}
        </div> : <Card><p>아직 추천한 업체가 없습니다. 업체 찾기 화면에서 고객에게 업체를 추천해 주세요.</p></Card>}
      </section>}

      {tab === 'finance' && <EstimateSettlementPanel coupleId={couple.id} />}
      <Modal open={conversionOpen} onClose={() => setConversionOpen(false)} eyebrow="Customer conversion" title="정식 고객으로 전환할까요?" footer={<><Button variant="ghost" onClick={() => setConversionOpen(false)}>취소</Button><Button onClick={() => setConversionOpen(false)}>전환 검토 요청</Button></>}><p>설문 응답과 상담 내용을 확인한 뒤 정식 고객 전환을 진행합니다.</p></Modal>
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
    </div>
  )
}
