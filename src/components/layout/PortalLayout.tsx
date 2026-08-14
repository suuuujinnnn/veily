import { useEffect, useState } from 'react'
import { Link, Outlet, useLocation } from 'react-router-dom'
import { Bell, Headphones, LockKeyhole, X } from 'lucide-react'
import { useDemoStore } from '../../app/store'
import { buildReminders } from '../../features/reminders/reminderUtils'
import { ReminderListItem } from '../reminders/ReminderListItem'

export function PortalLayout() {
  const location = useLocation()
  const [notificationOpen, setNotificationOpen] = useState(false)
  const { couples, events, checklist, recommendations, orderApprovals, vendors, favoriteVendorIds } = useDemoStore()
  const coupleId = location.pathname.split('/')[2] ?? couples[0]?.id ?? 'c1'
  const reminders = buildReminders({ couples, events, checklist, recommendations, orderApprovals, vendors, favoriteVendorIds }, 'client', '2026-08-05', coupleId)

  useEffect(() => setNotificationOpen(false), [location.pathname])

  return (
    <div className="portal-shell">
      <header className="portal-header">
        <Link className="portal-brand" to={`/client/${coupleId}`}>VEILY <i><LockKeyhole size={11} /> 고객 전용</i></Link>
        <div className="portal-header__right">
          <span>담당 플래너 <strong>이지윤</strong></span>
          <div className="portal-notification-center">
            <button className="portal-alert-button" aria-label={`준비 알림 ${reminders.length}건`} aria-expanded={notificationOpen} onClick={() => setNotificationOpen((open) => !open)}>
              <Bell size={15} /><span>준비 알림</span>{reminders.length > 0 && <em>{reminders.length}</em>}
            </button>
            {notificationOpen && <aside className="portal-notification-panel">
              <header><div><p>NOTIFICATIONS</p><h2>준비 알림</h2></div><button aria-label="알림 닫기" onClick={() => setNotificationOpen(false)}><X size={15} /></button></header>
              <div>{reminders.length ? reminders.map((reminder) => <ReminderListItem key={reminder.id} reminder={reminder} compact />) : <p className="portal-notification-panel__empty">새로운 준비 알림이 없습니다.</p>}</div>
            </aside>}
          </div>
          <button className="portal-help"><Headphones size={16} /> 문의하기</button>
        </div>
      </header>
      <main><Outlet /></main>
      <footer className="portal-footer"><span>VEILY</span><p>공유된 일정과 준비 현황을 안전하게 확인하세요.</p></footer>
    </div>
  )
}
