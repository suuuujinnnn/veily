import { useState } from 'react'
import { CalendarDays, Check, ChevronRight, Clock3, MapPin } from 'lucide-react'
import { Badge, Card } from '../../../components/ui'
import type { ChecklistItem, Couple, WeddingEvent } from '../../../types'

export function CoupleOverviewTab({
  couple,
  coupleEvents,
  coupleTasks,
  onOpenTab,
  onToggleChecklist,
}: {
  couple: Couple
  coupleEvents: WeddingEvent[]
  coupleTasks: ChecklistItem[]
  onOpenTab: (tab: 'timeline' | 'calendar') => void
  onToggleChecklist: (id: string) => void
}) {
  const [coupleInfoOpen, setCoupleInfoOpen] = useState(false)
  const [info, setInfo] = useState({
    bridePhone: couple.bridePhone ?? '',
    groomPhone: couple.groomPhone ?? '',
    brideEmail: couple.brideEmail ?? '',
    groomEmail: couple.groomEmail ?? '',
    address: couple.address ?? '',
    contractType: couple.contractType ?? '플래너 계약',
    contractDate: couple.contractDate ?? '',
    ceremonyTime: couple.ceremonyTime ?? '',
    note: couple.note ?? '',
  })
  const labels: Record<string, string> = {
    bridePhone: '신부 휴대폰',
    groomPhone: '신랑 휴대폰',
    brideEmail: '신부 이메일',
    groomEmail: '신랑 이메일',
    address: '주소',
    contractType: '계약 진행 구분',
    contractDate: '계약일자',
    ceremonyTime: '본식 일시',
    note: '비고',
  }

  return (
    <div className="detail-overview">
      <section className="detail-column detail-column--wide">
        <div className="section-heading section-heading--compact">
          <div><p className="eyebrow">다가오는 일정</p><h2>다가오는 일정</h2></div>
          <button onClick={() => onOpenTab('calendar')}>전체 보기 <ChevronRight size={14} /></button>
        </div>
        <Card padding="none" className="upcoming-list">
          {coupleEvents.slice(0, 3).map((event) => (
            <div className="upcoming-row" key={event.id}>
              <div className="date-tile"><strong>{Number(event.date.slice(-2))}</strong><span>8월</span></div>
              <div><Badge tone="rose">{event.type}</Badge><h3>{event.title}</h3><p><Clock3 size={13} /> {event.time}~{event.endTime} <i /> <MapPin size={13} /> {event.location}</p></div>
              <ChevronRight size={17} />
            </div>
          ))}
        </Card>
      </section>
      <section className="detail-column">
        <div className="section-heading section-heading--compact">
          <div><p className="eyebrow">이번 주 할 일</p><h2>이번 주 할 일</h2></div>
          <button onClick={() => onOpenTab('timeline')}>전체 보기 <ChevronRight size={14} /></button>
        </div>
        <Card className="task-list">
          {coupleTasks.slice(0, 4).map((task) => (
            <label className={`task-row ${task.completed ? 'task-row--done' : ''}`} key={task.id}>
              <input type="checkbox" checked={task.completed} onChange={() => onToggleChecklist(task.id)} />
              <span className="custom-check"><Check size={13} /></span>
              <div><strong>{task.title}</strong><small>{task.category} · {task.dueDate} · {task.owner}</small></div>
            </label>
          ))}
        </Card>
      </section>
      <Card className="couple-info-panel">
        <div className="section-heading">
          <div><p className="eyebrow">부부 정보</p><h2>부부정보</h2></div>
          <button onClick={() => setCoupleInfoOpen((value) => !value)}>{coupleInfoOpen ? '닫기' : '상세 입력·수정'}</button>
        </div>
        {coupleInfoOpen && <div className="couple-info-form">{Object.entries(info).map(([key, value]) => <label key={key}>{labels[key]}{key === 'note' ? <textarea value={value} onChange={(event) => setInfo({ ...info, [key]: event.target.value })} /> : <input value={value} onChange={(event) => setInfo({ ...info, [key]: event.target.value })} />}</label>)}</div>}
        <div className="couple-info-summary">{Object.entries(info).map(([key, value]) => <span key={key}><small>{labels[key]}</small><strong>{value || '미입력'}</strong></span>)}</div>
      </Card>
    </div>
  )
}
