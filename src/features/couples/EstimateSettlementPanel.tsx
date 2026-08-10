import { useState, type FormEvent, type ReactNode } from 'react'
import { AlertTriangle, FileText, Landmark, Pencil, Plus, ReceiptText, Target, Trash2, TrendingDown, TrendingUp, WalletCards } from 'lucide-react'
import { useDemoStore } from '../../app/store'
import { Badge, Button, Card, Modal } from '../../components/ui'
import type { BudgetCategory, BudgetItem, Contract, Payment } from '../../types'

const won = (value: number) => `${value.toLocaleString('ko-KR')}원`
const budgetCategories: BudgetCategory[] = ['웨딩홀·식대', '스튜디오·드레스·메이크업', '본식·기록', '예복·예물', '초대·하객', '연출·플라워', '혼주·교통', '허니문·행정', '기타']
const emptyContract = (coupleId: string): Omit<Contract, 'id'> => ({ coupleId, vendorName: '', category: '드레스', contractDate: '2026-08-10', productName: '', packageDetails: '', paymentMethod: '계좌이체', vatType: '포함', totalPrice: 0, commission: 0, deposit: 0, paymentDate: '', status: '계약진행', contractFile: '', memo: '', budgetItemId: undefined })
const emptyPayment = (coupleId: string): Omit<Payment, 'id'> => ({ coupleId, paymentDate: '2026-08-10', type: '계약금', account: '', amount: 0, status: '입금예정', memo: '' })
const emptyBudgetItem = (coupleId: string): Omit<BudgetItem, 'id'> => ({ coupleId, category: '웨딩홀·식대', title: '', plannedAmount: 0, memo: '' })

