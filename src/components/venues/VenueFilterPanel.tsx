import { Building2, BusFront, Check, MapPin, RotateCcw, Search, TrainFront, UtensilsCrossed } from 'lucide-react'
import { Button, Card } from '../ui'
import { venueAccessKinds, venueAccessOptions, venueLocations, venueMealTypes, venueTypes, venueWishes, weddingVenues } from '../../data/weddingVenueData'
import type { VenueFilterState, VenueRegionGroup } from '../../types'

interface VenueFilterPanelProps {
  audience: 'planner' | 'client'
  value: VenueFilterState
  resultCount: number
  onChange: (value: VenueFilterState) => void
}

function toggle<T>(values: T[], value: T) {
  return values.includes(value) ? values.filter((item) => item !== value) : [...values, value]
}

export function VenueFilterPanel({ audience, value, resultCount, onChange }: VenueFilterPanelProps) {
  const locationReady = Boolean(value.regionGroup && value.localities.length)
  const availablePoints = weddingVenues
    .filter((venue) => venue.regionGroup === value.regionGroup && value.localities.includes(venue.locality))
    .flatMap((venue) => venue.accessPoints)
    .filter((point, index, all) => all.findIndex((item) => item.id === point.id) === index)
  const setRegion = (regionGroup: VenueRegionGroup) => onChange({ ...value, regionGroup, localities: [], accessKinds: [], accessPointIds: [], accessOptions: [] })
  const set = <K extends keyof VenueFilterState>(key: K, next: VenueFilterState[K]) => onChange({ ...value, [key]: next })

  return <Card padding="none" className={`venue-filter-panel venue-filter-panel--${audience}`}>
    <header className="venue-filter-header"><div><span><Building2 size={17} /></span><div><p className="eyebrow">Venue finder</p><h2>지역부터 정하고 웨딩홀을 찾아보세요</h2><p>{audience === 'planner' ? '고객의 하객 동선과 식사 조건을 먼저 반영합니다.' : '하객이 오기 편한 지역을 먼저 선택해 주세요.'}</p></div></div><div><span>검색 결과</span><strong>{locationReady ? resultCount : '—'}<small>{locationReady ? '곳' : ''}</small></strong></div></header>

    <section className="venue-filter-step active"><header><span>01</span><div><strong>지역</strong><small>필수 선택</small></div><em className={`venue-step-status ${locationReady ? 'selected' : 'required'}`}>{locationReady ? `${value.localities.length}곳 선택` : '먼저 선택'}</em></header><div className="venue-region-tabs">{(['서울', '경기·인천'] as VenueRegionGroup[]).map((region) => <button key={region} className={value.regionGroup === region ? 'active' : ''} onClick={() => setRegion(region)}>{region}</button>)}</div>{value.regionGroup && <div className="venue-filter-chips venue-location-chips">{venueLocations[value.regionGroup].map((locality) => <button key={locality} className={value.localities.includes(locality) ? 'active' : ''} onClick={() => set('localities', toggle(value.localities, locality))}>{value.localities.includes(locality) && <Check size={12} />}{locality}</button>)}</div>}</section>

    <fieldset disabled={!locationReady} className={!locationReady ? 'locked' : ''}>
      <details open className="venue-filter-step"><summary><span>02</span><div><strong>접근성</strong><small>거점과 이동 조건</small></div><TrainFront size={16} /></summary><div className="venue-filter-row"><span>교통수단</span><div className="venue-filter-chips">{venueAccessKinds.map((kind) => <button key={kind} className={value.accessKinds.includes(kind) ? 'active' : ''} onClick={() => set('accessKinds', toggle(value.accessKinds, kind))}>{kind === '터미널' ? <BusFront size={12} /> : <TrainFront size={12} />}{kind}</button>)}</div></div>{availablePoints.length > 0 && <div className="venue-filter-row"><span>가까운 거점</span><div className="venue-filter-chips">{availablePoints.map((point) => <button key={point.id} className={value.accessPointIds.includes(point.id) ? 'active' : ''} onClick={() => set('accessPointIds', toggle(value.accessPointIds, point.id))}>{point.name}</button>)}</div></div>}<div className="venue-filter-row"><span>이동 조건</span><div className="venue-filter-chips">{venueAccessOptions.map((option) => <button key={option} className={value.accessOptions.includes(option) ? 'active' : ''} onClick={() => set('accessOptions', toggle(value.accessOptions, option))}>{option}</button>)}</div></div></details>
      <details open className="venue-filter-step"><summary><span>03</span><div><strong>식사</strong><small>원하는 메뉴 방식</small></div><UtensilsCrossed size={16} /></summary><div className="venue-filter-chips">{venueMealTypes.map((meal) => <button key={meal} className={value.mealTypes.includes(meal) ? 'active' : ''} onClick={() => set('mealTypes', toggle(value.mealTypes, meal))}>{meal}</button>)}</div></details>
      <details open className="venue-filter-step"><summary><span>04</span><div><strong>유형</strong><small>홀의 운영 방식과 컨셉</small></div></summary><div className="venue-filter-chips">{venueTypes.map((type) => <button key={type} className={value.venueTypes.includes(type) ? 'active' : ''} onClick={() => set('venueTypes', toggle(value.venueTypes, type))}>{type}</button>)}</div></details>
      <details open className="venue-filter-step"><summary><span>05</span><div><strong>희망사항</strong><small>공간과 분위기</small></div></summary><div className="venue-filter-chips">{venueWishes.map((wish) => <button key={wish} className={value.wishes.includes(wish) ? 'active' : ''} onClick={() => set('wishes', toggle(value.wishes, wish))}>{wish}</button>)}</div></details>
    </fieldset>

    <footer className="venue-filter-footer"><label><Search size={16} /><input value={value.query} disabled={!locationReady} onChange={(event) => set('query', event.target.value)} placeholder="홀명·지역·역·터미널 검색" /></label><Button size="sm" variant="ghost" icon={<RotateCcw size={13} />} onClick={() => onChange({ regionGroup: '', localities: [], accessKinds: [], accessPointIds: [], accessOptions: [], mealTypes: [], venueTypes: [], wishes: [], query: '' })}>전체 초기화</Button><span><MapPin size={12} /> 같은 단계는 OR, 단계 사이는 AND</span></footer>
  </Card>
}
