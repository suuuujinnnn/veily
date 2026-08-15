import { useMemo, useState } from 'react'
import { ArrowLeft, CalendarDays, Camera, ChevronRight, CircleAlert, Clock3, Heart, Images, Lightbulb, MapPin, Phone, Plus, Sparkles } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { useDemoStore } from '../../app/store'
import { Badge, Modal } from '../../components/ui'
import { VendorInsightsPanel } from '../reviews/VendorInsightsPanel'
import { formatFactValue, operationalFacts } from './vendorInfoUtils'
import { useInstagramPortfolio } from './useInstagramPortfolio'

export function VendorDetailPage() {
  const { vendorId = 'v1' } = useParams()
  const { vendors, vendorInsights, favoriteVendorIds, toggleFavoriteVendor } = useDemoStore()
  const vendor = vendors.find((item) => item.id === vendorId) ?? vendors[0]
  const [portfolioOpen, setPortfolioOpen] = useState(false)
  const [insightsOpen, setInsightsOpen] = useState(false)
  const { portfolio } = useInstagramPortfolio(vendor)
  const portfolioImages = useMemo(() => {
    const images = [...vendor.gallery, ...portfolio.media.map((item) => item.imageUrl)]
    return [...new Set(images)]
  }, [portfolio.media, vendor.gallery])
  const facts = operationalFacts(vendor)
  const insights = vendorInsights.filter((insight) => insight.vendorId === vendor.id).sort((a, b) => b.createdAt.localeCompare(a.createdAt))

  return (
    <div className="page-stack vendor-detail-page">
      <div className="vendor-detail-topline">
        <Link className="back-link" to="/vendors?view=database"><ArrowLeft size={15} /> 파트너 업체</Link>
        <div><button className={`style-favorite-button vendor-detail-favorite ${favoriteVendorIds.includes(vendor.id) ? 'active' : ''}`} onClick={() => toggleFavoriteVendor(vendor.id)} aria-label="즐겨찾기 변경"><Heart size={16} fill={favoriteVendorIds.includes(vendor.id) ? 'currentColor' : 'none'} /></button><span>분석 데이터</span><strong>{vendor.activeEvent}</strong><Sparkles size={15} /></div>
      </div>

      <section className="vendor-detail-hero">
        <div className="vendor-detail-hero__copy">
          <div><Badge tone="rose">VEILY PARTNER</Badge><span>{vendor.category} · {vendor.location}</span></div>
          <h1>{vendor.name}</h1>
          <p>{vendor.summary}</p>
          <div className="tag-row">{vendor.tags.map((tag) => <span key={tag}>{tag}</span>)}</div>
          <div className="vendor-hero-contact-grid">
            <article><MapPin size={15} /><div><span>위치</span><strong>{vendor.address}</strong></div></article>
            <article><Clock3 size={15} /><div><span>운영 시간</span><strong>{vendor.hours}</strong></div></article>
            <article><Phone size={15} /><div><span>예약 문의</span><strong>{vendor.phone}</strong></div></article>
            <article><CalendarDays size={15} /><div><span>예상 금액</span><strong>{vendor.priceRange}</strong></div></article>
          </div>
          {(facts.length > 0 || insights.length > 0) && <div className="vendor-hero-facts"><div><span>실무 정보</span><button onClick={() => setInsightsOpen(true)}>전체 보기·정보 공유 <ChevronRight size={12} /></button></div>{facts.length > 0 && <dl>{facts.map(({ label, fact }) => <div key={label}><dt>{label}</dt><dd>{formatFactValue(fact.value)}</dd></div>)}</dl>}{insights.slice(0, 1).map((insight) => <article className="vendor-hero-insight" key={insight.id}><div><strong>{insight.title}</strong><small>{insight.category} · {insight.createdAt.slice(0, 10).replaceAll('-', '.')}</small></div><p><Lightbulb size={12} /><span><b>특장점</b>{insight.highlights}</span></p><p><CircleAlert size={12} /><span><b>유의할 점</b>{insight.considerations}</span></p></article>)}</div>}
          {vendor.memo && <p className="vendor-hero-memo"><strong>플래너 메모</strong>{vendor.memo}</p>}
        </div>
        <div className="vendor-gallery-mosaic">
          <figure className="vendor-gallery-mosaic__main"><img src={vendor.gallery[0]} alt={`${vendor.name} 포트폴리오 1`} /></figure>
          <figure><img src={vendor.gallery[1]} alt={`${vendor.name} 포트폴리오 2`} /></figure>
          <figure className="vendor-gallery-mosaic__more"><img src={vendor.gallery[2]} alt={`${vendor.name} 포트폴리오 3`} /><button onClick={() => setPortfolioOpen(true)} aria-label={`${vendor.name} 전체 포트폴리오 보기`}><Plus size={24} /><span>전체 포트폴리오</span></button></figure>
          <span><Camera size={15} /> {vendor.instagram}</span>
        </div>
      </section>

      <Modal open={portfolioOpen} onClose={() => setPortfolioOpen(false)} title={`${vendor.name} 전체 포트폴리오`} eyebrow="Recent portfolio">
        <div className="vendor-portfolio-modal__summary"><Images size={17} /><span>최근 포트폴리오 {portfolioImages.length}장</span><small>{vendor.instagram}</small></div>
        <div className="vendor-portfolio-modal__grid">{portfolioImages.map((image, index) => <figure key={`${image}-${index}`}><img src={image} alt={`${vendor.name} 포트폴리오 ${index + 1}`} loading="lazy" /></figure>)}</div>
      </Modal>
      <Modal open={insightsOpen} onClose={() => setInsightsOpen(false)} title={`${vendor.name} 실무 정보`} eyebrow="Operational insights">
        <VendorInsightsPanel availableVendors={vendors} vendorId={vendor.id} canWrite title="실무 정보" description="업체 운영 조건과 인증 플래너가 현장에서 확인한 특장점·유의사항을 함께 관리합니다." embedded />
      </Modal>

    </div>
  )
}
