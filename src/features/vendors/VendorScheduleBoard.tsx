import { useState } from 'react'
import { Building2, Check, ChevronLeft, ChevronRight, Clock3, Eye, LockKeyhole, Store, UsersRound } from 'lucide-react'
import { useDemoStore } from '../../app/store'
import { vendorScheduleSlots } from '../../data/mockData'
import type { Vendor, VendorScheduleSlot } from '../../types'

const weekStarts = ['2026-08-09', '2026-08-16', '2026-08-23']

function addDays(date: string, days: number) {
  const [year, month, day] = date.split('-').map(Number)
  const next = new Date(Date.UTC(year, month - 1, day + days))
  return next.toISOString().slice(0, 10)
}

function dayLabel(date: string) {
  return new Date(`${date}T12:00:00`).toLocaleDateString('ko-KR', { weekday: 'short' })
}

function slotPurpose(vendor: Vendor) {
  if (vendor.category === '드레스') return '피팅·상담'
  if (vendor.category === '스튜디오') return '촬영·상담'
  return '테스트·상담'
}

export function VendorScheduleBoard({ vendor, coupleId = 'c1', clientView = false }: { vendor: Vendor; coupleId?: string; clientView?: boolean }) {
  const [weekIndex, setWeekIndex] = useState(1)
  const { vendorSelections, selectVendorSlot } = useDemoStore()
  const selected = vendorSelections.find((selection) => selection.coupleId === coupleId && selection.vendorId === vendor.id)
  const vendorSlots = vendorScheduleSlots.filter((slot) => slot.vendorId === vendor.id)
  const slots: VendorScheduleSlot[] = vendorSlots.length
    ? vendorSlots
    : vendorScheduleSlots.map((slot) => ({ ...slot, id: `${vendor.id}-${slot.id}`, vendorId: vendor.id }))
  const selectedSlot = slots.find((slot) => slot.id === selected?.slotId)
  const weekStart = weekStarts[weekIndex]
  const days = Array.from({ length: 7 }, (_, index) => addDays(weekStart, index))

  return (
    <section className={`vendor-schedule-board shared-vendor-calendar ${clientView ? 'shared-vendor-calendar--client' : ''}`}>
      <header className="shared-vendor-calendar__header">
        <div className="shared-vendor-calendar__title"><span><Building2 size={19} /></span><div><p className="eyebrow">Live partner schedule</p><h2>{vendor.name} 주간 일정</h2><p>예약 화면이 아니라 업체·플래너·두 분이 같은 가능 시간을 확인하는 공유 보드입니다.</p></div></div>
        <div className="shared-calendar-source"><span><i /> 업체에서 제공</span><small>5분 전 동기화</small></div>
      </header>

      <div className="shared-calendar-toolbar">
        <div className="shared-calendar-week-control"><button aria-label="이전 주" disabled={weekIndex === 0} onClick={() => setWeekIndex((current) => current - 1)}><ChevronLeft size={17} /></button><div><strong>8월 {Number(weekStart.slice(-2))}일 – {Number(days[6].slice(-2))}일</strong><span>2026년</span></div><button aria-label="다음 주" disabled={weekIndex === weekStarts.length - 1} onClick={() => setWeekIndex((current) => current + 1)}><ChevronRight size={17} /></button></div>
        <div className="shared-calendar-legend"><span><i className="available" />확인 가능</span><span><i className="busy" />업체 일정 있음</span><span><i className="reviewing" />함께 확인 중</span></div>
      </div>

      <div className="vendor-week-calendar">
        {days.map((date, dayIndex) => {
          const daySlots = slots.filter((slot) => slot.date === date).sort((a, b) => a.time.localeCompare(b.time))
          return <div className={`vendor-week-day ${dayIndex === 0 || dayIndex === 6 ? 'vendor-week-day--weekend' : ''}`} key={date}>
            <header><span>{dayLabel(date)}</span><strong>{Number(date.slice(-2))}</strong></header>
            <div className="vendor-week-day__body">{daySlots.length ? daySlots.map((slot) => {
              const isSelected = selected?.slotId === slot.id
              return <button
                key={slot.id}
                disabled={slot.status === 'booked'}
                className={`vendor-week-slot ${isSelected ? 'vendor-week-slot--selected' : `vendor-week-slot--${slot.status}`}`}
                onClick={() => selectVendorSlot(coupleId, vendor.id, slot.id)}
                aria-label={`${date} ${slot.time} ${isSelected ? '함께 확인 중' : slot.status === 'booked' ? '업체 일정 있음' : '확인 가능'}`}
              >
                <strong>{slot.time}</strong>
                <small>{slot.status === 'booked' ? '비공개 일정' : slotPurpose(vendor)}</small>
                <span>{isSelected ? <><Check size={12} /> 함께 확인 중</> : slot.status === 'booked' ? <><LockKeyhole size={11} /> 일정 있음</> : <><Eye size={12} /> 확인 가능</>}</span>
              </button>
            }) : <span className="vendor-week-empty">공개 일정 없음</span>}</div>
          </div>
        })}
      </div>

      <div className="schedule-collaboration-flow" aria-label="일정 공유 과정">
        <div><span><Store size={15} /></span><p><strong>업체</strong><small>가능 시간 공개</small></p></div><i /><div><span><UsersRound size={15} /></span><p><strong>플래너</strong><small>동선·중복 확인</small></p></div><i /><div><span><Eye size={15} /></span><p><strong>두 분</strong><small>관심 시간 표시</small></p></div>
      </div>

      <div className={`shared-schedule-status ${selectedSlot ? 'shared-schedule-status--active' : ''}`}>
        <span>{selectedSlot ? <Check size={15} /> : <Clock3 size={15} />}</span>
        <div>{selectedSlot ? <><strong>{Number(selectedSlot.date.slice(5, 7))}월 {Number(selectedSlot.date.slice(-2))}일({dayLabel(selectedSlot.date)}) {selectedSlot.time}을 함께 확인하고 있어요.</strong><p>예약 요청이 아닙니다. 플래너가 업체 상황과 전체 일정을 확인한 뒤 안내해 드려요.</p></> : <><strong>확인하고 싶은 시간을 표시해 주세요.</strong><p>표시한 시간은 플래너 화면에도 동일하게 보입니다.</p></>}</div>
      </div>
    </section>
  )
}
