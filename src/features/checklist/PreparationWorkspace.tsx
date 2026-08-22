import { useState } from 'react'
import { CalendarRange, ListChecks, Plus } from 'lucide-react'
import type { ChecklistCategory, ChecklistItem } from '../../types'
import { Button } from '../../components/ui'
import { CategoryChecklist } from './CategoryChecklist'
import { MonthlyRoadmap } from './MonthlyRoadmap'

type PreparationView = 'monthly' | 'category'

export function PreparationWorkspace({ tasks, onToggle, editable = false, readOnly = false, onAdd, onEdit, initialView = 'monthly' }: { tasks: ChecklistItem[]; onToggle: (id: string) => void; editable?: boolean; readOnly?: boolean; onAdd?: (category?: ChecklistCategory) => void; onEdit?: (item: ChecklistItem) => void; initialView?: PreparationView }) {
  const [view, setView] = useState<PreparationView>(initialView)
  const [touchStartX, setTouchStartX] = useState<number | null>(null)
  const move = (direction: -1 | 1) => setView((current) => direction > 0 ? 'category' : 'monthly')
  const onTouchEnd = (clientX: number) => { if (touchStartX === null) return; const distance = clientX - touchStartX; if (Math.abs(distance) >= 45) move(distance < 0 ? 1 : -1); setTouchStartX(null) }
  const completed = tasks.filter((task) => task.status === 'completed').length

  return <section className="preparation-workspace">
    <header className="preparation-workspace__header"><div><p className="eyebrow">Wedding workflow</p><h2>준비 업무</h2><span>월별 흐름과 분야별 업무를 같은 준비 업무 데이터로 확인합니다.</span></div><div className="preparation-workspace__header-actions"><strong>{completed}/{tasks.length} 완료</strong>{editable && <Button size="sm" icon={<Plus size={14} />} onClick={() => onAdd?.()}>새 할 일 만들기</Button>}</div></header>
    <nav className="preparation-workspace__tabs" role="tablist" aria-label="준비 업무 보기"><button type="button" role="tab" aria-selected={view === 'monthly'} className={view === 'monthly' ? 'active' : ''} onClick={() => setView('monthly')}><CalendarRange size={15} /> 월별 보기</button><button type="button" role="tab" aria-selected={view === 'category'} className={view === 'category' ? 'active' : ''} onClick={() => setView('category')}><ListChecks size={15} /> 분야별 보기</button></nav>
    <div className="preparation-workspace__viewport" onTouchStart={(event) => setTouchStartX(event.touches[0]?.clientX ?? null)} onTouchEnd={(event) => onTouchEnd(event.changedTouches[0]?.clientX ?? 0)}><div className="preparation-workspace__track" style={{ transform: `translateX(${view === 'monthly' ? '0' : '-100'}%)` }}><div className="preparation-workspace__slide"><MonthlyRoadmap tasks={tasks} onToggle={onToggle} readOnly={readOnly} /></div><div className="preparation-workspace__slide"><CategoryChecklist tasks={tasks} onToggle={onToggle} editable={editable} readOnly={readOnly} onAdd={onAdd} onEdit={onEdit} /></div></div></div>
  </section>
}
