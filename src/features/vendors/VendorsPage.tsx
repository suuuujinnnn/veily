import { useRef, useState } from 'react'
import { Check, ChevronRight, ImagePlus, RefreshCcw, Search, SlidersHorizontal, Sparkles, UploadCloud, WandSparkles } from 'lucide-react'
import { useDemoStore } from '../../app/store'
import { Badge, Button, Card } from '../../components/ui'
import { vendors } from '../../data/mockData'
import { imageAssets } from '../../assets/images'

type AnalysisState = 'idle' | 'analyzing' | 'done'

export function VendorsPage() {
  const [analysis, setAnalysis] = useState<AnalysisState>('idle')
  const [category, setCategory] = useState('전체')
  const [query, setQuery] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)
  const { recommendations, setRecommendation } = useDemoStore()
  const filtered = vendors.filter((vendor) => (category === '전체' || vendor.category === category) && vendor.name.includes(query))

  const analyze = () => {
    setAnalysis('analyzing')
    window.setTimeout(() => setAnalysis('done'), 1800)
  }
  const recommend = (vendorId: string) => {
    const current = recommendations.find((item) => item.coupleId === 'c1' && item.vendorId === vendorId)
    setRecommendation('c1', vendorId, current ? (current.status === 'pending' ? 'liked' : 'pending') : 'pending')
  }

  return (
    <div className="page-stack vendors-page">
      <section className="page-intro"><div><p className="eyebrow">Curated for your couple</p><h1>업체 찾기</h1><p>사진 한 장에서 취향의 결을 읽고, 가장 잘 맞는 업체를 찾아보세요.</p></div><Button variant="secondary" icon={<RefreshCcw size={15} />} onClick={() => setAnalysis('idle')}>새 분석</Button></section>
      <section className={`ai-studio ai-studio--${analysis}`}>
        <div className="ai-studio__copy"><div className="ai-kicker"><WandSparkles size={16} /> VEILY VISION</div><h2>보이는 취향을,<br /><em>검색 가능한 언어로.</em></h2><p>레퍼런스 이미지를 올리면 스타일, 소재, 분위기를 분석해 비슷한 업체를 찾아드려요.</p><div className="ai-points"><span><Check size={13} /> 드레스 소재와 실루엣</span><span><Check size={13} /> 스튜디오 빛과 분위기</span><span><Check size={13} /> 메이크업 무드</span></div></div>
        <div className="ai-studio__workspace">
          {analysis === 'idle' && <button className="drop-zone" onClick={() => fileRef.current?.click()}><input ref={fileRef} type="file" accept="image/*" hidden onChange={analyze} /><span><UploadCloud size={25} /></span><strong>레퍼런스 이미지를 올려주세요</strong><p>클릭하거나 파일을 이곳에 드래그하세요</p><small>JPG, PNG · 최대 10MB</small></button>}
          {analysis === 'analyzing' && <div className="analyzing-state"><div className="scan-image"><img src={imageAssets.atelierDress} alt="분석할 실크 웨딩드레스" /><span /></div><div><div className="pulse-label"><Sparkles size={16} /> 이미지를 읽고 있어요</div><h3>디테일에서 취향을 발견하는 중...</h3><ul><li className="done"><Check size={13} /> 실루엣 분석</li><li className="done"><Check size={13} /> 소재 인식</li><li><span className="spinner" /> 무드 태그 생성</li></ul></div></div>}
          {analysis === 'done' && <div className="analysis-result"><div className="analysis-result__image"><img src={imageAssets.atelierDress} alt="분석된 실크 웨딩드레스" /><span><Check size={13} /> 분석 완료</span></div><div className="analysis-result__body"><p className="eyebrow">Detected style</p><h3>절제된 실크 클래식</h3><div className="analysis-score"><span>취향 선명도</span><strong>94%</strong></div><div className="tag-row tag-row--light"><span>미카도 실크</span><span>A라인</span><span>구조적</span><span>미니멀</span></div><p>광택이 절제된 실크와 구조적인 네크라인을 선호하는 취향이에요.</p></div></div>}
        </div>
      </section>
      <section className="vendor-browser">
        <div className="section-heading"><div><p className="eyebrow">Vendor archive</p><h2>{analysis === 'done' ? '분석 결과와 닮은 업체' : '파트너 업체 둘러보기'}</h2></div><span className="result-count">{filtered.length}곳</span></div>
        <div className="vendor-toolbar"><label className="search-field"><Search size={16} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="업체명 검색" /></label><div className="filter-tabs">{['전체','드레스','스튜디오','메이크업'].map((item) => <button className={category === item ? 'active' : ''} onClick={() => setCategory(item)} key={item}>{item}</button>)}</div><button className="outline-icon-button"><SlidersHorizontal size={15} /> 필터</button></div>
        <div className="vendor-grid">{filtered.map((vendor) => { const isRecommended = recommendations.some((item) => item.coupleId === 'c1' && item.vendorId === vendor.id); return <Card padding="none" className="vendor-card" key={vendor.id}><div className="vendor-card__image"><img src={vendor.image} style={{ objectPosition: vendor.imagePosition }} alt={`${vendor.name} 이미지`} /><Badge tone="dark"><Sparkles size={11} /> {vendor.match}% MATCH</Badge><button aria-label="이미지 더 보기"><ImagePlus size={16} /></button></div><div className="vendor-card__body"><div className="vendor-card__top"><span>{vendor.category} · {vendor.location}</span><strong>{vendor.priceRange}</strong></div><h3>{vendor.name}</h3><p>{vendor.summary}</p><div className="tag-row">{vendor.tags.map((tag) => <span key={tag}>{tag}</span>)}</div><div className="vendor-card__actions"><button>상세 보기 <ChevronRight size={13} /></button><Button size="sm" variant={isRecommended ? 'secondary' : 'primary'} onClick={() => recommend(vendor.id)}>{isRecommended ? '추천에 담김' : '서윤 & 도현에게 추천'}</Button></div></div></Card>})}</div>
      </section>
    </div>
  )
}
