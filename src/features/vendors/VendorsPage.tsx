import { useMemo, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Building2, Check, ChevronDown, ChevronUp, ExternalLink, ImagePlus, RotateCcw, Search, Send, UploadCloud, X } from 'lucide-react'
import { useDemoStore } from '../../app/store'
import { Badge, Button, Card } from '../../components/ui'
import { VenueCard } from '../../components/venues/VenueCard'
import { VenueFilterPanel } from '../../components/venues/VenueFilterPanel'
import { getReferenceCategory, referenceCategories, type ReferenceCategory } from '../../data/referenceKeywordData'
import { weddingReferences } from '../../data/weddingReferenceData'
import { emptyVenueFilterState, filterWeddingVenues, getVenuePrimaryReference } from '../../data/weddingVenueData'
import type { VenueFilterState } from '../../types'
import { ReferenceSearchPanel } from './ReferenceSearchPanel'
import { VendorDatabase } from './VendorDatabase'

function matchesSelectedGroups(category: ReferenceCategory, tags: string[], selected: string[]) {
  if (!selected.length) return true
  return getReferenceCategory(category).groups.map((group) => group.keywords.filter((keyword) => selected.includes(keyword))).filter((keywords) => keywords.length).every((keywords) => keywords.some((keyword) => tags.includes(keyword)))
}

