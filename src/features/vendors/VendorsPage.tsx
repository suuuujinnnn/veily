import { useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { BarChart3, Brush, Camera, Check, CheckCircle2, ChevronRight, Gem, Heart, RefreshCcw, Search, Send, Sparkles, UploadCloud, WandSparkles } from 'lucide-react'
import { useDemoStore } from '../../app/store'
import { Badge, Button, Card } from '../../components/ui'
import { vendorStyleProfiles, vendorStyleTaxonomy, type PartnerCategory, type VendorStyleProfile } from '../../data/vendorStyleData'
import { VendorDatabase } from './VendorDatabase'

type AnalysisState = 'idle' | 'analyzing' | 'done'
type SortOption = 'style' | 'evidence' | 'name'

const categories: PartnerCategory[] = ['드레스', '스튜디오', '메이크업']
const categoryIcons = { 드레스: Gem, 스튜디오: Camera, 메이크업: Brush }
const reviewedReferenceImage = vendorStyleProfiles.find((profile) => profile.vendor.id === 'vp-d4')!.vendor.image

function styleMatch(profile: VendorStyleProfile, selectedStyle: string) {
  const selectedCount = profile.styleCounts[selectedStyle] ?? 0
  const strongestCount = Math.max(...Object.values(profile.styleCounts))
  if (!selectedCount) return 0
  return Math.min(98, 68 + Math.round((selectedCount / strongestCount) * 30))
}

export function VendorsPage() {
  const navigate = useNavigate()
  const [pageMode, setPageMode] = useState<'discovery' | 'database'>('discovery')
  const [analysis, setAnalysis] = useState<AnalysisState>('idle')
  const [category, setCategory] = useState<PartnerCategory>('드레스')
  const [selectedStyle, setSelectedStyle] = useState('실크')
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState<SortOption>('style')
  const [coupleId, setCoupleId] = useState('c1')
  const [shortlist, setShortlist] = useState<string[]>([])
  const [favorites, setFavorites] = useState<string[]>([])
  const [proposalSent, setProposalSent] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const { couples, vendors, setRecommendation } = useDemoStore()
  const couple = couples.find((item) => item.id === coupleId) ?? couples[0]

  const liveProfiles = useMemo(() => vendorStyleProfiles.map((profile) => ({ ...profile, vendor: vendors.find((vendor) => vendor.id === profile.vendor.id) ?? profile.vendor })), [vendors])

  const filteredProfiles = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    const profiles = liveProfiles
      .filter((profile) => profile.vendor.category === category)
      .filter((profile) => (profile.styleCounts[selectedStyle] ?? 0) > 0)
      .filter((profile) => !normalizedQuery || `${profile.vendor.name} ${profile.account}`.toLowerCase().includes(normalizedQuery))
    return [...profiles].sort((a, b) => {
      if (sort === 'evidence') return b.sampleCount - a.sampleCount
      if (sort === 'name') return a.vendor.name.localeCompare(b.vendor.name, 'ko')
      return styleMatch(b, selectedStyle) - styleMatch(a, selectedStyle)
    })
  }, [category, liveProfiles, query, selectedStyle, sort])

  const provisionalVendors = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    return vendors.filter((vendor) => vendor.evidenceSource === 'tag' && vendor.category === category && vendor.tags.includes(selectedStyle) && (!normalizedQuery || `${vendor.name} ${vendor.instagram}`.toLowerCase().includes(normalizedQuery))).sort((a, b) => a.name.localeCompare(b.name, 'ko'))
  }, [category, query, selectedStyle, vendors])

  const selectedVendors = shortlist.map((id) => vendors.find((vendor) => vendor.id === id)).filter((vendor): vendor is NonNullable<typeof vendor> => Boolean(vendor))

  const changeCategory = (nextCategory: PartnerCategory) => {
    setCategory(nextCategory)
    setSelectedStyle(vendorStyleTaxonomy[nextCategory][0].label)
  }

  const analyze = () => {
    setAnalysis('analyzing')
    window.setTimeout(() => {
      setAnalysis('done')
      setCategory('드레스')
      setSelectedStyle('실크')
    }, 1800)
  }

  const toggleShortlist = (vendorId: string) => {
    setProposalSent(false)
    setShortlist((current) => current.includes(vendorId) ? current.filter((id) => id !== vendorId) : [...current, vendorId].slice(-3))
  }

  const toggleFavorite = (vendorId: string) => setFavorites((current) => current.includes(vendorId) ? current.filter((id) => id !== vendorId) : [...current, vendorId])
  const openVendor = (vendorId: string) => navigate(`/vendors/${vendorId}`)

  const sendProposal = () => {
    selectedVendors.forEach((vendor) => setRecommendation(coupleId, vendor.id, 'pending'))
    setProposalSent(true)
    window.setTimeout(() => setProposalSent(false), 2800)
  }

  return (
    <div className="page-stack vendors-page vendors-discovery-page">
      <section className="page-intro"><div><p className="eyebrow">Partner workspace</p><h1>업체 찾기</h1><p>스타일 분석으로 추천 후보를 찾고, 제휴업체 정보는 하나의 DB에서 관리하세요.</p></div>{pageMode === 'discovery' ? <Button variant="secondary" icon={<RefreshCcw size={15} />} onClick={() => setAnalysis('idle')}>새 이미지 분석</Button> : <Badge tone="sage">{vendors.length} partners</Badge>}</section>
      <nav className="workspace-switch"><button className={pageMode === 'discovery' ? 'active' : ''} onClick={() => setPageMode('discovery')}><Sparkles size={16} /> 스타일 추천</button><button className={pageMode === 'database' ? 'active' : ''} onClick={() => setPageMode('database')}><Search size={16} /> 업체 DB</button></nav>

      {pageMode === 'database' ? <VendorDatabase /> : <>

      <section className={`ai-studio vendor-vision vendor-vision--${analysis}`}>
        <div className="ai-studio__copy"><div className="ai-kicker"><WandSparkles size={16} /> REFERENCE MATCH</div><h2>레퍼런스 한 장으로<br /><em>스타일 후보 찾기</em></h2><p>이미지를 올리면 동일한 라벨 체계로 분석해 아래 제휴업체 아카이브와 바로 연결합니다.</p><div className="ai-points"><span><Check size={13} /> 드레스 · 실크 / 비즈 / 화려 / 유니크</span><span><Check size={13} /> 스튜디오 · 깔끔함 / 화보 / 자연 / 빈티지</span><span><Check size={13} /> 메이크업 · 과즙 / 깔끔 / 누디 / 강하게</span></div></div>
        <div className="ai-studio__workspace">
          {analysis === 'idle' && <button className="drop-zone" onClick={() => fileRef.current?.click()}><input ref={fileRef} type="file" accept="image/*" hidden onChange={analyze} /><span><UploadCloud size={25} /></span><strong>레퍼런스 이미지를 올려주세요</strong><p>분석된 스타일로 아래 필터가 자동 설정됩니다</p><small>JPG, PNG · 최대 10MB</small></button>}
          {analysis === 'analyzing' && <div className="analyzing-state"><div className="scan-image"><img src={reviewedReferenceImage} alt="라포레 분석 원본 실크 웨딩드레스" /><span /></div><div><div className="pulse-label"><Sparkles size={16} /> 스타일 라벨 분석 중</div><h3>307장의 분류 기준과 비교하고 있어요</h3><ul><li className="done"><Check size={13} /> 카테고리 판별</li><li className="done"><Check size={13} /> 소재와 디테일 인식</li><li><span className="spinner" /> 제휴업체 분포 매칭</li></ul></div></div>}
          {analysis === 'done' && <div className="analysis-result"><div className="analysis-result__image"><img src={reviewedReferenceImage} alt="라포레에서 검수된 실크 웨딩드레스" /><span><Check size={13} /> 분석 완료</span></div><div className="analysis-result__body"><p className="eyebrow">Detected label</p><h3>드레스 · 실크</h3><div className="analysis-score"><span>라벨 확신도</span><strong>94%</strong></div><div className="tag-row tag-row--light"><span>실크</span><span>구조적</span><span>절제된 광택</span></div><p>실크 비중이 높은 제휴업체가 우선 정렬되었습니다.</p></div></div>}
        </div>
      </section>

      <section className="vendor-curation">
        <header className="vendor-curation__header"><div><p className="eyebrow">Planner curation</p><h2>커플 취향으로 직접 찾기</h2><p>분야와 스타일을 선택하면 해당 특징이 실제 포트폴리오에 많이 나타난 업체부터 보여줍니다.</p></div><label><span>제안할 커플</span><select value={coupleId} onChange={(event) => { setCoupleId(event.target.value); setShortlist([]) }}>{couples.map((item) => <option value={item.id} key={item.id}>{item.partners}</option>)}</select></label></header>
        <div className="vendor-curation__grid">
          <Card className="couple-style-brief">
            <div className={`couple-style-brief__mark couple-style-brief__mark--${couple.tone}`}>{couple.initials}</div>
            <span>현재 커플 브리프</span><h3>{couple.partners}</h3><p>{couple.concept}</p>
            <div><small>예식일</small><strong>{couple.weddingDate.replaceAll('-', '. ')}</strong></div>
            <div className="brief-tags"><span>절제된</span><span>자연스러운</span><span>클래식</span></div>
          </Card>
          <div className="style-selector">
            <div className="curation-step"><span>1</span><div><strong>먼저 분야를 선택하세요</strong><small>분야마다 서로 다른 스타일 언어를 사용합니다.</small></div></div>
            <div className="vendor-category-tabs">{categories.map((item) => { const Icon = categoryIcons[item]; return <button key={item} className={category === item ? 'active' : ''} onClick={() => changeCategory(item)}><Icon size={18} /><span>{item}</span><small>{vendorStyleProfiles.filter((profile) => profile.vendor.category === item).length}개 업체</small></button> })}</div>
            <div className="curation-step"><span>2</span><div><strong>원하는 스타일을 고르세요</strong><small>라벨 리뷰에서 실제로 확인된 기준입니다.</small></div></div>
            <div className="vendor-style-options">{vendorStyleTaxonomy[category].map((option) => <button key={option.label} className={selectedStyle === option.label ? 'active' : ''} onClick={() => setSelectedStyle(option.label)}><span><strong>{option.label}</strong><em>{option.count}회 감지</em></span><small>{option.description}</small><i><Check size={12} /></i></button>)}</div>
          </div>
        </div>
      </section>

      <section className="style-vendor-results">
        <div className="style-results-heading"><div><p className="eyebrow">Analyzed partner archive</p><h2><span>{selectedStyle}</span> 스타일 제휴업체</h2><p>{category} 포트폴리오 중 ‘{selectedStyle}’ 라벨이 확인된 업체 {filteredProfiles.length + provisionalVendors.length}곳입니다.</p></div><div className="style-results-stat"><BarChart3 size={18} /><span>근거 이미지</span><strong>{vendorStyleTaxonomy[category].find((item) => item.label === selectedStyle)?.count ?? 0}<em>장면</em></strong></div></div>
        <div className="style-results-toolbar"><label className="search-field"><Search size={16} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="업체명 또는 인스타 계정 검색" /></label><label className="style-sort"><span>정렬</span><select value={sort} onChange={(event) => setSort(event.target.value as SortOption)}><option value="style">스타일 일치도순</option><option value="evidence">분석 이미지 많은순</option><option value="name">업체명순</option></select></label></div>
        <div className="style-vendor-grid">{filteredProfiles.map((profile) => {
          const selected = shortlist.includes(profile.vendor.id)
          const match = styleMatch(profile, selectedStyle)
          const maxCount = Math.max(...Object.values(profile.styleCounts))
          const favorite = favorites.includes(profile.vendor.id)
          return <article className={`style-vendor-card ${selected ? 'style-vendor-card--selected' : ''}`} key={profile.vendor.id} role="link" tabIndex={0} onClick={() => openVendor(profile.vendor.id)} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); openVendor(profile.vendor.id) } }} aria-label={`${profile.vendor.name} 상세 보기`}>
            <div className="style-vendor-card__image"><img src={profile.vendor.image} style={{ objectPosition: profile.vendor.imagePosition }} alt={`${profile.vendor.name} 포트폴리오`} /><div className="style-match-score"><Sparkles size={12} /><strong>{match}%</strong><span>STYLE FIT</span></div><button className={`style-favorite-button ${favorite ? 'active' : ''}`} aria-label={`${profile.vendor.name} ${favorite ? '즐겨찾기 해제' : '즐겨찾기'}`} aria-pressed={favorite} onClick={(event) => { event.stopPropagation(); toggleFavorite(profile.vendor.id) }}><Heart size={16} fill={favorite ? 'currentColor' : 'none'} /></button></div>
            <div className="style-vendor-card__body"><div className="style-vendor-card__meta"><span>{profile.vendor.category} · {profile.vendor.location}</span><em>{profile.profileType}</em></div><h3>{profile.vendor.name}</h3><a href={`https://instagram.com/${profile.account}`} onClick={(event) => { event.preventDefault(); event.stopPropagation() }}>@{profile.account}</a><p>{profile.vendor.summary}</p>
              <div className="style-evidence"><div><span>대표 스타일</span><strong>{profile.primaryStyle} {Math.round(profile.primaryShare * 100)}%</strong></div><div><span>분석 근거</span><strong>{profile.sampleCount}장</strong></div></div>
              <div className="style-distribution">{Object.entries(profile.styleCounts).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([label, count]) => <div key={label} className={label === selectedStyle ? 'is-target' : ''}><span>{label}</span><i><b style={{ width: `${Math.round((count / maxCount) * 100)}%` }} /></i><strong>{count}</strong></div>)}</div>
              <div className="style-vendor-card__actions"><Link to={`/vendors/${profile.vendor.id}`} onClick={(event) => event.stopPropagation()}>상세 보기 <ChevronRight size={13} /></Link><Button size="sm" variant={selected ? 'secondary' : 'primary'} icon={selected ? <CheckCircle2 size={14} /> : undefined} onClick={(event) => { event.stopPropagation(); toggleShortlist(profile.vendor.id) }}>{selected ? '후보에 담김' : '제안 후보 담기'}</Button></div>
            </div>
          </article>
        })}{provisionalVendors.map((vendor) => {
          const selected = shortlist.includes(vendor.id)
          const favorite = favorites.includes(vendor.id)
          return <article className={`style-vendor-card style-vendor-card--provisional ${selected ? 'style-vendor-card--selected' : ''}`} key={vendor.id} role="link" tabIndex={0} onClick={() => openVendor(vendor.id)} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); openVendor(vendor.id) } }} aria-label={`${vendor.name} 상세 보기`}>
            <div className="style-vendor-card__image"><img src={vendor.image} alt={`${vendor.name} 기본 이미지`} /><Badge tone="sage">태그 기반 임시</Badge><button className={`style-favorite-button ${favorite ? 'active' : ''}`} aria-label={`${vendor.name} ${favorite ? '즐겨찾기 해제' : '즐겨찾기'}`} aria-pressed={favorite} onClick={(event) => { event.stopPropagation(); toggleFavorite(vendor.id) }}><Heart size={16} fill={favorite ? 'currentColor' : 'none'} /></button></div>
            <div className="style-vendor-card__body"><div className="style-vendor-card__meta"><span>{vendor.category} · {vendor.location}</span><em>신규 DB</em></div><h3>{vendor.name}</h3><a href={vendor.website || '#'} onClick={(event) => { event.preventDefault(); event.stopPropagation() }}>{vendor.instagram || '계정 미등록'}</a><p>{vendor.summary}</p><div className="tag-row">{vendor.tags.map((tag) => <span key={tag}>#{tag}</span>)}</div><div className="style-vendor-card__actions"><Link to={`/vendors/${vendor.id}`} onClick={(event) => event.stopPropagation()}>상세 보기 <ChevronRight size={13} /></Link><Button size="sm" variant={selected ? 'secondary' : 'primary'} icon={selected ? <CheckCircle2 size={14} /> : undefined} onClick={(event) => { event.stopPropagation(); toggleShortlist(vendor.id) }}>{selected ? '후보에 담김' : '제안 후보 담기'}</Button></div></div>
          </article>
        })}</div>
        {!filteredProfiles.length && !provisionalVendors.length && <Card className="style-results-empty"><Search size={22} /><strong>조건에 맞는 업체가 없습니다.</strong><p>검색어를 지우거나 다른 스타일을 선택해 보세요.</p></Card>}
      </section>

      {selectedVendors.length > 0 && <section className="vendor-shortlist"><div><span className="vendor-shortlist__count">{selectedVendors.length}</span><div><strong>{couple.partners}님에게 제안할 업체</strong><p>최대 3곳까지 비교해 보낼 수 있습니다.</p></div></div><div className="vendor-shortlist__chips">{selectedVendors.map((vendor) => <button key={vendor.id} onClick={() => toggleShortlist(vendor.id)}><span>{vendor.name}</span><small>{vendor.tags[0] ?? '스타일'} 중심</small>×</button>)}</div><Button icon={<Send size={15} />} onClick={sendProposal}>신부에게 제안 보내기</Button></section>}
      {proposalSent && <div className="toast vendor-proposal-toast"><span>✓</span><div><strong>제안이 고객 화면에 전달됐어요.</strong><p>{selectedVendors.map((vendor) => vendor.name).join(', ')}</p></div></div>}
      </>}
    </div>
  )
}
