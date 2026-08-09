import { useState, type FormEvent, type ReactNode } from 'react'
import { FileText, Landmark, Pencil, Plus, ReceiptText, Trash2, WalletCards } from 'lucide-react'
import { useDemoStore } from '../../app/store'
import { Badge, Button, Card, Modal } from '../../components/ui'
import type { Contract, Payment } from '../../types'

const won = (value: number) => `${value.toLocaleString('ko-KR')}원`
const emptyContract = (coupleId: string): Omit<Contract, 'id'> => ({ coupleId, vendorName: '', category: '드레스', contractDate: '2026-08-10', productName: '', packageDetails: '', paymentMethod: '계좌이체', vatType: '포함', totalPrice: 0, commission: 0, deposit: 0, paymentDate: '', status: '계약진행', contractFile: '', memo: '' })
const emptyPayment = (coupleId: string): Omit<Payment, 'id'> => ({ coupleId, paymentDate: '2026-08-10', type: '계약금', account: '', amount: 0, status: '입금예정', memo: '' })

export function EstimateSettlementPanel({ coupleId }: { coupleId: string }) {
  const store = useDemoStore()
  const coupleContracts = store.contracts.filter((item) => item.coupleId === coupleId)
  const couplePayments = store.payments.filter((item) => item.coupleId === coupleId)
  const total = coupleContracts.reduce((sum, item) => sum + item.totalPrice, 0)
  const paid = couplePayments.filter((item) => item.status === '입금완료').reduce((sum, item) => sum + (item.type === '환불' ? -item.amount : item.amount), 0)
  const commission = coupleContracts.reduce((sum, item) => sum + item.commission, 0)
  const [contractOpen, setContractOpen] = useState(false)
  const [paymentOpen, setPaymentOpen] = useState(false)
  const [contractDraft, setContractDraft] = useState<Contract | Omit<Contract, 'id'>>(emptyContract(coupleId))
  const [paymentDraft, setPaymentDraft] = useState<Payment | Omit<Payment, 'id'>>(emptyPayment(coupleId))
  const editContract = (item?: Contract) => { setContractDraft(item ?? emptyContract(coupleId)); setContractOpen(true) }
  const editPayment = (item?: Payment) => { setPaymentDraft(item ?? emptyPayment(coupleId)); setPaymentOpen(true) }
  const submitContract = (event: FormEvent) => { event.preventDefault(); if ('id' in contractDraft) store.updateContract(contractDraft); else store.addContract(contractDraft); setContractOpen(false) }
  const submitPayment = (event: FormEvent) => { event.preventDefault(); if ('id' in paymentDraft) store.updatePayment(paymentDraft); else store.addPayment(paymentDraft); setPaymentOpen(false) }

  return <>
    <div className="feature-panel-heading"><div><p className="eyebrow">Estimate & settlement</p><h2>견적·정산</h2><p>계약과 입금 내역을 기준으로 잔금을 자동 계산합니다.</p></div><div className="heading-actions"><Button variant="secondary" icon={<Plus size={16} />} onClick={() => editPayment()}>입금 추가</Button><Button icon={<Plus size={16} />} onClick={() => editContract()}>계약 추가</Button></div></div>
    <div className="finance-metrics"><Card><ReceiptText /><span>총 계약금액</span><strong>{won(total)}</strong></Card><Card><WalletCards /><span>입금 완료</span><strong>{won(paid)}</strong></Card><Card><Landmark /><span>남은 잔금</span><strong>{won(Math.max(0, total - paid))}</strong></Card><Card><FileText /><span>플래너 수수료</span><strong>{won(commission)}</strong></Card></div>
    <FinanceTable title="분야별 계약" label="Contracts" headings={['업체·상품','분야','계약일','상태','총액','계약서','관리']} rows={coupleContracts.map((item) => <tr key={item.id}><td><strong>{item.vendorName}</strong><small>{item.productName}</small></td><td>{item.category}</td><td>{item.contractDate}</td><td><Badge tone={item.status === '서명완료' ? 'sage' : item.status === '확인필요' ? 'amber' : 'neutral'}>{item.status}</Badge></td><td><strong>{won(item.totalPrice)}</strong><small>수수료 {won(item.commission)}</small></td><td>{item.contractFile || '미첨부'}</td><td><RowActions onEdit={() => editContract(item)} onDelete={() => store.deleteContract(item.id)} /></td></tr>)} />
    <FinanceTable title="입금 내역" label="Payments" headings={['입금일','구분','계정·업체','상태','금액','관리']} rows={couplePayments.map((item) => <tr key={item.id}><td>{item.paymentDate}</td><td>{item.type}</td><td><strong>{item.account}</strong><small>{item.memo}</small></td><td><Badge tone={item.status === '입금완료' ? 'sage' : item.status === '확인필요' ? 'amber' : 'neutral'}>{item.status}</Badge></td><td>{won(item.amount)}</td><td><RowActions onEdit={() => editPayment(item)} onDelete={() => store.deletePayment(item.id)} /></td></tr>)} />
    <ContractModal open={contractOpen} draft={contractDraft} setDraft={setContractDraft} onClose={() => setContractOpen(false)} onSubmit={submitContract} />
    <PaymentModal open={paymentOpen} draft={paymentDraft} setDraft={setPaymentDraft} onClose={() => setPaymentOpen(false)} onSubmit={submitPayment} />
  </>
}

