import { useMemo, useState } from 'react'
import { ArrowLeft, CalendarDays, Copy, ExternalLink, MapPin, MoreHorizontal } from 'lucide-react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { useDemoStore } from '../../app/store'
import { Badge, Button, Progress } from '../../components/ui'
import { contracts, couples as initialCouples, vendors } from '../../data/mockData'
import type { ChecklistCategory, ChecklistItem, ConsultationCard } from '../../types'
import { ChecklistEditorModal } from '../checklist/ChecklistEditorModal'
import { CoupleChecklistTab } from './components/couple-checklist-tab'
import { CoupleConsultationTab } from './components/couple-consultation-tab'
import { CoupleContractsTab } from './components/couple-contracts-tab'
import { CoupleOverviewTab } from './components/couple-overview-tab'
import { CoupleScheduleTab } from './components/couple-schedule-tab'
import { CoupleVendorsTab } from './components/couple-vendors-tab'

type DetailTab = 'overview' | 'timeline' | 'calendar' | 'vendors' | 'contracts' | 'consultation'
const detailTabs: DetailTab[] = ['overview', 'timeline', 'calendar', 'vendors', 'contracts', 'consultation']
const tabLabels: Record<DetailTab, string> = {
  overview: '한눈에 보기',
  timeline: '준비 체크리스트',
  calendar: '일정 조율',
  vendors: '추천 업체',
  contracts: '계약',
  consultation: '상담 카드',
}

function isDetailTab(value: string | null): value is DetailTab {
  return detailTabs.includes(value as DetailTab)
}

export function CoupleDetailPage() {
  const { id = 'c1' } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()
  const { couples: storedCouples, events, checklist, recommendations, coordination, toggleChecklist, addChecklist, updateChecklist, deleteChecklist, finalizeCoordination, consultations, saveConsultation, addCoordination } = useDemoStore()
  const couple = storedCouples.find((item) => item.id === id) ?? initialCouples[0]
  const tab: DetailTab = isDetailTab(searchParams.get('tab')) ? searchParams.get('tab') as DetailTab : 'overview'
  const [editorOpen, setEditorOpen] = useState(false)
  const [editorItem, setEditorItem] = useState<ChecklistItem | null>(null)
  const [editorCategory, setEditorCategory] = useState<ChecklistCategory>('' as ChecklistCategory)
  const coupleEvents = useMemo(() => events.filter((event) => event.coupleId === couple.id), [events, couple.id])
  const coupleTasks = checklist.filter((item) => item.coupleId === couple.id)
  const coupleOptions = coordination.filter((option) => option.coupleId === couple.id)
  const coupleContracts = contracts.filter((item) => item.coupleId === couple.id)
  const recommendedVendors = recommendations.filter((item) => item.coupleId === couple.id).map((item) => ({ ...item, vendor: vendors.find((vendor) => vendor.id === item.vendorId) })).filter((item) => item.vendor)
  const consultation: ConsultationCard = consultations.find((item) => item.coupleId === couple.id) ?? { id: 'consult-' + couple.id, coupleId: couple.id, weddingDate: couple.weddingDate, venue: couple.venue, budget: '', preferredStyle: '', priorities: '', requestedTopics: '', notes: '', submittedAt: '', plannerResult: '', plannerFollowUp: '' }
  const openTab = (nextTab: DetailTab) => {
    const next = new URLSearchParams(searchParams)
    next.set('tab', nextTab)
    setSearchParams(next)
  }
  const copyHomepageLink = () => navigator.clipboard?.writeText(window.location.origin + '/portal/' + couple.id)

  return (
    <div className="page-stack couple-detail">
      <Link className="back-link" to="/couples"><ArrowLeft size={15} /> 모든 커플</Link>
      <section className="couple-profile">
        <div className={`couple-profile__mark couple-profile__mark--${couple.tone}`}><span>{couple.initials}</span><small>우리의 날</small></div>
        <div className="couple-profile__main"><div><Badge tone="rose">{couple.status}</Badge><p className="eyebrow">웨딩 여정</p></div><h1>{couple.partners}님</h1><p>{couple.concept}</p><div className="couple-meta"><span><CalendarDays size={15} /> {couple.weddingDate.replaceAll('-', '. ')}</span><span><MapPin size={15} /> {couple.venue}</span></div></div>
        <div className="couple-profile__progress"><span>전체 준비율</span><strong>{couple.progress}<i>%</i></strong><Progress value={couple.progress} /></div>
        <div className="couple-profile__actions"><div className="couple-profile__share-actions"><Link to={`/portal/${couple.id}`} target="_blank"><Button variant="secondary" icon={<ExternalLink size={15} />}>고객 공유 페이지</Button></Link><button className="homepage-share-button" onClick={copyHomepageLink}><Copy size={15} /> 홈페이지 공유 링크</button></div><button className="icon-button bordered"><MoreHorizontal size={18} /></button></div>
      </section>
      <nav className="detail-tabs">{detailTabs.map((key) => <button key={key} onClick={() => openTab(key)} className={tab === key ? 'active' : ''}>{tabLabels[key]}</button>)}</nav>

      {tab === 'overview' && <CoupleOverviewTab couple={couple} coupleEvents={coupleEvents} coupleTasks={coupleTasks} onOpenTab={openTab} onToggleChecklist={toggleChecklist} />}
      {tab === 'timeline' && <CoupleChecklistTab coupleTasks={coupleTasks} onToggleChecklist={toggleChecklist} onAddTask={(category) => { setEditorItem(null); setEditorCategory(category ?? coupleTasks[0]?.category ?? ('' as ChecklistCategory)); setEditorOpen(true) }} onEditTask={(item) => { setEditorItem(item); setEditorCategory(item.category); setEditorOpen(true) }} />}
      {tab === 'calendar' && <CoupleScheduleTab coupleId={couple.id} events={events} coupleOptions={coupleOptions} onAddCoordination={addCoordination} onFinalizeCoordination={finalizeCoordination} />}
      {tab === 'vendors' && <CoupleVendorsTab recommendedVendors={recommendedVendors} />}
      {tab === 'contracts' && <CoupleContractsTab initialContracts={coupleContracts} coupleId={couple.id} />}
      {tab === 'consultation' && <CoupleConsultationTab consultation={consultation} onSave={saveConsultation} />}

      <ChecklistEditorModal open={editorOpen} coupleId={couple.id} defaultCategory={editorCategory} item={editorItem} onClose={() => setEditorOpen(false)} onCreate={addChecklist} onUpdate={updateChecklist} onDelete={deleteChecklist} />
    </div>
  )
}
