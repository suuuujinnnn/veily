import { Check, CheckCircle2 } from 'lucide-react'
import { Button } from '../ui'

export function OrderReminderCompleteButton({ onComplete }: { onComplete: () => void }) {
  return <Button className="order-reminder-complete-button" variant="success" size="xs" icon={<Check size={12} />} onClick={onComplete}>완료</Button>
}

export function OrderReminderStatusControl({ completed, onComplete }: { completed: boolean; onComplete: () => void }) {
  if (completed) return <span className="order-reminder-result"><CheckCircle2 size={14} /><strong>완료</strong></span>
  return <div className="order-reminder-status-control"><OrderReminderCompleteButton onComplete={onComplete} /></div>
}
