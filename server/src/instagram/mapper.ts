import type {
  BusinessDiscovery,
  GraphMedia,
  InstagramMediaItem,
  InstagramPortfolio,
  InstagramProfile,
} from './types.js'

/** 캐러셀 자식 중 첫 이미지. 영상 자식의 media_url 은 mp4 라 건너뛴다. */
function firstImageChild(media: GraphMedia): string | undefined {
  return media.children?.data.find((child) => child.media_type !== 'VIDEO' && child.media_url)?.media_url
}

/**
 * 이미지 URL 폴백.
 *
 * 영상·릴스의 media_url 은 mp4 다. 화면은 이걸 <img> 에 꽂으므로 반드시 깨진다.
 * 표지인 thumbnail_url 을 먼저 쓴다 — 문서상 VIDEO 에만 오는 필드다.
 *
 * media_url 누락은 예외가 아니라 정상 경로다. 저작권 플래그된 미디어는 응답에서
 * 필드가 통째로 빠지며, 공식 문서가 드는 대표 사례가 릴스 배경 음원이다.
 * 캐러셀 최상위 media_url 도 문서상 보장되지 않으므로 자식으로 폴백한다.
 */
function resolveImageUrl(media: GraphMedia): string | undefined {
  if (media.media_type === 'VIDEO') return media.thumbnail_url ?? firstImageChild(media)
  return media.media_url ?? firstImageChild(media) ?? media.thumbnail_url
}

function toMediaItem(media: GraphMedia): InstagramMediaItem | null {
  const imageUrl = resolveImageUrl(media)
  // 표시할 이미지가 없는 항목은 빈 카드로 남기지 않고 제외한다.
  if (!imageUrl || !media.timestamp) return null

  // 영상 자식은 뺀다. 화면도 수집기도 이 배열을 이미지로 다루기 때문에
  // mp4 가 섞이면 깨진 칸이 되거나 내려받기가 실패한다.
  const children = media.children?.data.flatMap((child) =>
    child.media_url && child.media_type !== 'VIDEO' ? [child.media_url] : [],
  )

  return {
    id: media.id,
    mediaType: media.media_type ?? 'IMAGE',
    imageUrl,
    permalink: media.permalink ?? '#',
    ...(media.caption ? { caption: media.caption } : {}),
    timestamp: media.timestamp,
    ...(media.media_product_type === 'REELS' ? { isReel: true } : {}),
    ...(children && children.length > 0 ? { children } : {}),
  }
}

function toProfile(discovery: BusinessDiscovery, fallbackAccount: string): InstagramProfile {
  return {
    username: discovery.username ?? fallbackAccount,
    ...(discovery.name ? { name: discovery.name } : {}),
    ...(discovery.profile_picture_url ? { profilePictureUrl: discovery.profile_picture_url } : {}),
    ...(discovery.followers_count !== undefined ? { followersCount: discovery.followers_count } : {}),
    ...(discovery.follows_count !== undefined ? { followsCount: discovery.follows_count } : {}),
    ...(discovery.media_count !== undefined ? { mediaCount: discovery.media_count } : {}),
    ...(discovery.biography ? { biography: discovery.biography } : {}),
    ...(discovery.website ? { website: discovery.website } : {}),
  }
}

export function toPortfolio(discovery: BusinessDiscovery, account: string, refreshedAt: string): InstagramPortfolio {
  const media = (discovery.media?.data ?? []).flatMap((item) => {
    const mapped = toMediaItem(item)
    return mapped ? [mapped] : []
  })
  const nextCursor = discovery.media?.paging?.cursors?.after

  return {
    account,
    source: 'instagram-api',
    refreshedAt,
    profile: toProfile(discovery, account),
    media,
    ...(nextCursor ? { nextCursor } : {}),
  }
}
