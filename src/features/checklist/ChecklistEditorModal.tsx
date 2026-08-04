import { useEffect, useState } from 'react'
import { Save, Trash2 } from 'lucide-react'
import { Button, Modal } from '../../components/ui'
import type { ChecklistCategory, ChecklistItem } from '../../types'

const categories: ChecklistCategory[] = ['베뉴', '스드메', '예복·예물', '초대·연출', '행정·기타']
const owners: ChecklistItem['owner'][] = ['플래너', '신랑·신부', '함께']

type ChecklistDraft = Omit<ChecklistItem, 'id' | 'completed'>

const emptyDraft = (coupleId: string): ChecklistDraft => ({
  coupleId,
  title: '',
  dueDate: '8월 20일',
  phase: 'D-58',
  month: '8월',
  category: '스드메',
  owner: '함께',
  isTemplate: false,
})

export function ChecklistEditorModal({
  open,
  coupleId,
  item,
  onClose,
  onCreate,
  onUpdate,
  onDelete,
}: {
  open: boolean
  coupleId: string
  item: ChecklistItem | null
  onClose: () => void
  onCreate: (item: Omit<ChecklistItem, 'id'>) => void
  onUpdate: (item: ChecklistItem) => void
  onDelete: (id: string) => void
}) {
  const [draft, setDraft] = useState<ChecklistDraft>(emptyDraft(coupleId))

  useEffect(() => {
    setDraft(item ? {
      coupleId: item.coupleId,
      title: item.title,
      dueDate: item.dueDate,
      phase: item.phase,
      month: item.month,
      category: item.category,
      owner: item.owner,
      isTemplate: item.isTemplate,
    } : emptyDraft(coupleId))
  }, [item, coupleId, open])

  const save = () => {
    if (!draft.title.trim()) return
    if (item) onUpdate({ ...item, ...draft, title: draft.title.trim() })
    else onCreate({ ...draft, title: draft.title.trim(), completed: false })
    onClose()
  }

  const remove = () => {
    if (!item || !window.confirm('이 할 일 항목을 삭제할까요?')) return
    onDelete(item.id)
    onClose()
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      eyebrow={item ? 'Edit template item' : 'New checklist item'}
      title={item ? '할 일 항목 편집' : '할 일 추가'}
      footer={<>{item && <Button variant="ghost" icon={<Trash2 size={14} />} onClick={remove}>삭제</Button>}<span className="modal-footer-spacer" /><Button variant="ghost" onClick={onClose}>취소</Button><Button icon={<Save size={14} />} onClick={save} disabled={!draft.title.trim()}>저장</Button></>}
    >
      <div className="form-grid">
        <label className="form-field form-field--wide"><span>할 일</span><input autoFocus value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} placeholder="예: 식순 최종 확인" /></label>
        <label className="form-field"><span>월</span><select value={draft.month} onChange={(event) => setDraft({ ...draft, month: event.target.value })}>{['6월','7월','8월','9월','10월'].map((month) => <option key={month}>{month}</option>)}</select></label>
        <label className="form-field"><span>분야</span><select value={draft.category} onChange={(event) => setDraft({ ...draft, category: event.target.value as ChecklistCategory })}>{categories.map((category) => <option key={category}>{category}</option>)}</select></label>
        <label className="form-field"><span>마감일</span><input value={draft.dueDate} onChange={(event) => setDraft({ ...draft, dueDate: event.target.value })} /></label>
        <label className="form-field"><span>D-day 단계</span><input value={draft.phase} onChange={(event) => setDraft({ ...draft, phase: event.target.value })} /></label>
        <label className="form-field form-field--wide"><span>담당</span><select value={draft.owner} onChange={(event) => setDraft({ ...draft, owner: event.target.value as ChecklistItem['owner'] })}>{owners.map((owner) => <option key={owner}>{owner}</option>)}</select></label>
      </div>
    </Modal>
  )
}
