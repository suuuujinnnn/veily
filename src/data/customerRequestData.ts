import { vendorReviewImages } from '../assets/vendorReviewImages'
import type { CustomerRequest } from '../types'

export const initialCustomerRequests: CustomerRequest[] = [
  {
    id: 'request-r1',
    coupleId: 'c1',
    category: '레퍼런스',
    originalText: '이런 느낌의 미카도 실크 드레스를 조금 더 찾아봐 주세요. 참고한 링크도 같이 보내요.',
    sender: 'customer',
    attachments: [
      { id: 'attachment-r1-image', type: 'image', name: 'dress-reference.jpg', url: vendorReviewImages.laforet___official[0] },
      { id: 'attachment-r1-link', type: 'link', name: '인스타그램 참고 게시물', url: 'https://www.instagram.com/' },
    ],
    createdAt: '2026-08-05T09:15:00+09:00',
    updatedAt: '2026-08-05T09:15:00+09:00',
  },
  {
    id: 'request-r5', coupleId: 'c1', category: '레퍼런스', sender: 'planner',
    originalText: '보내주신 드레스 레퍼런스 확인했어요. 비슷한 실크 소재 업체를 정리해서 공유드릴게요.',
    readByPlannerAt: '2026-08-05T09:32:00+09:00', attachments: [],
    createdAt: '2026-08-05T09:32:00+09:00', updatedAt: '2026-08-05T09:32:00+09:00',
  },
  { id: 'request-r2', coupleId: 'c2', category: '업체 문의', originalText: '스튜디오 촬영 때 반려견 동반이 가능한지 확인 부탁드려요.', sender: 'customer', readByPlannerAt: '2026-08-04T15:30:00+09:00', attachments: [], createdAt: '2026-08-04T15:20:00+09:00', updatedAt: '2026-08-04T15:30:00+09:00' },
  { id: 'request-r4', coupleId: 'c2', category: '업체 문의', originalText: '확인해 볼게요. 스튜디오에 반려견 동반 가능 여부와 준비 사항을 함께 문의해 두었습니다.', sender: 'planner', readByPlannerAt: '2026-08-04T15:42:00+09:00', attachments: [], createdAt: '2026-08-04T15:42:00+09:00', updatedAt: '2026-08-04T15:42:00+09:00' },
  { id: 'request-r3', coupleId: 'c3', category: '일정', originalText: '다음 주 드레스 피팅 확정 시간을 알려주세요.', sender: 'customer', readByPlannerAt: '2026-08-01T12:30:00+09:00', attachments: [], createdAt: '2026-08-01T12:10:00+09:00', updatedAt: '2026-08-01T12:30:00+09:00' },
]
