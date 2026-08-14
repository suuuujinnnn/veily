import { useMemo, useRef, useState } from 'react'
import { ArrowDown, ArrowLeft, ArrowUp, Check, Heart, ImagePlus, Search, Send, Sparkles, Trash2, UploadCloud, WandSparkles } from 'lucide-react'
import { useDemoStore } from '../../app/store'
import { Badge, Button, Card, Toast } from '../../components/ui'
import { getReferenceCategory, referenceCategories } from '../../data/referenceKeywordData'
import { weddingReferences } from '../../data/weddingReferenceData'
import type { CustomerReferenceSelection, ReferenceCategory, WeddingReference } from '../../types'

type StartMode = 'intro' | 'inspire' | 'search'

function matchesGroups(category: ReferenceCategory, tags: string[], selected: string[]) {
  if (!selected.length) return true
  return getReferenceCategory(category).groups
    .map((group) => group.keywords.filter((tag) => selected.includes(tag)))
    .filter((group) => group.length)
    .every((group) => group.some((tag) => tags.includes(tag)))
}

export function ClientTasteDiscovery({ coupleId }: { coupleId: string }) {
  const { uploadedReferences, customerReferenceSubmissions, saveCustomerReferenceSubmission } = useDemoStore()
  const existing = customerReferenceSubmissions.find((item) => item.coupleId === coupleId)
  const [mode, setMode] = useState<StartMode>(existing ? 'inspire' : 'intro')
  const [category, setCategory] = useState<ReferenceCategory>('드레스')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [query, setQuery] = useState('')
  const [selections, setSelections] = useState<CustomerReferenceSelection[]>(existing?.selections ?? [])
  const [submitted, setSubmitted] = useState(Boolean(existing))
  const [toast, setToast] = useState('')
  const [uploadedPreview, setUploadedPreview] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)
  const library = useMemo(() => [...uploadedReferences, ...weddingReferences], [uploadedReferences])
  const filtered = useMemo(() => {
    const tokens = query.trim().toLocaleLowerCase('ko').split(/\s+/).filter(Boolean)
    return library
      .filter((item) => item.category === category)
      .filter((item) => mode === 'inspire' || matchesGroups(category, item.tags, selectedTags))
      .filter((item) => !tokens.length || tokens.every((token) => [item.vendorName, ...item.tags].join(' ').toLocaleLowerCase('ko').includes(token)))
  }, [category, library, mode, query, selectedTags])
  const selectedReferences = selections
    .map((selection) => ({ selection, reference: library.find((item) => item.id === selection.referenceId) }))
    .filter((item): item is { selection: CustomerReferenceSelection; reference: WeddingReference } => Boolean(item.reference))
  const tagSummary = useMemo(() => {
    const counts = selectedReferences.flatMap((item) => item.reference.tags).reduce<Record<string, number>>((all, tag) => ({ ...all, [tag]: (all[tag] ?? 0) + 1 }), {})
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([tag]) => tag)
  }, [selectedReferences])
  const categoryCounts = useMemo(() => selectedReferences.reduce<Partial<Record<ReferenceCategory, number>>>((counts, item) => ({ ...counts, [item.reference.category]: (counts[item.reference.category] ?? 0) + 1 }), {}), [selectedReferences])

  const toggleReference = (id: string) => {
    setSubmitted(false)
    setSelections((current) => current.some((item) => item.referenceId === id) ? current.filter((item) => item.referenceId !== id) : [...current, { referenceId: id, note: '' }])
  }
  const move = (index: number, direction: -1 | 1) => {
    const target = index + direction
    if (target < 0 || target >= selections.length) return
    const next = [...selections]
    ;[next[index], next[target]] = [next[target], next[index]]
    setSelections(next)
    setSubmitted(false)
  }
  const updateNote = (referenceId: string, note: string) => {
    setSelections((current) => current.map((item) => item.referenceId === referenceId ? { ...item, note } : item))
    setSubmitted(false)
  }
  const send = () => {
    saveCustomerReferenceSubmission({ id: existing?.id ?? `customer-ref-${coupleId}`, coupleId, selections, preferredTags: tagSummary, categoryCounts, submittedAt: '2026-08-05T10:30:00+09:00', status: existing ? '재전송됨' : '전송완료' })
    setSubmitted(true)
    setToast(existing ? '수정한 취향을 플래너에게 다시 보냈어요.' : '나의 취향을 플래너에게 보냈어요.')
    window.setTimeout(() => setToast(''), 3000)
  }
  const analyzeUpload = (file?: File) => {
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      setUploadedPreview(String(reader.result))
      setSelectedTags(['미카도 실크', '일자탑'])
      setCategory('드레스')
      setToast('이미지에서 미카도 실크와 일자탑을 찾았어요.')
      window.setTimeout(() => setToast(''), 2600)
    }
    reader.readAsDataURL(file)
  }

  if (mode === 'intro') return <section className="portal-subpage portal-taste-page">
    <div className="portal-subpage__intro taste-page-intro"><Badge tone="rose">MY TASTE</Badge><h2>마음에 드는 장면부터 골라보세요</h2><p>정확한 이름을 몰라도 괜찮아요. 선택한 이미지의 공통점을 플래너에게 전달해 드려요.</p></div>
    <div className="taste-start-grid">
      <Card padding="lg"><span className="taste-option-icon"><Sparkles size={21} /></span><Badge tone="neutral">가볍게 시작</Badge><h3>이미지를 보며 발견할래요</h3><p>필터 없이 사진을 둘러보고 마음이 가는 장면을 선택합니다.</p><Button icon={<Heart size={15} />} onClick={() => setMode('inspire')}>이미지 둘러보기</Button></Card>
      <Card padding="lg"><span className="taste-option-icon"><Search size={21} /></span><Badge tone="neutral">조건이 있다면</Badge><h3>원하는 조건으로 찾을래요</h3><p>소재, 공간, 분위기 같은 조건을 조합해 결과를 좁힙니다.</p><Button variant="secondary" icon={<Search size={15} />} onClick={() => setMode('search')}>조건으로 찾기</Button></Card>
    </div>
  </section>

  return <section className="portal-subpage portal-taste-page">
    <header className="taste-workspace-header"><div><Button size="sm" variant="ghost" icon={<ArrowLeft size={14} />} onClick={() => setMode('intro')}>처음으로</Button><p className="eyebrow">My wedding taste</p><h2>{mode === 'inspire' ? '마음이 가는 레퍼런스' : '조건으로 찾는 레퍼런스'}</h2><span>{mode === 'inspire' ? '좋아 보이는 이미지를 편하게 골라보세요.' : '여러 조건을 조합해 원하는 분위기를 찾아보세요.'}</span></div><div className="taste-mode-switch"><Button size="sm" variant={mode === 'inspire' ? 'primary' : 'ghost'} icon={<Sparkles size={14} />} onClick={() => setMode('inspire')}>둘러보기</Button><Button size="sm" variant={mode === 'search' ? 'primary' : 'ghost'} icon={<Search size={14} />} onClick={() => setMode('search')}>조건 찾기</Button></div></header>

    <Card padding="none" className="taste-filter-card">
      <nav className="taste-category-tabs" aria-label="레퍼런스 분야">{referenceCategories.map((item) => <button className={category === item.label ? 'active' : ''} onClick={() => { setCategory(item.label); setSelectedTags([]); setQuery('') }} key={item.label}><span>{item.englishLabel}</span><strong>{item.label}</strong></button>)}</nav>
      {mode === 'search' && <div className="taste-search-tools"><label className="taste-search-input"><Search size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={`${category} 업체명·조건 검색`} />{(query || selectedTags.length > 0) && <button onClick={() => { setQuery(''); setSelectedTags([]) }}>초기화</button>}</label><div className="taste-filter-groups">{getReferenceCategory(category).groups.map((group) => <div key={group.label}><span>{group.label}</span><div>{group.keywords.map((tag) => <button className={selectedTags.includes(tag) ? 'active' : ''} onClick={() => setSelectedTags((current) => current.includes(tag) ? current.filter((item) => item !== tag) : [...current, tag])} key={tag}>{selectedTags.includes(tag) && <Check size={11} />}{tag}</button>)}</div></div>)}</div><div className="taste-upload"><div>{uploadedPreview ? <img src={uploadedPreview} alt="분석한 레퍼런스" /> : <UploadCloud size={19} />}<span><strong>가지고 있는 사진으로 찾기</strong><small>사진에서 후보 키워드를 추출합니다.</small></span></div><Button size="sm" variant="secondary" icon={<ImagePlus size={14} />} onClick={() => fileRef.current?.click()}>이미지 선택</Button><input ref={fileRef} hidden type="file" accept="image/*" onChange={(event) => analyzeUpload(event.target.files?.[0])} /></div></div>}
    </Card>

    <div className="taste-section-heading"><div><p className="eyebrow">References</p><h3>{category} 레퍼런스</h3></div><div><Badge tone="neutral">{filtered.length}장</Badge><Badge tone={selections.length ? 'rose' : 'neutral'}>선택 {selections.length}</Badge></div></div>
    <div className="taste-image-grid">{filtered.map((reference) => { const selected = selections.some((item) => item.referenceId === reference.id); return <Card padding="none" className={`taste-reference-card ${selected ? 'selected' : ''}`} key={reference.id}><button className="taste-reference-image" onClick={() => toggleReference(reference.id)}><img src={reference.image} style={{ objectPosition: reference.imagePosition }} alt={`${reference.category} 취향 레퍼런스`} /><span className="taste-select-mark">{selected ? <><Check size={14} /> 선택됨</> : <><Heart size={14} /> 선택</>}</span></button><div className="taste-reference-info"><strong>{reference.vendorName}</strong><span>{reference.purpose}</span><div>{reference.tags.slice(0, 3).map((tag) => <em key={tag}>#{tag}</em>)}</div></div></Card> })}</div>
    {!filtered.length && <Card className="taste-empty"><WandSparkles size={25} /><h3>조건에 맞는 이미지가 없어요</h3><p>조건을 하나 줄이거나 직접 이미지를 올려보세요.</p></Card>}

    <Card padding="lg" className="taste-moodboard"><header><div><p className="eyebrow">My moodboard</p><h3>내가 고른 장면</h3><span>메모와 함께 플래너에게 전달됩니다.</span></div><Badge tone={selections.length ? 'rose' : 'neutral'}>{selections.length}장 선택</Badge></header>
      {selectedReferences.length ? <><div className="taste-summary"><div><span>취향 키워드</span><p>{tagSummary.map((tag) => <em key={tag}>#{tag}</em>)}</p></div><div><span>분야별 선택</span><p>{Object.entries(categoryCounts).map(([name, count]) => <em key={name}>{name} {count}</em>)}</p></div></div><div className="taste-selected-list">{selectedReferences.map(({ selection, reference }, index) => <article key={reference.id}><img src={reference.image} style={{ objectPosition: reference.imagePosition }} alt="" /><div><span>{reference.category} · {reference.purpose}</span><strong>{reference.vendorName}</strong><textarea value={selection.note} onChange={(event) => updateNote(reference.id, event.target.value)} placeholder="이 이미지에서 마음에 드는 점을 적어주세요." /></div><aside><button disabled={index === 0} aria-label="위로 이동" onClick={() => move(index, -1)}><ArrowUp size={14} /></button><button disabled={index === selectedReferences.length - 1} aria-label="아래로 이동" onClick={() => move(index, 1)}><ArrowDown size={14} /></button><button aria-label="선택 삭제" onClick={() => toggleReference(reference.id)}><Trash2 size={14} /></button></aside></article>)}</div><footer><span>{submitted ? '전달 완료 · 선택을 바꾸면 다시 보낼 수 있어요.' : '선택한 이미지와 메모를 확인해 주세요.'}</span><Button icon={<Send size={15} />} onClick={send}>{existing ? '플래너에게 다시 보내기' : '플래너에게 보내기'}</Button></footer></> : <div className="taste-board-empty"><Heart size={23} /><strong>아직 선택한 이미지가 없어요</strong><p>위 레퍼런스에서 마음에 드는 장면을 골라보세요.</p></div>}
    </Card>
    <Toast open={Boolean(toast)} title={toast} />
  </section>
}
