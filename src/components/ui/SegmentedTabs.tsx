import type { ReactNode } from 'react'

export interface SegmentedTabItem<T extends string> {
  value: T
  label: string
  icon?: ReactNode
  count?: number
  disabled?: boolean
}

interface SegmentedTabsProps<T extends string> {
  value: T
  items: SegmentedTabItem<T>[]
  onChange: (value: T) => void
  ariaLabel: string
  size?: 'xs' | 'sm'
  fluid?: boolean
  scrollable?: boolean
  className?: string
}

export function SegmentedTabs<T extends string>({ value, items, onChange, ariaLabel, size = 'sm', fluid = false, scrollable = false, className = '' }: SegmentedTabsProps<T>) {
  return <div className={`segmented-tabs segmented-tabs--${size} ${fluid ? 'is-fluid' : ''} ${scrollable ? 'is-scrollable' : ''} ${className}`} role="tablist" aria-label={ariaLabel}>
    {items.map((item) => <button type="button" role="tab" aria-selected={value === item.value} disabled={item.disabled} className={value === item.value ? 'active' : ''} onClick={() => onChange(item.value)} key={item.value}>
      {item.icon}<span>{item.label}</span>{item.count !== undefined && <em>{item.count}</em>}
    </button>)}
  </div>
}
