import type { Couple, CustomerFollowUp, OrderReminder, Vendor } from '../../types'

export type PlannerTodoKind = 'order' | 'follow-up'
export type PlannerTodoUrgency = 'overdue' | 'today' | 'upcoming'

export interface PlannerTodoItem {
  id: string
  kind: PlannerTodoKind
  sourceId: string
  coupleId: string
  customerName: string
  title: string
  context: string
  dueAt: string
  createdAt: string
  completed: boolean
  urgency: PlannerTodoUrgency
  href: string
}

interface TodoSource {
  couples: Couple[]
  vendors: Vendor[]
  orderReminders: OrderReminder[]
  customerFollowUps: CustomerFollowUp[]
}

const datePart = (value: string) => value.slice(0, 10)
const urgencyFor = (dueAt: string, today: string): PlannerTodoUrgency => datePart(dueAt) < today ? 'overdue' : datePart(dueAt) === today ? 'today' : 'upcoming'

export function buildPlannerTodos(source: TodoSource, today = '2026-08-05'): PlannerTodoItem[] {
  const couple = (id: string) => source.couples.find((item) => item.id === id)
  const vendor = (id?: string) => id ? source.vendors.find((item) => item.id === id) : undefined
  const todos: PlannerTodoItem[] = []

  source.orderReminders.forEach((item) => todos.push({
    id: `order-${item.id}`,
    kind: 'order',
    sourceId: item.id,
    coupleId: item.coupleId,
    customerName: couple(item.coupleId)?.partners ?? '고객',
    title: item.title,
    context: vendor(item.vendorId)?.name ?? '업체 미지정',
    dueAt: item.reminderDate,
    createdAt: item.orderDate,
    completed: item.status === 'completed',
    urgency: urgencyFor(item.reminderDate, today),
    href: `/reminders?view=order&item=order-${item.id}`,
  }))

  source.customerFollowUps.forEach((item) => todos.push({
    id: `followup-${item.id}`,
    kind: 'follow-up',
    sourceId: item.id,
    coupleId: item.coupleId,
    customerName: couple(item.coupleId)?.partners ?? '고객',
    title: item.title,
    context: `${item.kind} · 고객 화면`,
    dueAt: item.dueAt,
    createdAt: item.sentAt,
    completed: item.status !== 'waiting',
    urgency: urgencyFor(item.dueAt, today),
    href: `/reminders?view=follow-up&item=followup-${item.id}`,
  }))

  const rank = { overdue: 0, today: 1, upcoming: 2 }
  return todos.sort((a, b) => Number(a.completed) - Number(b.completed) || rank[a.urgency] - rank[b.urgency] || a.dueAt.localeCompare(b.dueAt) || b.createdAt.localeCompare(a.createdAt))
}

export function todoCounts(items: PlannerTodoItem[]) {
  const open = items.filter((item) => !item.completed)
  return {
    all: open.length,
    order: open.filter((item) => item.kind === 'order').length,
    followUp: open.filter((item) => item.kind === 'follow-up').length,
    overdue: open.filter((item) => item.urgency === 'overdue').length,
    today: open.filter((item) => item.urgency === 'today').length,
  }
}
