import type { Couple, OrderApproval, Recommendation, ReminderItem, Vendor, WeddingEvent } from '../../types'

const dayDifference = (date: string, today: string) => Math.round((new Date(`${date.slice(0, 10)}T12:00:00`).getTime() - new Date(`${today.slice(0, 10)}T12:00:00`).getTime()) / 86_400_000)
const urgencyFor = (days: number): ReminderItem['urgency'] => days < 0 ? 'overdue' : days <= 3 ? 'soon' : 'normal'

interface ReminderSource {
  couples: Couple[]
  vendors: Vendor[]
  recommendations: Recommendation[]
  orderApprovals: OrderApproval[]
  events: WeddingEvent[]
}

export function buildReminders(source: ReminderSource, audience: ReminderItem['audience'], today = '2026-08-05', coupleId?: string) {
  const reminders: ReminderItem[] = []
  const coupleName = (id?: string) => source.couples.find((item) => item.id === id)?.brideName ?? '고객'
  const vendorName = (id: string) => source.vendors.find((item) => item.id === id)?.name ?? '제휴업체'

  source.recommendations
    .filter((item) => item.status !== 'liked' && (!coupleId || item.coupleId === coupleId))
    .forEach((item) => {
      const days = dayDifference(item.selectionDeadline, today)
      if (days > 7) return
      const vendor = vendorName(item.vendorId)
      reminders.push({
        id: `${audience}-selection-${item.id}`,
        kind: 'selection-deadline', audience, sourceId: item.id, coupleId: item.coupleId,
        title: days < 0 ? '업체 선택 기한 초과' : '업체 선택이 필요해요',
        message: audience === 'planner'
          ? `${coupleName(item.coupleId)} 고객의 ${vendor} 선택 기한이 ${days < 0 ? `${Math.abs(days)}일 지났습니다.` : `${days}일 남았습니다.`}`
          : `${vendor} 후보를 ${formatDate(item.selectionDeadline)}까지 선택해 주세요.`,
        dueAt: item.selectionDeadline, urgency: urgencyFor(days), href: audience === 'planner' ? `/couples/${item.coupleId}?tab=vendors` : `/portal/${item.coupleId}/vendors`,
      })
    })

  source.orderApprovals
    .filter((item) => !['approved', 'draft'].includes(item.status) && (!coupleId || item.coupleId === coupleId))
    .forEach((item) => {
      const days = dayDifference(item.approvalDeadline, today)
      const rejected = item.status === 'rejected'
      reminders.push({
        id: `${audience}-order-${item.id}`,
        kind: 'order-approval-deadline', audience, sourceId: item.id, coupleId: item.coupleId,
        title: rejected ? '업체 일정 확인 불가' : days < 0 || item.status === 'expired' ? '업체 확인 기한 초과' : '업체 확인 대기 중',
        message: audience === 'planner'
          ? rejected ? `${coupleName(item.coupleId)} 고객의 ${vendorName(item.vendorId)} 요청이 거절되었습니다.` : `${vendorName(item.vendorId)} 승인 기한이 ${days < 0 ? `${Math.abs(days)}일 지났습니다.` : `${days}일 남았습니다.`}`
          : rejected ? '해당 일정 진행이 어려워 다른 후보를 확인하고 있어요.' : '업체에서 일정을 확인하고 있어요.',
        dueAt: item.approvalDeadline, urgency: rejected || days < 0 ? 'overdue' : urgencyFor(days), href: audience === 'planner' ? `/couples/${item.coupleId}?tab=orders` : `/portal/${item.coupleId}/vendors`,
      })
    })

  source.events
    .filter((item) => item.visibility === 'couple-shared' && item.approvalStatus === 'confirmed' && (!coupleId || item.coupleId === coupleId))
    .forEach((item) => {
      const days = dayDifference(item.date, today)
      if (![14, 7, 3].includes(days)) return
      reminders.push({
        id: `${audience}-schedule-${item.id}-${days}`,
        kind: 'confirmed-schedule', audience, sourceId: item.id, coupleId: item.coupleId,
        title: `${item.title} D-${days}`,
        message: audience === 'planner' ? `${coupleName(item.coupleId)} 고객의 ${item.title}가 ${days}일 남았습니다.` : `${item.title}가 ${days}일 남았어요.`,
        dueAt: item.date, urgency: days === 3 ? 'soon' : 'normal', href: audience === 'planner' ? `/couples/${item.coupleId}` : `/portal/${item.coupleId}/calendar`,
      })
    })

  return reminders.sort((a, b) => (a.urgency === b.urgency ? a.dueAt.localeCompare(b.dueAt) : ['overdue', 'soon', 'normal'].indexOf(a.urgency) - ['overdue', 'soon', 'normal'].indexOf(b.urgency)))
}

export function formatDate(date: string) {
  const [, month, day] = date.slice(0, 10).split('-')
  return `${Number(month)}월 ${Number(day)}일`
}

export function formatDateTime(value: string) {
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false,
    timeZone: 'Asia/Seoul',
  }).format(new Date(value))
}
