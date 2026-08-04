import { useState } from 'react'
import { ArrowUp, BadgeCheck, ChevronRight, MessageCircle, PenLine, Plus, Search, ShieldCheck, ThumbsUp, X } from 'lucide-react'
import { Badge, Button, Card, Modal } from '../../components/ui'
import { communityPosts } from '../../data/mockData'

export function CommunityPage() {
  const [selectedId, setSelectedId] = useState('p1')
  const [composeOpen, setComposeOpen] = useState(false)
  const [sent, setSent] = useState(false)
  const selected = communityPosts.find((post) => post.id === selectedId) ?? communityPosts[0]
  const submit = () => { setSent(true); window.setTimeout(() => { setSent(false); setComposeOpen(false) }, 1300) }
  return (
    <div className="page-stack community-page">
      <section className="community-hero"><div><p className="eyebrow">Planner lounge</p><h1>우리끼리 더 솔직하게,<br /><em>함께 쌓는 현장의 지혜.</em></h1><p>인증된 웨딩 플래너만 참여하는 익명 커뮤니티입니다.</p></div><Button icon={<PenLine size={16} />} onClick={() => setComposeOpen(true)}>글쓰기</Button><div className="community-hero__seal"><ShieldCheck size={22} /><span>VERIFIED<br />PLANNERS ONLY</span></div></section>
      <div className="community-toolbar"><label className="search-field"><Search size={16} /><input placeholder="업체, 담당자, 키워드 검색" /></label><div className="filter-tabs"><button className="active">전체</button><button>업체 후기</button><button>정보 공유</button><button>질문</button></div></div>
      <div className="community-layout">
        <section className="post-list"><div className="post-list__title"><h2>지금 많이 이야기하고 있어요</h2><span>최신순</span></div>{communityPosts.map((post) => <button key={post.id} onClick={() => setSelectedId(post.id)} className={`post-card ${selectedId === post.id ? 'post-card--selected' : ''}`}><div className="post-card__top"><Badge tone={post.category === '업체 후기' ? 'rose' : post.category === '정보 공유' ? 'sage' : 'amber'}>{post.category}</Badge><span>{post.time}</span></div><h3>{post.title}</h3><p>{post.excerpt}</p><div className="post-card__meta"><span><BadgeCheck size={14} /> {post.author}</span><div><span><MessageCircle size={13} /> {post.replies}</span><span><ThumbsUp size={13} /> {post.helpful}</span></div></div></button>)}</section>
        <Card className="post-detail">
          <div className="post-detail__top"><div><Badge tone="rose">{selected.category}</Badge><span>{selected.time}</span></div><button className="icon-button"><X size={16} /></button></div><h2>{selected.title}</h2><div className="verified-author"><span>익</span><div><strong>{selected.author}</strong><small><BadgeCheck size={13} /> 플래너 인증 완료</small></div></div><p className="post-detail__content">다음 달 고객님과 투어 예정인데 피팅 진행 스타일과 응대가 어떤지 궁금해요.<br /><br />고객님이 결정을 천천히 하시는 편이라 충분히 비교해볼 수 있게 설명해주시는 분이면 좋겠습니다. 최근 진행해보신 분들의 솔직한 후기를 듣고 싶어요.</p><div className="tag-row">{selected.tags.map((tag) => <span key={tag}>#{tag}</span>)}</div><button className="helpful-button"><ThumbsUp size={15} /> 도움돼요 <strong>{selected.helpful}</strong></button><div className="reply-divider"><span>답변 {selected.replies}</span></div><div className="sample-reply"><span className="reply-avatar">익</span><div><div><strong>익명 플래너 12</strong><small>32분 전</small></div><p>지난달에 진행했는데 설명이 차분하고 선택을 재촉하지 않으셨어요. 특히 실크 소재별 차이를 고객 눈높이에 맞게 잘 설명해주셨습니다.</p><button><ThumbsUp size={12} /> 도움돼요 8</button></div></div><button className="more-replies">답변 더 보기 <ChevronRight size={13} /></button><div className="reply-box"><input placeholder="경험을 나눠주세요" /><button aria-label="답변 등록"><ArrowUp size={16} /></button></div>
        </Card>
      </div>
      <Modal open={composeOpen} onClose={() => setComposeOpen(false)} eyebrow="Anonymous post" title="플래너 라운지에 글쓰기" footer={<><Button variant="ghost" onClick={() => setComposeOpen(false)}>취소</Button><Button onClick={submit}>{sent ? '등록 완료' : '익명으로 등록'}</Button></>}>
        {sent ? <div className="upload-success"><BadgeCheck size={36} /><h3>글이 등록되었어요</h3><p>플래너 인증 정보는 공개되지 않습니다.</p></div> : <div className="form-grid"><label className="form-field"><span>카테고리</span><select><option>업체 후기</option><option>정보 공유</option><option>질문</option></select></label><label className="form-field"><span>관련 업체</span><input placeholder="업체명 (선택)" /></label><label className="form-field form-field--wide"><span>제목</span><input placeholder="무엇이 궁금한가요?" /></label><label className="form-field form-field--wide"><span>내용</span><textarea rows={6} placeholder="동료 플래너에게 나누고 싶은 이야기를 적어주세요." /></label></div>}
      </Modal>
    </div>
  )
}
