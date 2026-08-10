import { useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { BarChart3, Brush, Camera, Check, CheckCircle2, ChevronRight, Gem, ImagePlus, RefreshCcw, Search, Send, Sparkles, UploadCloud, WandSparkles } from 'lucide-react'
import { useDemoStore } from '../../app/store'
import { Button, Card } from '../../components/ui'
import { couples as initialCouples } from '../../data/mockData'
import { vendorStyleProfiles, vendorStyleTaxonomy, type PartnerCategory, type VendorStyleProfile } from '../../data/vendorStyleData'
import { imageAssets } from '../../assets/images'

type AnalysisState = 'idle' | 'analyzing' | 'done'
type SortOption = 'style' | 'evidence' | 'name'

const categories: PartnerCategory[] = ['드레스', '스튜디오', '메이크업']
const categoryIcons = { 드레스: Gem, 스튜디오: Camera, 메이크업: Brush }

function styleMatch(profile: VendorStyleProfile, selectedStyle: string) {
  const selectedCount = profile.styleCounts[selectedStyle] ?? 0
  const strongestCount = Math.max(...Object.values(profile.styleCounts))
  if (!selectedCount) return 0
  return Math.min(98, 68 + Math.round((selectedCount / strongestCount) * 30))
}

export function VendorsPage() {
  const [analysis, setAnalysis] = useState<AnalysisState>('idle')
  const [category, setCategory] = useState<PartnerCategory>('드레스')
  const [selectedStyle, setSelectedStyle] = useState('실크')
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState<SortOption>('style')
  const [coupleId, setCoupleId] = useState('c1')
  const [shortlist, setShortlist] = useState<string[]>([])
  const [proposalSent, setProposalSent] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const { couples: storedCouples, setRecommendation } = useDemoStore()
  const couple = storedCouples.find((item) => item.id === coupleId) ?? initialCouples[0]

  const filteredProfiles = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    const profiles = vendorStyleProfiles
      .filter((profile) => profile.vendor.category === category)
      .filter((profile) => (profile.styleCounts[selectedStyle] ?? 0) > 0)
      .filter((profile) => !normalizedQuery || `${profile.vendor.name} ${profile.account}`.toLowerCase().includes(normalizedQuery))
    return [...profiles].sort((a, b) => {
      if (sort === 'evidence') return b.sampleCount - a.sampleCount
      if (sort === 'name') return a.vendor.name.localeCompare(b.vendor.name, 'ko')
      return styleMatch(b, selectedStyle) - styleMatch(a, selectedStyle)
    })
  }, [category, query, selectedStyle, sort])

  const selectedProfiles = shortlist
    .map((id) => vendorStyleProfiles.find((profile) => profile.vendor.id === id))
    .filter((profile): profile is VendorStyleProfile => Boolean(profile))

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

  const sendProposal = () => {
    selectedProfiles.forEach((profile) => setRecommendation(coupleId, profile.vendor.id, 'pending'))
    setProposalSent(true)
    window.setTimeout(() => setProposalSent(false), 2800)
  }

  return (
    <div className="page-stack vendors-page vendors-discovery-page">
      <section className="page-intro"><div><p className="eyebrow">Style intelligence · 307 references</p><h1>업체 찾기</h1><p>실제 포트폴리오에서 분석한 스타일 분포를 기준으로 커플에게 맞는 제휴업체를 고르세요.</p></div><Button variant="secondary" icon={<RefreshCcw size={15} />} onClick={() => setAnalysis('idle')}>새 이미지 분석</Button></section>

      <section className={`ai-studio vendor-vision vendor-vision--${analysis}`}>
        <div className="ai-studio__copy"><div className="ai-kicker"><WandSparkles size={16} /> REFERENCE MATCH</div><h2>레퍼런스 한 장으로<br /><em>스타일 후보 찾기</em></h2><p>이미지를 올리면 동일한 라벨 체계로 분석해 아래 제휴업체 아카이브와 바로 연결합니다.</p><div className="ai-points"><span><Check size={13} /> 드레스 · 실크 / 비즈 / 화려 / 유니크</span><span><Check size={13} /> 스튜디오 · 깔끔함 / 화보 / 자연 / 빈티지</span><span><Check size={13} /> 메이크업 · 과즙 / 깔끔 / 누디 / 강하게</span></div></div>
        <div className="ai-studio__workspace">
          {analysis === 'idle' && <button className="drop-zone" onClick={() => fileRef.current?.click()}><input ref={fileRef} type="file" accept="image/*" hidden onChange={analyze} /><span><UploadCloud size={25} /></span><strong>레퍼런스 이미지를 올려주세요</strong><p>분석된 스타일로 아래 필터가 자동 설정됩니다</p><small>JPG, PNG · 최대 10MB</small></button>}
          {analysis === 'analyzing' && <div className="analyzing-state"><div className="scan-image"><img src={imageAssets.atelierDress} alt="분석할 실크 웨딩드레스" /><span /></div><div><div className="pulse-label"><Sparkles size={16} /> 스타일 라벨 분석 중</div><h3>307장의 분류 기준과 비교하고 있어요</h3><ul><li className="done"><Check size={13} /> 카테고리 판별</li><li className="done"><Check size={13} /> 소재와 디테일 인식</li><li><span className="spinner" /> 제휴업체 분포 매칭</li></ul></div></div>}
          {analysis === 'done' && <div className="analysis-result"><div className="analysis-result__image"><img src={imageAssets.atelierDress} alt="분석된 실크 웨딩드레스" /><span><Check size={13} /> 분석 완료</span></div><div className="analysis-result__body"><p className="eyebrow">Detected label</p><h3>드레스 · 실크</h3><div className="analysis-score"><span>라벨 확신도</span><strong>94%</strong></div><div className="tag-row tag-row--light"><span>실크</span><span>구조적</span><span>절제된 광택</span></div><p>실크 비중이 높은 제휴업체가 우선 정렬되었습니다.</p></div></div>}
        </div>
      </section>

      <section className="vendor-curation">
        <header className="vendor-curation__header"><div><p className="eyebrow">Planner curation</p><h2>커플 취향으로 직접 찾기</h2><p>분야와 스타일을 선택하면 해당 특징이 실제 포트폴리오에 많이 나타난 업체부터 보여줍니다.</p></div><label><span>제안할 커플</span><select value={coupleId} onChange={(event) => { setCoupleId(event.target.value); setShortlist([]) }}>{storedCouples.map((item) => <option value={item.id} key={item.id}>{item.partners}</option>)}</select></label></header>
        <div className="vendor-curation__grid">
          <Card className="couple-style-brief">
            <div className={`couple-style-brief__mark couple-style-brief__mark--${couple.tone}`}>{couple.initials}</div>
            <span>현재 커플 브리프</span><h3>{couple.partners}</h3><p>{couple.concept}</p>
            <div><small>예식일</small><strong>{couple.weddingDate.replaceAll('-', '. ')}</strong></div>
            <div className="brief-tags"><span>절제된</span><span>자연스러운</span><span>클래식</span></div>
          </Card>
          <div className="style-selector">
            <div className="curation-step"><span>1</span><div><strong>먼저 분야를 선택하세요</strong><small>분야마다 서로 다른 스타일 언어를 사용합니다.</small></div></div>
            <div className="vendor-category-tabs">{categories.map((item) => { const Icon = categoryIcons[item as keyof typeof categoryIcons]; return <button key={item} className={category === item ? 'active' : ''} onClick={() => changeCategory(item)}><Icon size={18} /><span>{item}</span><small>{vendorStyleProfiles.filter((profile) => profile.vendor.category === item).length}개 업체</small></button> })}</div>
            <div className="curation-step"><span>2</span><div><strong>원하는 스타일을 고르세요</strong><small>라벨 리뷰에서 실제로 확인된 기준입니다.</small></div></div>
            <div className="vendor-style-options">{vendorStyleTaxonomy[category].map((option) => <button key={option.label} className={selectedStyle === option.label ? 'active' : ''} onClick={() => setSelectedStyle(option.label)}><span><strong>{option.label}</strong><em>{option.count}회 감지</em></span><small>{option.description}</small><i><Check size={12} /></i></button>)}</div>
          </div>
        </div>
      </section>

      <section className="style-vendor-results">
        <div className="style-results-heading"><div><p className="eyebrow">Analyzed partner archive</p><h2><span>{selectedStyle}</span> 스타일 제휴업체</h2><p>{category} 포트폴리오 중 ‘{selectedStyle}’ 라벨이 확인된 업체 {filteredProfiles.length}곳입니다.</p></div><div className="style-results-stat"><BarChart3 size={18} /><span>근거 이미지</span><strong>{vendorStyleTaxonomy[category].find((item) => item.label === selectedStyle)?.count ?? 0}<em>장면</em></strong></div></div>
        <div className="style-results-toolbar"><label className="search-field"><Search size={16} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="업체명 또는 인스타 계정 검색" /></label><label className="style-sort"><span>정렬</span><select value={sort} onChange={(event) => setSort(event.target.value as SortOption)}><option value="style">스타일 일치도순</option><option value="evidence">분석 이미지 많은순</option><option value="name">업체명순</option></select></label></div>
        <div className="style-vendor-grid">{filteredProfiles.map((profile) => {
          const selected = shortlist.includes(profile.vendor.id)
          const match = styleMatch(profile, selectedStyle)
          const maxCount = Math.max(...Object.values(profile.styleCounts))
          return <article className={`style-vendor-card ${selected ? 'style-vendor-card--selected' : ''}`} key={profile.vendor.id}>
            <div className="style-vendor-card__image"><img src={profile.vendor.image} style={{ objectPosition: profile.vendor.imagePosition }} alt={`${profile.vendor.name} 포트폴리오`} /><div className="style-match-score"><Sparkles size={12} /><strong>{match}%</strong><span>STYLE FIT</span></div><Link to={`/vendors/${profile.vendor.id}`} aria-label={`${profile.vendor.name} 포트폴리오 상세`}><ImagePlus size={16} /></Link></div>
            <div className="style-vendor-card__body"><div className="style-vendor-card__meta"><span>{profile.vendor.category} · {profile.vendor.location}</span><em>{profile.profileType}</em></div><h3>{profile.vendor.name}</h3><a href={`https://instagram.com/${profile.account}`} onClick={(event) => event.preventDefault()}>@{profile.account}</a><p>{profile.vendor.summary}</p>
              <div className="style-evidence"><div><span>대표 스타일</span><strong>{profile.primaryStyle} {Math.round(profile.primaryShare * 100)}%</strong></div><div><span>분석 근거</span><strong>{profile.sampleCount}장</strong></div></div>
              <div className="style-distribution">{Object.entries(profile.styleCounts).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([label, count]) => <div key={label} className={label === selectedStyle ? 'is-target' : ''}><span>{label}</span><i><b style={{ width: `${Math.round((count / maxCount) * 100)}%` }} /></i><strong>{count}</strong></div>)}</div>
              <div className="style-vendor-card__actions"><Link to={`/vendors/${profile.vendor.id}`}>상세 보기 <ChevronRight size={13} /></Link><Button size="sm" variant={selected ? 'secondary' : 'primary'} icon={selected ? <CheckCircle2 size={14} /> : undefined} onClick={() => toggleShortlist(profile.vendor.id)}>{selected ? '후보에 담김' : '업체 후보군에 넣기'}</Button></div>
            </div>
          </article>
        })}</div>
        {!filteredProfiles.length && <Card className="style-results-empty"><Search size={22} /><strong>조건에 맞는 업체가 없습니다.</strong><p>검색어를 지우거나 다른 스타일을 선택해 보세요.</p></Card>}
      </section>

      {selectedProfiles.length > 0 && <section className="vendor-shortlist"><div><span className="vendor-shortlist__count">{selectedProfiles.length}</span><div><strong>{couple.partners}님에게 제안할 업체</strong><p>최대 3곳까지 비교해 보낼 수 있습니다.</p></div></div><div className="vendor-shortlist__chips">{selectedProfiles.map((profile) => <button key={profile.vendor.id} onClick={() => toggleShortlist(profile.vendor.id)}><span>{profile.vendor.name}</span><small>{profile.primaryStyle} 중심</small>×</button>)}</div><Button icon={<Send size={15} />} onClick={sendProposal}>선택한 부부의 추천 업체에 추가</Button></section>}
      {proposalSent && <div className="toast vendor-proposal-toast"><span>✓</span><div><strong>제안이 고객 화면에 전달됐어요.</strong><p>{selectedProfiles.map((profile) => profile.vendor.name).join(', ')}</p></div></div>}
    </div>
  )
}
