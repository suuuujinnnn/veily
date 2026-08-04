import { useRef, useState } from 'react'
import { AlertTriangle, CheckCircle2, ChevronRight, FileCheck2, FileText, Search, Upload, WalletCards } from 'lucide-react'
import { Badge, Button, Card, Modal } from '../../components/ui'
import { contracts, couples } from '../../data/mockData'

export function ContractsPage() {
  const [query, setQuery] = useState('')
  const [uploadOpen, setUploadOpen] = useState(false)
  const [uploaded, setUploaded] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const filtered = contracts.filter((contract) => contract.vendorName.includes(query))
  const confirmUpload = () => {
    setUploaded(true)
    window.setTimeout(() => { setUploadOpen(false); setUploaded(false) }, 1500)
  }
  return (
    <div className="page-stack contracts-page">
      <section className="page-intro"><div><p className="eyebrow">Document cabinet</p><h1>계약 관리</h1><p>흩어진 계약서와 결제 조건을 커플별로 정돈하세요.</p></div><Button icon={<Upload size={16} />} onClick={() => setUploadOpen(true)}>계약서 업로드</Button></section>
      <div className="contract-metrics"><Card><span className="metric-icon metric-icon--sage"><FileCheck2 size={20} /></span><div><small>전체 계약</small><strong>12<em>건</em></strong><p>이번 달 +3건</p></div></Card><Card><span className="metric-icon metric-icon--amber"><AlertTriangle size={20} /></span><div><small>확인 필요</small><strong>2<em>건</em></strong><p>VAT 및 구성 확인</p></div></Card><Card><span className="metric-icon metric-icon--rose"><WalletCards size={20} /></span><div><small>결제 대기</small><strong>3<em>건</em></strong><p>합계 7,840,000원</p></div></Card></div>
      <Card padding="none" className="contracts-table-card">
        <div className="table-toolbar"><div><h2>최근 계약</h2><span>{contracts.length}개의 계약서</span></div><label className="search-field"><Search size={15} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="업체명 검색" /></label></div>
        <div className="table-scroll"><table className="data-table"><thead><tr><th>업체 / 구분</th><th>담당 커플</th><th>계약 금액</th><th>결제 조건</th><th>상태</th><th><span className="sr-only">상세</span></th></tr></thead><tbody>{filtered.map((contract) => { const couple = couples.find((item) => item.id === contract.coupleId); return <tr key={contract.id}><td><div className="vendor-cell"><span><FileText size={18} /></span><div><strong>{contract.vendorName}</strong><small>{contract.category}</small></div></div></td><td><strong className="couple-name-cell">{couple?.partners}</strong><small>{couple?.weddingDate.replaceAll('-', '. ')}</small></td><td><strong>{contract.amount}</strong><small>{contract.details}</small></td><td><Badge tone="neutral">{contract.payment}</Badge><small>VAT {contract.vatIncluded ? '포함' : '별도'}</small></td><td><Badge tone={contract.status === '서명완료' ? 'sage' : contract.status === '확인필요' ? 'amber' : 'rose'}>{contract.status}</Badge></td><td><button className="icon-button"><ChevronRight size={17} /></button></td></tr>})}</tbody></table></div>
      </Card>
      <div className="contract-notice"><AlertTriangle size={18} /><div><strong>확인이 필요한 계약이 있어요.</strong><p>르블랑 브라이드 계약서에 VAT 포함 여부가 명시되어 있지 않습니다.</p></div><button>지금 확인하기 <ChevronRight size={14} /></button></div>
      <Modal open={uploadOpen} onClose={() => setUploadOpen(false)} eyebrow="Document upload" title="계약서 사본 등록" footer={<><Button variant="ghost" onClick={() => setUploadOpen(false)}>취소</Button><Button onClick={confirmUpload} disabled={uploaded}>{uploaded ? '분석 완료' : '업로드하기'}</Button></>}>
        {uploaded ? <div className="upload-success"><CheckCircle2 size={35} /><h3>계약 정보를 읽었어요</h3><p>업체명, 금액, 결제 방식과 VAT 항목을 자동으로 정리했습니다.</p></div> : <div className="form-grid"><label className="form-field"><span>담당 커플</span><select>{couples.map((couple) => <option key={couple.id}>{couple.partners}</option>)}</select></label><label className="form-field"><span>계약 구분</span><select><option>드레스</option><option>스튜디오</option><option>메이크업</option><option>웨딩홀</option></select></label><button className="contract-dropzone form-field--wide" onClick={() => fileRef.current?.click()}><input ref={fileRef} type="file" hidden /><Upload size={22} /><strong>PDF 또는 이미지를 선택하세요</strong><small>계약 내용을 자동으로 읽어드려요</small></button></div>}
      </Modal>
    </div>
  )
}
