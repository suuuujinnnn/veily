import { ClipboardList } from 'lucide-react'
import { Card } from '../../components/ui'
import type { ConsultationCard } from '../../types'

export function CoupleSurveyResponsesPanel({ card }: { card: ConsultationCard }) {
  const responses = Object.entries(card.surveyResponses ?? {})

  return <section className="survey-response-panel"><header className="feature-panel-heading"><div><h2>설문 응답</h2><p>고객이 작성한 원본 응답을 확인합니다.</p></div><span className="survey-response-count"><ClipboardList size={14} />{responses.length}개 항목</span></header><Card className="survey-response-grid">{responses.map(([label, value]) => <div className="survey-response-item" key={label}><dt>{label}</dt><dd>{value || '미정'}</dd></div>)}</Card></section>
}
