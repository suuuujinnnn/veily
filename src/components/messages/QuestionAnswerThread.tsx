import { useMemo, useState } from 'react'
import { Check, Circle } from 'lucide-react'
import { Modal } from '../ui'
import { MessageAttachments, MessageText } from './ConversationThread'
import type { CustomerMessage, CustomerMessageAttachment } from '../../types'

const dateLabel = (value: string) => new Intl.DateTimeFormat('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'short' }).format(new Date(value))
const timeLabel = (value: string) => new Intl.DateTimeFormat('ko-KR', { hour: '2-digit', minute: '2-digit' }).format(new Date(value))
type QuestionThread = { question: CustomerMessage; answers: CustomerMessage[] }
type QuestionAnswerThreadProps = { messages: CustomerMessage[]; viewer: 'customer' | 'planner'; canToggleStatus?: boolean; onStatusChange?: (id: string, status: 'unanswered' | 'answered') => void; emptyMessage?: string }

function groupQuestions(messages: CustomerMessage[]) {
  const threads: QuestionThread[] = []
  const sorted = [...messages].sort((a, b) => a.createdAt.localeCompare(b.createdAt))
  sorted.forEach((message) => {
    if (message.sender === 'customer' || !threads.length) {
      threads.push({ question: message, answers: [] })
      return
    }
    threads.at(-1)?.answers.push(message)
  })
  return threads.reverse()
}

export function QuestionAnswerThread({ messages, viewer, canToggleStatus = false, onStatusChange, emptyMessage = '아직 등록된 질문이 없습니다.' }: QuestionAnswerThreadProps) {
  const [preview, setPreview] = useState<CustomerMessageAttachment | null>(null)
  const threads = useMemo(() => groupQuestions(messages), [messages])
  if (!threads.length) return <div className="customer-qa-empty"><strong>질문을 남겨 보세요</strong><p>{emptyMessage}</p></div>

  return <>
    <div className={`customer-qa-list is-${viewer}`}>
      {threads.map(({ question, answers }) => {
        const answered = question.answerStatus ? question.answerStatus === 'answered' : answers.length > 0
        return <article className={`customer-qa-card ${answered ? 'is-answered' : 'is-unanswered'}`} key={question.id}>
          <header>
            <div><span className="customer-qa-category">{question.category}</span><time>{dateLabel(question.createdAt)} · {timeLabel(question.createdAt)}</time></div>
            {canToggleStatus && onStatusChange
              ? <button type="button" className={`customer-qa-status-toggle ${answered ? 'is-answered' : ''}`} aria-pressed={answered} onClick={() => onStatusChange(question.id, answered ? 'unanswered' : 'answered')}><span>{answered ? <Check size={12} /> : <Circle size={12} />}</span>{answered ? '답변 완료' : '미답변'}</button>
              : <span className={`customer-qa-status ${answered ? 'is-answered' : ''}`}>{answered ? '답변 완료' : '미답변'}</span>}
          </header>
          <section className="customer-qa-question">
            <div className="customer-qa-label"><strong>질문</strong><span>{question.sender === 'customer' ? '고객' : '플래너'}</span></div>
            {question.originalText && <MessageText text={question.originalText} />}
            <MessageAttachments attachments={question.attachments} onImageOpen={setPreview} />
          </section>
          <section className="customer-qa-answer">
            <div className="customer-qa-label"><strong>답변</strong><span>{answers.length ? `${answers.length}개` : '대기 중'}</span></div>
            {answers.length ? answers.map((answer) => <div className="customer-qa-answer-item" key={answer.id}>
              <div className="customer-qa-answer-meta"><strong>{answer.sender === 'planner' ? '이지윤 플래너' : '고객'}</strong><time>{timeLabel(answer.createdAt)}</time></div>
              {answer.originalText && <MessageText text={answer.originalText} />}
              <MessageAttachments attachments={answer.attachments} onImageOpen={setPreview} />
            </div>) : <p className="customer-qa-waiting">플래너의 답변을 기다리고 있어요.</p>}
          </section>
        </article>
      })}
    </div>
    <Modal open={Boolean(preview)} onClose={() => setPreview(null)} title={preview?.name ?? '이미지 보기'}>
      {preview && <div className="customer-message-preview"><img src={preview.url} alt={preview.name} /></div>}
    </Modal>
  </>
}