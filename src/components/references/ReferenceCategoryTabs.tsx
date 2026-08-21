import { referenceCategories, type ReferenceCategory } from '../../data/referenceKeywordData'

interface ReferenceCategoryTabsProps {
  value: ReferenceCategory
  onChange: (category: ReferenceCategory) => void
  variant: 'client' | 'planner'
}

export function ReferenceCategoryTabs({ value, onChange, variant }: ReferenceCategoryTabsProps) {
  return <nav className={variant === 'client' ? 'taste-category-tabs' : 'reference-category-tabs'} aria-label="레퍼런스 분야">
    {referenceCategories.map((item) => <button type="button" className={value === item.label ? 'active' : ''} onClick={() => onChange(item.label)} key={item.label}>
      {variant === 'client' && <span>{item.englishLabel}</span>}
      <strong>{item.label}</strong>
    </button>)}
  </nav>
}
