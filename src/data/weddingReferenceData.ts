import type { ReferenceBoard, ReferenceCategory, WeddingReference } from '../types'
import { labeledReferences } from './vendorLabelData'
import { vendorStyleProfiles } from './vendorStyleData'
import { venueReferences } from './weddingVenueData'

const dressTags: Record<string, string[][]> = {
  'vp-d1': [['아플리케 레이스', '상체 디테일탑', 'A라인'], ['튤', '화려한 비즈', '오프숄더'], ['캉캉 스커트', '하트탑', '벨라인']],
  'vp-d2': [['미카도 실크', '일자탑', '벨라인'], ['미카도 실크', '오프숄더', 'A라인'], ['화려한 비즈', '하트탑', '레이어드 스커트']],
  'vp-d3': [['맑은 비즈', '브이넥', '머메이드라인'], ['블망 레이스', '긴팔소매', '세미라인'], ['글리터·펄', '딥 브이', '트임 드레스']],
  'vp-d4': [['미카도 실크', '일자탑', 'A라인'], ['미카도 실크', '스퀘어넥', '세미라인'], ['타프타', '하트 스퀘어넥', '미니드레스']],
  'vp-d5': [['튤', '아플리케 레이스', '하트탑'], ['오간자 실크', '라운드넥', 'A라인'], ['맑은 비즈', '백 포인트', '벨라인']],
}

const hairTags: Record<string, string[][]> = {
  'vp-m1': [['단독룸', '원장 지정 가능', '1:1 진행', '얼리 스타트 가능', '본식 헤어피스', '로우 번'], ['단독룸', '원장 지정 가능', '웨이브', '반묶음'], ['단독룸', '1:1 진행', '본식 헤어피스', '로우 번']],
  'vp-m2': [['반독립석', '실장 지정 가능', '동시 진행', '촬영 헤어피스', '하이 번'], ['반독립석', '동시 진행', '생머리'], ['반독립석', '실장 지정 가능', '하이 포니테일']],
  'vp-m3': [['단독룸', '실장 지정 가능', '1:1 진행', '주차·발렛', '미들 번'], ['단독룸', '혼주 헤어·메이크업', '웨이브', '반묶음'], ['단독룸', '주차·발렛', '미들 번']],
  'vp-m4': [['오픈형', '담당자 지정 없음', '출장 가능', '커트 가능', '단발'], ['오픈형', '출장 가능', '로우 번'], ['오픈형', '커트 가능', '땋은 머리']],
  'vp-m5': [['반독립석', '실장 지정 가능', '레이트 스타트 가능', '헤어 액세서리', '로우 번'], ['반독립석', '휴무일 진행 가능', '웨이브'], ['반독립석', '레이트 스타트 가능', '로우 포니테일']],
}

const categoryFallbacks: Record<ReferenceCategory, string[][]> = {
  드레스: [],
  헤어: [],
  메이크업: [['투명', '과즙'], ['누디', '세미 매트'], ['물광', '깔끔']],
  스튜디오: [['자연광', '인물 중심'], ['화보', '실내 세트'], ['정원', '인물+배경']],
  웨딩홀: [],
}

function referencesForProfile(category: ReferenceCategory, profileId: string) {
  const profile = vendorStyleProfiles.find((item) => item.vendor.id === profileId)!
  const tags = category === '드레스' ? dressTags[profileId] : category === '헤어' ? hairTags[profileId] : categoryFallbacks[category]
  return profile.vendor.gallery.slice(0, Math.min(4, profile.vendor.gallery.length)).map<WeddingReference>((image, index) => ({
    id: `ref-${category}-${profileId}-${index + 1}`,
    category,
    image,
    vendorId: profile.vendor.id,
    vendorName: profile.vendor.name,
    account: profile.account,
    tags: tags[index % tags.length],
    purpose: category === '드레스' ? (index === 2 ? '촬영·2부' : '본식') : '상담 레퍼런스',
    source: '검수 아카이브',
    reviewStatus: '검수완료',
    imagePosition: profile.vendor.imagePosition,
  }))
}

export const weddingReferences: WeddingReference[] = [
  // 실제 인스타 사진에서 판정한 라벨이 먼저 온다. 아래 vp-* 는 아직 인식하지
  // 않은 카테고리를 메우는 기존 목업이고, 인식이 끝나는 대로 걷어낸다.
  ...labeledReferences,
  ...['vp-d1', 'vp-d2', 'vp-d3', 'vp-d4', 'vp-d5'].flatMap((id) => referencesForProfile('드레스', id)),
  ...['vp-m1', 'vp-m2', 'vp-m3', 'vp-m4', 'vp-m5'].flatMap((id) => referencesForProfile('헤어', id)),
  ...['vp-m1', 'vp-m2', 'vp-m3', 'vp-m4', 'vp-m5'].flatMap((id) => referencesForProfile('메이크업', id)),
  ...['vp-s1', 'vp-s2', 'vp-s3', 'vp-s4', 'vp-s5'].flatMap((id) => referencesForProfile('스튜디오', id)),
  ...venueReferences,
]

export const initialReferenceBoards: ReferenceBoard[] = [{
  id: 'board-c1', coupleId: 'c1', title: '서윤님 본식 드레스 1차 시안', memo: '미카도 실크의 깨끗한 탑 디자인을 중심으로 모았어요.', items: [
    { referenceId: 'ref-드레스-vp-d4-1', comment: '가장 원하셨던 깨끗한 일자탑이에요.' },
    { referenceId: 'ref-드레스-vp-d2-1', comment: '실루엣이 더 풍성한 선택지예요.' },
  ], status: '공유됨', updatedAt: '2026-08-05',
}]
