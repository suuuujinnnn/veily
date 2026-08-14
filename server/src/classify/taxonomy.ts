import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { findDataDir } from '../references/paths.js'
import { PublicError } from '../lib/errors.js'

interface RawAxis {
  multi?: boolean
  values?: string[]
  note?: string
  /** 'metadata' 인 축은 사진에서 추출할 수 없다. 업체 등록정보에서 채운다. */
  source?: string
}

interface RawTaxonomy {
  version?: string
  categories?: Record<string, Record<string, RawAxis>>
}

export interface AxisSpec {
  name: string
  /** false 면 값을 하나만 고른다. 스키마로는 못 막아서 응답을 받은 뒤 잘라낸다. */
  multi: boolean
  values: string[]
  note?: string
}

export interface CategorySpec {
  category: string
  version: string
  axes: AxisSpec[]
}

/** 라벨 확신도. 기존 labels.jsonl 이 쓰던 세 값을 그대로 쓴다. */
export const CONFIDENCE_VALUES = ['확실', '보통', '추정'] as const

let cached: { dataDir: string; taxonomy: RawTaxonomy } | null = null

function loadTaxonomy(dataDir: string): RawTaxonomy {
  if (cached && cached.dataDir === dataDir) return cached.taxonomy
  const taxonomy = JSON.parse(readFileSync(join(dataDir, 'taxonomy.json'), 'utf8')) as RawTaxonomy
  cached = { dataDir, taxonomy }
  return taxonomy
}

export function listCategories(dataDir: string = findDataDir()): string[] {
  return Object.keys(loadTaxonomy(dataDir).categories ?? {})
}

/**
 * 한 카테고리의 추출 대상 축을 뽑는다. source 가 'metadata' 인 축(웨딩홀의 홀타입)은
 * 사진으로 판정할 수 없다고 taxonomy 가 못박아 둔 것이라 분류기에 넘기지 않는다.
 */
export function loadCategorySpec(category: string, dataDir: string = findDataDir()): CategorySpec {
  const taxonomy = loadTaxonomy(dataDir)
  const axes = taxonomy.categories?.[category]
  if (!axes) {
    throw new PublicError(404, 'UNKNOWN_CATEGORY', `taxonomy.json 에 '${category}' 카테고리가 없습니다.`)
  }

  const specs: AxisSpec[] = Object.entries(axes)
    .filter(([, axis]) => axis.source !== 'metadata')
    .map(([name, axis]) => ({
      name,
      multi: axis.multi === true,
      values: axis.values ?? [],
      ...(axis.note ? { note: axis.note } : {}),
    }))
    .filter((axis) => axis.values.length > 0)

  if (!specs.length) {
    throw new PublicError(500, 'EMPTY_TAXONOMY', `'${category}' 에 사진으로 판정할 축이 없습니다.`)
  }

  return { category, version: taxonomy.version ?? 'unknown', axes: specs }
}

/**
 * 구조화 출력용 JSON Schema. 구조화 출력은 배열 길이 제약(maxItems)을 지원하지 않아
 * multi:false 축도 배열로 받고, 응답을 받은 뒤 한 개로 잘라낸다.
 *
 * 모든 축을 required 로 둔다. 해당하지 않으면 빈 배열을 주라고 프롬프트에서 지시하고,
 * 빈 배열인 축의 confidence 는 저장 단계에서 지운다 — 기존 labels.jsonl 의 모양과 맞추기 위해서다.
 */
export function buildResponseSchema(spec: CategorySpec): Record<string, unknown> {
  const labelProperties = Object.fromEntries(
    spec.axes.map((axis) => [
      axis.name,
      {
        type: 'array',
        description: axis.multi ? '해당하는 값을 모두. 없으면 빈 배열.' : '가장 잘 맞는 값 하나. 판정 불가면 빈 배열.',
        items: { type: 'string', enum: axis.values },
      },
    ]),
  )

  const confidenceProperties = Object.fromEntries(
    spec.axes.map((axis) => [axis.name, { type: 'string', enum: [...CONFIDENCE_VALUES] }]),
  )

  return {
    type: 'object',
    properties: {
      usable: {
        type: 'boolean',
        description: `이 사진이 '${spec.category}' 실물이 찍힌 사진이면 true. 브랜드 카드·로고·공지·가격표처럼 텍스트가 주인 이미지나, 실물이 안 나온 그래픽이면 false.`,
      },
      subject: {
        type: 'string',
        description: '사진에 무엇이 찍혔는지 한 문장으로. 예: "레이스 케이프를 걸치고 테이블에 기댄 신부, 상반신 크롭"',
      },
      labels: {
        type: 'object',
        properties: labelProperties,
        required: spec.axes.map((axis) => axis.name),
        additionalProperties: false,
      },
      confidence: {
        type: 'object',
        properties: confidenceProperties,
        required: spec.axes.map((axis) => axis.name),
        additionalProperties: false,
      },
    },
    required: ['usable', 'subject', 'labels', 'confidence'],
    additionalProperties: false,
  }
}
