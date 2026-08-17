import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Building2, Check, ExternalLink, Heart, ImagePlus, Search, Send, UploadCloud, X } from 'lucide-react'
import { useDemoStore } from '../../app/store'
import { Badge, Button, Card } from '../../components/ui'
import { VenueCard } from '../../components/venues/VenueCard'
import { VenueFilterPanel } from '../../components/venues/VenueFilterPanel'
import { ReferenceImageAnalyzerModal } from '../../components/references/ReferenceImageAnalyzerModal'
import { ReferenceCarouselModal } from '../../components/references/ReferenceCarouselModal'
import { ReferenceCategoryTabs } from '../../components/references/ReferenceCategoryTabs'
import { ReferenceKeywordFilter } from '../../components/references/ReferenceKeywordFilter'
import { ReferenceTagList } from '../../components/references/ReferenceTagList'
import { VendorDiscoveryFilterDock } from '../../components/vendors/VendorDiscoveryFilterDock'
import { getReferenceCategory, type ReferenceCategory } from '../../data/referenceKeywordData'
import { weddingReferences } from '../../data/weddingReferenceData'
import { emptyVenueFilterState, filterWeddingVenues, getVenuePrimaryReference } from '../../data/weddingVenueData'
import type { VenueFilterState, WeddingReference } from '../../types'
import { VendorDatabase } from './VendorDatabase'
import { vendorOperationalText } from './vendorInfoUtils'

function matchesSelectedGroups(category: ReferenceCategory, tags: string[], selected: string[]) {
  if (!selected.length) return true
  return getReferenceCategory(category).groups.map((group) => group.keywords.filter((keyword) => selected.includes(keyword))).filter((keywords) => keywords.length).every((keywords) => keywords.some((keyword) => tags.includes(keyword)))
}

