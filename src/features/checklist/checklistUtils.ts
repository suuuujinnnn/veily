const DAY_MS = 86_400_000

export function parseLocalDate(value: string) {
  const [year, month, day] = value.split('-').map(Number)
  return new Date(year, month - 1, day)
}

export function toIsoDate(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function addDays(value: string, days: number) {
  const date = parseLocalDate(value)
  date.setDate(date.getDate() + days)
  return toIsoDate(date)
}

export function formatChecklistDate(value: string) {
  const date = parseLocalDate(value)
  return `${date.getMonth() + 1}월 ${date.getDate()}일`
}

export function formatMonth(value: string) {
  const date = parseLocalDate(value)
  return `${date.getFullYear()}년 ${date.getMonth() + 1}월`
}

export function monthKey(value: string) {
  return value.slice(0, 7)
}

export function dDayLabel(weddingDate: string, dueDate: string) {
  const days = Math.round((parseLocalDate(dueDate).getTime() - parseLocalDate(weddingDate).getTime()) / DAY_MS)
  if (days === 0) return 'D-DAY'
  return days < 0 ? `D${days}` : `D+${days}`
}

export function dueStatus(dueDate: string, completed: boolean) {
  if (completed) return 'completed' as const
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const days = Math.ceil((parseLocalDate(dueDate).getTime() - today.getTime()) / DAY_MS)
  if (days < 0) return 'overdue' as const
  if (days <= 14) return 'soon' as const
  return 'upcoming' as const
}

