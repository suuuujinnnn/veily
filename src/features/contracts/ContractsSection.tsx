import { FileText, Pencil, Plus, Trash2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Badge, Button, Modal } from '../../components/ui'
import type { Contract } from '../../types'

const categoryTabs = ['전체', '스드메', '혼수', '예식장', '입금내역'] as const
const contractCategories = ['스드메', '혼수', '예식장', '예물', '기타'] as const
const itemOptions: Record<string, string[]> = {
  스드메: ['스튜디오', '드레스', '메이크업'],
  혼수: ['혼수가전', '가구', '침구', '기타'],
  예식장: ['웨딩홀', '대관', '식대', '기타'],
  예물: ['반지', '예물', '예복', '기타'],
  기타: ['기타'],
}

interface ContractsSectionProps {
  coupleId: string
  contracts: Contract[]
  addContract: (contract: Omit<Contract, 'id'>) => void
  updateContract: (contract: Contract) => void
  deleteContract: (id: string) => void
}

type FormState = Omit<Contract, 'id' | 'coupleId'>

const emptyForm: FormState = {
  vendorName: '',
  category: '스드메',
  item: '스튜디오',
  contractDate: '',
  contractFileName: '',
  productName: '',
  payment: '계좌이체',
  vatIncluded: false,
  amount: '',
  depositAmount: '',
  commission: '',
  depositDate: '',
  status: '대기',
  details: '',
  commissionInfo: '',
  memo: '',
  depositType: '입금',
  depositAccount: '',
  depositNote: '',
  depositStatus: '대기',
}

function moneyValue(value = '') {
  const number = Number(value.replace(/[^0-9-]/g, ''))
  return Number.isFinite(number) ? number : 0
}

function moneyLabel(value: number) {
  return value.toLocaleString('ko-KR')
}

function groupOf(contract: Contract) {
  if (['스튜디오', '드레스', '메이크업', '스드메'].includes(contract.category) || ['스튜디오', '드레스', '메이크업'].includes(contract.item ?? '')) return '스드메'
  if (contract.category === '예식장') return '예식장'
  return '혼수'
}

function visibleInTab(contract: Contract, tab: string) {
  if (tab === '전체') return true
  if (tab === '입금내역') return true
  return groupOf(contract) === tab
}

