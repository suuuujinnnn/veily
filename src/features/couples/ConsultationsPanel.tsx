import { useState, type FormEvent, type ReactNode } from 'react'
import { CalendarDays, CalendarPlus, CheckCircle2, ChevronRight, Heart, Images, MessageCircle, MessageSquareText, Plus, Sparkles, Target, WalletCards } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useDemoStore } from '../../app/store'
import { Badge, Button, Card, Modal } from '../../components/ui'
import type { Consultation } from '../../types'
import { weddingReferences } from '../../data/weddingReferenceData'

const toList = (value: string) => value.split(/\n|,/).map((item) => item.trim()).filter(Boolean)
const filled = (value: string) => value || '아직 작성하지 않음'

export function ConsultationsPanel({ coupleId }: { coupleId: string }) {
  const { couples, consultations, consultationCards, customerReferenceSubmissions, uploadedReferences, addConsultation, addEvent } = useDemoStore()
  const couple = couples.find((item) => item.id === coupleId) ?? couples[0]
  const preferenceCard = consultationCards.find((item) => item.coupleId === coupleId)
  const items = consultations.filter((item) => item.coupleId === coupleId)
  const customerSubmission = customerReferenceSubmissions.find((item) => item.coupleId === coupleId)
  const referenceLibrary = [...uploadedReferences, ...weddingReferences]
  const customerReferences = customerSubmission?.selections.map((selection) => ({ selection, reference: referenceLibrary.find((item) => item.id === selection.referenceId) })).filter((item) => item.reference) ?? []
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
      addEvent({ coupleId, title: '고객 상담', date: eventDate, time, endTime: end, type: '미팅', location, workflowType: '고객 상담', durationMinutes: 60, memo: nextActions, travelMode: 'subway', visibility: 'couple-shared' })
    }
    setOriginalText(''); setRequests(''); setDecisions(''); setNextActions(''); setOpen(false)
  }

  const tasteTags = preferenceCard ? [preferenceCard.studioMood, preferenceCard.dressMood, preferenceCard.makeupMood].filter(Boolean) : []

  return <div className="consultation-workspace">
    <div className="feature-panel-heading"><div><p className="eyebrow">Consultation workspace</p><h2>상담</h2><p>고객 취향 카드와 상담 기록을 한곳에서 이어서 관리합니다.</p></div><div className="heading-actions"><Link to={`/consultation/${coupleId}`}><Button variant="secondary" icon={<Heart size={16} />}>{preferenceCard ? '취향 카드 수정' : '취향 찾기 시작'}</Button></Link><Button icon={<Plus size={16} />} onClick={() => setOpen(true)}>상담 추가</Button></div></div>

    {customerSubmission && <Card padding="none" className="customer-taste-inbox">
      <header><div><span><Images size={18} /></span><div><p className="eyebrow">Customer taste references</p><h3>고객이 보낸 취향 레퍼런스</h3><small>{new Date(customerSubmission.submittedAt).toLocaleString('ko-KR', { month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })} 수신</small></div></div><Badge tone="sage">{customerSubmission.status}</Badge></header>
      <div className="customer-taste-inbox__summary"><div><span>자주 고른 취향</span><p>{customerSubmission.preferredTags.map((tag) => <em key={tag}>#{tag}</em>)}</p></div><div><span>분야별 선택</span><p>{Object.entries(customerSubmission.categoryCounts).map(([categoryName, count]) => <em key={categoryName}>{categoryName} {count}장</em>)}</p></div></div>
      <div className="customer-taste-inbox__grid">{customerReferences.map(({ selection, reference }) => reference && <article key={reference.id}><img src={reference.image} style={{ objectPosition: reference.imagePosition }} alt="" /><div><span>{reference.category} · {reference.purpose}</span><h4>{reference.vendorName}</h4><small>@{reference.account}</small><p>{reference.tags.slice(0, 3).map((tag) => `#${tag}`).join(' ')}</p>{selection.note && <blockquote>“{selection.note}”</blockquote>}</div></article>)}</div>
      <footer><span><CheckCircle2 size={14} /> 이 자료를 다음 상담과 플래너 레퍼런스 보드에 활용하세요.</span><Link to="/vendors">레퍼런스 보드 열기 <ChevronRight size={13} /></Link></footer>
    </Card>}

    {preferenceCard ? <Card padding="none" className="couple-consultation-card">
      <header className="couple-consultation-card__header">
        <div><span className="document-icon"><Heart size={18} /></span><div><p className="eyebrow">Couple preference</p><h3>상담 카드</h3><small>{preferenceCard.createdAt} 업데이트</small></div></div>
        <div><Badge tone="sage">{preferenceCard.source}</Badge><Link to={`/consultation/${coupleId}`}>내용 수정 <ChevronRight size={14} /></Link></div>
      </header>
      <div className="couple-consultation-card__body">
        <section className="couple-consultation-card__taste">
          <span><Sparkles size={15} /> 두 사람의 취향</span>
          <h4>{tasteTags.length ? tasteTags.join(' · ') : '아직 취향을 선택하지 않았어요'}</h4>
          <p>{preferenceCard.priorities || preferenceCard.notes || '상담에서 중요하게 생각하는 기준을 기록해 주세요.'}</p>
          <div className="tag-row">{tasteTags.length ? tasteTags.map((tag) => <span key={tag}>{tag}</span>) : <span>취향 선택 전</span>}</div>
        </section>
        <dl className="couple-consultation-card__details">
          <div><dt><CalendarDays size={15} /> 희망 예식일</dt><dd>{filled(preferenceCard.preferredDate)}</dd></div>
          <div><dt><CalendarPlus size={15} /> 촬영 일정</dt><dd>{filled(preferenceCard.shootDate)}</dd></div>
          <div><dt><WalletCards size={15} /> 스드메 예산</dt><dd>{filled(preferenceCard.budget)}</dd></div>
          <div><dt><MessageCircle size={15} /> 선호 연락 방식</dt><dd>{filled(preferenceCard.contactPreference)}</dd></div>
        </dl>
      </div>
      <footer className="couple-consultation-card__footer">
        <div><span>스튜디오</span><strong>{filled([preferenceCard.studioDirection, preferenceCard.studioMood].filter(Boolean).join(' · '))}</strong></div>
        <div><span>드레스 · 메이크업</span><strong>{filled([preferenceCard.dressMood, preferenceCard.makeupMood].filter(Boolean).join(' · '))}</strong></div>
        <div><span>선정 업체</span><strong>{filled(preferenceCard.existingVendors)}</strong></div>
      </footer>
    </Card> : <Card className="consultation-start-card"><div className="document-icon"><Heart size={19} /></div><div><p className="eyebrow">Couple preference</p><h3>상담 카드를 만들어 보세요</h3><p>두 사람의 취향과 예산을 정리하면 이후 상담과 업체 추천에 같은 기준을 사용할 수 있습니다.</p></div><Link to={`/consultation/${coupleId}`}><Button icon={<ChevronRight size={15} />}>취향 찾기</Button></Link></Card>}

    <div className="consultation-log-heading"><div><p className="eyebrow">Consultation log</p><h3>상담 기록</h3></div><Badge tone="neutral">{items.length}건</Badge></div>
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
