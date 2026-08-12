import { useState } from 'react'
import { Camera, ExternalLink, Images, RefreshCcw } from 'lucide-react'
import { Badge, Button } from '../../components/ui'
import { getInstagramPortfolioMock } from '../../data/instagramPortfolioData'
import type { Vendor } from '../../types'

function accountName(value: string) {
  return value.replace(/^@/, '').trim()
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('ko-KR', { month: 'long', day: 'numeric' }).format(new Date(value))
}

export function InstagramPortfolio({ vendor }: { vendor: Vendor }) {
  const [portfolio, setPortfolio] = useState(() => getInstagramPortfolioMock(vendor))
  const [refreshing, setRefreshing] = useState(false)
  const account = accountName(vendor.instagram)

  const refresh = () => {
    setRefreshing(true)
    window.setTimeout(() => {
      setPortfolio({ ...getInstagramPortfolioMock(vendor), refreshedAt: new Date().toISOString() })
      setRefreshing(false)
    }, 650)
  }

  return (
    <section className="instagram-portfolio">
      <header>
        <div>
          <p className="eyebrow">Instagram portfolio</p>
          <h2>최근 포트폴리오</h2>
          <p className="instagram-portfolio__description">프로페셔널 계정의 공개 미디어를 업체 아카이브에 동기화합니다.</p>
        </div>
        <div className="instagram-portfolio__actions">
          <div className="instagram-sync-status">
            <Badge tone={portfolio.source === 'instagram-api' ? 'sage' : 'amber'}>{portfolio.source === 'instagram-api' ? 'API 연결됨' : '데모 데이터'}</Badge>
            <span>마지막 갱신 {formatDate(portfolio.refreshedAt)}</span>
          </div>
          <Button size="sm" variant="secondary" icon={<RefreshCcw size={14} className={refreshing ? 'is-spinning' : ''} />} onClick={refresh} disabled={refreshing}>
            {refreshing ? '갱신 중' : '게시물 갱신'}
          </Button>
          {account && <a className="instagram-open-link" href={`https://www.instagram.com/${account}/`} target="_blank" rel="noreferrer"><Camera size={14} /> @{account} <ExternalLink size={12} /></a>}
        </div>
      </header>
      <div className="instagram-portfolio__notice"><Images size={15} /><span>현재는 화면 검증용 목업입니다. 서버 연동 후에는 썸네일·게시 시각·게시물 링크가 Graph API 결과로 교체됩니다.</span></div>
      <div className="instagram-portfolio__grid">
        {portfolio.media.map((item) => <a href={item.permalink} target="_blank" rel="noreferrer" key={item.id} aria-label={`${vendor.name} 인스타그램 게시물 ${formatDate(item.timestamp)} 보기`}>
          <figure>
            <img src={item.imageUrl} alt={item.caption ?? `${vendor.name} 인스타그램 게시물`} />
            {item.mediaType === 'CAROUSEL_ALBUM' && <span className="instagram-media-type"><Images size={13} /></span>}
            <figcaption>{formatDate(item.timestamp)}</figcaption>
          </figure>
        </a>)}
      </div>
    </section>
  )
}
