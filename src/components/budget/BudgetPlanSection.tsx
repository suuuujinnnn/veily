import type { ReactNode } from 'react'
import { FileText, Landmark, Pencil, Plus, ReceiptText, Target, Trash2, TrendingDown, TrendingUp, WalletCards } from 'lucide-react'
import { useDemoStore } from '../../app/store'
import type { BudgetItem } from '../../types'
import { Badge, Button, Card } from '../ui'

const won = (value: number) => `${value.toLocaleString('ko-KR')}원`

export function BudgetPlanSection({
  coupleId,
  readOnly = false,
  onAdd,
  onEdit,
  onDelete,
}: {
  coupleId: string
  readOnly?: boolean
  onAdd?: () => void
  onEdit?: (item: BudgetItem) => void
  onDelete?: (item: BudgetItem) => void
}) {
  const store = useDemoStore()
  const budgetItems = store.budgetItems.filter((item) => item.coupleId === coupleId)
  const contracts = store.contracts.filter((item) => item.coupleId === coupleId)
  const payments = store.payments.filter((item) => item.coupleId === coupleId)
  const target = store.budgetPlans.find((item) => item.coupleId === coupleId)?.targetAmount ?? 0
  const planned = budgetItems.reduce((sum, item) => sum + item.plannedAmount, 0)
  const contracted = contracts.reduce((sum, item) => sum + item.totalPrice, 0)
  const paid = payments.reduce((sum, item) => sum + (item.type === '환불' ? -item.amount : item.amount), 0)

  return <section className={`budget-planner ${readOnly ? 'budget-planner--readonly' : ''}`} aria-labelledby={`budget-plan-title-${coupleId}`}>
    <div className="budget-planner__head"><div><p className="eyebrow">Planning budget</p><h2 id={`budget-plan-title-${coupleId}`}>계획 예산</h2><p>국내 웨딩 항목별 계획 금액과 연결된 계약 금액을 비교합니다.</p></div><label className="target-budget"><span><Target size={15} /> 목표 예산</span><div><input aria-label="목표 예산" type="number" min="0" step="100000" value={target} readOnly={readOnly} onChange={(event) => !readOnly && store.updateBudgetPlan({ coupleId, targetAmount: Number(event.target.value) })} /><em>원</em></div></label></div>
    <div className="finance-metrics finance-metrics--six">
      <Metric icon={<Target />} label="목표 예산" value={won(target)} />
      <Metric icon={<FileText />} label="항목별 계획" value={won(planned)} />
      <Metric icon={<ReceiptText />} label="계약 합계" value={won(contracted)} />
      <Metric icon={contracted > planned ? <TrendingUp /> : <TrendingDown />} label="계획 대비" value={`${contracted > planned ? '+' : ''}${won(contracted - planned)}`} tone={contracted > planned ? 'danger' : 'safe'} />
      <Metric icon={<WalletCards />} label="입금" value={won(paid)} />
      <Metric icon={<Landmark />} label="남은 계약 잔금" value={won(Math.max(0, contracted - paid))} />
    </div>
    <div className="budget-table-wrap"><table className="budget-table"><thead><tr><th>분야·품목</th><th>계획 금액</th><th>계약 금액</th><th>차이</th><th>메모</th>{!readOnly && <th>관리</th>}</tr></thead><tbody>{budgetItems.map((item) => {
      const actual = contracts.filter((contract) => contract.budgetItemId === item.id).reduce((sum, contract) => sum + contract.totalPrice, 0)
      const difference = item.plannedAmount - actual
      return <tr key={item.id}><td><Badge tone="neutral">{item.category}</Badge><strong>{item.title}</strong></td><td>{won(item.plannedAmount)}</td><td><strong>{won(actual)}</strong></td><td><span className={difference < 0 ? 'budget-over' : 'budget-safe'}>{difference < 0 ? `${won(Math.abs(difference))} 초과` : `${won(difference)} 여유`}</span></td><td>{item.memo || '—'}</td>{!readOnly && <td><div className="row-actions"><button onClick={() => onEdit?.(item)} aria-label="수정"><Pencil size={15} /></button><button onClick={() => onDelete?.(item)} aria-label="삭제"><Trash2 size={15} /></button></div></td>}</tr>
    })}{!budgetItems.length && <tr><td colSpan={readOnly ? 5 : 6} className="table-empty">아직 등록된 계획 예산 항목이 없습니다.</td></tr>}</tbody></table></div>
    {!readOnly && <Button size="sm" variant="secondary" icon={<Plus size={15} />} onClick={onAdd}>예산 항목 추가</Button>}
  </section>
}

function Metric({ icon, label, value, tone }: { icon: ReactNode; label: string; value: string; tone?: 'danger' | 'safe' }) {
  return <Card className={tone ? `metric-${tone}` : ''}>{icon}<span>{label}</span><strong>{value}</strong></Card>
}
