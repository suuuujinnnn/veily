import { ArrowRight, CalendarDays, CheckCircle2, LayoutDashboard, LockKeyhole, UserRound } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { couples } from '../../data/mockData'

export function PortalEntryPage() {
  const { coupleId = 'c1' } = useParams()
  const couple = couples.find((item) => item.id === coupleId) ?? couples[0]

  return (
    <main className="portal-entry">
      <section className="portal-entry__panel">
        <div className="portal-entry__brand">VEILY <span>CLIENT SPACE</span></div>
        <div className="portal-entry__copy">
          <span className="portal-entry__secure"><LockKeyhole size={14} /> 초대받은 고객 전용</span>
          <h1>어떤 화면으로<br />접속할까요?</h1>
          <p>{couple.partners}님의 준비 공간입니다. 전달받은 목적에 맞는 화면만 열 수 있습니다.</p>
        </div>
        <div className="portal-entry__meta"><UserRound size={16} /><div><span>고객</span><strong>{couple.partners}</strong></div></div>
      </section>
      <section className="portal-entry__choices">
        <header><p>ACCESS OPTIONS</p><h2>고객 화면 선택</h2><span>플래너 관리 화면과 분리된 전용 링크입니다.</span></header>
        <div className="portal-entry__choice-list">
          <Link to={`/portal/${couple.id}`}>
            <span className="portal-entry__choice-icon"><LayoutDashboard size={22} /></span>
            <div><small>전체 포털</small><h3>준비 현황 전체 보기</h3><p>일정, 할 일, 추천 업체와 진행률을 한 번에 확인합니다.</p></div>
            <ArrowRight size={18} />
          </Link>
          <Link to={`/portal/${couple.id}/calendar`}>
            <span className="portal-entry__choice-icon"><CalendarDays size={22} /></span>
            <div><small>일정 전용 링크</small><h3>공유 캘린더만 열기</h3><p>확정 일정과 업체 예약 후보만 바로 확인하고 변경합니다.</p></div>
            <ArrowRight size={18} />
          </Link>
        </div>
        <div className="portal-entry__notice"><CheckCircle2 size={16} /><span>선택한 변경 사항은 담당 플래너 화면에 즉시 반영됩니다.</span></div>
      </section>
    </main>
  )
}
