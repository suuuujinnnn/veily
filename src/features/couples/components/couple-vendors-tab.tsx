import { Badge, Card } from '../../../components/ui'
import type { Recommendation, Vendor } from '../../../types'

const vendorGroups = [
  { key: 'sdme', title: '스드메', match: (category: string) => ['스튜디오', '드레스', '메이크업', '스드메'].some((item) => category.includes(item)) },
  { key: 'jewelry', title: '예물', match: (category: string) => category.includes('예물') },
  { key: 'venue', title: '예식장', match: (category: string) => category.includes('예식장') || category.includes('웨딩홀') },
  { key: 'etc', title: '기타', match: (category: string) => !['스튜디오', '드레스', '메이크업', '스드메', '예물', '예식장', '웨딩홀'].some((item) => category.includes(item)) },
]

function responseLabel(status: Recommendation['status']) {
  if (status === 'liked') return '좋아요'
  if (status === 'hold') return '보류'
  return '응답 대기'
}

export function CoupleVendorsTab({ recommendedVendors }: { recommendedVendors: Array<Recommendation & { vendor?: Vendor }> }) {
  return (
    <div className="recommended-workspace">
      <section className="section-heading">
        <div>
          <p className="eyebrow">추천 업체</p>
          <h2>플래너가 추천한 업체</h2>
          <p className="muted">업체찾기에서 후보군에 담아 보낸 업체가 이곳에 카테고리별로 정리됩니다.</p>
        </div>
      </section>
      <div className="recommended-category-grid">
        {vendorGroups.map((group) => {
          const rows = recommendedVendors.filter(({ vendor }) => vendor && group.match(String(vendor.category)))
          return (
            <Card className="recommended-category-card" key={group.key}>
              <div className="recommended-category-card__head">
                <div><p className="eyebrow">플래너 추천</p><h3>{group.title}</h3></div>
                <Badge tone="neutral">{rows.length}건</Badge>
              </div>
              <div className="recommended-category-card__list">
                {rows.length ? rows.map(({ vendor, status }) => vendor && (
                  <article className="vendor-mini-card vendor-mini-card--compact" key={vendor.id}>
                    <img src={vendor.image} style={{ objectPosition: vendor.imagePosition }} alt="" />
                    <div>
                      <Badge tone="rose">{vendor.match}% 매칭</Badge>
                      <h3>{vendor.name}</h3>
                      <p>{vendor.summary}</p>
                      <div className="vendor-mini-card__status"><span>고객 응답</span><strong>{responseLabel(status)}</strong></div>
                    </div>
                  </article>
                )) : <p className="recommended-empty">아직 추천된 업체가 없습니다.</p>}
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
