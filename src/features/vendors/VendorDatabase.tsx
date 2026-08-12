import { useMemo, useState, type FormEvent } from 'react'
import { Building2, CalendarClock, Camera as Instagram, Edit3, MapPin, Plus, Search } from 'lucide-react'
import { useDemoStore } from '../../app/store'
import { Badge, Button, Card, Modal } from '../../components/ui'
import { vendorReviewImages } from '../../assets/vendorReviewImages'
import type { Vendor, VendorCategory } from '../../types'
import { vendorStyleTaxonomy, type PartnerCategory } from '../../data/vendorStyleData'

const categories: ('전체' | VendorCategory)[] = ['전체', '드레스', '메이크업', '스튜디오', '웨딩홀', '예물', '기타']
const analyzedCategories: VendorCategory[] = ['드레스', '메이크업', '스튜디오']
const defaultImages: Record<VendorCategory, string> = {
  드레스: vendorReviewImages.laforet___official[0],
  메이크업: vendorReviewImages.lkmforetwedding[0],
  스튜디오: vendorReviewImages.cleve_studio[0],
  웨딩홀: vendorReviewImages['studio.goyou'][0],
  예물: vendorReviewImages.louisblanc_official[0],
  기타: vendorReviewImages.yuha_haus[0],
}
const hasDiscoveryStyle = (vendor: Vendor) => analyzedCategories.includes(vendor.category) && vendorStyleTaxonomy[vendor.category as PartnerCategory].some((style) => vendor.tags.includes(style.label))

export const normalizeVendorTags = (value: string) => [...new Set(value.replaceAll('#', '').split(/[\s,]+/).map((tag) => tag.trim()).filter(Boolean))]
const emptyVendor = (): Omit<Vendor, 'id'> => ({ name: '', category: '드레스', summary: '', tags: [], priceRange: '', match: 80, image: defaultImages.드레스, location: '', address: '', hours: '화–일 10:00–19:00', phone: '', instagram: '', activeEvent: '신규 제휴 상담 가능', gallery: [defaultImages.드레스, defaultImages.드레스, defaultImages.드레스], website: '', lastContact: '2026-08-10', memo: '', evidenceSource: 'tag' })

