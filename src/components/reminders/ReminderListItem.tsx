import { AlertTriangle, BellRing, CalendarClock } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Badge } from '../ui'
import type { ReminderItem } from '../../types'
import { formatDate } from '../../features/reminders/reminderUtils'

const tone = { normal: 'neutral', soon: 'amber', overdue: 'rose' } as const

export function ReminderListItem({ reminder, compact = false }: { reminder: ReminderItem; compact?: boolean }) {
  const Icon = reminder.kind === 'confirmed-schedule' ? CalendarClock : reminder.urgency === 'overdue' ? AlertTriangle : BellRing
  return <Link to={reminder.href} className={`reminder-item ${compact ? 'reminder-item--compact' : ''}`}>
    <span className={`reminder-item__icon reminder-item__icon--${reminder.urgency}`}><Icon size={16} /></span>
    <div><strong>{reminder.title}</strong><p>{reminder.message}</p><small>{formatDate(reminder.dueAt)}</small></div>
    <Badge tone={tone[reminder.urgency]}>{reminder.urgency === 'overdue' ? '처리 필요' : reminder.urgency === 'soon' ? '임박' : '예정'}</Badge>
  </Link>
}
