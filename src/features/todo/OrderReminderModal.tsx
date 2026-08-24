import { useEffect, useMemo, useState } from 'react'
import { Check, PackageCheck, Plus } from 'lucide-react'
import { useDemoStore } from '../../app/store'
import { Button, Modal } from '../../components/ui'

const addDays = (date: string, days: number) => {
  const next = new Date(`${date}T12:00:00`)
  next.setDate(next.getDate() + days)
  return next.toISOString().slice(0, 10)
}

interface OrderReminderModalProps {
  open: boolean
  onClose: () => void
  defaultCoupleId?: string
  today: string
}

export function OrderReminderModal({ open, onClose, defaultCoupleId, today }: OrderReminderModalProps) {
  const { couples, vendors, addVendor, addOrderReminder } = useDemoStore()
  const initialCoupleId = defaultCoupleId || couples[0]?.id || ''
  const [draft, setDraft] = useState({ coupleId: initialCoupleId, vendorId: '', title: '', orderDate: today, reminderDate: addDays(today, 7) })
  const [vendorQuery, setVendorQuery] = useState('')
  const [vendorPickerOpen, setVendorPickerOpen] = useState(false)
  const matchedVendors = useMemo(() => vendors
    .filter((vendor) => `${vendor.name} ${vendor.category} ${vendor.location}`.toLocaleLowerCase('ko').includes(vendorQuery.trim().toLocaleLowerCase('ko')))
    .slice(0, 6), [vendorQuery, vendors])

  useEffect(() => {
    if (!open) return
    setDraft({ coupleId: defaultCoupleId || couples[0]?.id || '', vendorId: '', title: '', orderDate: today, reminderDate: addDays(today, 7) })
    setVendorQuery('')
    setVendorPickerOpen(false)
  }, [open, defaultCoupleId, couples, today])

  const selectVendor = (vendorId: string, name: string) => {
    setDraft((current) => ({ ...current, vendorId }))
    setVendorQuery(name)
    setVendorPickerOpen(false)
  }

  const registerVendor = () => {
    const name = vendorQuery.trim()
    if (!name) return
    const base = vendors[0]
    const id = addVendor({
      name,
      category: '기타',
      summary: '플래너가 직접 등록한 업체',
      tags: [],
      priceRange: '가격 문의',
      match: 0,
      image: base?.image ?? '',
      location: '지역 미등록',
      address: '주소 미등록',
      hours: '운영시간 미등록',
      phone: '연락처 미등록',
      instagram: '',
      activeEvent: '직접 등록',
      gallery: base?.gallery?.slice(0, 3) ?? [],
      updatedAt: today,
    })
    selectVendor(id, name)
  }

  const submit = () => {
    if (!draft.coupleId || !draft.title.trim()) return
    addOrderReminder({ ...draft, vendorId: draft.vendorId || undefined, title: draft.title.trim(), memo: '' })
    onClose()
  }

  return <Modal open={open} onClose={onClose} eyebrow="Manual reminder" title="발주 리마인더 추가" footer={<><Button variant="ghost" onClick={onClose}>취소</Button><Button icon={<Check size={14} />} disabled={!draft.title.trim()} onClick={submit}>리마인더 등록</Button></>}>
    <div className="order-reminder-form order-reminder-form--simple">
      <div className="order-reminder-form__notice"><PackageCheck size={18} /><div><strong>업체 상태와 연동되지 않는 플래너용 확인 메모입니다.</strong><span>필요한 값은 자동으로 채워지며, 확인을 마친 뒤 리마인더에서 완료 처리하세요.</span></div></div>
      <label><span>고객</span><select value={draft.coupleId} onChange={(event) => setDraft({ ...draft, coupleId: event.target.value })}>{couples.map((couple) => <option value={couple.id} key={couple.id}>{couple.partners}</option>)}</select></label>
      <div className="order-vendor-field">
        <span>업체</span>
        <div className="order-vendor-combobox">
          <input value={vendorQuery} onFocus={() => setVendorPickerOpen(true)} onChange={(event) => { setVendorQuery(event.target.value); setDraft({ ...draft, vendorId: '' }); setVendorPickerOpen(true) }} placeholder="업체명을 검색하세요" />
          {vendorPickerOpen && <div className="order-vendor-options">
            {matchedVendors.map((vendor) => <button type="button" key={vendor.id} onClick={() => selectVendor(vendor.id, vendor.name)}><strong>{vendor.name}</strong><span>{vendor.category} · {vendor.location}</span></button>)}
            {vendorQuery.trim() && !vendors.some((vendor) => vendor.name.toLocaleLowerCase('ko') === vendorQuery.trim().toLocaleLowerCase('ko')) && <button type="button" className="order-vendor-register" onClick={registerVendor}><Plus size={14} /><span><strong>‘{vendorQuery.trim()}’ 직접 등록</strong><small>업체 DB에 기타 업체로 추가하고 선택합니다.</small></span></button>}
            {!matchedVendors.length && !vendorQuery.trim() && <p>업체명을 입력하면 검색 결과가 표시됩니다.</p>}
          </div>}
        </div>
      </div>
      <label className="wide"><span>발주 메모</span><input value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} placeholder="예: 스튜디오 촬영 패키지 발주 확인" /></label>
      <label><span>발주일</span><input type="date" value={draft.orderDate} onChange={(event) => { const orderDate = event.target.value; setDraft({ ...draft, orderDate, reminderDate: addDays(orderDate, 7) }) }} /></label>
      <label><span>확인 예정일</span><input type="date" value={draft.reminderDate} min={draft.orderDate} onChange={(event) => setDraft({ ...draft, reminderDate: event.target.value })} /></label>
    </div>
  </Modal>
}
