import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { ROLLUP_AXIS, categoryFacets, vendorDirectory, type RollupDefinition } from './facets.js'
import { findDataDir } from './paths.js'
import { labelRecordSchema, type CategoryCount, type FacetGroup, type LabelRecord, type ReferenceItem, type ReferenceSearchResult, type VendorSummary } from './types.js'

const MEDIA_PREFIX = '/api/references/media'
const VENDOR_PATH_PREFIX = 'data/vendors/'

export interface SearchQuery {
  category: string
  /** 축 → 선택한 값들. 같은 축 안은 OR, 축끼리는 AND. */
  filters: Record<string, string[]>
  q: string
  limit: number
  offset: number
}

interface IndexedRecord {
  record: LabelRecord
  item: ReferenceItem
  /** 검색어 매칭용 소문자 문자열. 요청마다 다시 만들지 않는다. */
  haystack: string
  rollups: string[]
}

export class ReferenceStore {
  private readonly records: IndexedRecord[]
  private readonly axisOrder: Map<string, string[]>
  /** 이미 라벨이 붙은 경로. 같은 사진을 두 번 분류하지 않으려고 들고 있는다. */
  private readonly paths: Set<string>

  constructor(dataDir: string = findDataDir()) {
    this.axisOrder = loadAxisOrder(dataDir)
    this.records = loadRecords(dataDir)
    this.paths = new Set(this.records.map((entry) => entry.record.path))
  }

  get size(): number {
    return this.records.length
  }

  has(path: string): boolean {
    return this.paths.has(path)
  }

  /**
   * 분류가 끝난 레코드를 메모리 인덱스에 얹는다. labels.jsonl 에 append 하는 것과 짝이라,
   * 서버를 다시 띄우지 않아도 방금 분류한 사진이 곧바로 검색에 걸린다.
   */
  add(record: LabelRecord): boolean {
    if (this.paths.has(record.path)) return false
    const indexed = indexRecord(record)
    if (!indexed) return false
    this.records.push(indexed)
    this.paths.add(record.path)
    return true
  }

  /**
   * 등록된 업체 전부와, 각 업체의 라벨링 현황.
   *
   * 인스타를 타지 않는다 — Graph 앱 호출 한도가 시간당으로 걸려 있어서 업체 목록을
   * 띄우는 것만으로 한도를 태울 수 없다. 프로필 사진 대신 그 업체의 라벨링된 사진을
   * 대표컷으로 쓴다.
   */
  vendors(): VendorSummary[] {
    const byAccount = new Map<string, ReferenceItem[]>()
    for (const entry of this.records) {
      const bucket = byAccount.get(entry.item.vendor)
      if (bucket) bucket.push(entry.item)
      else byAccount.set(entry.item.vendor, [entry.item])
    }

    return Object.entries(vendorDirectory).map(([account, info]) => {
      const items = byAccount.get(account) ?? []
      return {
        account,
        name: info.name,
        category: info.type,
        labelledCount: items.length,
        covers: items.slice(0, 4).map((item) => item.imageUrl),
        instagramUrl: `https://www.instagram.com/${account}/`,
      }
    })
  }

