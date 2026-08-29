import { getReferenceCategory, referenceCategories } from './referenceKeywordData'
import { weddingReferences } from './weddingReferenceData'
import type { ReferenceItem, ReferenceSearchResult } from '../lib/referenceApi'
import type { ClassifyStatus } from '../lib/classifyApi'

function labelsFor(category: string, tags: string[]) {
  const definition = referenceCategories.find((item) => item.label === category)
  return Object.fromEntries(
    (definition?.groups ?? [])
      .map((group) => [group.label, tags.filter((tag) => group.keywords.includes(tag))] as const)
      .filter(([, values]) => values.length),
  )
}

function matchesFilters(labels: Record<string, string[]>, filters: Record<string, string[]>, omittedAxis?: string) {
  return Object.entries(filters).every(([axis, values]) => {
    if (axis === omittedAxis || !values.length) return true
    return values.some((value) => labels[axis]?.includes(value))
  })
}

function interleaveByVendor(items: ReferenceItem[]) {
  const queues = new Map<string, ReferenceItem[]>()
  items.forEach((item) => queues.set(item.vendor, [...(queues.get(item.vendor) ?? []), item]))
  const result: ReferenceItem[] = []
  const lanes = [...queues.values()]
  for (let index = 0; result.length < items.length; index += 1) {
    lanes.forEach((lane) => lane[index] && result.push(lane[index]))
  }
  return result
}

/**
 * 기능 브랜치의 서버 검색 화면을 현재 목업 데이터로도 비교할 수 있게 하는 어댑터입니다.
 * 서버가 연결되면 API 결과가 우선이고, 연결되지 않았을 때만 이 결과를 사용합니다.
 */
export function searchReferenceProposal(
  category: string,
  filters: Record<string, string[]>,
  query: string,
): ReferenceSearchResult {
  const definition = getReferenceCategory(category as Parameters<typeof getReferenceCategory>[0])
  const tokens = query.trim().toLocaleLowerCase('ko').split(/\s+/).filter(Boolean)
  const pool = weddingReferences
    .filter((reference) => reference.category === category && category !== '웨딩홀')
    .map<ReferenceItem>((reference) => {
      const labels = labelsFor(category, reference.tags)
      return {
        id: reference.id,
        imageUrl: reference.image,
        vendor: reference.account,
        vendorName: reference.vendorName,
        vendorType: reference.category,
        category: reference.category,
        subject: reference.purpose || reference.tags.join(' · '),
        labels,
        confidence: {},
        matched: Object.entries(filters).flatMap(([axis, values]) => labels[axis]?.filter((label) => values.includes(label)) ?? []),
      }
    })
    .filter((item) => !tokens.length || tokens.every((token) => [item.vendorName, item.vendor, item.subject, ...Object.values(item.labels).flat()].join(' ').toLocaleLowerCase('ko').includes(token)))

  const matched = interleaveByVendor(pool.filter((item) => matchesFilters(item.labels, filters)))
  const categories = referenceCategories
    .filter((entry) => entry.label !== '웨딩홀')
    .map((entry) => ({ category: entry.label, count: weddingReferences.filter((reference) => reference.category === entry.label).length }))

  return {
    total: matched.length,
    items: matched,
    categories,
    groups: definition.groups.map((group) => ({
      label: group.label,
      kind: 'axis' as const,
      collapsed: group.keywords.length > 10,
      values: group.keywords.map((value) => ({
        axis: group.label,
        value,
        count: pool.filter((item) => matchesFilters(item.labels, filters, group.label) && item.labels[group.label]?.includes(value)).length,
      })).filter((item) => item.count > 0 || filters[group.label]?.includes(item.value)),
    })).filter((group) => group.values.length),
  }
}

export function getReferenceProposalClassifyStatus(): ClassifyStatus {
  const vendors = new Map<string, { account: string; name: string; category: string }>()
  weddingReferences
    .filter((reference) => reference.category !== '웨딩홀')
    .forEach((reference) => vendors.set(`${reference.category}:${reference.account}`, {
      account: reference.account,
      name: reference.vendorName,
      category: reference.category,
    }))
  return {
    ready: false,
    model: '수정안 데모',
    labelled: weddingReferences.filter((reference) => reference.category !== '웨딩홀').length,
    vendors: [...vendors.values()],
    running: [],
  }
}
