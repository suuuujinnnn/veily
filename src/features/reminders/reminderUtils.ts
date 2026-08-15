import type { ChecklistItem, Couple, CustomerReferenceSubmission, CustomerRequest, OrderApproval, OrderReminder, Recommendation, ReminderItem, Vendor, WeddingEvent } from '../../types'
import { taskUrgency } from '../checklist/checklistUtils'

const dayDifference = (date: string, today: string) => Math.round((new Date(`${date.slice(0, 10)}T12:00:00`).getTime() - new Date(`${today.slice(0, 10)}T12:00:00`).getTime()) / 86_400_000)
const urgencyFor = (days: number): ReminderItem['urgency'] => days < 0 ? 'overdue' : days <= 3 ? 'soon' : 'normal'

interface ReminderSource {
  couples: Couple[]
  vendors: Vendor[]
  recommendations: Recommendation[]
  orderApprovals: OrderApproval[]
  events: WeddingEvent[]
  checklist: ChecklistItem[]
  favoriteVendorIds: string[]
}

export function buildReminders(source: ReminderSource, audience: ReminderItem['audience'], today = '2026-08-05', coupleId?: string) {
  const reminders: ReminderItem[] = []
  const coupleName = (id?: string) => source.couples.find((item) => item.id === id)?.brideName ?? '고객'
  const vendorName = (id: string) => source.vendors.find((item) => item.id === id)?.name ?? '제휴업체'

  if (audience === 'planner') {
    source.checklist
      .filter((item) => item.status !== 'completed' && (!coupleId || item.coupleId === coupleId))
      .forEach((item) => {
        const { days, urgency } = taskUrgency(item.dueDate, item.status, today)
        if (days > 7) return
        const dDay = days === 0 ? 'D-DAY' : days > 0 ? `D-${days}` : `D+${Math.abs(days)}`
        reminders.push({
          id: `planner-task-${item.id}`, kind: 'task-deadline', audience, sourceId: item.id, coupleId: item.coupleId,
          title: item.kind === 'decision' && item.status === 'pending' ? '미결정 항목 확인' : '준비 업무 확인',
          message: `${coupleName(item.coupleId)} 고객 · ${item.title} · ${dDay}`,
          dueAt: item.dueDate, urgency, href: `/couples/${item.coupleId}?tab=timeline`,
        })
      })

  }

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
    .filter((item) => ['reverse-pending', 'rejected', 'expired'].includes(item.status) && (!coupleId || item.coupleId === coupleId))
    .forEach((item) => {
      const days = dayDifference(item.approvalDeadline, today)
      const rejected = item.status === 'rejected'
      reminders.push({
        id: `${audience}-order-${item.id}`,
        kind: 'order-approval-deadline', audience, sourceId: item.id, coupleId: item.coupleId,
        title: rejected ? '업체 일정 확인 불가' : days < 0 || item.status === 'expired' ? '역발주 승인 지연' : '역발주 승인 대기',
        message: audience === 'planner'
          ? rejected ? `${coupleName(item.coupleId)} 고객의 ${vendorName(item.vendorId)} 요청이 거절되었습니다.` : `${coupleName(item.coupleId)} 고객 · ${vendorName(item.vendorId)} 승인이 ${days < 0 ? `${Math.abs(days)}일 지연되었습니다.` : `${days}일 남았습니다.`}`
          : rejected ? '해당 일정 진행이 어려워 다른 후보를 확인하고 있어요.' : '업체에서 일정을 확인하고 있어요.',
        dueAt: item.approvalDeadline, urgency: rejected || days < 0 ? 'overdue' : urgencyFor(days), href: audience === 'planner' ? '/orders' : `/portal/${item.coupleId}/vendors`,
      })
    })

  source.events
    .filter((item) => item.visibility === 'couple-shared' && item.approvalStatus === 'confirmed' && (!coupleId || item.coupleId === coupleId))
    .forEach((item) => {
      const days = dayDifference(item.date, today)
      if (!(item.reminderOffsets ?? [14, 7, 1]).includes(days)) return
      reminders.push({
        id: `${audience}-schedule-${item.id}-${days}`,
        kind: 'confirmed-schedule', audience, sourceId: item.id, coupleId: item.coupleId,
        title: `${item.title} D-${days}`,
        message: audience === 'planner' ? `${coupleName(item.coupleId)} 고객의 ${item.title}가 ${days}일 남았습니다.` : `${item.title}가 ${days}일 남았어요.`,
        dueAt: item.date, urgency: days === 1 ? 'soon' : 'normal', href: audience === 'planner' ? `/couples/${item.coupleId}` : `/portal/${item.coupleId}/calendar`,
      })
    })

  return reminders.sort((a, b) => (a.urgency === b.urgency ? a.dueAt.localeCompare(b.dueAt) : ['overdue', 'soon', 'normal'].indexOf(a.urgency) - ['overdue', 'soon', 'normal'].indexOf(b.urgency)))
}

