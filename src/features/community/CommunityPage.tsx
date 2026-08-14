import { useMemo, useState } from 'react'
import { ArrowLeft, ArrowUp, ArrowUpRight, BadgeCheck, BookOpenText, BriefcaseBusiness, Calculator, ChevronRight, Database, Flame, HelpCircle, LayoutGrid, MessageCircle, MessagesSquare, PenLine, Search, ShieldCheck, ThumbsUp, UserRoundCog } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Badge, Button, Card, Modal } from '../../components/ui'
import { communityPosts as initialPosts, vendors } from '../../data/mockData'
import type { CommunityPost } from '../../types'
import { VendorInsightsPanel } from '../reviews/VendorInsightsPanel'

type BoardId = 'home' | 'insights' | '자유게시판' | '현장 노하우' | '견적·계약' | '담당자 소식' | '질문·답변'
type PostBoard = Exclude<BoardId, 'home' | 'insights'>

const boards: Array<{ id: BoardId; label: string; description: string; icon: typeof LayoutGrid }> = [
  { id: 'home', label: '라운지 홈', description: '최근 글과 인기 글', icon: LayoutGrid },
  { id: 'insights', label: '업체 실무 정보', description: '업체별 검증 정보', icon: Database },
  { id: '자유게시판', label: '자유게시판', description: '일상과 가벼운 대화', icon: MessagesSquare },
  { id: '현장 노하우', label: '현장 노하우', description: '체크리스트와 진행 팁', icon: BookOpenText },
  { id: '견적·계약', label: '견적·계약', description: '비용과 계약 정보', icon: Calculator },
  { id: '담당자 소식', label: '담당자 소식', description: '이직·퇴사·스케줄', icon: UserRoundCog },
  { id: '질문·답변', label: '질문·답변', description: '동료에게 묻고 답하기', icon: HelpCircle },
]

const toneFor = (category: string): 'neutral' | 'sage' | 'amber' | 'rose' => category === '질문·답변' ? 'amber' : category === '담당자 소식' ? 'rose' : category === '현장 노하우' ? 'sage' : 'neutral'

