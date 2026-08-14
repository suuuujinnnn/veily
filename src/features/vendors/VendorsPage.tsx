import { useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Check, CheckCircle2, ChevronRight, Heart, Images, RefreshCcw, Search, Send, Sparkles, UploadCloud, WandSparkles } from 'lucide-react'
import { useDemoStore } from '../../app/store'
import { Badge, Button, Card } from '../../components/ui'
import { getReferenceCategory, vendorReferenceKeywords, type ReferenceCategory } from '../../data/referenceKeywordData'
import { vendorStyleProfiles, type VendorStyleProfile } from '../../data/vendorStyleData'
import { ReferenceBoard } from './ReferenceBoard'
import { ReferenceSearchPanel } from './ReferenceSearchPanel'
import { VendorDatabase } from './VendorDatabase'

type PageMode = 'discovery' | 'board' | 'database'
type AnalysisState = 'idle' | 'analyzing' | 'done'
type SortOption = 'match' | 'evidence' | 'name'

const reviewedReferenceImage = vendorStyleProfiles.find((profile) => profile.vendor.id === 'vp-d4')!.vendor.image

function getProfileKeywords(profileId: string, category: ReferenceCategory) {
  return vendorReferenceKeywords[profileId]?.[category] ?? []
}

function matchesSelectedGroups(category: ReferenceCategory, keywords: string[], selectedKeywords: string[]) {
  if (!selectedKeywords.length) return true
  const definition = getReferenceCategory(category)
  const selectedGroups = definition.groups
    .map((group) => group.keywords.filter((keyword) => selectedKeywords.includes(keyword)))
    .filter((group) => group.length)
  return selectedGroups.every((group) => group.some((keyword) => keywords.includes(keyword)))
}

function referenceMatch(keywords: string[], selectedKeywords: string[]) {
  if (!selectedKeywords.length) return 88
  const matched = selectedKeywords.filter((keyword) => keywords.includes(keyword)).length
  return Math.min(98, 78 + Math.round((matched / selectedKeywords.length) * 20))
}

