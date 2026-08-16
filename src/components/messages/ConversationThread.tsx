import { useState, type ReactNode } from 'react'
import { ExternalLink, FileText, Image, Link2 } from 'lucide-react'
import { Modal } from '../ui'
import type { CustomerMessage, CustomerMessageAttachment } from '../../types'

const dateKey = (value: string) => value.slice(0, 10)
const dateLabel = (value: string) => new Intl.DateTimeFormat('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'short' }).format(new Date(value))
const timeLabel = (value: string) => new Intl.DateTimeFormat('ko-KR', { hour: '2-digit', minute: '2-digit' }).format(new Date(value))
const fileSize = (size?: number) => size ? `${Math.max(1, Math.round(size / 1024))}KB` : '첨부 파일'

function MessageText({ text }: { text: string }) {
  const parts = text.split(/(https?:\/\/[^\s]+)/g)
  return <p>{parts.map((part, index): ReactNode => part.startsWith('http')
    ? <a href={part} target="_blank" rel="noreferrer" key={`${part}-${index}`}>{part}<ExternalLink size={11} /></a>
    : part)}</p>
}

function MessageAttachments({ attachments, onImageOpen }: { attachments: CustomerMessageAttachment[]; onImageOpen: (attachment: CustomerMessageAttachment) => void }) {
  if (!attachments.length) return null
  return <div className="customer-message-attachments">{attachments.map((attachment) => attachment.type === 'image'
    ? <button type="button" className="customer-message-image" onClick={() => onImageOpen(attachment)} key={attachment.id}><img src={attachment.url} alt={attachment.name} /><span><Image size={12} />{attachment.name}</span></button>
    : <a className="customer-message-file" href={attachment.url} target="_blank" rel="noreferrer" download={attachment.type === 'file' ? attachment.name : undefined} key={attachment.id}>{attachment.type === 'link' ? <Link2 size={16} /> : <FileText size={16} />}<span><strong>{attachment.name}</strong><small>{attachment.type === 'link' ? attachment.url : fileSize(attachment.size)}</small></span><ExternalLink size={13} /></a>)}</div>
}

export function ConversationThread({ messages, viewer, emptyMessage = '아직 주고받은 메시지가 없습니다.' }: { messages: CustomerMessage[]; viewer: 'customer' | 'planner'; emptyMessage?: string }) {
  const [preview, setPreview] = useState<CustomerMessageAttachment | null>(null)
  if (!messages.length) return <div className="customer-chat-empty"><strong>대화를 시작해 보세요</strong><p>{emptyMessage}</p></div>

  return <>
    <div className="customer-chat-history">{messages.map((message, index) => {
      const mine = message.sender === viewer
      const previous = messages[index - 1]
      const showDate = !previous || dateKey(previous.createdAt) !== dateKey(message.createdAt)
      const readAt = viewer === 'planner' ? message.readByCustomerAt : message.readByPlannerAt
      return <div className="customer-chat-entry" key={message.id}>
        {showDate && <div className="customer-chat-date"><span>{dateLabel(message.createdAt)}</span></div>}
        <article className={mine ? 'is-planner' : 'is-customer'}>
          <div className="customer-chat-bubble">
            <div><strong>{message.sender === 'planner' ? '이지윤 플래너' : '고객'}</strong><time>{timeLabel(message.createdAt)}</time></div>
            {message.originalText && <MessageText text={message.originalText} />}
            <MessageAttachments attachments={message.attachments} onImageOpen={setPreview} />
            {mine && <small className="customer-chat-read-state">{readAt ? '읽음' : '전송됨'}</small>}
          </div>
        </article>
      </div>
    })}</div>
    <Modal open={Boolean(preview)} onClose={() => setPreview(null)} title={preview?.name ?? '이미지 보기'}>
      {preview && <div className="customer-message-preview"><img src={preview.url} alt={preview.name} /></div>}
    </Modal>
  </>
}
