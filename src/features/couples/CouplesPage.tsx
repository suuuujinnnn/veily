import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { CalendarDays, ChevronRight, Filter, Plus, Search, SlidersHorizontal } from 'lucide-react'
import { Badge, Button, Progress } from '../../components/ui'
import { useDemoStore } from '../../app/store'

export function CouplesPage() {
  const { couples } = useDemoStore()
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('전체')
  const filtered = useMemo(() => couples.filter((couple) => (status === '전체' || couple.status === status) && couple.partners.includes(query)), [query, status])
  return (
    <div className="page-stack">
      <section className="page-intro"><div><p className="eyebrow">Couple archive</p><h1>커플 관리</h1><p>두 사람의 취향과 준비 과정을 한눈에 관리하세요.</p></div><Link to="/couples/new"><Button icon={<Plus size={16} />}>새 커플 등록</Button></Link></section>
      <div className="toolbar">
        <label className="search-field"><Search size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="이름으로 검색" /></label>
        <div className="filter-tabs" aria-label="상태 필터">{['전체', '집중관리', '준비중', '확정'].map((item) => <button key={item} onClick={() => setStatus(item)} className={status === item ? 'active' : ''}>{item}</button>)}</div>
        <button className="outline-icon-button"><SlidersHorizontal size={16} /> 정렬</button>
      </div>
      <div className="couples-summary"><span><strong>{filtered.length}</strong> couples</span><p><Filter size={14} /> 결혼일이 가까운 순</p></div>
      <div className="couple-grid couple-grid--page">
        {filtered.map((couple, index) => (
          <Link key={couple.id} to={`/couples/${couple.id}`} className={`couple-list-card couple-list-card--${couple.tone}`}>
            <div className="couple-list-card__visual"><span>{String(index + 1).padStart(2, '0')}</span><div className="monogram monogram--large">{couple.initials}</div><small>{couple.concept}</small></div>
            <div className="couple-list-card__body"><div className="couple-list-card__heading"><Badge tone={couple.status === '집중관리' ? 'rose' : couple.status === '확정' ? 'sage' : 'neutral'}>{couple.status}</Badge><ChevronRight size={17} /></div><h2>{couple.partners}</h2><p className="venue-line">{couple.venue}</p><div className="wedding-date"><CalendarDays size={15} /><span>{couple.weddingDate.replaceAll('-', '. ')}</span></div><div className="progress-copy"><span>준비 진행률</span><strong>{couple.progress}%</strong></div><Progress value={couple.progress} /></div>
          </Link>
        ))}
      </div>
    </div>
  )
}