export function VendorDatabase() {
  const { vendors, addVendor, updateVendor } = useDemoStore()
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<'전체' | VendorCategory>('전체')
  const [tag, setTag] = useState('')
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState<Vendor | Omit<Vendor, 'id'>>(emptyVendor())
  const [tagInput, setTagInput] = useState('')
  const filtered = useMemo(() => vendors.filter((vendor) => {
    const haystack = `${vendor.name} ${vendor.instagram} ${vendor.address}`.toLowerCase()
    return (category === '전체' || vendor.category === category) && (!query || haystack.includes(query.toLowerCase())) && (!tag || vendor.tags.some((item) => item.includes(tag)))
  }), [category, query, tag, vendors])

  const edit = (vendor?: Vendor) => { const next = vendor ?? emptyVendor(); setDraft(next); setTagInput(next.tags.join(', ')); setOpen(true) }
  const changeCategory = (next: VendorCategory) => { const image = defaultImages[next]; setDraft({ ...draft, category: next, image: 'id' in draft ? draft.image : image, gallery: 'id' in draft ? draft.gallery : [image, image, image] }) }
  const submit = (event: FormEvent) => {
    event.preventDefault()
    const tags = normalizeVendorTags(tagInput)
    const next = { ...draft, tags, location: draft.location || draft.address.split(' ')[1] || '서울', summary: draft.summary || `${draft.category} 제휴 업체`, evidenceSource: ('id' in draft ? draft.evidenceSource : 'tag') as Vendor['evidenceSource'] }
    if ('id' in next) updateVendor(next); else addVendor(next)
    setOpen(false)
  }

  return <section className="vendor-db">
    <div className="vendor-db__toolbar"><label className="search-field"><Search size={16} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="업체명·주소·인스타 검색" /></label><select value={category} onChange={(event) => setCategory(event.target.value as '전체' | VendorCategory)}>{categories.map((item) => <option key={item}>{item}</option>)}</select><label className="search-field"><span>#</span><input value={tag} onChange={(event) => setTag(event.target.value.replace('#', ''))} placeholder="태그 필터" /></label><Button icon={<Plus size={16} />} onClick={() => edit()}>업체 추가</Button></div>
    <div className="vendor-db__summary"><div><Building2 size={18} /><span>등록 업체</span><strong>{vendors.length}</strong></div><p>현재 조건에 맞는 업체 <strong>{filtered.length}</strong>곳</p></div>
    <div className="vendor-db-grid">{filtered.map((vendor) => <Card key={vendor.id} className="vendor-db-card" padding="none"><img src={vendor.image} alt="" /><div><div className="vendor-db-card__head"><div><Badge tone="neutral">{vendor.category}</Badge><h3>{vendor.name}</h3></div><button onClick={() => edit(vendor)} aria-label={`${vendor.name} 수정`}><Edit3 size={16} /></button></div><p><MapPin size={14} /> {vendor.address || '주소 미등록'}</p><p><Instagram size={14} /> {vendor.instagram || '인스타그램 미등록'}</p><p><CalendarClock size={14} /> 최근 연락 {vendor.lastContact || '기록 없음'}</p><div className="tag-row">{vendor.tags.map((item) => <span key={item}>#{item}</span>)}</div><div className="vendor-db-card__foot"><strong>{vendor.priceRange || '가격 협의'}</strong>{vendor.evidenceSource === 'tag' && hasDiscoveryStyle(vendor) && <Badge tone="sage">태그 기반 임시</Badge>}</div></div></Card>)}</div>
    <Modal open={open} onClose={() => setOpen(false)} title={'id' in draft ? '업체 수정' : '업체 추가'} eyebrow="Partner database" footer={<><Button variant="ghost" onClick={() => setOpen(false)}>취소</Button><Button type="submit" form="vendor-db-form">저장</Button></>}>
      <form id="vendor-db-form" className="form-grid" onSubmit={submit}>
        <label className="form-field"><span>업체명</span><input required value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} /></label><label className="form-field"><span>카테고리</span><select value={draft.category} onChange={(e) => changeCategory(e.target.value as VendorCategory)}>{categories.slice(1).map((item) => <option key={item}>{item}</option>)}</select></label>
        <label className="form-field"><span>연락처</span><input value={draft.phone} onChange={(e) => setDraft({ ...draft, phone: e.target.value })} /></label><label className="form-field"><span>최근 연락일</span><input type="date" value={draft.lastContact} onChange={(e) => setDraft({ ...draft, lastContact: e.target.value })} /></label>
        <label className="form-field form-field--wide"><span>주소</span><input value={draft.address} onChange={(e) => setDraft({ ...draft, address: e.target.value })} /></label><label className="form-field"><span>인스타그램</span><input value={draft.instagram} onChange={(e) => setDraft({ ...draft, instagram: e.target.value })} /></label><label className="form-field"><span>웹사이트</span><input value={draft.website} onChange={(e) => setDraft({ ...draft, website: e.target.value })} /></label>
        <label className="form-field"><span>가격대</span><input value={draft.priceRange} onChange={(e) => setDraft({ ...draft, priceRange: e.target.value })} /></label><label className="form-field"><span>스타일 태그</span><input value={tagInput} onChange={(e) => setTagInput(e.target.value)} placeholder="#실크, 비즈와레이스" /></label>
        <label className="form-field form-field--wide"><span>메모</span><textarea rows={3} value={draft.memo} onChange={(e) => setDraft({ ...draft, memo: e.target.value })} /></label>
      </form>
    </Modal>
  </section>
}
