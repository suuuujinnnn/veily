import { useEffect, useRef, useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import {
  CalendarDays,
  ChevronDown,
  LayoutDashboard,
  ListTodo,
  LogOut,
  MessageCircleMore,
  Search,
  Settings,
  UserRound,
  UsersRound,
} from 'lucide-react'
import { useDemoStore } from '../../app/store'
import { Button, Modal, Toast } from '../ui'
import { buildPlannerTodos, todoCounts } from '../../features/todo/todoUtils'

const navItems = [
  { to: '/', label: '홈', icon: LayoutDashboard, end: true },
  { to: '/couples', label: '커플 관리', icon: UsersRound },
  { to: '/reminders', label: '리마인더', icon: ListTodo },
  { to: '/calendar', label: '일정', icon: CalendarDays },
  { to: '/vendors', label: '레퍼런스 · 업체 찾기', icon: Search },
  { to: '/community', label: '플래너 라운지', icon: MessageCircleMore },
]

type UtilityModal = 'settings' | 'logout' | null

export function PlannerLayout() {
  const store = useDemoStore()
  const navigate = useNavigate()
  const profileMenuRef = useRef<HTMLDivElement>(null)
  const [profileMenuOpen, setProfileMenuOpen] = useState(false)
  const [utilityModal, setUtilityModal] = useState<UtilityModal>(null)
  const [logoutToastOpen, setLogoutToastOpen] = useState(false)
  const openTodoCount = todoCounts(buildPlannerTodos(store, '2026-08-05')).all

  useEffect(() => {
    if (!profileMenuOpen) return
    const closeMenu = (event: MouseEvent) => {
      if (!profileMenuRef.current?.contains(event.target as Node)) setProfileMenuOpen(false)
    }
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setProfileMenuOpen(false)
    }
    document.addEventListener('mousedown', closeMenu)
    document.addEventListener('keydown', closeOnEscape)
    return () => {
      document.removeEventListener('mousedown', closeMenu)
      document.removeEventListener('keydown', closeOnEscape)
    }
  }, [profileMenuOpen])

  const openUtility = (modal: Exclude<UtilityModal, null>) => {
    setUtilityModal(modal)
    setProfileMenuOpen(false)
  }

  const openMyPage = () => {
    setProfileMenuOpen(false)
    navigate('/mypage')
  }

  const logout = () => {
    setUtilityModal(null)
    setLogoutToastOpen(true)
    navigate('/')
    window.setTimeout(() => setLogoutToastOpen(false), 2600)
  }

  return (
    <div className="planner-shell planner-shell--topnav">
      <header className="planner-topnav">
        <NavLink to="/" className="brand planner-topnav__brand">VEILY<span>for planners</span></NavLink>
        <nav className="planner-topnav__nav" aria-label="플래너 메뉴">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end} className={({ isActive }) => `planner-topnav__item ${isActive ? 'is-active' : ''}`}>
              <Icon size={18} strokeWidth={1.8} />
              <span>{label}</span>
              {label === '리마인더' && openTodoCount > 0
                ? <em>{openTodoCount}</em>
                : label === '플래너 라운지'
                    ? <em>4</em>
                    : null}
            </NavLink>
          ))}
        </nav>
        <div className="planner-profile planner-topnav__profile" ref={profileMenuRef}>
          <button
            type="button"
            className="planner-topnav__profile-trigger"
            aria-label="계정 메뉴 열기"
            aria-haspopup="menu"
            aria-expanded={profileMenuOpen}
            onClick={() => setProfileMenuOpen((open) => !open)}
          >
            <span className="avatar">YJ</span>
            <span className="planner-topnav__profile-copy">
              <strong>이지윤 플래너</strong>
              <small>VEILY Partner</small>
            </span>
            <ChevronDown className="planner-topnav__profile-chevron" size={15} aria-hidden="true" />
          </button>
          {profileMenuOpen && (
            <div className="planner-profile-menu" role="menu">
              <button type="button" role="menuitem" onClick={openMyPage}><UserRound size={16} /><span>마이페이지</span></button>
              <button type="button" role="menuitem" onClick={() => openUtility('settings')}><Settings size={16} /><span>설정</span></button>
              <button type="button" role="menuitem" className="planner-profile-menu__logout" onClick={() => openUtility('logout')}><LogOut size={16} /><span>로그아웃</span></button>
            </div>
          )}
        </div>
      </header>
      <div className="planner-main">
        <main className="page-content"><Outlet /></main>
      </div>
      <Modal open={utilityModal === 'settings'} onClose={() => setUtilityModal(null)} title="설정" eyebrow="Settings" footer={<Button onClick={() => setUtilityModal(null)}>저장</Button>}>
        <div className="utility-setting-list">
          <label><span><strong>일정 알림</strong><small>예정된 상담과 업체 일정을 알려드립니다.</small></span><input type="checkbox" defaultChecked /></label>
          <label><span><strong>고객 응답 알림</strong><small>추천 업체와 일정에 고객이 응답하면 알려드립니다.</small></span><input type="checkbox" defaultChecked /></label>
          <label><span><strong>정산 알림</strong><small>입금 예정일과 확인이 필요한 계약을 알려드립니다.</small></span><input type="checkbox" defaultChecked /></label>
        </div>
      </Modal>
      <Modal
        open={utilityModal === 'logout'}
        onClose={() => setUtilityModal(null)}
        title="로그아웃하시겠어요?"
        footer={<><Button variant="secondary" onClick={() => setUtilityModal(null)}>취소</Button><Button onClick={logout}>로그아웃</Button></>}
      >
        <p className="utility-logout-copy">현재 플래너 세션을 종료합니다. 저장된 고객과 일정 데이터는 그대로 유지됩니다.</p>
      </Modal>
      <Toast open={logoutToastOpen} title="로그아웃되었습니다" message="데모 환경에서는 홈 화면으로 이동합니다." />
    </div>
  )
}
