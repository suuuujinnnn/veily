import { Check, MoreHorizontal, Plus } from 'lucide-react'
import { Badge, Button } from '../../components/ui'
import type { ChecklistCategory, ChecklistItem } from '../../types'

const categories: ChecklistCategory[] = ['베뉴', '스드메', '예복·예물', '초대·연출', '행정·기타']

export function CategoryChecklist({
  tasks,
  onToggle,
  editable = false,
  onAdd,
  onEdit,
}: {
  tasks: ChecklistItem[]
  onToggle: (id: string) => void
  editable?: boolean
  onAdd?: () => void
  onEdit?: (item: ChecklistItem) => void
}) {
  return (
    <section className="category-checklist">
      <div className="category-checklist__heading">
        <div><p className="eyebrow">Checklist by category</p><h2>분야별 할 일</h2><p>웨딩 준비 템플릿을 현재 커플에 맞게 조정합니다.</p></div>
        {editable && <Button size="sm" icon={<Plus size={15} />} onClick={onAdd}>항목 추가</Button>}
      </div>
      <div className="category-checklist__grid">
        {categories.map((category) => {
          const categoryTasks = tasks.filter((task) => task.category === category)
          const done = categoryTasks.filter((task) => task.completed).length
          return (
            <article className="checklist-group" key={category}>
              <header><div><span className={`category-dot category-dot--${categories.indexOf(category) + 1}`} /><h3>{category}</h3></div><small>{done}/{categoryTasks.length}</small></header>
              <div>
                {categoryTasks.map((task) => (
                  <div className={`checklist-manage-row ${task.completed ? 'done' : ''}`} key={task.id}>
                    <label>
                      <input type="checkbox" checked={task.completed} onChange={() => onToggle(task.id)} />
                      <span><Check size={13} /></span>
                      <div><strong>{task.title}</strong><small>{task.dueDate} · {task.owner}</small></div>
                    </label>
                    <div className="checklist-manage-row__meta">
                      {task.isTemplate && <Badge tone="neutral">템플릿</Badge>}
                      {editable && <button aria-label={`${task.title} 편집`} onClick={() => onEdit?.(task)}><MoreHorizontal size={16} /></button>}
                    </div>
                  </div>
                ))}
                {!categoryTasks.length && <p className="checklist-empty">등록된 항목이 없습니다.</p>}
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}
