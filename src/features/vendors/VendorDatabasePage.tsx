import { Building2, Heart } from 'lucide-react'
import { useDemoStore } from '../../app/store'
import { Badge } from '../../components/ui'
import { VendorDatabase } from './VendorDatabase'

export function VendorDatabasePage() {
  const { vendors, favoriteVendorIds } = useDemoStore()

  return (
    <div className="page-stack vendor-database-page">
      <section className="page-intro">
        <div>
          <p className="eyebrow">Partner database</p>
          <h1>업체 DB</h1>
          <p>업체 정보와 담당자, 가격, 운영 조건을 한곳에서 관리하세요.</p>
        </div>
        <div className="heading-actions">
          <Badge tone="sage"><Building2 size={13} /> 등록 업체 {vendors.length}곳</Badge>
          <Badge tone="neutral"><Heart size={13} /> 즐겨찾기 {favoriteVendorIds.length}곳</Badge>
        </div>
      </section>
      <VendorDatabase />
    </div>
  )
}
