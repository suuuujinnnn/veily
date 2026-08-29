import { useEffect, useMemo, useState } from 'react'
import { CalendarPlus, Trash2 } from 'lucide-react'
import { useDemoStore } from '../../app/store'
import { Button, Modal } from '../../components/ui'
import type { CalendarWorkCategory, EventType, WeddingEvent } from '../../types'
import { workflowGroups, workflowTemplates } from './workflowTemplates'
import { calendarCategoryForType, calendarCategoryForWorkflow, calendarWorkCategories } from './calendarAppearance'

interface AddEventModalProps { open: boolean; onClose: () => void; onAdded: () => void; initialDate?: string; initialCoupleId?: string; initialEvent?: WeddingEvent | null; context?: 'default' | 'couple-coordination' }
const getEndTime = (time: string, duration: number) => { const [hour, minute] = time.split(':').map(Number); const total = Math.min(1439, hour * 60 + minute + duration); return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}` }

export function AddEventModal({ open, onClose, onAdded, initialDate, initialCoupleId, initialEvent, context = 'default' }: AddEventModalProps) {
  const { couples, vendors, addEvent, updateEvent, deleteEvent } = useDemoStore()
  const [visibility, setVisibility] = useState<'couple-shared' | 'planner-private'>('couple-shared')
  const [coupleId, setCoupleId] = useState(initialCoupleId ?? 'c1')
  const [workflowId, setWorkflowId] = useState('dress-tour')
  const [vendorId, setVendorId] = useState('')
  const [type, setType] = useState<EventType>('드레스')
  const [calendarCategory, setCalendarCategory] = useState<CalendarWorkCategory>('tour')
  const [title, setTitle] = useState('드레스 투어')
  const [date, setDate] = useState(initialDate ?? '2026-08-24')
  const [time, setTime] = useState('11:00')
  const [duration, setDuration] = useState(120)
  const [location, setLocation] = useState('')
  const [memo, setMemo] = useState('')
  const [reminderOffsets, setReminderOffsets] = useState<number[]>([14, 7, 1])
  const endTime = useMemo(() => getEndTime(time, duration), [duration, time])

  useEffect(() => {
    if (!open) return
    if (initialEvent) {
      setVisibility(initialEvent.visibility); setCoupleId(initialEvent.coupleId ?? 'c1'); setVendorId(initialEvent.vendorId ?? '')
      setType(initialEvent.type); setCalendarCategory(initialEvent.calendarCategory ?? calendarCategoryForType(initialEvent.type)); setTitle(initialEvent.title); setDate(initialEvent.date); setTime(initialEvent.time)
      setDuration(initialEvent.durationMinutes ?? 60); setLocation(initialEvent.location)
      setMemo(initialEvent.memo ?? ''); setReminderOffsets(initialEvent.reminderOffsets ?? [14, 7, 1])
      return
    }
    setVisibility('couple-shared'); setCoupleId(initialCoupleId ?? 'c1'); setWorkflowId('dress-tour'); setVendorId('')
    setType('드레스'); setCalendarCategory('tour'); setTitle('드레스 투어'); setDate(initialDate ?? '2026-08-24'); setTime('11:00')
    setDuration(120); setLocation(''); setMemo(''); setReminderOffsets([14, 7, 1])
  }, [initialCoupleId, initialDate, initialEvent, open])
  const selectWorkflow = (id: string) => { const template = workflowTemplates.find((item) => item.id === id); setWorkflowId(id); setVendorId(''); if (template) { setType(template.type); setCalendarCategory(calendarCategoryForWorkflow(id, template.type)); setTitle(template.label); setDuration(template.duration) } }
  const selectVisibility = (next: 'couple-shared' | 'planner-private') => {
    setVisibility(next)
    if (next === 'planner-private') {
      setTitle('')
      setType('미팅')
      setCalendarCategory('other')
      setDuration(60)
      setLocation('')
      setMemo('')
      setVendorId('')
    } else {
      selectWorkflow(workflowId)
    }
  }
  const vendorCategory = type === '본식' ? '웨딩홀' : type === '메이크업' ? '헤어&메이크업' : ['드레스', '스튜디오'].includes(type) ? type : null
  const availableVendors = vendors.filter((vendor) => !vendorCategory || vendor.category === vendorCategory)
  const selectVendor = (nextId: string) => {
    setVendorId(nextId)
    const vendor = vendors.find((item) => item.id === nextId)
    if (!vendor) return
    setTitle(`${vendor.name} ${type}`)
    setLocation(vendor.address || vendor.name)
  }
  const toggleReminder = (offset: number) => setReminderOffsets((current) => current.includes(offset) ? current.filter((item) => item !== offset) : [...current, offset].sort((a, b) => b - a))
  const submit = () => {
    if (!title.trim()) return
    const template = workflowTemplates.find((item) => item.id === workflowId)
    const event = { ...(visibility === 'couple-shared' ? { coupleId, vendorId: vendorId || undefined, workflowType: template?.label, reminderOffsets } : {}), visibility, type, calendarCategory, title, date, time, endTime, location: location || '장소 미정', durationMinutes: duration, memo, ...(context === 'couple-coordination' && !initialEvent ? { approvalStatus: 'planner-proposed' as const } : {}) }
    if (initialEvent) updateEvent({ ...initialEvent, ...event })
    else addEvent(event)
    setLocation(''); setMemo(''); onAdded(); onClose()
  }

  const remove = () => { if (!initialEvent || !window.confirm('이 일정을 삭제할까요?')) return; deleteEvent(initialEvent.id); onAdded(); onClose() }

  return <Modal open={open} onClose={onClose} eyebrow={initialEvent ? 'Edit schedule' : 'New schedule'} title={initialEvent ? '일정 수정' : '새 일정 등록'} footer={<>{initialEvent && <Button variant="ghost" icon={<Trash2 size={14} />} onClick={remove}>삭제</Button>}<span className="modal-footer-spacer" /><Button variant="ghost" onClick={onClose}>취소</Button><Button icon={<CalendarPlus size={15} />} onClick={submit} disabled={!title.trim()}>{initialEvent ? '변경 저장' : '일정 등록'}</Button></>}>
    <div className="form-grid">
      {context === 'default' && <fieldset className="schedule-visibility-picker form-field--wide"><legend>일정 구분</legend><button type="button" className={visibility === 'couple-shared' ? 'active' : ''} onClick={() => selectVisibility('couple-shared')}>커플 일정<small>고객과 공유</small></button><button type="button" className={visibility === 'planner-private' ? 'active' : ''} onClick={() => selectVisibility('planner-private')}>개인 일정<small>나에게만 표시</small></button></fieldset>}
      {context === 'default' && visibility === 'couple-shared' && <label className="form-field"><span>커플</span><select value={coupleId} onChange={(event) => setCoupleId(event.target.value)}>{couples.map((couple) => <option key={couple.id} value={couple.id}>{couple.partners}</option>)}</select></label>}
      {context === 'couple-coordination' && <div className="coordination-modal-context form-field--wide"><CalendarPlus size={16} /><span><strong>{couples.find((item) => item.id === coupleId)?.partners}</strong><small>고객과 공유되며 먼저 확인 대기 상태로 등록됩니다.</small></span></div>}
      {visibility === 'couple-shared' && <label className="form-field"><span>일정 종류</span><select value={type} onChange={(event) => { setType(event.target.value as EventType); setVendorId('') }}>{['미팅','드레스','스튜디오','메이크업','계약','본식'].map((item) => <option key={item}>{item}</option>)}</select></label>}
      {visibility === 'couple-shared' && <label className="form-field"><span>캘린더 구분</span><select value={calendarCategory} onChange={(event) => setCalendarCategory(event.target.value as CalendarWorkCategory)}>{calendarWorkCategories.map((item) => <option value={item.value} key={item.value}>{item.label}</option>)}</select></label>}
      {visibility === 'couple-shared' && <label className="form-field form-field--wide"><span>제휴업체</span><select value={vendorId} onChange={(event) => selectVendor(event.target.value)}><option value="">업체 미정</option>{availableVendors.map((vendor) => <option value={vendor.id} key={vendor.id}>{vendor.name} · {vendor.location}</option>)}</select></label>}
      {visibility === 'couple-shared' && <label className="form-field"><span>세부 업무</span><select value={workflowId} onChange={(event) => selectWorkflow(event.target.value)}>{workflowGroups.map((group) => <optgroup label={group} key={group}>{workflowTemplates.filter((item) => item.group === group).map((item) => <option value={item.id} key={item.id}>{item.label}</option>)}</optgroup>)}</select></label>}
      <label className="form-field form-field--wide"><span>{visibility === 'planner-private' ? '일정 제목' : '표시 제목'}</span><input autoFocus value={title} onChange={(event) => setTitle(event.target.value)} placeholder={visibility === 'planner-private' ? '예: 병원 예약, 운동, 개인 약속' : undefined} /></label>
      <label className="form-field"><span>날짜</span><input type="date" value={date} onChange={(event) => setDate(event.target.value)} /></label>
      <label className="form-field"><span>시작 시간</span><input type="time" value={time} onChange={(event) => setTime(event.target.value)} /></label>
      <label className="form-field"><span>소요시간 (분)</span><input type="number" min="15" step="15" value={duration} onChange={(event) => setDuration(Math.max(15, Number(event.target.value)))} /><small>종료 {endTime} 자동 계산</small></label>
      <label className="form-field form-field--wide"><span>장소</span><input value={location} onChange={(event) => setLocation(event.target.value)} placeholder={visibility === 'planner-private' ? '장소 또는 주소 (선택)' : '업체명 또는 주소'} /></label>
      {visibility === 'couple-shared' && <fieldset className="reminder-preset-picker form-field--wide"><legend>일정 리마인드</legend>{[21, 14, 7, 3, 1].map((offset) => <button type="button" className={reminderOffsets.includes(offset) ? 'active' : ''} onClick={() => toggleReminder(offset)} key={offset}>D-{offset}</button>)}<small>기본 preset은 D-14 · D-7 · D-1입니다.</small></fieldset>}
      <label className="form-field form-field--wide"><span>메모</span><textarea rows={3} value={memo} onChange={(event) => setMemo(event.target.value)} placeholder={visibility === 'planner-private' ? '메모 (선택)' : '준비물이나 업체 전달사항'} /></label>
    </div>
  </Modal>
}
