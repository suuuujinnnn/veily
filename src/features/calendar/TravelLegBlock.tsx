import { Bus, Car, Train } from 'lucide-react'
import type { TravelLeg, TransitPreference } from './calendarUtils'

interface TravelLegBlockProps {
  leg: TravelLeg
  position: 'before' | 'after'
  variant?: 'calendar' | 'panel'
}

function TransitIcon({ mode, size }: { mode: TransitPreference; size: number }) {
  if (mode === 'car') return <Car size={size} />
  if (mode === 'subway') return <Train size={size} />
  return <Bus size={size} />
}

function routeLabel(mode: TransitPreference) {
  return mode === 'car' ? '자차' : mode === 'subway' ? '지하철' : '버스'
}

export function TravelLegBlock({ leg, position, variant = 'calendar' }: TravelLegBlockProps) {
  const className = variant === 'panel'
    ? `route-leg route-leg--${position}`
    : `calendar-travel-block calendar-travel-block--${position}`

  return (
    <div
      className={className}
      title={`${leg.from} → ${leg.to}`}
      aria-label={`${routeLabel(leg.mode)}로 ${leg.from}에서 ${leg.to}까지 ${leg.minutes}분`}
    >
      <TransitIcon mode={leg.mode} size={variant === 'panel' ? 14 : 11} />
      <strong>{leg.minutes}분</strong>
      {variant === 'panel' && leg.usesBase && <small>기준지 연결</small>}
    </div>
  )
}
