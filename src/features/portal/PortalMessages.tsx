import { useEffect } from 'react'
import { MessageCircleMore } from 'lucide-react'
import { useDemoStore } from '../../app/store'
import { ConversationThread } from '../../components/messages/ConversationThread'
import { MessageComposer } from '../../components/messages/MessageComposer'

export function PortalMessages({ coupleId }: { coupleId: string }) {
  const { customerRequests, sendCustomerMessage, markConversationRead } = useDemoStore()
  const messages = customerRequests.filter((message) => message.coupleId === coupleId).sort((a, b) => a.createdAt.localeCompare(b.createdAt))
  const unread = messages.filter((message) => message.sender === 'planner' && !message.readByCustomerAt).length

  useEffect(() => {
    if (unread) markConversationRead(coupleId, 'customer')
  }, [coupleId, markConversationRead, unread])

  return <section className="portal-subpage portal-messages-page">
    <div className="portal-subpage__intro"><p className="eyebrow">Messages</p><h2>플래너와 메시지</h2><p>문의 내용과 이미지, 링크, 파일을 한 대화에서 이어서 확인할 수 있어요.</p></div>
    <div className="portal-message-workspace">
      <header><div className="portal-message-planner"><span><MessageCircleMore size={18} /></span><div><strong>이지윤 플래너</strong><small>담당 플래너 · 자료와 대화가 이곳에 보관돼요</small></div></div></header>
      <ConversationThread messages={messages} viewer="customer" emptyMessage="플래너에게 궁금한 점이나 참고 자료를 보내 보세요." />
      <MessageComposer placeholder="플래너에게 메시지를 보내세요." onSend={(originalText, attachments) => sendCustomerMessage({ coupleId, category: '기타', originalText, sender: 'customer', attachments })} />
    </div>
  </section>
}
