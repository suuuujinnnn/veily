import { useMemo, useState } from 'react'
import { AlertTriangle, Check, ChevronDown, Copy, ImageOff, Images, LayoutGrid, RotateCcw, Search, Sparkles, Trash2, X } from 'lucide-react'
import { Badge, Button, Card } from '../../components/ui'
import type { FacetGroup, ReferenceItem } from '../../lib/referenceApi'
import { ReferenceSyncPanel } from './ReferenceSyncPanel'
import { useReferenceSearch } from './useReferenceSearch'

/**
 * 조건으로 여러 업체의 화보를 한 판에 모아 보고, 고객에게 보낼 시안으로 담는 화면.
 *
 * 업체를 찾는 화면(ReferenceSearchPanel)과 목적이 다르다. 여기서는 결과 단위가
 * 업체가 아니라 사진 한 장이고, 사진마다 어느 샵 것인지 태그가 붙는다.
 */
export function ReferenceBoard() {
  const search = useReferenceSearch()
  const [collected, setCollected] = useState<ReferenceItem[]>([])
  const [expandedGroups, setExpandedGroups] = useState<string[]>([])
  const [preview, setPreview] = useState<ReferenceItem | null>(null)
  const [copied, setCopied] = useState(false)
  const [syncOpen, setSyncOpen] = useState(false)

  const result = search.result
  const collectedIds = useMemo(() => new Set(collected.map((item) => item.id)), [collected])

  const vendorSpread = useMemo(() => {
    const counts = new Map<string, number>()
    for (const item of result?.items ?? []) counts.set(item.vendorName, (counts.get(item.vendorName) ?? 0) + 1)
    return [...counts.entries()].sort((a, b) => b[1] - a[1])
  }, [result])

  const toggleCollected = (item: ReferenceItem) => {
    setCopied(false)
    setCollected((current) => (current.some((entry) => entry.id === item.id) ? current.filter((entry) => entry.id !== item.id) : [...current, item]))
  }

  const copyCollected = async () => {
    const text = collected
      .map((item, index) => `${index + 1}. ${item.vendorName} (@${item.vendor}) — ${item.subject}${item.matched.length ? ` [${item.matched.join(', ')}]` : ''}`)
      .join('\n')
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2400)
    } catch {
      setCopied(false)
    }
  }

  const toggleGroup = (label: string) =>
    setExpandedGroups((current) => (current.includes(label) ? current.filter((item) => item !== label) : [...current, label]))

  return (
    <div className="reference-board">
      <section className="reference-board__intro">
        <div>
          <p className="eyebrow">Reference board</p>
          <h2>조건을 고르면 <em>여러 샵의 화보</em>가 한 판에 모입니다</h2>
          <p>“미카도 실크에 탑 디자인”처럼 고객이 말한 조건 그대로 골라, 샵별로 인스타를 뒤지지 않고 시안을 모아 보낼 수 있어요.</p>
        </div>
        <div className="reference-board__stat">
          <span>조건에 맞는 사진</span>
          <strong>{result?.total ?? 0}<small>장</small></strong>
          <em>{vendorSpread.length}개 업체</em>
        </div>
      </section>

      <div className="reference-board__toolbar">
        <div className="reference-board__tabs" role="tablist" aria-label="레퍼런스 분야">
          {(result?.categories ?? []).map((entry) => (
            <button
              key={entry.category}
              role="tab"
              aria-selected={search.category === entry.category}
              className={search.category === entry.category ? 'active' : ''}
              onClick={() => search.setCategory(entry.category)}
            >
              {entry.category}<small>{entry.count}</small>
            </button>
          ))}
        </div>
        <label className="reference-board__search">
          <Search size={16} />
          <input value={search.query} onChange={(event) => search.setQuery(event.target.value)} placeholder="업체명 · 라벨 · 사진 설명 검색" aria-label="레퍼런스 검색" />
          {search.query && <button onClick={() => search.setQuery('')} aria-label="검색어 지우기"><X size={14} /></button>}
        </label>
        {search.hasFilters && <Button size="sm" variant="secondary" icon={<RotateCcw size={14} />} onClick={search.reset}>조건 초기화</Button>}
        <Button
          size="sm"
          variant={syncOpen ? 'dark' : 'ghost'}
          icon={<Sparkles size={14} />}
          aria-expanded={syncOpen}
          onClick={() => setSyncOpen((open) => !open)}
        >
          인스타 동기화
        </Button>
      </div>

      {syncOpen && <ReferenceSyncPanel category={search.category} onClassified={search.retry} />}

      <div className="reference-board__body">
        <aside className="reference-facets" aria-label="검색 조건">
          {(result?.groups ?? []).map((group) => (
            <FacetGroupBlock
              key={group.label}
              group={group}
              filters={search.filters}
              expanded={!group.collapsed || expandedGroups.includes(group.label)}
              onToggleExpand={() => toggleGroup(group.label)}
              onToggleValue={search.toggleFilter}
            />
          ))}
          {!result && !search.error && <div className="reference-facets__skeleton" aria-hidden />}
          <p className="reference-facets__note">같은 묶음 안에서는 하나만 맞아도, 다른 묶음끼리는 모두 맞는 사진을 찾아요.</p>
        </aside>

        <section className="reference-results">
          {search.selectedValues.length > 0 && (
            <div className="reference-results__chips">
              {Object.entries(search.filters).map(([axis, values]) =>
                values.map((value) => (
                  <button key={`${axis}:${value}`} onClick={() => search.toggleFilter(axis, value)}>
                    <small>{axis}</small>{value}<X size={11} />
                  </button>
                )),
              )}
            </div>
          )}

          {search.error ? (
            <Card className="reference-results__empty">
              <AlertTriangle size={22} />
              <strong>{search.error}</strong>
              <p>레퍼런스 검색은 로컬 서버가 필요합니다. <code>cd server &amp;&amp; npm run dev</code> 로 실행한 뒤 다시 시도해 주세요.</p>
              <Button size="sm" variant="secondary" onClick={search.retry}>다시 불러오기</Button>
            </Card>
          ) : result && result.items.length === 0 ? (
            <Card className="reference-results__empty">
              <ImageOff size={22} />
              <strong>이 조건에 맞는 사진이 아직 없어요.</strong>
              <p>조건을 하나 줄이거나, 같은 묶음에서 다른 값을 함께 골라 보세요. 지금 라벨링된 사진은 148장입니다.</p>
              {search.hasFilters && <Button size="sm" variant="secondary" onClick={search.reset}>조건 초기화</Button>}
            </Card>
          ) : (
            <>
              <div className="reference-results__meta">
                <span><LayoutGrid size={13} /> {result?.items.length ?? 0}장 표시 · 업체가 고르게 섞이도록 정렬했어요</span>
                <div className="reference-results__spread">
                  {vendorSpread.slice(0, 6).map(([name, count]) => <em key={name}>{name} {count}</em>)}
                </div>
              </div>
              <div className={`reference-grid ${search.loading ? 'is-loading' : ''}`}>
                {(result?.items ?? []).map((item) => (
                  <ReferenceCard
                    key={item.id}
                    item={item}
                    collected={collectedIds.has(item.id)}
                    onCollect={toggleCollected}
                    onPreview={setPreview}
                  />
                ))}
              </div>
            </>
          )}
        </section>
      </div>

      {collected.length > 0 && (
        <section className="reference-tray" aria-label="담은 시안">
          <div className="reference-tray__head">
            <Images size={16} />
            <div>
              <strong>시안 {collected.length}장</strong>
              <small>{[...new Set(collected.map((item) => item.vendorName))].join(' · ')}</small>
            </div>
          </div>
          <div className="reference-tray__thumbs">
            {collected.map((item) => (
              <button key={item.id} onClick={() => toggleCollected(item)} aria-label={`${item.vendorName} 사진 빼기`}>
                <img src={item.imageUrl} alt="" loading="lazy" />
                <span><X size={11} /></span>
              </button>
            ))}
          </div>
          <div className="reference-tray__actions">
            <Button size="sm" variant="secondary" icon={<Copy size={14} />} onClick={copyCollected}>{copied ? '복사했어요' : '목록 복사'}</Button>
            <Button size="sm" variant="secondary" icon={<Trash2 size={14} />} onClick={() => setCollected([])}>비우기</Button>
          </div>
        </section>
      )}

      {preview && <ReferencePreview item={preview} collected={collectedIds.has(preview.id)} onCollect={toggleCollected} onClose={() => setPreview(null)} />}
    </div>
  )
}

