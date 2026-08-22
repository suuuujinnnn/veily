import type { ChecklistItem, Couple, CustomerReferenceSubmission, CustomerRequest, OrderReminder, Vendor, WeddingEvent } from '../../types'

export type PlannerNotificationKind = 'customer-request' | 'order' | 'customer-action' | 'schedule-task'

export interface PlannerNotification {
  id: string
  kind: PlannerNotificationKind
  coupleId: string
  title: string
  message: string
  href: string
  urgency: 'normal' | 'soon' | 'overdue'
  sourceId: string
  actionLabel?: string
}

interface NotificationSource {
  couples: Couple[]
  customerRequests: CustomerRequest[]
  orderReminders: OrderReminder[]
  checklist: ChecklistItem[]
  customerReferenceSubmissions: CustomerReferenceSubmission[]
  events: WeddingEvent[]
  vendors: Vendor[]
}

const dayDifference = (date: string, today: string) => Math.round((new Date(`${date.slice(0, 10)}T12:00:00`).getTime() - new Date(`${today.slice(0, 10)}T12:00:00`).getTime()) / 86_400_000)
const urgency = (days: number): PlannerNotification['urgency'] => days < 0 ? 'overdue' : days <= 3 ? 'soon' : 'normal'

export function buildPlannerNotifications(source: NotificationSource, today = '2026-08-05'): PlannerNotification[] {
  const notifications: PlannerNotification[] = []
  const coupleName = (id: string) => source.couples.find((couple) => couple.id === id)?.partners ?? '고객'
  const vendorName = (id?: string) => source.vendors.find((vendor) => vendor.id === id)?.name ?? '업체'

  source.customerRequests
    .filter((request) => request.sender === 'customer' && !request.readByPlannerAt)
    .forEach((request) => notifications.push({
      id: `notification-request-${request.id}`,
      kind: 'customer-request',
      coupleId: request.coupleId,
      sourceId: request.id,
      title: '고객 요청이 도착했어요',
      message: `${coupleName(request.coupleId)} · ${request.originalText || '첨부 자료를 확인해 주세요.'}`,
      href: `/requests?coupleId=${request.coupleId}`,
      urgency: 'soon',
      actionLabel: '요청 확인',
    }))

  source.orderReminders.filter((reminder) => reminder.status === 'pending').forEach((reminder) => {
    const days = dayDifference(reminder.reminderDate, today)
    notifications.push({
      id: `notification-order-${reminder.id}`,
      kind: 'order',
      coupleId: reminder.coupleId,
      sourceId: reminder.id,
      title: reminder.title,
      message: `${coupleName(reminder.coupleId)} · ${vendorName(reminder.vendorId)} 확인이 필요해요.`,
      href: `/couples/${reminder.coupleId}?tab=timeline`,
      urgency: urgency(days),
      actionLabel: '업무 확인',
    })
  })

  source.couples.filter((couple) => couple.status !== '확정').forEach((couple) => {
    const submission = source.customerReferenceSubmissions.find((item) => item.coupleId === couple.id)
    if (!submission || submission.status === '작성 중') notifications.push({
      id: `notification-taste-${couple.id}`,
      kind: 'customer-action',
      coupleId: couple.id,
      sourceId: couple.id,
      title: '고객 취향 선택이 필요해요',
      message: `${coupleName(couple.id)} · 레퍼런스가 아직 제출되지 않았어요.`,
      href: `/couples/${couple.id}?tab=info`,
      urgency: 'normal',
      actionLabel: '고객 상세',
    })
  })

  source.checklist.filter((task) => task.status !== 'completed' && dayDifference(task.dueDate, today) <= 7).forEach((task) => {
    const days = dayDifference(task.dueDate, today)
    notifications.push({
      id: `notification-task-${task.id}`,
      kind: 'schedule-task',
      coupleId: task.coupleId,
      sourceId: task.id,
      title: task.kind === 'decision' ? '결정이 필요한 준비 업무' : days < 0 ? '마감이 지난 준비 업무' : '준비 업무 확인',
      message: `${coupleName(task.coupleId)} · ${task.title}`,
      href: `/couples/${task.coupleId}?tab=timeline`,
      urgency: urgency(days),
      actionLabel: '업무 확인',
    })
  })

  source.events.filter((event) => event.visibility === 'couple-shared' && event.approvalStatus === 'confirmed').forEach((event) => {
    const days = dayDifference(event.date, today)
    if (![14, 7, 1, 0].includes(days)) return
    notifications.push({
      id: `notification-event-${event.id}-${days}`,
      kind: 'schedule-task',
      coupleId: event.coupleId ?? '',
      sourceId: event.id,
      title: `${event.title} 일정 알림`,
      message: `${coupleName(event.coupleId ?? '')} · ${days === 0 ? '오늘' : `${days}일 후`} ${event.time}`,
      href: `/calendar`,
      urgency: urgency(days),
      actionLabel: '일정 확인',
    })
  })

  const rank = { overdue: 0, soon: 1, normal: 2 }
  return notifications.sort((a, b) => rank[a.urgency] - rank[b.urgency] || a.title.localeCompare(b.title, 'ko'))
}
