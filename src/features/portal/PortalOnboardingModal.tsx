import { useEffect, useMemo, useState } from 'react'
import { Check, ChevronLeft, ChevronRight, Heart, ReceiptText, UserRound } from 'lucide-react'
import { DEMO_NOW, useDemoStore } from '../../app/store'
import { Button, Modal } from '../../components/ui'
import { referenceCategories } from '../../data/referenceKeywordData'
import { weddingReferences } from '../../data/weddingReferenceData'
import { venueLocations, venueMealTypes, venueTypes, venueWishes } from '../../data/weddingVenueData'
import type { BudgetItem, Couple, ReferenceCategory } from '../../types'

type StepKey = 'profile' | 'taste' | 'budget'
const steps: Array<{ key: StepKey; label: string; icon: typeof UserRound }> = [
  { key: 'profile', label: '고객·예식 정보', icon: UserRound },
  { key: 'taste', label: '취향 찾기', icon: Heart },
  { key: 'budget', label: '예상 견적', icon: ReceiptText },
]
const budgetTemplates: Array<{ category: BudgetItem['category']; title: string }> = [
  { category: '웨딩홀·식대', title: '웨딩홀·식대' },
  { category: '스튜디오·드레스·메이크업', title: '스드메 패키지' },
  { category: '본식·기록', title: '본식 스냅·영상' },
  { category: '예복·예물', title: '예복·예물' },
  { category: '초대·하객', title: '청첩장·답례품' },
]

interface Props { open: boolean; coupleId: string; onClose: () => void; onComplete: () => void }

