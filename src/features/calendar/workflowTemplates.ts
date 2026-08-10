import type { EventType } from '../../types'

export interface WorkflowTemplate { id: string; group: string; label: string; type: EventType; duration: number }

export const workflowTemplates: WorkflowTemplate[] = [
  { id: 'hall-tour', group: '웨딩홀', label: '웨딩홀 투어', type: '미팅', duration: 90 },
  { id: 'hall-contract', group: '웨딩홀', label: '웨딩홀 계약', type: '계약', duration: 60 },
  { id: 'final-meeting', group: '웨딩홀', label: '본식 최종 미팅', type: '본식', duration: 60 },
  { id: 'dress-tour', group: '드레스', label: '드레스 투어', type: '드레스', duration: 120 },
  { id: 'dress-photo', group: '드레스', label: '드레스 가봉(촬영)', type: '드레스', duration: 90 },
  { id: 'dress-wedding', group: '드레스', label: '드레스 가봉(본식)', type: '드레스', duration: 90 },
  { id: 'studio-shoot', group: '스튜디오', label: '스튜디오 촬영', type: '스튜디오', duration: 240 },
  { id: 'makeup-consult', group: '메이크업', label: '헤어메이크업 상담', type: '메이크업', duration: 60 },
  { id: 'hair-rehearsal', group: '메이크업', label: '헤어 리허설', type: '메이크업', duration: 90 },
  { id: 'bouquet', group: '기타', label: '부케 상담', type: '미팅', duration: 45 },
  { id: 'jewelry', group: '기타', label: '예물 상담', type: '미팅', duration: 60 },
  { id: 'suit', group: '기타', label: '예복 상담', type: '미팅', duration: 60 },
  { id: 'invitation', group: '기타', label: '청첩장 상담', type: '미팅', duration: 45 },
  { id: 'family', group: '기타', label: '상견례', type: '미팅', duration: 120 },
  { id: 'first-consult', group: '기타', label: '첫 상담', type: '미팅', duration: 60 },
]

export const workflowGroups = [...new Set(workflowTemplates.map((item) => item.group))]