export function VendorsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const store = useDemoStore()
  const view = searchParams.get('view') === 'database' ? 'database' : 'references'
  const [category, setCategory] = useState<ReferenceCategory>('드레스')
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>(['미카도 실크', '일자탑'])
  const [query, setQuery] = useState('')
  const [venueFilters, setVenueFilters] = useState<VenueFilterState>(emptyVenueFilterState)
  const [coupleId, setCoupleId] = useState(() => searchParams.get('coupleId') ?? 'c1')
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [toast, setToast] = useState('')
  const [undoVendorId, setUndoVendorId] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const couple = store.couples.find((item) => item.id === coupleId) ?? store.couples[0]
  const library = useMemo(() => [...store.uploadedReferences, ...weddingReferences], [store.uploadedReferences])
  const filteredReferences = useMemo(() => {
    const tokens = query.trim().toLocaleLowerCase('ko').split(/\s+/).filter(Boolean)
    return library.filter((reference) => reference.category === category).filter((reference) => matchesSelectedGroups(category, reference.tags, selectedKeywords)).filter((reference) => !tokens.length || tokens.every((token) => [reference.vendorName, reference.account, ...reference.tags].join(' ').toLocaleLowerCase('ko').includes(token)))
  }, [category, library, query, selectedKeywords])
  const venueResults = useMemo(() => filterWeddingVenues(venueFilters), [venueFilters])
  const resultCount = category === '웨딩홀' ? venueResults.length : filteredReferences.length
  const activeLabels = category === '웨딩홀' ? [...venueFilters.localities, ...venueFilters.mealTypes, ...venueFilters.venueTypes, ...venueFilters.wishes] : selectedKeywords

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
  const upload = (file?: File) => {
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => { store.addUploadedReference({ category, image: String(reader.result), vendorName: '플래너 개인 자료', account: '직접 업로드', tags: selectedKeywords, purpose: '상담 레퍼런스', source: '플래너 업로드', reviewStatus: '확인필요' }); setToast('개인 레퍼런스를 추가했어요.'); window.setTimeout(() => setToast(''), 2000) }
    reader.readAsDataURL(file)
  }

  return <div className="page-stack vendors-page reference-hub-page">
    <section className="page-intro"><div><p className="eyebrow">Reference & partner workspace</p><h1>레퍼런스·업체</h1><p>고객 취향에 맞는 자료를 찾고 업체 정보까지 같은 화면에서 확인하세요.</p></div><Badge tone="sage">등록 업체 {store.vendors.length}곳</Badge></section>
    <nav className="reference-hub-tabs" aria-label="레퍼런스와 업체 DB"><button className={view === 'references' ? 'active' : ''} onClick={() => setView('references')}><Search size={16} /><span>레퍼런스 보드<small>이미지·웨딩홀 탐색과 추천</small></span></button><button className={view === 'database' ? 'active' : ''} onClick={() => setView('database')}><Building2 size={16} /><span>업체 DB<small>업체 상세 정보와 운영 조건</small></span></button></nav>

    {view === 'database' ? <VendorDatabase /> : <>
      <section className="reference-customer-bar"><label><span>추천 대상 고객</span><select value={coupleId} onChange={(event) => setCoupleId(event.target.value)}>{store.couples.map((item) => <option value={item.id} key={item.id}>{item.partners}</option>)}</select></label><div><strong>선택한 고객에게 즉시 전송됩니다.</strong><span>같은 업체는 중복 등록되지 않아요.</span></div><Button variant="secondary" icon={<UploadCloud size={14} />} onClick={() => fileRef.current?.click()}>개인 자료 추가</Button><input ref={fileRef} hidden type="file" accept="image/*" onChange={(event) => upload(event.target.files?.[0])} /></section>

      <section className={`reference-filter-dock ${filtersOpen ? 'open' : ''}`}>
        <header><div className="reference-filter-dock__identity"><span><Search size={15} /></span><label><small>분야</small><select value={category} onChange={(event) => changeCategory(event.target.value as ReferenceCategory)}>{referenceCategories.map((item) => <option key={item.label}>{item.label}</option>)}</select></label></div><div className="reference-filter-dock__chips">{activeLabels.slice(0, 5).map((label) => <span key={label}>#{label}</span>)}{activeLabels.length > 5 && <em>+{activeLabels.length - 5}</em>}{!activeLabels.length && <small>선택한 조건 없음</small>}</div><div className="reference-filter-dock__actions"><strong>{resultCount}<small>{category === '웨딩홀' ? '곳' : '장'}</small></strong><button onClick={resetFilters} aria-label="필터 초기화"><RotateCcw size={14} /></button><Button size="sm" variant="secondary" icon={filtersOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />} onClick={() => setFiltersOpen((open) => !open)}>{filtersOpen ? '필터 접기' : '필터 펼치기'}</Button></div></header>
        {filtersOpen && <div className="reference-filter-dock__body"><ReferenceSearchPanel category={category} query={query} selectedKeywords={selectedKeywords} resultCount={resultCount} onCategoryChange={changeCategory} onQueryChange={setQuery} onKeywordToggle={(keyword) => setSelectedKeywords((current) => current.includes(keyword) ? current.filter((item) => item !== keyword) : [...current, keyword])} onReset={resetFilters} />{category === '웨딩홀' && <VenueFilterPanel audience="planner" value={venueFilters} resultCount={venueResults.length} onChange={setVenueFilters} />}</div>}
      </section>

      <section className="reference-gallery-section reference-gallery-section--full"><header><div><p className="eyebrow">Search results</p><h2>{category === '웨딩홀' ? `웨딩홀 ${venueResults.length}곳` : `${category} 화보 ${filteredReferences.length}장`}</h2><p>마음에 맞는 결과에서 고객에게 업체를 바로 추천할 수 있습니다.</p></div><Badge tone="neutral">{category === '웨딩홀' ? '웨딩홀 단위' : '이미지 단위'}</Badge></header>
        {category === '웨딩홀' ? <div className="venue-result-grid">{venueResults.map((venue) => { const reference = getVenuePrimaryReference(venue); const sent = store.recommendations.some((item) => item.coupleId === coupleId && item.vendorId === venue.vendorId); return <VenueCard key={venue.id} venue={venue} audience="planner" selected={sent} onToggle={() => recommend(venue.vendorId, reference.id)} /> })}</div> : <div className="reference-image-grid">{filteredReferences.map((reference) => { const sent = Boolean(reference.vendorId && store.recommendations.some((item) => item.coupleId === coupleId && item.vendorId === reference.vendorId)); return <article className={`reference-image-card ${sent ? 'selected' : ''}`} key={reference.id}><div className="reference-image-card__visual"><img src={reference.image} style={{ objectPosition: reference.imagePosition }} alt={`${reference.vendorName} ${reference.category} 레퍼런스`} />{sent && <span className="reference-selected"><Check size={12} /> 추천 전송됨</span>}</div><div className="reference-image-card__body"><div className="reference-image-card__vendor"><div><strong>{reference.vendorName}</strong><span>@{reference.account}</span></div>{reference.vendorId && <Link to={`/vendors/${reference.vendorId}`}><ExternalLink size={14} /></Link>}</div><div className="reference-card-keywords">{reference.tags.slice(0, 6).map((tag) => <span className={selectedKeywords.includes(tag) ? 'matched' : ''} key={tag}>#{tag}</span>)}</div><Button size="sm" variant={sent ? 'secondary' : 'primary'} icon={sent ? <Check size={13} /> : <Send size={13} />} disabled={!reference.vendorId || sent} onClick={() => reference.vendorId && recommend(reference.vendorId, reference.id)}>{sent ? '추천 전송됨' : '고객에게 업체 추천'}</Button></div></article> })}</div>}
        {category === '웨딩홀' && !venueFilters.localities.length && <Card className="style-results-empty"><Search size={22} /><strong>필터를 펼쳐 지역을 선택해 주세요.</strong><p>지역 선택 후 접근성, 식사와 유형 조건을 조합할 수 있습니다.</p></Card>}
        {resultCount === 0 && (category !== '웨딩홀' || venueFilters.localities.length > 0) && <Card className="style-results-empty"><ImagePlus size={22} /><strong>현재 조건에 맞는 결과가 없습니다.</strong><p>조건을 하나 줄이거나 필터를 초기화해 보세요.</p></Card>}
      </section>
    </>}
    {toast && <div className="toast vendor-proposal-toast"><span>{undoVendorId ? <Send size={15} /> : <Check size={15} />}</span><div><strong>{toast}</strong></div>{undoVendorId && <button onClick={undo}>실행취소</button>}<button onClick={() => setToast('')} aria-label="알림 닫기"><X size={14} /></button></div>}
  </div>
}
