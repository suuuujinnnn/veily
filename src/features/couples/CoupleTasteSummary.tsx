import { ExternalLink, Heart } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useDemoStore } from '../../app/store'
import { Card } from '../../components/ui'
import { weddingReferences } from '../../data/weddingReferenceData'

export function CoupleTasteSummary({ coupleId }: { coupleId: string }) {
  const { uploadedReferences, customerReferenceSubmissions } = useDemoStore()
  const submission = customerReferenceSubmissions.find((item) => item.coupleId === coupleId)
  const library = [...uploadedReferences, ...weddingReferences]
  const references = (submission?.selections ?? []).map((selection) => ({ selection, reference: library.find((item) => item.id === selection.referenceId) })).filter((item) => item.reference).slice(0, 4)

  return <Card className="couple-taste-summary"><header><div><p className="eyebrow">Customer taste</p><h2>고객 취향</h2><span>{submission ? `레퍼런스 ${submission.selections.length}개 · ${submission.status}` : '아직 전달된 취향 정보가 없습니다.'}</span></div><Heart size={19} /></header>{submission ? <><div className="couple-taste-summary__body"><div className="couple-taste-summary__images">{references.length ? references.map(({ reference, selection }) => <img src={reference!.image} alt={selection.note || reference!.vendorName} key={selection.referenceId} />) : <div className="couple-taste-summary__empty">선택한 레퍼런스 이미지를 찾을 수 없습니다.</div>}</div><div className="couple-taste-summary__tags">{submission.preferredTags.length ? submission.preferredTags.map((tag) => <span key={tag}>#{tag}</span>) : <small>등록된 취향 태그가 없습니다.</small>}</div></div><footer><span>대표 이미지 {references.length}장 표시</span><Link to={`/vendors?coupleId=${coupleId}`}>전체보기 <ExternalLink size={13} /></Link></footer></> : <div className="couple-taste-summary__empty">고객이 레퍼런스를 제출하면 이곳에 취향이 요약됩니다.</div>}</Card>
}
