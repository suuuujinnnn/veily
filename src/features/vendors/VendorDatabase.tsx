import { useMemo, useState, type FormEvent } from 'react'
import { Building2, CalendarClock, Camera as Instagram, Edit3, FolderHeart, FolderPlus, MapPin, Plus } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useDemoStore } from '../../app/store'
import { Badge, Button, Card, Modal } from '../../components/ui'
import { vendorReviewImages } from '../../assets/vendorReviewImages'
import type { Vendor, VendorCategory } from '../../types'
import { vendorStyleTaxonomy, type PartnerCategory } from '../../data/vendorStyleData'
import { isVendorStale } from './vendorInfoUtils'

const categories: ('전체' | VendorCategory)[] = ['전체', '드레스', '헤어&메이크업', '스튜디오', '웨딩홀', '예물', '기타']
const analyzedCategories: VendorCategory[] = ['드레스', '헤어&메이크업', '스튜디오']
const defaultImages: Record<VendorCategory, string> = {
  드레스: vendorReviewImages.laforet___official[0],
  '헤어&메이크업': vendorReviewImages.lkmforetwedding[0],
  스튜디오: vendorReviewImages.cleve_studio[0],
  웨딩홀: vendorReviewImages['studio.goyou'][0],
  예물: vendorReviewImages.louisblanc_official[0],
  기타: vendorReviewImages.yuha_haus[0],
}
const hasDiscoveryStyle = (vendor: Vendor) => analyzedCategories.includes(vendor.category) && vendorStyleTaxonomy[vendor.category as PartnerCategory].some((style) => vendor.tags.includes(style.label))

