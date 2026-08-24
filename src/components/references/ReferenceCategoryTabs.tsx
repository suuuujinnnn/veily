import { referenceCategories, type ReferenceCategory } from '../../data/referenceKeywordData'
import { SegmentedTabs } from '../ui'

interface ReferenceCategoryTabsProps {
  value: ReferenceCategory
  onChange: (category: ReferenceCategory) => void
  variant: 'client' | 'planner'
  display?: 'tabs' | 'select' | 'segmented'
}

export function ReferenceCategoryTabs({ value, onChange, variant, display = 'tabs' }: ReferenceCategoryTabsProps) {
  if (display === 'select') return <label className="reference-category-select">
    <span>탐색 영역</span>
    <select value={value} onChange={(event) => onChange(event.target.value as ReferenceCategory)} aria-label="레퍼런스 탐색 영역">
      {referenceCategories.map((item) => <option value={item.label} key={item.label}>{item.label}</option>)}
    </select>
  </label>

  if (display === 'segmented') return <SegmentedTabs className="reference-category-segmented" value={value} onChange={onChange} ariaLabel="레퍼런스 탐색 영역" fluid items={referenceCategories.map((item) => ({ value: item.label, label: item.label }))} />

  return <nav className={variant === 'client' ? 'taste-category-tabs' : 'reference-category-tabs'} aria-label="레퍼런스 분야">
    {referenceCategories.map((item) => <button type="button" className={value === item.label ? 'active' : ''} onClick={() => onChange(item.label)} key={item.label}>
      {variant === 'client' && <span>{item.englishLabel}</span>}
      <strong>{item.label}</strong>
    </button>)}
  </nav>
}