export type DashboardReminderKind = 'order' | 'customer-request' | 'vendor-undecided' | 'taste-unsubmitted' | 'overdue-task'

export interface DashboardReminder {
  id: string
  kind: DashboardReminderKind
  coupleId: string
  title: string
  message: string
  meta: string
  urgency: 'normal' | 'soon' | 'overdue'
  href: string
  sourceId?: string
}

interface DashboardReminderSource {
  couples: Couple[]
  vendors: Vendor[]
  checklist: ChecklistItem[]
  recommendations: Recommendation[]
  orderReminders: OrderReminder[]
  customerRequests: CustomerRequest[]
  customerReferenceSubmissions: CustomerReferenceSubmission[]
}

/** 홈 화면에서 실제 조치가 필요한 업무만 한 형태로 모은다. */
export function buildDashboardReminders(source: DashboardReminderSource, today = '2026-08-05'): DashboardReminder[] {
  const reminders: DashboardReminder[] = []
  const couple = (id: string) => source.couples.find((item) => item.id === id)
  const vendor = (id: string) => source.vendors.find((item) => item.id === id)

  source.orderReminders
    .filter((item) => item.status === 'pending')
    .forEach((item) => {
      const elapsed = Math.max(0, -dayDifference(item.orderDate, today))
      reminders.push({
        id: `dashboard-order-${item.id}`, kind: 'order', coupleId: item.coupleId,
        title: item.title,
        message: `${couple(item.coupleId)?.partners ?? '고객'} · ${item.vendorId ? vendor(item.vendorId)?.name ?? '업체 확인 필요' : '업체 미지정'}${item.memo ? ` · ${item.memo}` : ''}`,
        meta: elapsed === 0 ? '오늘 등록' : `${elapsed}일 미승인`,
        urgency: elapsed >= 7 ? 'overdue' : elapsed >= 3 ? 'soon' : 'normal',
        href: `/?orderReminder=${item.id}`,
        sourceId: item.id,
      })
    })

  source.customerRequests
    .filter((item) => item.status === 'requested')
    .forEach((item) => reminders.push({
      id: `dashboard-request-${item.id}`, kind: 'customer-request', coupleId: item.coupleId,
      title: '새 고객 요청', message: `${couple(item.coupleId)?.partners ?? '고객'} · ${item.originalText}`,
      meta: item.createdAt.slice(5, 16).replace('T', ' '), urgency: 'soon', href: `/couples/${item.coupleId}?tab=consultations`,
    }))

  source.recommendations
    .filter((item) => item.status === 'pending' || item.status === 'hold')
    .forEach((item) => {
      const days = dayDifference(item.selectionDeadline, today)
      reminders.push({
        id: `dashboard-vendor-${item.id}`, kind: 'vendor-undecided', coupleId: item.coupleId,
        title: days < 0 ? '업체 선택 기한 초과' : '고객 레퍼런스 미결정',
        message: `${couple(item.coupleId)?.partners ?? '고객'} · ${vendor(item.vendorId)?.name ?? '추천 업체'}`,
        meta: days < 0 ? `${Math.abs(days)}일 초과` : `${days}일 남음`, urgency: days < 0 ? 'overdue' : days <= 3 ? 'soon' : 'normal',
        href: `/couples/${item.coupleId}?tab=vendors`,
      })
    })

  source.couples
    .filter((item) => item.status !== '확정')
    .filter((item) => {
      const submission = source.customerReferenceSubmissions.find((entry) => entry.coupleId === item.id)
      return !submission || submission.status === '작성 중'
    })
    .forEach((item) => reminders.push({
      id: `dashboard-taste-${item.id}`, kind: 'taste-unsubmitted', coupleId: item.id,
      title: '고객 취향 미제출', message: `${item.partners} · 내 취향 찾기 자료가 아직 도착하지 않았어요.`,
      meta: '제출 대기', urgency: 'normal', href: `/couples/${item.id}?tab=consultations`,
    }))

  source.checklist
    .filter((item) => item.status !== 'completed' && dayDifference(item.dueDate, today) < 0)
    .forEach((item) => reminders.push({
      id: `dashboard-task-${item.id}`, kind: 'overdue-task', coupleId: item.coupleId,
      title: item.kind === 'decision' ? '미결정 업무 지연' : '마감 업무 지연',
      message: `${couple(item.coupleId)?.partners ?? '고객'} · ${item.title}`,
      meta: `${Math.abs(dayDifference(item.dueDate, today))}일 지연`, urgency: 'overdue', href: `/couples/${item.coupleId}?tab=timeline`,
    }))

  const rank = { overdue: 0, soon: 1, normal: 2 }
  return reminders.sort((a, b) => rank[a.urgency] - rank[b.urgency] || a.title.localeCompare(b.title, 'ko'))
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