export function VendorsPage() {
  const navigate = useNavigate()
  const [pageMode, setPageMode] = useState<PageMode>('discovery')
  const [analysis, setAnalysis] = useState<AnalysisState>('idle')
  const [category, setCategory] = useState<ReferenceCategory>('드레스')
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>([])
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState<SortOption>('match')
  const [coupleId, setCoupleId] = useState('c1')
  const [shortlist, setShortlist] = useState<string[]>([])
  const [proposalSent, setProposalSent] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const { couples, vendors, favoriteVendorIds, setRecommendation, toggleFavoriteVendor } = useDemoStore()
  const couple = couples.find((item) => item.id === coupleId) ?? couples[0]

  const liveProfiles = useMemo(() => vendorStyleProfiles.map((profile) => ({ ...profile, vendor: vendors.find((vendor) => vendor.id === profile.vendor.id) ?? profile.vendor })), [vendors])

  const filteredProfiles = useMemo(() => {
    const queryTokens = query.trim().toLocaleLowerCase('ko').split(/\s+/).filter(Boolean)
    return liveProfiles
      .filter((profile) => getProfileKeywords(profile.vendor.id, category).length)
      .filter((profile) => matchesSelectedGroups(category, getProfileKeywords(profile.vendor.id, category), selectedKeywords))
      .filter((profile) => {
        if (!queryTokens.length) return true
        const haystack = [profile.vendor.name, profile.account, profile.vendor.summary, ...getProfileKeywords(profile.vendor.id, category)].join(' ').toLocaleLowerCase('ko')
        return queryTokens.every((token) => haystack.includes(token))
      })
      .sort((a, b) => {
        if (sort === 'evidence') return b.sampleCount - a.sampleCount
        if (sort === 'name') return a.vendor.name.localeCompare(b.vendor.name, 'ko')
        return referenceMatch(getProfileKeywords(b.vendor.id, category), selectedKeywords) - referenceMatch(getProfileKeywords(a.vendor.id, category), selectedKeywords)
      })
  }, [category, liveProfiles, query, selectedKeywords, sort])

  const selectedVendors = shortlist.map((id) => vendors.find((vendor) => vendor.id === id)).filter((vendor): vendor is NonNullable<typeof vendor> => Boolean(vendor))
  const categoryDefinition = getReferenceCategory(category)

  const changeCategory = (nextCategory: ReferenceCategory) => {
    setCategory(nextCategory)
    setSelectedKeywords([])
    setQuery('')
  }

  const toggleKeyword = (keyword: string) => setSelectedKeywords((current) => current.includes(keyword) ? current.filter((item) => item !== keyword) : [...current, keyword])

  const resetSearch = () => {
    setSelectedKeywords([])
    setQuery('')
  }

  const analyze = () => {
    setAnalysis('analyzing')
    window.setTimeout(() => {
      setAnalysis('done')
      setCategory('드레스')
      setSelectedKeywords(['A라인', '미카도 실크', '모던 미니멀'])
      setQuery('')
    }, 1800)
  }

  const toggleShortlist = (vendorId: string) => {
    setProposalSent(false)
    setShortlist((current) => current.includes(vendorId) ? current.filter((id) => id !== vendorId) : [...current, vendorId].slice(-3))
  }

  const openVendor = (vendorId: string) => navigate(`/vendors/${vendorId}`)

  const sendProposal = () => {
    selectedVendors.forEach((vendor) => setRecommendation(coupleId, vendor.id, 'pending'))
    setProposalSent(true)
    window.setTimeout(() => setProposalSent(false), 2800)
  }

  return (
    <div className="page-stack vendors-page vendors-discovery-page">
      <section className="page-intro">
        <div><p className="eyebrow">Partner workspace</p><h1>업체 찾기</h1><p>레퍼런스에서 보이는 구체적인 요소를 조합해, 취향과 가까운 업체를 빠르게 찾아보세요.</p></div>
        {pageMode === 'discovery' ? <Button variant="secondary" icon={<RefreshCcw size={15} />} onClick={() => { setAnalysis('idle'); resetSearch() }}>새 이미지 분석</Button> : <Badge tone="sage">{vendors.length} partners</Badge>}
      </section>
      <nav className="workspace-switch"><button className={pageMode === 'discovery' ? 'active' : ''} onClick={() => setPageMode('discovery')}><Sparkles size={16} /> 레퍼런스로 찾기</button><button className={pageMode === 'board' ? 'active' : ''} onClick={() => setPageMode('board')}><Images size={16} /> 레퍼런스 보드</button><button className={pageMode === 'database' ? 'active' : ''} onClick={() => setPageMode('database')}><Search size={16} /> 업체 DB</button></nav>

      {pageMode === 'board' ? <ReferenceBoard /> : pageMode === 'database' ? <VendorDatabase /> : <>
        <section className={`ai-studio vendor-vision vendor-vision--${analysis}`}>
          <div className="ai-studio__copy"><div className="ai-kicker"><WandSparkles size={16} /> REFERENCE MATCH</div><h2>레퍼런스 한 장을<br /><em>검색 조건으로 바꿔드려요</em></h2><p>드레스 라인, 헤어 높이, 피부 표현, 촬영 공간과 홀 분위기까지 같은 언어로 분류합니다.</p><div className="ai-points"><span><Check size={13} /> 5개 분야 · 20개 세부 분류</span><span><Check size={13} /> 서로 다른 조건을 동시에 조합</span><span><Check size={13} /> 실제 포트폴리오 근거로 매칭</span></div></div>
          <div className="ai-studio__workspace">
            {analysis === 'idle' && <button className="drop-zone" onClick={() => fileRef.current?.click()}><input ref={fileRef} type="file" accept="image/*" hidden onChange={analyze} /><span><UploadCloud size={25} /></span><strong>레퍼런스 이미지를 올려주세요</strong><p>감지된 요소가 아래 검색 조건에 자동으로 담깁니다.</p><small>JPG, PNG · 최대 10MB</small></button>}
            {analysis === 'analyzing' && <div className="analyzing-state"><div className="scan-image"><img src={reviewedReferenceImage} alt="실크 웨딩드레스 분석 원본" /><span /></div><div><div className="pulse-label"><Sparkles size={16} /> 레퍼런스 분석 중</div><h3>라인·소재·디테일을 나눠 보고 있어요</h3><ul><li className="done"><Check size={13} /> 분야 판별</li><li className="done"><Check size={13} /> 세부 요소 인식</li><li><span className="spinner" /> 업체 포트폴리오 매칭</li></ul></div></div>}
            {analysis === 'done' && <div className="analysis-result"><div className="analysis-result__image"><img src={reviewedReferenceImage} alt="분석된 실크 웨딩드레스" /><span><Check size={13} /> 분석 완료</span></div><div className="analysis-result__body"><p className="eyebrow">Detected details</p><h3>드레스 · 3개 조건</h3><div className="analysis-score"><span>분류 확신도</span><strong>94%</strong></div><div className="tag-row tag-row--light"><span>A라인</span><span>미카도 실크</span><span>모던 미니멀</span></div><p>감지한 조건을 아래 검색 패널에 반영했어요.</p></div></div>}
          </div>
        </section>

        <ReferenceSearchPanel category={category} query={query} selectedKeywords={selectedKeywords} resultCount={filteredProfiles.length} onCategoryChange={changeCategory} onQueryChange={setQuery} onKeywordToggle={toggleKeyword} onReset={resetSearch} />

        <section className="style-vendor-results">
          <div className="style-results-heading">
            <div><p className="eyebrow">Curated partner archive</p><h2><span>{category}</span> 레퍼런스 매칭</h2><p>{selectedKeywords.length ? `${selectedKeywords.join(' · ')} 조건을 기준으로 찾았어요.` : `${categoryDefinition.description} 살펴볼 수 있는 전체 업체예요.`}</p></div>
            <label className="couple-result-select"><span>제안할 커플</span><select value={coupleId} onChange={(event) => { setCoupleId(event.target.value); setShortlist([]) }}>{couples.map((item) => <option value={item.id} key={item.id}>{item.partners}</option>)}</select></label>
          </div>
          <div className="style-results-toolbar"><div><strong>{filteredProfiles.length}개 업체</strong><span> · 포트폴리오 분류 기준</span></div><label className="style-sort"><span>정렬</span><select value={sort} onChange={(event) => setSort(event.target.value as SortOption)}><option value="match">조건 일치도순</option><option value="evidence">분석 이미지 많은순</option><option value="name">업체명순</option></select></label></div>
          <div className="style-vendor-grid">{filteredProfiles.map((profile) => <ReferenceVendorCard key={profile.vendor.id} profile={profile} category={category} selectedKeywords={selectedKeywords} selected={shortlist.includes(profile.vendor.id)} favorite={favoriteVendorIds.includes(profile.vendor.id)} onOpen={openVendor} onFavorite={toggleFavoriteVendor} onShortlist={toggleShortlist} />)}</div>
          {!filteredProfiles.length && <Card className="style-results-empty"><Search size={22} /><strong>{category === '웨딩홀' && !query && !selectedKeywords.length ? '웨딩홀 분류는 준비됐고, 업체 데이터를 연결 중입니다.' : '조합한 조건에 맞는 업체가 없습니다.'}</strong><p>{category === '웨딩홀' ? '업체 DB에 웨딩홀 포트폴리오가 등록되면 이 기준으로 바로 검색할 수 있어요.' : '조건을 하나 줄이거나 다른 키워드로 검색해 보세요.'}</p>{(query || selectedKeywords.length > 0) && <Button size="sm" variant="secondary" onClick={resetSearch}>검색 조건 초기화</Button>}</Card>}
        </section>

        {selectedVendors.length > 0 && <section className="vendor-shortlist"><div><span className="vendor-shortlist__count">{selectedVendors.length}</span><div><strong>{couple.partners}님에게 제안할 업체</strong><p>최대 3곳까지 비교해 보낼 수 있습니다.</p></div></div><div className="vendor-shortlist__chips">{selectedVendors.map((vendor) => <button key={vendor.id} onClick={() => toggleShortlist(vendor.id)}><span>{vendor.name}</span><small>{vendor.tags[0] ?? '스타일'} 중심</small>×</button>)}</div><Button icon={<Send size={15} />} onClick={sendProposal}>신부에게 제안 보내기</Button></section>}
        {proposalSent && <div className="toast vendor-proposal-toast"><span>✓</span><div><strong>제안이 고객 화면에 전달됐어요.</strong><p>{selectedVendors.map((vendor) => vendor.name).join(', ')}</p></div></div>}
      </>}
    </div>
  )
}

