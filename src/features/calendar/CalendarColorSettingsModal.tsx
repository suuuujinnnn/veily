import { useEffect, useState } from 'react'
import { Dices } from 'lucide-react'
import { Button, Modal } from '../../components/ui'
import type { Couple } from '../../types'
import { buildNonOverlappingCoupleColors, calendarCustomerPalette, defaultCoupleColor } from './calendarAppearance'

interface CalendarColorSettingsModalProps {
  open: boolean
  couples: Couple[]
  colors: Record<string, string>
  onChange: (colors: Record<string, string>) => void
  onClose: () => void
}

export function CalendarColorSettingsModal({ open, couples, colors, onChange, onClose }: CalendarColorSettingsModalProps) {
  const [selectedCoupleId, setSelectedCoupleId] = useState(couples[0]?.id ?? '')
  useEffect(() => {
    if (open && !couples.some((couple) => couple.id === selectedCoupleId)) setSelectedCoupleId(couples[0]?.id ?? '')
  }, [couples, open, selectedCoupleId])
  const selectedCouple = couples.find((couple) => couple.id === selectedCoupleId)
  const selectedColor = colors[selectedCoupleId] ?? defaultCoupleColor(selectedCoupleId, couples)
  const setColor = (color: string) => onChange({ ...colors, [selectedCoupleId]: color })

  return <Modal open={open} onClose={onClose} eyebrow="Calendar colors" title="고객별 일정 색상" footer={<><Button variant="secondary" icon={<Dices size={14} />} onClick={() => onChange(buildNonOverlappingCoupleColors(couples))}>겹치지 않게 자동 배정</Button><Button onClick={onClose}>완료</Button></>}>
    <div className="calendar-color-manager">
      <div className="calendar-color-manager__customers">
        {couples.map((couple) => <button type="button" className={selectedCoupleId === couple.id ? 'active' : ''} onClick={() => setSelectedCoupleId(couple.id)} key={couple.id}>
          <i style={{ background: colors[couple.id] ?? defaultCoupleColor(couple.id, couples) }} />
          <span>{couple.partners}</span>
        </button>)}
      </div>
      <section className="calendar-color-manager__palette">
        <header><span>선택 고객</span><strong>{selectedCouple?.partners ?? '고객을 선택해 주세요'}</strong></header>
        <div>{calendarCustomerPalette.map((color) => <button type="button" className={selectedColor === color ? 'active' : ''} style={{ background: color }} onClick={() => setColor(color)} aria-label={`${color} 색상 선택`} key={color} />)}</div>
        <label><span>직접 색상 선택</span><input type="color" value={selectedColor.startsWith('#') ? selectedColor : '#78878e'} onChange={(event) => setColor(event.target.value)} /></label>
        <p>고객 이름은 일정에 항상 함께 표시되므로 색상은 빠르게 구분하기 위한 보조 정보로 사용됩니다.</p>
      </section>
    </div>
  </Modal>
}
