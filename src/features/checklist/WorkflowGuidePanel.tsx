import { useMemo, useState } from 'react'
import { Check, ChevronDown, ChevronUp, CircleHelp, Plus, Search } from 'lucide-react'
import { Badge, Button } from '../../components/ui'
import { weddingWorkflowTemplates, workflowStageFor, workflowStages } from '../../data/weddingWorkflowTemplates'
import type { ChecklistCategory, ChecklistItem } from '../../types'
import { checklistCategories } from './checklistCategories'
import { addDays, dDayLabel, formatChecklistDate } from './checklistUtils'

type OptionalFilter = 'all' | 'required' | 'optional'

export function WorkflowGuidePanel({
  coupleId,
  weddingDate,
  tasks,
  onAdd,
}: {
  coupleId: string
  weddingDate: string
  tasks: ChecklistItem[]
  onAdd: (item: Omit<ChecklistItem, 'id'>) => void
}) {
  const [query, setQuery] = useState('')
  const [stage, setStage] = useState('all')
  const [category, setCategory] = useState<'all' | ChecklistCategory>('all')
  const [optional, setOptional] = useState<OptionalFilter>('all')
  const [expanded, setExpanded] = useState<string | null>(null)
  const addedIds = new Set(tasks.flatMap((task) => task.templateId ? [task.templateId] : []))
  const filtered = useMemo(() => weddingWorkflowTemplates.filter((template) => {
    const textMatch = `${template.title} ${template.summary} ${template.checkpoints.join(' ')}`.toLowerCase().includes(query.trim().toLowerCase())
    const stageMatch = stage === 'all' || workflowStageFor(template.offsetDays).id === stage
    const categoryMatch = category === 'all' || template.category === category
    const optionalMatch = optional === 'all' || (optional === 'optional' ? template.optional : !template.optional)
    return textMatch && stageMatch && categoryMatch && optionalMatch
  }), [query, stage, category, optional])

  const addTemplate = (template: (typeof weddingWorkflowTemplates)[number]) => {
    if (addedIds.has(template.id)) return
    onAdd({
      coupleId,
      title: template.title,
      dueDate: addDays(weddingDate, template.offsetDays),
      category: template.category,
      completed: false,
      owner: template.defaultOwner,
      isTemplate: true,
      templateId: template.id,
    })
  }

  return (
    <section className="workflow-guide" aria-labelledby="workflow-guide-title">
      <div className="workflow-guide__head">
        <div><p className="eyebrow">Korean wedding workflow</p><h2 id="workflow-guide-title">표준 업무 가이드</h2><p>필요한 업무를 하나씩 추가하면 예식일 기준 마감일이 자동으로 계산됩니다.</p></div>
        <Badge tone="sage">플래너 전용</Badge>
      </div>
      <div className="workflow-guide__filters">
        <label className="guide-search"><Search size={15} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="업무 또는 확인 포인트 검색" aria-label="가이드 검색" /></label>
        <select value={stage} onChange={(event) => setStage(event.target.value)} aria-label="준비 단계"><option value="all">전체 단계</option>{workflowStages.map((item) => <option value={item.id} key={item.id}>{item.label}</option>)}</select>
        <select value={category} onChange={(event) => setCategory(event.target.value as 'all' | ChecklistCategory)} aria-label="업무 분야"><option value="all">전체 분야</option>{checklistCategories.map((item) => <option value={item.id} key={item.id}>{item.id}</option>)}</select>
        <select value={optional} onChange={(event) => setOptional(event.target.value as OptionalFilter)} aria-label="필수 여부"><option value="all">필수·선택 전체</option><option value="required">필수 업무</option><option value="optional">선택 업무</option></select>
      </div>
      <div className="workflow-guide__list">
        {filtered.map((template) => {
          const dueDate = addDays(weddingDate, template.offsetDays)
          const isAdded = addedIds.has(template.id)
          const isOpen = expanded === template.id
          return <article className={`guide-item ${isAdded ? 'guide-item--added' : ''}`} key={template.id}>
            <button className="guide-item__summary" onClick={() => setExpanded(isOpen ? null : template.id)} aria-expanded={isOpen}>
              <span className="guide-item__phase">{workflowStageFor(template.offsetDays).label}</span>
              <span className="guide-item__title"><strong>{template.title}</strong><small>{template.category} · {template.defaultOwner} · {formatChecklistDate(dueDate)} ({dDayLabel(weddingDate, dueDate)})</small></span>
              {template.optional && <Badge tone="neutral">선택</Badge>}
              {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
            {isOpen && <div className="guide-item__detail"><div><CircleHelp size={17} /><p>{template.summary}</p></div><ul>{template.checkpoints.map((checkpoint) => <li key={checkpoint}>{checkpoint}</li>)}</ul><Button size="sm" variant={isAdded ? 'secondary' : 'primary'} icon={isAdded ? <Check size={14} /> : <Plus size={14} />} disabled={isAdded} onClick={() => addTemplate(template)}>{isAdded ? '추가됨' : '이 고객에게 추가'}</Button></div>}
          </article>
        })}
        {!filtered.length && <p className="guide-empty">조건에 맞는 표준 업무가 없습니다.</p>}
      </div>
      <p className="workflow-guide__notice">이 가이드는 국내 웨딩 준비를 돕는 실무 참고 기준이며 법률·세무 자문을 대신하지 않습니다.</p>
    </section>
  )
}
