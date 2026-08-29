import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { BadgeCheck, CalendarClock, CircleAlert, Lightbulb, MessageSquareText, PenLine, Search, ThumbsUp, UsersRound } from 'lucide-react'
import { useDemoStore } from '../../app/store'
import { Badge, Button, Modal, Toast } from '../../components/ui'
import type { Vendor, VendorInsightCategory } from '../../types'

type InsightSort = 'latest' | 'helpful'

interface VendorInsightsPanelProps {
  availableVendors: Vendor[]
  vendorId?: string
  canWrite?: boolean
  showFilters?: boolean
  featuredVendorIds?: string[]
  title?: string
  description?: string
  embedded?: boolean
}

export const vendorInsightCategories: VendorInsightCategory[] = ['업체별 최근 경험', '담당자 성향', '담당자 이직·퇴사', '업체 변경사항', '실제 진행 후기', '업체별 유의사항']

function InsightComposer({ open, onClose, onReward, vendors, initialVendorId }: { open: boolean; onClose: () => void; onReward: () => void; vendors: Vendor[]; initialVendorId?: string }) {
  const { addVendorInsight } = useDemoStore()
  const [selectedVendorId, setSelectedVendorId] = useState(initialVendorId ?? vendors[0]?.id ?? '')
  const [category, setCategory] = useState<VendorInsightCategory>('업체별 최근 경험')
  const [title, setTitle] = useState('')
  const [experienceContext, setExperienceContext] = useState('')
  const [staffName, setStaffName] = useState('')
  const [highlights, setHighlights] = useState('')
  const [considerations, setConsiderations] = useState('')
  const [error, setError] = useState('')

  const submit = () => {
    if (!selectedVendorId || !title.trim() || !experienceContext.trim() || !highlights.trim() || !considerations.trim()) {
      setError('업체, 제목, 진행 배경, 특장점, 유의할 점을 모두 입력해 주세요.')
      return
    }
    addVendorInsight({
      vendorId: selectedVendorId,
      category,
      title: title.trim(),
      experienceContext: experienceContext.trim(),
      staffName: staffName.trim() || undefined,
      highlights: highlights.trim(),
      considerations: considerations.trim(),
      tags: [category.replaceAll(' ', ''), staffName.trim()].filter(Boolean),
      helpfulCount: 0,
      authorLabel: '인증 플래너',
      experienceBand: '경력 5–10년',
    })
    setTitle('')
    setExperienceContext('')
    setStaffName('')
    setHighlights('')
    setConsiderations('')
    setError('')
    onClose()
    onReward()
  }

  return <Modal open={open} onClose={onClose} eyebrow="Verified planner insight" title="업체 실무 정보 공유" footer={<><Button variant="ghost" onClick={onClose}>취소</Button><Button onClick={submit}>업체 정보 등록</Button></>}>
    <div className="insight-compose-form">
      <div className="insight-public-notice"><BadgeCheck size={17} /><div><strong>전체 인증 플래너가 함께 관리하는 공개 정보</strong><span>등록한 내용은 업체 상세와 고객 포털에도 동일하게 표시됩니다.</span></div></div>
      <label className="form-field"><span>업체</span><select value={selectedVendorId} disabled={Boolean(initialVendorId)} onChange={(event) => setSelectedVendorId(event.target.value)}><option value="">업체를 선택해 주세요</option>{vendors.map((vendor) => <option value={vendor.id} key={vendor.id}>{vendor.name} · {vendor.category}</option>)}</select></label>
      <label className="form-field"><span>정보 유형</span><select value={category} onChange={(event) => setCategory(event.target.value as VendorInsightCategory)}>{vendorInsightCategories.map((item) => <option key={item}>{item}</option>)}</select></label>
      <label className="form-field form-field--wide"><span>제목</span><input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="한눈에 이해할 수 있는 정보 제목" /></label>
      <label className="form-field form-field--wide"><span>진행 배경</span><input value={experienceContext} onChange={(event) => setExperienceContext(event.target.value)} placeholder="예: 2026년 8월 드레스 투어 · 실크 선호 신부 동행" /></label>
      <label className="form-field form-field--wide"><span>담당자명 · 선택</span><input value={staffName} onChange={(event) => setStaffName(event.target.value)} placeholder="예: 김하늘 실장" /></label>
      <label className="form-field form-field--wide"><span>특장점</span><textarea rows={4} value={highlights} onChange={(event) => setHighlights(event.target.value)} placeholder="가격, 선택지, 응대 방식처럼 진행에 도움이 되는 정보를 적어주세요." /></label>
      <label className="form-field form-field--wide"><span>유의할 점</span><textarea rows={3} value={considerations} onChange={(event) => setConsiderations(event.target.value)} placeholder="예약이나 상담 전에 확인하면 좋은 내용을 부드럽고 구체적으로 적어주세요." /></label>
      {error && <p className="insight-form-error" role="alert">{error}</p>}
    </div>
  </Modal>
}

