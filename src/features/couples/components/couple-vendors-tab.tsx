import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Badge, Button, Card } from '../../../components/ui'
import type { Recommendation, RecommendationStatus, Vendor } from '../../../types'

export function CoupleVendorsTab({
  coupleId,
  vendors,
  recommendations,
  recommendedVendors,
  onSetRecommendation,
}: {
  coupleId: string
  vendors: Vendor[]
  recommendations: Recommendation[]
  recommendedVendors: Array<Recommendation & { vendor?: Vendor }>
  onSetRecommendation: (coupleId: string, vendorId: string, status: RecommendationStatus) => void
}) {
  const [vendorToAdd, setVendorToAdd] = useState('')

  return (
    <div className="recommended-workspace">
      <section className="section-heading">
        <div><p className="eyebrow">추천 업체</p><h2>추천 업체</h2><p className="muted">업체를 추가하면 이 부부의 추천 목록에 바로 반영됩니다.</p></div>
        <div className="vendor-add-control"><select value={vendorToAdd} onChange={(event) => setVendorToAdd(event.target.value)}><option value="">업체 선택</option>{vendors.filter((vendor) => !recommendations.some((item) => item.coupleId === coupleId && item.vendorId === vendor.id)).map((vendor) => <option value={vendor.id} key={vendor.id}>{vendor.name} · {vendor.category}</option>)}</select><button className="primary-btn" disabled={!vendorToAdd} onClick={() => { onSetRecommendation(coupleId, vendorToAdd, 'pending'); setVendorToAdd('') }}><Plus size={15} /> 추천 업체 추가</button></div>
      </section>
      <div className="recommended-grid">{recommendedVendors.length ? recommendedVendors.map(({ vendor, status }) => vendor && <article className="vendor-mini-card" key={vendor.id}><img src={vendor.image} style={{ objectPosition: vendor.imagePosition }} alt="" /><div><Badge tone="rose">{vendor.match}% 매칭</Badge><h3>{vendor.name}</h3><p>{vendor.summary}</p><div className="vendor-mini-card__status"><span>고객 응답</span><strong>{status === 'liked' ? '좋아요' : status === 'hold' ? '보류' : '응답 대기'}</strong></div></div></article>) : <Card><p>아직 추천 업체가 없습니다.</p></Card>}</div>
    </div>
  )
}
