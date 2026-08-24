export const reminderDayDifference = (dueAt: string, today: string) => Math.round((
  new Date(`${dueAt.slice(0, 10)}T12:00:00`).getTime()
  - new Date(`${today.slice(0, 10)}T12:00:00`).getTime()
) / 86_400_000)

export const reminderDDayLabel = (days: number) => days === 0 ? 'D-0' : days > 0 ? `D-${days}` : `⚠ D+${Math.abs(days)}`
export const reminderDDayTone = (days: number) => days < 0 ? 'over' : days === 0 ? 'today' : days <= 3 ? 'critical' : days <= 7 ? 'warning' : days <= 14 ? 'safe' : 'calm'

export function ReminderDDay({ dueAt, today }: { dueAt: string; today: string }) {
  const days = reminderDayDifference(dueAt, today)
  return <em className={`dashboard-dday is-${reminderDDayTone(days)}`}>{reminderDDayLabel(days)}</em>
}
