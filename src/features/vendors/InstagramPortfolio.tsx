import { AlertTriangle, Camera, ExternalLink, Images, RefreshCcw } from 'lucide-react'
import { Badge, Button } from '../../components/ui'
import { useInstagramPortfolio } from './useInstagramPortfolio'
import type { Vendor } from '../../types'

function accountName(value: string) {
  return value.replace(/^@/, '').trim()
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('ko-KR', { month: 'long', day: 'numeric' }).format(new Date(value))
}

export function InstagramPortfolio({ vendor }: { vendor: Vendor }) {
  const { portfolio, loading, fallbackReason, refresh } = useInstagramPortfolio(vendor)
  const account = accountName(vendor.instagram)
  const isLive = portfolio.source === 'instagram-api'
  const followers = portfolio.profile?.followersCount

  return (
    <section className="instagram-portfolio">
      <header>
        <div>
          <p className="eyebrow">Instagram portfolio</p>
          <h2>최근 포트폴리오</h2>
          <p className="instagram-portfolio__description">
            프로페셔널 계정의 공개 미디어를 업체 아카이브에 동기화합니다.
            {followers !== undefined && ` 팔로워 ${followers.toLocaleString('ko-KR')}명`}
          </p>
        </div>
        <div className="instagram-portfolio__actions">
          <div className="instagram-sync-status">
            <Badge tone={isLive ? 'sage' : 'amber'}>{isLive ? 'API 연결됨' : '데모 데이터'}</Badge>
            <span>마지막 갱신 {formatDate(portfolio.refreshedAt)}</span>
          </div>
          <Button
            size="sm"
            variant="secondary"
            icon={<RefreshCcw size={14} className={loading ? 'is-spinning' : ''} />}
            onClick={refresh}
            disabled={loading}
          >
            {loading ? '갱신 중' : '게시물 갱신'}
          </Button>
          {account && (
            <a className="instagram-open-link" href={`https://www.instagram.com/${account}/`} target="_blank" rel="noreferrer">
              <Camera size={14} /> @{account} <ExternalLink size={12} />
            </a>
          )}
        </div>
      </header>

      {fallbackReason ? (
        <div className="instagram-portfolio__notice">
          <AlertTriangle size={15} />
          <span>{fallbackReason} 아래는 화면 검증용 목업입니다.</span>
        </div>
      ) : (
        !isLive && (
          <div className="instagram-portfolio__notice">
            <Images size={15} />
            <span>포트폴리오를 불러오는 중입니다.</span>
          </div>
        )
      )}

      <div className="instagram-portfolio__grid">
        {portfolio.media.map((item) => (
          <a
            href={item.permalink}
            target="_blank"
            rel="noreferrer"
            key={item.id}
            aria-label={`${vendor.name} 인스타그램 게시물 ${formatDate(item.timestamp)} 보기`}
          >
            <figure>
              <img src={item.imageUrl} alt={item.caption ?? `${vendor.name} 인스타그램 게시물`} loading="lazy" />
              {item.mediaType === 'CAROUSEL_ALBUM' && (
                <span className="instagram-media-type">
                  <Images size={13} />
                  {item.children && item.children.length > 1 && item.children.length}
                </span>
              )}
              <figcaption>{formatDate(item.timestamp)}</figcaption>
            </figure>
          </a>
        ))}
      </div>
    </section>
  )
}