interface FacetGroupBlockProps {
  group: FacetGroup
  filters: Record<string, string[]>
  expanded: boolean
  onToggleExpand: () => void
  onToggleValue: (axis: string, value: string) => void
}

function FacetGroupBlock({ group, filters, expanded, onToggleExpand, onToggleValue }: FacetGroupBlockProps) {
  const selectedCount = group.values.filter((value) => filters[value.axis]?.includes(value.value)).length

  return (
    <div className={`reference-facet-group ${group.kind === 'rollup' ? 'reference-facet-group--rollup' : ''}`}>
      <button className="reference-facet-group__head" onClick={onToggleExpand} aria-expanded={expanded}>
        <span>{group.label}</span>
        {selectedCount > 0 && <b>{selectedCount}</b>}
        {group.collapsed && <ChevronDown size={13} className={expanded ? 'is-open' : ''} />}
      </button>
      {expanded && (
        <div className="reference-facet-group__chips">
          {group.values.map((value) => {
            const selected = filters[value.axis]?.includes(value.value) ?? false
            return (
              <button
                key={`${value.axis}:${value.value}`}
                className={selected ? 'active' : ''}
                aria-pressed={selected}
                onClick={() => onToggleValue(value.axis, value.value)}
                title={`${value.axis} · ${value.value}`}
              >
                {selected && <Check size={11} />}{value.value}<small>{value.count}</small>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

interface ReferenceCardProps {
  item: ReferenceItem
  collected: boolean
  onCollect: (item: ReferenceItem) => void
  onPreview: (item: ReferenceItem) => void
}

function ReferenceCard({ item, collected, onCollect, onPreview }: ReferenceCardProps) {
  return (
    <article className={`reference-card ${collected ? 'reference-card--collected' : ''}`}>
      <button className="reference-card__image" onClick={() => onPreview(item)} aria-label={`${item.vendorName} 사진 크게 보기`}>
        <img src={item.imageUrl} alt={item.subject} loading="lazy" />
        <span className="reference-card__vendor">{item.vendorName}</span>
      </button>
      <div className="reference-card__body">
        <p>{item.subject}</p>
        {item.matched.length > 0 && (
          <div className="reference-card__matched">
            {item.matched.slice(0, 4).map((label) => <span key={label}><Check size={9} />{label}</span>)}
          </div>
        )}
        <button className="reference-card__collect" onClick={() => onCollect(item)} aria-pressed={collected}>
          {collected ? <><Check size={13} /> 시안에 담김</> : '시안 담기'}
        </button>
      </div>
    </article>
  )
}

interface ReferencePreviewProps {
  item: ReferenceItem
  collected: boolean
  onCollect: (item: ReferenceItem) => void
  onClose: () => void
}

function ReferencePreview({ item, collected, onCollect, onClose }: ReferencePreviewProps) {
  return (
    <div className="reference-preview" role="dialog" aria-modal="true" aria-label={`${item.vendorName} 레퍼런스`} onClick={onClose}>
      <div className="reference-preview__panel" onClick={(event) => event.stopPropagation()}>
        <img src={item.imageUrl} alt={item.subject} />
        <div className="reference-preview__info">
          <header>
            <div>
              <strong>{item.vendorName}</strong>
              <a href={`https://www.instagram.com/${item.vendor}/`} target="_blank" rel="noreferrer">@{item.vendor}</a>
            </div>
            <button onClick={onClose} aria-label="닫기"><X size={16} /></button>
          </header>
          <p>{item.subject}</p>
          <dl>
            {Object.entries(item.labels).map(([axis, values]) => (
              <div key={axis}>
                <dt>{axis}</dt>
                <dd>
                  {values.join(', ')}
                  {item.confidence[axis] === '추정' && <Badge tone="amber">추정</Badge>}
                </dd>
              </div>
            ))}
          </dl>
          <Button size="sm" variant={collected ? 'secondary' : 'primary'} onClick={() => onCollect(item)}>
            {collected ? '시안에서 빼기' : '시안 담기'}
          </Button>
        </div>
      </div>
    </div>
  )
}
