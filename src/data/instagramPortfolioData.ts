import type { Vendor } from '../types'

/**
 * UI 계약입니다. 실제 연동 시 서버에서 Instagram Graph API 응답을 이 형태로
 * 변환해 반환합니다. access token은 절대 브라우저에 전달하지 않습니다.
 */
export interface InstagramMediaItem {
  id: string
  mediaType: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM'
  imageUrl: string
  permalink: string
  caption?: string
  timestamp: string
  /** media_product_type으로 구분한 릴스 여부입니다. */
  isReel?: boolean
  /** 캐러셀 내부 이미지 URL입니다. */
  children?: string[]
}

export interface InstagramProfile {
  username: string
  name?: string
  profilePictureUrl?: string
  followersCount?: number
  followsCount?: number
  mediaCount?: number
  biography?: string
  website?: string
}

export interface InstagramPortfolio {
  account: string
  source: 'mock' | 'instagram-api'
  refreshedAt: string
  media: InstagramMediaItem[]
  profile?: InstagramProfile
  nextCursor?: string
}

const accountName = (instagram: string) => instagram.replace(/^@/, '').trim()

export function getInstagramPortfolioMock(vendor: Vendor): InstagramPortfolio {
  const account = accountName(vendor.instagram)
  const gallery = vendor.gallery.length ? vendor.gallery : [vendor.image]
  return {
    account,
    source: 'mock',
    refreshedAt: '2026-08-11T09:30:00+09:00',
    media: [...gallery, ...gallery].map((imageUrl, index) => ({
      id: `${vendor.id}-mock-${index}`,
      mediaType: index % 4 === 3 ? 'CAROUSEL_ALBUM' : 'IMAGE',
      imageUrl,
      permalink: account ? `https://www.instagram.com/${account}/` : '#',
      caption: `${vendor.name} 포트폴리오`,
      timestamp: `2026-08-${String(10 - index).padStart(2, '0')}T09:00:00+09:00`,
    })),
  }
}
