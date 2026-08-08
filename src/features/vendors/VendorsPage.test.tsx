import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { DemoProvider } from '../../app/store'
import { VendorsPage } from './VendorsPage'

function renderPage() {
  return render(
    <MemoryRouter>
      <DemoProvider>
        <VendorsPage />
      </DemoProvider>
    </MemoryRouter>,
  )
}

describe('VendorsPage style curation', () => {
  it('switches style taxonomies and sends selected vendors to the couple', () => {
    renderPage()

    expect(screen.getByRole('heading', { name: '실크 스타일 제휴업체' })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: '메이크업5개 업체' }))
    expect(screen.getByRole('heading', { name: '과즙 스타일 제휴업체' })).toBeInTheDocument()

    fireEvent.click(screen.getAllByRole('button', { name: '제안 후보 담기' })[0])
    expect(screen.getByText(/님에게 제안할 업체/)).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: '신부에게 제안 보내기' }))
    expect(screen.getByText('제안이 고객 화면에 전달됐어요.')).toBeInTheDocument()
  })
})
