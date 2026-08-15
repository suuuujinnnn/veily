import type { ReferenceBoard, WeddingReference } from '../types'
import { labeledReferences } from './vendorLabelData'
import { venueReferences } from './weddingVenueData'

export const weddingReferences: WeddingReference[] = [
  // 실제 인스타 사진에서 판정한 라벨만 화면에 올린다.
  // 목업(vp-*)은 실존 업체 이름에 지어낸 가격·이미지를 붙인 데이터라 걷어냈다.
  ...labeledReferences,
  ...venueReferences,
]

export const initialReferenceBoards: ReferenceBoard[] = [{
  id: 'board-c1', coupleId: 'c1', title: '서윤님 본식 드레스 1차 시안', memo: '미카도 실크의 깨끗한 탑 디자인을 중심으로 모았어요.', items: [
    { referenceId: 'ref-ig-laforetofficial-2', comment: '가장 원하셨던 깨끗한 일자탑이에요.' },
    { referenceId: 'ref-ig-eloonofficial-1', comment: '실루엣이 더 풍성한 선택지예요.' },
  ], status: '공유됨', updatedAt: '2026-08-05',
}]
