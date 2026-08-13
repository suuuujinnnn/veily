import { useMemo, useState } from 'react'
import { BadgeCheck, MessageSquareText, PenLine, Sparkles, Star } from 'lucide-react'
import { useDemoStore } from '../../app/store'
import { Badge, Button, Modal, Toast } from '../../components/ui'
import type { Vendor, VendorReview } from '../../types'

type ReviewSort = 'latest' | 'rating'

interface VendorReviewsPanelProps {
  availableVendors: Vendor[]
  vendorId?: string
  canWrite?: boolean
  showFilters?: boolean
  featuredVendorIds?: string[]
  title?: string
  description?: string
}

const average = (reviews: VendorReview[], field: keyof Pick<VendorReview, 'overallRating' | 'responseRating' | 'expertiseRating' | 'punctualityRating'>) =>
  reviews.length ? reviews.reduce((sum, review) => sum + review[field], 0) / reviews.length : 0

function RatingInput({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) {
  return (
    <fieldset className="review-rating-input">
      <legend>{label}</legend>
      <div>{[1, 2, 3, 4, 5].map((score) => <button type="button" key={score} className={score <= value ? 'active' : ''} onClick={() => onChange(score)} aria-label={`${label} ${score}점`}><Star size={19} fill={score <= value ? 'currentColor' : 'none'} /></button>)}</div>
    </fieldset>
  )
}

function ReviewComposer({ open, onClose, onReward, vendors, initialVendorId }: { open: boolean; onClose: () => void; onReward: () => void; vendors: Vendor[]; initialVendorId?: string }) {
  const { addVendorReview } = useDemoStore()
  const [selectedVendorId, setSelectedVendorId] = useState(initialVendorId ?? vendors[0]?.id ?? '')
  const [responseRating, setResponseRating] = useState(5)
  const [expertiseRating, setExpertiseRating] = useState(5)
  const [punctualityRating, setPunctualityRating] = useState(5)
  const [strengths, setStrengths] = useState('')
  const [considerations, setConsiderations] = useState('')
  const [experienceContext, setExperienceContext] = useState('')
  const [error, setError] = useState('')

  const submit = () => {
    if (!selectedVendorId || !experienceContext.trim() || !strengths.trim() || !considerations.trim()) {
      setError('업체와 진행 배경, 장점, 참고사항을 모두 입력해 주세요.')
      return
    }
    addVendorReview({
      vendorId: selectedVendorId,
      overallRating: Math.round(((responseRating + expertiseRating + punctualityRating) / 3) * 10) / 10,
      responseRating,
      expertiseRating,
      punctualityRating,
      strengths: strengths.trim(),
      considerations: considerations.trim(),
      experienceContext: experienceContext.trim(),
      authorLabel: '인증 플래너',
      experienceBand: '경력 5–10년',
    })
    setStrengths('')
    setConsiderations('')
    setExperienceContext('')
    setError('')
    onClose()
    onReward()
  }

  return (
    <Modal open={open} onClose={onClose} eyebrow="Verified planner review" title="제휴업체 공개 리뷰 작성" footer={<><Button variant="ghost" onClick={onClose}>취소</Button><Button onClick={submit}>공개 리뷰 등록</Button></>}>
      <div className="review-compose-form">
        <div className="review-privacy-notice"><BadgeCheck size={17} /><div><strong>인증 플래너 리뷰 · 작성하고 +10P 받기</strong><span>고객에게는 ‘인증 플래너 · 경력 5–10년’으로만 공개됩니다.</span></div></div>
        <label className="form-field form-field--wide"><span>제휴업체</span><select value={selectedVendorId} disabled={Boolean(initialVendorId)} onChange={(event) => setSelectedVendorId(event.target.value)}><option value="">업체를 선택해 주세요</option>{vendors.map((vendor) => <option value={vendor.id} key={vendor.id}>{vendor.name} · {vendor.category}</option>)}</select></label>
        <label className="form-field form-field--wide"><span>진행 배경</span><input value={experienceContext} onChange={(event) => setExperienceContext(event.target.value)} placeholder="예: 2026년 6월 본식 · 실크 선호 신부와 최종 피팅 동행" /></label>
        <div className="review-rating-grid">
          <RatingInput label="응대" value={responseRating} onChange={setResponseRating} />
          <RatingInput label="전문성" value={expertiseRating} onChange={setExpertiseRating} />
          <RatingInput label="일정 준수" value={punctualityRating} onChange={setPunctualityRating} />
        </div>
        <label className="form-field form-field--wide"><span>좋았던 점</span><textarea rows={4} value={strengths} onChange={(event) => setStrengths(event.target.value)} placeholder="고객에게 도움이 된 응대와 전문성을 구체적으로 적어주세요." /></label>
        <label className="form-field form-field--wide"><span>참고할 점</span><textarea rows={3} value={considerations} onChange={(event) => setConsiderations(event.target.value)} placeholder="예약, 일정, 상담 전에 알아두면 좋은 점을 적어주세요." /></label>
        {error && <p className="review-form-error" role="alert">{error}</p>}
      </div>
    </Modal>
  )
}

export function VendorReviewsPanel({ availableVendors, vendorId, canWrite = false, showFilters = false, featuredVendorIds = [], title = '제휴업체 리뷰', description = '인증 플래너가 실제 진행 경험을 바탕으로 남긴 공개 리뷰입니다.' }: VendorReviewsPanelProps) {
  const { vendorReviews } = useDemoStore()
  const [sort, setSort] = useState<ReviewSort>('latest')
  const [category, setCategory] = useState('전체')
  const [filterVendorId, setFilterVendorId] = useState(vendorId ?? '전체')
  const [composeOpen, setComposeOpen] = useState(false)
  const [rewardToast, setRewardToast] = useState(false)
  const showReward = () => { setRewardToast(true); window.setTimeout(() => setRewardToast(false), 2200) }

  const vendorMap = useMemo(() => new Map(availableVendors.map((vendor) => [vendor.id, vendor])), [availableVendors])
  const categories = ['전체', ...new Set(availableVendors.map((vendor) => vendor.category))]
  const reviews = useMemo(() => vendorReviews
    .filter((review) => vendorMap.has(review.vendorId))
    .filter((review) => !vendorId || review.vendorId === vendorId)
    .filter((review) => category === '전체' || vendorMap.get(review.vendorId)?.category === category)
    .filter((review) => filterVendorId === '전체' || review.vendorId === filterVendorId)
    .sort((a, b) => {
      const featuredDifference = Number(featuredVendorIds.includes(b.vendorId)) - Number(featuredVendorIds.includes(a.vendorId))
      if (featuredDifference) return featuredDifference
      return sort === 'rating' ? b.overallRating - a.overallRating : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    }), [category, featuredVendorIds, filterVendorId, sort, vendorId, vendorMap, vendorReviews])

  const allRelevantReviews = vendorReviews.filter((review) => vendorMap.has(review.vendorId) && (!vendorId || review.vendorId === vendorId))
  const overall = average(allRelevantReviews, 'overallRating')

  return (
    <section className="vendor-reviews-panel">
      <header className="vendor-reviews-heading">
        <div><p className="eyebrow">Verified partner reviews</p><h2>{title}</h2><p>{description}</p></div>
        {canWrite && <Button icon={<PenLine size={15} />} onClick={() => setComposeOpen(true)}>리뷰 작성하고 +10P</Button>}
      </header>

      <div className="review-summary">
        <div className="review-summary__score"><span>평균 만족도</span><strong>{allRelevantReviews.length ? overall.toFixed(1) : '—'}</strong><div><Star size={14} fill="currentColor" /> 5점 만점 · {allRelevantReviews.length}개 리뷰</div></div>
        <div className="review-summary__metrics">
          {[['응대', 'responseRating'], ['전문성', 'expertiseRating'], ['일정 준수', 'punctualityRating']].map(([label, field]) => {
            const score = average(allRelevantReviews, field as 'responseRating' | 'expertiseRating' | 'punctualityRating')
            return <div key={field}><span>{label}</span><i><b style={{ width: `${score * 20}%` }} /></i><strong>{allRelevantReviews.length ? score.toFixed(1) : '—'}</strong></div>
          })}
        </div>
        <div className="review-summary__trust"><BadgeCheck size={20} /><div><strong>플래너 인증 리뷰</strong><span>작성자의 실명과 소속은 공개하지 않습니다.</span></div></div>
      </div>

      <div className="review-toolbar">
        {showFilters && <><label><span>분야</span><select value={category} onChange={(event) => { setCategory(event.target.value); setFilterVendorId('전체') }}>{categories.map((item) => <option key={item}>{item}</option>)}</select></label><label><span>업체</span><select value={filterVendorId} onChange={(event) => setFilterVendorId(event.target.value)}><option value="전체">전체 업체</option>{availableVendors.filter((vendor) => category === '전체' || vendor.category === category).map((vendor) => <option value={vendor.id} key={vendor.id}>{vendor.name}</option>)}</select></label></>}
        <label className="review-sort"><span>정렬</span><select value={sort} onChange={(event) => setSort(event.target.value as ReviewSort)}><option value="latest">최신순</option><option value="rating">평점 높은순</option></select></label>
      </div>

      <div className="review-list">
        {reviews.map((review) => {
          const vendor = vendorMap.get(review.vendorId)
          return <article className="review-card" key={review.id}>
            <div className="review-card__top"><div>{showFilters && vendor && <Badge tone="rose">{vendor.name}</Badge>}<span className="review-stars" aria-label={`평점 ${review.overallRating}점`}><Star size={14} fill="currentColor" /><strong>{review.overallRating.toFixed(1)}</strong></span></div><time dateTime={review.createdAt}>{new Intl.DateTimeFormat('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' }).format(new Date(review.createdAt))}</time></div>
            <div className="review-card__ratings"><span>응대 <strong>{review.responseRating.toFixed(1)}</strong></span><span>전문성 <strong>{review.expertiseRating.toFixed(1)}</strong></span><span>일정 준수 <strong>{review.punctualityRating.toFixed(1)}</strong></span></div>
            <p className="review-card__context">{review.experienceContext}</p>
            <div className="review-card__content"><div><strong><Sparkles size={14} /> 좋았던 점</strong><p>{review.strengths}</p></div><div><strong><MessageSquareText size={14} /> 참고할 점</strong><p>{review.considerations}</p></div></div>
            <footer><span><BadgeCheck size={14} /> {review.authorLabel}</span><i /> <span>{review.experienceBand}</span></footer>
          </article>
        })}
        {!reviews.length && <div className="review-empty"><MessageSquareText size={27} /><strong>아직 등록된 리뷰가 없습니다.</strong><p>{canWrite ? '첫 번째 진행 경험을 공유해 주세요.' : '인증 플래너의 리뷰가 등록되면 이곳에서 확인할 수 있어요.'}</p>{canWrite && <Button size="sm" onClick={() => setComposeOpen(true)}>첫 리뷰 작성</Button>}</div>}
      </div>
      {canWrite && <ReviewComposer open={composeOpen} onClose={() => setComposeOpen(false)} onReward={showReward} vendors={availableVendors} initialVendorId={vendorId} />}
      <Toast open={rewardToast} reward title="+10P 적립" message="진행 경험을 공유해 주셔서 감사합니다." />
    </section>
  )
}
