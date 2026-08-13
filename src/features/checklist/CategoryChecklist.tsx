import { Check, MoreHorizontal, Plus } from 'lucide-react'
import { Badge, Button } from '../../components/ui'
import type { ChecklistCategory, ChecklistItem } from '../../types'
import { checklistCategories } from './checklistCategories'
import { formatChecklistDate } from './checklistUtils'

export function CategoryChecklist({
  tasks,
  onToggle,
  editable = false,
  readOnly = false,
  onAdd,
  onEdit,
}: {
  tasks: ChecklistItem[]
  onToggle: (id: string) => void
  editable?: boolean
  readOnly?: boolean
  onAdd?: (category?: ChecklistCategory) => void
  onEdit?: (item: ChecklistItem) => void
}) {
  return (
    <section className="category-checklist">
      <div className="category-checklist__heading">
        <div><p className="eyebrow">Checklist by category</p><h2>분야별 할 일</h2><p>스튜디오부터 본식 드레스까지 업무 단위로 나누어 관리합니다.</p></div>
        {editable && <Button size="sm" icon={<Plus size={15} />} onClick={() => onAdd?.()}>새 할 일 만들기</Button>}
      </div>
      <div className="category-checklist__grid">
        {checklistCategories.map((category, categoryIndex) => {
          const categoryTasks = tasks.filter((task) => task.category === category.id).sort((a, b) => a.dueDate.localeCompare(b.dueDate))
          const done = categoryTasks.filter((task) => task.status === 'completed').length
          return (
            <article className="checklist-group" key={category.id}>
              <header><div><span className={`category-dot category-dot--${categoryIndex + 1}`} /><div><h3>{category.id}</h3><p>{category.description}</p></div></div><small>{done}/{categoryTasks.length}</small></header>
              <div>
                {categoryTasks.map((task) => (
                  <div className={`checklist-manage-row ${task.status === 'completed' ? 'done' : ''}`} key={task.id}>
                    <label>
                      {!readOnly && <input type="checkbox" checked={task.status === 'completed'} onChange={() => onToggle(task.id)} />}
                      <span><Check size={13} /></span>
                      <div><strong>{task.title}</strong><small>{formatChecklistDate(task.dueDate)} · {task.owner}</small></div>
                    </label>
                    <div className="checklist-manage-row__meta">
                      {task.kind === 'decision' && <Badge tone={task.status === 'completed' ? 'sage' : task.status === 'in-progress' ? 'amber' : 'rose'}>{task.status === 'completed' ? '완료' : task.status === 'in-progress' ? '진행 중' : '미결정'}</Badge>}
                      {editable && <button aria-label={`${task.title} 편집`} onClick={() => onEdit?.(task)}><MoreHorizontal size={16} /></button>}
                    </div>
                  </div>
                ))}
                {!categoryTasks.length && <p className="checklist-empty">등록된 할 일이 없습니다.</p>}
              </div>
              {editable && <button className="checklist-group__add" aria-label={`${category.id} 할 일 추가`} onClick={() => onAdd?.(category.id)}><Plus size={14} /> 이 분야에 추가</button>}
            </article>
          )
        })}
      </div>
    </section>
  )
}