export function PortalOnboardingModal({ open, coupleId, onClose, onComplete }: Props) {
  const store = useDemoStore()
  const couple = store.couples.find((item) => item.id === coupleId) ?? store.couples[0]
  const existingSubmission = store.customerReferenceSubmissions.find((item) => item.coupleId === coupleId)
  const existingBudgetPlan = store.budgetPlans.find((item) => item.coupleId === coupleId)
  const existingBudgetItems = useMemo(() => store.budgetItems.filter((item) => item.coupleId === coupleId), [coupleId, store.budgetItems])
  const [step, setStep] = useState(0)
  const [skipped, setSkipped] = useState<StepKey[]>([])
  const [profile, setProfile] = useState<Couple>(couple)
  const [tags, setTags] = useState<string[]>(existingSubmission?.preferredTags ?? [])
  const [referenceIds, setReferenceIds] = useState<string[]>(existingSubmission?.selections.map((item) => item.referenceId) ?? [])
  const [targetAmount, setTargetAmount] = useState(existingBudgetPlan?.targetAmount ?? 0)
  const [budgetDrafts, setBudgetDrafts] = useState<Record<string, { amount: number; memo: string }>>({})

  useEffect(() => {
    if (!open) return
    setStep(0); setSkipped([]); setProfile(couple)
    setTags(existingSubmission?.preferredTags ?? [])
    setReferenceIds(existingSubmission?.selections.map((item) => item.referenceId) ?? [])
    setTargetAmount(existingBudgetPlan?.targetAmount ?? 0)
    setBudgetDrafts(Object.fromEntries(budgetTemplates.map((template) => {
      const item = existingBudgetItems.find((entry) => entry.category === template.category)
      return [template.category, { amount: item?.plannedAmount ?? 0, memo: item?.memo ?? '' }]
    })))
  }, [couple, existingBudgetItems, existingBudgetPlan?.targetAmount, existingSubmission, open])

  const selectedReferences = useMemo(() => weddingReferences.filter((reference) => referenceIds.includes(reference.id)), [referenceIds])
  const toggleTag = (tag: string) => setTags((current) => current.includes(tag) ? current.filter((item) => item !== tag) : [...current, tag])
  const toggleReference = (id: string) => setReferenceIds((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id])
  const skip = () => { const key = steps[step].key; setSkipped((current) => current.includes(key) ? current : [...current, key]); if (step < 2) setStep(step + 1); else finish([...skipped, key]) }
  const finish = (finalSkipped = skipped) => {
    if (!finalSkipped.includes('profile')) store.updateCouple({ ...profile, partners: `${profile.brideName} & ${profile.groomName}` })
    if (!finalSkipped.includes('taste')) {
      const counts = selectedReferences.reduce<Partial<Record<ReferenceCategory, number>>>((result, reference) => ({ ...result, [reference.category]: (result[reference.category] ?? 0) + 1 }), {})
      store.saveCustomerReferenceSubmission({ id: existingSubmission?.id ?? `customer-ref-${coupleId}`, coupleId, selections: referenceIds.map((referenceId) => ({ referenceId, note: '' })), preferredTags: tags, categoryCounts: counts, submittedAt: DEMO_NOW, status: existingSubmission ? '재전송됨' : '전송완료' })
    }
    if (!finalSkipped.includes('budget')) {
      store.updateBudgetPlan({ coupleId, targetAmount })
      budgetTemplates.forEach((template) => {
        const draft = budgetDrafts[template.category] ?? { amount: 0, memo: '' }
        const existing = existingBudgetItems.find((item) => item.category === template.category)
        if (existing) store.updateBudgetItem({ ...existing, plannedAmount: draft.amount, memo: draft.memo })
        else store.addBudgetItem({ coupleId, category: template.category, title: template.title, plannedAmount: draft.amount, memo: draft.memo })
      })
    }
    store.completePortalOnboarding({ coupleId, completedAt: DEMO_NOW, skippedSteps: finalSkipped })
    onComplete()
  }
  const next = () => step < 2 ? setStep(step + 1) : finish()

  return <div className="portal-onboarding"><Modal open={open} onClose={onClose} eyebrow="Wedding preparation setup" title="두 분의 준비 정보를 알려주세요" footer={<><Button variant="ghost" onClick={skip}>이 단계 건너뛰기</Button><div className="portal-onboarding__footer-actions">{step > 0 && <Button variant="secondary" icon={<ChevronLeft size={14} />} onClick={() => setStep(step - 1)}>이전</Button>}<Button icon={step === 2 ? <Check size={14} /> : <ChevronRight size={14} />} onClick={next}>{step === 2 ? '입력 완료' : '다음'}</Button></div></>}>
    <div className="portal-onboarding__steps">{steps.map((item, index) => { const Icon = item.icon; return <button className={index === step ? 'active' : index < step ? 'done' : ''} onClick={() => index <= step && setStep(index)} key={item.key}><i>{index < step ? <Check size={13} /> : <Icon size={14} />}</i><span>{item.label}</span></button> })}</div>
    {step === 0 && <div className="portal-onboarding__panel"><p>연락과 예식 진행에 필요한 상세 정보입니다. 입력한 내용은 플래너의 부부정보에도 바로 반영됩니다.</p><div className="portal-onboarding__form">
      {([['brideName','신부 이름'],['bridePhone','신부 연락처'],['brideEmail','신부 이메일'],['brideOccupation','신부 직업'],['groomName','신랑 이름'],['groomPhone','신랑 연락처'],['groomEmail','신랑 이메일'],['groomOccupation','신랑 직업'],['address','주소'],['ceremonyDate','예식일'],['ceremonyPlace','예식 장소'],['preferredContactTime','선호 연락 시간'],['acquisitionChannel','유입 경로'],['referrerName','추천인']] as Array<[keyof Couple,string]>).map(([key,label]) => <label className={key === 'address' ? 'wide' : ''} key={key}><span>{label}</span><input type={key === 'ceremonyDate' ? 'date' : 'text'} value={String(profile[key])} onChange={(event) => setProfile({ ...profile, [key]: event.target.value, ...(key === 'ceremonyDate' ? { weddingDate: event.target.value } : {}), ...(key === 'ceremonyPlace' ? { venue: event.target.value } : {}) })} /></label>)}
      <label><span>선호 연락수단</span><select value={profile.preferredContactMethod} onChange={(event) => setProfile({ ...profile, preferredContactMethod: event.target.value as Couple['preferredContactMethod'] })}><option>카카오톡</option><option>문자</option><option>전화</option><option>이메일</option></select></label>
    </div></div>}
    {step === 1 && <div className="portal-onboarding__panel portal-onboarding__taste"><p>분야별 선호 조건과 마음에 드는 대표 이미지를 골라주세요. 이후 내 취향 찾기에서 다시 수정할 수 있습니다.</p><div className="portal-onboarding__taste-groups">
      <section><strong>웨딩홀 지역</strong><div>{[...venueLocations.서울.slice(0, 8), ...venueLocations['경기·인천'].slice(0, 8)].map((tag) => <button className={tags.includes(tag) ? 'active' : ''} onClick={() => toggleTag(tag)} key={tag}>{tag}</button>)}</div></section>
      <section><strong>웨딩홀 식사·유형·희망사항</strong><div>{[...venueMealTypes, ...venueTypes, ...venueWishes].map((tag) => <button className={tags.includes(tag) ? 'active' : ''} onClick={() => toggleTag(tag)} key={tag}>{tag}</button>)}</div></section>
      {referenceCategories.filter((category) => category.label !== '웨딩홀').map((category) => <section key={category.label}><strong>{category.label}</strong><div>{category.groups.flatMap((group) => group.keywords).slice(0, 18).map((tag) => <button className={tags.includes(tag) ? 'active' : ''} onClick={() => toggleTag(tag)} key={`${category.label}-${tag}`}>{tag}</button>)}</div></section>)}
    </div><div className="portal-onboarding__references">{weddingReferences.filter((reference) => reference.category !== '웨딩홀').slice(0, 12).map((reference) => <button className={referenceIds.includes(reference.id) ? 'active' : ''} onClick={() => toggleReference(reference.id)} key={reference.id}><img src={reference.image} alt={reference.vendorName} /><span>{referenceIds.includes(reference.id) && <Check size={13} />}{reference.vendorName}</span></button>)}</div></div>}
    {step === 2 && <div className="portal-onboarding__panel"><p>총 예산과 분야별 예상 금액을 적어주세요. 실제 계약 견적이 아니라 준비 기준을 맞추기 위한 목표 금액입니다.</p><label className="portal-onboarding__total"><span>총 목표 예산</span><input type="number" min="0" step="100000" value={targetAmount || ''} onChange={(event) => setTargetAmount(Number(event.target.value))} /><em>원</em></label><div className="portal-onboarding__budget-list">{budgetTemplates.map((template) => { const draft = budgetDrafts[template.category] ?? { amount: 0, memo: '' }; return <article key={template.category}><strong>{template.title}</strong><label><span>예상 금액</span><input type="number" min="0" step="100000" value={draft.amount || ''} onChange={(event) => setBudgetDrafts({ ...budgetDrafts, [template.category]: { ...draft, amount: Number(event.target.value) } })} /></label><label><span>메모</span><input value={draft.memo} onChange={(event) => setBudgetDrafts({ ...budgetDrafts, [template.category]: { ...draft, memo: event.target.value } })} placeholder="중요 조건이나 포함 범위" /></label></article> })}</div></div>}
  </Modal></div>
}
