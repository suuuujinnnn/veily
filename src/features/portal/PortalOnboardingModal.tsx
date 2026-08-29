import { useEffect, useState } from 'react'
import { Check, ChevronLeft, ChevronRight, ReceiptText, UserRound } from 'lucide-react'
import { DEMO_NOW, useDemoStore } from '../../app/store'
import { Button, Modal } from '../../components/ui'
import type { Couple } from '../../types'

type StepKey = 'profile' | 'budget'
type ProfileQuestion = { id: string; section: 'profile'; kind: 'profile'; key: keyof Couple; title: string; helper: string; inputType?: 'text' | 'date' | 'email' }
type BudgetTotalQuestion = { id: string; section: 'budget'; kind: 'budget-total'; title: string; helper: string }
type OnboardingQuestion = ProfileQuestion | BudgetTotalQuestion

const sectionMeta: Record<StepKey, { label: string; icon: typeof UserRound }> = {
  profile: { label: '고객·예식 정보', icon: UserRound },
  budget: { label: '예상 견적', icon: ReceiptText },
}

const profileQuestions: ProfileQuestion[] = [
  { id: 'bride-name', section: 'profile', kind: 'profile', key: 'brideName', title: '신부님의 이름을 알려주세요.', helper: '플래너가 두 분을 정확하게 안내할 수 있도록 실명을 입력해 주세요.' },
  { id: 'groom-name', section: 'profile', kind: 'profile', key: 'groomName', title: '신랑님의 이름을 알려주세요.', helper: '입력한 이름은 고객 전용 화면에도 표시됩니다.' },
  { id: 'bride-job', section: 'profile', kind: 'profile', key: 'brideOccupation', title: '신부님의 직업이나 근무 형태는 어떻게 되나요?', helper: '연락하기 편한 시간과 상담 일정을 맞추는 데 도움이 됩니다.' },
  { id: 'groom-job', section: 'profile', kind: 'profile', key: 'groomOccupation', title: '신랑님의 직업이나 근무 형태도 알려주세요.', helper: '간단한 직군이나 근무 형태만 적어도 충분합니다.' },
  { id: 'address', section: 'profile', kind: 'profile', key: 'address', title: '두 분이 주로 생활하는 지역은 어디인가요?', helper: '업체 위치와 상담 동선을 안내할 때 참고합니다.' },
  { id: 'ceremony-date', section: 'profile', kind: 'profile', key: 'ceremonyDate', title: '예식 예정일은 언제인가요?', helper: '아직 정하지 않았다면 건너뛰고 나중에 수정할 수 있어요.', inputType: 'date' },
  { id: 'ceremony-place', section: 'profile', kind: 'profile', key: 'ceremonyPlace', title: '예식 장소가 정해졌나요?', helper: '웨딩홀 이름 또는 희망 지역을 입력해 주세요.' },
  { id: 'acquisition', section: 'profile', kind: 'profile', key: 'acquisitionChannel', title: '베일리를 어떻게 알게 되셨나요?', helper: '인스타그램, 지인 추천, 박람회처럼 간단히 알려주세요.' },
  { id: 'referrer', section: 'profile', kind: 'profile', key: 'referrerName', title: '추천해 주신 분이 있다면 알려주세요.', helper: '추천인이 없다면 편하게 건너뛰어 주세요.' },
]

const questions: OnboardingQuestion[] = [
  ...profileQuestions,
  { id: 'budget-total', section: 'budget', kind: 'budget-total', title: '전체 웨딩 예산은 어느 정도로 생각하고 계신가요?', helper: '정확한 견적이 아니라 준비 방향을 맞추기 위한 목표 금액입니다.' },
]

interface Props { open: boolean; coupleId: string; onClose: () => void; onComplete: () => void }

