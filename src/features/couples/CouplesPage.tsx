import { useMemo, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { CalendarDays, ChevronRight, Clipboard, Filter, Plus, Search, SlidersHorizontal, X } from 'lucide-react'
import { Badge, Button, Progress } from '../../components/ui'
import { useDemoStore } from '../../app/store'
import type { ConsultationCard, Couple } from '../../types'

type RegistrationForm = { partners: string; weddingDate: string; venue: string; coupleNames: string; couplePhones: string; budget: string; studioDirection: string; studioCustom: string; dressStyle: string; dressCustom: string; makeupStyle: string; makeupCustom: string; otherPlanner: string; additionalPlanning: string; notes: string }
const emptyForm: RegistrationForm = { partners: '', weddingDate: '', venue: '', coupleNames: '', couplePhones: '', budget: '', studioDirection: '', studioCustom: '', dressStyle: '', dressCustom: '', makeupStyle: '', makeupCustom: '', otherPlanner: '', additionalPlanning: '', notes: '' }

export function CouplesPage() {
  const { couples, addCouple } = useDemoStore()
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('전체')
  const [registrationOpen, setRegistrationOpen] = useState(false)
  const [linkCopied, setLinkCopied] = useState(false)
  const [form, setForm] = useState<RegistrationForm>(emptyForm)
  const filtered = useMemo(() => couples.filter((couple) => (status === '전체' || couple.status === status) && couple.partners.includes(query)), [couples, query, status])
  const copyConsultationLink = async () => { await navigator.clipboard?.writeText(window.location.origin + '/consultation/new'); setLinkCopied(true); window.setTimeout(() => setLinkCopied(false), 1800) }
  const update = (key: keyof RegistrationForm, value: string) => setForm((current) => ({ ...current, [key]: value }))
  const saveNewCouple = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const id = `c-${Date.now()}`
    const couple: Couple = { id, partners: form.partners, initials: form.partners.split('&').map((name) => name.trim().slice(0, 1)).join('').slice(0, 2) || '커플', weddingDate: form.weddingDate, venue: form.venue, progress: 0, status: '준비중', concept: '', tone: 'sage' }
    const custom = (value: string, direct: string) => value === '직접 입력' ? direct : value
    const consultation: ConsultationCard = { id: `consult-${id}`, coupleId: id, weddingDate: form.weddingDate, venue: form.venue, budget: form.budget, preferredStyle: '', priorities: form.additionalPlanning, requestedTopics: '', notes: form.notes, submittedAt: new Date().toISOString().slice(0, 10), coupleNames: form.coupleNames, couplePhones: form.couplePhones, studioDirection: custom(form.studioDirection, form.studioCustom), dressStyle: custom(form.dressStyle, form.dressCustom), makeupStyle: custom(form.makeupStyle, form.makeupCustom), otherPlanner: form.otherPlanner, additionalPlanning: form.additionalPlanning }
    addCouple(couple, consultation)
    setRegistrationOpen(false)
    setForm(emptyForm)
  }
  return <div className="page-stack">
    <section className="page-intro"><div><p className="eyebrow">커플 관리</p><h1>커플 관리</h1><p>고객의 결혼 준비 과정과 상담 내용을 한곳에서 관리하세요.</p></div><div className="couples-page-actions"><Button variant="secondary" icon={<Clipboard size={16} />} onClick={copyConsultationLink}>{linkCopied ? '링크 복사 완료' : '상담 카드 링크 복사'}</Button><Button icon={<Plus size={16} />} onClick={() => setRegistrationOpen(true)}>새 커플 등록</Button></div></section>
    <div className="toolbar"><label className="search-field"><Search size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="이름으로 검색" /></label><div className="filter-tabs" aria-label="상태 필터">{['전체', '진행중', '준비중', '확정'].map((item) => <button key={item} onClick={() => setStatus(item)} className={status === item ? 'active' : ''}>{item}</button>)}</div><button className="outline-icon-button"><SlidersHorizontal size={16} /> 정렬</button></div>
    <div className="couples-summary"><span><strong>{filtered.length}</strong>쌍</span><p><Filter size={14} /> 결혼식이 가까운 순</p></div>
    <div className="couple-grid couple-grid--page">{filtered.map((couple, index) => <Link key={couple.id} to={`/couples/${couple.id}`} className={`couple-list-card couple-list-card--${couple.tone}`}><div className="couple-list-card__visual"><span>{String(index + 1).padStart(2, '0')}</span><div className="monogram monogram--large">{couple.initials}</div><small>{couple.concept}</small></div><div className="couple-list-card__body"><div className="couple-list-card__heading"><Badge tone={couple.status === '진행중' ? 'rose' : couple.status === '확정' ? 'sage' : 'neutral'}>{couple.status}</Badge><ChevronRight size={17} /></div><h2>{couple.partners}님</h2><p className="venue-line">{couple.venue}</p><div className="wedding-date"><CalendarDays size={15} /><span>{couple.weddingDate.replaceAll('-', '. ')}</span></div><div className="progress-copy"><span>준비 진행률</span><strong>{couple.progress}%</strong></div><Progress value={couple.progress} /></div></Link>)}</div>
    {registrationOpen && <div className="registration-modal"><div className="registration-modal__panel"><div className="section-heading"><div><p className="eyebrow">새 커플 등록</p><h2>커플 정보와 상담 카드</h2><p className="muted">등록할 때 입력한 상담 내용은 플래너의 부부 상담 카드에 초기값으로 저장됩니다.</p></div><button onClick={() => setRegistrationOpen(false)} aria-label="닫기"><X size={18} /></button></div><form className="registration-form" onSubmit={saveNewCouple}>
      <label>커플 이름<input value={form.partners} onChange={(event) => update('partners', event.target.value)} placeholder="예: 김서연 & 이현우" required /></label><label>예식일<input type="date" value={form.weddingDate} onChange={(event) => update('weddingDate', event.target.value)} required /></label><label>예식장<input value={form.venue} onChange={(event) => update('venue', event.target.value)} required /></label><label>두 분 성함<input value={form.coupleNames} onChange={(event) => update('coupleNames', event.target.value)} /></label><label>두 분 연락처<input value={form.couplePhones} onChange={(event) => update('couplePhones', event.target.value)} /></label><label>예산<select value={form.budget} onChange={(event) => update('budget', event.target.value)}><option value="">선택해 주세요</option><option>300만 원~400만 원</option><option>400만 원~500만 원</option><option>500만 원 이상</option><option>직접 입력</option></select></label>
      <label>스튜디오 촬영 방향<select value={form.studioDirection} onChange={(event) => update('studioDirection', event.target.value)}><option value="">선택해 주세요</option><option>토탈 세미</option><option>토탈 일반</option><option>세미</option><option>일반</option><option>야외 스냅</option><option>직접 입력</option></select>{form.studioDirection === '직접 입력' && <input value={form.studioCustom} onChange={(event) => update('studioCustom', event.target.value)} placeholder="직접 입력" />}</label>
      <label>드레스 분위기<select value={form.dressStyle} onChange={(event) => update('dressStyle', event.target.value)}><option value="">선택해 주세요</option><option>실크</option><option>비즈와 레이스</option><option>화려함</option><option>유니크</option><option>직접 입력</option></select>{form.dressStyle === '직접 입력' && <input value={form.dressCustom} onChange={(event) => update('dressCustom', event.target.value)} placeholder="직접 입력" />}</label>
      <label>메이크업 분위기<select value={form.makeupStyle} onChange={(event) => update('makeupStyle', event.target.value)}><option value="">선택해 주세요</option><option>깔끔</option><option>누디</option><option>과즙</option><option>강하게</option><option>직접 입력</option></select>{form.makeupStyle === '직접 입력' && <input value={form.makeupCustom} onChange={(event) => update('makeupCustom', event.target.value)} placeholder="직접 입력" />}</label>
      <label>타 플래너 상담 여부<select value={form.otherPlanner} onChange={(event) => update('otherPlanner', event.target.value)}><option value="">선택해 주세요</option><option>있음</option><option>없음</option><option>예정</option></select></label><label>추가 플래닝 항목<select value={form.additionalPlanning} onChange={(event) => update('additionalPlanning', event.target.value)}><option value="">선택해 주세요</option><option>웨딩홀 섭외</option><option>월별 플랜</option><option>대면 상담</option><option>직접 입력</option></select></label><label className="registration-form__wide">상담 메모<textarea value={form.notes} onChange={(event) => update('notes', event.target.value)} /></label><div className="registration-form__actions"><button type="button" onClick={() => setRegistrationOpen(false)}>취소</button><button className="primary-btn" type="submit">커플 등록 및 상담 카드 저장</button></div>
    </form></div></div>}
  </div>
}