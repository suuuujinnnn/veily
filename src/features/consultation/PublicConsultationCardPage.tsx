import { useState } from 'react'
import { Check, Send } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import { useDemoStore } from '../../app/store'
import { Badge, Button, Card } from '../../components/ui'

const studioDirections = ['토탈세미', '토탈일반', '세미', '일반', '야외스냅세미', '야외스냅일반']
const studioMoods = ['인물중심', '배경중심', '깔끔함', '초록초록', '화려', '빈티지', '화보']
const dressMoods = ['실크', '비즈와 레이스', '유니크', '다양하게 있는 곳']
const makeupMoods = ['깔끔', '누디', '과즙', '강하게']
const plannerStatusOptions = ['있다', '없다', '예정이다']
const planningOptions = ['없음', '웨딩홀 섭외', '예식 일정 기준 월별 플랜', '대면 상담']
const contactOptions = ['카톡 상담', '전화 상담', '직접 입력']

function ChoiceField({ label, value, onChange, options, wide = false }: { label: string; value: string; onChange: (value: string) => void; options: string[]; wide?: boolean }) {
  const selectValue = options.includes(value) ? value : ''
  const customValue = options.includes(value) ? '' : value
  return (
    <label className={`form-field ${wide ? 'form-field--wide' : ''}`}>
      <span>{label}</span>
      <select value={selectValue} onChange={(event) => onChange(event.target.value)}>
        <option value="">선택해 주세요</option>
        {options.map((option) => <option value={option} key={option}>{option}</option>)}
      </select>
      <input value={customValue} onChange={(event) => onChange(event.target.value)} placeholder={`${label} 직접 입력`} />
    </label>
  )
}

