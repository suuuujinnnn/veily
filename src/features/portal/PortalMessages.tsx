import { useEffect } from 'react'
import { MessageCircleMore } from 'lucide-react'
import { useDemoStore } from '../../app/store'
import { QuestionAnswerThread } from '../../components/messages/QuestionAnswerThread'
import { MessageComposer } from '../../components/messages/MessageComposer'

export function PortalMessages({ coupleId }: { coupleId: string }) {
  const { customerRequests, sendCustomerMessage, markConversationRead } = useDemoStore()
  const messages = customerRequests.filter((message) => message.coupleId === coupleId).sort((a, b) => a.createdAt.localeCompare(b.createdAt))
  const unread = messages.filter((message) => message.sender === 'planner' && !message.readByCustomerAt).length

  useEffect(() => {
    if (unread) markConversationRead(coupleId, 'customer')
  }, [coupleId, markConversationRead, unread])

  return <section className="portal-subpage portal-messages-page">
    <div className="portal-subpage__intro"><p className="eyebrow">Messages</p><h2>플래너와 메시지</h2><p>질문과 답변을 한눈에 확인하고, 필요한 자료를 채팅처럼 보내 보세요.</p></div>
    <div className="portal-message-workspace">
      <header><div className="portal-message-planner"><span><MessageCircleMore size={18} /></span><div><strong>이지윤 플래너</strong><small>담당 플래너 · 질문별 답변 상태를 확인할 수 있어요</small></div></div></header>
      <QuestionAnswerThread messages={messages} viewer="customer" emptyMessage="플래너에게 궁금한 점이나 참고 자료를 보내 보세요." />
      <MessageComposer placeholder="새 질문이나 추가 내용을 입력하세요." onSend={(originalText, attachments) => sendCustomerMessage({ coupleId, category: '기타', originalText, sender: 'customer', attachments })} />
    </div>
  </section>
}
