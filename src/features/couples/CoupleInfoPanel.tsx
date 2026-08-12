import { useEffect, useState, type FormEvent } from 'react'
import { CalendarDays, Edit3, Mail, MapPin, Phone, UserRound } from 'lucide-react'
import { useDemoStore } from '../../app/store'
import { Badge, Button, Card, Modal } from '../../components/ui'
import type { Couple } from '../../types'

const fields: { key: keyof Couple; label: string; type?: string; wide?: boolean }[] = [
  { key: 'brideName', label: '신부 이름' }, { key: 'bridePhone', label: '신부 전화번호' },
  { key: 'brideEmail', label: '신부 이메일', type: 'email' }, { key: 'groomName', label: '신랑 이름' },
  { key: 'groomPhone', label: '신랑 전화번호' }, { key: 'groomEmail', label: '신랑 이메일', type: 'email' },
  { key: 'address', label: '주소', wide: true }, { key: 'contractType', label: '계약 구분' },
  { key: 'contractDate', label: '계약일', type: 'date' }, { key: 'ceremonyDate', label: '본식 일자', type: 'date' },
  { key: 'ceremonyPlace', label: '본식 장소', wide: true }, { key: 'note', label: '비고', wide: true },
]

export function CoupleInfoPanel({ couple }: { couple: Couple }) {
  const { updateCouple } = useDemoStore()
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState(couple)
  useEffect(() => setDraft(couple), [couple])

  const submit = (event: FormEvent) => {
    event.preventDefault()
    const brideInitial = draft.brideName.length > 1 ? draft.brideName[1] : draft.brideName[0]
    const groomInitial = draft.groomName.length > 1 ? draft.groomName[1] : draft.groomName[0]
    updateCouple({ ...draft, partners: `${draft.brideName} & ${draft.groomName}`, initials: `${brideInitial ?? ''} · ${groomInitial ?? ''}`, weddingDate: draft.ceremonyDate, venue: draft.ceremonyPlace })
    setOpen(false)
  }

  return <>
    <div className="feature-panel-heading"><div><p className="eyebrow">Couple profile</p><h2>부부정보</h2><p>계약과 본식 진행에 필요한 고객 정보를 관리합니다.</p></div><Button variant="secondary" icon={<Edit3 size={16} />} onClick={() => setOpen(true)}>정보 수정</Button></div>
    <div className="info-card-grid">
      <Card className="person-info-card"><div className="info-card-title"><UserRound size={18} /><div><Badge tone="neutral">신부</Badge><h3>{couple.brideName}</h3></div></div><p><Phone size={15} /> {couple.bridePhone}</p><p><Mail size={15} /> {couple.brideEmail}</p></Card>
      <Card className="person-info-card"><div className="info-card-title"><UserRound size={18} /><div><Badge tone="neutral">신랑</Badge><h3>{couple.groomName}</h3></div></div><p><Phone size={15} /> {couple.groomPhone}</p><p><Mail size={15} /> {couple.groomEmail}</p></Card>
      <Card className="ceremony-info-card"><div className="info-card-title"><CalendarDays size={18} /><div><Badge tone="sage">{couple.contractType}</Badge><h3>{couple.ceremonyDate}</h3></div></div><p><MapPin size={15} /> {couple.ceremonyPlace}</p><p>계약일 {couple.contractDate}</p></Card>
    </div>
    <Card className="info-note"><strong>주소</strong><p>{couple.address}</p><strong>비고</strong><p>{couple.note || '등록된 비고가 없습니다.'}</p></Card>
    <Modal open={open} onClose={() => setOpen(false)} title="부부정보 수정" eyebrow="Couple profile" footer={<><Button variant="ghost" onClick={() => setOpen(false)}>취소</Button><Button type="submit" form="couple-info-form">저장</Button></>}>
      <form id="couple-info-form" className="form-grid" onSubmit={submit}>{fields.map((field) => <label className={`form-field ${field.wide ? 'form-field--wide' : ''}`} key={field.key}><span>{field.label}</span>{field.key === 'note' ? <textarea rows={3} value={String(draft[field.key])} onChange={(event) => setDraft({ ...draft, [field.key]: event.target.value })} /> : <input required={field.key !== 'address'} type={field.type ?? 'text'} value={String(draft[field.key])} onChange={(event) => setDraft({ ...draft, [field.key]: event.target.value })} />}</label>)}</form>
    </Modal>
  </>
}
