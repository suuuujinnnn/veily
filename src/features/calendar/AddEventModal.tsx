import { useMemo, useState } from 'react'
import { CalendarPlus } from 'lucide-react'
import { useDemoStore } from '../../app/store'
import { Button, Modal } from '../../components/ui'
import type { EventType } from '../../types'

const minutes = (time: string) => { const [hour, minute] = time.split(':').map(Number); return hour * 60 + minute }
const overlaps = (date: string, start: string, end: string, events: { date: string; time: string; endTime: string }[]) => events.some((event) => event.date === date && minutes(start) < minutes(event.endTime) && minutes(end) > minutes(event.time))

export function AddEventModal({ open, onClose, onAdded }: { open: boolean; onClose: () => void; onAdded: () => void }) {
  const { couples, events, addEvent } = useDemoStore()
  const [coupleId, setCoupleId] = useState('c1')
  const [type, setType] = useState<EventType>('미팅' as EventType)
  const [title, setTitle] = useState('')
  const [date, setDate] = useState('2026-08-24')
  const [time, setTime] = useState('11:00')
  const [endTime, setEndTime] = useState('12:00')
  const [location, setLocation] = useState('')
  const hasOverlap = useMemo(() => Boolean(time && endTime && minutes(endTime) > minutes(time) && overlaps(date, time, endTime, events)), [date, endTime, events, time])
  const submit = () => {
    if (!title.trim() || !date || !time || !endTime || minutes(endTime) <= minutes(time) || hasOverlap) return
    addEvent({ coupleId, type, title, date, time, endTime, location: location || '장소 미정' })
    setTitle(''); setLocation(''); onAdded(); onClose()
  }
  return <Modal open={open} onClose={onClose} eyebrow="일정 관리" title="새 일정 등록" footer={<><Button variant="ghost" onClick={onClose}>취소</Button><Button icon={<CalendarPlus size={15} />} onClick={submit} disabled={!title.trim() || !date || !time || !endTime || minutes(endTime) <= minutes(time) || hasOverlap}>일정 등록</Button></>}>
    <div className="form-grid"><label className="form-field form-field--wide"><span>일정 이름</span><input autoFocus value={title} onChange={(event) => setTitle(event.target.value)} placeholder="예: 드레스 2차 피팅" /></label><label className="form-field"><span>부부</span><select value={coupleId} onChange={(event) => setCoupleId(event.target.value)}>{couples.map((couple) => <option key={couple.id} value={couple.id}>{couple.partners}님</option>)}</select></label><label className="form-field"><span>일정 유형</span><select value={type} onChange={(event) => setType(event.target.value as EventType)}>{['미팅', '스튜디오', '드레스', '메이크업', '계약', '본식'].map((item) => <option key={item}>{item}</option>)}</select></label><label className="form-field"><span>날짜</span><input type="date" value={date} onChange={(event) => setDate(event.target.value)} /></label><label className="form-field"><span>시작 시간</span><input type="time" value={time} onChange={(event) => setTime(event.target.value)} /></label><label className="form-field"><span>종료 시간</span><input type="time" value={endTime} onChange={(event) => setEndTime(event.target.value)} /></label><label className="form-field form-field--wide"><span>장소</span><input value={location} onChange={(event) => setLocation(event.target.value)} placeholder="업체명 또는 주소" /></label></div>
  </Modal>
}