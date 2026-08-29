import { useState, type FormEvent } from 'react'
import { ArrowLeft, Check, Heart, Send, Sparkles } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useDemoStore } from '../../app/store'
import { Badge, Button, Card } from '../../components/ui'
import type { ConsultationCard } from '../../types'

const studioDirections = ['토탈 스튜디오', '비토탈 스튜디오', '야외 스냅']
const studioMoods = ['인물 중심', '배경 중심', '깔끔함', '초록빛', '화려함', '빈티지', '화보 느낌']
const dressMoods = ['미카도 실크', '비즈와 레이스', '유니크', '다양한 스타일']
const makeupMoods = ['깔끔', '누디', '생기 있는', '선명한']

type EditableCard = Omit<ConsultationCard, 'id' | 'coupleId' | 'createdAt' | 'source'>

function PreferenceGroup({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (value: string) => void }) {
  return (
    <fieldset className="preference-choice-group">
      <legend>{label}</legend>
      <div>{options.map((option) => <button type="button" className={value === option ? 'active' : ''} onClick={() => onChange(option)} key={option}>{value === option && <Check size={13} />}{option}</button>)}</div>
    </fieldset>
  )
}

export function PublicConsultationCardPage() {
  const { coupleId = 'c1' } = useParams()
  const navigate = useNavigate()
  const { couples, consultationCards, saveConsultationCard } = useDemoStore()
  const couple = couples.find((item) => item.id === coupleId) ?? couples[0]
  const existing = consultationCards.find((item) => item.coupleId === couple.id)
  const [saved, setSaved] = useState(false)
  const [form, setForm] = useState<EditableCard>({
    preferredDate: existing?.preferredDate ?? couple.weddingDate.slice(0, 7),
    shootDate: existing?.shootDate ?? '',
    coupleNames: existing?.coupleNames ?? couple.partners,
    phone: existing?.phone ?? '',
    existingVendors: existing?.existingVendors ?? '',
    studioDirection: existing?.studioDirection ?? '',
    studioMood: existing?.studioMood ?? '',
    dressMood: existing?.dressMood ?? '',
    sizes: existing?.sizes ?? '',
    makeupMood: existing?.makeupMood ?? '',
    budget: existing?.budget ?? '',
    otherPlanner: existing?.otherPlanner ?? '',
    extraPlanning: existing?.extraPlanning ?? '',
    hallDetails: existing?.hallDetails ?? '',
    meetingDetails: existing?.meetingDetails ?? '',
    preferredRegion: existing?.preferredRegion ?? couple.address.split(' ').slice(0, 2).join(' '),
    priorities: existing?.priorities ?? '',
    notes: existing?.notes ?? '',
  })

  const update = <K extends keyof EditableCard>(key: K, value: EditableCard[K]) => setForm((current) => ({ ...current, [key]: value }))

  const submit = (event: FormEvent) => {
    event.preventDefault()
    const priorities = [form.studioMood, form.dressMood, form.makeupMood, form.priorities].filter(Boolean).join(' · ')
    saveConsultationCard({ ...form, id: existing?.id, createdAt: existing?.createdAt, coupleId: couple.id, priorities, source: '고객 작성' })
    setSaved(true)
    window.setTimeout(() => navigate(`/couples/${couple.id}?tab=consultations`), 700)
  }

  return (
    <main className="preference-page">
      <div className="preference-page__shell">
        <Link className="back-link" to={`/couples/${couple.id}?tab=consultations`}><ArrowLeft size={15} /> 상담 탭으로 돌아가기</Link>
        <Card className="preference-form-card">
          <header className="preference-form-card__header">
            <div className="preference-form-card__icon"><Heart size={22} /></div>
            <div><p className="eyebrow">VEILY TASTE FINDER</p><h1>우리 취향 찾기</h1><p>좋아하는 분위기를 고르면 플래너가 상담 카드와 업체 추천에 바로 활용할 수 있어요.</p></div>
            <Badge tone="sage">{existing ? '작성 내용 수정' : '새 상담 카드'}</Badge>
          </header>

          {saved ? <div className="preference-success"><Check size={28} /><h2>취향 카드가 저장되었습니다.</h2><p>상담 탭으로 돌아가 정리된 내용을 보여드릴게요.</p></div> : (
            <form className="preference-form" onSubmit={submit}>
              <section className="preference-section"><div className="preference-section__title"><span>01</span><div><h2>기본 일정</h2><p>상담에 필요한 최소 정보를 확인합니다.</p></div></div><div className="form-grid">
                <label className="form-field"><span>희망 본식 일정</span><input type="month" value={form.preferredDate} onChange={(event) => update('preferredDate', event.target.value)} required /></label>
                <label className="form-field"><span>촬영 예정일</span><input type="date" value={form.shootDate} onChange={(event) => update('shootDate', event.target.value)} /></label>
                <label className="form-field"><span>커플 이름</span><input value={form.coupleNames} onChange={(event) => update('coupleNames', event.target.value)} required /></label>
                <label className="form-field"><span>연락처</span><input value={form.phone} onChange={(event) => update('phone', event.target.value)} placeholder="010-0000-0000" /></label>
                <label className="form-field"><span>희망 지역</span><input value={form.preferredRegion} onChange={(event) => update('preferredRegion', event.target.value)} placeholder="예: 서울 강남·서초" /></label>
              </div></section>

              <section className="preference-section"><div className="preference-section__title"><span>02</span><div><h2>스드메 취향</h2><p>정답보다 지금 마음이 가는 쪽을 골라주세요.</p></div></div>
                <PreferenceGroup label="스튜디오 구성" value={form.studioDirection} options={studioDirections} onChange={(value) => update('studioDirection', value)} />
                <PreferenceGroup label="스튜디오 무드" value={form.studioMood} options={studioMoods} onChange={(value) => update('studioMood', value)} />
                <PreferenceGroup label="드레스 무드" value={form.dressMood} options={dressMoods} onChange={(value) => update('dressMood', value)} />
                <PreferenceGroup label="메이크업 무드" value={form.makeupMood} options={makeupMoods} onChange={(value) => update('makeupMood', value)} />
              </section>

              <section className="preference-section"><div className="preference-section__title"><span>03</span><div><h2>상담 메모</h2><p>예산과 우선순위를 함께 남겨주세요.</p></div></div><div className="form-grid">
                <label className="form-field"><span>스드메 예산</span><input value={form.budget} onChange={(event) => update('budget', event.target.value)} placeholder="예: 300만원 내외" /></label>
                <label className="form-field"><span>신랑·신부 사이즈</span><input value={form.sizes} onChange={(event) => update('sizes', event.target.value)} /></label>
                <label className="form-field form-field--wide"><span>이미 정한 업체</span><input value={form.existingVendors} onChange={(event) => update('existingVendors', event.target.value)} placeholder="계약했거나 후보로 정한 업체를 적어주세요." /></label>
                <label className="form-field form-field--wide"><span>가장 중요한 기준</span><input value={form.priorities} onChange={(event) => update('priorities', event.target.value)} placeholder="예: 자연스러운 사진, 이동 동선, 추가 비용" /></label>
                <label className="form-field form-field--wide"><span>웨딩홀 관련 내용</span><textarea rows={3} value={form.hallDetails} onChange={(event) => update('hallDetails', event.target.value)} /></label>
                <label className="form-field"><span>타 플래너 상담 여부</span><input value={form.otherPlanner} onChange={(event) => update('otherPlanner', event.target.value)} /></label>
                <label className="form-field"><span>추가 플래닝 희망</span><input value={form.extraPlanning} onChange={(event) => update('extraPlanning', event.target.value)} /></label>
                <label className="form-field form-field--wide"><span>대면 상담 가능 일정</span><textarea rows={2} value={form.meetingDetails} onChange={(event) => update('meetingDetails', event.target.value)} /></label>
                <label className="form-field form-field--wide"><span>기타 메모</span><textarea rows={4} value={form.notes} onChange={(event) => update('notes', event.target.value)} /></label>
              </div></section>

              <div className="preference-form__footer"><span><Sparkles size={15} /> 선택한 취향은 상담 카드에 요약됩니다.</span><Button type="submit" icon={<Send size={15} />}>상담 카드 저장</Button></div>
            </form>
          )}
        </Card>
      </div>
    </main>
  )
}
