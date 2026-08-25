import type { ReactNode } from 'react'
import { Check } from 'lucide-react'

interface ReferenceFilterOption {
  value: string
  label?: string
  icon?: ReactNode
}

interface ReferenceFilterGroupProps {
  label: string
  options: ReferenceFilterOption[]
  selectedValues: string[]
  onToggle: (value: string) => void
  emptyText?: string
}

export function ReferenceFilterGroup({ label, options, selectedValues, onToggle, emptyText }: ReferenceFilterGroupProps) {
  return <div className="reference-filter-group">
    <div className="reference-filter-group__label"><span>{label}</span></div>
    <div className="reference-filter-group__chips">
      {options.map((option) => {
        const selected = selectedValues.includes(option.value)
        return <button type="button" key={option.value} className={selected ? 'active' : ''} onClick={() => onToggle(option.value)} aria-pressed={selected}>{selected && <Check size={12} />}{option.icon}{option.label ?? option.value}</button>
      })}
      {!options.length && emptyText && <span className="reference-filter-group__empty">{emptyText}</span>}
    </div>
  </div>
}