export function EstimateSettlementPanel({ coupleId }: { coupleId: string }) {
  const store = useDemoStore()
  const coupleContracts = store.contracts.filter((item) => item.coupleId === coupleId)
  const couplePayments = store.payments.filter((item) => item.coupleId === coupleId)
  const budgetItems = store.budgetItems.filter((item) => item.coupleId === coupleId)
  const target = store.budgetPlans.find((item) => item.coupleId === coupleId)?.targetAmount ?? 0
  const planned = budgetItems.reduce((sum, item) => sum + item.plannedAmount, 0)
  const contracted = coupleContracts.reduce((sum, item) => sum + item.totalPrice, 0)
  const paid = couplePayments.filter((item) => item.status === '입금완료').reduce((sum, item) => sum + (item.type === '환불' ? -item.amount : item.amount), 0)
  const commission = coupleContracts.reduce((sum, item) => sum + item.commission, 0)
  const unclassified = coupleContracts.filter((item) => !item.budgetItemId || !budgetItems.some((budget) => budget.id === item.budgetItemId))
  const [contractOpen, setContractOpen] = useState(false)
  const [paymentOpen, setPaymentOpen] = useState(false)
  const [budgetOpen, setBudgetOpen] = useState(false)
  const [contractDraft, setContractDraft] = useState<Contract | Omit<Contract, 'id'>>(emptyContract(coupleId))
  const [paymentDraft, setPaymentDraft] = useState<Payment | Omit<Payment, 'id'>>(emptyPayment(coupleId))
  const [budgetDraft, setBudgetDraft] = useState<BudgetItem | Omit<BudgetItem, 'id'>>(emptyBudgetItem(coupleId))
  const editContract = (item?: Contract) => { setContractDraft(item ?? emptyContract(coupleId)); setContractOpen(true) }
  const editPayment = (item?: Payment) => { setPaymentDraft(item ?? emptyPayment(coupleId)); setPaymentOpen(true) }
  const editBudget = (item?: BudgetItem) => { setBudgetDraft(item ?? emptyBudgetItem(coupleId)); setBudgetOpen(true) }
  const submitContract = (event: FormEvent) => { event.preventDefault(); if ('id' in contractDraft) store.updateContract(contractDraft); else store.addContract(contractDraft); setContractOpen(false) }
  const submitPayment = (event: FormEvent) => { event.preventDefault(); if ('id' in paymentDraft) store.updatePayment(paymentDraft); else store.addPayment(paymentDraft); setPaymentOpen(false) }
  const submitBudget = (event: FormEvent) => { event.preventDefault(); if (!budgetDraft.title.trim()) return; const next = { ...budgetDraft, title: budgetDraft.title.trim() }; if ('id' in next) store.updateBudgetItem(next); else store.addBudgetItem(next); setBudgetOpen(false) }

  return <>
    <div className="feature-panel-heading"><div><p className="eyebrow">Budget, estimate & settlement</p><h2>예산·견적·정산</h2><p>처음 세운 계획부터 계약과 실제 입금까지 한 흐름으로 관리합니다.</p></div><div className="heading-actions"><Button variant="secondary" icon={<Plus size={16} />} onClick={() => editPayment()}>입금 추가</Button><Button icon={<Plus size={16} />} onClick={() => editContract()}>계약 추가</Button></div></div>

    <section className="budget-planner" aria-labelledby="budget-plan-title">
      <div className="budget-planner__head"><div><p className="eyebrow">Planning budget</p><h2 id="budget-plan-title">계획 예산</h2><p>국내 웨딩 항목별 계획 금액과 연결된 계약 금액을 비교합니다.</p></div><label className="target-budget"><span><Target size={15} /> 목표 예산</span><div><input type="number" min="0" step="100000" value={target} onChange={(event) => store.updateBudgetPlan({ coupleId, targetAmount: Number(event.target.value) })} /><em>원</em></div></label></div>
      <div className="finance-metrics finance-metrics--six">
        <Metric icon={<Target />} label="목표 예산" value={won(target)} />
        <Metric icon={<FileText />} label="항목별 계획" value={won(planned)} />
        <Metric icon={<ReceiptText />} label="계약 합계" value={won(contracted)} />
        <Metric icon={contracted > planned ? <TrendingUp /> : <TrendingDown />} label="계획 대비" value={`${contracted > planned ? '+' : ''}${won(contracted - planned)}`} tone={contracted > planned ? 'danger' : 'safe'} />
        <Metric icon={<WalletCards />} label="입금 완료" value={won(paid)} />
        <Metric icon={<Landmark />} label="남은 계약 잔금" value={won(Math.max(0, contracted - paid))} />
      </div>
      <div className="budget-table-wrap"><table className="budget-table"><thead><tr><th>분야·품목</th><th>계획 금액</th><th>계약 금액</th><th>차이</th><th>메모</th><th>관리</th></tr></thead><tbody>{budgetItems.map((item) => {
        const actual = coupleContracts.filter((contract) => contract.budgetItemId === item.id).reduce((sum, contract) => sum + contract.totalPrice, 0)
        const difference = item.plannedAmount - actual
        return <tr key={item.id}><td><Badge tone="neutral">{item.category}</Badge><strong>{item.title}</strong></td><td>{won(item.plannedAmount)}</td><td><strong>{won(actual)}</strong></td><td><span className={difference < 0 ? 'budget-over' : 'budget-safe'}>{difference < 0 ? `${won(Math.abs(difference))} 초과` : `${won(difference)} 여유`}</span></td><td>{item.memo || '—'}</td><td><RowActions onEdit={() => editBudget(item)} onDelete={() => { if (window.confirm('이 예산 항목을 삭제할까요? 연결된 계약은 미분류로 전환됩니다.')) store.deleteBudgetItem(item.id) }} /></td></tr>
      })}{!budgetItems.length && <tr><td colSpan={6} className="table-empty">첫 예산 항목을 추가해 계획을 시작하세요.</td></tr>}</tbody></table></div>
      <Button size="sm" variant="secondary" icon={<Plus size={15} />} onClick={() => editBudget()}>예산 항목 추가</Button>
    </section>

    {unclassified.length > 0 && <div className="unclassified-alert" role="status"><AlertTriangle size={18} /><div><strong>미분류 계약 {unclassified.length}건</strong><span>계약 수정에서 예산 항목을 연결하면 분야별 실제 비용에 반영됩니다. 계약 합계에는 이미 포함되어 있습니다.</span></div></div>}
    <FinanceTable title="분야별 계약" label="Contracts" headings={['업체·상품','분야','예산 연결','계약일','상태','총액','계약서','관리']} rows={coupleContracts.map((item) => <tr key={item.id}><td><strong>{item.vendorName}</strong><small>{item.productName}</small></td><td>{item.category}</td><td>{budgetItems.find((budget) => budget.id === item.budgetItemId)?.title ?? <Badge tone="amber">미분류</Badge>}</td><td>{item.contractDate}</td><td><Badge tone={item.status === '서명완료' ? 'sage' : item.status === '확인필요' ? 'amber' : 'neutral'}>{item.status}</Badge></td><td><strong>{won(item.totalPrice)}</strong><small>수수료 {won(item.commission)}</small></td><td>{item.contractFile || '미첨부'}</td><td><RowActions onEdit={() => editContract(item)} onDelete={() => store.deleteContract(item.id)} /></td></tr>)} />
    <FinanceTable title="입금 내역" label="Payments" headings={['입금일','구분','계정·업체','상태','금액','관리']} rows={couplePayments.map((item) => <tr key={item.id}><td>{item.paymentDate}</td><td>{item.type}</td><td><strong>{item.account}</strong><small>{item.memo}</small></td><td><Badge tone={item.status === '입금완료' ? 'sage' : item.status === '확인필요' ? 'amber' : 'neutral'}>{item.status}</Badge></td><td>{item.type === '환불' ? '-' : ''}{won(item.amount)}</td><td><RowActions onEdit={() => editPayment(item)} onDelete={() => store.deletePayment(item.id)} /></td></tr>)} />
    <BudgetItemModal open={budgetOpen} draft={budgetDraft} setDraft={setBudgetDraft} onClose={() => setBudgetOpen(false)} onSubmit={submitBudget} />
    <ContractModal open={contractOpen} draft={contractDraft} setDraft={setContractDraft} budgetItems={budgetItems} onClose={() => setContractOpen(false)} onSubmit={submitContract} />
    <PaymentModal open={paymentOpen} draft={paymentDraft} setDraft={setPaymentDraft} onClose={() => setPaymentOpen(false)} onSubmit={submitPayment} />
  </>
}

