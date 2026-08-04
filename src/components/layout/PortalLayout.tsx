import { Link, Outlet } from 'react-router-dom'
import { Headphones, Leaf } from 'lucide-react'

export function PortalLayout() {
  return (
    <div className="portal-shell">
      <header className="portal-header">
        <Link className="portal-brand" to="/portal/c1">VEILY <i><Leaf size={12} /> our wedding</i></Link>
        <div className="portal-header__right"><span>담당 플래너 <strong>이지윤</strong></span><button className="portal-help"><Headphones size={16} /> 문의하기</button></div>
      </header>
      <main><Outlet /></main>
      <footer className="portal-footer"><span>VEILY</span><p>당신다운 결혼을 준비하는 가장 다정한 방법</p></footer>
    </div>
  )
}
