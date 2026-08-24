import { useRef, useState, type ReactNode } from 'react'
import { CalendarDays, CheckSquare2, Copy, ExternalLink, Eye, ReceiptText } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useDemoStore } from '../../app/store'
import { Badge, Button, Card } from '../../components/ui'
import type { PortalSettings } from '../../types'

const settingItems: { key: Exclude<keyof PortalSettings, 'coupleId'>; title: string; description: string; icon: ReactNode }[] = [
  { key: 'showSchedule', title: '일정 공개', description: '공유 캘린더와 홈의 다음 일정을 표시합니다.', icon: <CalendarDays size={18} /> },
  { key: 'showFullEstimate', title: '견적 전체 공개', description: '계약 업체와 금액·입금 현황을 모두 표시합니다.', icon: <ReceiptText size={18} /> },
  { key: 'showChecklist', title: '체크리스트', description: '할 일 탭과 홈의 미완료 할 일을 표시합니다.', icon: <CheckSquare2 size={18} /> },
]

export function PublicLinkSettings({ coupleId }: { coupleId: string }) {
  const { portalSettings, recommendations, vendors, updatePortalSettings } = useDemoStore()
  const settings = portalSettings.find((item) => item.coupleId === coupleId) ?? { coupleId, showSchedule: true, showFullEstimate: true, showChecklist: true }
  const [feedback, setFeedback] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const url = `${window.location.origin}/client/${coupleId}`
  const recommendedVendors = recommendations.filter((item) => item.coupleId === coupleId).map((item) => vendors.find((vendor) => vendor.id === item.vendorId)).filter((vendor): vendor is NonNullable<typeof vendor> => Boolean(vendor))
  const toggle = (key: Exclude<keyof PortalSettings, 'coupleId'>) => updatePortalSettings({ ...settings, [key]: !settings[key] })
  const copy = async () => {
    try { await navigator.clipboard.writeText(url); setFeedback('링크를 복사했습니다.') }
    catch { inputRef.current?.focus(); inputRef.current?.select(); setFeedback('자동 복사에 실패했습니다. 선택된 주소를 직접 복사해 주세요.') }
  }

  return <div className="public-link-layout">
    <section><div className="feature-panel-heading"><div><p className="eyebrow">Client sharing</p><h2>고객 공개 링크</h2><p>공개 범위를 바꾸면 고객 포털에 즉시 반영됩니다.</p></div><Link to={`/client/${coupleId}`} target="_blank"><Button icon={<ExternalLink size={16} />}>고객 화면 열기</Button></Link></div>
      <Card className="link-copy-card"><label className="form-field"><span>고객 전용 URL</span><div className="copy-field"><input ref={inputRef} readOnly value={url} /><Button variant="secondary" icon={<Copy size={15} />} onClick={copy}>복사</Button></div></label>{feedback && <p className="copy-feedback" role="status">{feedback}</p>}</Card>
      <div className="setting-list">{settingItems.map((item) => <Card key={item.key} className="setting-row"><span className="setting-icon">{item.icon}</span><div><h3>{item.title}</h3><p>{item.description}</p></div><button type="button" role="switch" aria-checked={settings[item.key]} onClick={() => toggle(item.key)} className={`toggle-switch ${settings[item.key] ? 'active' : ''}`}><span /></button></Card>)}</div>
    </section>
    <aside><Card className="portal-live-preview"><div className="preview-title"><span><Eye size={17} /> 실시간 미리보기</span><Badge tone="sage">LIVE</Badge></div><div className="preview-window"><div className="preview-window__top">두 분의 Wedding Desk</div><strong>함께 준비하는 오늘</strong>{settings.showSchedule && <p><CalendarDays size={14} /> 다음 일정 · 드레스 피팅</p>}{settings.showChecklist && <p><CheckSquare2 size={14} /> 미완료 할 일 8개</p>}<p><ReceiptText size={14} /> 견적 {settings.showFullEstimate ? '금액까지 공개' : '상태만 공개'}</p>{recommendedVendors.length > 0 && <div className="preview-vendors"><span>분석 DB 추천 업체</span>{recommendedVendors.slice(0, 3).map((vendor) => <p key={vendor.id}><img src={vendor.image} alt="" /><strong>{vendor.name}</strong><small>{vendor.category} · {vendor.tags[0]}</small></p>)}</div>}</div></Card></aside>
  </div>
}
