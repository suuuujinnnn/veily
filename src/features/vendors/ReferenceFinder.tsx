import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { AlertTriangle, Check, CheckCircle2, ChevronRight, Heart, RotateCcw, Search, SlidersHorizontal, X } from 'lucide-react'
import { useDemoStore } from '../../app/store'
import { Button, Card } from '../../components/ui'
import type { ReferenceItem } from '../../lib/referenceApi'
import type { Vendor } from '../../types'
import { useReferenceSearch } from './useReferenceSearch'

/** 업체 단위로 묶으려면 사진이 잘리면 안 된다. 라벨 전량을 받아온다. */
const FETCH_LIMIT = 400
/** 카드 한 장에 붙이는 근거 사진 수. */
const EVIDENCE_COUNT = 4

interface VendorHit {
  account: string
  name: string
  photos: ReferenceItem[]
  /** 선택한 조건 중 이 업체 사진에서 실제로 확인된 값들. */
  matched: string[]
  /** 조건에 맞는 사진 수. 조건이 없으면 라벨링된 전체 사진 수와 같다. */
  hitCount: number
  storeVendor: Vendor | undefined
}

interface ReferenceFinderProps {
  shortlist: string[]
  favoriteVendorIds: string[]
  onToggleShortlist: (vendorId: string) => void
  onToggleFavorite: (vendorId: string) => void
  onOpenVendor: (vendorId: string) => void
}

/**
 * 조건을 조합해 업체를 찾는 화면.
 *
 * 결과 단위가 사진인 레퍼런스 보드와 달리 여기서는 업체다. 서버가 내려준 사진을
 * 업체별로 묶어, 조건에 맞는 사진이 몇 장 나왔는지를 그 업체의 근거로 보여준다.
 * 조건 후보(facet)도 서버가 실제 라벨에서 세어 보낸 값만 쓴다 — 사진이 한 장도
 * 없는 조건은 애초에 화면에 뜨지 않는다.
 */
