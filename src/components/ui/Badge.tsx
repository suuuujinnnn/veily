import type { PropsWithChildren } from 'react'

export function Badge({ children, tone = 'neutral' }: PropsWithChildren<{ tone?: 'neutral' | 'rose' | 'sage' | 'amber' | 'dark' }>) {
  return <span className={`badge badge--${tone}`}>{children}</span>
}
