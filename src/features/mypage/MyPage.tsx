import { useState } from 'react'
import { BriefcaseBusiness, CalendarDays, Check, Mail, MapPin, Pencil, Phone, UserRound, UsersRound } from 'lucide-react'
import { useDemoStore } from '../../app/store'
import { Badge, Button, Card, Toast } from '../../components/ui'

const initialProfile = {
  name: '이지윤',
  company: 'VEILY Partner',
  email: 'jiyoon@veily.co.kr',
  phone: '010-2847-5902',
  region: '서울 · 경기',
  introduction: '차분하고 꼼꼼한 진행으로 두 분만의 결혼 준비를 함께합니다.',
}

export function MyPage() {
  const { couples, events } = useDemoStore()
  const [profile, setProfile] = useState(initialProfile)
  const [draft, setDraft] = useState(initialProfile)
  const [editing, setEditing] = useState(false)
  const [savedToastOpen, setSavedToastOpen] = useState(false)
  const activeCouples = couples.filter((couple) => couple.status !== '완료' && couple.status !== '취소').length
  const upcomingEvents = events.filter((event) => event.date >= '2026-08-05').length

  const startEditing = () => {
    setDraft(profile)
    setEditing(true)
  }

  const saveProfile = () => {
    setProfile(draft)
    setEditing(false)
    setSavedToastOpen(true)
    window.setTimeout(() => setSavedToastOpen(false), 2400)
  }

  return (
    <div className="mypage-page">
      <header className="mypage-header">
        <div>
          <p className="eyebrow">My page</p>
          <h1>마이페이지</h1>
          <p>플래너 프로필과 담당 현황을 확인합니다.</p>
        </div>
        {editing
          ? <div className="mypage-header__actions"><Button variant="secondary" size="sm" onClick={() => setEditing(false)}>취소</Button><Button size="sm" icon={<Check size={15} />} onClick={saveProfile}>저장</Button></div>
          : <Button variant="secondary" size="sm" icon={<Pencil size={14} />} onClick={startEditing}>프로필 수정</Button>}
      </header>

      <Card className="mypage-profile" padding="lg">
        <div className="mypage-profile__identity">
          <span className="avatar mypage-profile__avatar">YJ</span>
          <div>
            <div className="mypage-profile__name"><h2>{editing ? draft.name : profile.name} 플래너</h2><Badge tone="rose">인증 파트너</Badge></div>
            <p>{editing ? draft.company : profile.company}</p>
          </div>
        </div>
        <div className="mypage-profile__stats" aria-label="담당 현황">
          <span><UsersRound size={17} /><small>진행 고객</small><strong>{activeCouples}<em>팀</em></strong></span>
          <span><CalendarDays size={17} /><small>예정 일정</small><strong>{upcomingEvents}<em>건</em></strong></span>
          <span><BriefcaseBusiness size={17} /><small>파트너 등급</small><strong>Pro</strong></span>
        </div>
      </Card>

      <div className="mypage-content-grid">
        <Card className="mypage-section" padding="lg">
          <header><UserRound size={18} /><div><h2>기본 정보</h2><p>계정과 고객 안내에 사용하는 정보입니다.</p></div></header>
          <div className="mypage-fields">
            <label><span>이름</span>{editing ? <input value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} /> : <strong>{profile.name}</strong>}</label>
            <label><span>소속</span>{editing ? <input value={draft.company} onChange={(event) => setDraft({ ...draft, company: event.target.value })} /> : <strong>{profile.company}</strong>}</label>
            <label><span><Mail size={14} />이메일</span>{editing ? <input type="email" value={draft.email} onChange={(event) => setDraft({ ...draft, email: event.target.value })} /> : <strong>{profile.email}</strong>}</label>
            <label><span><Phone size={14} />연락처</span>{editing ? <input value={draft.phone} onChange={(event) => setDraft({ ...draft, phone: event.target.value })} /> : <strong>{profile.phone}</strong>}</label>
            <label><span><MapPin size={14} />활동 지역</span>{editing ? <input value={draft.region} onChange={(event) => setDraft({ ...draft, region: event.target.value })} /> : <strong>{profile.region}</strong>}</label>
          </div>
        </Card>

        <Card className="mypage-section mypage-section--intro" padding="lg">
          <header><BriefcaseBusiness size={18} /><div><h2>플래너 소개</h2><p>고객에게 보여줄 짧은 소개입니다.</p></div></header>
          {editing
            ? <textarea value={draft.introduction} maxLength={120} onChange={(event) => setDraft({ ...draft, introduction: event.target.value })} />
            : <blockquote>{profile.introduction}</blockquote>}
          <small>{editing ? `${draft.introduction.length}/120` : 'VEILY 공개 프로필에 표시'}</small>
        </Card>
      </div>
      <Toast open={savedToastOpen} title="프로필을 저장했습니다" message="변경한 정보가 마이페이지에 반영되었습니다." />
    </div>
  )
}
