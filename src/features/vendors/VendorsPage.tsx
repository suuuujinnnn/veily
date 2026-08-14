import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Images, Search, Send, Sparkles } from 'lucide-react'
import { useDemoStore } from '../../app/store'
import { Badge, Button } from '../../components/ui'
import { ReferenceBoard } from './ReferenceBoard'
import { ReferenceFinder } from './ReferenceFinder'
import { VendorDatabase } from './VendorDatabase'

type PageMode = 'discovery' | 'board' | 'database'

export function VendorsPage() {
  const navigate = useNavigate()
  const [pageMode, setPageMode] = useState<PageMode>('discovery')
  const [coupleId, setCoupleId] = useState('c1')
  const [shortlist, setShortlist] = useState<string[]>([])
  const [proposalSent, setProposalSent] = useState(false)
  const { couples, vendors, favoriteVendorIds, setRecommendation, toggleFavoriteVendor } = useDemoStore()
  const couple = couples.find((item) => item.id === coupleId) ?? couples[0]

  const selectedVendors = shortlist
    .map((id) => vendors.find((vendor) => vendor.id === id))
    .filter((vendor): vendor is NonNullable<typeof vendor> => Boolean(vendor))

  const toggleShortlist = (vendorId: string) => {
    setProposalSent(false)
    setShortlist((current) => (current.includes(vendorId) ? current.filter((id) => id !== vendorId) : [...current, vendorId].slice(-3)))
  }

  const sendProposal = () => {
    selectedVendors.forEach((vendor) => setRecommendation(coupleId, vendor.id, 'pending'))
    setProposalSent(true)
    window.setTimeout(() => setProposalSent(false), 2800)
  }

  return (
    <div className="page-stack vendors-page vendors-discovery-page">
      <section className="page-intro">
        <div>
          <p className="eyebrow">Partner workspace</p>
          <h1>업체 찾기</h1>
          <p>레퍼런스에서 보이는 구체적인 요소를 조합해, 취향과 가까운 업체를 빠르게 찾아보세요.</p>
        </div>
        <Badge tone="sage">{vendors.length} partners</Badge>
      </section>

      <nav className="workspace-switch">
        <button className={pageMode === 'discovery' ? 'active' : ''} onClick={() => setPageMode('discovery')}><Sparkles size={16} /> 레퍼런스로 찾기</button>
        <button className={pageMode === 'board' ? 'active' : ''} onClick={() => setPageMode('board')}><Images size={16} /> 레퍼런스 보드</button>
        <button className={pageMode === 'database' ? 'active' : ''} onClick={() => setPageMode('database')}><Search size={16} /> 업체 DB</button>
      </nav>

      {pageMode === 'board' && <ReferenceBoard />}
      {pageMode === 'database' && <VendorDatabase />}
      {pageMode === 'discovery' && (
        <>
          <div className="vendors-discovery-couple">
            <label className="couple-result-select">
              <span>제안할 커플</span>
              <select value={coupleId} onChange={(event) => { setCoupleId(event.target.value); setShortlist([]) }}>
                {couples.map((item) => <option value={item.id} key={item.id}>{item.partners}</option>)}
              </select>
            </label>
          </div>

          <ReferenceFinder
            shortlist={shortlist}
            favoriteVendorIds={favoriteVendorIds}
            onToggleShortlist={toggleShortlist}
            onToggleFavorite={toggleFavoriteVendor}
            onOpenVendor={(vendorId) => navigate(`/vendors/${vendorId}`)}
          />

          {selectedVendors.length > 0 && (
            <section className="vendor-shortlist">
              <div>
                <span className="vendor-shortlist__count">{selectedVendors.length}</span>
                <div><strong>{couple.partners}님에게 제안할 업체</strong><p>최대 3곳까지 비교해 보낼 수 있습니다.</p></div>
              </div>
              <div className="vendor-shortlist__chips">
                {selectedVendors.map((vendor) => (
                  <button key={vendor.id} onClick={() => toggleShortlist(vendor.id)}>
                    <span>{vendor.name}</span><small>{vendor.tags[0] ?? '스타일'} 중심</small>×
                  </button>
                ))}
              </div>
              <Button icon={<Send size={15} />} onClick={sendProposal}>신부에게 제안 보내기</Button>
            </section>
          )}
          {proposalSent && (
            <div className="toast vendor-proposal-toast">
              <span>✓</span>
              <div><strong>제안이 고객 화면에 전달됐어요.</strong><p>{selectedVendors.map((vendor) => vendor.name).join(', ')}</p></div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
