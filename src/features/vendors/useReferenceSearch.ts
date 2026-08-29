import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { searchReferences, type ReferenceSearchResult } from '../../lib/referenceApi'
import { searchReferenceProposal } from '../../data/referenceProposalData'

const PAGE_SIZE = 60
const QUERY_DEBOUNCE_MS = 250

export interface ReferenceSearchState {
  category: string
  filters: Record<string, string[]>
  query: string
  result: ReferenceSearchResult | null
  loading: boolean
  error: string | null
  selectedValues: string[]
  hasFilters: boolean
  setCategory: (category: string) => void
  setQuery: (query: string) => void
  toggleFilter: (axis: string, value: string) => void
  clearAxis: (axis: string) => void
  reset: () => void
  retry: () => void
}

/**
 * 조건을 바꿀 때마다 서버에 다시 묻는다. 라벨 148장은 전부 내려받아도 되는 양이지만,
 * 사진이 늘면 그대로 무너지는 방식이라 처음부터 서버 검색으로 둔다.
 */
export function useReferenceSearch(initialCategory = '드레스'): ReferenceSearchState {
  const [category, setCategoryState] = useState(initialCategory)
  const [filters, setFilters] = useState<Record<string, string[]>>({})
  const [query, setQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [result, setResult] = useState<ReferenceSearchResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reloadToken, setReloadToken] = useState(0)
  // 조건을 빠르게 바꾸면 이전 응답이 늦게 도착해 화면을 덮어쓴다. 요청 순번으로 막는다.
  const requestId = useRef(0)

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedQuery(query), QUERY_DEBOUNCE_MS)
    return () => window.clearTimeout(timer)
  }, [query])

  useEffect(() => {
    const controller = new AbortController()
    const id = requestId.current + 1
    requestId.current = id
    setLoading(true)

    searchReferences({ category, filters, q: debouncedQuery, limit: PAGE_SIZE, signal: controller.signal })
      .then((data) => {
        if (requestId.current !== id) return
        setResult(data)
        setError(null)
      })
      .catch((cause: unknown) => {
        if (controller.signal.aborted || requestId.current !== id) return
        // 수정안은 서버를 띄우지 않아도 현재 목업 데이터로 UI와 필터를 비교할 수 있다.
        setResult(searchReferenceProposal(category, filters, debouncedQuery))
        setError(null)
      })
      .finally(() => {
        if (requestId.current === id) setLoading(false)
      })

    return () => controller.abort()
  }, [category, filters, debouncedQuery, reloadToken])

  const setCategory = useCallback((next: string) => {
    setCategoryState(next)
    // 축 이름이 카테고리마다 달라서 조건을 들고 넘어갈 수 없다.
    setFilters({})
  }, [])

  const toggleFilter = useCallback((axis: string, value: string) => {
    setFilters((current) => {
      const values = current[axis] ?? []
      const next = values.includes(value) ? values.filter((item) => item !== value) : [...values, value]
      const { [axis]: _removed, ...rest } = current
      return next.length ? { ...rest, [axis]: next } : rest
    })
  }, [])

  const clearAxis = useCallback((axis: string) => {
    setFilters((current) => {
      const { [axis]: _removed, ...rest } = current
      return rest
    })
  }, [])

  const reset = useCallback(() => {
    setFilters({})
    setQuery('')
  }, [])

  const retry = useCallback(() => setReloadToken((token) => token + 1), [])

  const selectedValues = useMemo(() => Object.values(filters).flat(), [filters])

  return {
    category,
    filters,
    query,
    result,
    loading,
    error,
    selectedValues,
    hasFilters: selectedValues.length > 0 || query.trim().length > 0,
    setCategory,
    setQuery,
    toggleFilter,
    clearAxis,
    reset,
    retry,
  }
}
