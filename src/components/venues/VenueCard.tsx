import { useState } from 'react'
import { Building2, Check, ChevronDown, MapPin, ParkingCircle, TrainFront, UtensilsCrossed } from 'lucide-react'
import { Badge, Button, Card } from '../ui'
import { venueReferences } from '../../data/weddingVenueData'
import type { WeddingVenue } from '../../types'

interface VenueCardProps {
  venue: WeddingVenue
  audience: 'planner' | 'client'
  selected: boolean
  onToggle: () => void
}

export function VenueCard({ venue, audience, selected, onToggle }: VenueCardProps) {
  const [expanded, setExpanded] = useState(false)
  const references = venue.referenceImageIds.map((id) => venueReferences.find((reference) => reference.id === id)).filter(Boolean)
  const nearest = [...venue.accessPoints].sort((a, b) => a.minutes - b.minutes)[0]
  return <Card padding="none" className={`venue-result-card ${selected ? 'selected' : ''}`}>
    <div className="venue-result-card__visual"><img src={references[0]?.image} alt={`${venue.name} 대표 홀`} />{selected && <span><Check size={12} /> {audience === 'planner' ? '추천 전송됨' : '내 취향에 선택'}</span>}<Badge tone="dark">{venue.locality}</Badge></div>
    <div className="venue-result-card__body"><div className="venue-result-card__title"><div><span>{venue.regionGroup} · {venue.venueType}</span><h3>{venue.name}</h3></div><Building2 size={18} /></div><p>{venue.summary}</p><div className="venue-result-facts"><span><MapPin size={13} /><strong>{nearest.name}</strong>{nearest.mode} {nearest.minutes}분</span><span><UtensilsCrossed size={13} /><strong>{venue.mealTypes.join('·')} · {venue.mealPrice.toLocaleString('ko-KR')}원</strong>{venue.mealDetail}</span><span><ParkingCircle size={13} /><strong>주차</strong>{venue.parkingNote}</span></div><div className="venue-access-tags">{venue.accessPoints.map((point) => <em key={point.id}>#{point.tagLabel}</em>)}</div><div className="venue-wish-tags">{venue.wishes.slice(0, 4).map((wish) => <span key={wish}>#{wish}</span>)}</div><div className="venue-result-actions"><button onClick={() => setExpanded((open) => !open)} aria-expanded={expanded}><ChevronDown size={13} className={expanded ? 'open' : ''} /> 사진·교통 상세</button><Button size="sm" variant={selected ? 'secondary' : 'primary'} disabled={audience === 'planner' && selected} onClick={onToggle}>{audience === 'planner' ? selected ? '추천 전송됨' : '고객에게 업체 추천' : selected ? '선택 해제' : '내 취향에 선택'}</Button></div></div>
    {expanded && <div className="venue-result-detail"><div>{references.slice(1).map((reference) => reference && <img key={reference.id} src={reference.image} alt={`${venue.name} 공간 상세`} />)}</div><section><strong><TrainFront size={14} /> 교통 안내</strong>{venue.accessPoints.map((point) => <p key={point.id}>{point.name} · {point.mode} {point.minutes}분</p>)}<p>{venue.shuttleNote}</p><p>{venue.parkingNote}</p></section></div>}
  </Card>
}
