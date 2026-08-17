import { Check } from 'lucide-react'
import { getReferenceCategory, type ReferenceCategory } from '../../data/referenceKeywordData'

interface ReferenceKeywordFilterProps {
  category: ReferenceCategory
  selectedKeywords: string[]
  onKeywordToggle: (keyword: string) => void
  variant: 'client' | 'planner'
}

export function ReferenceKeywordFilter({ category, selectedKeywords, onKeywordToggle, variant }: ReferenceKeywordFilterProps) {
  if (category === '웨딩홀') return null

  const planner = variant === 'planner'

  return <section className={`reference-keyword-filter reference-keyword-filter--${variant} ${planner ? 'reference-search-panel' : ''}`}>
    <div className={planner ? 'reference-filter-groups' : 'taste-filter-groups'}>
      {getReferenceCategory(category).groups.map((group) => (
        <div className={planner ? 'reference-filter-group' : undefined} key={group.label}>
          {planner
            ? <div className="reference-filter-group__label"><span>{group.label}</span></div>
            : <span>{group.label}</span>}
          <div className={planner ? 'reference-filter-group__chips' : undefined}>
            {group.keywords.map((keyword) => {
              const selected = selectedKeywords.includes(keyword)
              return <button key={keyword} className={selected ? 'active' : ''} onClick={() => onKeywordToggle(keyword)} aria-pressed={selected}>{selected && <Check size={planner ? 12 : 11} />}{keyword}</button>
            })}
          </div>
        </div>
      ))}
    </div>
  </section>
}
