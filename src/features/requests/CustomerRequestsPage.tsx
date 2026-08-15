import { useEffect, useMemo, useState } from 'react'
import { ExternalLink, MessageCircleMore, Paperclip, Search } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useDemoStore } from '../../app/store'
import { ConversationThread } from '../../components/messages/ConversationThread'
import { MessageComposer } from '../../components/messages/MessageComposer'
import { Badge } from '../../components/ui'

const timeLabel = (value: string) => new Intl.DateTimeFormat('ko-KR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(value))

export function CustomerRequestsPage() {
  const { couples, customerRequests, sendCustomerMessage, markConversationRead } = useDemoStore()
  const [activeCoupleId, setActiveCoupleId] = useState(customerRequests[0]?.coupleId ?? couples[0]?.id ?? '')
  const [query, setQuery] = useState('')

  const conversations = useMemo(() => couples.map((couple) => {
    const messages = customerRequests.filter((message) => message.coupleId === couple.id).sort((a, b) => a.createdAt.localeCompare(b.createdAt))
    const last = messages.at(-1)
    const unread = messages.filter((message) => message.sender === 'customer' && !message.readByPlannerAt).length
    return { couple, messages, last, unread }
  }).filter((conversation) => conversation.last)
    .filter((conversation) => !query.trim() || `${conversation.couple.partners} ${conversation.last?.originalText}`.toLocaleLowerCase('ko').includes(query.trim().toLocaleLowerCase('ko')))
    .sort((a, b) => (b.last?.createdAt ?? '').localeCompare(a.last?.createdAt ?? '')), [couples, customerRequests, query])
  const activeConversation = conversations.find((conversation) => conversation.couple.id === activeCoupleId)
    ?? couples.map((couple) => ({ couple, messages: customerRequests.filter((message) => message.coupleId === couple.id).sort((a, b) => a.createdAt.localeCompare(b.createdAt)) })).find((conversation) => conversation.couple.id === activeCoupleId)
  const activeUnread = customerRequests.filter((message) => message.coupleId === activeCoupleId && message.sender === 'customer' && !message.readByPlannerAt).length
  const totalUnread = customerRequests.filter((message) => message.sender === 'customer' && !message.readByPlannerAt).length

  useEffect(() => {
    if (activeCoupleId && activeUnread) markConversationRead(activeCoupleId, 'planner')
  }, [activeCoupleId, activeUnread, markConversationRead])

  return <div className="page-stack customer-messenger-page">
    <section className="page-intro"><div><p className="eyebrow">Customer messages</p><h1>고객 메시지</h1><p>고객과 주고받은 메시지, 이미지, 링크, 파일을 커플별로 확인합니다.</p></div><Badge tone={totalUnread ? 'rose' : 'neutral'}>읽지 않음 {totalUnread}</Badge></section>
    <section className="customer-messenger">
      <aside className="customer-conversation-list">
        <header><div><strong>대화</strong><span>{conversations.length}커플</span></div><label><Search size={15} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="고객 또는 메시지 검색" /></label></header>
        <div>{conversations.map(({ couple, last, unread }) => <button className={activeCoupleId === couple.id ? 'active' : ''} onClick={() => setActiveCoupleId(couple.id)} key={couple.id}><span className="customer-request-avatar">{couple.initials}</span><div><div><strong>{couple.partners}</strong><time>{last && timeLabel(last.createdAt)}</time></div><p>{last?.attachments.length ? <Paperclip size={11} /> : null}{last?.originalText || `첨부 파일 ${last?.attachments.length ?? 0}개`}</p></div>{unread > 0 && <em>{unread}</em>}</button>)}</div>
      </aside>
      <section className="customer-chat-panel">
        {activeConversation ? <>
          <header><div><span className="customer-request-avatar">{activeConversation.couple.initials}</span><div><strong>{activeConversation.couple.partners}</strong><small>{activeConversation.messages.length}개의 메시지 · 파일과 링크 보관 중</small></div></div><Link to={`/couples/${activeConversation.couple.id}?tab=info`}>고객 상세 <ExternalLink size={13} /></Link></header>
          <ConversationThread messages={activeConversation.messages} viewer="planner" />
          <MessageComposer placeholder={`${activeConversation.couple.brideName} 고객에게 메시지 보내기`} onSend={(originalText, attachments) => sendCustomerMessage({ coupleId: activeConversation.couple.id, category: '기타', originalText, sender: 'planner', attachments })} />
        </> : <div className="customer-chat-empty"><MessageCircleMore size={28} /><strong>대화를 선택하세요</strong><p>고객과 주고받은 메시지가 여기에 표시됩니다.</p></div>}
      </section>
    </section>
  </div>
}
