import { useEffect, useRef, useState } from 'react'
import { ChevronDown, Image, UploadCloud } from 'lucide-react'
import type { Couple, WeddingReference } from '../../types'

interface CustomerTasteFilterControlProps {
  couples: Couple[]
  coupleId: string
  couple?: Couple
  referenceCount: number
  tags: string[]
  submittedAt?: string
  previewReferences: WeddingReference[]
  onCustomerChange: (coupleId: string) => void
  onUpload: () => void
  onPreview: (referenceId: string) => void
}

export function CustomerTasteFilterControl({
  couples,
  coupleId,
  couple,
  referenceCount,
  tags,
  submittedAt,
  previewReferences,
  onCustomerChange,
  onUpload,
  onPreview,
}: CustomerTasteFilterControlProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)

  useEffect(() => setOpen(false), [coupleId])

  useEffect(() => {
    if (!open) return
    const closeOutside = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false)
    }
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', closeOutside)
    document.addEventListener('keydown', closeOnEscape)
    return () => {
      document.removeEventListener('mousedown', closeOutside)
      document.removeEventListener('keydown', closeOnEscape)
    }
  }, [open])

  const firstTag = tags[0]
  const remainingTagCount = Math.max(0, tags.length - 1)
  const submittedDate = submittedAt?.slice(0, 10).replaceAll('-', '.')

  return <div className="customer-taste-filter-control" ref={rootRef}>
    <label className="customer-taste-filter-control__target">
      <span>추천 대상</span>
      <select value={coupleId} onChange={(event) => onCustomerChange(event.target.value)}>
        <option value="all">전체</option>
        {couples.map((item) => <option value={item.id} key={item.id}>{item.partners}</option>)}
      </select>
    </label>

    {couple && <div className="customer-taste-summary">
      <button type="button" className="customer-taste-summary__trigger" aria-haspopup="dialog" aria-expanded={open} onClick={() => setOpen((current) => !current)}>
        <Image size={12} />
        <strong>{referenceCount ? `취향 ${referenceCount}장` : '취향 자료 없음'}</strong>
        {firstTag && <span>#{firstTag}</span>}
        {remainingTagCount > 0 && <em>+{remainingTagCount}</em>}
        <ChevronDown size={12} />
      </button>
    </div>}

    {couple && open && <div className="customer-taste-popover" role="dialog" aria-label={`${couple.brideName} 고객 취향 자료`}>
      <header><div><strong>{couple.brideName}님의 취향</strong><span>{referenceCount ? `레퍼런스 ${referenceCount}장` : '제출된 자료 없음'}</span></div>{submittedDate && <time dateTime={submittedAt?.slice(0, 10)}>{submittedDate}</time>}</header>
      {previewReferences.length > 0 && <div className="customer-taste-popover__images">{previewReferences.slice(0, 4).map((reference) => <button type="button" onClick={() => { setOpen(false); onPreview(reference.id) }} aria-label={`${reference.vendorName} 레퍼런스 크게 보기`} key={reference.id}><img src={reference.image} style={{ objectPosition: reference.imagePosition }} alt="" /></button>)}</div>}
      {tags.length > 0 ? <div className="customer-taste-popover__tags">{tags.map((tag) => <span key={tag}>#{tag}</span>)}</div> : <p>현재 분야에 적용할 해시태그가 없습니다.</p>}
      <footer><button type="button" onClick={() => { setOpen(false); onUpload() }}><UploadCloud size={13} /> 개인 자료 추가</button></footer>
    </div>}
  </div>
}
