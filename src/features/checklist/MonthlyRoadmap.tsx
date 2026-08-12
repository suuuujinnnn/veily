import { Check, Circle } from 'lucide-react'
import type { ChecklistItem } from '../../types'
import { dueStatus, formatChecklistDate, formatMonth, monthKey } from './checklistUtils'

export function MonthlyRoadmap({ tasks, onToggle }: { tasks: ChecklistItem[]; onToggle: (id: string) => void }) {
  const roadmapMonths = [...new Set(tasks.map((task) => monthKey(task.dueDate)))].sort()
  return (
    <section className="monthly-roadmap" aria-label="월별 준비 로드맵">
      <div className="monthly-roadmap__track" style={{ gridTemplateColumns: `repeat(${Math.max(roadmapMonths.length, 1)}, minmax(205px, 1fr))` }}>
        {roadmapMonths.map((month) => {
          const monthTasks = tasks.filter((task) => monthKey(task.dueDate) === month).sort((a, b) => a.dueDate.localeCompare(b.dueDate))
          const completed = monthTasks.filter((task) => task.completed).length
          const isCurrent = month === new Date().toISOString().slice(0, 7)
          return (
            <article className={`roadmap-month ${isCurrent ? 'roadmap-month--current' : ''}`} key={month}>
              <header>
                <div><span>{month.slice(0, 4)}</span><h3>{formatMonth(`${month}-01`).replace(/^\d+년 /, '')}</h3></div>
                <small>{completed}/{monthTasks.length} 완료</small>
              </header>
              <div className="roadmap-month__progress"><span style={{ width: `${monthTasks.length ? (completed / monthTasks.length) * 100 : 0}%` }} /></div>
              <div className="roadmap-month__tasks">
                {monthTasks.map((task) => (
                  <button className={`${task.completed ? 'done' : ''} status-${dueStatus(task.dueDate, task.completed)}`} onClick={() => onToggle(task.id)} key={task.id}>
                    <span>{task.completed ? <Check size={12} /> : <Circle size={10} />}</span>
                    <div><strong>{task.title}</strong><small>{formatChecklistDate(task.dueDate)} · {task.category}</small></div>
                  </button>
                ))}
              </div>
            </article>
          )
        })}
        {!roadmapMonths.length && <div className="roadmap-empty">할 일을 추가하면 예식일까지의 월별 로드맵이 만들어집니다.</div>}
      </div>
    </section>
  )
}
