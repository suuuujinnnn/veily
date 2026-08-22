import { ExternalLink, Heart, X } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useState } from 'react'
import { useDemoStore } from '../../app/store'
import { Card, Modal } from '../../components/ui'
import { weddingReferences } from '../../data/weddingReferenceData'
import type { WeddingReference } from '../../types'

type SelectedReference = { reference: WeddingReference; note: string }

export function CoupleTasteSummary({ coupleId }: { coupleId: string }) {
  const { uploadedReferences, customerReferenceSubmissions } = useDemoStore()
  const [selectedReference, setSelectedReference] = useState<SelectedReference | null>(null)
  const submission = customerReferenceSubmissions.find((item) => item.coupleId === coupleId)
  const library = [...uploadedReferences, ...weddingReferences]
  const references = (submission?.selections ?? []).map((selection) => ({ selection, reference: library.find((item) => item.id === selection.referenceId) })).filter((item): item is { selection: typeof item.selection; reference: WeddingReference } => Boolean(item.reference)).slice(0, 4)

  return <><Card className="couple-taste-summary"><header><div><p className="eyebrow">Customer taste</p><h2>고객 취향</h2><span>{submission ? `레퍼런스 ${submission.selections.length}개 · ${submission.status}` : '아직 전달된 취향 정보가 없습니다.'}</span></div><Heart size={19} /></header>{submission ? <><div className="couple-taste-summary__body"><div className="couple-taste-summary__images">{references.length ? references.map(({ reference, selection }) => <button type="button" onClick={() => setSelectedReference({ reference, note: selection.note })} key={selection.referenceId}><img src={reference.image} alt={selection.note || reference.vendorName} /></button>) : <div className="couple-taste-summary__empty">선택한 레퍼런스 이미지를 찾을 수 없습니다.</div>}</div><div className="couple-taste-summary__tags">{submission.preferredTags.length ? submission.preferredTags.map((tag) => <span key={tag}>#{tag}</span>) : <small>등록된 취향 태그가 없습니다.</small>}</div></div><footer><span>대표 이미지 {references.length}장 표시</span><Link to={`/vendors?coupleId=${coupleId}`}>전체보기 <ExternalLink size={13} /></Link></footer></> : <div className="couple-taste-summary__empty">고객이 레퍼런스를 제출하면 이곳에 취향이 요약됩니다.</div>}</Card><Modal open={Boolean(selectedReference)} onClose={() => setSelectedReference(null)} eyebrow={selectedReference?.reference.category} title={selectedReference?.reference.vendorName ?? '고객 레퍼런스'}>{selectedReference && <div className="couple-taste-detail"><button type="button" className="couple-taste-detail__close" onClick={() => setSelectedReference(null)} aria-label="레퍼런스 상세 닫기"><X size={16} /></button><img src={selectedReference.reference.image} alt={`${selectedReference.reference.vendorName} 고객 레퍼런스`} /><div><p className="eyebrow">Customer reference detail</p><h3>{selectedReference.reference.vendorName}</h3><p className="couple-taste-detail__note">{selectedReference.note || '고객 메모가 없습니다.'}</p><div className="couple-taste-summary__tags">{selectedReference.reference.tags.map((tag) => <span key={tag}>#{tag}</span>)}</div><dl><div><dt>출처</dt><dd>@{selectedReference.reference.account}</dd></div><div><dt>용도</dt><dd>{selectedReference.reference.purpose}</dd></div></dl></div></div>}</Modal></>
}