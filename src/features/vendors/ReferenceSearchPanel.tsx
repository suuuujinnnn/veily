import { Building2, Brush, Camera, Check, Gem, RotateCcw, Scissors, Search, SlidersHorizontal, X } from 'lucide-react'
import { getReferenceCategory, referenceCategories, type ReferenceCategory } from '../../data/referenceKeywordData'

interface ReferenceSearchPanelProps {
  category: ReferenceCategory
  query: string
  selectedKeywords: string[]
  resultCount: number
  onCategoryChange: (category: ReferenceCategory) => void
  onQueryChange: (query: string) => void
  onKeywordToggle: (keyword: string) => void
  onReset: () => void
}

const categoryIcons = {
  드레스: Gem,
  헤어: Scissors,
  메이크업: Brush,
  스튜디오: Camera,
  웨딩홀: Building2,
}

export function ReferenceSearchPanel({ category, query, selectedKeywords, resultCount, onCategoryChange, onQueryChange, onKeywordToggle, onReset }: ReferenceSearchPanelProps) {
  const currentCategory = getReferenceCategory(category)
  const hasFilters = Boolean(query.trim() || selectedKeywords.length)
  const venueMode = category === '웨딩홀'

  return (
    <section className="reference-search-panel">
      <header className="reference-search-panel__header">
        <div>
          <span className="reference-search-panel__kicker"><SlidersHorizontal size={14} /> REFERENCE FINDER</span>
          <h2>{venueMode ? '하객 동선을 먼저 보고' : '고객이 원하는 디자인을'}<br /><em>{venueMode ? '웨딩홀 단위로 찾아보세요' : '사진 단위로 모아보세요'}</em></h2>
        </div>
        <div className="reference-search-panel__summary">
          <span>현재 검색 결과</span>
          <strong>{resultCount}<small>{venueMode ? '곳' : '장'}</small></strong>
          {!venueMode && hasFilters && <button onClick={onReset}><RotateCcw size={13} /> 조건 초기화</button>}
        </div>
      </header>

      {!venueMode && <div className="reference-search-box">
        <Search size={20} />
        <input
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder={currentCategory.searchHint}
          aria-label={`${category} 레퍼런스 검색`}
        />
        {query && <button className="reference-search-box__clear" onClick={() => onQueryChange('')} aria-label="검색어 지우기"><X size={15} /></button>}
        <span>샵명 · 계정 · 디자인 키워드</span>
      </div>}

      <div className="reference-category-tabs" role="tablist" aria-label="레퍼런스 분야">
        {referenceCategories.map((item) => {
          const Icon = categoryIcons[item.label]
          return (
            <button key={item.label} role="tab" aria-selected={category === item.label} className={category === item.label ? 'active' : ''} onClick={() => onCategoryChange(item.label)}>
              <Icon size={18} />
              <span><strong>{item.label}</strong><small>{item.description}</small></span>
              <em>{item.englishLabel}</em>
            </button>
          )
        })}
      </div>

      {!venueMode && <div className="reference-filter-groups">
        {currentCategory.groups.map((group) => (
          <div className="reference-filter-group" key={group.label}>
            <div className="reference-filter-group__label"><span>{group.label}</span><small>{group.keywords.length}</small></div>
            <div className="reference-filter-group__chips">
              {group.keywords.map((keyword) => {
                const selected = selectedKeywords.includes(keyword)
                return <button key={keyword} className={selected ? 'active' : ''} onClick={() => onKeywordToggle(keyword)} aria-pressed={selected}>{selected && <Check size={12} />}{keyword}</button>
              })}
            </div>
          </div>
        ))}
      </div>}

      {!venueMode && <footer className="reference-search-panel__footer">
        <span>같은 분류의 조건은 하나만 맞아도 표시하고, 서로 다른 분류는 모두 맞는 화보를 모아요.</span>
        <div>{selectedKeywords.length ? selectedKeywords.map((keyword) => <button key={keyword} onClick={() => onKeywordToggle(keyword)}>#{keyword}<X size={11} /></button>) : <small>키워드를 선택하면 여기에 검색 조건이 표시됩니다.</small>}</div>
      </footer>}
    </section>
  )
}
