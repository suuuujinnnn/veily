import type { CustomerRequest } from '../types'

export const initialCustomerRequests: CustomerRequest[] = [
  { id: 'request-r1', coupleId: 'c1', category: '레퍼런스', originalText: '미카도 실크에 탑 디자인이 예쁜 드레스를 조금 더 찾아봐 주세요.', status: 'requested', createdAt: '2026-08-05T09:15:00+09:00', updatedAt: '2026-08-05T09:15:00+09:00' },
  { id: 'request-r2', coupleId: 'c2', category: '업체 문의', originalText: '스튜디오 촬영 때 반려견 동반이 가능한지 확인 부탁드려요.', status: 'confirmed', createdAt: '2026-08-04T15:20:00+09:00', updatedAt: '2026-08-05T08:30:00+09:00' },
  { id: 'request-r3', coupleId: 'c3', category: '일정', originalText: '다음 주 드레스 피팅 확정 시간을 알려주세요.', status: 'in-progress', createdAt: '2026-08-01T12:10:00+09:00', updatedAt: '2026-08-04T17:00:00+09:00' },
]
