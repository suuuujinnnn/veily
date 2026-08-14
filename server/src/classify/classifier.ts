import { readFileSync } from 'node:fs'
import { extname } from 'node:path'
import Anthropic from '@anthropic-ai/sdk'
import { z } from 'zod'
import { PublicError } from '../lib/errors.js'
import { CONFIDENCE_VALUES, buildResponseSchema, type CategorySpec } from './taxonomy.js'

/** Claude 가 받는 이미지 형식. 인스타는 사실상 jpeg 만 내려주지만 방어적으로 둔다. */
const MEDIA_TYPES: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
}

export interface ClassifyResult {
  /**
   * false 면 라벨을 저장하지 않는다. 업체 피드에는 브랜드 카드·공지 같은 텍스트 이미지가
   * 섞여 있는데(아뜰리에 오화 실측에서 6장 중 2장), 이런 사진은 모든 축이 비어도
   * "라벨 없는 사진"으로 보드에 남아 검색 결과를 더럽힌다.
   */
  usable: boolean
  subject: string
  labels: Record<string, string[]>
  confidence: Record<string, string>
}

export interface ClassifierOptions {
  apiKey: string
  model: string
  /**
   * Claude 호출을 갈아끼우기 위한 구멍. SDK 가 생성 시점에 fetch 를 잡아두기 때문에
   * globalThis 를 덮어써서는 대체되지 않는다. 운영에서는 비워 둔다.
   */
  fetch?: typeof globalThis.fetch
}

/**
 * 응답 검증용 스키마. 구조화 출력이 이미 형식을 보장하지만, 모델이 아니라
 * 우리 쪽 taxonomy 가 진실이므로 값 목록을 한 번 더 확인한다.
 */
function buildResultSchema(spec: CategorySpec): z.ZodType<ClassifyResult> {
  const labels = z.object(
    Object.fromEntries(
      spec.axes.map((axis) => [axis.name, z.array(z.enum(axis.values as [string, ...string[]])).default([])]),
    ),
  )
  const confidence = z.object(
    Object.fromEntries(spec.axes.map((axis) => [axis.name, z.enum(CONFIDENCE_VALUES).default('보통')])),
  )
  return z.object({
    usable: z.boolean().default(true),
    subject: z.string().default(''),
    labels,
    confidence,
  }) as unknown as z.ZodType<ClassifyResult>
}

function buildSystemPrompt(spec: CategorySpec): string {
  const axisLines = spec.axes
    .map((axis) => {
      const kind = axis.multi ? '여러 개 가능' : '하나만'
      const note = axis.note ? `\n    판정 기준: ${axis.note}` : ''
      return `- ${axis.name} (${kind}): ${axis.values.join(', ')}${note}`
    })
    .join('\n')

  return `너는 한국 웨딩 업체 사진에 라벨을 다는 분류기다. 카테고리는 "${spec.category}" 이고, 라벨 사전은 taxonomy v${spec.version} 이다.

# 축과 값

${axisLines}

# 먼저 판단할 것 — usable

업체 인스타에는 실물 사진 말고도 브랜드 명함 카드, 로고, 공지, 가격표, 문구만 얹은 그래픽이 섞여 나온다. 이런 이미지는 usable 을 false 로 두고 나머지는 대충 채워도 된다 — 저장되지 않는다.

실물이 찍혀 있으면 usable 은 true 다. 사진 위에 브랜드 워터마크나 문구가 얹혀 있어도, ${spec.category} 실물이 보이면 true 다.

# 규칙

사진에 실제로 보이는 것만 라벨한다. 업체 이름이나 캡션에서 추론하지 말고, 안 보이면 비워 둔다. 사전에 없는 값은 만들지 않는다.

"여러 개 가능" 축은 해당하는 값을 모두 고르고, "하나만" 축은 가장 잘 맞는 값 하나만 고른다. 판정할 수 없는 축은 빈 배열로 둔다 — 빈 배열은 실패가 아니라 정직한 답이다. 밑단이 잘려 실루엣을 못 보는데 라인을 찍거나, 얼굴이 안 보이는데 메이크업을 찍는 쪽이 훨씬 나쁘다.

각 축의 confidence 는 확실(사진에 명확히 보임) / 보통(보이지만 조명·각도 때문에 여지가 있음) / 추정(정황으로 미루어 짐작) 중 하나다. 빈 배열인 축의 confidence 는 무시되니 아무 값이나 둬도 된다.

subject 는 사진에 무엇이 찍혔는지 한 문장으로 적는다. 검색에 걸리는 텍스트라 인물의 자세, 크롭 범위, 배경을 담되 라벨을 그대로 반복하지는 않는다.`
}

