import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { initialChecklist } from '../../data/mockData'
import { CategoryChecklist } from './CategoryChecklist'

afterEach(cleanup)

describe('CategoryChecklist', () => {
  it('shows detailed wedding work categories instead of a combined package category', () => {
    render(<CategoryChecklist tasks={initialChecklist.filter((task) => task.coupleId === 'c1')} onToggle={() => undefined} />)

    expect(screen.getByRole('heading', { name: '스튜디오' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: '드레스·촬영' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: '드레스·본식' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: '메이크업' })).toBeInTheDocument()
    expect(screen.queryByText('스드메')).not.toBeInTheDocument()
  })

  it('starts a new planner task in the selected category', () => {
    const onAdd = vi.fn()
    render(<CategoryChecklist tasks={initialChecklist.filter((task) => task.coupleId === 'c1')} onToggle={() => undefined} editable onAdd={onAdd} />)

    fireEvent.click(screen.getByRole('button', { name: '드레스·본식 할 일 추가' }))

    expect(onAdd).toHaveBeenCalledWith('드레스·본식')
  })
})
