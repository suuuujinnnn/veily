import { useState, type FormEvent, type ReactNode } from 'react'
import { CalendarPlus, CheckCircle2, MessageSquareText, Plus, Target } from 'lucide-react'
import { useDemoStore } from '../../app/store'
import { Badge, Button, Card, Modal } from '../../components/ui'
import type { Consultation } from '../../types'

const toList = (value: string) => value.split(/\n|,/).map((item) => item.trim()).filter(Boolean)

export function ConsultationsPanel({ coupleId }: { coupleId: string }) {
  const { consultations, addConsultation, addEvent } = useDemoStore()
  const items = consultations.filter((item) => item.coupleId === coupleId)
  const [open, setOpen] = useState(false)
  const [date, setDate] = useState('2026-08-10T19:00')
  const [originalText, setOriginalText] = useState('')
  const [requests, setRequests] = useState('')
  const [decisions, setDecisions] = useState('')
  const [nextActions, setNextActions] = useState('')
  const [addToCalendar, setAddToCalendar] = useState(true)
  const [location, setLocation] = useState('온라인 미팅')

  const submit = (event: FormEvent) => {
    event.preventDefault()
    const item: Omit<Consultation, 'id'> = { coupleId, date, originalText, requests: toList(requests), decisions: toList(decisions), nextActions: toList(nextActions) }
    addConsultation(item)
    if (addToCalendar) {
      const [eventDate, time = '19:00'] = date.split('T')
      const [hour, minute] = time.split(':').map(Number)
      const end = `${String((hour + 1) % 24).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
      addEvent({ coupleId, title: '고객 상담', date: eventDate, time, endTime: end, type: '미팅', location, workflowType: '고객 상담', durationMinutes: 60, memo: nextActions, travelMode: 'subway' })
    }
    setOriginalText(''); setRequests(''); setDecisions(''); setNextActions(''); setOpen(false)
  }

  return <>
    <div className="feature-panel-heading"><div><p className="eyebrow">Consultation log</p><h2>상담</h2><p>대화 원문과 결정 사항을 분리해 다음 액션까지 놓치지 않습니다.</p></div><Button icon={<Plus size={16} />} onClick={() => setOpen(true)}>상담 추가</Button></div>
    <div className="consultation-list">{items.map((item) => <Card key={item.id} className="consultation-card"><div className="consultation-card__head"><div><MessageSquareText size={18} /><strong>{new Date(item.date).toLocaleString('ko-KR', { month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</strong></div><Badge tone="neutral">상담 기록</Badge></div><blockquote>{item.originalText}</blockquote><div className="consultation-columns"><ConsultationList icon={<Target size={15} />} title="요청사항" items={item.requests} /><ConsultationList icon={<CheckCircle2 size={15} />} title="결정사항" items={item.decisions} /><ConsultationList icon={<CalendarPlus size={15} />} title="다음 액션" items={item.nextActions} /></div></Card>)}</div>
    <Modal open={open} onClose={() => setOpen(false)} title="상담 추가" eyebrow="Consultation" footer={<><Button variant="ghost" onClick={() => setOpen(false)}>취소</Button><Button type="submit" form="consultation-form">등록</Button></>}>
      <form id="consultation-form" className="form-grid" onSubmit={submit}>
        <label className="form-field"><span>상담 일시</span><input type="datetime-local" value={date} onChange={(event) => setDate(event.target.value)} required /></label>
        <label className="form-field"><span>장소</span><input value={location} onChange={(event) => setLocation(event.target.value)} /></label>
        <label className="form-field form-field--wide"><span>상담 원문</span><textarea rows={4} value={originalText} onChange={(event) => setOriginalText(event.target.value)} required placeholder="고객의 말을 그대로 기록하세요." /></label>
        <label className="form-field"><span>요청사항 (줄바꿈으로 구분)</span><textarea rows={3} value={requests} onChange={(event) => setRequests(event.target.value)} /></label>
        <label className="form-field"><span>결정사항</span><textarea rows={3} value={decisions} onChange={(event) => setDecisions(event.target.value)} /></label>
        <label className="form-field form-field--wide"><span>다음 액션</span><textarea rows={3} value={nextActions} onChange={(event) => setNextActions(event.target.value)} /></label>
        <label className="check-option form-field--wide"><input type="checkbox" checked={addToCalendar} onChange={(event) => setAddToCalendar(event.target.checked)} /><span><strong>캘린더에도 일정 등록</strong><small>60분 고객 상담 일정으로 함께 생성됩니다.</small></span></label>
      </form>
    </Modal>
  </>
}

function ConsultationList({ icon, title, items }: { icon: ReactNode; title: string; items: string[] }) {
  return <div><h4>{icon}{title}</h4>{items.length ? <ul>{items.map((item) => <li key={item}>{item}</li>)}</ul> : <p>기록 없음</p>}</div>
}
