import { Building2, CalendarClock, CheckCircle2, ExternalLink, RefreshCcw, Send, XCircle } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useDemoStore } from '../../app/store'
import { Badge, Button, Card } from '../../components/ui'
import { formatDate, formatDateTime } from '../reminders/reminderUtils'
import type { OrderApprovalStatus } from '../../types'

const statusMeta: Record<OrderApprovalStatus, { label: string; tone: 'neutral' | 'amber' | 'sage' | 'rose' | 'dark' }> = {
  draft: { label: '발주 전', tone: 'neutral' }, pending: { label: '승인 대기', tone: 'amber' }, approved: { label: '승인 완료', tone: 'sage' }, rejected: { label: '승인 거절', tone: 'rose' }, expired: { label: '기한 초과', tone: 'dark' },
}
const reasonLabel = { 'schedule-unavailable': '일정 불가', 'product-unavailable': '상품 제공 불가', other: '기타 사유' }

export function OrderApprovalPanel({ coupleId }: { coupleId: string }) {
  const { orderApprovals, recommendations, vendors, events, requestOrderApproval, retryOrder } = useDemoStore()
  const orders = orderApprovals.filter((item) => item.coupleId === coupleId)
  const candidates = recommendations
    .filter((item) => item.coupleId === coupleId && item.status === 'liked')
    .filter((item) => !orders.some((order) => order.vendorId === item.vendorId && ['pending', 'approved'].includes(order.status)))

  return <div className="order-approval-workspace">
    <section className="order-approval-intro"><div><p className="eyebrow">Partner approval</p><h2>발주 현황</h2><p>고객이 선택한 업체에 진행 가능 여부를 확인하고, 승인된 일정을 캘린더에 반영합니다.</p></div><Link to="/partner/approvals" target="_blank"><Button variant="secondary" icon={<ExternalLink size={15} />}>업체 목업 열기</Button></Link></section>
    {candidates.length > 0 && <Card className="order-candidate-card"><div><span><Send size={18} /></span><div><strong>발주 승인 요청이 가능한 업체</strong><p>고객이 선택한 업체에 7일 기한으로 진행 가능 여부를 요청합니다.</p></div></div><div>{candidates.map((recommendation) => { const vendor = vendors.find((item) => item.id === recommendation.vendorId); if (!vendor) return null; const relatedEvent = events.find((event) => event.coupleId === coupleId && event.type === vendor.category); return <Button key={recommendation.id} size="sm" onClick={() => requestOrderApproval({ coupleId, vendorId: vendor.id, recommendationId: recommendation.id, productName: `${vendor.category} 진행 패키지`, relatedEventId: relatedEvent?.id })}>{vendor.name} 요청</Button> })}</div></Card>}
    <div className="order-list">{orders.map((order) => { const vendor = vendors.find((item) => item.id === order.vendorId); const event = events.find((item) => item.id === order.relatedEventId); const meta = statusMeta[order.status]; return <Card className={`order-card order-card--${order.status}`} key={order.id}>
      <div className="order-card__head"><div><span><Building2 size={17} /></span><div><small>{vendor?.category ?? '제휴업체'}</small><h3>{vendor?.name ?? '업체 정보 확인 중'}</h3></div></div><Badge tone={meta.tone}>{meta.label}</Badge></div>
      <div className="order-card__facts"><div><span>상품/서비스</span><strong>{order.productName}</strong></div><div><span>관련 일정</span><strong>{event ? `${formatDate(event.date)} ${event.time}` : '일정 미정'}</strong></div><div><span>요청 시각</span><strong>{formatDateTime(order.requestedAt)}</strong></div><div><span>승인 기한</span><strong>{formatDateTime(order.approvalDeadline)}</strong></div><div><span>열람 담당자</span><strong>{order.reviewerTeam} · {order.reviewerName} {order.reviewerRole}</strong></div><div><span>열람 시각</span><strong>{formatDateTime(order.viewedAt)}</strong></div>{order.respondedAt && <div><span>응답 시각</span><strong>{formatDateTime(order.respondedAt)}</strong></div>}{order.confirmedAt && <div><span>확정 처리 시각</span><strong>{formatDateTime(order.confirmedAt)}</strong></div>}</div>
      {order.status === 'approved' && <p className="order-result order-result--success"><CheckCircle2 size={16} /> 업체 승인이 완료되어 관련 일정이 확정되었습니다.</p>}
      {order.status === 'rejected' && <p className="order-result order-result--danger"><XCircle size={16} /> 거절 사유: {order.rejectionReason ? reasonLabel[order.rejectionReason] : '확인 필요'}</p>}
      {['rejected', 'expired'].includes(order.status) && <div className="order-card__actions"><Button size="sm" variant="secondary" icon={<RefreshCcw size={14} />} onClick={() => retryOrder(order.id)}>7일 기한으로 다시 요청</Button><Link to="/vendors"><Button size="sm" variant="ghost">다른 업체 찾기</Button></Link></div>}
      {order.status === 'pending' && <p className="order-result"><CalendarClock size={16} /> 업체에서 일정과 상품 제공 가능 여부를 확인하고 있습니다.</p>}
    </Card>})}</div>
  </div>
}