export function VendorsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const store = useDemoStore()
  const view = searchParams.get('view') === 'database' ? 'database' : 'references'
  const [category, setCategory] = useState<ReferenceCategory>('드레스')
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>([])
  const [query, setQuery] = useState('')
  const [venueFilters, setVenueFilters] = useState<VenueFilterState>(emptyVenueFilterState)
  const [coupleId, setCoupleId] = useState(() => searchParams.get('coupleId') ?? 'c1')
  const [filtersOpen, setFiltersOpen] = useState(true)
  const [toast, setToast] = useState('')
  const [undoVendorId, setUndoVendorId] = useState<string | null>(null)
  const [previewReferences, setPreviewReferences] = useState<WeddingReference[]>([])
  const [previewIndex, setPreviewIndex] = useState(0)
  const [uploadOpen, setUploadOpen] = useState(false)
  const couple = store.couples.find((item) => item.id === coupleId) ?? store.couples[0]
  const library = useMemo(() => [...store.uploadedReferences, ...weddingReferences], [store.uploadedReferences])
  const customerSubmission = store.customerReferenceSubmissions.find((item) => item.coupleId === coupleId)
  const customerTasteReferences = useMemo(() => (customerSubmission?.selections ?? []).map((selection) => ({ selection, reference: library.find((item) => item.id === selection.referenceId) })).filter((item) => item.reference), [customerSubmission, library])
  const customerTastePreviewReferences = useMemo(() => customerTasteReferences.map((item) => item.reference).filter((reference): reference is WeddingReference => Boolean(reference)), [customerTasteReferences])
  const customerTasteTags = useMemo(() => {
    if (category === '웨딩홀') return []
    const available = new Set(getReferenceCategory(category).groups.flatMap((group) => group.keywords))
    return [...new Set([...customerTasteReferences.filter((item) => item.reference?.category === category).flatMap((item) => item.reference?.tags ?? []), ...(customerSubmission?.preferredTags ?? [])])].filter((tag) => available.has(tag))
  }, [category, customerSubmission?.preferredTags, customerTasteReferences])
  const filteredReferences = useMemo(() => {
    const tokens = query.trim().toLocaleLowerCase('ko').split(/\s+/).filter(Boolean)
    return library.filter((reference) => reference.category === category).filter((reference) => matchesSelectedGroups(category, reference.tags, selectedKeywords)).filter((reference) => !tokens.length || tokens.every((token) => [reference.vendorName, reference.account, ...reference.tags].join(' ').toLocaleLowerCase('ko').includes(token)))
  }, [category, library, query, selectedKeywords])
  const venueResults = useMemo(() => filterWeddingVenues(venueFilters), [venueFilters])
  const filteredDatabaseVendors = useMemo(() => {
    const tokens = query.trim().toLocaleLowerCase('ko').split(/\s+/).filter(Boolean)
    const venueVendorIds = new Set(venueResults.map((venue) => venue.vendorId))
    return store.vendors.filter((vendor) => {
      // 레퍼런스 탭은 헤어·메이크업이 갈리지만 업체는 하나다. 둘 다 같은 업체로 잇는다.
      const categoryMatches = category === '헤어' || category === '메이크업' ? vendor.category === '헤어&메이크업' : vendor.category === category
      const keywordMatches = category === '웨딩홀' ? venueVendorIds.has(vendor.id) : matchesSelectedGroups(category, vendor.tags, selectedKeywords)
      const haystack = [vendor.name, vendor.instagram, vendor.address, vendor.summary, vendorOperationalText(vendor), ...vendor.tags].join(' ').toLocaleLowerCase('ko')
      return categoryMatches && keywordMatches && (!tokens.length || tokens.every((token) => haystack.includes(token)))
    })
  }, [category, query, selectedKeywords, store.vendors, venueResults])
  const uploadedVenueReferences = filteredReferences.filter((item) => item.category === '웨딩홀' && item.source !== '검수 아카이브')
  const resultCount = category === '웨딩홀' ? venueResults.length : filteredReferences.length

  const applyCustomerTaste = () => {
    if (category !== '웨딩홀') setSelectedKeywords(customerTasteTags)
    setQuery('')
  }
  useEffect(() => {
    if (customerSubmission) applyCustomerTaste()
  // Apply the selected customer's latest submission whenever the customer or category changes.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category, coupleId, customerSubmission?.submittedAt])

  const setView = (next: 'references' | 'database') => {
    const params = new URLSearchParams(searchParams); params.set('view', next); if (coupleId) params.set('coupleId', coupleId); setSearchParams(params)
  }
  const changeCategory = (next: ReferenceCategory) => { setCategory(next); setSelectedKeywords([]); setQuery('') }
  const resetFilters = () => { setSelectedKeywords([]); setQuery(''); setVenueFilters(emptyVenueFilterState) }
  const recommend = (vendorId: string, referenceId: string) => {
    const existing = store.recommendations.some((item) => item.coupleId === coupleId && item.vendorId === vendorId)
    store.sendRecommendation(coupleId, vendorId, referenceId)
    setUndoVendorId(existing ? null : vendorId)
    setToast(existing ? `${couple.partners} 고객에게 이미 추천된 업체예요.` : `${couple.partners} 고객의 추천 업체에 바로 전송했어요.`)
    window.setTimeout(() => { setToast(''); setUndoVendorId(null) }, 4000)
  }
  const undo = () => { if (undoVendorId) store.removeRecommendation(coupleId, undoVendorId); setToast('추천 전송을 취소했어요.'); setUndoVendorId(null); window.setTimeout(() => setToast(''), 1800) }
  const addAnalyzedReference = (reference: Omit<WeddingReference, 'id'>) => {
    store.addUploadedReference(reference)
    setCategory(reference.category)
    setSelectedKeywords(reference.tags)
    setQuery('')
    setToast(`${reference.category} · ${reference.tags.length}개 태그로 개인 자료를 추가했어요.`)
    window.setTimeout(() => setToast(''), 2500)
  }
  const openPreview = (references: WeddingReference[], referenceId: string) => {
    setPreviewReferences(references)
    setPreviewIndex(Math.max(0, references.findIndex((reference) => reference.id === referenceId)))
  }

  return <div className="page-stack vendors-page reference-hub-page">
    <section className="page-intro"><div><p className="eyebrow">Vendor discovery</p><h1>레퍼런스 · 업체 찾기</h1><p>레퍼런스 이미지와 업체 정보를 한 작업 공간에서 탐색하고 추천하세요.</p></div><Badge tone="sage">등록 업체 {store.vendors.length}곳</Badge></section>
    <nav className="reference-hub-tabs" aria-label="레퍼런스와 업체 DB"><button className={view === 'references' ? 'active' : ''} onClick={() => setView('references')}><Search size={16} /><span>레퍼런스 보드<small>이미지·웨딩홀 탐색과 추천</small></span></button><button className={view === 'database' ? 'active' : ''} onClick={() => setView('database')}><Building2 size={16} /><span>업체 DB<small>업체 상세 정보와 운영 조건</small></span></button></nav>

    <VendorDiscoveryFilterDock query={query} onQueryChange={setQuery} resultCount={view === 'database' ? filteredDatabaseVendors.length : resultCount} resultUnit={view === 'database' || category === '웨딩홀' ? '곳' : '장'} filtersOpen={filtersOpen} onToggleFilters={() => setFiltersOpen((open) => !open)} onReset={resetFilters} ariaLabel="업체명·스타일·실무정보 검색" title={category === '웨딩홀' ? '웨딩홀 조건 필터' : undefined}>
      <ReferenceCategoryTabs value={category} onChange={changeCategory} variant="planner" /><ReferenceKeywordFilter category={category} selectedKeywords={selectedKeywords} onKeywordToggle={(keyword) => setSelectedKeywords((current) => current.includes(keyword) ? current.filter((item) => item !== keyword) : [...current, keyword])} variant="planner" />{category === '웨딩홀' && <VenueFilterPanel audience="planner" value={venueFilters} resultCount={venueResults.length} onChange={setVenueFilters} />}
    </VendorDiscoveryFilterDock>

    {view === 'database' ? <VendorDatabase vendorIds={filteredDatabaseVendors.map((vendor) => vendor.id)} /> : <>
      <section className={`reference-customer-context ${customerSubmission ? '' : 'is-empty'}`}>
        <header><label className="reference-customer-context__target"><span>추천 대상</span><select value={coupleId} onChange={(event) => setCoupleId(event.target.value)}>{store.couples.map((item) => <option value={item.id} key={item.id}>{item.partners}</option>)}</select></label><small>선택한 고객에게 추천이 전송됩니다.</small></header>
        <div className="reference-customer-context__taste"><div className="customer-taste-brief__images">{customerTastePreviewReferences.slice(0, 3).map((reference) => <button type="button" onClick={() => openPreview(customerTastePreviewReferences, reference.id)} aria-label={`${reference.vendorName} 레퍼런스 크게 보기`} key={reference.id}><img src={reference.image} style={{ objectPosition: reference.imagePosition }} alt={`${couple.brideName} 고객 취향`} /></button>)}{!customerTastePreviewReferences.length && <span><Heart size={16} /></span>}</div><div className="customer-taste-brief__copy"><div><Badge tone={customerSubmission ? 'rose' : 'neutral'}>{customerSubmission?.status ?? '미제출'}</Badge><strong>{couple.brideName}님이 보낸 레퍼런스</strong></div><p>{customerSubmission ? `${customerTasteReferences.length}장 · ${customerSubmission.submittedAt.slice(0, 10).replaceAll('-', '.')} 전송 · 현재 분야 필터에 자동 반영` : '고객이 보낸 자료가 아직 없습니다.'}</p></div><Button size="sm" variant="secondary" icon={<UploadCloud size={14} />} onClick={() => setUploadOpen(true)}>개인 자료 추가</Button></div>
      </section>

      <section className="reference-gallery-section reference-gallery-section--full"><header><div><p className="eyebrow">Search results</p><h2>{category === '웨딩홀' ? `웨딩홀 ${venueResults.length}곳` : `${category} 화보 ${filteredReferences.length}장`}</h2><p>마음에 맞는 결과에서 고객에게 업체를 바로 추천할 수 있습니다.</p></div><Badge tone="neutral">{category === '웨딩홀' ? '웨딩홀 단위' : '이미지 단위'}</Badge></header>
        {category === '웨딩홀' ? <>{uploadedVenueReferences.length > 0 && <div className="reference-image-grid reference-uploaded-venue-grid">{uploadedVenueReferences.map((reference) => <article className="reference-image-card" key={reference.id}><button type="button" className="reference-image-card__visual" onClick={() => openPreview(uploadedVenueReferences, reference.id)} aria-label="업로드한 웨딩홀 레퍼런스 크게 보기"><img src={reference.image} alt="업로드한 웨딩홀 레퍼런스" /></button><div className="reference-image-card__body"><div className="reference-image-card__vendor"><div><strong>{reference.vendorName}</strong><span>@{reference.account}</span></div></div><ReferenceTagList tags={reference.tags} max={6} variant="planner" /><Button size="sm" variant="secondary" disabled>업체 연결 없음</Button></div></article>)}</div>}<div className="venue-result-grid">{venueResults.map((venue) => { const reference = getVenuePrimaryReference(venue); const sent = store.recommendations.some((item) => item.coupleId === coupleId && item.vendorId === venue.vendorId); return <VenueCard key={venue.id} venue={venue} audience="planner" selected={sent} onToggle={() => recommend(venue.vendorId, reference.id)} /> })}</div></> : <div className="reference-image-grid">{filteredReferences.map((reference) => { const sent = Boolean(reference.vendorId && store.recommendations.some((item) => item.coupleId === coupleId && item.vendorId === reference.vendorId)); return <article className={`reference-image-card ${sent ? 'selected' : ''}`} key={reference.id}><button type="button" className="reference-image-card__visual" onClick={() => openPreview(filteredReferences, reference.id)} aria-label={`${reference.vendorName} 레퍼런스 크게 보기`}><img src={reference.image} style={{ objectPosition: reference.imagePosition }} alt={`${reference.vendorName} ${reference.category} 레퍼런스`} />{sent && <span className="reference-selected"><Check size={12} /> 추천 전송됨</span>}</button><div className="reference-image-card__body"><div className="reference-image-card__vendor"><div><strong>{reference.vendorName}</strong><span>@{reference.account}</span></div>{reference.vendorId && <Link to={`/vendors/${reference.vendorId}`}><ExternalLink size={14} /></Link>}</div><ReferenceTagList tags={reference.tags} max={6} matchedTags={selectedKeywords} variant="planner" /><Button size="sm" variant={sent ? 'secondary' : 'primary'} icon={sent ? <Check size={13} /> : <Send size={13} />} disabled={!reference.vendorId || sent} onClick={() => reference.vendorId && recommend(reference.vendorId, reference.id)}>{!reference.vendorId ? '업체 연결 없음' : sent ? '추천 전송됨' : '고객에게 업체 추천'}</Button></div></article> })}</div>}
        {category === '웨딩홀' && !venueFilters.localities.length && <Card className="style-results-empty"><Search size={22} /><strong>필터를 펼쳐 지역을 선택해 주세요.</strong><p>지역 선택 후 접근성, 식사와 유형 조건을 조합할 수 있습니다.</p></Card>}
        {resultCount === 0 && (category !== '웨딩홀' || venueFilters.localities.length > 0) && <Card className="style-results-empty"><ImagePlus size={22} /><strong>현재 조건에 맞는 결과가 없습니다.</strong><p>조건을 하나 줄이거나 필터를 초기화해 보세요.</p></Card>}
      </section>
    </>}
    {toast && <div className="toast vendor-proposal-toast"><span>{undoVendorId ? <Send size={15} /> : <Check size={15} />}</span><div><strong>{toast}</strong></div>{undoVendorId && <button onClick={undo}>실행취소</button>}<button onClick={() => setToast('')} aria-label="알림 닫기"><X size={14} /></button></div>}
    <ReferenceCarouselModal references={previewReferences} index={previewIndex} onIndexChange={setPreviewIndex} onClose={() => setPreviewReferences([])} />
    <ReferenceImageAnalyzerModal open={uploadOpen} source="플래너 업로드" preferredCategory={category} onClose={() => setUploadOpen(false)} onComplete={addAnalyzedReference} />
  </div>
}
