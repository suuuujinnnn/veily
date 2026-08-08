import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { DemoProvider } from '../../app/store'
import { vendors } from '../../data/mockData'
import { VendorScheduleBoard } from './VendorScheduleBoard'

afterEach(cleanup)

function renderBoard() {
  return render(
    <DemoProvider>
      <VendorScheduleBoard vendor={vendors[0]} coupleId="c1" clientView />
    </DemoProvider>,
  )
}

describe('VendorScheduleBoard', () => {
  it('shows a privacy-safe weekly schedule instead of a booking flow', () => {
    renderBoard()

    expect(screen.getByText('8월 16일 – 22일')).toBeInTheDocument()
    expect(screen.getByText(/예약 화면이 아니라/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '2026-08-18 15:30 업체 일정 있음' })).toBeDisabled()
    expect(screen.queryByText('예약 완료')).not.toBeInTheDocument()
  })

  it('shares a time to review without presenting it as a booking request', () => {
    renderBoard()

    fireEvent.click(screen.getByRole('button', { name: '2026-08-18 10:00 확인 가능' }))

    expect(screen.getByRole('button', { name: '2026-08-18 10:00 함께 확인 중' })).toBeInTheDocument()
    expect(screen.getByText(/8월 18일\(화\) 10:00을 함께 확인하고 있어요/)).toBeInTheDocument()
    expect(screen.getByText(/예약 요청이 아닙니다/)).toBeInTheDocument()
  })
})
