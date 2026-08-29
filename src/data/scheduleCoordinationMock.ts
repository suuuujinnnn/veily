import type { CalendarWorkCategory, EventType } from '../types'

export type MockCoordinationStatus = 'awaiting-client' | 'client-responded' | 'confirmed' | 'cancelled'
export interface MockCandidateSlot { id: string; date: string; time: string; endTime: string }
export interface MockCoordinationResponse { selectedSlotIds: string[]; noneAvailable: boolean; note: string; respondedAt: string }
export interface MockCoordinationRequest {
  id: string; coupleId: string; vendorId: string; workflowId: string; title: string; type: EventType; calendarCategory: CalendarWorkCategory
  location: string; durationMinutes: number; slots: MockCandidateSlot[]; status: MockCoordinationStatus
  sentAt: string; response?: MockCoordinationResponse
}

export const mockScheduleCoordinationRequests: MockCoordinationRequest[] = [
  {
    id: 'coord-dress-c1', coupleId: 'c1', vendorId: 'vp-d4', workflowId: 'dress-tour', title: '라포레 드레스 투어', type: '드레스', calendarCategory: 'tour', location: '라포레, 청담동', durationMinutes: 120, status: 'client-responded', sentAt: '2026-08-04T09:00:00+09:00',
    slots: [
      { id: 'coord-dress-c1-s1', date: '2026-08-12', time: '11:00', endTime: '13:00' },
      { id: 'coord-dress-c1-s2', date: '2026-08-12', time: '16:00', endTime: '18:00' },
      { id: 'coord-dress-c1-s3', date: '2026-08-14', time: '14:00', endTime: '16:00' },
    ], response: { selectedSlotIds: ['coord-dress-c1-s2', 'coord-dress-c1-s3'], noneAvailable: false, note: '12일은 오후, 14일은 언제든 괜찮아요.', respondedAt: '2026-08-05T09:20:00+09:00' },
  },
  {
    id: 'coord-makeup-c1', coupleId: 'c1', vendorId: 'vp-m3', workflowId: 'makeup-consult', title: '포레 웨딩 메이크업 상담', type: '메이크업', calendarCategory: 'consultation', location: '포레 웨딩, 신사동', durationMinutes: 60, status: 'awaiting-client', sentAt: '2026-08-05T08:30:00+09:00',
    slots: [{ id: 'coord-makeup-c1-s1', date: '2026-08-19', time: '10:30', endTime: '11:30' }, { id: 'coord-makeup-c1-s2', date: '2026-08-20', time: '15:00', endTime: '16:00' }],
  },
  {
    id: 'coord-confirmed-c1', coupleId: 'c1', vendorId: 'vp-m3', workflowId: 'makeup-consult', title: '메이크업 테스트', type: '메이크업', calendarCategory: 'shooting-rehearsal', location: '정샘물 인스피레이션', durationMinutes: 120, status: 'confirmed', sentAt: '2026-07-22T10:00:00+09:00',
    slots: [{ id: 'coord-confirmed-c1-s1', date: '2026-08-08', time: '11:00', endTime: '13:00' }], response: { selectedSlotIds: ['coord-confirmed-c1-s1'], noneAvailable: false, note: '', respondedAt: '2026-07-23T19:00:00+09:00' },
  },
  {
    id: 'coord-studio-c2', coupleId: 'c2', vendorId: 'vp-s4', workflowId: 'studio-shoot', title: '스튜디오 고유 촬영 사전 미팅', type: '스튜디오', calendarCategory: 'consultation', location: '스튜디오 고유, 성수동', durationMinutes: 90, status: 'client-responded', sentAt: '2026-08-03T14:00:00+09:00',
    slots: [{ id: 'coord-studio-c2-s1', date: '2026-08-15', time: '13:00', endTime: '14:30' }, { id: 'coord-studio-c2-s2', date: '2026-08-16', time: '11:00', endTime: '12:30' }], response: { selectedSlotIds: [], noneAvailable: true, note: '두 날짜 모두 어려워 다음 주 후보를 부탁드려요.', respondedAt: '2026-08-04T21:10:00+09:00' },
  },
]
