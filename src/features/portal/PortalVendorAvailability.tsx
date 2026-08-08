import { Building2, CheckCircle2 } from 'lucide-react'
import { useState } from 'react'
import type { Vendor } from '../../types'
import { VendorScheduleBoard } from '../vendors/VendorScheduleBoard'

export function PortalVendorAvailability({ vendors, coupleId }: { vendors: Vendor[]; coupleId: string }) {
  const visibleVendors = vendors.slice(0, 3)
  const [activeVendorId, setActiveVendorId] = useState(visibleVendors[0]?.id ?? 'v1')
  const activeVendor = visibleVendors.find((vendor) => vendor.id === activeVendorId) ?? visibleVendors[0]

  if (!activeVendor) return null

  return (
    <section className="portal-vendor-availability">
      <header><div><span><Building2 size={18} /></span><div><p className="eyebrow">Partner schedule</p><h3>제휴업체 공유 일정</h3><p>제안받은 업체가 공개한 시간을 주간 단위로 비교해 보세요.</p></div></div><small><CheckCircle2 size={13} /> 플래너 화면과 동기화됨</small></header>
      <nav aria-label="일정을 확인할 업체">{visibleVendors.map((vendor) => <button className={vendor.id === activeVendor.id ? 'active' : ''} onClick={() => setActiveVendorId(vendor.id)} key={vendor.id}><img src={vendor.image} alt="" /><span><strong>{vendor.name}</strong><small>{vendor.category} · {vendor.location}</small></span></button>)}</nav>
      <VendorScheduleBoard vendor={activeVendor} coupleId={coupleId} clientView />
    </section>
  )
}
