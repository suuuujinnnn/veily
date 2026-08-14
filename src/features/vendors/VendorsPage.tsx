import { useMemo, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ArrowDown, ArrowUp, Check, CheckCircle2, ExternalLink, FolderHeart, ImagePlus, Link2, Plus, Search, Send, Sparkles, Trash2, UploadCloud } from 'lucide-react'
import { useDemoStore } from '../../app/store'
import { Badge, Button, Card } from '../../components/ui'
import { getReferenceCategory, type ReferenceCategory } from '../../data/referenceKeywordData'
import { weddingReferences } from '../../data/weddingReferenceData'
import type { ReferenceBoard, WeddingReference } from '../../types'
import { ReferenceSearchPanel } from './ReferenceSearchPanel'
import { VendorDatabase } from './VendorDatabase'

type UploadStep = 'idle' | 'analyzing' | 'review'

function matchesSelectedGroups(category: ReferenceCategory, tags: string[], selected: string[]) {
  if (!selected.length) return true
  return getReferenceCategory(category).groups.map((group) => group.keywords.filter((keyword) => selected.includes(keyword))).filter((keywords) => keywords.length).every((keywords) => keywords.some((keyword) => tags.includes(keyword)))
}

function newBoard(coupleId: string, partners: string): ReferenceBoard {
  return { id: `board-${coupleId}`, coupleId, title: `${partners.split(' & ')[0]}님 웨딩 레퍼런스`, memo: '', items: [], status: '작성 중', updatedAt: '2026-08-05' }
}

