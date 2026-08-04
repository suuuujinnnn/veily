import { Check, Circle } from 'lucide-react'
import type { ChecklistItem } from '../../types'

const roadmapMonths = ['6월', '7월', '8월', '9월', '10월']

export function MonthlyRoadmap({ tasks, onToggle }: { tasks: ChecklistItem[]; onToggle: (id: string) => void }) {
  return (
    <section className="monthly-roadmap" aria-label="월별 준비 로드맵">
      <div className="monthly-roadmap__track">
        {roadmapMonths.map((month, index) => {
          const monthTasks = tasks.filter((task) => task.month === month)
          const completed = monthTasks.filter((task) => task.completed).length
          return (
            <article className={`roadmap-month ${month === '8월' ? 'roadmap-month--current' : ''}`} key={month}>
              <header>
                <div><span>{String(index + 6).padStart(2, '0')}</span><h3>{month}</h3></div>
                <small>{completed}/{monthTasks.length} 완료</small>
              </header>
              <div className="roadmap-month__progress"><span style={{ width: `${monthTasks.length ? (completed / monthTasks.length) * 100 : 0}%` }} /></div>
              <div className="roadmap-month__tasks">
                {monthTasks.map((task) => (
                  <button className={task.completed ? 'done' : ''} onClick={() => onToggle(task.id)} key={task.id}>
                    <span>{task.completed ? <Check size={12} /> : <Circle size={10} />}</span>
                    <div><strong>{task.title}</strong><small>{task.dueDate} · {task.category}</small></div>
                  </button>
                ))}
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}
