import type { HTMLAttributes, PropsWithChildren } from 'react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  padding?: 'none' | 'sm' | 'md' | 'lg'
}

export function Card({ children, className = '', padding = 'md', ...props }: PropsWithChildren<CardProps>) {
  return (
    <div className={`card card--${padding} ${className}`} {...props}>
      {children}
    </div>
  )
}
