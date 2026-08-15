import { type FormEvent, useEffect, useState } from 'react'
import { Link, Outlet, useLocation } from 'react-router-dom'
import { Bell, CheckCircle2, FileText, LockKeyhole, MessageCircle, Paperclip, X } from 'lucide-react'
import { useDemoStore } from '../../app/store'
import { buildReminders } from '../../features/reminders/reminderUtils'
import { ReminderListItem } from '../reminders/ReminderListItem'
import { Button, Modal } from '../ui'
import type { CustomerMessageAttachment, CustomerRequest } from '../../types'

export function PortalLayout() {
  const location = useLocation()
  const [notificationOpen, setNotificationOpen] = useState(false)
  const [kakaoChannelAdded, setKakaoChannelAdded] = useState(false)
  const [requestOpen, setRequestOpen] = useState(false)
  const [requestDraft, setRequestDraft] = useState<{ category: CustomerRequest['category']; originalText: string }>({ category: '기타', originalText: '' })
  const [requestAttachments, setRequestAttachments] = useState<CustomerMessageAttachment[]>([])
  const [requestSent, setRequestSent] = useState(false)
  const { couples, events, checklist, recommendations, vendors, favoriteVendorIds, portalSettings, addCustomerRequest } = useDemoStore()
  const coupleId = location.pathname.split('/')[2] ?? couples[0]?.id ?? 'c1'
  const requestEnabled = portalSettings.find((item) => item.coupleId === coupleId)?.receiveRequests ?? true
  const reminders = buildReminders({ couples, events, checklist, recommendations, vendors, favoriteVendorIds }, 'client', '2026-08-05', coupleId)
  const submitRequest = (event: FormEvent) => {
    event.preventDefault()
    const originalText = requestDraft.originalText.trim()
    if (!originalText && !requestAttachments.length) return
    addCustomerRequest({ coupleId, category: requestDraft.category, originalText, sender: 'customer', attachments: requestAttachments })
    setRequestDraft({ category: '기타', originalText: '' })
    setRequestAttachments([])
    setRequestOpen(false)
    setRequestSent(true)
    window.setTimeout(() => setRequestSent(false), 2200)
  }

  useEffect(() => setNotificationOpen(false), [location.pathname])

  return <div className="portal-shell">
    <header className="portal-header">
      <Link className="portal-brand" to={`/client/${coupleId}`}>VEILY <i><LockKeyhole size={11} /> 고객 전용</i></Link>
      <div className="portal-header__right">
        <span>담당 플래너 <strong>이지윤</strong></span>
        <div className="portal-notification-center">
          <button className={`portal-alert-button portal-alert-button--kakao ${kakaoChannelAdded ? 'is-connected' : ''}`} aria-label={`카카오톡 준비 알림 ${reminders.length}건`} aria-expanded={notificationOpen} onClick={() => setNotificationOpen((open) => !open)}><MessageCircle size={15} fill="currentColor" /><span>카카오톡 알림</span>{kakaoChannelAdded && reminders.length > 0 && <em>{reminders.length}</em>}</button>
          {notificationOpen && <aside className="portal-notification-panel">
            <header><div><p>KAKAO CHANNEL</p><h2>카카오톡 준비 알림</h2></div><button aria-label="알림 닫기" onClick={() => setNotificationOpen(false)}><X size={15} /></button></header>
            {!kakaoChannelAdded ? <div className="portal-kakao-connect"><span><Bell size={20} /></span><strong>베일리 카카오톡 채널을 추가해 주세요</strong><p>일정, 준비 마감과 업체 선택 알림을 카카오톡 채널 메시지로 받아볼 수 있어요.</p><button onClick={() => setKakaoChannelAdded(true)}><MessageCircle size={15} fill="currentColor" /> 카카오톡 채널 추가</button><small>목업 화면으로 실제 카카오톡에는 연결되지 않습니다.</small></div> : <><div className="portal-kakao-connected"><CheckCircle2 size={16} /><span>채널 추가 완료 · 아래 준비 알림을 카카오톡으로 발송합니다.</span></div><div>{reminders.length ? reminders.map((reminder) => <ReminderListItem key={reminder.id} reminder={reminder} compact />) : <p className="portal-notification-panel__empty">새로운 준비 알림이 없습니다.</p>}</div></>}
          </aside>}
        </div>
        {requestEnabled && <button className="portal-help portal-request-button" onClick={() => setRequestOpen(true)}><MessageCircle size={16} /> 메시지 보내기</button>}
      </div>
    </header>
    <main><Outlet /></main>
    <footer className="portal-footer"><span>VEILY</span><p>공유된 일정과 준비 현황을 안전하게 확인하세요.</p></footer>
    <Modal open={requestOpen} onClose={() => setRequestOpen(false)} eyebrow="Customer message" title="플래너에게 메시지 보내기" footer={<><Button variant="ghost" onClick={() => setRequestOpen(false)}>취소</Button><Button type="submit" form="portal-request-form" disabled={!requestDraft.originalText.trim() && !requestAttachments.length}>메시지 보내기</Button></>}>
      <form id="portal-request-form" className="portal-request-form" onSubmit={submitRequest}><p>보낸 메시지와 첨부 자료는 플래너와의 대화에 계속 보관됩니다. URL은 메시지에 그대로 붙여 넣어도 됩니다.</p><label><span>메시지 유형</span><select value={requestDraft.category} onChange={(event) => setRequestDraft({ ...requestDraft, category: event.target.value as CustomerRequest['category'] })}><option>레퍼런스</option><option>업체 문의</option><option>일정</option><option>계약·견적</option><option>기타</option></select></label><label><span>메시지</span><textarea autoFocus rows={5} value={requestDraft.originalText} onChange={(event) => setRequestDraft({ ...requestDraft, originalText: event.target.value })} placeholder="플래너에게 전달할 내용이나 URL을 입력하세요." /></label><label className="portal-message-attachment"><span><Paperclip size={14} /> 이미지·파일 첨부</span><input type="file" multiple onChange={(event) => { const next = [...(event.target.files ?? [])].map((file) => ({ id: `portal-attachment-${Date.now()}-${file.name}`, type: file.type.startsWith('image/') ? 'image' as const : 'file' as const, name: file.name, url: URL.createObjectURL(file), size: file.size })); setRequestAttachments((current) => [...current, ...next]); event.target.value = '' }} /></label>{requestAttachments.length > 0 && <div className="portal-message-files">{requestAttachments.map((attachment) => <span key={attachment.id}><FileText size={12} />{attachment.name}<button type="button" onClick={() => setRequestAttachments((current) => current.filter((item) => item.id !== attachment.id))}><X size={11} /></button></span>)}</div>}</form>
    </Modal>
    {requestSent && <div className="portal-toast"><CheckCircle2 size={17} /><div><strong>메시지를 보냈어요</strong><span>플래너와의 대화에 안전하게 저장되었습니다.</span></div></div>}
  </div>
}