function Metric({ icon, label, value, tone }: { icon: ReactNode; label: string; value: string; tone?: 'danger' | 'safe' }) { return <Card className={tone ? `metric-${tone}` : ''}>{icon}<span>{label}</span><strong>{value}</strong></Card> }
function FinanceTable({ title, label, headings, rows }: { title: string; label: string; headings: string[]; rows: ReactNode }) { return <section className="finance-section"><div className="section-heading section-heading--compact"><div><p className="eyebrow">{label}</p><h2>{title}</h2></div></div><div className="table-scroll"><table className="data-table finance-table"><thead><tr>{headings.map((heading) => <th key={heading}>{heading}</th>)}</tr></thead><tbody>{rows}</tbody></table></div></section> }
function RowActions({ onEdit, onDelete }: { onEdit: () => void; onDelete: () => void }) { return <div className="row-actions"><button onClick={onEdit} aria-label="수정"><Pencil size={15} /></button><button onClick={onDelete} aria-label="삭제"><Trash2 size={15} /></button></div> }

function BudgetItemModal({ open, draft, setDraft, onClose, onSubmit }: { open: boolean; draft: BudgetItem | Omit<BudgetItem, 'id'>; setDraft: (value: BudgetItem | Omit<BudgetItem, 'id'>) => void; onClose: () => void; onSubmit: (event: FormEvent) => void }) {
  return <Modal open={open} onClose={onClose} title={'id' in draft ? '예산 항목 수정' : '예산 항목 추가'} eyebrow="Budget item" footer={<><Button variant="ghost" onClick={onClose}>취소</Button><Button type="submit" form="budget-item-form">저장</Button></>}><form id="budget-item-form" className="form-grid" onSubmit={onSubmit}>
    <Field label="분야"><select value={draft.category} onChange={(event) => setDraft({ ...draft, category: event.target.value as BudgetCategory })}>{budgetCategories.map((category) => <option key={category}>{category}</option>)}</select></Field>
    <Field label="품목명"><input required autoFocus value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} placeholder="예: 본식 스냅" /></Field>
    <Field label="계획 금액"><input type="number" min="0" step="10000" value={draft.plannedAmount} onChange={(event) => setDraft({ ...draft, plannedAmount: Number(event.target.value) })} /></Field>
    <Field label="메모"><input value={draft.memo} onChange={(event) => setDraft({ ...draft, memo: event.target.value })} placeholder="범위나 추가금 조건" /></Field>
  </form></Modal>
}

