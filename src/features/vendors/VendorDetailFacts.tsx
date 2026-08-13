import { Check, Info, Minus } from 'lucide-react'
import { Card } from '../../components/ui'
import type { Vendor } from '../../types'

const yesNo = (value: boolean) => value ? '가능' : '미제공'

export function VendorDetailFacts({ vendor }: { vendor: Vendor }) {
  if (!vendor.details) return null
  const facts = vendor.details.kind === 'studio'
    ? [['부케 제공', yesNo(vendor.details.bouquetProvided)], ['촬영 소품', yesNo(vendor.details.propsProvided)], ['베일 제공', yesNo(vendor.details.veilProvided)], ['배경 종류', vendor.details.backgrounds.join(' · ')], ['야외 촬영', yesNo(vendor.details.outdoorShooting)], ['주차', yesNo(vendor.details.parking)], ['엘리베이터', yesNo(vendor.details.elevator)]]
    : vendor.details.kind === 'dress'
      ? [['피팅비', vendor.details.fittingFee], ['피팅 가능 벌 수', `${vendor.details.fittingCount}벌`], ['촬영 드레스', yesNo(vendor.details.shootingAvailable)], ['추가금 조건', vendor.details.surchargeConditions]]
      : [['얼리 스타트 비용', vendor.details.earlyStartFee], ['원장/부원장 지정', yesNo(vendor.details.directorRequestAvailable)], ['헤어피스', vendor.details.hairpieces], ['혼주 메이크업', vendor.details.parentMakeup]]

  return <section className="vendor-detail-facts"><div className="section-heading"><div><p className="eyebrow">Decision details</p><h2>{vendor.category} 선택 정보</h2><p>상담 전에 실제 선택에 필요한 조건을 한눈에 확인하세요.</p></div><Info size={20} /></div><Card className="vendor-facts-grid">{facts.map(([label, value]) => <div key={label}><span>{typeof value === 'string' && ['가능', '미제공'].includes(value) ? value === '가능' ? <Check size={14} /> : <Minus size={14} /> : null}{label}</span><strong>{value}</strong></div>)}</Card></section>
}
