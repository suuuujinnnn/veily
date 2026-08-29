import type { Vendor, VerifiedFact } from '../../types'

export const STALE_DAYS = 365
export type VendorCondition = 'outdoor' | 'bouquet' | 'props' | 'parking' | 'surcharge' | 'extension'

const DAY_MS = 86_400_000
const daysSince = (value: string, today: string) => Math.floor((new Date(`${today}T12:00:00`).getTime() - new Date(`${value.slice(0, 10)}T12:00:00`).getTime()) / DAY_MS)

export function isStaleDate(value: string, today = '2026-08-05') {
  return daysSince(value, today) >= STALE_DAYS
}

export function operationalFacts(vendor: Vendor): Array<{ label: string; fact: VerifiedFact<unknown> }> {
  const details = vendor.operationalDetails
  if (!details) return []
  if (details.kind === 'studio') return [
    { label: '부케 제공', fact: details.bouquetProvided },
    { label: '촬영 소품', fact: details.propsProvided },
    { label: '베일 제공', fact: details.veilProvided },
    { label: '배경 종류', fact: details.backgrounds },
    { label: '야외 촬영', fact: details.outdoorShooting },
    { label: '주차', fact: details.parking },
    { label: '엘리베이터', fact: details.elevator },
    { label: '촬영 시간', fact: details.shootingDuration },
    { label: '시간 연장', fact: details.extensionAvailable },
    { label: '추가금 조건', fact: details.surchargeConditions },
  ]
  if (details.kind === 'dress') return [
    { label: '피팅비', fact: details.fittingFee },
    { label: '피팅 가능 벌 수', fact: details.fittingCount },
    { label: '촬영 드레스', fact: details.shootingAvailable },
    { label: '추가금 조건', fact: details.surchargeConditions },
    { label: '주차', fact: details.parking },
  ]
  return [
    { label: '얼리 스타트 비용', fact: details.earlyStartFee },
    { label: '원장/부원장 지정', fact: details.directorRequestAvailable },
    { label: '헤어피스', fact: details.hairpieces },
    { label: '혼주 메이크업', fact: details.parentMakeup },
    { label: '주차', fact: details.parking },
  ]
}

export function staleOperationalFacts(vendor: Vendor, today = '2026-08-05') {
  return operationalFacts(vendor).filter(({ fact }) => isStaleDate(fact.verifiedAt, today))
}

export function isVendorStale(vendor: Vendor, today = '2026-08-05') {
  return isStaleDate(vendor.updatedAt, today) || staleOperationalFacts(vendor, today).length > 0
}

export function vendorOperationalText(vendor: Vendor) {
  return operationalFacts(vendor).map(({ label, fact }) => `${label} ${formatFactValue(fact.value)}`).join(' ')
}

export function matchesVendorCondition(vendor: Vendor, condition: VendorCondition) {
  const details = vendor.operationalDetails
  if (!details) return false
  if (condition === 'parking') return details.parking.value
  if (condition === 'surcharge') return details.kind === 'studio' ? Boolean(details.surchargeConditions.value) : details.kind === 'dress' ? Boolean(details.surchargeConditions.value) : Boolean(details.earlyStartFee.value)
  if (details.kind !== 'studio') return false
  if (condition === 'outdoor') return details.outdoorShooting.value
  if (condition === 'bouquet') return details.bouquetProvided.value
  if (condition === 'props') return details.propsProvided.value
  return details.extensionAvailable.value
}

export function formatFactValue(value: unknown) {
  if (typeof value === 'boolean') return value ? '가능' : '미제공'
  if (Array.isArray(value)) return value.join(' · ')
  if (typeof value === 'number') return `${value}벌`
  return String(value)
}
