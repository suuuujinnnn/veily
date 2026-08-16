import type { ReactNode } from 'react'
import { ChevronDown, ChevronUp, RotateCcw, Search, X } from 'lucide-react'
import { Button } from '../ui'

interface VendorDiscoveryFilterDockProps {
  query: string
  onQueryChange: (query: string) => void
  resultCount: number
  resultUnit: string
  filtersOpen: boolean
  onToggleFilters: () => void
  onReset: () => void
  ariaLabel: string
  className?: string
  title?: string
  action?: ReactNode
  children: ReactNode
}

export function VendorDiscoveryFilterDock({
  query,
  onQueryChange,
  resultCount,
  resultUnit,
  filtersOpen,
  onToggleFilters,
  onReset,
  ariaLabel,
  className = '',
  title,
  action,
  children,
}: VendorDiscoveryFilterDockProps) {
  return <section className={`reference-filter-dock vendor-common-filter ${className} ${filtersOpen ? 'open' : ''}`}>
    <header>
      {title
        ? <strong className="reference-filter-dock__title">{title}</strong>
        : <label className="reference-filter-dock__search"><Search size={15} /><input value={query} onChange={(event) => onQueryChange(event.target.value)} placeholder="업체명·스타일·실무정보 검색" aria-label={ariaLabel} />{query && <button onClick={() => onQueryChange('')} aria-label="검색어 지우기"><X size={13} /></button>}</label>}
      <div className="reference-filter-dock__actions"><strong>{resultCount}<small>{resultUnit}</small></strong><button onClick={onReset} aria-label="필터 초기화"><RotateCcw size={14} /></button>{action}<Button size="sm" variant="secondary" icon={filtersOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />} onClick={onToggleFilters}>{filtersOpen ? '접기' : '필터'}</Button></div>
    </header>
    {filtersOpen && <div className="reference-filter-dock__body">{children}</div>}
  </section>
}
