import type { ReferenceCategory } from '../types'

export type ReferenceTagConfidence = '확실' | '보통' | '추정'
export interface ReferenceAnalysisResult { category: ReferenceCategory; tags: string[]; subject: string; confidence: Record<string, ReferenceTagConfidence> }

export class ReferenceAnalysisError extends Error {
  readonly code: string
  constructor(code: string, message: string) { super(message); this.name = 'ReferenceAnalysisError'; this.code = code }
}

export const supportedReferenceImageTypes = ['image/jpeg', 'image/png', 'image/webp']
export const maxReferenceImageBytes = 15 * 1024 * 1024

const mockTags: Record<ReferenceCategory, string[]> = {
  드레스: ['미카도 실크', '오간자 실크', '튤', '맑은 비즈', '오프숄더', '일자탑', 'A라인', '머메이드라인'],
  헤어: ['웨이브', '반묶음', '로우 번', '미들 번', '하이 번', '생머리', '헤어 액세서리'],
  메이크업: ['물광', '세미 매트', '투명', '누드', '과즙', '음영', '깔끔'],
  스튜디오: ['인물 중심', '인물+배경', '모던', '내추럴', '자연광', '화이트톤', '정원', '클로즈업'],
  웨딩홀: ['밝은 홀', '어두운 홀', '높은 천고', '원형 테이블', '화려한 꽃 장식', '채플홀', '야외웨딩'],
}

const categoryHints: Array<[ReferenceCategory, RegExp]> = [
  ['드레스', /dress|gown|드레스/i], ['헤어', /hair|헤어|머리/i], ['메이크업', /makeup|메이크업|화장/i],
  ['스튜디오', /studio|photo|스튜디오|촬영/i], ['웨딩홀', /venue|hall|weddinghall|웨딩홀|예식장/i],
]

function hash(file: File) { return [...`${file.name}:${file.size}:${file.lastModified}`].reduce((sum, char) => ((sum * 31) + char.charCodeAt(0)) >>> 0, 7) }

export function validateReferenceImage(file: File) {
  if (!supportedReferenceImageTypes.includes(file.type)) throw new ReferenceAnalysisError('UNSUPPORTED_IMAGE', 'JPG, PNG, WebP 이미지만 분석할 수 있습니다.')
  if (file.size > maxReferenceImageBytes) throw new ReferenceAnalysisError('IMAGE_TOO_LARGE', '이미지는 최대 15MB까지 업로드할 수 있습니다.')
  if (!file.size) throw new ReferenceAnalysisError('IMAGE_REQUIRED', '분석할 이미지가 없습니다.')
}

/** 외부 통신 없이 분석 대기와 결과만 재현하는 목업 함수다. */
export async function analyzeReferenceImage(file: File, preferredCategory: ReferenceCategory, signal?: AbortSignal): Promise<ReferenceAnalysisResult> {
  validateReferenceImage(file)
  await new Promise<void>((resolve, reject) => {
    const timer = window.setTimeout(resolve, 900)
    signal?.addEventListener('abort', () => { window.clearTimeout(timer); reject(new DOMException('Aborted', 'AbortError')) }, { once: true })
  })
  const category = categoryHints.find(([, pattern]) => pattern.test(file.name))?.[0] ?? preferredCategory
  const pool = mockTags[category]
  const seed = hash(file)
  const tags = [...new Set([pool[seed % pool.length], pool[(seed + 3) % pool.length], pool[(seed + 5) % pool.length]])]
  return { category, tags, subject: `${category} 이미지에서 ${tags.join(', ')} 특징을 찾았어요.`, confidence: Object.fromEntries(tags.map((tag, index) => [tag, index ? '보통' : '확실'])) as Record<string, ReferenceTagConfidence> }
}

export function imageFileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(new ReferenceAnalysisError('FILE_READ_FAILED', '이미지 파일을 읽지 못했습니다.'))
    reader.onload = () => resolve(String(reader.result))
    reader.readAsDataURL(file)
  })
}
