import { useEffect } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Modal } from '../ui'
import type { WeddingReference } from '../../types'

interface ReferenceCarouselModalProps {
  references: WeddingReference[]
  index: number
  onIndexChange: (index: number) => void
  onClose: () => void
}

export function ReferenceCarouselModal({ references, index, onIndexChange, onClose }: ReferenceCarouselModalProps) {
  const reference = references[index]
  const move = (direction: -1 | 1) => {
    if (references.length < 2) return
    onIndexChange((index + direction + references.length) % references.length)
  }

  useEffect(() => {
    if (!reference) return
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') move(-1)
      if (event.key === 'ArrowRight') move(1)
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  })

  return <Modal open={Boolean(reference)} onClose={onClose} title={reference?.vendorName ?? '레퍼런스'} eyebrow={reference?.category}>
    {reference && <div className="reference-preview-modal">
      <div className="reference-preview-modal__visual">
        <img src={reference.image} style={{ objectPosition: reference.imagePosition }} alt={`${reference.vendorName} 레퍼런스 크게 보기`} />
        {references.length > 1 && <><button type="button" className="previous" onClick={() => move(-1)} aria-label="이전 레퍼런스"><ChevronLeft size={22} /></button><button type="button" className="next" onClick={() => move(1)} aria-label="다음 레퍼런스"><ChevronRight size={22} /></button></>}
        <span>{index + 1} / {references.length}</span>
      </div>
      <div><span>@{reference.account}</span><p>{reference.tags.map((tag) => <em key={tag}>#{tag}</em>)}</p></div>
    </div>}
  </Modal>
}
