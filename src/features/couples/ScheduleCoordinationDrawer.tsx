import { useEffect, useMemo, useState } from 'react'
import { CalendarPlus, ChevronLeft, ChevronRight, Clock3, Plus, Send, Trash2, X } from 'lucide-react'
import { useDemoStore } from '../../app/store'
import { Button } from '../../components/ui'
import type { MockCandidateSlot, MockCoordinationRequest } from '../../data/scheduleCoordinationMock'
import { addMinutes, formatCoordinationDate } from '../calendar/scheduleCoordination'
import { calendarCategoryForWorkflow } from '../calendar/calendarAppearance'
import { workflowTemplates } from '../calendar/workflowTemplates'

interface Props {
  open: boolean
  coupleId: string
  request?: MockCoordinationRequest | null
  onSubmit: (request: MockCoordinationRequest) => void
  onClose: () => void
}

const groupForVendor = (category: string) => category === '헤어&메이크업' ? '메이크업' : category === '웨딩홀' ? '웨딩홀' : category

export function ScheduleCoordinationDrawer({ open, coupleId, request, onSubmit, onClose }: Props) {
  const { vendors } = useDemoStore()
  const [step, setStep] = useState(1)
  const [vendorId, setVendorId] = useState('')
  const [workflowId, setWorkflowId] = useState('')
  const [duration, setDuration] = useState(60)
  const [dateInput, setDateInput] = useState('2026-08-12')
  const [dates, setDates] = useState<string[]>([])
  const [slots, setSlots] = useState<MockCandidateSlot[]>([])

  const vendor = vendors.find((item) => item.id === vendorId)
  const workflows = useMemo(() => {
    if (!vendor) return []
    const group = groupForVendor(vendor.category)
    const matching = workflowTemplates.filter((item) => item.group === group)
    return matching.length ? matching : workflowTemplates.filter((item) => item.group === '기타')
  }, [vendor])
  const workflow = workflowTemplates.find((item) => item.id === workflowId)

  useEffect(() => {
    if (!open) return
    setStep(1)
    if (request) {
      setVendorId(request.vendorId); setWorkflowId(request.workflowId); setDuration(request.durationMinutes)
      setDates([...new Set(request.slots.map((slot) => slot.date))].sort()); setSlots(request.slots)
      return
    }
    setVendorId(''); setWorkflowId(''); setDuration(60); setDates([]); setSlots([]); setDateInput('2026-08-12')
  }, [open, request])

  useEffect(() => {
    if (!vendor || request) return
    const next = workflows[0]
    setWorkflowId(next?.id ?? '')
    if (next) setDuration(next.duration)
  }, [request, vendor, workflows])

  const chooseWorkflow = (id: string) => {
    setWorkflowId(id)
    const next = workflowTemplates.find((item) => item.id === id)
    if (next) setDuration(next.duration)
  }
  const addDate = () => {
    if (!dateInput || dates.includes(dateInput)) return
    setDates((current) => [...current, dateInput].sort())
  }
  const removeDate = (date: string) => {
    setDates((current) => current.filter((item) => item !== date))
    setSlots((current) => current.filter((item) => item.date !== date))
  }
  const addSlot = (date: string) => {
    const times = slots.filter((slot) => slot.date === date).map((slot) => slot.time)
    const time = ['10:00', '11:00', '14:00', '16:00'].find((item) => !times.includes(item)) ?? '18:00'
    setSlots((current) => [...current, { id: `slot-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`, date, time, endTime: addMinutes(time, duration) }])
  }
  const changeSlotTime = (id: string, time: string) => setSlots((current) => current.map((slot) => slot.id === id ? { ...slot, time, endTime: addMinutes(time, duration) } : slot))
  const removeSlot = (id: string) => setSlots((current) => current.filter((slot) => slot.id !== id))
  const normalizedSlots = slots.map((slot) => ({ ...slot, endTime: addMinutes(slot.time, duration) }))
  const hasDuplicate = normalizedSlots.some((slot, index) => normalizedSlots.findIndex((item) => item.date === slot.date && item.time === slot.time) !== index)
  const canContinue = step === 1 ? Boolean(vendor && workflow) : step === 2 ? dates.length > 0 : normalizedSlots.length > 0 && dates.every((date) => normalizedSlots.some((slot) => slot.date === date)) && !hasDuplicate

  const submit = () => {
    if (!vendor || !workflow || !canContinue) return
    const common: MockCoordinationRequest = {
      id: request?.id ?? `coord-preview-${Date.now()}`,
      coupleId, vendorId: vendor.id, workflowId: workflow.id,
      title: `${vendor.name} ${workflow.label}`, type: workflow.type,
      calendarCategory: calendarCategoryForWorkflow(workflow.id, workflow.type),
      location: vendor.address || vendor.location || vendor.name,
      durationMinutes: duration, slots: normalizedSlots.sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`)),
      status: 'awaiting-client', sentAt: '2026-08-05T10:30:00+09:00', response: request?.response,
    }
    onSubmit(common)
    onClose()
  }

  if (!open) return null
  return <div className="calendar-day-drawer-layer coordination-drawer-layer" role="presentation" onMouseDown={onClose}>
    <aside className="calendar-day-drawer coordination-request-drawer" role="dialog" aria-modal="true" aria-labelledby="coordination-drawer-title" onMouseDown={(event) => event.stopPropagation()}>
      <header className="calendar-day-drawer__header"><div><p className="eyebrow">Schedule coordination</p><h2 id="coordination-drawer-title">{request ? '일정 후보 수정' : '일정 조율 요청'}</h2><span>{step}. {step === 1 ? '업체와 업무' : step === 2 ? '후보 날짜' : '시간과 발송'}</span></div><button className="icon-button" onClick={onClose} aria-label="닫기"><X size={18} /></button></header>
      <div className="calendar-day-drawer__body coordination-request-drawer__body">
        <ol className="coordination-request-steps">{['업체·업무', '날짜', '시간·검토'].map((label, index) => <li className={step === index + 1 ? 'active' : step > index + 1 ? 'done' : ''} key={label}><span>{index + 1}</span>{label}</li>)}</ol>
        {step === 1 && <div className="coordination-drawer-form">
          <label className="form-field"><span>업체</span><select value={vendorId} onChange={(event) => { setVendorId(event.target.value); setWorkflowId('') }}><option value="">업체를 선택하세요</option>{vendors.map((item) => <option value={item.id} key={item.id}>{item.name} · {item.category}</option>)}</select></label>
          <label className="form-field"><span>진행할 일</span><select value={workflowId} disabled={!vendor} onChange={(event) => chooseWorkflow(event.target.value)}><option value="">업무를 선택하세요</option>{workflows.map((item) => <option value={item.id} key={item.id}>{item.label}</option>)}</select></label>
          <label className="form-field"><span>예상 소요 시간</span><select value={duration} onChange={(event) => setDuration(Number(event.target.value))}>{[30, 45, 60, 90, 120, 180, 240].map((item) => <option value={item} key={item}>{item >= 60 ? `${item / 60}시간${item % 60 ? ` ${item % 60}분` : ''}` : `${item}분`}</option>)}</select></label>
          {vendor && <div className="coordination-vendor-preview"><strong>{vendor.name}</strong><span>{vendor.category} · {vendor.location}</span><small>{vendor.address || '등록된 주소가 없습니다.'}</small></div>}
        </div>}
        {step === 2 && <div className="coordination-drawer-form"><div className="coordination-date-add"><label className="form-field"><span>후보 날짜</span><input type="date" value={dateInput} onChange={(event) => setDateInput(event.target.value)} /></label><Button size="sm" variant="secondary" icon={<CalendarPlus size={14} />} onClick={addDate}>날짜 추가</Button></div><div className="coordination-date-list">{dates.map((date) => <div key={date}><CalendarPlus size={15} /><strong>{formatCoordinationDate(date)}</strong><button onClick={() => removeDate(date)} aria-label={`${date} 삭제`}><X size={14} /></button></div>)}</div>{dates.length === 0 && <div className="coordination-drawer-empty">고객에게 보낼 후보 날짜를 먼저 추가하세요.</div>}</div>}
        {step === 3 && <div className="coordination-slot-editor">{dates.map((date) => <section key={date}><header><div><CalendarPlus size={15} /><strong>{formatCoordinationDate(date)}</strong></div><button onClick={() => addSlot(date)}><Plus size={13} /> 시간 추가</button></header><div>{normalizedSlots.filter((slot) => slot.date === date).map((slot) => <label key={slot.id}><Clock3 size={14} /><input type="time" value={slot.time} onChange={(event) => changeSlotTime(slot.id, event.target.value)} /><span>–</span><strong>{slot.endTime}</strong><button onClick={() => removeSlot(slot.id)} aria-label="시간 삭제"><Trash2 size={13} /></button></label>)}</div>{!normalizedSlots.some((slot) => slot.date === date) && <small>시간을 하나 이상 추가하세요.</small>}</section>)}{hasDuplicate && <p className="coordination-form-error">같은 날짜와 시간이 중복되어 있습니다.</p>}<div className="coordination-send-summary"><span>{vendor?.name}</span><strong>{workflow?.label}</strong><small>{normalizedSlots.length}개 후보 · {duration}분 소요</small>{request && <em>수정 후 재발송하면 기존 고객 응답은 이력으로 보존되고 새 응답을 기다립니다.</em>}</div></div>}
      </div>
      <footer className="calendar-day-drawer__footer coordination-drawer-footer">{step > 1 && <Button variant="ghost" icon={<ChevronLeft size={14} />} onClick={() => setStep((current) => current - 1)}>이전</Button>}<span />{step < 3 ? <Button icon={<ChevronRight size={14} />} disabled={!canContinue} onClick={() => setStep((current) => current + 1)}>다음</Button> : <Button icon={<Send size={14} />} disabled={!canContinue} onClick={submit}>{request ? '수정 후 재발송' : '고객에게 보내기'}</Button>}</footer>
    </aside>
  </div>
}