export function VendorInsightsPanel({ availableVendors, vendorId, canWrite = false, showFilters = false, featuredVendorIds = [], title = '업체 실무 정보', description = '인증 플래너가 실제 진행 과정에서 확인한 정보를 공유합니다.', embedded = false }: VendorInsightsPanelProps) {
  const { vendorInsights } = useDemoStore()
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState<InsightSort>('latest')
  const [category, setCategory] = useState('전체')
  const [insightCategory, setInsightCategory] = useState<'전체' | VendorInsightCategory>('전체')
  const [filterVendorId, setFilterVendorId] = useState(vendorId ?? '전체')
  const [composeOpen, setComposeOpen] = useState(false)
  const [rewardToast, setRewardToast] = useState(false)
  const [helpfulIds, setHelpfulIds] = useState<string[]>([])
  const showReward = () => { setRewardToast(true); window.setTimeout(() => setRewardToast(false), 2200) }
  const vendorMap = useMemo(() => new Map(availableVendors.map((vendor) => [vendor.id, vendor])), [availableVendors])
  const vendorCategories = ['전체', ...new Set(availableVendors.map((vendor) => vendor.category))]

  const insights = useMemo(() => vendorInsights
    .filter((insight) => vendorMap.has(insight.vendorId))
    .filter((insight) => !vendorId || insight.vendorId === vendorId)
    .filter((insight) => category === '전체' || vendorMap.get(insight.vendorId)?.category === category)
    .filter((insight) => filterVendorId === '전체' || insight.vendorId === filterVendorId)
    .filter((insight) => insightCategory === '전체' || insight.category === insightCategory)
    .filter((insight) => !query.trim() || [vendorMap.get(insight.vendorId)?.name, insight.staffName, insight.title, insight.experienceContext, insight.highlights, insight.considerations, ...insight.tags].join(' ').toLocaleLowerCase('ko').includes(query.trim().toLocaleLowerCase('ko')))
    .sort((a, b) => {
      const featuredDifference = Number(featuredVendorIds.includes(b.vendorId)) - Number(featuredVendorIds.includes(a.vendorId))
      if (featuredDifference) return featuredDifference
      return sort === 'helpful' ? b.helpfulCount - a.helpfulCount : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    }), [category, featuredVendorIds, filterVendorId, insightCategory, query, sort, vendorId, vendorInsights, vendorMap])

  const relevant = vendorInsights.filter((insight) => vendorMap.has(insight.vendorId) && (!vendorId || insight.vendorId === vendorId))
  const connectedVendorCount = new Set(relevant.map((insight) => insight.vendorId)).size
  const latest = [...relevant].sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0]

  return <section className={`vendor-insights-panel ${embedded ? 'vendor-insights-panel--embedded' : ''}`}>
    <header className="vendor-insights-heading"><div><p className="eyebrow">Verified partner information</p><h2>{title}</h2><p>{description}</p></div>{canWrite && <Button icon={<PenLine size={15} />} onClick={() => setComposeOpen(true)}>업체 정보 공유</Button>}</header>
    <div className="insight-summary"><div><CalendarClock size={18} /><span>최근 업데이트</span><strong>{latest ? new Intl.DateTimeFormat('ko-KR', { month: 'short', day: 'numeric' }).format(new Date(latest.createdAt)) : '—'}</strong></div><div><UsersRound size={18} /><span>연결 업체</span><strong>{connectedVendorCount}곳</strong></div><div><MessageSquareText size={18} /><span>등록 정보</span><strong>{relevant.length}건</strong></div><div><BadgeCheck size={18} /><span>작성 기준</span><strong>인증 플래너</strong></div></div>
    {showFilters && <div className="insight-search"><Search size={15} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="업체, 담당자, 제목, 태그 검색" /></div>}
    <div className="insight-toolbar">
      {showFilters && <><label><span>분야</span><select value={category} onChange={(event) => { setCategory(event.target.value); setFilterVendorId('전체') }}>{vendorCategories.map((item) => <option key={item}>{item}</option>)}</select></label><label><span>업체</span><select value={filterVendorId} onChange={(event) => setFilterVendorId(event.target.value)}><option value="전체">전체 업체</option>{availableVendors.filter((vendor) => category === '전체' || vendor.category === category).map((vendor) => <option value={vendor.id} key={vendor.id}>{vendor.name}</option>)}</select></label></>}
      <label><span>정보 유형</span><select value={insightCategory} onChange={(event) => setInsightCategory(event.target.value as '전체' | VendorInsightCategory)}><option value="전체">전체 정보</option>{vendorInsightCategories.map((item) => <option key={item}>{item}</option>)}</select></label>
      <label className="insight-sort"><span>정렬</span><select value={sort} onChange={(event) => setSort(event.target.value as InsightSort)}><option value="latest">최신순</option><option value="helpful">도움돼요순</option></select></label>
    </div>
    <div className="insight-list">{insights.map((insight) => { const vendor = vendorMap.get(insight.vendorId); const helpful = helpfulIds.includes(insight.id); return <article className="insight-card" key={insight.id}>
      <div className="insight-card__top"><div>{vendor && <Link to={`/vendor-database/${vendor.id}`}>{vendor.name}</Link>}<Badge tone="neutral">{insight.category}</Badge></div><time dateTime={insight.createdAt}>{new Intl.DateTimeFormat('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' }).format(new Date(insight.createdAt))}</time></div>
      <h3>{insight.title}</h3><p className="insight-context">{insight.experienceContext}{insight.staffName && <span>담당자 · {insight.staffName}</span>}</p>
      <div className="insight-content"><div><strong><Lightbulb size={14} /> 특장점</strong><p>{insight.highlights}</p></div><div><strong><CircleAlert size={14} /> 유의할 점</strong><p>{insight.considerations}</p></div></div>
      <div className="insight-tags">{insight.tags.map((tag) => <span key={tag}>#{tag}</span>)}</div>
      <footer><span><BadgeCheck size={14} /> {insight.authorLabel}</span><i /><span>{insight.experienceBand}</span><button className={helpful ? 'active' : ''} onClick={() => setHelpfulIds((current) => helpful ? current.filter((id) => id !== insight.id) : [...current, insight.id])}><ThumbsUp size={13} /> 도움돼요 {insight.helpfulCount + (helpful ? 1 : 0)}</button></footer>
    </article> })}{!insights.length && <div className="insight-empty"><MessageSquareText size={27} /><strong>조건에 맞는 업체 정보가 없습니다.</strong><p>{canWrite ? '현장에서 확인한 첫 정보를 공유해 주세요.' : '새 정보가 등록되면 이곳에서 확인할 수 있어요.'}</p>{canWrite && <Button size="sm" onClick={() => setComposeOpen(true)}>첫 정보 등록</Button>}</div>}</div>
    {canWrite && <InsightComposer open={composeOpen} onClose={() => setComposeOpen(false)} onReward={showReward} vendors={availableVendors} initialVendorId={vendorId} />}
    <Toast open={rewardToast} reward title="+10P 적립" message="유용한 업체 정보를 공유해 주셔서 감사합니다." />
  </section>
}
