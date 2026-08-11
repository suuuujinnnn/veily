import { useMemo, useState } from 'react'
import { ArrowUp, BadgeCheck, ChevronRight, MessageCircle, PenLine, Search, ShieldCheck, ThumbsUp, X } from 'lucide-react'
import { Badge, Button, Card, Modal } from '../../components/ui'
import { communityPosts, vendors } from '../../data/mockData'
import { VendorReviewsPanel } from '../reviews/VendorReviewsPanel'

type LoungeView = 'reviews' | 'all' | '정보 공유' | '질문'

export function CommunityPage() {
  const [view, setView] = useState<LoungeView>('reviews')
  const [selectedId, setSelectedId] = useState('p2')
  const [composeOpen, setComposeOpen] = useState(false)
  const [sent, setSent] = useState(false)
  const posts = useMemo(() => communityPosts.filter((post) => view === 'all' || post.category === view), [view])
  const selected = posts.find((post) => post.id === selectedId) ?? posts[0]
  const changeView = (nextView: LoungeView) => {
    setView(nextView)
    if (nextView !== 'reviews') {
      const nextPosts = communityPosts.filter((post) => nextView === 'all' || post.category === nextView)
      if (nextPosts[0]) setSelectedId(nextPosts[0].id)
    }
  }
  const submit = () => { setSent(true); window.setTimeout(() => { setSent(false); setComposeOpen(false) }, 1300) }

  return (
    <div className="page-stack community-page">
      <section className="community-hero"><div><p className="eyebrow">Planner lounge</p><h1>우리끼리 더 솔직하게,<br /><em>함께 쌓는 현장의 지혜.</em></h1><p>공개 업체 리뷰와 인증 플래너 전용 실무 대화를 한곳에서 나눕니다.</p></div>{view !== 'reviews' && <Button icon={<PenLine size={16} />} onClick={() => setComposeOpen(true)}>글쓰기</Button>}<div className="community-hero__seal"><ShieldCheck size={22} /><span>VERIFIED<br />PLANNERS ONLY</span></div></section>
      <div className="community-toolbar"><label className="search-field"><Search size={16} /><input placeholder="업체, 담당자, 키워드 검색" /></label><div className="filter-tabs"><button className={view === 'reviews' ? 'active' : ''} onClick={() => changeView('reviews')}>공개 업체 리뷰</button><button className={view === 'all' ? 'active' : ''} onClick={() => changeView('all')}>라운지 전체</button><button className={view === '정보 공유' ? 'active' : ''} onClick={() => changeView('정보 공유')}>정보 공유</button><button className={view === '질문' ? 'active' : ''} onClick={() => changeView('질문')}>질문</button></div></div>

      {view === 'reviews' ? <VendorReviewsPanel availableVendors={vendors} canWrite showFilters title="플래너 공개 업체 리뷰" description="여기에 등록한 리뷰는 업체 상세와 고객 포털에도 동일하게 공개됩니다." /> : selected && <div className="community-layout">
        <section className="post-list"><div className="post-list__title"><h2>플래너 실무 이야기</h2><span>최신순</span></div>{posts.map((post) => <button key={post.id} onClick={() => setSelectedId(post.id)} className={`post-card ${selected.id === post.id ? 'post-card--selected' : ''}`}><div className="post-card__top"><Badge tone={post.category === '정보 공유' ? 'sage' : 'amber'}>{post.category}</Badge><span>{post.time}</span></div><h3>{post.title}</h3><p>{post.excerpt}</p><div className="post-card__meta"><span><BadgeCheck size={14} /> {post.author}</span><div><span><MessageCircle size={13} /> {post.replies}</span><span><ThumbsUp size={13} /> {post.helpful}</span></div></div></button>)}</section>
        <Card className="post-detail">
          <div className="post-detail__top"><div><Badge tone={selected.category === '정보 공유' ? 'sage' : 'amber'}>{selected.category}</Badge><span>{selected.time}</span></div><button className="icon-button" aria-label="게시물 닫기"><X size={16} /></button></div><h2>{selected.title}</h2><div className="verified-author"><span>익</span><div><strong>{selected.author}</strong><small><BadgeCheck size={13} /> 플래너 인증 완료</small></div></div><p className="post-detail__content">{selected.excerpt}<br /><br />현장에서 확인한 내용을 동료 플래너들과 나눕니다. 구체적인 조건은 일정과 고객 상황에 따라 달라질 수 있으니 진행 전에 다시 확인해 주세요.</p><div className="tag-row">{selected.tags.map((tag) => <span key={tag}>#{tag}</span>)}</div><button className="helpful-button"><ThumbsUp size={15} /> 도움돼요 <strong>{selected.helpful}</strong></button><div className="reply-divider"><span>답변 {selected.replies}</span></div><div className="sample-reply"><span className="reply-avatar">익</span><div><div><strong>익명 플래너 12</strong><small>32분 전</small></div><p>좋은 정보 감사합니다. 다음 일정 준비 때 체크리스트에 반영해볼게요.</p><button><ThumbsUp size={12} /> 도움돼요 8</button></div></div><button className="more-replies">답변 더 보기 <ChevronRight size={13} /></button><div className="reply-box"><input placeholder="경험을 나눠주세요" /><button aria-label="답변 등록"><ArrowUp size={16} /></button></div>
        </Card>
      </div>}

      <Modal open={composeOpen} onClose={() => setComposeOpen(false)} eyebrow="Anonymous post" title="플래너 라운지에 글쓰기" footer={<><Button variant="ghost" onClick={() => setComposeOpen(false)}>취소</Button><Button onClick={submit}>{sent ? '등록 완료' : '익명으로 등록'}</Button></>}>
        {sent ? <div className="upload-success"><BadgeCheck size={36} /><h3>글이 등록되었어요</h3><p>플래너 인증 정보는 공개되지 않습니다.</p></div> : <div className="form-grid"><label className="form-field"><span>카테고리</span><select defaultValue={view === '질문' ? '질문' : '정보 공유'}><option>정보 공유</option><option>질문</option></select></label><label className="form-field form-field--wide"><span>제목</span><input placeholder="무엇을 나누고 싶으신가요?" /></label><label className="form-field form-field--wide"><span>내용</span><textarea rows={6} placeholder="동료 플래너에게 나누고 싶은 이야기를 적어주세요." /></label></div>}
      </Modal>
    </div>
  )
}