interface ReferenceVendorCardProps {
  profile: VendorStyleProfile
  category: ReferenceCategory
  selectedKeywords: string[]
  selected: boolean
  favorite: boolean
  onOpen: (vendorId: string) => void
  onFavorite: (vendorId: string) => void
  onShortlist: (vendorId: string) => void
}

function ReferenceVendorCard({ profile, category, selectedKeywords, selected, favorite, onOpen, onFavorite, onShortlist }: ReferenceVendorCardProps) {
  const keywords = getProfileKeywords(profile.vendor.id, category)
  const score = referenceMatch(keywords, selectedKeywords)
  return (
    <article className={`style-vendor-card ${selected ? 'style-vendor-card--selected' : ''}`} role="link" tabIndex={0} onClick={() => onOpen(profile.vendor.id)} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); onOpen(profile.vendor.id) } }} aria-label={`${profile.vendor.name} 상세 보기`}>
      <div className="style-vendor-card__image"><img src={profile.vendor.image} style={{ objectPosition: profile.vendor.imagePosition }} alt={`${profile.vendor.name} 포트폴리오`} /><div className="style-match-score"><Sparkles size={12} /><strong>{score}%</strong><span>REFERENCE FIT</span></div><button className={`style-favorite-button ${favorite ? 'active' : ''}`} aria-label={`${profile.vendor.name} ${favorite ? '즐겨찾기 해제' : '즐겨찾기'}`} aria-pressed={favorite} onClick={(event) => { event.stopPropagation(); onFavorite(profile.vendor.id) }}><Heart size={16} fill={favorite ? 'currentColor' : 'none'} /></button></div>
      <div className="style-vendor-card__body"><div className="style-vendor-card__meta"><span>{category} · {profile.vendor.location}</span><em>{profile.profileType}</em></div><h3>{profile.vendor.name}</h3><a href={`https://instagram.com/${profile.account}`} onClick={(event) => { event.preventDefault(); event.stopPropagation() }}>@{profile.account}</a><p>{profile.vendor.summary}</p>
        <div className="reference-card-keywords">{keywords.slice(0, 6).map((keyword) => <span key={keyword} className={selectedKeywords.includes(keyword) ? 'matched' : ''}>{selectedKeywords.includes(keyword) && <Check size={10} />}#{keyword}</span>)}</div>
        <div className="style-evidence"><div><span>일치 조건</span><strong>{selectedKeywords.filter((keyword) => keywords.includes(keyword)).length || keywords.length}개</strong></div><div><span>분석 근거</span><strong>{profile.sampleCount}장</strong></div></div>
        <div className="style-vendor-card__actions"><Link to={`/vendors/${profile.vendor.id}`} onClick={(event) => event.stopPropagation()}>상세 보기 <ChevronRight size={13} /></Link><Button size="sm" variant={selected ? 'secondary' : 'primary'} icon={selected ? <CheckCircle2 size={14} /> : undefined} onClick={(event) => { event.stopPropagation(); onShortlist(profile.vendor.id) }}>{selected ? '후보에 담김' : '제안 후보 담기'}</Button></div>
      </div>
    </article>
  )
}
