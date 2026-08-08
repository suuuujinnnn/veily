import { NavLink, Outlet, useLocation } from 'react-router-dom'
import {
  Bell,
  Building2,
  CalendarDays,
  ChevronRight,
  HeartHandshake,
  LayoutDashboard,
  MessageCircleMore,
  Search,
  UsersRound,
} from 'lucide-react'

const navItems = [
  { to: '/', label: '홈', icon: LayoutDashboard, end: true },
  { to: '/couples', label: '커플 관리', icon: UsersRound },
  { to: '/calendar', label: '일정', icon: CalendarDays },
  { to: '/vendors', label: '업체 찾기', icon: Building2 },
  { to: '/community', label: '플래너 라운지', icon: MessageCircleMore },
]

const pageTitles: Record<string, string> = {
  '/': '홈', '/couples': '커플 관리', '/calendar': '일정', '/vendors': '업체 찾기', '/community': '플래너 라운지',
}

export function PlannerLayout() {
  const location = useLocation()
  const title = location.pathname.startsWith('/couples/') ? '커플 상세' : pageTitles[location.pathname] ?? 'VEILY'
  return (
    <div className="planner-shell">
      <aside className="sidebar">
        <div className="brand-row">
          <NavLink to="/" className="brand">VEILY<span>for planners</span></NavLink>
        </div>
        <nav className="sidebar__nav" aria-label="플래너 메뉴">
          <p className="nav-label">Workspace</p>
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end} className={({ isActive }) => `nav-item ${isActive ? 'nav-item--active' : ''}`}>
              <Icon size={18} strokeWidth={1.8} /><span>{label}</span>{label === '플래너 라운지' && <em>4</em>}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar__insight">
          <HeartHandshake size={21} />
          <strong>이번 주 웨딩 리포트</strong>
          <p>4개 일정과 7개의 할 일이 남아 있어요.</p>
          <span>리포트 보기 <ChevronRight size={13} /></span>
        </div>
        <div className="planner-profile">
          <span className="avatar">YJ</span>
          <div><strong>이지윤 플래너</strong><small>VEILY Partner</small></div>
          <button className="icon-button" aria-label="프로필 메뉴">•••</button>
        </div>
      </aside>
      <div className="planner-main">
        <header className="topbar">
          <div className="topbar__title"><span>{title}</span></div>
          <div className="topbar__actions">
            <label className="global-search"><Search size={16} /><input aria-label="전체 검색" placeholder="커플, 업체, 일정 검색" /></label>
            <button className="icon-button notification" aria-label="알림"><Bell size={18} /><i /></button>
          </div>
        </header>
        <main className="page-content"><Outlet /></main>
      </div>
    </div>
  )
}
