import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { CalendarDays, ChevronLeft, ChevronRight, Mars, Plus, Search, Venus } from 'lucide-react'
import { Button } from '../../components/ui'
import { useDemoStore } from '../../app/store'
import type { Couple } from '../../types'

const PAGE_SIZE = 8
type StatusFilter = 'all' | Couple['status']

const statusFilters: Array<{ value: StatusFilter; label: string }> = [
  { value: 'all', label: '전체' },
  { value: '집중 관리', label: '집중관리' },
  { value: '상담중', label: '상담중' },
  { value: '완료', label: '완료' },
  { value: '취소', label: '취소' },
]

const statusClass: Record<Couple['status'], string> = {
  '집중 관리': 'focus',
  상담중: 'consulting',
  완료: 'completed',
  취소: 'cancelled',
}

const statusLabel: Record<Couple['status'], string> = {
  '집중 관리': '집중관리',
  상담중: '상담중',
  완료: '완료',
  취소: '취소',
}

const hasWeddingDate = (value: string) => /^\d{4}-\d{2}-\d{2}$/.test(value)
const displayWeddingDate = (value: string) => hasWeddingDate(value) ? value.replaceAll('-', '. ') : '미정'

export function CouplesPage() {
  const { couples } = useDemoStore()
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState<StatusFilter>('all')
  const [page, setPage] = useState(1)
  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase('ko')
    return couples.filter((couple) => {
      const matchesStatus = status === 'all' || couple.status === status
      const matchesQuery = !normalizedQuery || `${couple.brideName} ${couple.groomName} ${couple.partners}`.toLocaleLowerCase('ko').includes(normalizedQuery)
      return matchesStatus && matchesQuery
    })
  }, [couples, query, status])
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const currentPage = Math.min(page, pageCount)
  const pageItems = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)
  const rangeStart = filtered.length ? (currentPage - 1) * PAGE_SIZE + 1 : 0
  const rangeEnd = Math.min(currentPage * PAGE_SIZE, filtered.length)

  useEffect(() => setPage(1), [query, status])

  return (
    <div className="page-stack couples-list-page">
      <section className="page-intro"><div><p className="eyebrow">고객 목록</p><h1>커플 관리</h1><p>상담부터 본식 완료까지 고객 현황을 목록으로 관리하세요.</p></div><Link to="/consultation/new"><Button icon={<Plus size={16} />}>새 커플 등록</Button></Link></section>
      <div className="toolbar couples-list-toolbar">
        <label className="search-field"><Search size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="신부 또는 신랑 이름 검색" /></label>
        <div className="filter-tabs couple-status-filter" aria-label="상태 필터">{statusFilters.map((item) => <button type="button" data-status={item.value} key={item.value} onClick={() => setStatus(item.value)} className={status === item.value ? 'active' : ''}>{item.label}</button>)}</div>
      </div>

      <section className="couple-list-panel" aria-label="커플 목록">
        <header className="couple-list-panel__summary"><span>전체 <strong>{filtered.length}</strong>팀</span><small>{rangeStart}–{rangeEnd} 표시</small></header>
        <div className="couple-table" role="table">
          <div className="couple-table__header" role="row">
            <span role="columnheader">신부</span><span role="columnheader">신랑</span><span role="columnheader">본식 일정</span><span role="columnheader">상태</span><span aria-hidden="true" />
          </div>
          <div className="couple-table__body">
            {pageItems.map((couple) => <Link key={couple.id} to={`/couples/${couple.id}`} className="couple-table__row" role="row">
              <span className="couple-person is-bride" role="cell"><i><Venus size={12} /></i><strong>{couple.brideName}</strong></span>
              <span className="couple-person is-groom" role="cell"><i><Mars size={12} /></i><strong>{couple.groomName}</strong></span>
              <span className={`couple-wedding-date ${hasWeddingDate(couple.weddingDate) ? '' : 'is-undecided'}`} role="cell"><CalendarDays size={14} /><strong>{displayWeddingDate(couple.weddingDate)}</strong></span>
              <span role="cell"><em className={`couple-status-pill is-${statusClass[couple.status]}`}><i />{statusLabel[couple.status]}</em></span>
              <ChevronRight className="couple-row-arrow" size={17} aria-hidden="true" />
            </Link>)}
            {!pageItems.length && <div className="couple-table__empty"><Search size={20} /><strong>조건에 맞는 커플이 없습니다.</strong><p>검색어나 상태 필터를 변경해 보세요.</p></div>}
          </div>
        </div>

        {pageCount > 1 && <nav className="couple-pagination" aria-label="커플 목록 페이지">
          <button type="button" aria-label="이전 페이지" disabled={currentPage === 1} onClick={() => setPage((current) => Math.max(1, current - 1))}><ChevronLeft size={15} /></button>
          {Array.from({ length: pageCount }, (_, index) => index + 1).map((number) => <button type="button" aria-current={number === currentPage ? 'page' : undefined} className={number === currentPage ? 'active' : ''} onClick={() => setPage(number)} key={number}>{number}</button>)}
          <button type="button" aria-label="다음 페이지" disabled={currentPage === pageCount} onClick={() => setPage((current) => Math.min(pageCount, current + 1))}><ChevronRight size={15} /></button>
        </nav>}
      </section>
    </div>
  )
}
