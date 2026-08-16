import { useEffect, useState } from 'react'
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { Bell, CheckCircle2, LockKeyhole, MessageCircle, X } from 'lucide-react'
import { useDemoStore } from '../../app/store'
import { buildReminders } from '../../features/reminders/reminderUtils'
import { ReminderListItem } from '../reminders/ReminderListItem'

export function PortalLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const [notificationOpen, setNotificationOpen] = useState(false)
  const [kakaoChannelAdded, setKakaoChannelAdded] = useState(false)
  const { couples, events, checklist, recommendations, vendors, favoriteVendorIds, portalSettings, customerRequests } = useDemoStore()
  const coupleId = location.pathname.split('/')[2] ?? couples[0]?.id ?? 'c1'
  const messagingEnabled = portalSettings.find((item) => item.coupleId === coupleId)?.messagingEnabled ?? true
  const unreadMessages = customerRequests.filter((message) => message.coupleId === coupleId && message.sender === 'planner' && !message.readByCustomerAt).length
  const reminders = buildReminders({ couples, events, checklist, recommendations, vendors, favoriteVendorIds }, 'client', '2026-08-05', coupleId)

  useEffect(() => setNotificationOpen(false), [location.pathname])

  return <div className="portal-shell">
    <header className="portal-header">
      <Link className="portal-brand" to={`/client/${coupleId}`}>VEILY <i><LockKeyhole size={11} /> 고객 전용</i></Link>
      <div className="portal-header__right">
        <span>담당 플래너 <strong>이지윤</strong></span>
        <div className="portal-notification-center">
          <button className={`portal-alert-button portal-alert-button--kakao ${kakaoChannelAdded ? 'is-connected' : ''}`} aria-label={`카카오톡 준비 알림 ${reminders.length}건`} aria-expanded={notificationOpen} onClick={() => setNotificationOpen((open) => !open)}>
            <MessageCircle size={15} fill="currentColor" /><span>카카오톡 알림</span>{kakaoChannelAdded && reminders.length > 0 && <em>{reminders.length}</em>}
          </button>
          {notificationOpen && <aside className="portal-notification-panel">
            <header><div><p>KAKAO CHANNEL</p><h2>카카오톡 준비 알림</h2></div><button aria-label="알림 닫기" onClick={() => setNotificationOpen(false)}><X size={15} /></button></header>
            {!kakaoChannelAdded ? <div className="portal-kakao-connect"><span><Bell size={20} /></span><strong>베일리 카카오톡 채널을 추가해 주세요</strong><p>일정, 준비 마감과 업체 선택 알림을 카카오톡 채널 메시지로 받아볼 수 있어요.</p><button onClick={() => setKakaoChannelAdded(true)}><MessageCircle size={15} fill="currentColor" /> 카카오톡 채널 추가</button><small>목업 화면으로 실제 카카오톡에는 연결되지 않습니다.</small></div> : <><div className="portal-kakao-connected"><CheckCircle2 size={16} /><span>채널 추가 완료 · 아래 준비 알림을 카카오톡으로 발송합니다.</span></div><div>{reminders.length ? reminders.map((reminder) => <ReminderListItem key={reminder.id} reminder={reminder} compact />) : <p className="portal-notification-panel__empty">새로운 준비 알림이 없습니다.</p>}</div></>}
          </aside>}
        </div>
        {messagingEnabled && <button className="portal-help portal-request-button" onClick={() => navigate(`/portal/${coupleId}/messages`)}><MessageCircle size={16} /> 메시지{unreadMessages > 0 && <em>{unreadMessages}</em>}</button>}
      </div>
    </header>
    <main><Outlet /></main>
    <footer className="portal-footer"><span>VEILY</span><p>공유된 일정과 준비 현황을 안전하게 확인하세요.</p></footer>
  </div>
}