export function PortalOnboardingModal({ open, coupleId, onClose, onComplete }: Props) {
  const store = useDemoStore()
  const couple = store.couples.find((item) => item.id === coupleId) ?? store.couples[0]
  const existingBudgetPlan = store.budgetPlans.find((item) => item.coupleId === coupleId)
  const [questionIndex, setQuestionIndex] = useState(0)
  const [skippedQuestionIds, setSkippedQuestionIds] = useState<string[]>([])
  const [profile, setProfile] = useState<Couple>(couple)
  const [targetAmount, setTargetAmount] = useState(existingBudgetPlan?.targetAmount ?? 0)

  useEffect(() => {
    if (!open) return
    setQuestionIndex(0); setSkippedQuestionIds([]); setProfile(couple)
    setTargetAmount(existingBudgetPlan?.targetAmount ?? 0)
  }, [couple, existingBudgetPlan?.targetAmount, open])

  const question = questions[questionIndex]
  const meta = sectionMeta[question.section]
  const SectionIcon = meta.icon
  const finish = (skippedIds = skippedQuestionIds) => {
    store.updateCouple({ ...profile, partners: `${profile.brideName} & ${profile.groomName}` })
    store.updateBudgetPlan({ coupleId, targetAmount })
    const skippedSteps = (Object.keys(sectionMeta) as StepKey[]).filter((section) => questions.filter((item) => item.section === section).every((item) => skippedIds.includes(item.id)))
    store.completePortalOnboarding({ coupleId, completedAt: DEMO_NOW, skippedSteps })
    onComplete()
  }

  const next = () => questionIndex < questions.length - 1 ? setQuestionIndex((current) => current + 1) : finish()
  const skip = () => {
    const nextSkipped = skippedQuestionIds.includes(question.id) ? skippedQuestionIds : [...skippedQuestionIds, question.id]
    setSkippedQuestionIds(nextSkipped)
    if (questionIndex < questions.length - 1) setQuestionIndex((current) => current + 1)
    else finish(nextSkipped)
  }

  return <div className="portal-onboarding portal-onboarding--questions"><Modal open={open} onClose={onClose} eyebrow="Wedding preparation setup" title="두 분의 이야기를 들려주세요" footer={<><Button variant="ghost" onClick={skip}>이 질문 건너뛰기</Button><div className="portal-onboarding__footer-actions">{questionIndex > 0 && <Button variant="secondary" icon={<ChevronLeft size={14} />} onClick={() => setQuestionIndex((current) => current - 1)}>이전</Button>}<Button icon={questionIndex === questions.length - 1 ? <Check size={14} /> : <ChevronRight size={14} />} onClick={next}>{questionIndex === questions.length - 1 ? '입력 완료' : '다음'}</Button></div></>}>
    <div className="portal-question-progress"><div><span><SectionIcon size={14} /> {meta.label}</span><strong>{questionIndex + 1} / {questions.length}</strong></div><i><span style={{ width: `${((questionIndex + 1) / questions.length) * 100}%` }} /></i></div>
    <section className="portal-question-card" key={question.id}>
      <p>QUESTION {String(questionIndex + 1).padStart(2, '0')}</p>
      <h2>{question.title}</h2>
      <span>{question.helper}</span>
      <div className="portal-question-answer">
        {question.kind === 'profile' && <input autoFocus type={question.inputType ?? 'text'} value={String(profile[question.key])} onChange={(event) => setProfile({ ...profile, [question.key]: event.target.value, ...(question.key === 'ceremonyDate' ? { weddingDate: event.target.value } : {}), ...(question.key === 'ceremonyPlace' ? { venue: event.target.value } : {}) })} onKeyDown={(event) => { if (event.key === 'Enter') next() }} />}
        {question.kind === 'budget-total' && <label className="portal-question-money"><input autoFocus type="number" min="0" step="100000" value={targetAmount || ''} onChange={(event) => setTargetAmount(Number(event.target.value))} placeholder="0" /><span>원</span></label>}
      </div>
    </section>
  </Modal></div>
}
