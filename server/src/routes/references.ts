import express, { Router } from 'express'
import { z } from 'zod'
import { ROLLUP_AXIS, categoryFacets } from '../references/facets.js'
import type { ReferenceStore } from '../references/store.js'
import { PublicError } from '../lib/errors.js'

const querySchema = z.object({
  category: z.string().min(1).default('드레스'),
  q: z.string().max(120).default(''),
  // 업체 단위로 묶어 보는 화면은 사진이 잘리면 업체가 통째로 빠진다. 전량을 받을 수 있게 열어둔다.
  limit: z.coerce.number().int().min(1).max(1000).default(60),
  offset: z.coerce.number().int().min(0).max(5000).default(0),
})

/**
 * 조건은 `f=축:값` 을 반복해서 넘긴다. 축 이름이 한글이라 경로 대신 쿼리로 받고,
 * 값에 콜론이 들어갈 수 있으니 첫 콜론만 구분자로 쓴다.
 */
function parseFilters(raw: unknown): Record<string, string[]> {
  const list = raw === undefined ? [] : Array.isArray(raw) ? raw : [raw]
  const filters: Record<string, string[]> = {}
  for (const entry of list) {
    if (typeof entry !== 'string') continue
    const separator = entry.indexOf(':')
    if (separator <= 0) continue
    const axis = entry.slice(0, separator).trim()
    const value = entry.slice(separator + 1).trim()
    if (!axis || !value) continue
    const bucket = filters[axis]
    if (bucket) {
      if (!bucket.includes(value)) bucket.push(value)
    } else {
      filters[axis] = [value]
    }
  }
  return filters
}

/**
 * 스토어는 분류 라우트와 함께 쓴다. 분류가 끝난 사진이 재시작 없이 검색에 걸리려면
 * 두 라우터가 같은 인스턴스를 봐야 한다.
 */
export function createReferencesRouter(store: ReferenceStore, dataDir: string): Router {
  const router = Router()

  router.get('/references/search', (req, res, next) => {
    try {
      const query = querySchema.safeParse(req.query)
      if (!query.success) {
        throw new PublicError(400, 'INVALID_QUERY', '검색 조건이 올바르지 않습니다.')
      }
      const { category, q, limit, offset } = query.data
      if (!categoryFacets[category]) {
        throw new PublicError(404, 'UNKNOWN_CATEGORY', `'${category}' 는 아직 분류가 준비되지 않은 카테고리입니다.`)
      }

      const filters = parseFilters(req.query.f)
      const knownAxes = new Set([ROLLUP_AXIS, ...(categoryFacets[category]?.groups.flatMap((group) => group.axes) ?? [])])
      const unknown = Object.keys(filters).filter((axis) => !knownAxes.has(axis))
      if (unknown.length) {
        throw new PublicError(400, 'UNKNOWN_AXIS', `'${unknown[0]}' 는 ${category} 에 없는 조건입니다.`)
      }

      res.json({ success: true, data: store.search({ category, filters, q, limit, offset }) })
    } catch (error: unknown) {
      next(error)
    }
  })

  // 등록된 업체 전체 목록. 인스타를 타지 않으므로 Graph 호출 한도와 무관하게 항상 뜬다.
  router.get('/references/vendors', (_req, res) => {
    res.json({ success: true, data: { vendors: store.vendors() } })
  })

  // 업체 사진은 저장소 안 파일이라 그대로 정적으로 내보낸다. 노출 범위를
  // data/vendors 로 못박아 labels.jsonl 같은 파일이 같이 열리지 않게 한다.
  router.use(
    '/references/media',
    express.static(`${dataDir}/vendors`, {
      index: false,
      dotfiles: 'deny',
      maxAge: '1h',
    }),
  )

  return router
}