export function ReferenceFinder({ shortlist, favoriteVendorIds, onToggleShortlist, onToggleFavorite, onOpenVendor }: ReferenceFinderProps) {
  const search = useReferenceSearch('드레스', { pageSize: FETCH_LIMIT })
  const { vendors } = useDemoStore()
  const result = search.result

  /** 인스타 계정으로 데모 업체 DB와 잇는다. 없으면 상세 페이지 링크만 빠진다. */
  const storeByAccount = useMemo(() => {
    const map = new Map<string, Vendor>()
    for (const vendor of vendors) map.set(vendor.instagram.replace(/^@/, '').trim().toLowerCase(), vendor)
    return map
  }, [vendors])

  const hits = useMemo(() => {
    const grouped = new Map<string, VendorHit>()
    for (const item of result?.items ?? []) {
      const hit = grouped.get(item.vendor) ?? {
        account: item.vendor,
        name: item.vendorName,
        photos: [],
        matched: [],
        hitCount: 0,
        storeVendor: storeByAccount.get(item.vendor.toLowerCase()),
      }
      hit.photos.push(item)
      hit.hitCount += 1
      for (const label of item.matched) if (!hit.matched.includes(label)) hit.matched.push(label)
      grouped.set(item.vendor, hit)
    }
    return [...grouped.values()].sort((a, b) => b.matched.length - a.matched.length || b.hitCount - a.hitCount)
  }, [result, storeByAccount])

  return (
    <div className="reference-finder">
      <section className="reference-search-panel">
        <header className="reference-search-panel__header">
          <div>
            <span className="reference-search-panel__kicker"><SlidersHorizontal size={14} /> REFERENCE FINDER</span>
            <h2>말로 설명하기 어려운 취향도<br /><em>조건을 조합해서 찾아보세요</em></h2>
          </div>
          <div className="reference-search-panel__summary">
            <span>조건에 맞는 업체</span>
            <strong>{hits.length}<small>곳</small></strong>
            {search.hasFilters && <button onClick={search.reset}><RotateCcw size={13} /> 조건 초기화</button>}
          </div>
        </header>

        <div className="reference-search-box">
          <Search size={20} />
          <input
            value={search.query}
            onChange={(event) => search.setQuery(event.target.value)}
            placeholder="업체명 · 라벨 · 사진 설명으로 검색"
            aria-label={`${search.category} 업체 검색`}
          />
          {search.query && <button className="reference-search-box__clear" onClick={() => search.setQuery('')} aria-label="검색어 지우기"><X size={15} /></button>}
          <span>라벨링된 실제 포트폴리오에서 검색합니다</span>
        </div>

        <div className="reference-category-tabs reference-category-tabs--plain" role="tablist" aria-label="레퍼런스 분야">
          {(result?.categories ?? []).map((entry) => (
            <button
              key={entry.category}
              role="tab"
              aria-selected={search.category === entry.category}
              className={search.category === entry.category ? 'active' : ''}
              onClick={() => search.setCategory(entry.category)}
            >
              <span><strong>{entry.category}</strong><small>사진 {entry.count}장</small></span>
            </button>
          ))}
        </div>

        <div className="reference-filter-groups">
          {(result?.groups ?? []).map((group) => (
            <div className="reference-filter-group" key={group.label}>
              <div className="reference-filter-group__label"><span>{group.label}</span><small>{group.values.length}</small></div>
              <div className="reference-filter-group__chips">
                {group.values.map((value) => {
                  const selected = search.filters[value.axis]?.includes(value.value) ?? false
                  return (
                    <button
                      key={`${value.axis}:${value.value}`}
                      className={selected ? 'active' : ''}
                      aria-pressed={selected}
                      title={`${value.axis} · ${value.value}`}
                      onClick={() => search.toggleFilter(value.axis, value.value)}
                    >
                      {selected && <Check size={12} />}{value.value}<small>{value.count}</small>
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>

        <footer className="reference-search-panel__footer">
          <span>같은 묶음 안에서는 하나만 맞아도, 서로 다른 묶음은 모두 맞는 업체를 찾아요.</span>
          <div>
            {search.selectedValues.length
              ? Object.entries(search.filters).flatMap(([axis, values]) =>
                  values.map((value) => (
                    <button key={`${axis}:${value}`} onClick={() => search.toggleFilter(axis, value)}>#{value}<X size={11} /></button>
                  )),
                )
              : <small>조건을 고르면 여기에 표시됩니다.</small>}
          </div>
        </footer>
      </section>

      <section className="style-vendor-results">
        <div className="style-results-heading">
          <div>
            <p className="eyebrow">Curated partner archive</p>
            <h2><span>{search.category}</span> 레퍼런스 매칭</h2>
            <p>{search.selectedValues.length ? `${search.selectedValues.join(' · ')} 조건에 맞는 사진을 가진 업체예요.` : '라벨링을 마친 포트폴리오가 있는 업체 전부입니다.'}</p>
          </div>
        </div>

        {search.error ? (
          <Card className="style-results-empty">
            <AlertTriangle size={22} />
            <strong>{search.error}</strong>
            <p>업체 검색은 로컬 서버가 필요합니다. <code>cd server &amp;&amp; npm run dev</code> 로 실행한 뒤 다시 시도해 주세요.</p>
            <Button size="sm" variant="secondary" onClick={search.retry}>다시 불러오기</Button>
          </Card>
        ) : hits.length === 0 ? (
          <Card className="style-results-empty">
            <Search size={22} />
            <strong>{search.hasFilters ? '조합한 조건에 맞는 업체가 없습니다.' : '이 분야는 아직 라벨링된 사진이 없어요.'}</strong>
            <p>{search.hasFilters ? '조건을 하나 줄이거나 다른 값으로 검색해 보세요.' : '인스타 수집과 라벨링이 끝나면 여기에 업체가 나타납니다.'}</p>
            {search.hasFilters && <Button size="sm" variant="secondary" onClick={search.reset}>검색 조건 초기화</Button>}
          </Card>
        ) : (
          <>
            <div className="style-results-toolbar">
              <div><strong>{hits.length}개 업체</strong><span> · 조건에 맞는 사진이 많은 순</span></div>
            </div>
            <div className={`style-vendor-grid ${search.loading ? 'is-loading' : ''}`}>
              {hits.map((hit) => (
                <ReferenceVendorCard
                  key={hit.account}
                  hit={hit}
                  hasFilters={search.hasFilters}
                  selected={Boolean(hit.storeVendor && shortlist.includes(hit.storeVendor.id))}
                  favorite={Boolean(hit.storeVendor && favoriteVendorIds.includes(hit.storeVendor.id))}
                  onOpen={onOpenVendor}
                  onFavorite={onToggleFavorite}
                  onShortlist={onToggleShortlist}
                />
              ))}
            </div>
          </>
        )}
      </section>
    </div>
  )
}

interface ReferenceVendorCardProps {
  hit: VendorHit
  hasFilters: boolean
  selected: boolean
  favorite: boolean
  onOpen: (vendorId: string) => void
  onFavorite: (vendorId: string) => void
  onShortlist: (vendorId: string) => void
}

function ReferenceVendorCard({ hit, hasFilters, selected, favorite, onOpen, onFavorite, onShortlist }: ReferenceVendorCardProps) {
  const store = hit.storeVendor
  const evidence = hit.photos.slice(0, EVIDENCE_COUNT)
  const open = () => store && onOpen(store.id)

  return (
    <article
      className={`style-vendor-card ${selected ? 'style-vendor-card--selected' : ''}`}
      {...(store ? { role: 'link', tabIndex: 0, onClick: open, onKeyDown: (event: React.KeyboardEvent) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); open() } }, 'aria-label': `${hit.name} 상세 보기` } : {})}
    >
      <div className="style-vendor-card__image style-vendor-card__image--mosaic">
        {evidence.map((photo) => (
          <img key={photo.id} src={photo.imageUrl} alt={photo.subject} loading="lazy" />
        ))}
        {store && (
          <button
            className={`style-favorite-button ${favorite ? 'active' : ''}`}
            aria-label={`${hit.name} ${favorite ? '즐겨찾기 해제' : '즐겨찾기'}`}
            aria-pressed={favorite}
            onClick={(event) => { event.stopPropagation(); onFavorite(store.id) }}
          >
            <Heart size={16} fill={favorite ? 'currentColor' : 'none'} />
          </button>
        )}
      </div>
      <div className="style-vendor-card__body">
        <div className="style-vendor-card__meta">
          <span>{hit.photos[0]?.vendorType ?? ''}{store ? ` · ${store.location}` : ''}</span>
        </div>
        <h3>{hit.name}</h3>
        <a href={`https://www.instagram.com/${hit.account}/`} target="_blank" rel="noreferrer" onClick={(event) => event.stopPropagation()}>@{hit.account}</a>
        <p>{hit.photos[0]?.subject ?? ''}</p>

        <div className="reference-card-keywords">
          {(hit.matched.length ? hit.matched : labelSummary(hit)).slice(0, 6).map((label) => (
            <span key={label} className={hit.matched.includes(label) ? 'matched' : ''}>
              {hit.matched.includes(label) && <Check size={10} />}#{label}
            </span>
          ))}
        </div>

        <div className="style-evidence">
          <div><span>{hasFilters ? '조건에 맞는 사진' : '라벨링된 사진'}</span><strong>{hit.hitCount}장</strong></div>
          <div><span>확인된 조건</span><strong>{hit.matched.length}개</strong></div>
        </div>

        <div className="style-vendor-card__actions">
          {store
            ? <Link to={`/vendors/${store.id}`} onClick={(event) => event.stopPropagation()}>상세 보기 <ChevronRight size={13} /></Link>
            : <span className="style-vendor-card__nodetail">업체 DB 미등록</span>}
          {store && (
            <Button
              size="sm"
              variant={selected ? 'secondary' : 'primary'}
              icon={selected ? <CheckCircle2 size={14} /> : undefined}
              onClick={(event) => { event.stopPropagation(); onShortlist(store.id) }}
            >
              {selected ? '후보에 담김' : '제안 후보 담기'}
            </Button>
          )}
        </div>
      </div>
    </article>
  )
}

/** 조건을 안 골랐을 때 보여줄 대표 라벨. 그 업체 사진에 가장 자주 나온 값 순이다. */
function labelSummary(hit: VendorHit): string[] {
  const counts = new Map<string, number>()
  for (const photo of hit.photos) {
    for (const values of Object.values(photo.labels)) {
      for (const value of values) counts.set(value, (counts.get(value) ?? 0) + 1)
    }
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1]).map(([value]) => value)
}
