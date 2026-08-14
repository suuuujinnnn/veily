import { ArrowLeft, CalendarDays, Camera, Clock3, ExternalLink, Heart, MapPin, Phone, Send, Sparkles } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { useDemoStore } from '../../app/store'
import { Badge, Button, Card } from '../../components/ui'
import { VendorScheduleBoard } from './VendorScheduleBoard'
import { InstagramPortfolio } from './InstagramPortfolio'
import { VendorInsightsPanel } from '../reviews/VendorInsightsPanel'
import { VendorDetailFacts } from './VendorDetailFacts'

export function VendorDetailPage() {
  const { vendorId = 'v1' } = useParams()
  const { vendors, recommendations, favoriteVendorIds, setRecommendation, toggleFavoriteVendor } = useDemoStore()
  const vendor = vendors.find((item) => item.id === vendorId) ?? vendors[0]
  const recommended = recommendations.some((item) => item.coupleId === 'c1' && item.vendorId === vendor.id)

  return (
    <div className="page-stack vendor-detail-page">
      <div className="vendor-detail-topline">
        <Link className="back-link" to="/vendor-database"><ArrowLeft size={15} /> 파트너 업체</Link>
        <div><button className={`style-favorite-button vendor-detail-favorite ${favoriteVendorIds.includes(vendor.id) ? 'active' : ''}`} onClick={() => toggleFavoriteVendor(vendor.id)} aria-label="즐겨찾기 변경"><Heart size={16} fill={favoriteVendorIds.includes(vendor.id) ? 'currentColor' : 'none'} /></button><span>분석 데이터</span><strong>{vendor.activeEvent}</strong><Sparkles size={15} /></div>
      </div>

      <section className="vendor-detail-hero">
        <div className="vendor-detail-hero__copy">
          <div><Badge tone="rose">VEILY PARTNER</Badge><span>{vendor.category} · {vendor.location}</span></div>
          <h1>{vendor.name}</h1>
          <p>{vendor.summary}</p>
          <div className="tag-row">{vendor.tags.map((tag) => <span key={tag}>{tag}</span>)}</div>
          <div className="vendor-detail-actions">
            <Button icon={<Send size={15} />} onClick={() => setRecommendation('c1', vendor.id, 'pending')}>{recommended ? '추천 목록에 담김' : '서윤 & 도현에게 추천'}</Button>
            <Link to="/portal/c1/calendar" target="_blank"><Button variant="secondary" icon={<ExternalLink size={15} />}>고객 일정 화면</Button></Link>
          </div>
        </div>
        <div className="vendor-gallery-mosaic">
          <figure className="vendor-gallery-mosaic__main"><img src={vendor.gallery[0]} alt={`${vendor.name} 포트폴리오 1`} /></figure>
          <figure><img src={vendor.gallery[1]} alt={`${vendor.name} 포트폴리오 2`} /></figure>
          <figure><img src={vendor.gallery[2]} alt={`${vendor.name} 포트폴리오 3`} /></figure>
          <span><Camera size={15} /> {vendor.instagram}</span>
        </div>
      </section>

      <section className="vendor-info-strip">
        <article><MapPin size={18} /><div><span>위치</span><strong>{vendor.address}</strong></div></article>
        <article><Clock3 size={18} /><div><span>운영 시간</span><strong>{vendor.hours}</strong></div></article>
        <article><Phone size={18} /><div><span>예약 문의</span><strong>{vendor.phone}</strong></div></article>
        <article><CalendarDays size={18} /><div><span>예상 금액</span><strong>{vendor.priceRange}</strong></div></article>
      </section>

      <section className="vendor-style-section"><div className="section-heading"><div><p className="eyebrow">Style profile</p><h2>스타일 정보</h2><p>포트폴리오 분석과 레퍼런스 분류를 바탕으로 정리한 분위기와 콘셉트입니다.</p></div></div><Card><div className="tag-row">{vendor.tags.map((tag) => <span key={tag}>#{tag}</span>)}</div><p>{vendor.summary}</p></Card></section>

      <VendorDetailFacts vendor={vendor} />

      <InstagramPortfolio key={vendor.id} vendor={vendor} />

      <VendorInsightsPanel availableVendors={vendors} vendorId={vendor.id} canWrite title={`${vendor.name} 실무 정보`} description="인증 플래너가 현장에서 확인한 특장점과 유의할 점입니다. 고객 포털에도 동일하게 공유됩니다." />

      <VendorScheduleBoard vendor={vendor} />
    </div>
  )
}
