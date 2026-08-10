import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Badge, Card } from '../../../components/ui'
import type { CoordinationCategory, CoordinationOption, WeddingEvent } from '../../../types'

function formatCoordinationDate(value: string) {
  return new Date(value + 'T00:00:00').toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'short' })
}

function timeToMinutes(time?: string, fallback = 0) {
  return time ? Number(time.slice(0, 2)) * 60 + Number(time.slice(3, 5)) : fallback
}

export function CoupleScheduleTab({
  coupleId,
  events,
  coupleOptions,
  onAddCoordination,
  onFinalizeCoordination,
}: {
  coupleId: string
  events: WeddingEvent[]
  coupleOptions: CoordinationOption[]
  onAddCoordination: (option: CoordinationOption) => void
  onFinalizeCoordination: (optionId: string, responseId: string, event: WeddingEvent) => void
}) {
  const [plannerOtherOptionId, setPlannerOtherOptionId] = useState<string | null>(null)
  const [plannerOtherDate, setPlannerOtherDate] = useState('')
  const [plannerOtherStart, setPlannerOtherStart] = useState('')
  const [plannerOtherEnd, setPlannerOtherEnd] = useState('')
  const [coordinationFormOpen, setCoordinationFormOpen] = useState(false)
  const [newCoordinationCategory, setNewCoordinationCategory] = useState<CoordinationCategory>('상담')
  const [newCoordinationCustom, setNewCoordinationCustom] = useState('')
  const [newCoordinationDate, setNewCoordinationDate] = useState('')
  const [newCoordinationStart, setNewCoordinationStart] = useState('')
  const [newCoordinationEnd, setNewCoordinationEnd] = useState('')
  const hasEventOverlap = (date: string, start?: string, end?: string) => events.some((event) => event.date === date && timeToMinutes(start) < timeToMinutes(event.endTime, 1440) && timeToMinutes(end, 1440) > timeToMinutes(event.time))
  const newCoordinationBlocked = Boolean(newCoordinationDate && hasEventOverlap(newCoordinationDate, newCoordinationStart, newCoordinationEnd))
  const plannerOtherBlocked = Boolean(plannerOtherDate && hasEventOverlap(plannerOtherDate, plannerOtherStart, plannerOtherEnd))

  const addPlannerCoordination = () => {
    if (!newCoordinationDate || newCoordinationBlocked) return
    const category = newCoordinationCategory === '직접 입력' ? (newCoordinationCustom || '기타') : newCoordinationCategory
    const messages: Record<string, string> = { 상담: '상담 일정 제안입니다.', 스튜디오: '스튜디오 일정 제안입니다.', 드레스: '드레스 일정 제안입니다.', 메이크업: '메이크업 일정 제안입니다.', 기타: '기타 일정 제안입니다.' }
    onAddCoordination({ id: 'coord-' + Date.now(), coupleId, category, dates: [{ date: newCoordinationDate, startTime: newCoordinationStart || undefined, endTime: newCoordinationEnd || undefined }], note: messages[category] ?? category + ' 일정 제안입니다.', responses: [] })
    setCoordinationFormOpen(false)
    setNewCoordinationDate('')
    setNewCoordinationStart('')
    setNewCoordinationEnd('')
    setNewCoordinationCustom('')
  }

  const openPlannerOther = (optionId: string) => {
    setPlannerOtherOptionId(optionId)
    setPlannerOtherDate('')
    setPlannerOtherStart('')
    setPlannerOtherEnd('')
  }

  const submitPlannerOther = () => {
    if (!plannerOtherDate || plannerOtherBlocked) return
    onAddCoordination({ id: 'coord-' + Date.now(), coupleId, dates: [{ date: plannerOtherDate, startTime: plannerOtherStart || undefined, endTime: plannerOtherEnd || undefined }], note: '플래너가 추가로 제안한 일정입니다.', responses: [] })
    setPlannerOtherOptionId(null)
  }

  const finalize = (optionId: string, responseId: string, date: string, startTime?: string) => onFinalizeCoordination(optionId, responseId, { id: `event-${Date.now()}`, coupleId, title: '고객 합의 일정', date, time: startTime ?? '종일', endTime: startTime ?? '23:59', type: '미팅', location: '', status: 'confirmed', sharedWithClient: true })

  return (
    <div className="coordination-planner-page">
      <section className="section-heading">
        <div><p className="eyebrow">플래너 ↔ 고객</p><h2>일정 조율</h2><p className="muted">고객 오케이 후 플래너가 최종 컨펌해야 전체 캘린더에 반영됩니다.</p></div>
        <div className="coordination-header-actions"><Badge tone="amber">{coupleOptions.length}건 대기</Badge><button className="secondary-action" onClick={() => setCoordinationFormOpen((value) => !value)}><Plus size={14} /> 일정 조율 추가</button></div>
        {coordinationFormOpen && <div className="coordination-modal-backdrop"><form className="coordination-add-form" onSubmit={(event) => { event.preventDefault(); addPlannerCoordination() }}><label>일정 종류<select value={newCoordinationCategory} onChange={(event) => setNewCoordinationCategory(event.target.value as CoordinationCategory)}><option>상담</option><option>스튜디오</option><option>드레스</option><option>메이크업</option><option>기타</option><option>직접 입력</option></select></label>{newCoordinationCategory === '직접 입력' && <label>직접 입력<input value={newCoordinationCustom} onChange={(event) => setNewCoordinationCustom(event.target.value)} placeholder="일정 종류를 입력해 주세요" required /></label>}<label>날짜<input type="date" value={newCoordinationDate} onChange={(event) => setNewCoordinationDate(event.target.value)} required /></label><label>시작 시간<input type="time" value={newCoordinationStart} onChange={(event) => setNewCoordinationStart(event.target.value)} /></label><label>종료 시간<input type="time" value={newCoordinationEnd} onChange={(event) => setNewCoordinationEnd(event.target.value)} /></label><button className="primary-btn" type="submit" disabled={newCoordinationBlocked}>고객에게 제안하기</button></form></div>}
      </section>
      {coupleOptions.map((option) => <Card className="coordination-planner-card" key={option.id}><Badge tone="amber">고객 응답 확인</Badge><div className="coordination-planner-title"><h3>{option.note}</h3><button className="secondary-action" onClick={() => openPlannerOther(option.id)}><Plus size={14} /> 다른 일정 제안</button></div>{plannerOtherOptionId === option.id && <form className="planner-other-date-form" onSubmit={(event) => { event.preventDefault(); submitPlannerOther() }}><label>날짜<input type="date" value={plannerOtherDate} onChange={(event) => setPlannerOtherDate(event.target.value)} required /></label><label>시작 시간<input type="time" value={plannerOtherStart} onChange={(event) => setPlannerOtherStart(event.target.value)} /></label><label>종료 시간<input type="time" value={plannerOtherEnd} onChange={(event) => setPlannerOtherEnd(event.target.value)} /></label><button className="primary-btn" type="submit" disabled={plannerOtherBlocked}>고객에게 제안 등록</button></form>}{option.dates.map((date) => <div className="coordination-planner-row" key={date.date}><span><strong>{formatCoordinationDate(date.date)}</strong><small>{date.startTime ?? '종일'}~{date.endTime ?? ''}</small></span><div className="planner-confirm-actions">{option.responses.filter((response) => response.date === date.date).map((response) => response.state === 'available' ? <><Badge tone="sage" key={response.id + '-status'}>확정 가능</Badge><button className="primary-btn" key={response.id} onClick={() => finalize(option.id, response.id, response.date, response.startTime)}>최종 확정하여 캘린더에 올리기</button></> : <Badge key={response.id} tone="neutral">고객 불가</Badge>)}{!option.responses.some((response) => response.date === date.date) && <button className="planner-confirm-disabled" disabled>확정 가능 · 고객 오케이 대기</button>}</div></div>)}</Card>)}
    </div>
  )
}
