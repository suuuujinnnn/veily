import { useState, type ChangeEvent, type FormEvent } from 'react'
import { FileText, Image, Link2, Paperclip, Send, X } from 'lucide-react'
import { Button } from '../ui'
import type { CustomerMessageAttachment } from '../../types'

export function MessageComposer({ onSend, placeholder = '메시지를 입력하세요.' }: { onSend: (text: string, attachments: CustomerMessageAttachment[]) => void; placeholder?: string }) {
  const [text, setText] = useState('')
  const [attachments, setAttachments] = useState<CustomerMessageAttachment[]>([])
  const [linkDraft, setLinkDraft] = useState('')

  const addFiles = (event: ChangeEvent<HTMLInputElement>) => {
    const stamp = Date.now()
    const next = [...(event.target.files ?? [])].map((file, index) => ({ id: `attachment-${stamp}-${index}`, type: file.type.startsWith('image/') ? 'image' as const : 'file' as const, name: file.name, url: URL.createObjectURL(file), size: file.size }))
    setAttachments((current) => [...current, ...next])
    event.target.value = ''
  }
  const addLink = () => {
    const url = linkDraft.trim()
    if (!/^https?:\/\//i.test(url)) return
    setAttachments((current) => [...current, { id: `link-${Date.now()}`, type: 'link', name: new URL(url).hostname, url }])
    setLinkDraft('')
  }
  const submit = (event: FormEvent) => {
    event.preventDefault()
    if (!text.trim() && !attachments.length) return
    onSend(text.trim(), attachments)
    setText('')
    setAttachments([])
  }

  return <form className="customer-chat-composer" onSubmit={submit}>
    {attachments.length > 0 && <div className="customer-chat-pending">{attachments.map((attachment) => <span key={attachment.id}>{attachment.type === 'image' ? <Image size={12} /> : attachment.type === 'link' ? <Link2 size={12} /> : <FileText size={12} />}{attachment.name}<button type="button" onClick={() => setAttachments((current) => current.filter((item) => item.id !== attachment.id))} aria-label="첨부 삭제"><X size={11} /></button></span>)}</div>}
    <textarea rows={3} value={text} onChange={(event) => setText(event.target.value)} placeholder={placeholder} />
    <footer><div><label className="customer-chat-attach"><Paperclip size={15} /><span>이미지·파일</span><input type="file" multiple onChange={addFiles} /></label><div className="customer-chat-link"><Link2 size={14} /><input type="url" value={linkDraft} onChange={(event) => setLinkDraft(event.target.value)} placeholder="URL 첨부" /><button type="button" onClick={addLink}>추가</button></div></div><Button type="submit" icon={<Send size={14} />} disabled={!text.trim() && !attachments.length}>보내기</Button></footer>
  </form>
}
