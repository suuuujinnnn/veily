import { useEffect, useState, type FormEvent } from 'react'
import { BriefcaseBusiness, CalendarDays, Check, Edit3, Mail, MapPin, Mars, MessageSquareText, Phone, UserRound, UsersRound, Venus, X } from 'lucide-react'
import { useDemoStore } from '../../app/store'
import { Badge, Card } from '../../components/ui'
import type { Couple } from '../../types'
import { ConsultationsPanel } from './ConsultationsPanel'

export function CoupleInfoPanel({ couple }: { couple: Couple }) {
  const { updateCouple } = useDemoStore()
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(couple)
  useEffect(() => setDraft(couple), [couple])

  const startEditing = () => { setDraft(couple); setEditing(true) }
  const cancelEditing = () => { setDraft(couple); setEditing(false) }
  const update = <K extends keyof Couple>(key: K, value: Couple[K]) => setDraft((current) => ({ ...current, [key]: value }))

  const submit = (event: FormEvent) => {
    event.preventDefault()
    const brideInitial = draft.brideName.length > 1 ? draft.brideName[1] : draft.brideName[0]
    const groomInitial = draft.groomName.length > 1 ? draft.groomName[1] : draft.groomName[0]
    updateCouple({ ...draft, partners: `${draft.brideName} & ${draft.groomName}`, initials: `${brideInitial ?? ''} · ${groomInitial ?? ''}`, weddingDate: draft.ceremonyDate, venue: draft.ceremonyPlace })
    setEditing(false)
  }

  return <>
    <form className={`customer-info-inline-form ${editing ? 'is-editing' : ''}`} onSubmit={submit}>
      <section className="customer-info-sheet">
        <section className="customer-info-sheet__people">
          <header>
            <UserRound size={16} />
            <div><h3>고객 연락처</h3><span>두 분의 기본 연락 정보를 함께 확인합니다.</span></div>
            <div className="customer-info-edit-actions">
              {editing
                ? <><button type="button" onClick={cancelEditing} aria-label="정보 수정 취소"><X size={14} /></button><button type="submit" className="is-save" aria-label="정보 저장"><Check size={14} /></button></>
                : <button type="button" onClick={startEditing} aria-label="정보 수정"><Edit3 size={14} /></button>}
            </div>
          </header>
          <div className="customer-person-row">
            <span className="customer-gender-marker is-bride"><Venus size={14} /><b>신부</b></span>
            {editing ? <input aria-label="신부 이름" value={draft.brideName} onChange={(event) => update('brideName', event.target.value)} /> : <strong>{couple.brideName}</strong>}
            <span><BriefcaseBusiness size={13} />{editing ? <input aria-label="신부 직업" value={draft.brideOccupation} onChange={(event) => update('brideOccupation', event.target.value)} /> : couple.brideOccupation}</span>
            <span><Phone size={13} />{editing ? <input aria-label="신부 전화번호" value={draft.bridePhone} onChange={(event) => update('bridePhone', event.target.value)} /> : couple.bridePhone}</span>
            <span><Mail size={13} />{editing ? <input type="email" aria-label="신부 이메일" value={draft.brideEmail} onChange={(event) => update('brideEmail', event.target.value)} /> : couple.brideEmail}</span>
          </div>
          <div className="customer-person-row">
            <span className="customer-gender-marker is-groom"><Mars size={14} /><b>신랑</b></span>
            {editing ? <input aria-label="신랑 이름" value={draft.groomName} onChange={(event) => update('groomName', event.target.value)} /> : <strong>{couple.groomName}</strong>}
            <span><BriefcaseBusiness size={13} />{editing ? <input aria-label="신랑 직업" value={draft.groomOccupation} onChange={(event) => update('groomOccupation', event.target.value)} /> : couple.groomOccupation}</span>
            <span><Phone size={13} />{editing ? <input aria-label="신랑 전화번호" value={draft.groomPhone} onChange={(event) => update('groomPhone', event.target.value)} /> : couple.groomPhone}</span>
            <span><Mail size={13} />{editing ? <input type="email" aria-label="신랑 이메일" value={draft.groomEmail} onChange={(event) => update('groomEmail', event.target.value)} /> : couple.groomEmail}</span>
          </div>
        </section>

        <section className="customer-info-sheet__group">
          <header><CalendarDays size={16} /><h3>예식·계약</h3>{editing ? <input className="customer-info-header-input" aria-label="계약 구분" value={draft.contractType} onChange={(event) => update('contractType', event.target.value)} /> : <Badge tone="sage">{couple.contractType}</Badge>}</header>
          <dl>
            <div><dt>본식 일자</dt><dd>{editing ? <input type="date" aria-label="본식 일자" value={draft.ceremonyDate} onChange={(event) => update('ceremonyDate', event.target.value)} /> : couple.ceremonyDate}</dd></div>
            <div><dt>본식 장소</dt><dd><MapPin size={12} />{editing ? <input aria-label="본식 장소" value={draft.ceremonyPlace} onChange={(event) => update('ceremonyPlace', event.target.value)} /> : couple.ceremonyPlace}</dd></div>
            <div><dt>계약일</dt><dd>{editing ? <input type="date" aria-label="계약일" value={draft.contractDate} onChange={(event) => update('contractDate', event.target.value)} /> : couple.contractDate}</dd></div>
            <div><dt>주소</dt><dd><MapPin size={12} />{editing ? <input aria-label="주소" value={draft.address} onChange={(event) => update('address', event.target.value)} /> : couple.address || '-'}</dd></div>
          </dl>
        </section>

        <section className="customer-info-sheet__group customer-info-sheet__group--contact">
          <header><UsersRound size={16} /><h3>연락·유입</h3>{!editing && <Badge tone="amber">{couple.preferredContactMethod}</Badge>}</header>
          <dl>
            <div><dt>선호 연락 수단</dt><dd>{editing ? <select aria-label="선호 연락 수단" value={draft.preferredContactMethod} onChange={(event) => update('preferredContactMethod', event.target.value as Couple['preferredContactMethod'])}>{['카카오톡','문자','전화','이메일'].map((method) => <option key={method}>{method}</option>)}</select> : couple.preferredContactMethod}</dd></div>
            <div><dt>선호 시간</dt><dd>{editing ? <input aria-label="선호 연락 시간" value={draft.preferredContactTime} onChange={(event) => update('preferredContactTime', event.target.value)} /> : couple.preferredContactTime}</dd></div>
            <div><dt>유입 경로</dt><dd>{editing ? <input aria-label="유입 경로" value={draft.acquisitionChannel} onChange={(event) => update('acquisitionChannel', event.target.value)} /> : couple.acquisitionChannel}</dd></div>
            <div><dt>추천인</dt><dd>{editing ? <input aria-label="추천인" value={draft.referrerName} onChange={(event) => update('referrerName', event.target.value)} /> : couple.referrerName || '-'}</dd></div>
          </dl>
        </section>
      </section>

      <Card className="info-note info-note--planner">
        <span><MessageSquareText size={17} /></span>
        <div><strong>플래너 메모</strong>{editing ? <textarea aria-label="플래너 메모" rows={3} value={draft.note} onChange={(event) => update('note', event.target.value)} /> : <p>{couple.note || '등록된 플래너 메모가 없습니다.'}</p>}</div>
        {!editing && <button type="button" onClick={startEditing}>메모 편집</button>}
      </Card>
    </form>
    <section className="couple-info-consultations"><ConsultationsPanel coupleId={couple.id} embedded /></section>
  </>
}
