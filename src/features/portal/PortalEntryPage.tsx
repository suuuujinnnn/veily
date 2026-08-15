import { useState } from 'react'
import { ArrowRight, CheckCircle2, ClipboardPenLine, LayoutDashboard, LockKeyhole, UserRound } from 'lucide-react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import { useDemoStore } from '../../app/store'
import { PortalOnboardingModal } from './PortalOnboardingModal'

export function PortalEntryPage() {
  const { coupleId = 'c1' } = useParams()
  const navigate = useNavigate()
  const { couples, portalOnboardingStates } = useDemoStore()
  const [onboardingOpen, setOnboardingOpen] = useState(false)
  const couple = couples.find((item) => item.id === coupleId) ?? couples[0]
  if (portalOnboardingStates.some((item) => item.coupleId === couple.id)) return <Navigate to={`/portal/${couple.id}`} replace />

  return (
    <main className="portal-entry">
      <section className="portal-entry__panel">
        <div className="portal-entry__brand">VEILY <span>CLIENT SPACE</span></div>
        <div className="portal-entry__copy">
          <span className="portal-entry__secure"><LockKeyhole size={14} /> 두 분만을 위한 준비 공간</span>
          <h1>같이 준비를<br />시작해볼까요?</h1>
          <p>{couple.partners}님의 웨딩 준비가 시작됐어요. 간단한 정보부터 두 분의 속도에 맞춰 차근차근 함께할게요.</p>
        </div>
        <div className="portal-entry__meta"><UserRound size={16} /><div><span>OUR COUPLE</span><strong>{couple.partners}</strong></div></div>
      </section>
      <section className="portal-entry__choices">
        <header><p>WELCOME TO VEILY</p><h2>두 분의 준비 공간이 열렸어요.</h2><span>간단한 정보를 먼저 알려주시거나, 준비 화면을 편하게 둘러보세요.</span></header>
        <div className="portal-entry__choice-list">
          <button className="portal-entry__onboarding" onClick={() => setOnboardingOpen(true)}>
            <span className="portal-entry__choice-icon"><ClipboardPenLine size={22} /></span>
            <div><small>약 2분</small><h3>준비 시작하기</h3><p>기본 정보와 전체 예상 예산을 질문 하나씩 편하게 알려주세요.</p></div>
            <ArrowRight size={18} />
          </button>
          <Link to={`/portal/${couple.id}`}>
            <span className="portal-entry__choice-icon"><LayoutDashboard size={22} /></span>
            <div><small>나중에 입력해도 괜찮아요</small><h3>먼저 둘러볼게요</h3><p>일정, 준비 현황과 추천 업체가 담긴 두 분의 공간을 먼저 확인해 보세요.</p></div>
            <ArrowRight size={18} />
          </Link>
        </div>
        <div className="portal-entry__notice"><CheckCircle2 size={16} /><span>모든 질문은 건너뛸 수 있고, 입력한 내용은 언제든 다시 바꿀 수 있어요.</span></div>
      </section>
      <PortalOnboardingModal open={onboardingOpen} coupleId={couple.id} onClose={() => setOnboardingOpen(false)} onComplete={() => navigate(`/portal/${couple.id}`)} />
    </main>
  )
}
