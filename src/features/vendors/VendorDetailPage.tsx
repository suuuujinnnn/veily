import { useMemo, useState } from 'react'
import { ArrowLeft, CalendarDays, Camera, Clock3, Heart, Images, MapPin, Phone, Plus, Sparkles } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { useDemoStore } from '../../app/store'
import { Badge, Modal } from '../../components/ui'
import { VendorInsightsPanel } from '../reviews/VendorInsightsPanel'
import { formatFactValue, operationalFacts } from './vendorInfoUtils'
import { useInstagramPortfolio } from './useInstagramPortfolio'

export function VendorDetailPage() {
  const { vendorId = 'v1' } = useParams()
  const { vendors, favoriteVendorIds, toggleFavoriteVendor } = useDemoStore()
  const vendor = vendors.find((item) => item.id === vendorId) ?? vendors[0]
  const [portfolioOpen, setPortfolioOpen] = useState(false)
  const { portfolio } = useInstagramPortfolio(vendor)
  const portfolioImages = useMemo(() => {
    const images = [...vendor.gallery, ...portfolio.media.map((item) => item.imageUrl)]
    return [...new Set(images)]
  }, [portfolio.media, vendor.gallery])
  const facts = operationalFacts(vendor)

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
          {vendor.memo && <p className="vendor-hero-memo"><strong>플래너 메모</strong>{vendor.memo}</p>}
        </div>
        <div className="vendor-gallery-mosaic">
          <figure className="vendor-gallery-mosaic__main"><img src={vendor.gallery[0]} alt={`${vendor.name} 포트폴리오 1`} /></figure>
          <figure><img src={vendor.gallery[1]} alt={`${vendor.name} 포트폴리오 2`} /></figure>
          <figure className="vendor-gallery-mosaic__more"><img src={vendor.gallery[2]} alt={`${vendor.name} 포트폴리오 3`} /><button onClick={() => setPortfolioOpen(true)} aria-label={`${vendor.name} 전체 포트폴리오 보기`}><Plus size={24} /><span>전체 포트폴리오</span></button></figure>
          <span><Camera size={15} /> {vendor.instagram}</span>
        </div>
      </section>

      {facts.length > 0 && <section className="vendor-detail-operational">
        <header><div><p className="eyebrow">실무 정보</p><h2>상담 전에 확인할 운영 조건</h2></div></header>
        {facts.length > 0 && <dl>{facts.map(({ label, fact }) => <div key={label}><dt>{label}</dt><dd>{formatFactValue(fact.value)}</dd><small>{fact.verifiedAt.replaceAll('-', '.')} 확인</small></div>)}</dl>}
      </section>}

      <VendorInsightsPanel availableVendors={vendors} vendorId={vendor.id} canWrite title="플래너 라운지 게시글" description="이 업체를 실제로 진행한 플래너들이 공유한 최근 경험과 실무 팁입니다." />

      <Modal open={portfolioOpen} onClose={() => setPortfolioOpen(false)} title={`${vendor.name} 전체 포트폴리오`} eyebrow="Recent portfolio">
        <div className="vendor-portfolio-modal__summary"><Images size={17} /><span>최근 포트폴리오 {portfolioImages.length}장</span><small>{vendor.instagram}</small></div>
        <div className="vendor-portfolio-modal__grid">{portfolioImages.map((image, index) => <figure key={`${image}-${index}`}><img src={image} alt={`${vendor.name} 포트폴리오 ${index + 1}`} loading="lazy" /></figure>)}</div>
      </Modal>
    </div>
  )
}
