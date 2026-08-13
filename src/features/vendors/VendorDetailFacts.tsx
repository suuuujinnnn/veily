import { Check, Info, Minus } from 'lucide-react'
import { Badge, Card } from '../../components/ui'
import type { Vendor } from '../../types'
import { formatFactValue, isStaleDate, operationalFacts } from './vendorInfoUtils'

export function VendorDetailFacts({ vendor }: { vendor: Vendor }) {
  const facts = operationalFacts(vendor)
  if (!facts.length) return null

  return <section className="vendor-detail-facts"><div className="section-heading"><div><p className="eyebrow">Operational details</p><h2>{vendor.category} 실무정보</h2><p>전체 업데이트 {vendor.updatedAt.replaceAll('-', '.')} · 상담 전 조건을 확인하세요.</p></div><Info size={20} /></div>{isStaleDate(vendor.updatedAt) && <div className="vendor-stale-alert"><Badge tone="amber">확인 필요</Badge><span>1년 이상 업데이트되지 않은 정보입니다.</span></div>}<Card className="vendor-facts-grid">{facts.map(({ label, fact }) => { const value = formatFactValue(fact.value); return <div key={label} className={isStaleDate(fact.verifiedAt) ? 'is-stale' : ''}><span>{['가능', '미제공'].includes(value) ? value === '가능' ? <Check size={14} /> : <Minus size={14} /> : null}{label}</span><strong>{value}</strong><small>마지막 확인: {fact.verifiedAt.replaceAll('-', '.')}</small>{isStaleDate(fact.verifiedAt) && <Badge tone="amber">오래된 정보</Badge>}</div> })}</Card></section>
}
