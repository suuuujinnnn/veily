import { useState, type FormEvent } from 'react'
import { Check, Clipboard, Heart, Send } from 'lucide-react'
import { useDemoStore } from '../../app/store'
import type { ConsultationCard, Couple } from '../../types'

const options = {
  budget: ['300만 원~400만 원', '400만 원~500만 원', '500만 원 이상'],
  studio: ['토탈 세미', '토탈 일반', '세미', '일반', '야외 스냅'],
  dress: ['실크', '비즈와 레이스', '화려함', '유니크'],
  makeup: ['깔끔', '누디', '과즙', '강하게'],
}

export function PublicConsultationPage() {
  const { addCouple } = useDemoStore()
  const [submitted, setSubmitted] = useState(false)
  const [form, setForm] = useState({ coupleNames: '', couplePhones: '', weddingDate: '', venue: '', budget: '', studioDirection: '', dressStyle: '', makeupStyle: '', notes: '' })
  const update = (key: keyof typeof form, value: string) => setForm((current) => ({ ...current, [key]: value }))
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const names = form.coupleNames.split(/\s*(?:&|,|\/|·)\s*/).filter(Boolean)
    const partners = names.length > 1 ? `${names[0]} & ${names[1]}` : form.coupleNames
    const id = `c-${Date.now()}`
    const couple: Couple = { id, partners, initials: names.map((name) => name.slice(0, 1)).join('').slice(0, 2) || '커플', weddingDate: form.weddingDate, venue: form.venue || '미정', progress: 0, status: '준비중', concept: '', tone: 'sage' }
    const consultation: ConsultationCard = { id: `consult-${id}`, coupleId: id, weddingDate: form.weddingDate, venue: form.venue, budget: form.budget, preferredStyle: '', priorities: '', requestedTopics: '', notes: form.notes, submittedAt: new Date().toISOString().slice(0, 10), coupleNames: form.coupleNames, couplePhones: form.couplePhones, studioDirection: form.studioDirection, dressStyle: form.dressStyle, makeupStyle: form.makeupStyle }
    addCouple(couple, consultation)
    setSubmitted(true)
  }
  if (submitted) return <main className="public-consultation-shell"><section className="public-consultation-success"><div className="public-consultation-success__icon"><Check size={24} /></div><p className="eyebrow">상담 카드 제출 완료</p><h1>소중한 답변이 전달되었습니다.</h1><p>플래너가 내용을 확인한 뒤 상담 결과와 다음 안내를 준비할게요.</p></section></main>
  return <main className="public-consultation-shell"><section className="public-consultation-hero"><div className="public-consultation-hero__mark"><Heart size={17} /></div><p className="eyebrow">PLANNER × COUPLE</p><h1>우리의 상담 카드</h1><p>두 분의 취향과 준비 방향을 알려주시면 더 잘 맞는 웨딩 플랜을 준비할 수 있어요.</p></section><form className="public-consultation-card" onSubmit={submit}><div className="public-consultation-card__heading"><div><span>01</span><h2>기본 정보</h2></div><small>필수 항목을 먼저 입력해 주세요.</small></div><div className="consultation-form-grid"><label className="consultation-form-grid__wide">두 분 성함<input required value={form.coupleNames} onChange={(event) => update('coupleNames', event.target.value)} placeholder="예: 김서연 & 이현우" /></label><label>연락처<input value={form.couplePhones} onChange={(event) => update('couplePhones', event.target.value)} placeholder="연락 가능한 번호" /></label><label>예식일<input required type="date" value={form.weddingDate} onChange={(event) => update('weddingDate', event.target.value)} /></label><label>예식장 또는 희망 지역<input value={form.venue} onChange={(event) => update('venue', event.target.value)} placeholder="예: 남산 / 미정" /></label><label>예산<select value={form.budget} onChange={(event) => update('budget', event.target.value)}><option value="">선택해 주세요</option>{options.budget.map((item) => <option key={item}>{item}</option>)}</select></label></div><div className="public-consultation-card__heading"><div><span>02</span><h2>취향과 방향</h2></div><small>가장 가까운 답을 골라 주세요.</small></div><div className="consultation-form-grid"><label>스튜디오 방향<select value={form.studioDirection} onChange={(event) => update('studioDirection', event.target.value)}><option value="">선택해 주세요</option>{options.studio.map((item) => <option key={item}>{item}</option>)}</select></label><label>드레스 분위기<select value={form.dressStyle} onChange={(event) => update('dressStyle', event.target.value)}><option value="">선택해 주세요</option>{options.dress.map((item) => <option key={item}>{item}</option>)}</select></label><label>메이크업 분위기<select value={form.makeupStyle} onChange={(event) => update('makeupStyle', event.target.value)}><option value="">선택해 주세요</option>{options.makeup.map((item) => <option key={item}>{item}</option>)}</select></label><label className="consultation-form-grid__wide">플래너에게 전하고 싶은 내용<textarea value={form.notes} onChange={(event) => update('notes', event.target.value)} placeholder="원하는 스타일, 궁금한 점, 꼭 고려할 내용을 자유롭게 적어 주세요." /></label></div><button className="consultation-save" type="submit"><Send size={16} /> 상담 카드 제출하기</button></form><p className="public-consultation-footer"><Clipboard size={13} /> 작성한 내용은 담당 플래너의 상담 카드에 반영됩니다.</p></main>
}