export const normalizeVendorTags = (value: string) => [...new Set(value.replaceAll('#', '').split(/[\s,]+/).map((tag) => tag.trim()).filter(Boolean))]
const emptyVendor = (): Omit<Vendor, 'id'> => ({ name: '', category: '드레스', summary: '', tags: [], priceRange: '', match: 80, image: defaultImages.드레스, location: '', address: '', hours: '화–일 10:00–19:00', phone: '', instagram: '', activeEvent: '신규 제휴 상담 가능', updatedAt: '2026-08-05', gallery: [defaultImages.드레스, defaultImages.드레스, defaultImages.드레스], website: '', lastContact: '2026-08-10', memo: '', evidenceSource: 'tag' })
export function VendorDatabase({ vendorIds }: { vendorIds: string[] }) {
  const { vendors, vendorCatalogGroups, addVendor, updateVendor, addVendorCatalogGroup, renameVendorCatalogGroup, toggleVendorCatalogItem } = useDemoStore()
  const [activeCatalogId, setActiveCatalogId] = useState('all')
  const [targetCatalogId, setTargetCatalogId] = useState(vendorCatalogGroups[0]?.id ?? '')
  const [catalogOpen, setCatalogOpen] = useState(false)
  const [catalogName, setCatalogName] = useState('')
  const [renameValue, setRenameValue] = useState('')
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState<Vendor | Omit<Vendor, 'id'>>(emptyVendor())
  const [tagInput, setTagInput] = useState('')
  const filtered = useMemo(() => vendors.filter((vendor) => {
    const catalog = vendorCatalogGroups.find((group) => group.id === activeCatalogId)
    return vendorIds.includes(vendor.id) && (!catalog || catalog.vendorIds.includes(vendor.id))
  }), [activeCatalogId, vendorCatalogGroups, vendorIds, vendors])

  const edit = (vendor?: Vendor) => { const next = vendor ?? emptyVendor(); setDraft(next); setTagInput(next.tags.join(', ')); setOpen(true) }
  const changeCategory = (next: VendorCategory) => { const image = defaultImages[next]; setDraft({ ...draft, category: next, operationalDetails: next === draft.category ? draft.operationalDetails : undefined, image: 'id' in draft ? draft.image : image, gallery: 'id' in draft ? draft.gallery : [image, image, image] }) }
  const submit = (event: FormEvent) => {
    event.preventDefault()
    const tags = normalizeVendorTags(tagInput)
    const next = { ...draft, tags, location: draft.location || draft.address.split(' ')[1] || '서울', summary: draft.summary || `${draft.category} 제휴 업체`, evidenceSource: ('id' in draft ? draft.evidenceSource : 'tag') as Vendor['evidenceSource'] }
    if ('id' in next) updateVendor(next); else addVendor(next)
    setOpen(false)
  }
  const createCatalog = (event: FormEvent) => {
    event.preventDefault()
    const name = catalogName.trim()
    if (!name) return
    addVendorCatalogGroup(name)
    setCatalogName('')
    setCatalogOpen(false)
  }
  const activeCatalog = vendorCatalogGroups.find((group) => group.id === activeCatalogId)
  const targetCatalog = vendorCatalogGroups.find((group) => group.id === targetCatalogId)

  return <section className="vendor-db">
    <section className="vendor-catalogs"><div className="vendor-catalogs__head"><div><p className="eyebrow">My catalog</p><h3>나만의 업체 카탈로그</h3><p>투어 후보나 콘셉트별로 업체를 묶어 위시리스트처럼 관리하세요.</p></div><Button variant="secondary" size="sm" icon={<FolderPlus size={15} />} onClick={() => setCatalogOpen(true)}>그룹 만들기</Button></div><div className="vendor-catalogs__tabs"><button className={activeCatalogId === 'all' ? 'active' : ''} onClick={() => setActiveCatalogId('all')}>전체 업체 <span>{vendors.length}</span></button>{vendorCatalogGroups.map((group) => <button className={activeCatalogId === group.id ? 'active' : ''} onClick={() => { setActiveCatalogId(group.id); setTargetCatalogId(group.id); setRenameValue(group.name) }} key={group.id}><FolderHeart size={14} /> {group.name} <span>{group.vendorIds.length}</span></button>)}</div>{activeCatalog && <div className="vendor-catalogs__rename"><label><span>그룹명</span><input value={renameValue || activeCatalog.name} onChange={(event) => setRenameValue(event.target.value)} /></label><Button size="sm" variant="ghost" onClick={() => { const name = (renameValue || activeCatalog.name).trim(); if (name) renameVendorCatalogGroup(activeCatalog.id, name) }}>이름 저장</Button></div>}<div className="vendor-catalogs__target"><span>카드에서 담을 카탈로그</span><select value={targetCatalogId} onChange={(event) => setTargetCatalogId(event.target.value)}>{vendorCatalogGroups.map((group) => <option value={group.id} key={group.id}>{group.name}</option>)}</select></div></section>
    <div className="vendor-db__summary"><div><Building2 size={18} /><span>등록 업체</span><strong>{vendors.length}</strong></div><Button size="sm" icon={<Plus size={14} />} onClick={() => edit()}>업체 추가</Button></div>
    <div className="vendor-db-grid">{filtered.map((vendor) => { const included = Boolean(targetCatalog?.vendorIds.includes(vendor.id)); return <Card key={vendor.id} className="vendor-db-card" padding="none"><div className="vendor-db-card__image"><Link to={`/vendor-database/${vendor.id}`}><img src={vendor.image} alt="" /></Link>{targetCatalog && <button className={`style-favorite-button ${included ? 'active' : ''}`} onClick={() => toggleVendorCatalogItem(targetCatalog.id, vendor.id)} aria-label={`${targetCatalog.name} ${included ? '제거' : '추가'}`}><FolderHeart size={16} fill={included ? 'currentColor' : 'none'} /></button>}</div><div><div className="vendor-db-card__head"><div><Badge tone="neutral">{vendor.category}</Badge><h3><Link to={`/vendor-database/${vendor.id}`}>{vendor.name}</Link></h3></div><button onClick={() => edit(vendor)} aria-label={`${vendor.name} 수정`}><Edit3 size={16} /></button></div><p><MapPin size={14} /> {vendor.address || '주소 미등록'}</p><p><Instagram size={14} /> {vendor.instagram || '인스타그램 미등록'}</p><p><CalendarClock size={14} /> 마지막 업데이트 {vendor.updatedAt.replaceAll('-', '.')}</p>{isVendorStale(vendor) && <Badge tone="amber">1년 이상 미갱신</Badge>}<div className="tag-row">{vendor.tags.map((item) => <span key={item}>#{item}</span>)}</div><div className="vendor-db-card__foot"><strong>{vendor.priceRange || '가격 협의'}</strong>{vendor.evidenceSource === 'tag' && hasDiscoveryStyle(vendor) && <Badge tone="sage">태그 기반 임시</Badge>}</div></div></Card> })}</div>
    <Modal open={catalogOpen} onClose={() => setCatalogOpen(false)} title="카탈로그 그룹 만들기" eyebrow="My catalog" footer={<><Button variant="ghost" onClick={() => setCatalogOpen(false)}>취소</Button><Button type="submit" form="vendor-catalog-form">만들기</Button></>}><form id="vendor-catalog-form" onSubmit={createCatalog}><label className="form-field"><span>그룹명</span><input autoFocus value={catalogName} onChange={(event) => setCatalogName(event.target.value)} placeholder="예: 성수 드레스 투어 후보" /></label></form></Modal>
    <Modal open={open} onClose={() => setOpen(false)} title={'id' in draft ? '업체 수정' : '업체 추가'} eyebrow="Partner database" footer={<><Button variant="ghost" onClick={() => setOpen(false)}>취소</Button><Button type="submit" form="vendor-db-form">저장</Button></>}>
      <form id="vendor-db-form" className="form-grid" onSubmit={submit}>
        <label className="form-field"><span>업체명</span><input required value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} /></label><label className="form-field"><span>카테고리</span><select value={draft.category} onChange={(e) => changeCategory(e.target.value as VendorCategory)}>{categories.slice(1).map((item) => <option key={item}>{item}</option>)}</select></label>
        <label className="form-field"><span>연락처</span><input value={draft.phone} onChange={(e) => setDraft({ ...draft, phone: e.target.value })} /></label><label className="form-field"><span>최근 연락일</span><input type="date" value={draft.lastContact} onChange={(e) => setDraft({ ...draft, lastContact: e.target.value })} /></label>
        <label className="form-field"><span>전체 업데이트</span><input type="date" value={draft.updatedAt} onChange={(e) => setDraft({ ...draft, updatedAt: e.target.value })} /></label>
        <label className="form-field form-field--wide"><span>주소</span><input value={draft.address} onChange={(e) => setDraft({ ...draft, address: e.target.value })} /></label><label className="form-field"><span>인스타그램</span><input value={draft.instagram} onChange={(e) => setDraft({ ...draft, instagram: e.target.value })} /></label><label className="form-field"><span>웹사이트</span><input value={draft.website} onChange={(e) => setDraft({ ...draft, website: e.target.value })} /></label>
        <label className="form-field"><span>가격대</span><input value={draft.priceRange} onChange={(e) => setDraft({ ...draft, priceRange: e.target.value })} /></label><label className="form-field"><span>스타일 태그</span><input value={tagInput} onChange={(e) => setTagInput(e.target.value)} placeholder="#실크, 비즈와레이스" /></label>
        <label className="form-field form-field--wide"><span>메모</span><textarea rows={3} value={draft.memo} onChange={(e) => setDraft({ ...draft, memo: e.target.value })} /></label>
      </form>
    </Modal>
  </section>
}
