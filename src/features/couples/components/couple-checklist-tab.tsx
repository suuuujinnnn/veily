import type { ChecklistCategory, ChecklistItem } from '../../../types'
import { CategoryChecklist } from '../../checklist/CategoryChecklist'
import { MonthlyRoadmap } from '../../checklist/MonthlyRoadmap'

export function CoupleChecklistTab({
  coupleTasks,
  onToggleChecklist,
  onAddTask,
  onEditTask,
}: {
  coupleTasks: ChecklistItem[]
  onToggleChecklist: (id: string) => void
  onAddTask: (category?: ChecklistCategory) => void
  onEditTask: (item: ChecklistItem) => void
}) {
  return (
    <div className="checklist-workspace">
      <section className="checklist-workspace__intro"><div><p className="eyebrow">준비 흐름</p><h2>단계별 준비 로드맵</h2></div></section>
      <MonthlyRoadmap tasks={coupleTasks} onToggle={onToggleChecklist} />
      <div className="checklist-workspace__lower"><CategoryChecklist tasks={coupleTasks} onToggle={onToggleChecklist} editable onAdd={onAddTask} onEdit={onEditTask} /></div>
    </div>
  )
}