/** 라벨을 taxonomy 규칙에 맞춘다. multi:false 축은 스키마로 못 막으므로 여기서 자른다. */
function normalize(spec: CategorySpec, raw: ClassifyResult): ClassifyResult {
  const labels: Record<string, string[]> = {}
  const confidence: Record<string, string> = {}

  for (const axis of spec.axes) {
    const values = raw.labels[axis.name] ?? []
    const kept = axis.multi ? [...new Set(values)] : values.slice(0, 1)
    if (!kept.length) continue
    labels[axis.name] = kept
    // 라벨이 없는 축의 confidence 는 남기지 않는다. 기존 labels.jsonl 과 모양을 맞춘다.
    confidence[axis.name] = raw.confidence[axis.name] ?? '보통'
  }

  return { usable: raw.usable, subject: raw.subject.trim(), labels, confidence }
}

export class Classifier {
  private readonly client: Anthropic

  constructor(private readonly options: ClassifierOptions) {
    this.client = new Anthropic({ apiKey: options.apiKey, ...(options.fetch ? { fetch: options.fetch } : {}) })
  }

  async classify(filePath: string, spec: CategorySpec): Promise<ClassifyResult> {
    const mediaType = MEDIA_TYPES[extname(filePath).toLowerCase()]
    if (!mediaType) {
      throw new PublicError(400, 'UNSUPPORTED_IMAGE', `분류할 수 없는 이미지 형식입니다: ${filePath}`)
    }

    // 내려받은 파일을 그대로 보낸다. 인스타 CDN URL 은 만료되므로 URL 을 넘기면
    // 다운로드와 분류 사이의 시간차만큼 실패할 여지가 생긴다.
    const data = readFileSync(filePath).toString('base64')

    let response: Anthropic.Message
    try {
      response = await this.client.messages.create({
        model: this.options.model,
        max_tokens: 16000,
        system: buildSystemPrompt(spec),
        output_config: { format: { type: 'json_schema', schema: buildResponseSchema(spec) } },
        messages: [
          {
            role: 'user',
            content: [
              { type: 'image', source: { type: 'base64', media_type: mediaType as 'image/jpeg', data } },
              { type: 'text', text: '이 사진에 라벨을 달아라.' },
            ],
          },
        ],
      })
    } catch (error: unknown) {
      throw toPublicError(error)
    }

    // Claude Opus 5 는 안전 분류기가 요청을 거절하면 200 에 refusal 로 답한다.
    // content 를 먼저 읽으면 빈 배열에 걸려 원인이 엉뚱하게 잡힌다.
    if (response.stop_reason === 'refusal') {
      throw new PublicError(422, 'CLASSIFY_REFUSED', '모델이 이 사진의 분류를 거절했습니다.')
    }
    if (response.stop_reason === 'max_tokens') {
      throw new PublicError(502, 'CLASSIFY_TRUNCATED', '분류 응답이 잘렸습니다. max_tokens 를 늘려야 합니다.')
    }

    const text = response.content.find((block): block is Anthropic.TextBlock => block.type === 'text')?.text
    if (!text) {
      throw new PublicError(502, 'CLASSIFY_EMPTY', '분류 응답에 본문이 없습니다.')
    }

    let json: unknown
    try {
      json = JSON.parse(text)
    } catch {
      throw new PublicError(502, 'CLASSIFY_NOT_JSON', '분류 응답이 JSON 이 아닙니다.')
    }

    const parsed = buildResultSchema(spec).safeParse(json)
    if (!parsed.success) {
      throw new PublicError(502, 'CLASSIFY_SHAPE', `분류 응답이 taxonomy 와 맞지 않습니다: ${parsed.error.issues[0]?.message ?? '형식 오류'}`)
    }

    return normalize(spec, parsed.data)
  }
}

function toPublicError(error: unknown): PublicError {
  if (error instanceof Anthropic.AuthenticationError) {
    return new PublicError(503, 'CLASSIFY_AUTH', 'ANTHROPIC_API_KEY 가 유효하지 않습니다.')
  }
  if (error instanceof Anthropic.RateLimitError) {
    return new PublicError(429, 'CLASSIFY_RATE_LIMITED', '분류 요청이 많아 제한에 걸렸습니다. 잠시 후 다시 시도해 주세요.')
  }
  if (error instanceof Anthropic.APIConnectionError) {
    return new PublicError(502, 'CLASSIFY_UNREACHABLE', 'Claude API 에 연결하지 못했습니다.')
  }
  if (error instanceof Anthropic.APIError) {
    return new PublicError(502, 'CLASSIFY_FAILED', `분류에 실패했습니다: ${error.message}`)
  }
  return new PublicError(500, 'CLASSIFY_UNKNOWN', '분류 중 알 수 없는 오류가 발생했습니다.')
}