export function PublicConsultationCardPage() {
  const { coupleId = 'new-client' } = useParams()
  const isNew = coupleId.startsWith('new-')
  const navigate = useNavigate()
  const { couples, addCouple, addConsultationCard } = useDemoStore()
  const couple = couples.find((item) => item.id === coupleId) ?? couples[0]
  const [preferredDate, setPreferredDate] = useState(isNew ? '' : couple.weddingDate)
  const [shootDate, setShootDate] = useState('')
  const [coupleNames, setCoupleNames] = useState(isNew ? '' : couple.partners)
  const [phone, setPhone] = useState('')
  const [existingVendors, setExistingVendors] = useState('')
  const [studioDirection, setStudioDirection] = useState('')
  const [studioMood, setStudioMood] = useState('')
  const [dressMood, setDressMood] = useState('')
  const [sizes, setSizes] = useState('')
  const [makeupMood, setMakeupMood] = useState('')
  const [budget, setBudget] = useState('')
  const [otherPlanner, setOtherPlanner] = useState('')
  const [extraPlanning, setExtraPlanning] = useState('')
  const [hallDetails, setHallDetails] = useState('')
  const [meetingDetails, setMeetingDetails] = useState('')
  const [contactPreference, setContactPreference] = useState('')
  const [notes, setNotes] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const submit = () => {
    if (!coupleNames.trim() || !preferredDate || !phone.trim()) return
    const targetId = isNew ? `c-${Date.now()}` : couple.id
    if (isNew) {
      const names = coupleNames.split('&').map((name) => name.trim()).filter(Boolean)
      addCouple({
        id: targetId,
        partners: coupleNames,
        initials: names.map((name) => name.slice(0, 1)).join(' · ') || 'C',
        weddingDate: preferredDate,
        venue: '예식장 미정',
        progress: 0,
        status: '준비중',
        concept: '상담 카드 작성 완료',
        tone: 'sand',
      })
    }
    addConsultationCard({
      coupleId: targetId,
      preferredDate,
      shootDate,
      coupleNames,
      phone,
      existingVendors,
      studioDirection,
      studioMood,
      dressMood,
      sizes,
      makeupMood,
      budget,
      otherPlanner,
      extraPlanning,
      hallDetails,
      meetingDetails,
      contactPreference,
      priorities: [studioMood, dressMood, makeupMood].filter(Boolean).join(' · '),
      notes,
      source: '고객 작성',
    })
    setSubmitted(true)
    window.setTimeout(() => navigate(`/portal/${targetId}`), 900)
  }

  return (
    <main className="public-consultation-page">
      <Card className="public-consultation-card">
        <p className="eyebrow">VEILY CONSULTATION CARD</p>
        <h1>{isNew ? '우리 취향 체크하기' : `${coupleNames || couple.partners}님의 상담 카드`}</h1>
        <p className="consultation-form-intro">플래너가 같은 항목으로 확인할 수 있도록 예식 정보, 취향, 상담 메모를 순서대로 작성해 주세요.</p>
        {submitted ? <div className="consultation-success"><Check size={28} /><h2>상담 카드가 전달되었습니다.</h2><p>작성한 내용을 바탕으로 고객 페이지를 만들고 있습니다.</p></div> : (
          <div className="form-grid consultation-form-grid">
            <label className="form-field"><span>예식일정 *</span><input type="date" value={preferredDate} onChange={(event) => setPreferredDate(event.target.value)} /></label>
            <label className="form-field"><span>촬영 일정</span><input type="date" value={shootDate} onChange={(event) => setShootDate(event.target.value)} /></label>
            <label className="form-field form-field--wide"><span>신랑신부 성함 *</span><input value={coupleNames} onChange={(event) => setCoupleNames(event.target.value)} placeholder="예: 김서윤 & 이동현" /></label>
            <label className="form-field form-field--wide"><span>핸드폰번호 *</span><input value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="010-0000-0000" /></label>
            <label className="form-field form-field--wide"><span>미리 선별 업체</span><input value={existingVendors} onChange={(event) => setExistingVendors(event.target.value)} placeholder="없을 경우 없음으로 입력해 주세요" /></label>
            <ChoiceField label="스튜디오 방향" value={studioDirection} onChange={setStudioDirection} options={studioDirections} />
            <ChoiceField label="스튜디오 무드" value={studioMood} onChange={setStudioMood} options={studioMoods} />
            <ChoiceField label="드레스 무드" value={dressMood} onChange={setDressMood} options={dressMoods} />
            <label className="form-field"><span>신랑신부 사이즈</span><input value={sizes} onChange={(event) => setSizes(event.target.value)} placeholder="예: 신랑 상의 100 / 신부 66" /></label>
            <ChoiceField label="메이크업 무드" value={makeupMood} onChange={setMakeupMood} options={makeupMoods} />
            <label className="form-field"><span>스드메 예산</span><input value={budget} onChange={(event) => setBudget(event.target.value)} placeholder="예: 200만원 이상" /></label>
            <ChoiceField label="타 컨설팅 플래너 상담 여부" value={otherPlanner} onChange={setOtherPlanner} options={plannerStatusOptions} />
            <ChoiceField label="추가 플래닝 희망 항목" value={extraPlanning} onChange={setExtraPlanning} options={planningOptions} wide />
            <label className="form-field form-field--wide"><span>웨딩홀 관련 내용</span><textarea rows={3} value={hallDetails} onChange={(event) => setHallDetails(event.target.value)} placeholder="보증인원, 시간대, 요일, 지역, 대략 예산 등" /></label>
            <label className="form-field form-field--wide"><span>대면 상담 희망 일정</span><textarea rows={3} value={meetingDetails} onChange={(event) => setMeetingDetails(event.target.value)} placeholder="방문 상담 희망 일정과 가능한 시간대를 적어 주세요" /></label>
            <ChoiceField label="연락 선호 방식" value={contactPreference} onChange={setContactPreference} options={contactOptions} wide />
            <label className="form-field form-field--wide"><span>기타 상담 메모</span><textarea rows={4} value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="플래너에게 미리 알려주고 싶은 내용을 적어 주세요" /></label>
            <Button icon={<Send size={15} />} onClick={submit} disabled={!coupleNames.trim() || !preferredDate || !phone.trim()}>작성 완료</Button>
          </div>
        )}
      </Card>
    </main>
  )
}