  categories(): CategoryCount[] {
    const counts = new Map<string, number>()
    for (const entry of this.records) {
      counts.set(entry.item.category, (counts.get(entry.item.category) ?? 0) + 1)
    }
    // 화면 탭 순서는 조건 정의 순서를 따른다. 정의에 없는 카테고리는 뒤에 붙인다.
    const defined = Object.keys(categoryFacets)
    return [...counts.entries()]
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => {
        const rank = (name: string) => (defined.indexOf(name) === -1 ? defined.length : defined.indexOf(name))
        return rank(a.category) - rank(b.category) || a.category.localeCompare(b.category, 'ko')
      })
  }

  search({ category, filters, q, limit, offset }: SearchQuery): ReferenceSearchResult {
    const tokens = q.trim().toLocaleLowerCase('ko').split(/\s+/).filter(Boolean)
    const pool = this.records.filter((entry) => entry.item.category === category && matchesTokens(entry, tokens))
    const matched = pool.filter((entry) => matchesFilters(entry, filters))

    const ordered = interleaveByVendor(matched).map((entry) => ({
      ...entry.item,
      matched: collectMatched(entry, filters),
    }))

    return {
      total: ordered.length,
      items: ordered.slice(offset, offset + limit),
      groups: this.buildGroups(category, pool, filters),
      categories: this.categories(),
    }
  }

  /**
   * 각 축의 개수는 "그 축의 선택을 뺀 나머지 조건"으로 센다. 선택한 축의 다른
   * 값이 0으로 보이면 조건을 바꿔볼 수가 없기 때문이다.
   */
  private buildGroups(category: string, pool: IndexedRecord[], filters: Record<string, string[]>): FacetGroup[] {
    const definition = categoryFacets[category]
    if (!definition) return []
    const groups: FacetGroup[] = []

    if (definition.rollups?.length) {
      const base = pool.filter((entry) => matchesFilters(entry, omit(filters, ROLLUP_AXIS)))
      groups.push({
        label: definition.rollupLabel ?? '성격',
        kind: 'rollup',
        collapsed: false,
        values: definition.rollups
          .map((rollup) => ({
            axis: ROLLUP_AXIS,
            value: rollup.label,
            count: base.filter((entry) => entry.rollups.includes(rollup.label)).length,
          }))
          .filter((value) => value.count > 0 || filters[ROLLUP_AXIS]?.includes(value.value)),
      })
    }

    for (const group of definition.groups) {
      const values = group.axes.flatMap((axis) => {
        const base = pool.filter((entry) => matchesFilters(entry, omit(filters, axis)))
        const counts = new Map<string, number>()
        for (const entry of base) {
          for (const value of entry.record.labels[axis] ?? []) {
            counts.set(value, (counts.get(value) ?? 0) + 1)
          }
        }
        const order = this.axisOrder.get(`${category}/${axis}`) ?? []
        return [...counts.entries()]
          .map(([value, count]) => ({ axis, value, count }))
          .sort((a, b) => {
            const rank = (value: string) => (order.indexOf(value) === -1 ? order.length : order.indexOf(value))
            return rank(a.value) - rank(b.value) || b.count - a.count
          })
      })
      if (values.length) {
        groups.push({ label: group.label, kind: 'axis', collapsed: group.collapsed ?? false, values })
      }
    }

    return groups
  }
}

function loadRecords(dataDir: string): IndexedRecord[] {
  const raw = readFileSync(join(dataDir, 'labels.jsonl'), 'utf8')
  const records: IndexedRecord[] = []

  raw.split('\n').forEach((line, index) => {
    const trimmed = line.trim()
    if (!trimmed) return
    let json: unknown
    try {
      json = JSON.parse(trimmed)
    } catch {
      process.stderr.write(`[references] labels.jsonl ${index + 1}행이 JSON 이 아닙니다.\n`)
      return
    }
    const parsed = labelRecordSchema.safeParse(json)
    if (!parsed.success) {
      process.stderr.write(`[references] labels.jsonl ${index + 1}행을 건너뜁니다: ${parsed.error.issues[0]?.message ?? '형식 오류'}\n`)
      return
    }
    const indexed = indexRecord(parsed.data)
    if (!indexed) {
      process.stderr.write(`[references] labels.jsonl ${index + 1}행 경로가 ${VENDOR_PATH_PREFIX} 밖입니다: ${parsed.data.path}\n`)
      return
    }
    records.push(indexed)
  })

  return records
}

/** 라벨 레코드 하나를 검색 가능한 형태로 만든다. 부팅 적재와 런타임 추가가 같은 길을 탄다. */
function indexRecord(record: LabelRecord): IndexedRecord | null {
  if (!record.path.startsWith(VENDOR_PATH_PREFIX)) return null

  const id = record.path.slice(VENDOR_PATH_PREFIX.length)
  const profile = vendorDirectory[record.vendor]
  const item: ReferenceItem = {
    id,
    imageUrl: `${MEDIA_PREFIX}/${id.split('/').map(encodeURIComponent).join('/')}`,
    vendor: record.vendor,
    vendorName: profile?.name ?? record.vendor,
    vendorType: profile?.type ?? record.category,
    category: record.category,
    subject: record.subject,
    labels: record.labels,
    confidence: record.confidence,
    matched: [],
  }
  return {
    record,
    item,
    haystack: [item.vendorName, item.vendor, item.subject, ...Object.values(record.labels).flat()].join(' ').toLocaleLowerCase('ko'),
    rollups: (categoryFacets[record.category]?.rollups ?? []).filter((rollup) => matchesRollup(record, rollup)).map((rollup) => rollup.label),
  }
}

