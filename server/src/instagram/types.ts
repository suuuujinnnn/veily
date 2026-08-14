import { z } from 'zod'

/**
 * Graph API 응답 스키마.
 *
 * business_discovery 로 받은 미디어는 재조회가 불가능하다. 개별 미디어에 GET 을
 * 걸면 권한 부족으로 반드시 실패하므로, 필요한 필드는 첫 호출에서 전부 받아야 한다.
 */
export const graphChildSchema = z.object({
  id: z.string(),
  media_type: z.string().optional(),
  media_url: z.string().optional(),
})

export const graphMediaSchema = z.object({
  id: z.string(),
  media_type: z.enum(['IMAGE', 'VIDEO', 'CAROUSEL_ALBUM']).optional(),
  media_product_type: z.string().optional(),
  media_url: z.string().optional(),
  thumbnail_url: z.string().optional(),
  permalink: z.string().optional(),
  caption: z.string().optional(),
  timestamp: z.string().optional(),
  children: z.object({ data: z.array(graphChildSchema) }).optional(),
})

const cursorsSchema = z.object({
  before: z.string().optional(),
  after: z.string().optional(),
})

export const businessDiscoverySchema = z.object({
  username: z.string().optional(),
  name: z.string().optional(),
  biography: z.string().optional(),
  website: z.string().optional(),
  profile_picture_url: z.string().optional(),
  followers_count: z.number().optional(),
  follows_count: z.number().optional(),
  media_count: z.number().optional(),
  media: z
    .object({
      data: z.array(graphMediaSchema),
      paging: z.object({ cursors: cursorsSchema.optional() }).optional(),
    })
    .optional(),
})

export const graphResponseSchema = z.object({
  id: z.string().optional(),
  business_discovery: businessDiscoverySchema.optional(),
})

export const graphErrorSchema = z.object({
  error: z.object({
    message: z.string(),
    type: z.string().optional(),
    code: z.number().optional(),
    error_subcode: z.number().optional(),
    fbtrace_id: z.string().optional(),
  }),
})

export type GraphMedia = z.infer<typeof graphMediaSchema>
export type BusinessDiscovery = z.infer<typeof businessDiscoverySchema>

/**
 * 프론트엔드 계약. src/data/instagramPortfolioData.ts 의 타입과 일치해야 한다.
 */
export interface InstagramMediaItem {
  id: string
  mediaType: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM'
  imageUrl: string
  permalink: string
  caption?: string
  timestamp: string
  /** media_product_type === 'REELS' 로 판별한다. media_type 에는 REELS 값이 없다. */
  isReel?: boolean
  /** 캐러셀 내부 이미지. 상세 화면에서 펼쳐 보여줄 때 쓴다. */
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
  profile: InstagramProfile
  media: InstagramMediaItem[]
  /** 다음 페이지 커서. next/previous 링크는 오지 않고 after 커서만 온다. */
  nextCursor?: string
}
