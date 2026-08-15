import { Link } from 'react-router-dom'
import { AlertTriangle, ArrowRight, CheckCircle2, Clock3, PackageCheck, Send, TimerReset } from 'lucide-react'
import { DEMO_NOW, useDemoStore } from '../../app/store'
import { Badge, Card } from '../../components/ui'
import type { OrderApproval, OrderApprovalStatus } from '../../types'

type WorkflowStatus = 'draft' | 'ordered' | 'reverse-pending' | 'approved'

const workflowStatuses: WorkflowStatus[] = ['draft', 'ordered', 'reverse-pending', 'approved']
const statusMeta: Record<OrderApprovalStatus, { label: string; group: 'ready' | 'ordered' | 'waiting' | 'approved' | 'attention' }> = {
  draft: { label: '발주 전', group: 'ready' },
  ordered: { label: '발주 완료', group: 'ordered' },
  'reverse-pending': { label: '역발주 대기', group: 'waiting' },
  approved: { label: '승인 완료', group: 'approved' },
  rejected: { label: '확인 필요', group: 'attention' },
  expired: { label: '확인 필요', group: 'attention' },
}

const dateLabel = (value?: string) => value ? value.slice(0, 10).replaceAll('-', '.') : '—'
const elapsedDays = (order: OrderApproval) => Math.max(0, Math.floor((new Date(DEMO_NOW).getTime() - new Date(order.requestedAt).getTime()) / 86_400_000))

export function OrdersPage() {
  const { orderApprovals, vendors, couples, updateOrderApproval } = useDemoStore()
  const reversePending = orderApprovals.filter((order) => order.status === 'reverse-pending')
  const approved = orderApprovals.filter((order) => order.status === 'approved')
  const longPending = reversePending.filter((order) => elapsedDays(order) >= 7)

  const changeStatus = (order: OrderApproval, status: WorkflowStatus) => {
    updateOrderApproval(order.id, {
      status,
      confirmedAt: status === 'approved' ? DEMO_NOW : undefined,
      respondedAt: status === 'approved' ? DEMO_NOW : undefined,
    })
  }

  return <div className="page-stack orders-page">
    <section className="page-intro orders-intro"><div><p className="eyebrow">Order control</p><h1>발주 관리</h1><p>발주부터 업체의 역발주 승인까지 커플별 진행 상태를 관리하세요.</p></div><Badge tone={longPending.length ? 'rose' : 'amber'}>{longPending.length ? `장기 미승인 ${longPending.length}건` : `역발주 대기 ${reversePending.length}건`}</Badge></section>

    <div className="order-metrics">
      <Card><PackageCheck /><span>전체 발주</span><strong>{orderApprovals.length}</strong></Card>
      <Card className="ordered"><Send /><span>발주 완료</span><strong>{orderApprovals.filter((order) => order.status === 'ordered').length}</strong></Card>
      <Card className="waiting"><TimerReset /><span>역발주 대기</span><strong>{reversePending.length}</strong></Card>
      <Card className="approved"><CheckCircle2 /><span>승인 완료</span><strong>{approved.length}</strong></Card>
    </div>

    {longPending.length > 0 && <div className="order-pending-alert"><AlertTriangle size={17} /><div><strong>7일 이상 승인되지 않은 발주가 {longPending.length}건 있습니다.</strong><span>업체에 재확인하거나 현재 상태를 직접 변경해 주세요.</span></div></div>}

    <section className="order-board" aria-label="커플별 발주 목록">
      {orderApprovals.map((order) => {
        const vendor = vendors.find((item) => item.id === order.vendorId)
        const couple = couples.find((item) => item.id === order.coupleId)
        const meta = statusMeta[order.status]
        const days = elapsedDays(order)
        const isLongPending = order.status === 'reverse-pending' && days >= 7
        return <Card key={order.id} className={`order-record order-record--${meta.group} ${isLongPending ? 'order-record--overdue' : ''}`}>
          <header className="order-record__header">
            <div className="order-record__identity"><span className="order-record__initials">{couple?.initials}</span><div><small>고객</small><h2>{couple?.partners}</h2><p>{vendor?.name ?? '업체 확인 필요'} · {order.productName}</p></div></div>
            <span className={`order-status-pill order-status-pill--${meta.group}`}>{meta.label}</span>
          </header>

          <div className="order-workflow" aria-label="발주 진행 단계">{workflowStatuses.map((status, index) => { const activeIndex = workflowStatuses.indexOf(order.status as WorkflowStatus); return <span className={activeIndex >= index ? `active active--${status}` : ''} key={status}><i>{activeIndex > index ? '✓' : index + 1}</i>{statusMeta[status].label}</span> })}</div>

          <div className="order-record__facts">
            <div><small>발주일</small><strong>{order.status === 'draft' ? '미발주' : dateLabel(order.requestedAt)}</strong></div>
            <div><small>현재 상태</small><strong>{meta.label}</strong></div>
            <div><small>승인 여부</small><strong>{order.status === 'approved' ? '승인' : '미승인'}</strong></div>
            <div><small>승인일</small><strong>{dateLabel(order.confirmedAt)}</strong></div>
            <div className={isLongPending ? 'danger' : ''}><small>미승인 경과일</small><strong>{order.status === 'reverse-pending' ? `${days}일` : '—'}</strong></div>
          </div>

          <div className="order-record__controls">
            <label><span>상태 변경</span><select value={workflowStatuses.includes(order.status as WorkflowStatus) ? order.status : 'reverse-pending'} onChange={(event) => changeStatus(order, event.target.value as WorkflowStatus)}>{workflowStatuses.map((status) => <option value={status} key={status}>{statusMeta[status].label}</option>)}</select></label>
            <label className="order-record__memo"><span>메모</span><input defaultValue={order.memo ?? ''} placeholder="업체 확인 사항이나 후속 업무를 입력하세요" onBlur={(event) => updateOrderApproval(order.id, { memo: event.target.value })} /></label>
            <Link to={`/couples/${order.coupleId}?tab=orders`}>커플 상세 <ArrowRight size={13} /></Link>
          </div>
          {isLongPending && <p className="order-record__warning"><Clock3 size={14} /> 역발주 승인 대기 {days}일째 · 업체 재확인이 필요합니다.</p>}
        </Card>
      })}
    </section>
  </div>
}