export function CommunityPage() {
  const [board, setBoard] = useState<BoardId>('home')
  const [posts, setPosts] = useState<CommunityPost[]>(initialPosts)
  const [selectedId, setSelectedId] = useState('')
  const [query, setQuery] = useState('')
  const [composeOpen, setComposeOpen] = useState(false)
  const [draftBoard, setDraftBoard] = useState<PostBoard>('자유게시판')
  const [draftVendorId, setDraftVendorId] = useState('')
  const [draftTitle, setDraftTitle] = useState('')
  const [draftBody, setDraftBody] = useState('')

  const boardPosts = useMemo(() => posts.filter((post) => (board === 'home' || post.category === board) && (!query.trim() || [post.title, post.excerpt, vendors.find((vendor) => vendor.id === post.vendorId)?.name, ...post.tags].join(' ').toLocaleLowerCase('ko').includes(query.trim().toLocaleLowerCase('ko')))), [board, posts, query])
  const selected = posts.find((post) => post.id === selectedId)
  const hotPosts = [...posts].sort((a, b) => b.helpful + b.replies - (a.helpful + a.replies)).slice(0, 5)

  const openBoard = (id: BoardId) => { setBoard(id); setSelectedId(''); setQuery(''); if (id !== 'home' && id !== 'insights') setDraftBoard(id) }
  const openComposer = () => { if (board !== 'home' && board !== 'insights') setDraftBoard(board); setComposeOpen(true) }
  const submitPost = () => {
    if (!draftTitle.trim() || !draftBody.trim()) return
    const post: CommunityPost = { id: `p-${Date.now()}`, category: draftBoard, vendorId: draftVendorId || undefined, title: draftTitle.trim(), excerpt: draftBody.trim(), author: '익명 플래너', time: '방금 전', replies: 0, helpful: 0, verified: true, tags: draftVendorId ? ['업체연결'] : [draftBoard] }
    setPosts((current) => [post, ...current]); setBoard(draftBoard); setSelectedId(post.id); setDraftVendorId(''); setDraftTitle(''); setDraftBody(''); setComposeOpen(false)
  }

  return <div className="page-stack community-page community-board-page">
    <section className="community-hero community-hero--board"><div><p className="eyebrow">Planner lounge</p><h1>플래너 라운지</h1><p>현장 정보부터 일상 대화까지, 인증 플래너들이 함께 만드는 커뮤니티입니다.</p></div><Button icon={<PenLine size={16} />} onClick={openComposer}>새 글 쓰기</Button><div className="community-hero__seal"><ShieldCheck size={22} /><span>VERIFIED<br />PLANNERS</span></div></section>

    <div className="community-board-layout">
      <aside className="board-directory"><header><strong>게시판</strong><span>{boards.length - 1}</span></header><nav>{boards.map(({ id, label, description, icon: Icon }) => <button className={board === id ? 'active' : ''} onClick={() => openBoard(id)} key={id}><Icon size={16} /><span><strong>{label}</strong><small>{description}</small></span>{id !== 'home' && id !== 'insights' && <em>{posts.filter((post) => post.category === id).length}</em>}</button>)}</nav><div><BadgeCheck size={16} /><p><strong>인증 플래너 커뮤니티</strong><span>작성자 실명과 소속은 공개하지 않습니다.</span></p></div></aside>

      <main className="board-main">
        {board === 'insights' ? <VendorInsightsPanel availableVendors={vendors} canWrite showFilters title="플래너 공개 업체 정보" description="현장에서 확인한 특장점과 유의할 점을 업체별로 확인하고 공유합니다." /> : selected ? <PostDetail post={selected} onBack={() => setSelectedId('')} /> : <>
          <header className="board-main-header"><div><p className="eyebrow">{board === 'home' ? 'Community feed' : 'Board'}</p><h2>{board === 'home' ? '라운지 최신 글' : board}</h2><span>{board === 'home' ? '모든 게시판의 새 글을 시간순으로 모았어요.' : boards.find((item) => item.id === board)?.description}</span></div><Button size="sm" icon={<PenLine size={14} />} onClick={openComposer}>글쓰기</Button></header>
          <div className="board-list-toolbar"><label><Search size={15} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="제목, 내용, 업체 검색" /></label><span>최신순</span></div>
          <div className="board-table"><div className="board-table__head"><span>게시판</span><span>제목</span><span>작성자</span><span>반응</span><span>시간</span></div>{boardPosts.map((post) => { const vendor = vendors.find((item) => item.id === post.vendorId); return <button className="board-row" onClick={() => setSelectedId(post.id)} key={post.id}><Badge tone={toneFor(post.category)}>{post.category}</Badge><div><strong>{post.title}{post.replies > 0 && <em>[{post.replies}]</em>}</strong><small>{vendor ? `${vendor.name} · ` : ''}{post.excerpt}</small></div><span><BadgeCheck size={12} /> {post.author.replace('익명 ', '')}</span><span><ThumbsUp size={12} /> {post.helpful}</span><time>{post.time}</time></button>})}{!boardPosts.length && <div className="board-empty"><Search size={23} /><strong>표시할 글이 없습니다.</strong><span>검색어를 바꾸거나 첫 글을 작성해 주세요.</span></div>}</div>
        </>}
      </main>

      <aside className="community-side"><Card><header><Flame size={16} /><strong>지금 인기 있는 글</strong></header>{hotPosts.map((post, index) => <button key={post.id} onClick={() => { setBoard(post.category as PostBoard); setSelectedId(post.id) }}><i>{index + 1}</i><span><strong>{post.title}</strong><small>{post.category} · 댓글 {post.replies}</small></span></button>)}</Card><Card className="community-side-guide"><BriefcaseBusiness size={18} /><strong>업체 정보는 따로 모아보세요</strong><p>담당자 변경이나 업체 유의사항은 실무 정보 게시판에 구조화해 등록할 수 있어요.</p><button onClick={() => openBoard('insights')}>업체 실무 정보 열기 <ChevronRight size={13} /></button></Card></aside>
    </div>

    <Modal open={composeOpen} onClose={() => setComposeOpen(false)} eyebrow="Planner community" title="플래너 라운지에 글쓰기" footer={<><Button variant="ghost" onClick={() => setComposeOpen(false)}>취소</Button><Button onClick={submitPost}>익명으로 등록</Button></>}><div className="form-grid"><div className="insight-public-notice form-field--wide"><BadgeCheck size={18} /><div><strong>전체 인증 플래너에게 공개됩니다.</strong><span>내용에 맞는 게시판을 선택하면 필요한 동료가 더 쉽게 찾을 수 있어요.</span></div></div><label className="form-field"><span>게시판</span><select value={draftBoard} onChange={(event) => setDraftBoard(event.target.value as PostBoard)}>{boards.filter((item) => !['home','insights'].includes(item.id)).map((item) => <option key={item.id}>{item.label}</option>)}</select></label><label className="form-field"><span>관련 업체 · 선택</span><select value={draftVendorId} onChange={(event) => setDraftVendorId(event.target.value)}><option value="">업체 연결 안 함</option>{vendors.map((vendor) => <option value={vendor.id} key={vendor.id}>{vendor.name} · {vendor.category}</option>)}</select></label><label className="form-field form-field--wide"><span>제목</span><input value={draftTitle} onChange={(event) => setDraftTitle(event.target.value)} placeholder="제목을 입력해 주세요" /></label><label className="form-field form-field--wide"><span>내용</span><textarea rows={7} value={draftBody} onChange={(event) => setDraftBody(event.target.value)} placeholder="동료 플래너들과 나눌 내용을 적어주세요." /></label></div></Modal>
  </div>
}

function PostDetail({ post, onBack }: { post: CommunityPost; onBack: () => void }) {
  const vendor = vendors.find((item) => item.id === post.vendorId)
  return <Card className="board-post-detail"><button className="board-back" onClick={onBack}><ArrowLeft size={14} /> 목록으로</button><div className="board-post-detail__meta"><Badge tone={toneFor(post.category)}>{post.category}</Badge><span>{post.time}</span></div>{vendor && <Link to={`/vendor-database/${vendor.id}`}>{vendor.name} 업체 정보 <ArrowUpRight size={13} /></Link>}<h2>{post.title}</h2><div className="verified-author"><span>익</span><div><strong>{post.author}</strong><small><BadgeCheck size={13} /> 플래너 인증 완료</small></div></div><p className="post-detail__content">{post.excerpt}<br /><br />현장에서 확인한 내용이나 경험을 댓글로 함께 나눠주세요.</p><div className="tag-row">{post.tags.map((tag) => <span key={tag}>#{tag}</span>)}</div><button className="helpful-button"><ThumbsUp size={15} /> 도움돼요 <strong>{post.helpful}</strong></button><div className="reply-divider"><span>댓글 {post.replies}</span></div><div className="sample-reply"><span className="reply-avatar">익</span><div><div><strong>익명 플래너 12</strong><small>32분 전</small></div><p>최근 진행 기준으로 확인한 내용을 공유드립니다. 일정에 따라 달라질 수 있으니 업체에 한 번 더 확인해 주세요.</p><button><ThumbsUp size={12} /> 도움돼요 8</button></div></div><div className="reply-box"><input placeholder="댓글을 입력하세요" /><button aria-label="댓글 등록"><ArrowUp size={16} /></button></div></Card>
}
