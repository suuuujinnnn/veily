import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { AlertTriangle, Building2, Camera as Instagram, Heart, ImageOff, Search } from 'lucide-react'
import { useDemoStore } from '../../app/store'
import { Badge, Button, Card } from '../../components/ui'
import { ReferenceApiError, fetchVendors, type VendorSummary } from '../../lib/referenceApi'
import type { Vendor } from '../../types'

const ALL = '전체'

/**
 * 등록된 제휴 업체 목록.
 *
 * 업체 명단의 원본은 서버의 vendorDirectory 다 — 화면에서 추가·수정하지 않는다.
 * 인스타 Graph 를 타지 않으므로 API 호출 한도에 걸려도 목록은 그대로 뜨고,
 * 대표컷은 그 업체의 라벨링된 사진에서 가져온다.
 */
export function VendorDatabase() {
  const { vendors: storeVendors, favoriteVendorIds, toggleFavoriteVendor } = useDemoStore()
  const [vendors, setVendors] = useState<VendorSummary[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState(ALL)
  const [favoriteOnly, setFavoriteOnly] = useState(false)
  const [labelledOnly, setLabelledOnly] = useState(false)
  const [reloadToken, setReloadToken] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    fetchVendors(controller.signal)
      .then((data) => { setVendors(data); setError(null) })
      .catch((cause: unknown) => {
        if (controller.signal.aborted) return
        setError(cause instanceof ReferenceApiError ? cause.message : '업체 목록을 불러오지 못했습니다.')
      })
    return () => controller.abort()
  }, [reloadToken])

  /** 데모 업체 DB 와는 인스타 계정으로 잇는다. 즐겨찾기·상세 페이지가 여기에 걸려 있다. */
  const storeByAccount = useMemo(() => {
    const map = new Map<string, Vendor>()
    for (const vendor of storeVendors) map.set(vendor.instagram.replace(/^@/, '').trim().toLowerCase(), vendor)
    return map
  }, [storeVendors])

  const categories = useMemo(() => [ALL, ...new Set((vendors ?? []).map((vendor) => vendor.category))], [vendors])

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase()
    return (vendors ?? []).filter((vendor) => {
      if (category !== ALL && vendor.category !== category) return false
      if (labelledOnly && vendor.labelledCount === 0) return false
      if (favoriteOnly) {
        const store = storeByAccount.get(vendor.account.toLowerCase())
        if (!store || !favoriteVendorIds.includes(store.id)) return false
      }
      if (!needle) return true
      return `${vendor.name} ${vendor.account} ${vendor.category}`.toLowerCase().includes(needle)
    })
  }, [category, favoriteOnly, favoriteVendorIds, labelledOnly, query, storeByAccount, vendors])

  const labelledTotal = (vendors ?? []).reduce((sum, vendor) => sum + vendor.labelledCount, 0)

  if (error) {
    return (
      <Card className="style-results-empty">
        <AlertTriangle size={22} />
        <strong>{error}</strong>
        <p>업체 목록은 로컬 서버가 필요합니다. <code>cd server &amp;&amp; npm run dev</code> 로 실행한 뒤 다시 시도해 주세요.</p>
        <Button size="sm" variant="secondary" onClick={() => setReloadToken((token) => token + 1)}>다시 불러오기</Button>
      </Card>
    )
  }

  return (
    <section className="vendor-db">
      <div className="vendor-db__toolbar">
        <label className="search-field">
          <Search size={16} />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="업체명 · 인스타 계정 검색" aria-label="업체 검색" />
        </label>
        <select value={category} onChange={(event) => setCategory(event.target.value)} aria-label="분야 선택">
          {categories.map((item) => <option key={item} value={item}>{item}</option>)}
        </select>
      </div>

      <div className="vendor-db__filters">
        <button className={!favoriteOnly && !labelledOnly ? 'active' : ''} onClick={() => { setFavoriteOnly(false); setLabelledOnly(false) }}>전체</button>
        <button className={labelledOnly ? 'active' : ''} onClick={() => { setLabelledOnly((on) => !on); setFavoriteOnly(false) }}>라벨링 완료</button>
        <button className={favoriteOnly ? 'active' : ''} onClick={() => { setFavoriteOnly((on) => !on); setLabelledOnly(false) }}>즐겨찾기</button>
      </div>

      <div className="vendor-db__summary">
        <div><Building2 size={18} /><span>등록 업체</span><strong>{vendors?.length ?? 0}</strong></div>
        <p>조건에 맞는 업체 <strong>{filtered.length}</strong>곳 · 라벨링된 사진 <strong>{labelledTotal}</strong>장</p>
      </div>

      {!vendors ? (
        <div className="vendor-db-grid" aria-busy="true" />
      ) : (
        <div className="vendor-db-grid">
          {filtered.map((vendor) => {
            const store = storeByAccount.get(vendor.account.toLowerCase())
            const favorite = Boolean(store && favoriteVendorIds.includes(store.id))
            return (
              <Card key={vendor.account} className="vendor-db-card" padding="none">
                <div className="vendor-db-card__covers">
                  {vendor.covers.length
                    ? vendor.covers.map((cover) => <img key={cover} src={cover} alt={`${vendor.name} 포트폴리오`} loading="lazy" />)
                    : <div className="vendor-db-card__nocover"><ImageOff size={20} /><span>수집 전</span></div>}
                </div>
                <div>
                  <div className="vendor-db-card__head">
                    <Badge tone="sage">{vendor.category}</Badge>
                    {store && (
                      <button
                        aria-label={`${vendor.name} ${favorite ? '즐겨찾기 해제' : '즐겨찾기'}`}
                        aria-pressed={favorite}
                        onClick={() => toggleFavoriteVendor(store.id)}
                      >
                        <Heart size={15} fill={favorite ? 'currentColor' : 'none'} />
                      </button>
                    )}
                  </div>
                  <h3>{vendor.name}</h3>
                  <p><Instagram size={12} /><a href={vendor.instagramUrl} target="_blank" rel="noreferrer">@{vendor.account}</a></p>
                  <div className="vendor-db-card__foot">
                    <span>라벨링 {vendor.labelledCount}장</span>
                    {store ? <Link to={`/vendors/${store.id}`}>상세 보기</Link> : <span>DB 미등록</span>}
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {vendors && filtered.length === 0 && (
        <Card className="style-results-empty">
          <Search size={22} />
          <strong>조건에 맞는 업체가 없습니다.</strong>
          <p>검색어를 지우거나 분야를 바꿔 보세요.</p>
        </Card>
      )}
    </section>
  )
}
