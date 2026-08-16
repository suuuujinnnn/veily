import { useEffect, useState } from 'react'
import { Save, Trash2 } from 'lucide-react'
import { Button, Modal } from '../../components/ui'
import type { ChecklistCategory, ChecklistItem } from '../../types'
import { checklistCategories } from './checklistCategories'

const owners: ChecklistItem['owner'][] = ['플래너', '신랑·신부', '함께']

type ChecklistDraft = Omit<ChecklistItem, 'id'>

const emptyDraft = (coupleId: string, category: ChecklistCategory = '스튜디오'): ChecklistDraft => ({
  coupleId,
  title: '',
  dueDate: new Date().toISOString().slice(0, 10),
  category,
  kind: 'preparation',
  status: 'pending',
  owner: '함께',
})

export function ChecklistEditorModal({
  open,
  coupleId,
  defaultCategory,
  item,
  onClose,
  onCreate,
  onUpdate,
  onDelete,
}: {
  open: boolean
  coupleId: string
  defaultCategory?: ChecklistCategory
  item: ChecklistItem | null
  onClose: () => void
  onCreate: (item: Omit<ChecklistItem, 'id'>) => void
  onUpdate: (item: ChecklistItem) => void
  onDelete: (id: string) => void
}) {
  const [draft, setDraft] = useState<ChecklistDraft>(emptyDraft(coupleId, defaultCategory))

  useEffect(() => {
    setDraft(item ? {
      coupleId: item.coupleId,
      title: item.title,
      dueDate: item.dueDate,
      category: item.category,
      kind: item.kind,
      status: item.status,
      owner: item.owner,
    } : emptyDraft(coupleId, defaultCategory))
  }, [item, coupleId, defaultCategory, open])

  const save = () => {
    if (!draft.title.trim()) return
    if (item) onUpdate({ ...item, ...draft, title: draft.title.trim() })
    else onCreate({ ...draft, title: draft.title.trim() })
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
        <label className="form-field"><span>분야</span><select value={draft.category} onChange={(event) => setDraft({ ...draft, category: event.target.value as ChecklistCategory })}>{checklistCategories.map((category) => <option key={category.id}>{category.id}</option>)}</select></label>
        <label className="form-field"><span>마감일</span><input type="date" value={draft.dueDate} onChange={(event) => setDraft({ ...draft, dueDate: event.target.value })} /></label>
        <label className="form-field"><span>종류</span><select value={draft.kind} onChange={(event) => setDraft({ ...draft, kind: event.target.value as ChecklistItem['kind'] })}><option value="preparation">준비 업무</option><option value="decision">결정 필요</option></select></label>
        <label className="form-field"><span>상태</span><select value={draft.status} onChange={(event) => setDraft({ ...draft, status: event.target.value as ChecklistItem['status'] })}><option value="pending">{draft.kind === 'decision' ? '미결정' : '대기'}</option><option value="in-progress">진행 중</option><option value="completed">완료</option></select></label>
        <label className="form-field form-field--wide"><span>담당</span><select value={draft.owner} onChange={(event) => setDraft({ ...draft, owner: event.target.value as ChecklistItem['owner'] })}>{owners.map((owner) => <option key={owner}>{owner}</option>)}</select></label>
      </div>
    </Modal>
  )
}
