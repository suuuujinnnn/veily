import { useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import {
  Bell,
  CalendarDays,
  ClipboardList,
  ChevronRight,
  HeartHandshake,
  Inbox,
  LayoutDashboard,
  MessageCircleMore,
  PackageCheck,
  Search,
  Settings,
  UserRound,
  UsersRound,
} from 'lucide-react'
import { useDemoStore } from '../../app/store'
import { Button, Modal } from '../ui'
import { WorkflowGuidePanel } from '../../features/checklist/WorkflowGuidePanel'
import { ReminderListItem } from '../reminders/ReminderListItem'
import { buildReminders } from '../../features/reminders/reminderUtils'

const navItems = [
  { to: '/', label: '홈', icon: LayoutDashboard, end: true },
  { to: '/couples', label: '커플 관리', icon: UsersRound },
  { to: '/calendar', label: '일정', icon: CalendarDays },
  { to: '/vendors', label: '레퍼런스 보드', icon: Search },
  { to: '/orders', label: '발주 관리', icon: PackageCheck },
  { to: '/community', label: '플래너 라운지', icon: MessageCircleMore },
]

const pageTitles: Record<string, string> = {
  '/': '홈', '/couples': '커플 관리', '/calendar': '일정', '/vendors': '레퍼런스 보드', '/orders': '발주 관리', '/community': '플래너 라운지',
}

export function PlannerLayout() {
  const location = useLocation()
  const store = useDemoStore()
  const { couples, checklist, addChecklist, events, recommendations, orderApprovals, vendors, favoriteVendorIds, customerRequests, setCustomerRequestStatus } = store
  const reminders = buildReminders({ couples, events, checklist, recommendations, orderApprovals, vendors, favoriteVendorIds }, 'planner')
  const currentCoupleId = location.pathname.match(/^\/couples\/([^/]+)/)?.[1]
  const [profileMenuOpen, setProfileMenuOpen] = useState(false)
  const [utilityModal, setUtilityModal] = useState<'profile' | 'notifications' | 'guide' | null>(null)
  const [notificationOpen, setNotificationOpen] = useState(false)
  const [inboxOpen, setInboxOpen] = useState(false)
  const [guideCoupleId, setGuideCoupleId] = useState(currentCoupleId ?? couples[0]?.id ?? '')
  const guideCouple = couples.find((couple) => couple.id === guideCoupleId) ?? couples[0]
  const title = location.pathname.startsWith('/couples/') ? '커플 상세' : pageTitles[location.pathname] ?? 'VEILY'
  const unreadRequests = customerRequests.filter((request) => request.status === 'requested')
  const requestStatusLabel = { requested: '새 요청', confirmed: '확인', 'in-progress': '처리 중', completed: '완료' } as const
  const openUtility = (modal: 'profile' | 'notifications' | 'guide') => {
    if (modal === 'guide' && currentCoupleId && couples.some((couple) => couple.id === currentCoupleId)) setGuideCoupleId(currentCoupleId)
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
          <button className="icon-button" aria-label="프로필 메뉴" aria-expanded={profileMenuOpen} onClick={() => setProfileMenuOpen((open) => !open)}>•••</button>
          {profileMenuOpen && <div className="planner-profile-menu" role="menu">
            <button role="menuitem" onClick={() => openUtility('profile')}><UserRound size={16} /><span>마이페이지</span></button>
            <button role="menuitem" onClick={() => openUtility('notifications')}><Settings size={16} /><span>알림 설정</span></button>
            <button role="menuitem" onClick={() => openUtility('guide')}><ClipboardList size={16} /><span>표준 업무 가이드</span></button>
          </div>}
        </div>
      </aside>
      <div className="planner-main">
        <header className="topbar">
          <div className="topbar__title"><span>{title}</span></div>
          <div className="topbar__actions">
            <label className="global-search"><Search size={16} /><input aria-label="전체 검색" placeholder="커플, 업체, 일정 검색" /></label>
            <button className="icon-button notification inbox-trigger" aria-label={`고객 메시지 ${unreadRequests.length}건`} aria-expanded={inboxOpen} onClick={() => { setInboxOpen((open) => !open); setNotificationOpen(false) }}><Inbox size={18} />{unreadRequests.length > 0 && <em>{unreadRequests.length}</em>}</button>
            {inboxOpen && <aside className="message-inbox-panel"><header><div><p className="eyebrow">Customer inbox</p><h2>고객 메시지</h2></div><BadgeCount count={unreadRequests.length} /></header><div className="message-inbox-list">{customerRequests.map((request) => { const sender = couples.find((couple) => couple.id === request.coupleId); return <article className={request.status === 'requested' ? 'unread' : ''} key={request.id}><div className={`message-sender message-sender--${sender?.tone ?? 'sand'}`}>{sender?.initials ?? '—'}</div><div><div><strong>{sender?.partners ?? '고객'}</strong><span>{request.createdAt.slice(5, 10).replace('-', '.')} · {request.createdAt.slice(11, 16)}</span></div><BadgeCount count={requestStatusLabel[request.status]} /><p>{request.originalText}</p><footer><Link to={`/couples/${request.coupleId}`} onClick={() => setInboxOpen(false)}>커플 보기</Link>{request.status === 'requested' && <button onClick={() => setCustomerRequestStatus(request.id, 'confirmed')}>확인 처리</button>}</footer></div></article> })}</div></aside>}
            <button className="icon-button notification" aria-label={`알림 ${reminders.length}건`} aria-expanded={notificationOpen} onClick={() => { setNotificationOpen((open) => !open); setInboxOpen(false) }}><Bell size={18} />{reminders.length > 0 && <em>{reminders.length}</em>}</button>
            {notificationOpen && <aside className="notification-panel"><header><div><p className="eyebrow">Notifications</p><h2>처리할 알림</h2></div><BadgeCount count={reminders.length} /></header><div>{reminders.length ? reminders.slice(0, 7).map((reminder) => <div key={reminder.id} onClick={() => setNotificationOpen(false)}><ReminderListItem reminder={reminder} compact /></div>) : <p className="notification-panel__empty">새로운 알림이 없습니다.</p>}</div><button onClick={() => { setNotificationOpen(false); setUtilityModal('notifications') }}>알림 설정</button></aside>}
          </div>
        </header>
        <main className="page-content"><Outlet /></main>
      </div>
      <Modal open={utilityModal === 'profile'} onClose={() => setUtilityModal(null)} title="마이페이지" eyebrow="Planner profile" footer={<Button onClick={() => setUtilityModal(null)}>확인</Button>}>
        <div className="utility-modal-content"><span className="avatar utility-modal-avatar">YJ</span><div><strong>이지윤 플래너</strong><p>VEILY Partner · 인증 플래너</p><small>프로필과 계정 정보 관리 기능은 데모 범위에서 준비 중입니다.</small></div></div>
      </Modal>
      <Modal open={utilityModal === 'notifications'} onClose={() => setUtilityModal(null)} title="알림 설정" eyebrow="Notifications" footer={<Button onClick={() => setUtilityModal(null)}>확인</Button>}>
        <div className="utility-setting-list"><label><span><strong>일정 알림</strong><small>예정된 상담과 업체 일정을 알려드립니다.</small></span><input type="checkbox" defaultChecked /></label><label><span><strong>고객 응답 알림</strong><small>추천 업체와 일정에 고객이 응답하면 알려드립니다.</small></span><input type="checkbox" defaultChecked /></label><label><span><strong>정산 알림</strong><small>입금 예정일과 확인이 필요한 계약을 알려드립니다.</small></span><input type="checkbox" defaultChecked /></label></div>
      </Modal>
      <Modal open={utilityModal === 'guide'} onClose={() => setUtilityModal(null)} title="표준 업무 가이드" eyebrow="Korean wedding workflow" footer={<Button variant="secondary" onClick={() => setUtilityModal(null)}>닫기</Button>}>
        {guideCouple && <div className="workflow-guide-modal-body"><label className="workflow-guide-couple"><span>적용할 커플</span><select value={guideCouple.id} onChange={(event) => setGuideCoupleId(event.target.value)}>{couples.map((couple) => <option key={couple.id} value={couple.id}>{couple.partners} · {couple.weddingDate}</option>)}</select></label><WorkflowGuidePanel coupleId={guideCouple.id} weddingDate={guideCouple.weddingDate} tasks={checklist.filter((task) => task.coupleId === guideCouple.id)} onAdd={addChecklist} hideHeading /></div>}
      </Modal>
    </div>
  )
}

function BadgeCount({ count }: { count: number | string }) {
  return <span className="notification-count">{count}{typeof count === 'number' ? '건' : ''}</span>
}
