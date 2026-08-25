import type { CSSProperties } from 'react'
import type { CalendarDisplayPreferences, CalendarWorkCategory, Couple, EventType, WeddingEvent } from '../../types'

export const calendarWorkCategories: { value: CalendarWorkCategory; label: string; shortLabel: string }[] = [
  { value: 'consultation', label: '상담', shortLabel: '상담' },
  { value: 'tour', label: '투어', shortLabel: '투어' },
  { value: 'shooting-rehearsal', label: '촬영·리허설', shortLabel: '촬영' },
  { value: 'contract', label: '계약', shortLabel: '계약' },
  { value: 'ceremony', label: '본식', shortLabel: '본식' },
  { value: 'expo', label: '박람회·전시', shortLabel: '전시' },
  { value: 'other', label: '기타', shortLabel: '기타' },
]

export const calendarCustomerPalette = [
  '#5a93b5', '#b47786', '#7b9b72', '#9a7bb0', '#c08b46', '#668e8b',
  '#b16f55', '#697faf', '#9c8b55', '#a66e9a', '#548c72', '#8c7180',
]

const categoryColors: Record<CalendarWorkCategory, string> = {
  consultation: '#5d8fab',
  tour: '#8a72ad',
  'shooting-rehearsal': '#b57887',
  contract: '#568b79',
  ceremony: '#a85763',
  expo: '#bd873f',
  other: '#78878e',
}

export const calendarCategoryForType = (type: EventType): CalendarWorkCategory => {
  if (type === '계약') return 'contract'
  if (type === '본식') return 'ceremony'
  if (type === '드레스') return 'tour'
  if (type === '스튜디오' || type === '메이크업') return 'shooting-rehearsal'
  return 'consultation'
}

export const calendarCategoryForWorkflow = (workflowId: string, type: EventType): CalendarWorkCategory => {
  if (workflowId.includes('tour')) return 'tour'
  if (workflowId.includes('shoot') || workflowId.includes('rehearsal') || workflowId.includes('photo')) return 'shooting-rehearsal'
  if (workflowId.includes('contract')) return 'contract'
  if (workflowId.includes('final')) return 'ceremony'
  return calendarCategoryForType(type)
}

export const getCalendarCategory = (event: WeddingEvent) => event.calendarCategory ?? calendarCategoryForType(event.type)
export const getCalendarCategoryMeta = (event: WeddingEvent) => calendarWorkCategories.find((item) => item.value === getCalendarCategory(event)) ?? calendarWorkCategories.at(-1)!

export const getShortCoupleLabel = (couple?: Couple) => {
  if (!couple) return '고객 미지정'
  const shorten = (name: string) => name.length > 1 ? name.slice(1) : name
  return `${shorten(couple.brideName)}·${shorten(couple.groomName)}`
}

export const defaultCoupleColor = (coupleId: string | undefined, couples: Couple[]) => {
  const index = Math.max(0, couples.findIndex((couple) => couple.id === coupleId))
  return calendarCustomerPalette[index % calendarCustomerPalette.length]
}

export const buildNonOverlappingCoupleColors = (couples: Couple[]) => Object.fromEntries(couples.map((couple, index) => {
  if (couples.length <= calendarCustomerPalette.length) return [couple.id, calendarCustomerPalette[index]]
  const hue = Math.round((index * 360 / couples.length + 207) % 360)
  return [couple.id, `hsl(${hue} 32% 48%)`]
}))

export const getEventAppearance = (event: WeddingEvent, couples: Couple[], preferences?: CalendarDisplayPreferences): CSSProperties => {
  if (event.visibility === 'planner-private') return { '--calendar-source': '#6f7880', '--calendar-soft': '#eef0f1' } as CSSProperties
  const category = getCalendarCategory(event)
  const source = preferences?.colorMode === 'customer'
    ? preferences.coupleColors[event.coupleId ?? ''] ?? defaultCoupleColor(event.coupleId, couples)
    : categoryColors[category]
  return { '--calendar-source': source, '--calendar-soft': `color-mix(in srgb, ${source} 16%, white)` } as CSSProperties
}

export const defaultCalendarDisplayPreferences: CalendarDisplayPreferences = { colorMode: 'work-category', coupleColors: {} }
