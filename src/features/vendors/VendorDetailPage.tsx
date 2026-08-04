import { ArrowLeft, CalendarDays, Camera, Clock3, ExternalLink, MapPin, Phone, Send, Sparkles } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { useDemoStore } from '../../app/store'
import { Badge, Button } from '../../components/ui'
import { vendors } from '../../data/mockData'
import { VendorScheduleBoard } from './VendorScheduleBoard'

export function VendorDetailPage() {
  const { vendorId = 'v1' } = useParams()
  const vendor = vendors.find((item) => item.id === vendorId) ?? vendors[0]
  const { recommendations, setRecommendation } = useDemoStore()
  const recommended = recommendations.some((item) => item.coupleId === 'c1' && item.vendorId === vendor.id)

  return (
    <div className="page-stack vendor-detail-page">
      <div className="vendor-detail-topline">
        <Link className="back-link" to="/vendors"><ArrowLeft size={15} /> 파트너 업체</Link>
        <div><span>현재 진행 중</span><strong>{vendor.activeEvent}</strong><Sparkles size={15} /></div>
      </div>

      <section className="vendor-detail-hero">
        <div className="vendor-detail-hero__copy">
          <div><Badge tone="rose">VEILY PARTNER</Badge><span>{vendor.category} · {vendor.location}</span></div>
          <h1>{vendor.name}</h1>
          <p>{vendor.summary}</p>
          <div className="tag-row">{vendor.tags.map((tag) => <span key={tag}>{tag}</span>)}</div>
          <div className="vendor-detail-actions">
            <Button icon={<Send size={15} />} onClick={() => setRecommendation('c1', vendor.id, recommended ? 'pending' : 'liked')}>{recommended ? '추천 목록에 담김' : '서윤 & 도현에게 추천'}</Button>
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

      <section className="instagram-portfolio">
        <header><div><p className="eyebrow">Instagram portfolio</p><h2>최근 포트폴리오</h2></div><span><Camera size={15} /> {vendor.instagram}에서 가져온 목업 피드</span></header>
        <div>{[...vendor.gallery, ...vendor.gallery].map((image, index) => <figure key={`${image}-${index}`}><img src={image} alt={`${vendor.name} 인스타그램 포트폴리오 ${index + 1}`} /><span><Camera size={14} /></span></figure>)}</div>
      </section>

      <VendorScheduleBoard vendor={vendor} />
    </div>
  )
}
