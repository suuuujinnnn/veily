import { useEffect, useRef, useState, type ReactNode } from 'react'
import { ChevronDown, ChevronUp, RotateCcw, Search, X } from 'lucide-react'
import { Button } from '../ui'

interface VendorDiscoveryFilterDockProps {
  query: string
  onQueryChange: (query: string) => void
  filtersOpen: boolean
  onToggleFilters: () => void
  onReset: () => void
  ariaLabel: string
  className?: string
  title?: string
  action?: ReactNode
  contextControl?: ReactNode
  navigation?: ReactNode
  activeFilters?: string[]
  showSearchInHeader?: boolean
  children: ReactNode
}

export function VendorDiscoveryFilterDock({
  query,
  onQueryChange,
  filtersOpen,
  onToggleFilters,
  onReset,
  ariaLabel,
  className = '',
  title,
  action,
  contextControl,
  navigation,
  activeFilters = [],
  showSearchInHeader = true,
  children,
}: VendorDiscoveryFilterDockProps) {
  const dockRef = useRef<HTMLElement>(null)
  const headerRef = useRef<HTMLElement>(null)
  const [compactBar, setCompactBar] = useState({ visible: false, left: 0, width: 0 })

  useEffect(() => {
    const updateCompactBar = () => {
      const dockBounds = dockRef.current?.getBoundingClientRect()
      const headerBounds = headerRef.current?.getBoundingClientRect()
      if (!dockBounds || !headerBounds) return
      const next = {
        visible: window.scrollY > 0 && headerBounds.bottom <= 12,
        left: Math.round(dockBounds.left),
        width: Math.round(dockBounds.width),
      }
      setCompactBar((current) => current.visible === next.visible && current.left === next.left && current.width === next.width ? current : next)
    }
    updateCompactBar()
    window.addEventListener('scroll', updateCompactBar, { passive: true })
    window.addEventListener('resize', updateCompactBar)
    return () => {
      window.removeEventListener('scroll', updateCompactBar)
      window.removeEventListener('resize', updateCompactBar)
    }
  }, [])

  const visibleFilters = activeFilters.slice(0, 6)
  const renderSearch = () => title
    ? <strong className="reference-filter-dock__title">{title}</strong>
    : <label className="reference-filter-dock__search"><Search size={15} /><input value={query} onChange={(event) => onQueryChange(event.target.value)} placeholder="업체명·스타일·실무정보 검색" aria-label={ariaLabel} />{query && <button onClick={() => onQueryChange('')} aria-label="검색어 지우기"><X size={13} /></button>}</label>
  const renderSelectedFilters = () => <div className="reference-filter-dock__selected" aria-label="선택한 필터">
    {visibleFilters.map((filter, index) => <span key={`${filter}-${index}`}>#{filter.replace(/^#/, '')}</span>)}
    {activeFilters.length > visibleFilters.length && <em>+{activeFilters.length - visibleFilters.length}</em>}
  </div>
  const showOriginalFilters = () => {
    if (!filtersOpen) onToggleFilters()
    window.requestAnimationFrame(() => dockRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }))
  }

  return <>
    {compactBar.visible && <section className={`reference-filter-compact ${contextControl ? 'has-context' : ''}`} style={{ left: compactBar.left, width: compactBar.width }} aria-label="현재 레퍼런스 필터">
      <header>
        {renderSearch()}
        {renderSelectedFilters()}
        {contextControl && <div className="reference-filter-dock__context">{contextControl}</div>}
        <div className="reference-filter-dock__actions">{action}<Button size="sm" variant="secondary" icon={<ChevronDown size={14} />} onClick={showOriginalFilters}>필터 보기</Button></div>
      </header>
    </section>}
    <section ref={dockRef} className={`reference-filter-dock vendor-common-filter ${contextControl ? 'has-context' : ''} ${className} ${filtersOpen ? 'open' : ''}`}>
    <header ref={headerRef}>
      {(title || showSearchInHeader) && renderSearch()}
      {renderSelectedFilters()}
      {contextControl && <div className="reference-filter-dock__context">{contextControl}</div>}
      <div className="reference-filter-dock__actions">{action}<Button size="sm" variant="secondary" icon={filtersOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />} onClick={onToggleFilters}>{filtersOpen ? '접기' : '필터'}</Button></div>
    </header>
    {filtersOpen && <div className="reference-filter-dock__body">
      {navigation && <div className="reference-filter-dock__tabs">{navigation}</div>}
      <header><strong>상세 필터</strong><button type="button" onClick={onReset}><RotateCcw size={12} /> 초기화</button></header>
      {children}
    </div>}
    </section>
  </>
}
