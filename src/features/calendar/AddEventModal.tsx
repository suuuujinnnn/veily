import { useState } from 'react'
import { CalendarPlus } from 'lucide-react'
import { useDemoStore } from '../../app/store'
import { Button, Modal } from '../../components/ui'
import { couples } from '../../data/mockData'
import type { EventType } from '../../types'

export function AddEventModal({ open, onClose, onAdded }: { open: boolean; onClose: () => void; onAdded: () => void }) {
  const { addEvent } = useDemoStore()
  const [coupleId, setCoupleId] = useState('c1')
  const [type, setType] = useState<EventType>('미팅')
  const [title, setTitle] = useState('')
  const [date, setDate] = useState('2026-08-24')
  const [time, setTime] = useState('11:00')
  const [location, setLocation] = useState('')

  const submit = () => {
    if (!title.trim()) return
    const endHour = String(Math.min(23, Number(time.slice(0, 2)) + 1)).padStart(2, '0')
    addEvent({ coupleId, type, title, date, time, endTime: `${endHour}:${time.slice(3)}`, location: location || '장소 미정' })
    setTitle('')
    setLocation('')
    onAdded()
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} eyebrow="New schedule" title="새 일정 등록" footer={<><Button variant="ghost" onClick={onClose}>취소</Button><Button icon={<CalendarPlus size={15} />} onClick={submit} disabled={!title.trim()}>일정 등록</Button></>}>
      <div className="form-grid">
        <label className="form-field form-field--wide"><span>일정 이름</span><input autoFocus value={title} onChange={(event) => setTitle(event.target.value)} placeholder="예: 드레스 2차 피팅" /></label>
        <label className="form-field"><span>어떤 커플의 일정인가요?</span><select value={coupleId} onChange={(event) => setCoupleId(event.target.value)}>{couples.map((couple) => <option key={couple.id} value={couple.id}>{couple.partners}</option>)}</select></label>
        <label className="form-field"><span>업무 유형</span><select value={type} onChange={(event) => setType(event.target.value as EventType)}>{['미팅','드레스','스튜디오','메이크업','계약','본식'].map((item) => <option key={item}>{item}</option>)}</select></label>
        <label className="form-field"><span>날짜</span><input type="date" value={date} onChange={(event) => setDate(event.target.value)} /></label>
        <label className="form-field"><span>시작 시간</span><input type="time" value={time} onChange={(event) => setTime(event.target.value)} /></label>
        <label className="form-field form-field--wide"><span>장소</span><input value={location} onChange={(event) => setLocation(event.target.value)} placeholder="업체명 또는 주소" /></label>
        <label className="switch-field form-field--wide"><input type="checkbox" defaultChecked /><span className="switch" /><div><strong>이동 시간 자동 표시</strong><small>이전 일정과의 예상 이동 시간을 캘린더에 표시합니다.</small></div></label>
      </div>
    </Modal>
  )
}
