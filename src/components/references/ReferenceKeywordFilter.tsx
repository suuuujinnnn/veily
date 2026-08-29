import { Check } from 'lucide-react'
import { getReferenceCategory, type ReferenceCategory } from '../../data/referenceKeywordData'
import { ReferenceFilterGroup } from './ReferenceFilterGroup'

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
      {getReferenceCategory(category).groups.map((group) => planner
        ? <ReferenceFilterGroup key={group.label} label={group.label} options={group.keywords.map((keyword) => ({ value: keyword }))} selectedValues={selectedKeywords} onToggle={onKeywordToggle} />
        : <div key={group.label}><span>{group.label}</span><div>{group.keywords.map((keyword) => { const selected = selectedKeywords.includes(keyword); return <button key={keyword} className={selected ? 'active' : ''} onClick={() => onKeywordToggle(keyword)} aria-pressed={selected}>{selected && <Check size={11} />}{keyword}</button> })}</div></div>)}
    </div>
  </section>
}
