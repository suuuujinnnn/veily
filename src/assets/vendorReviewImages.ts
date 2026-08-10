import labelReviewHtml from '../../conference/label_review.html?raw'

interface LabelReviewImage {
  account: string
  src: string
}

interface LabelReviewPayload {
  images: LabelReviewImage[]
}

const reviewedAccounts = [
  'atelier_ohwa',
  'creedj_official',
  'eloon_official',
  'laforet___official',
  'louisblanc_official',
  'cleve_studio',
  'gue_on.studio.official',
  'moninstudio',
  'studio.goyou',
  'yuha_haus',
  'kimchungkyung_hairface',
  'lamaison_bride',
  'lkmforetwedding',
  'me.parer_wedding',
  'mimm_wedding',
] as const

const payloadMatch = labelReviewHtml.match(
  /window\.__LABELS__\s*=\s*(\{[\s\S]*?\});\s*<\/script>/,
)

if (!payloadMatch) {
  throw new Error('conference/label_review.html에서 업체 이미지 데이터를 찾지 못했습니다.')
}

const payload = JSON.parse(payloadMatch[1]) as LabelReviewPayload

export const vendorReviewImages: Record<string, string[]> = Object.fromEntries(
  reviewedAccounts.map((account) => {
    const images = payload.images
      .filter((image) => image.account === account && image.src.startsWith('data:image/'))
      .slice(0, 3)
      .map((image) => image.src)

    if (images.length < 3) {
      throw new Error(`${account} 업체의 리뷰 이미지가 3장 미만입니다.`)
    }

    return [account, images]
  }),
)