/** taxonomy.json 의 값 나열 순서를 그대로 칩 순서로 쓴다. */
function loadAxisOrder(dataDir: string): Map<string, string[]> {
  const order = new Map<string, string[]>()
  const taxonomy = JSON.parse(readFileSync(join(dataDir, 'taxonomy.json'), 'utf8')) as {
    categories?: Record<string, Record<string, { values?: string[] }>>
  }
  for (const [category, axes] of Object.entries(taxonomy.categories ?? {})) {
    for (const [axis, definition] of Object.entries(axes)) {
      order.set(`${category}/${axis}`, definition.values ?? [])
    }
  }
  return order
}

function matchesRollup(record: LabelRecord, rollup: RollupDefinition): boolean {
  return Object.entries(rollup.any).some(([axis, values]) => {
    const labels = record.labels[axis] ?? []
    // 값 목록이 비어 있으면 "그 축에 라벨이 없음"을 뜻한다(예: 장식 없는 드레스).
    if (!values.length) return labels.length === 0
    return labels.some((label) => values.includes(label))
  })
}

function matchesFilters(entry: IndexedRecord, filters: Record<string, string[]>): boolean {
  return Object.entries(filters).every(([axis, values]) => {
    if (!values.length) return true
    if (axis === ROLLUP_AXIS) return values.some((value) => entry.rollups.includes(value))
    const labels = entry.record.labels[axis] ?? []
    return values.some((value) => labels.includes(value))
  })
}

function matchesTokens(entry: IndexedRecord, tokens: string[]): boolean {
  return tokens.every((token) => entry.haystack.includes(token))
}

/**
 * 카드에 "이 조건 때문에 걸렸다"고 표시할 값. 롤업은 그 자체가 라벨이 아니라
 * 파생 조건이므로, 실제로 걸린 원래 라벨(미카도실크, 굵은비즈 …)로 되돌려 준다.
 */
function collectMatched(entry: IndexedRecord, filters: Record<string, string[]>): string[] {
  const matched = new Set<string>()
  for (const [axis, values] of Object.entries(filters)) {
    if (axis === ROLLUP_AXIS) {
      const rollups = categoryFacets[entry.item.category]?.rollups ?? []
      for (const rollup of rollups) {
        if (!values.includes(rollup.label) || !entry.rollups.includes(rollup.label)) continue
        const underlying = Object.entries(rollup.any).flatMap(([rollupAxis, rollupValues]) =>
          (entry.record.labels[rollupAxis] ?? []).filter((label) => rollupValues.includes(label)),
        )
        // 값 목록이 빈 롤업(장식 없는)은 되돌릴 라벨이 없어 롤업 이름을 그대로 쓴다.
        if (underlying.length) underlying.forEach((label) => matched.add(label))
        else matched.add(rollup.label)
      }
      continue
    }
    for (const label of entry.record.labels[axis] ?? []) {
      if (values.includes(label)) matched.add(label)
    }
  }
  return [...matched]
}

/**
 * 한 업체 사진이 연달아 붙으면 "여러 샵을 모아 본다"는 목적이 사라진다.
 * 업체별 큐를 한 장씩 돌아가며 뽑아 앞쪽에 여러 업체가 섞이게 한다.
 */
function interleaveByVendor(entries: IndexedRecord[]): IndexedRecord[] {
  const queues = new Map<string, IndexedRecord[]>()
  for (const entry of entries) {
    const queue = queues.get(entry.item.vendor)
    if (queue) queue.push(entry)
    else queues.set(entry.item.vendor, [entry])
  }
  const result: IndexedRecord[] = []
  const lanes = [...queues.values()]
  for (let round = 0; result.length < entries.length; round += 1) {
    for (const lane of lanes) {
      const entry = lane[round]
      if (entry) result.push(entry)
    }
    if (round > entries.length) break
  }
  return result
}

function omit(filters: Record<string, string[]>, axis: string): Record<string, string[]> {
  const { [axis]: _removed, ...rest } = filters
  return rest
}