export function VendorsPage() {
  const [searchParams] = useSearchParams()
  const { couples, vendors, referenceBoards, uploadedReferences, saveReferenceBoard, addUploadedReference, setRecommendation } = useDemoStore()
  const [pageMode, setPageMode] = useState<'references' | 'database'>('references')
  const [category, setCategory] = useState<ReferenceCategory>('드레스')
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>(['미카도 실크', '일자탑'])
  const [query, setQuery] = useState('')
  const [coupleId, setCoupleId] = useState(() => searchParams.get('coupleId') ?? 'c1')
  const [uploadStep, setUploadStep] = useState<UploadStep>('idle')
  const [uploadImage, setUploadImage] = useState('')
  const [uploadVendor, setUploadVendor] = useState('플래너 개인 자료')
  const [uploadAccount, setUploadAccount] = useState('직접 업로드')
  const [uploadTags, setUploadTags] = useState('미카도 실크, 일자탑, A라인')
  const [toast, setToast] = useState('')
  const [draftBoards, setDraftBoards] = useState<Record<string, ReferenceBoard>>({})
  const fileRef = useRef<HTMLInputElement>(null)
  const couple = couples.find((item) => item.id === coupleId) ?? couples[0]
  const savedBoard = referenceBoards.find((item) => item.coupleId === coupleId)
  const board = draftBoards[coupleId] ?? savedBoard ?? newBoard(coupleId, couple.partners)
  const library = useMemo(() => [...uploadedReferences, ...weddingReferences], [uploadedReferences])
  const filteredReferences = useMemo(() => {
    const tokens = query.trim().toLocaleLowerCase('ko').split(/\s+/).filter(Boolean)
    return library.filter((reference) => reference.category === category).filter((reference) => matchesSelectedGroups(category, reference.tags, selectedKeywords)).filter((reference) => !tokens.length || tokens.every((token) => [reference.vendorName, reference.account, ...reference.tags].join(' ').toLocaleLowerCase('ko').includes(token)))
  }, [category, library, query, selectedKeywords])

  const updateBoard = (next: ReferenceBoard, persist = true) => { setDraftBoards((current) => ({ ...current, [coupleId]: next })); if (persist) saveReferenceBoard(next) }
  const toggleKeyword = (keyword: string) => setSelectedKeywords((current) => current.includes(keyword) ? current.filter((item) => item !== keyword) : [...current, keyword])
  const changeCategory = (next: ReferenceCategory) => { setCategory(next); setSelectedKeywords([]); setQuery('') }
  const addToBoard = (referenceId: string) => { if (!board.items.some((item) => item.referenceId === referenceId)) updateBoard({ ...board, items: [...board.items, { referenceId, comment: '' }], status: '작성 중', updatedAt: '2026-08-05' }) }
  const removeFromBoard = (referenceId: string) => updateBoard({ ...board, items: board.items.filter((item) => item.referenceId !== referenceId), status: '작성 중' })
  const moveItem = (index: number, direction: -1 | 1) => { const target = index + direction; if (target < 0 || target >= board.items.length) return; const items = [...board.items]; [items[index], items[target]] = [items[target], items[index]]; updateBoard({ ...board, items, status: '작성 중' }) }
  const editComment = (referenceId: string, comment: string) => updateBoard({ ...board, items: board.items.map((item) => item.referenceId === referenceId ? { ...item, comment } : item), status: '작성 중' }, false)
  const showToast = (message: string, duration = 2500) => { setToast(message); window.setTimeout(() => setToast(''), duration) }
  const shareBoard = () => { updateBoard({ ...board, status: '공유됨', updatedAt: '2026-08-05' }); showToast(`공유 링크가 생성됐어요 · /portal/${coupleId}/references`, 3500) }
  const recommendVendor = (vendorId: string) => { setRecommendation(coupleId, vendorId, 'pending'); showToast('업체를 추천 후보에 추가했어요.') }
  const analyzeUpload = (file?: File) => { if (!file) return; const reader = new FileReader(); reader.onload = () => { setUploadImage(String(reader.result)); setUploadStep('analyzing'); window.setTimeout(() => setUploadStep('review'), 1200) }; reader.readAsDataURL(file) }
  const saveUpload = () => { addUploadedReference({ category, image: uploadImage, vendorName: uploadVendor || '출처 확인 필요', account: uploadAccount || '직접 업로드', tags: uploadTags.split(',').map((tag) => tag.trim()).filter(Boolean), purpose: '상담 레퍼런스', source: '플래너 업로드', reviewStatus: '검수완료' }); setUploadStep('idle'); setUploadImage(''); showToast('검수한 이미지를 아카이브에 추가했어요.') }
  const boardReferences = board.items.map((item) => ({ item, reference: library.find((reference) => reference.id === item.referenceId) })).filter((entry): entry is { item: typeof board.items[number], reference: WeddingReference } => Boolean(entry.reference))

  return <div className="page-stack vendors-page reference-workspace-page">
    <section className="page-intro"><div><p className="eyebrow">Reference workspace</p><h1>레퍼런스 보드</h1><p>여러 샵의 화보를 디자인 조건으로 모아 고객 상담 시안으로 바로 공유하세요.</p></div>{pageMode === 'references' ? <Badge tone="sage">고객별 보드 {referenceBoards.length}개</Badge> : <Badge tone="sage">{vendors.length} partners</Badge>}</section>
    <nav className="workspace-switch"><button className={pageMode === 'references' ? 'active' : ''} onClick={() => setPageMode('references')}><FolderHeart size={16} /> 레퍼런스 찾기</button><button className={pageMode === 'database' ? 'active' : ''} onClick={() => setPageMode('database')}><Search size={16} /> 업체 DB</button></nav>
    {pageMode === 'database' ? <VendorDatabase /> : <>
      <section className="reference-flow"><div className="reference-flow__heading"><span><Sparkles size={16} /></span><div><p className="eyebrow">From search to share</p><h2>상담 자료를 만드는 6단계</h2><p>고객 선택부터 링크 전달까지 한 화면에서 이어집니다.</p></div></div><ol>{['고객 선택', '키워드 조합', '화보 탐색', '보드에 담기', '순서·코멘트', '링크 공유'].map((step, index) => <li className={index === 0 || board.items.length && index < 5 ? 'done' : index === 5 && board.status === '공유됨' ? 'done' : ''} key={step}><span>{index + 1}</span><strong>{step}</strong></li>)}</ol><label><span>상담 고객</span><select value={coupleId} onChange={(event) => setCoupleId(event.target.value)}>{couples.map((item) => <option key={item.id} value={item.id}>{item.partners}</option>)}</select></label></section>
      <section className="reference-upload-bar"><div><span><UploadCloud size={18} /></span><div><strong>아카이브에 없는 사진도 바로 분석</strong><p>AI가 분야와 키워드를 제안하고, 플래너 확인 후 저장합니다.</p></div></div><Button variant="secondary" icon={<ImagePlus size={15} />} onClick={() => fileRef.current?.click()}>직접 업로드</Button><input ref={fileRef} type="file" accept="image/*" hidden onChange={(event) => analyzeUpload(event.target.files?.[0])} /></section>
      {uploadStep !== 'idle' && <Card className="upload-review-card"><div className="upload-review-card__image"><img src={uploadImage} alt="업로드한 레퍼런스" />{uploadStep === 'analyzing' && <span><Sparkles size={15} /> AI 분류 중…</span>}</div><div>{uploadStep === 'analyzing' ? <><p className="eyebrow">Analyzing reference</p><h3>소재·라인·디테일을 나누어 보고 있어요</h3><p>잠시 후 추천 태그를 직접 검수할 수 있습니다.</p></> : <><p className="eyebrow">Planner review required</p><h3>AI 추천 태그를 확인해 주세요</h3><div className="upload-review-fields"><label><span>출처·업체명</span><input value={uploadVendor} onChange={(event) => setUploadVendor(event.target.value)} /></label><label><span>계정 또는 출처</span><input value={uploadAccount} onChange={(event) => setUploadAccount(event.target.value)} /></label><label className="wide"><span>태그 · 쉼표로 구분</span><input value={uploadTags} onChange={(event) => setUploadTags(event.target.value)} /></label></div><div className="upload-review-actions"><Button variant="ghost" onClick={() => setUploadStep('idle')}>취소</Button><Button icon={<Check size={14} />} onClick={saveUpload}>검수 후 저장</Button></div></>}</div></Card>}
      <ReferenceSearchPanel category={category} query={query} selectedKeywords={selectedKeywords} resultCount={filteredReferences.length} onCategoryChange={changeCategory} onQueryChange={setQuery} onKeywordToggle={toggleKeyword} onReset={() => { setSelectedKeywords([]); setQuery('') }} />
      <div className="reference-workspace-grid"><section className="reference-gallery-section"><header><div><p className="eyebrow">Curated image archive</p><h2>{category} 화보 {filteredReferences.length}장</h2><p>{selectedKeywords.length ? `${selectedKeywords.join(' · ')} 조합으로 여러 업체의 개별 화보를 모았어요.` : '검수된 개별 화보를 살펴보세요.'}</p></div><Badge tone="neutral">사진 단위 결과</Badge></header><div className="reference-image-grid">{filteredReferences.map((reference) => { const selected = board.items.some((item) => item.referenceId === reference.id); return <article className={`reference-image-card ${selected ? 'selected' : ''}`} key={reference.id}><div className="reference-image-card__visual"><img src={reference.image} style={{ objectPosition: reference.imagePosition }} alt={`${reference.vendorName} ${reference.category} 레퍼런스`} /><span className="reference-source"><CheckCircle2 size={11} /> {reference.source}</span>{selected && <span className="reference-selected"><Check size={12} /> 보드에 담김</span>}</div><div className="reference-image-card__body"><div className="reference-image-card__vendor"><div><strong>{reference.vendorName}</strong><span>@{reference.account}</span></div>{reference.vendorId && <Link to={`/vendors/${reference.vendorId}`}><ExternalLink size={14} /></Link>}</div><div className="reference-card-keywords">{reference.tags.map((tag) => <span className={selectedKeywords.includes(tag) ? 'matched' : ''} key={tag}>#{tag}</span>)}</div><div className="reference-image-card__actions"><button onClick={() => reference.vendorId && recommendVendor(reference.vendorId)} disabled={!reference.vendorId}>업체 추천 후보</button><Button size="sm" variant={selected ? 'secondary' : 'primary'} icon={selected ? <Trash2 size={13} /> : <Plus size={13} />} onClick={() => selected ? removeFromBoard(reference.id) : addToBoard(reference.id)}>{selected ? '보드에서 빼기' : '보드에 담기'}</Button></div></div></article> })}</div>{!filteredReferences.length && <Card className="style-results-empty"><Search size={22} /><strong>{category === '웨딩홀' ? '웨딩홀 레퍼런스 데이터를 연결 중입니다.' : '조합한 조건의 개별 화보가 없습니다.'}</strong><p>{category === '웨딩홀' ? '직접 업로드한 이미지는 바로 분석·검수해 보드에 담을 수 있어요.' : '같은 분류의 조건을 줄이거나 다른 키워드를 선택해 보세요.'}</p></Card>}</section>
        <aside className="reference-board-editor"><header><div><p className="eyebrow">Client board</p><h2>{couple.partners}</h2></div><Badge tone={board.status === '공유됨' ? 'sage' : 'amber'}>{board.status}</Badge></header><label><span>보드 제목</span><input value={board.title} onChange={(event) => updateBoard({ ...board, title: event.target.value, status: '작성 중' }, false)} onBlur={() => saveReferenceBoard(board)} /></label><label><span>상담 메모</span><textarea value={board.memo} placeholder="고객 요청과 시안 구성 의도를 적어주세요." onChange={(event) => updateBoard({ ...board, memo: event.target.value, status: '작성 중' }, false)} onBlur={() => saveReferenceBoard(board)} /></label><div className="reference-board-editor__count"><strong>선택한 화보</strong><span>{boardReferences.length}장</span></div><div className="reference-board-list">{boardReferences.map(({ item, reference }, index) => <article key={reference.id}><img src={reference.image} style={{ objectPosition: reference.imagePosition }} alt="" /><div><strong>{reference.vendorName}</strong><span>{reference.tags.slice(0, 2).join(' · ')}</span><input value={item.comment} placeholder="사진별 플래너 코멘트" onChange={(event) => editComment(reference.id, event.target.value)} onBlur={() => saveReferenceBoard(board)} /></div><div><button onClick={() => moveItem(index, -1)} disabled={index === 0}><ArrowUp size={13} /></button><button onClick={() => moveItem(index, 1)} disabled={index === boardReferences.length - 1}><ArrowDown size={13} /></button><button onClick={() => removeFromBoard(reference.id)}><Trash2 size={13} /></button></div></article>)}</div>{!boardReferences.length && <div className="reference-board-empty"><FolderHeart size={24} /><strong>아직 담은 화보가 없어요</strong><p>왼쪽 이미지에서 보드에 담기를 눌러주세요.</p></div>}<div className="reference-board-editor__share"><p><Link2 size={13} /> 로그인 없이 보는 고객 전용 링크</p><Button icon={<Send size={14} />} disabled={!board.items.length} onClick={shareBoard}>열람 링크 생성·공유</Button>{board.status === '공유됨' && <Link to={`/portal/${coupleId}/references`}><ExternalLink size={13} /> 고객 화면 미리보기</Link>}</div></aside></div>
    </>}
    {toast && <div className="toast vendor-proposal-toast"><span>✓</span><div><strong>{toast}</strong></div></div>}
  </div>
}