function FinanceTable({ title, label, headings, rows }: { title: string; label: string; headings: string[]; rows: ReactNode }) { return <section className="finance-section"><div className="section-heading section-heading--compact"><div><p className="eyebrow">{label}</p><h2>{title}</h2></div></div><div className="table-scroll"><table className="data-table finance-table"><thead><tr>{headings.map((heading) => <th key={heading}>{heading}</th>)}</tr></thead><tbody>{rows}</tbody></table></div></section> }
function RowActions({ onEdit, onDelete }: { onEdit: () => void; onDelete: () => void }) { return <div className="row-actions"><button onClick={onEdit} aria-label="수정"><Pencil size={15} /></button><button onClick={onDelete} aria-label="삭제"><Trash2 size={15} /></button></div> }

function ContractModal({ open, draft, setDraft, onClose, onSubmit }: { open: boolean; draft: Contract | Omit<Contract, 'id'>; setDraft: (value: Contract | Omit<Contract, 'id'>) => void; onClose: () => void; onSubmit: (event: FormEvent) => void }) {
  return <Modal open={open} onClose={onClose} title={'id' in draft ? '계약 수정' : '계약 추가'} eyebrow="Contract" footer={<><Button variant="ghost" onClick={onClose}>취소</Button><Button type="submit" form="contract-form">저장</Button></>}><form id="contract-form" className="form-grid" onSubmit={onSubmit}>
    <Field label="업체명"><input required value={draft.vendorName} onChange={(e) => setDraft({ ...draft, vendorName: e.target.value })} /></Field><Field label="분야"><select value={draft.category} onChange={(e) => setDraft({ ...draft, category: e.target.value })}>{['드레스','메이크업','스튜디오','웨딩홀','예물','기타'].map((v) => <option key={v}>{v}</option>)}</select></Field>
    <Field label="상품·품목"><input required value={draft.productName} onChange={(e) => setDraft({ ...draft, productName: e.target.value })} /></Field><Field label="계약일"><input type="date" value={draft.contractDate} onChange={(e) => setDraft({ ...draft, contractDate: e.target.value })} /></Field>
    <Field label="총 계약금액"><input type="number" min="0" value={draft.totalPrice} onChange={(e) => setDraft({ ...draft, totalPrice: Number(e.target.value) })} /></Field><Field label="플래너 수수료"><input type="number" min="0" value={draft.commission} onChange={(e) => setDraft({ ...draft, commission: Number(e.target.value) })} /></Field>
    <Field label="계약금"><input type="number" min="0" value={draft.deposit} onChange={(e) => setDraft({ ...draft, deposit: Number(e.target.value) })} /></Field><Field label="결제 방식"><select value={draft.paymentMethod} onChange={(e) => setDraft({ ...draft, paymentMethod: e.target.value as Contract['paymentMethod'] })}>{['카드','현금','계좌이체'].map((v) => <option key={v}>{v}</option>)}</select></Field>
    <Field label="VAT"><select value={draft.vatType} onChange={(e) => setDraft({ ...draft, vatType: e.target.value as Contract['vatType'] })}>{['포함','별도','면세'].map((v) => <option key={v}>{v}</option>)}</select></Field><Field label="상태"><select value={draft.status} onChange={(e) => setDraft({ ...draft, status: e.target.value as Contract['status'] })}>{['계약진행','결제대기','확인필요','서명완료'].map((v) => <option key={v}>{v}</option>)}</select></Field>
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
