import { useEffect, useMemo, useState } from 'react'
import { CalendarPlus, Car, TrainFront } from 'lucide-react'
import { useDemoStore } from '../../app/store'
import { Button, Modal } from '../../components/ui'
import type { EventType, TravelMode } from '../../types'
import { workflowGroups, workflowTemplates } from './workflowTemplates'

interface AddEventModalProps { open: boolean; onClose: () => void; onAdded: () => void; initialDate?: string; initialCoupleId?: string }
const getEndTime = (time: string, duration: number) => { const [hour, minute] = time.split(':').map(Number); const total = Math.min(1439, hour * 60 + minute + duration); return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}` }

export function AddEventModal({ open, onClose, onAdded, initialDate, initialCoupleId }: AddEventModalProps) {
  const { couples, addEvent } = useDemoStore()
  const [coupleId, setCoupleId] = useState(initialCoupleId ?? 'c1')
  const [workflowId, setWorkflowId] = useState('dress-tour')
  const [type, setType] = useState<EventType>('드레스')
  const [title, setTitle] = useState('드레스 투어')
  const [date, setDate] = useState(initialDate ?? '2026-08-24')
  const [time, setTime] = useState('11:00')
  const [duration, setDuration] = useState(120)
  const [location, setLocation] = useState('')
  const [travelMode, setTravelMode] = useState<TravelMode>('subway')
  const [memo, setMemo] = useState('')
  const endTime = useMemo(() => getEndTime(time, duration), [duration, time])

  useEffect(() => { if (open) { if (initialDate) setDate(initialDate); if (initialCoupleId) setCoupleId(initialCoupleId) } }, [initialCoupleId, initialDate, open])
  const selectWorkflow = (id: string) => { const template = workflowTemplates.find((item) => item.id === id); setWorkflowId(id); if (template) { setType(template.type); setTitle(template.label); setDuration(template.duration) } }
  const submit = () => {
    if (!title.trim()) return
    const template = workflowTemplates.find((item) => item.id === workflowId)
    addEvent({ coupleId, type, title, date, time, endTime, location: location || '장소 미정', workflowType: template?.label, durationMinutes: duration, travelMode, memo })
    setLocation(''); setMemo(''); onAdded(); onClose()
  }

  return <Modal open={open} onClose={onClose} eyebrow="New schedule" title="새 일정 등록" footer={<><Button variant="ghost" onClick={onClose}>취소</Button><Button icon={<CalendarPlus size={15} />} onClick={submit} disabled={!title.trim()}>일정 등록</Button></>}>
    <div className="form-grid">
      <label className="form-field"><span>커플</span><select value={coupleId} onChange={(event) => setCoupleId(event.target.value)}>{couples.map((couple) => <option key={couple.id} value={couple.id}>{couple.partners}</option>)}</select></label>
      <label className="form-field"><span>세부 업무</span><select value={workflowId} onChange={(event) => selectWorkflow(event.target.value)}>{workflowGroups.map((group) => <optgroup label={group} key={group}>{workflowTemplates.filter((item) => item.group === group).map((item) => <option value={item.id} key={item.id}>{item.label}</option>)}</optgroup>)}</select></label>
      <label className="form-field form-field--wide"><span>표시 제목</span><input autoFocus value={title} onChange={(event) => setTitle(event.target.value)} /></label>
      <label className="form-field"><span>상위 일정 유형</span><select value={type} onChange={(event) => setType(event.target.value as EventType)}>{['미팅','드레스','스튜디오','메이크업','계약','본식'].map((item) => <option key={item}>{item}</option>)}</select></label>
      <label className="form-field"><span>날짜</span><input type="date" value={date} onChange={(event) => setDate(event.target.value)} /></label>
      <label className="form-field"><span>시작 시간</span><input type="time" value={time} onChange={(event) => setTime(event.target.value)} /></label>
      <label className="form-field"><span>소요시간 (분)</span><input type="number" min="15" step="15" value={duration} onChange={(event) => setDuration(Math.max(15, Number(event.target.value)))} /><small>종료 {endTime} 자동 계산</small></label>
      <label className="form-field form-field--wide"><span>장소</span><input value={location} onChange={(event) => setLocation(event.target.value)} placeholder="업체명 또는 주소" /></label>
      <fieldset className="travel-mode-picker form-field--wide"><legend>이 일정으로 이동할 때</legend><button type="button" className={travelMode === 'subway' ? 'active' : ''} onClick={() => setTravelMode('subway')}><TrainFront size={17} /> 대중교통</button><button type="button" className={travelMode === 'bus' ? 'active' : ''} onClick={() => setTravelMode('bus')}><TrainFront size={17} /> 버스</button><button type="button" className={travelMode === 'car' ? 'active' : ''} onClick={() => setTravelMode('car')}><Car size={17} /> 자차</button></fieldset>
      <label className="form-field form-field--wide"><span>메모</span><textarea rows={3} value={memo} onChange={(event) => setMemo(event.target.value)} placeholder="준비물이나 업체 전달사항" /></label>
    </div>
  </Modal>
}
