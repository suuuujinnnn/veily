import { useState } from 'react'
import { Building2, CheckCircle2, Clock3, XCircle } from 'lucide-react'
import { useDemoStore } from '../../app/store'
import { Badge, Button, Card } from '../../components/ui'
import { formatDate, formatDateTime } from '../reminders/reminderUtils'
import type { OrderRejectionReason } from '../../types'

export function PartnerApprovalMockPage() {
  const { orderApprovals, couples, vendors, events, approveOrder, rejectOrder } = useDemoStore()
  const [reasons, setReasons] = useState<Record<string, OrderRejectionReason>>({})
  return <div className="partner-approval-page">
    <header className="partner-mock-header"><div><Building2 size={23} /><span>VEILY Partner</span></div><Badge tone="neutral">업체 목업</Badge></header>
    <main><section className="partner-mock-intro"><p className="eyebrow">Order approval</p><h1>예약 가능 여부 확인</h1><p>요청받은 일정과 상품을 확인한 뒤 승인 또는 거절해 주세요.</p></section>
      <div className="partner-order-list">{orderApprovals.map((order) => { const couple = couples.find((item) => item.id === order.coupleId); const vendor = vendors.find((item) => item.id === order.vendorId); const event = events.find((item) => item.id === order.relatedEventId); return <Card key={order.id} className="partner-order-card">
        <div className="partner-order-card__head"><div><small>{vendor?.name}</small><h2>{order.productName}</h2></div><Badge tone={order.status === 'approved' ? 'sage' : order.status === 'rejected' ? 'rose' : order.status === 'pending' ? 'amber' : 'neutral'}>{order.status === 'approved' ? '승인 완료' : order.status === 'rejected' ? '거절' : order.status === 'expired' ? '기한 초과' : '확인 대기'}</Badge></div>
        <dl><div><dt>고객</dt><dd>{couple?.partners}</dd></div><div><dt>일정</dt><dd>{event ? `${formatDate(event.date)} ${event.time}` : '협의 필요'}</dd></div><div><dt>요청 시각</dt><dd>{formatDateTime(order.requestedAt)}</dd></div><div><dt>응답 기한</dt><dd>{formatDateTime(order.approvalDeadline)}</dd></div><div><dt>열람 담당자</dt><dd>{order.reviewerTeam} · {order.reviewerName} {order.reviewerRole}</dd></div><div><dt>열람 시각</dt><dd>{formatDateTime(order.viewedAt)}</dd></div>{order.respondedAt && <div><dt>응답 시각</dt><dd>{formatDateTime(order.respondedAt)}</dd></div>}</dl>
        {order.status === 'pending' ? <div className="partner-order-actions"><Button icon={<CheckCircle2 size={15} />} onClick={() => approveOrder(order.id)}>승인</Button><label><span>거절 사유</span><select value={reasons[order.id] ?? 'schedule-unavailable'} onChange={(event) => setReasons((current) => ({ ...current, [order.id]: event.target.value as OrderRejectionReason }))}><option value="schedule-unavailable">일정 불가</option><option value="product-unavailable">상품 제공 불가</option><option value="other">기타</option></select></label><Button variant="secondary" icon={<XCircle size={15} />} onClick={() => rejectOrder(order.id, reasons[order.id] ?? 'schedule-unavailable')}>거절</Button></div> : <p className="partner-order-complete"><Clock3 size={15} /> 이 요청은 처리되었습니다.</p>}
      </Card> })}</div>
    </main>
  </div>
}
