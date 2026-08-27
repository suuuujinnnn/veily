import { useState, type FormEvent, type ReactNode } from 'react'
import { CalendarDays, CalendarPlus, CheckCircle2, ChevronRight, Heart, MapPin, MessageSquareText, Plus, Target, WalletCards } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useDemoStore } from '../../app/store'
import { Badge, Button, Card, Modal } from '../../components/ui'
import type { Consultation } from '../../types'

const toList = (value: string) => value.split(/\n|,/).map((item) => item.trim()).filter(Boolean)
const filled = (value: string) => value || '아직 작성하지 않음'
const displayMonth = (value: string) => {
  const [year, month] = value.split('-')
  return year && month ? `${year}년 ${Number(month)}월` : filled(value)
}

export function ConsultationsPanel({ coupleId, embedded = false }: { coupleId: string; embedded?: boolean }) {
  const { couples, consultations, consultationCards, addConsultation, addEvent } = useDemoStore()
  const couple = couples.find((item) => item.id === coupleId) ?? couples[0]
  const preferenceCard = consultationCards.find((item) => item.coupleId === coupleId)
  const items = consultations.filter((item) => item.coupleId === coupleId)
  const latestConsultation = [...items].sort((a, b) => b.date.localeCompare(a.date))[0]
  const [open, setOpen] = useState(false)
  const [date, setDate] = useState('2026-08-10T19:00')
  const [originalText, setOriginalText] = useState('')
  const [requests, setRequests] = useState('')
  const [decisions, setDecisions] = useState('')
  const [nextActions, setNextActions] = useState('')
  const [addToCalendar, setAddToCalendar] = useState(true)
  const [location, setLocation] = useState('플래너 미팅')

  const submit = (event: FormEvent) => {
    event.preventDefault()
    const item: Omit<Consultation, 'id'> = { coupleId, date, originalText, requests: toList(requests), decisions: toList(decisions), nextActions: toList(nextActions) }
    addConsultation(item)
    if (addToCalendar) {
      const [eventDate, time = '19:00'] = date.split('T')
      const [hour, minute] = time.split(':').map(Number)
      const end = `${String((hour + 1) % 24).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
      addEvent({ coupleId, title: '고객 상담', date: eventDate, time, endTime: end, type: '미팅', location, workflowType: '고객 상담', durationMinutes: 60, memo: nextActions, visibility: 'couple-shared' })
    }
    setOriginalText(''); setRequests(''); setDecisions(''); setNextActions(''); setOpen(false)
  }

  return <div className={`consultation-workspace ${embedded ? 'consultation-workspace--embedded' : ''}`}>
    <div className="feature-panel-heading consultation-record-heading"><div><h2>상담 기록</h2><p>상담 조건과 지난 상담 내용을 한 흐름으로 확인합니다.</p></div><div className="heading-actions"><Badge tone="neutral">{items.length}건</Badge><Link to={`/consultation/${coupleId}`}><Button variant="secondary" icon={<Heart size={16} />}>{preferenceCard ? '상담 카드 수정' : '상담 카드 만들기'}</Button></Link><Button icon={<Plus size={16} />} onClick={() => setOpen(true)}>상담 추가</Button></div></div>

    {preferenceCard ? <Card padding="none" className="couple-consultation-card couple-consultation-card--summary">
      <header className="couple-consultation-card__header">
        <div><span className="document-icon"><Heart size={16} /></span><div><strong>{couple.partners}</strong><small>{preferenceCard.source} · {preferenceCard.createdAt} 업데이트</small></div></div>
        <Link to={`/consultation/${coupleId}`}>수정 <ChevronRight size={14} /></Link>
      </header>
      <dl className="couple-consultation-card__details">
        <div><dt><CalendarDays size={14} /> 상담일</dt><dd>{latestConsultation ? new Date(latestConsultation.date).toLocaleDateString('ko-KR') : preferenceCard.createdAt.replaceAll('-', '.')}</dd></div>
        <div><dt><CalendarPlus size={14} /> 희망 본식 일정</dt><dd>{displayMonth(preferenceCard.preferredDate)}</dd></div>
        <div><dt><WalletCards size={14} /> 희망 견적</dt><dd>{filled(preferenceCard.budget)}</dd></div>
        <div><dt><MapPin size={14} /> 지역</dt><dd>{filled(preferenceCard.preferredRegion)}</dd></div>
      </dl>
    </Card> : <Card className="consultation-start-card"><div className="document-icon"><Heart size={19} /></div><div><p className="eyebrow">고객 취향</p><h3>상담 카드를 만들어 보세요</h3><p>두 사람의 취향과 예산을 정리하면 이후 상담과 업체 추천에 같은 기준을 사용할 수 있습니다.</p></div><Link to={`/consultation/${coupleId}`}><Button icon={<ChevronRight size={15} />}>취향 찾기</Button></Link></Card>}

    <div className="consultation-list">{items.length ? items.map((item) => <Card key={item.id} className="consultation-card"><div className="consultation-card__head"><div><MessageSquareText size={18} /><strong>{new Date(item.date).toLocaleString('ko-KR', { month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</strong></div><Badge tone="neutral">상담 기록</Badge></div><blockquote>{item.originalText}</blockquote><div className="consultation-columns"><ConsultationList icon={<Target size={15} />} title="요청사항" items={item.requests} /><ConsultationList icon={<CheckCircle2 size={15} />} title="결정사항" items={item.decisions} /><ConsultationList icon={<CalendarPlus size={15} />} title="다음 액션" items={item.nextActions} /></div></Card>) : <Card className="consultation-empty"><MessageSquareText size={22} /><strong>상담 기록이 없습니다.</strong><p>첫 상담 내용을 남기면 요청·결정·다음 액션으로 정리됩니다.</p></Card>}</div>

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
  </div>
}

function ConsultationList({ icon, title, items }: { icon: ReactNode; title: string; items: string[] }) {
  return <div><h4>{icon}{title}</h4>{items.length ? <ul>{items.map((item) => <li key={item}>{item}</li>)}</ul> : <p>기록 없음</p>}</div>
}