export function ContractsSection({ coupleId, contracts, addContract, updateContract, deleteContract }: ContractsSectionProps) {
  const [activeTab, setActiveTab] = useState<(typeof categoryTabs)[number]>('전체')
  const [editing, setEditing] = useState<Contract | null>(null)
  const [formOpen, setFormOpen] = useState(false)
  const [form, setForm] = useState<FormState>(emptyForm)
  const filteredContracts = contracts.filter((contract) => visibleInTab(contract, activeTab))
  const groupedContracts = useMemo(() => ['스드메', '혼수', '예식장'].map((group) => ({
    group,
    items: filteredContracts.filter((contract) => groupOf(contract) === group),
  })), [filteredContracts])
  const depositRows = contracts.filter((contract) => contract.depositAmount || contract.amount)
  const contractTotal = filteredContracts.reduce((sum, contract) => sum + moneyValue(contract.amount), 0)
  const paidTotal = depositRows.reduce((sum, contract) => sum + moneyValue(contract.depositAmount || contract.amount), 0)

  const openCreate = (category: FormState['category'] = '스드메') => {
    setEditing(null)
    setForm({ ...emptyForm, category, item: itemOptions[category]?.[0] ?? '기타' })
    setFormOpen(true)
  }

  const openEdit = (contract: Contract) => {
    setEditing(contract)
    setForm({ ...emptyForm, ...contract })
    setFormOpen(true)
  }

  const updateForm = (key: keyof FormState, value: string | boolean | undefined) => {
    if (key === 'category') {
      const category = String(value) as FormState['category']
      setForm((current) => ({ ...current, category, item: itemOptions[category]?.[0] ?? '기타' }))
      return
    }
    setForm((current) => ({ ...current, [key]: value }))
  }

  const closeForm = () => {
    setEditing(null)
    setFormOpen(false)
    setForm(emptyForm)
  }

  const saveForm = () => {
    if (!form.vendorName.trim()) return
    if (editing) updateContract({ ...editing, ...form })
    else addContract({ coupleId, ...form })
    closeForm()
  }

  const showContractGroups = activeTab !== '입금내역'

  return (
    <section className="contracts-workspace">
      <div className="contracts-toolbar">
        <div className="contract-category-tabs">
          {categoryTabs.map((category) => <button key={category} className={activeTab === category ? 'active' : ''} onClick={() => setActiveTab(category)}>{category}</button>)}
        </div>
        <Button icon={<Plus size={15} />} onClick={() => openCreate(activeTab === '혼수' ? '혼수' : activeTab === '예식장' ? '예식장' : '스드메')}>등록</Button>
      </div>

      {showContractGroups && groupedContracts.map(({ group, items }) => {
        const total = items.reduce((sum, contract) => sum + moneyValue(contract.amount), 0)
        return (
          <section className="contract-ledger" key={group}>
            <header className="contract-ledger__head">
              <h2>{group}</h2>
              <span>{items.length}건</span>
            </header>
            <div className="contract-table-scroll">
              <table className="contract-ledger-table">
                <thead>
                  <tr>
                    <th>계약일</th>
                    <th>품목</th>
                    <th>업체명</th>
                    <th>계약서</th>
                    <th>상품명</th>
                    <th>세부 구성</th>
                    <th>결제</th>
                    <th>VAT</th>
                    <th>계약총액</th>
                    <th>수수료</th>
                    <th>입금일</th>
                    <th>상태</th>
                    <th>관리</th>
                  </tr>
                </thead>
                <tbody>
                  {items.length ? items.map((contract) => (
                    <tr key={contract.id}>
                      <td>{contract.contractDate || '-'}</td>
                      <td>{contract.item || contract.category}</td>
                      <td>{contract.vendorName}</td>
                      <td><span className="contract-file"><FileText size={14} /> {contract.contractFileName || '-'}</span></td>
                      <td>{contract.productName || '-'}</td>
                      <td>{contract.details || '-'}</td>
                      <td>{contract.payment}</td>
                      <td>{contract.vatIncluded ? 'VAT 포함' : 'VAT 별도'}</td>
                      <td>{contract.amount || '0'}</td>
                      <td>{contract.commission || '0'}</td>
                      <td>{contract.depositDate || '-'}</td>
                      <td><Badge tone={contract.status === '대기' || contract.status === '확인필요' || contract.status === '결제대기' ? 'amber' : 'sage'}>{contract.status}</Badge></td>
                      <td><div className="contract-row-actions"><button onClick={() => openEdit(contract)} aria-label="계약 수정"><Pencil size={14} /></button><button onClick={() => deleteContract(contract.id)} aria-label="계약 삭제"><Trash2 size={14} /></button></div></td>
                    </tr>
                  )) : <tr><td colSpan={13} className="contract-empty">등록된 {group} 계약이 없습니다.</td></tr>}
                </tbody>
              </table>
            </div>
            <div className="contract-ledger-summary">
              <span>총 리베이트 금액 <strong>{moneyLabel(items.reduce((sum, contract) => sum + moneyValue(contract.commission), 0))}</strong></span>
              <span>정산금액 <strong>{moneyLabel(total)}</strong></span>
            </div>
          </section>
        )
      })}

      <section className="contract-ledger contract-ledger--deposits">
        <header className="contract-ledger__head">
          <h2>입금내역</h2>
          <Button size="sm" variant="secondary" icon={<Plus size={14} />} onClick={() => openCreate('혼수')}>등록</Button>
        </header>
        <div className="contract-table-scroll">
          <table className="contract-ledger-table contract-ledger-table--deposits">
            <thead>
              <tr>
                <th>입금일</th>
                <th>타입</th>
                <th>계정</th>
                <th>금액</th>
                <th>비고</th>
                <th>상태</th>
                <th>관리</th>
              </tr>
            </thead>
            <tbody>
              {depositRows.length ? depositRows.map((contract) => (
                <tr key={`deposit-${contract.id}`}>
                  <td>{contract.depositDate || contract.contractDate || '-'}</td>
                  <td>{contract.depositType || '입금'}</td>
                  <td>{contract.depositAccount || '국민 000-00-0000'}</td>
                  <td>{contract.depositAmount || contract.amount || '0'}</td>
                  <td>{contract.depositNote || '계약금 입금'}</td>
                  <td>{contract.depositStatus || (contract.status === '완료' || contract.status === '서명완료' ? '완료' : '대기')}</td>
                  <td><div className="contract-row-actions"><button onClick={() => openEdit(contract)} aria-label="입금내역 수정"><Pencil size={14} /></button><button onClick={() => deleteContract(contract.id)} aria-label="입금내역 삭제"><Trash2 size={14} /></button></div></td>
                </tr>
              )) : <tr><td colSpan={7} className="contract-empty">등록된 입금내역이 없습니다.</td></tr>}
            </tbody>
          </table>
        </div>
        <div className="contract-ledger-summary contract-ledger-summary--triple">
          <span>총계약금 <strong>{moneyLabel(contractTotal)}</strong></span>
          <span>입금 <strong>{moneyLabel(paidTotal)}</strong></span>
          <span>잔금 <strong>{moneyLabel(Math.max(contractTotal - paidTotal, 0))}</strong></span>
        </div>
      </section>

      <Modal open={formOpen} onClose={closeForm} title={`${form.category} 등록`} footer={<><Button variant="secondary" onClick={closeForm}>닫기</Button><Button onClick={saveForm}>저장</Button></>}>
        <div className="contract-detail-form">
          <label><span>구분</span><select value={form.category} onChange={(event) => updateForm('category', event.target.value as FormState['category'])}>{contractCategories.map((category) => <option key={category}>{category}</option>)}</select></label>
          <label><span>품목</span><select value={form.item} onChange={(event) => updateForm('item', event.target.value)}>{(itemOptions[form.category] ?? ['기타']).map((item) => <option key={item}>{item}</option>)}</select></label>
          <label><span>계약일</span><input type="date" value={form.contractDate} onChange={(event) => updateForm('contractDate', event.target.value)} /></label>
          <label><span>업체명</span><input value={form.vendorName} onChange={(event) => updateForm('vendorName', event.target.value)} placeholder="미입력" /></label>
          <label><span>계약서 사본</span><input type="file" onChange={(event) => updateForm('contractFileName', event.target.files?.[0]?.name ?? '')} /></label>
          <label><span>계약서 파일명</span><input value={form.contractFileName} onChange={(event) => updateForm('contractFileName', event.target.value)} /></label>
          <label><span>상품명</span><input value={form.productName} onChange={(event) => updateForm('productName', event.target.value)} /></label>
          <label><span>결제수단</span><select value={form.payment} onChange={(event) => updateForm('payment', event.target.value as FormState['payment'])}><option>미입력</option><option>카드</option><option>현금</option><option>계좌이체</option></select></label>
          <label><span>VAT</span><select value={form.vatIncluded ? 'VAT 포함' : 'VAT 별도'} onChange={(event) => updateForm('vatIncluded', event.target.value === 'VAT 포함')}><option>VAT 별도</option><option>VAT 포함</option></select></label>
          <label><span>계약총액</span><input value={form.amount} onChange={(event) => updateForm('amount', event.target.value)} /></label>
          <label><span>수수료</span><input value={form.commission} onChange={(event) => updateForm('commission', event.target.value)} /></label>
          <label><span>계약금</span><input value={form.depositAmount} onChange={(event) => updateForm('depositAmount', event.target.value)} /></label>
          <label><span>입금일</span><input type="date" value={form.depositDate} onChange={(event) => updateForm('depositDate', event.target.value)} /></label>
          <label><span>상태</span><select value={form.status} onChange={(event) => updateForm('status', event.target.value as FormState['status'])}><option>대기</option><option>완료</option><option>확인필요</option><option>결제대기</option><option>서명완료</option></select></label>
          <label className="contract-detail-form__wide"><span>세부적인 구성</span><textarea rows={4} value={form.details} onChange={(event) => updateForm('details', event.target.value)} placeholder="예: 본식 드레스 1벌, 촬영 드레스 3벌, 헬퍼비 별도" /></label>
          <label className="contract-detail-form__wide"><span>수수료정보</span><textarea rows={3} value={form.commissionInfo} onChange={(event) => updateForm('commissionInfo', event.target.value)} /></label>
          <label className="contract-detail-form__wide"><span>비고</span><textarea rows={3} value={form.memo} onChange={(event) => updateForm('memo', event.target.value)} /></label>
          <label><span>입금 계정</span><input value={form.depositAccount} onChange={(event) => updateForm('depositAccount', event.target.value)} placeholder="국민 000-00-0000" /></label>
          <label><span>입금 상태</span><select value={form.depositStatus} onChange={(event) => updateForm('depositStatus', event.target.value as FormState['depositStatus'])}><option>대기</option><option>완료</option></select></label>
          <label className="contract-detail-form__wide"><span>입금 비고</span><textarea rows={2} value={form.depositNote} onChange={(event) => updateForm('depositNote', event.target.value)} placeholder="계약금 입금" /></label>
        </div>
      </Modal>
    </section>
  )
}
