import { Check } from 'lucide-react'
import { getReferenceCategory, type ReferenceCategory } from '../../data/referenceKeywordData'

interface ReferenceSearchPanelProps {
  category: ReferenceCategory
  selectedKeywords: string[]
  onKeywordToggle: (keyword: string) => void
}

export function ReferenceSearchPanel({ category, selectedKeywords, onKeywordToggle }: ReferenceSearchPanelProps) {
  if (category === '웨딩홀') return null

  return <section className="reference-search-panel">
    <div className="reference-filter-groups">
      {getReferenceCategory(category).groups.map((group) => (
        <div className="reference-filter-group" key={group.label}>
          <div className="reference-filter-group__label"><span>{group.label}</span></div>
          <div className="reference-filter-group__chips">
            {group.keywords.map((keyword) => {
              const selected = selectedKeywords.includes(keyword)
              return <button key={keyword} className={selected ? 'active' : ''} onClick={() => onKeywordToggle(keyword)} aria-pressed={selected}>{selected && <Check size={12} />}{keyword}</button>
            })}
          </div>
        </div>
      ))}
    </div>
  </section>
}