function ContractModal({ open, draft, setDraft, budgetItems, onClose, onSubmit }: { open: boolean; draft: Contract | Omit<Contract, 'id'>; setDraft: (value: Contract | Omit<Contract, 'id'>) => void; budgetItems: BudgetItem[]; onClose: () => void; onSubmit: (event: FormEvent) => void }) {
  return <Modal open={open} onClose={onClose} title={'id' in draft ? '계약 수정' : '계약 추가'} eyebrow="Contract" footer={<><Button variant="ghost" onClick={onClose}>취소</Button><Button type="submit" form="contract-form">저장</Button></>}><form id="contract-form" className="form-grid" onSubmit={onSubmit}>
    <Field label="업체명"><input required value={draft.vendorName} onChange={(e) => setDraft({ ...draft, vendorName: e.target.value })} /></Field><Field label="분야"><select value={draft.category} onChange={(e) => setDraft({ ...draft, category: e.target.value })}>{['드레스','메이크업','스튜디오','웨딩홀','예물','기타'].map((v) => <option key={v}>{v}</option>)}</select></Field>
    <Field label="상품·품목"><input required value={draft.productName} onChange={(e) => setDraft({ ...draft, productName: e.target.value })} /></Field><Field label="연결할 예산 항목"><select value={draft.budgetItemId ?? ''} onChange={(e) => setDraft({ ...draft, budgetItemId: e.target.value || undefined })}><option value="">미분류</option>{budgetItems.map((item) => <option value={item.id} key={item.id}>{item.category} · {item.title}</option>)}</select></Field>
    <Field label="계약일"><input type="date" value={draft.contractDate} onChange={(e) => setDraft({ ...draft, contractDate: e.target.value })} /></Field><Field label="총 계약금액"><input type="number" min="0" value={draft.totalPrice} onChange={(e) => setDraft({ ...draft, totalPrice: Number(e.target.value) })} /></Field>
    <Field label="플래너 수수료"><input type="number" min="0" value={draft.commission} onChange={(e) => setDraft({ ...draft, commission: Number(e.target.value) })} /></Field><Field label="계약금"><input type="number" min="0" value={draft.deposit} onChange={(e) => setDraft({ ...draft, deposit: Number(e.target.value) })} /></Field>
    <Field label="결제 방식"><select value={draft.paymentMethod} onChange={(e) => setDraft({ ...draft, paymentMethod: e.target.value as Contract['paymentMethod'] })}>{['카드','현금','계좌이체'].map((v) => <option key={v}>{v}</option>)}</select></Field><Field label="VAT"><select value={draft.vatType} onChange={(e) => setDraft({ ...draft, vatType: e.target.value as Contract['vatType'] })}>{['포함','별도','면세'].map((v) => <option key={v}>{v}</option>)}</select></Field>
    <Field label="상태"><select value={draft.status} onChange={(e) => setDraft({ ...draft, status: e.target.value as Contract['status'] })}>{['계약진행','결제대기','확인필요','서명완료'].map((v) => <option key={v}>{v}</option>)}</select></Field><Field label="비고"><input value={draft.memo} onChange={(e) => setDraft({ ...draft, memo: e.target.value })} /></Field>
    <label className="form-field form-field--wide"><span>계약 구성</span><textarea rows={3} value={draft.packageDetails} onChange={(e) => setDraft({ ...draft, packageDetails: e.target.value })} /></label><label className="form-field form-field--wide"><span>계약서 업로드</span><input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => setDraft({ ...draft, contractFile: e.target.files?.[0]?.name ?? draft.contractFile })} /><small>{draft.contractFile || '파일명만 목업 상태에 표시됩니다.'}</small></label>
  </form></Modal>
}

function PaymentModal({ open, draft, setDraft, onClose, onSubmit }: { open: boolean; draft: Payment | Omit<Payment, 'id'>; setDraft: (value: Payment | Omit<Payment, 'id'>) => void; onClose: () => void; onSubmit: (event: FormEvent) => void }) {
  return <Modal open={open} onClose={onClose} title={'id' in draft ? '입금 수정' : '입금 추가'} eyebrow="Payment" footer={<><Button variant="ghost" onClick={onClose}>취소</Button><Button type="submit" form="payment-form">저장</Button></>}><form id="payment-form" className="form-grid" onSubmit={onSubmit}>
    <Field label="입금일"><input type="date" value={draft.paymentDate} onChange={(e) => setDraft({ ...draft, paymentDate: e.target.value })} /></Field><Field label="구분"><select value={draft.type} onChange={(e) => setDraft({ ...draft, type: e.target.value as Payment['type'] })}>{['계약금','중도금','잔금','환불','기타'].map((v) => <option key={v}>{v}</option>)}</select></Field>
    <Field label="계정·업체"><input required value={draft.account} onChange={(e) => setDraft({ ...draft, account: e.target.value })} /></Field><Field label="금액"><input type="number" min="0" value={draft.amount} onChange={(e) => setDraft({ ...draft, amount: Number(e.target.value) })} /></Field>
    <Field label="상태"><select value={draft.status} onChange={(e) => setDraft({ ...draft, status: e.target.value as Payment['status'] })}>{['입금예정','입금완료','확인필요'].map((v) => <option key={v}>{v}</option>)}</select></Field><Field label="비고"><input value={draft.memo} onChange={(e) => setDraft({ ...draft, memo: e.target.value })} /></Field>
  </form></Modal>
}

function Field({ label, children }: { label: string; children: ReactNode }) { return <label className="form-field"><span>{label}</span>{children}</label> }
