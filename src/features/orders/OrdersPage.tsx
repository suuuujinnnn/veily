import { Link } from 'react-router-dom'
import { AlertTriangle, ArrowRight, Building2, CalendarClock, CheckCircle2, PackageCheck } from 'lucide-react'
import { DEMO_NOW, useDemoStore } from '../../app/store'
import { Badge, Card } from '../../components/ui'
import type { OrderApprovalStatus } from '../../types'

const statusMeta: Record<OrderApprovalStatus, { label: string; tone: 'neutral' | 'amber' | 'sage' | 'rose'; group: 'ready' | 'waiting' | 'approved' | 'attention' }> = {
  draft: { label: '발주 전', tone: 'neutral', group: 'ready' },
  pending: { label: '승인 대기', tone: 'amber', group: 'waiting' },
  approved: { label: '승인 완료', tone: 'sage', group: 'approved' },
  rejected: { label: '확인 필요', tone: 'rose', group: 'attention' },
  expired: { label: '확인 필요', tone: 'rose', group: 'attention' },
}

export function OrdersPage() {
  const { orderApprovals, vendors, couples } = useDemoStore()
  const waiting = orderApprovals.filter((order) => order.status === 'pending')
  const approved = orderApprovals.filter((order) => order.status === 'approved')
  const attention = orderApprovals.filter((order) => order.status === 'rejected' || order.status === 'expired')

  return <div className="page-stack orders-page">
    <section className="page-intro orders-intro"><div><p className="eyebrow">Order control</p><h1>발주 관리</h1><p>커플별 발주 상태와 업체 응답을 한곳에서 확인하세요.</p></div><Badge tone={attention.length ? 'rose' : 'amber'}>{attention.length ? `확인 필요 ${attention.length}건` : `승인 대기 ${waiting.length}건`}</Badge></section>
    <div className="order-metrics">
      <Card><PackageCheck /><span>전체 발주</span><strong>{orderApprovals.length}</strong></Card>
      <Card className="waiting"><CalendarClock /><span>승인 대기</span><strong>{waiting.length}</strong></Card>
      <Card className="approved"><CheckCircle2 /><span>승인 완료</span><strong>{approved.length}</strong></Card>
      <Card className="attention"><AlertTriangle /><span>확인 필요</span><strong>{attention.length}</strong></Card>
    </div>
    <section className="order-board" aria-label="커플별 발주 목록">
      {orderApprovals.map((order) => {
        const vendor = vendors.find((item) => item.id === order.vendorId)
        const couple = couples.find((item) => item.id === order.coupleId)
        const meta = statusMeta[order.status]
        const days = Math.max(0, Math.floor((new Date(DEMO_NOW).getTime() - new Date(order.requestedAt).getTime()) / 86_400_000))
        return <Card key={order.id} className={`order-row order-row--${meta.group}`}>
          <div className={`order-couple order-couple--${couple?.tone ?? 'sand'}`}><span>{couple?.initials}</span><div><small>COUPLE</small><strong>{couple?.partners}</strong><em>{couple?.weddingDate.replaceAll('-', '.')}</em></div></div>
          <div className="order-vendor"><span><Building2 size={16} /></span><div><Badge tone={meta.tone}>{meta.label}</Badge><h3>{vendor?.name ?? '업체 확인 필요'}</h3><p>{order.productName}</p></div></div>
          <div className="order-date"><small>요청일</small><strong>{order.requestedAt.slice(0, 10).replaceAll('-', '.')}</strong></div>
          <div className="order-wait"><small>{order.status === 'pending' ? '대기 경과' : '처리 결과'}</small><strong>{order.status === 'pending' ? `${days}일째` : meta.label}</strong></div>
          <Link to={`/couples/${order.coupleId}?tab=orders`}>상세 보기 <ArrowRight size={13} /></Link>
        </Card>
      })}
    </section>
  </div>
}
