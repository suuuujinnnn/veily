import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight, Filter, Plus, Search, SlidersHorizontal } from 'lucide-react'
import { Badge, Button } from '../../components/ui'
import { useDemoStore } from '../../app/store'

const TODAY = new Date('2026-08-05T00:00:00')
const displayStatus = (status: string) => status === '확정' ? '완료' : status
const weddingCountdown = (weddingDate: string) => {
  const days = Math.ceil((new Date(`${weddingDate}T00:00:00`).getTime() - TODAY.getTime()) / 86_400_000)
  return days === 0 ? 'D-DAY' : days > 0 ? `D-${days}` : `D+${Math.abs(days)}`
}

export function CouplesPage() {
  const { couples } = useDemoStore()
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('전체')
  const filtered = useMemo(() => couples.filter((couple) => (status === '전체' || displayStatus(couple.status) === status) && couple.partners.includes(query)), [query, status, couples])
  return (
    <div className="page-stack">
      <section className="page-intro"><div><p className="eyebrow">Couple archive</p><h1>커플 관리</h1><p>두 사람의 취향과 준비 과정을 한눈에 관리하세요.</p></div><Button icon={<Plus size={16} />}>새 커플 등록</Button></section>
      <div className="toolbar">
        <label className="search-field"><Search size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="이름으로 검색" /></label>
        <div className="filter-tabs" aria-label="상태 필터">{['전체', '집중관리', '준비중', '완료'].map((item) => <button key={item} onClick={() => setStatus(item)} className={status === item ? 'active' : ''}>{item}</button>)}</div>
        <button className="outline-icon-button"><SlidersHorizontal size={16} /> 정렬</button>
      </div>
      <div className="couples-summary"><span><strong>{filtered.length}</strong> couples</span><p><Filter size={14} /> 결혼일이 가까운 순</p></div>
      <div className="couple-grid couple-grid--page">
        {filtered.map((couple) => (
          <Link key={couple.id} to={`/couples/${couple.id}`} className="couple-compact-card">
            <div className="couple-compact-card__top"><Badge tone={couple.status === '집중관리' ? 'rose' : couple.status === '확정' ? 'sage' : 'neutral'}>{displayStatus(couple.status)}</Badge><ChevronRight size={16} /></div>
            <h2>{couple.partners}</h2>
            <div className="couple-compact-card__date"><span>{couple.weddingDate.replaceAll('-', '.')}</span><strong>{weddingCountdown(couple.weddingDate)}</strong></div>
          </Link>
        ))}
      </div>
    </div>
  )
}
