import { CalendarCheck2, Check, Clock3, LockKeyhole } from 'lucide-react'
import { useDemoStore } from '../../app/store'
import { vendorScheduleSlots } from '../../data/mockData'
import type { Vendor } from '../../types'

const scheduleMonths = [
  { key: '2026-08', label: '8월', note: '피팅 위크' },
  { key: '2026-09', label: '9월', note: '가을 시즌' },
  { key: '2026-10', label: '10월', note: '본식 집중' },
]

export function VendorScheduleBoard({ vendor, coupleId = 'c1', clientView = false }: { vendor: Vendor; coupleId?: string; clientView?: boolean }) {
  const { vendorSelections, selectVendorSlot } = useDemoStore()
  const selected = vendorSelections.find((selection) => selection.coupleId === coupleId && selection.vendorId === vendor.id)
  const vendorSlots = vendorScheduleSlots.filter((slot) => slot.vendorId === vendor.id)
  const slots = vendorSlots.length ? vendorSlots : vendorScheduleSlots.map((slot) => ({ ...slot, id: `${vendor.id}-${slot.id}`, vendorId: vendor.id }))

  return (
    <section className={`vendor-schedule-board ${clientView ? 'vendor-schedule-board--client' : ''}`}>
      <header className="vendor-schedule-board__header">
        <div><p className="eyebrow">Partner availability</p><h2>{clientView ? '업체 예약 후보 일정' : '월별 예약 현황'}</h2><p>업체가 먼저 공개한 일정을 확인하고 공유 캘린더에 반영할 수 있습니다.</p></div>
        <div className="schedule-legend"><span><i className="open" />선택 가능</span><span><i className="booked" />예약 완료</span><span><i className="shared" />공유 중</span></div>
      </header>
      <div className="vendor-months">
        {scheduleMonths.map((month) => {
          const monthSlots = slots.filter((slot) => slot.date.startsWith(month.key))
          return (
            <article className="vendor-month" key={month.key}>
              <header><div><strong>{month.label}</strong><span>2026</span></div><small>{month.note}</small></header>
              <div className="vendor-month__slots">
                {monthSlots.map((slot) => {
                  const isSelected = selected?.slotId === slot.id
                  const day = Number(slot.date.slice(-2))
                  return (
                    <button
                      key={slot.id}
                      disabled={slot.status === 'booked'}
                      className={isSelected ? 'selected' : slot.status}
                      onClick={() => selectVendorSlot(coupleId, vendor.id, slot.id)}
                    >
                      <span className="slot-date"><strong>{day}</strong><small>{new Date(`${slot.date}T00:00:00`).toLocaleDateString('ko-KR', { weekday: 'short' })}</small></span>
                      <span className="slot-time"><Clock3 size={13} />{slot.time}</span>
                      <span className="slot-status">{isSelected ? <><Check size={13} /> 공유 중</> : slot.status === 'booked' ? <><LockKeyhole size={12} /> 예약 완료</> : <><CalendarCheck2 size={13} /> 선택 가능</>}</span>
                    </button>
                  )
                })}
              </div>
            </article>
          )
        })}
      </div>
      {selected && <div className="shared-slot-notice"><Check size={14} /><strong>선택한 일정이 공유되었습니다.</strong><span>플래너와 신랑·신부 화면에서 동일하게 확인할 수 있습니다.</span></div>}
    </section>
  )
}
