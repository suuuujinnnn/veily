import { Link, Outlet } from 'react-router-dom'
import { Headphones, LockKeyhole } from 'lucide-react'

export function PortalLayout() {
  return (
    <div className="portal-shell">
      <header className="portal-header">
        <Link className="portal-brand" to="/client/c1">VEILY <i><LockKeyhole size={11} /> 고객 전용</i></Link>
        <div className="portal-header__right"><span>담당 플래너 <strong>이지윤</strong></span><button className="portal-help"><Headphones size={16} /> 문의하기</button></div>
      </header>
      <main><Outlet /></main>
      <footer className="portal-footer"><span>VEILY</span><p>공유된 일정과 준비 현황을 안전하게 확인하세요.</p></footer>
    </div>
  )
}
