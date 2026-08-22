import { useState } from 'react'
import { Link } from 'react-router-dom'
import { NavLink, Outlet } from 'react-router-dom'
import {
  Bell,
  CalendarDays,
  ClipboardCheck,
  LayoutDashboard,
  MessageCircleMore,
  Search,
  Settings,
  UserRound,
  UsersRound,
} from 'lucide-react'
import { DEMO_TODAY, useDemoStore } from '../../app/store'
import { buildPlannerNotifications } from '../../features/reminders/notificationUtils'
import { Button, Modal } from '../ui'

const navItems = [
  { to: '/', label: '홈', icon: LayoutDashboard, end: true },
  { to: '/couples', label: '커플 관리', icon: UsersRound },
  { to: '/requests', label: '고객 메시지', icon: ClipboardCheck },
  { to: '/calendar', label: '일정', icon: CalendarDays },
  { to: '/vendors', label: '레퍼런스 · 업체 찾기', icon: Search },
  { to: '/community', label: '플래너 라운지', icon: MessageCircleMore },
]

export function PlannerLayout() {
  const { couples, customerRequests, orderReminders, checklist, customerReferenceSubmissions, events, vendors } = useDemoStore()
  const [profileMenuOpen, setProfileMenuOpen] = useState(false)
  const [notificationOpen, setNotificationOpen] = useState(false)
  const [utilityModal, setUtilityModal] = useState<'profile' | 'notifications' | null>(null)
  const unreadRequests = customerRequests.filter((message) => message.sender === 'customer' && !message.readByPlannerAt)
  const notifications = buildPlannerNotifications({ couples, customerRequests, orderReminders, checklist, customerReferenceSubmissions, events, vendors }, DEMO_TODAY)
  const openUtility = (modal: 'profile' | 'notifications') => {
    setUtilityModal(modal)
    setProfileMenuOpen(false)
  }
  return (
    <div className="planner-shell">
      <aside className="sidebar">
        <div className="brand-row"><NavLink to="/" className="brand">VEILY<span>for planners</span></NavLink></div>
        <nav className="sidebar__nav" aria-label="플래너 메뉴">
          <p className="nav-label">Workspace</p>
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end} className={({ isActive }) => `nav-item ${isActive ? 'nav-item--active' : ''}`}>
              <Icon size={18} strokeWidth={1.8} /><span>{label}</span>{label === '고객 메시지' && unreadRequests.length > 0 ? <em>{unreadRequests.length}</em> : label === '플래너 라운지' ? <em>4</em> : null}
            </NavLink>
          ))}
        </nav>
        <div className="planner-profile">
          <span className="avatar">YJ</span>
          <div><strong>이지윤 플래너</strong><small>VEILY Partner</small></div>
          <button className="icon-button" aria-label="프로필 메뉴" aria-expanded={profileMenuOpen} onClick={() => setProfileMenuOpen((open) => !open)}>•••</button>
          {profileMenuOpen && <div className="planner-profile-menu" role="menu">
            <button role="menuitem" onClick={() => openUtility('profile')}><UserRound size={16} /><span>마이페이지</span></button>
            <button role="menuitem" onClick={() => openUtility('notifications')}><Settings size={16} /><span>알림 설정</span></button>
          </div>}
        </div>
      </aside>
      <div className="planner-main">
        <header className="planner-topbar"><div><span className="eyebrow">Planner workspace</span><strong>오늘의 준비 흐름</strong></div><div className="planner-topbar__actions"><button className="planner-notification-button" aria-label={`알림 ${notifications.length}건`} onClick={() => setNotificationOpen((open) => !open)}><Bell size={17} /><span>알림</span>{notifications.length > 0 && <em>{notifications.length}</em>}</button>{notificationOpen && <div className="planner-notification-panel"><header><div><p className="eyebrow">Notifications</p><h2>통합 알림</h2></div><span>{notifications.length}건</span></header>{notifications.length ? notifications.map((notification) => <Link to={notification.href} className={`planner-notification-item is-${notification.urgency}`} key={notification.id}><strong>{notification.title}</strong><p>{notification.message}</p><small>{notification.actionLabel}</small></Link>) : <p className="planner-notification-empty">새로운 알림이 없습니다.</p>}<Link className="planner-notification-add" to="/?openOrderReminder=1">+ 발주·확인 알림 추가</Link></div>}</div></header>
        <main className="page-content"><Outlet /></main>
      </div>
      <Modal open={utilityModal === 'profile'} onClose={() => setUtilityModal(null)} title="마이페이지" eyebrow="Planner profile" footer={<Button onClick={() => setUtilityModal(null)}>확인</Button>}>
        <div className="utility-modal-content"><span className="avatar utility-modal-avatar">YJ</span><div><strong>이지윤 플래너</strong><p>VEILY Partner · 인증 플래너</p><small>프로필과 계정 정보 관리 기능은 데모 범위에서 준비 중입니다.</small></div></div>
      </Modal>
      <Modal open={utilityModal === 'notifications'} onClose={() => setUtilityModal(null)} title="알림 설정" eyebrow="Notifications" footer={<Button onClick={() => setUtilityModal(null)}>확인</Button>}>
        <div className="utility-setting-list"><label><span><strong>일정 알림</strong><small>예정된 상담과 업체 일정을 알려드립니다.</small></span><input type="checkbox" defaultChecked /></label><label><span><strong>고객 응답 알림</strong><small>추천 업체와 일정에 고객이 응답하면 알려드립니다.</small></span><input type="checkbox" defaultChecked /></label><label><span><strong>정산 알림</strong><small>입금 예정일과 확인이 필요한 계약을 알려드립니다.</small></span><input type="checkbox" defaultChecked /></label></div>
      </Modal>
    </div>
  )
}
