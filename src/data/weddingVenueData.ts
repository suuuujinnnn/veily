import { imageAssets } from '../assets/images'
import type { ReferenceCategory, Vendor, VenueAccessKind, VenueAccessOption, VenueFilterState, VenueMealPriceRange, VenueMealType, VenueRegionGroup, VenueType, VenueWish, WeddingReference, WeddingVenue } from '../types'

export const venueLocations: Record<VenueRegionGroup, string[]> = {
  서울: ['종로구', '중구', '용산구', '성동구', '광진구', '동대문구', '중랑구', '성북구', '강북구', '도봉구', '노원구', '은평구', '서대문구', '마포구', '양천구', '강서구', '구로구', '금천구', '영등포구', '동작구', '관악구', '서초구', '강남구', '송파구', '강동구'],
  '경기·인천': ['인천', '수원', '안산', '안양', '남양주', '평택', '고양·일산', '성남·분당', '용인', '부천', '광명', '의정부', '하남', '화성'],
}

export const venueMealTypes: VenueMealType[] = ['뷔페', '한식', '양식', '기타']
export const venueMealPriceRanges: VenueMealPriceRange[] = ['7만원 이하', '7~8만원', '8~9만원', '9만원 이상']
export const venueTypes: VenueType[] = ['일반·컨벤션예식장(어두운 홀)', '호텔예식', '채플홀', '하우스웨딩(밝은 홀)', '스몰웨딩(100명 이하)', '야외웨딩', '한옥웨딩']
export const venueWishes: VenueWish[] = ['밝은 홀', '어두운 홀', '높은 천고', '원형 테이블', '화려한 꽃 장식', '단독홀', '단독건물']
export const venueAccessKinds: VenueAccessKind[] = ['지하철역', '기차역', '터미널']
export const venueAccessOptions: VenueAccessOption[] = ['도보 10분 이내', '셔틀 운행', '대형 주차']

export const emptyVenueFilterState: VenueFilterState = {
  regionGroup: '', localities: [], accessKinds: [], accessPointIds: [], accessOptions: [], mealTypes: [], mealPriceRanges: [], venueTypes: [], wishes: [], query: '',
}

const matchesMealPriceRange = (price: number, range: VenueMealPriceRange) => {
  if (range === '7만원 이하') return price <= 70_000
  if (range === '7~8만원') return price > 70_000 && price <= 80_000
  if (range === '8~9만원') return price > 80_000 && price < 90_000
  return price >= 90_000
}

type VenueSeed = Omit<WeddingVenue, 'vendorId' | 'referenceImageIds'> & { images: string[] }
const g = imageAssets.weddingGarden
const s = imageAssets.vendorStudioGallery
const d = imageAssets.vendorDressGallery
const m = imageAssets.vendorMakeupGallery
const a = imageAssets.atelierDress

const seedsWithoutMealPrice: Omit<VenueSeed, 'mealPrice'>[] = [
  { id: 'venue-gangnam', name: '베일리 강남 컨벤션', regionGroup: '서울', locality: '강남구', address: '서울 강남구 테헤란로 120', mealTypes: ['뷔페'], mealDetail: '프리미엄 인터내셔널 뷔페', venueType: '일반·컨벤션예식장(어두운 홀)', wishes: ['어두운 홀', '높은 천고', '화려한 꽃 장식', '단독홀'], accessPoints: [{ id: 'gangnam-st', name: '강남역', kind: '지하철역', mode: '도보', minutes: 6, tagLabel: '강남역도보접근성' }, { id: 'suseo-srt', name: '수서역 SRT', kind: '기차역', mode: '차량', minutes: 15, tagLabel: '수서역접근성' }], accessOptions: ['도보 10분 이내', '대형 주차'], shuttleNote: '셔틀 미운행', parkingNote: '하객 500대 주차 가능', summary: '높은 천고와 선명한 조명이 돋보이는 도심 컨벤션홀', images: [s, d, a] },
  { id: 'venue-seocho', name: '센트럴 서초 채플', regionGroup: '서울', locality: '서초구', address: '서울 서초구 반포대로 88', mealTypes: ['뷔페'], mealDetail: '한식 중심 프리미엄 뷔페', venueType: '채플홀', wishes: ['밝은 홀', '높은 천고', '단독홀'], accessPoints: [{ id: 'banpo-terminal', name: '반포고속버스터미널', kind: '터미널', mode: '도보', minutes: 8, tagLabel: '반포고속버스터미널접근성' }, { id: 'express-bus-st', name: '고속터미널역', kind: '지하철역', mode: '도보', minutes: 7, tagLabel: '고속터미널역도보접근성' }], accessOptions: ['도보 10분 이내', '대형 주차'], shuttleNote: '셔틀 미운행', parkingNote: '하객 420대 주차 가능', summary: '터미널 접근성과 자연광 예배당 분위기를 함께 갖춘 채플홀', images: [g, a, s] },
  { id: 'venue-songpa', name: '루미에르 송파 호텔', regionGroup: '서울', locality: '송파구', address: '서울 송파구 올림픽로 240', mealTypes: ['양식', '한식'], mealDetail: '양식 또는 한식 코스', venueType: '호텔예식', wishes: ['밝은 홀', '원형 테이블', '화려한 꽃 장식'], accessPoints: [{ id: 'jamsil-st', name: '잠실역', kind: '지하철역', mode: '도보', minutes: 5, tagLabel: '잠실역도보접근성' }], accessOptions: ['도보 10분 이내', '대형 주차'], shuttleNote: '예약 셔틀 협의', parkingNote: '호텔 주차 600대', summary: '호수 전망과 원형 테이블 연출이 특징인 호텔 웨딩', images: [a, g, m] },
  { id: 'venue-seoul-station', name: '아르코 서울역 홀', regionGroup: '서울', locality: '중구', address: '서울 중구 통일로 24', mealTypes: ['한식'], mealDetail: '갈비 반상 중심 한식 메뉴', venueType: '일반·컨벤션예식장(어두운 홀)', wishes: ['어두운 홀', '단독홀'], accessPoints: [{ id: 'seoul-rail', name: '서울역', kind: '기차역', mode: '도보', minutes: 5, tagLabel: '서울역접근성' }, { id: 'seoul-subway', name: '서울역 1·4호선', kind: '지하철역', mode: '도보', minutes: 4, tagLabel: '서울역도보접근성' }], accessOptions: ['도보 10분 이내'], shuttleNote: '서울역 순환 차량 협의', parkingNote: '하객 220대 주차 가능', summary: 'KTX 하객이 많은 예식에 편리한 서울역 인접 홀', images: [s, m, d] },
  { id: 'venue-yongsan', name: '그레이스 용산 하우스', regionGroup: '서울', locality: '용산구', address: '서울 용산구 한강대로 52', mealTypes: ['양식', '기타'], mealDetail: '양식 코스와 맞춤 메뉴', venueType: '하우스웨딩(밝은 홀)', wishes: ['밝은 홀', '단독건물', '원형 테이블'], accessPoints: [{ id: 'yongsan-rail', name: '용산역 KTX', kind: '기차역', mode: '도보', minutes: 9, tagLabel: '용산역도보접근성' }], accessOptions: ['도보 10분 이내'], shuttleNote: '용산역 셔틀 협의', parkingNote: '하객 160대 주차 가능', summary: '도심 단독건물에서 진행하는 밝은 하우스 웨딩', images: [g, d, a] },
  { id: 'venue-mapo', name: '포레스트 마포', regionGroup: '서울', locality: '마포구', address: '서울 마포구 월드컵북로 42', mealTypes: ['뷔페'], mealDetail: '라이브 스테이션 뷔페', venueType: '하우스웨딩(밝은 홀)', wishes: ['밝은 홀', '화려한 꽃 장식', '단독건물'], accessPoints: [{ id: 'hongik-st', name: '홍대입구역', kind: '지하철역', mode: '차량', minutes: 8, tagLabel: '홍대입구역접근성' }], accessOptions: ['셔틀 운행'], shuttleNote: '홍대입구역 20분 간격 셔틀', parkingNote: '하객 180대 주차 가능', summary: '플라워 장식과 독립된 건물이 강점인 하우스 웨딩', images: [g, m, s] },
  { id: 'venue-seongsu', name: '성수 브릭 하우스', regionGroup: '서울', locality: '성동구', address: '서울 성동구 연무장길 31', mealTypes: ['기타'], mealDetail: '캐주얼 다이닝과 핑거푸드', venueType: '스몰웨딩(100명 이하)', wishes: ['밝은 홀', '단독건물'], accessPoints: [{ id: 'seongsu-st', name: '성수역', kind: '지하철역', mode: '도보', minutes: 7, tagLabel: '성수역도보접근성' }], accessOptions: ['도보 10분 이내'], shuttleNote: '셔틀 미운행', parkingNote: '인근 지정 주차장 70대', summary: '브릭 인테리어와 소규모 리셉션에 어울리는 공간', images: [d, s, m] },
  { id: 'venue-jongno', name: '종로 온 한옥', regionGroup: '서울', locality: '종로구', address: '서울 종로구 율곡로 67', mealTypes: ['한식'], mealDetail: '계절 한정식과 전통 다과', venueType: '한옥웨딩', wishes: ['밝은 홀', '단독건물'], accessPoints: [{ id: 'jongno3-st', name: '종로3가역', kind: '지하철역', mode: '도보', minutes: 9, tagLabel: '종로3가역도보접근성' }], accessOptions: ['도보 10분 이내'], shuttleNote: '셔틀 미운행', parkingNote: '인근 공영주차장 안내', summary: '한옥 마당과 한정식이 연결되는 전통 예식 공간', images: [g, a, d] },
  { id: 'venue-yeouido', name: '여의도 파크 컨벤션', regionGroup: '서울', locality: '영등포구', address: '서울 영등포구 국제금융로 19', mealTypes: ['뷔페', '양식'], mealDetail: '뷔페 또는 양식 코스 선택', venueType: '일반·컨벤션예식장(어두운 홀)', wishes: ['어두운 홀', '높은 천고', '원형 테이블'], accessPoints: [{ id: 'yeouido-st', name: '여의도역', kind: '지하철역', mode: '도보', minutes: 6, tagLabel: '여의도역도보접근성' }], accessOptions: ['도보 10분 이내', '대형 주차'], shuttleNote: '셔틀 미운행', parkingNote: '건물 통합 700대 주차', summary: '대규모 하객과 기업형 연회 운영에 적합한 컨벤션홀', images: [s, a, m] },
  { id: 'venue-gangseo', name: '강서 스카이홀', regionGroup: '서울', locality: '강서구', address: '서울 강서구 공항대로 210', mealTypes: ['뷔페'], mealDetail: '한·중·일식 혼합 뷔페', venueType: '일반·컨벤션예식장(어두운 홀)', wishes: ['어두운 홀', '단독홀'], accessPoints: [{ id: 'gimpo-airport-st', name: '김포공항역', kind: '지하철역', mode: '차량', minutes: 9, tagLabel: '김포공항역접근성' }], accessOptions: ['셔틀 운행', '대형 주차'], shuttleNote: '김포공항역 셔틀 운행', parkingNote: '하객 520대 주차 가능', summary: '공항과 서부권 하객 접근을 고려한 단독 컨벤션홀', images: [m, s, g] },
  { id: 'venue-suwon', name: '수원 메종컨벤션', regionGroup: '경기·인천', locality: '수원', address: '경기 수원시 팔달구 덕영대로 801', mealTypes: ['뷔페'], mealDetail: '수원 지역 특선 뷔페', venueType: '일반·컨벤션예식장(어두운 홀)', wishes: ['어두운 홀', '높은 천고', '단독홀'], accessPoints: [{ id: 'suwon-rail', name: '수원역', kind: '기차역', mode: '도보', minutes: 9, tagLabel: '수원역도보접근성' }], accessOptions: ['도보 10분 이내', '대형 주차'], shuttleNote: '수원역 셔틀 협의', parkingNote: '하객 550대 주차 가능', summary: '기차 하객과 경기 남부권 이동에 편리한 대형 컨벤션홀', images: [s, d, m] },
  { id: 'venue-incheon', name: '인천 포트호텔', regionGroup: '경기·인천', locality: '인천', address: '인천 남동구 예술로 115', mealTypes: ['양식', '한식'], mealDetail: '양식 또는 한식 코스', venueType: '호텔예식', wishes: ['밝은 홀', '원형 테이블', '화려한 꽃 장식'], accessPoints: [{ id: 'incheon-terminal', name: '인천종합터미널', kind: '터미널', mode: '차량', minutes: 8, tagLabel: '인천종합터미널접근성' }], accessOptions: ['셔틀 운행', '대형 주차'], shuttleNote: '터미널 예약 셔틀', parkingNote: '호텔 주차 620대', summary: '인천 터미널과 가까운 코스 요리 중심 호텔 웨딩', images: [a, g, s] },
  { id: 'venue-ansan', name: '안산 라온채플', regionGroup: '경기·인천', locality: '안산', address: '경기 안산시 단원구 중앙대로 902', mealTypes: ['뷔페'], mealDetail: '즉석 조리 뷔페', venueType: '채플홀', wishes: ['밝은 홀', '높은 천고', '단독홀'], accessPoints: [{ id: 'ansan-st', name: '안산역', kind: '지하철역', mode: '차량', minutes: 10, tagLabel: '안산역접근성' }], accessOptions: ['셔틀 운행', '대형 주차'], shuttleNote: '안산역 정기 셔틀', parkingNote: '하객 480대 주차 가능', summary: '밝은 채플과 경기 서남부 셔틀 동선이 강점인 홀', images: [g, a, d] },
  { id: 'venue-anyang', name: '안양 가든하우스', regionGroup: '경기·인천', locality: '안양', address: '경기 안양시 동안구 시민대로 180', mealTypes: ['뷔페', '기타'], mealDetail: '가든 뷔페와 맞춤 메뉴', venueType: '하우스웨딩(밝은 홀)', wishes: ['밝은 홀', '단독건물', '화려한 꽃 장식'], accessPoints: [{ id: 'pyeongchon-st', name: '평촌역', kind: '지하철역', mode: '도보', minutes: 8, tagLabel: '평촌역도보접근성' }], accessOptions: ['도보 10분 이내'], shuttleNote: '셔틀 미운행', parkingNote: '하객 190대 주차 가능', summary: '정원과 플라워 스타일링을 강조한 단독 하우스 웨딩', images: [g, m, a] },
  { id: 'venue-namyangju', name: '남양주 리버가든', regionGroup: '경기·인천', locality: '남양주', address: '경기 남양주시 북한강로 511', mealTypes: ['기타'], mealDetail: '바비큐와 계절 맞춤 메뉴', venueType: '야외웨딩', wishes: ['밝은 홀', '단독건물', '원형 테이블'], accessPoints: [{ id: 'pyeongnae-st', name: '평내호평역', kind: '기차역', mode: '셔틀', minutes: 18, tagLabel: '평내호평역셔틀접근성' }], accessOptions: ['셔틀 운행', '대형 주차'], shuttleNote: '평내호평역 전용 셔틀', parkingNote: '야외 주차 500대', summary: '강변 잔디 공간을 단독으로 사용하는 야외 웨딩', images: [g, d, s] },
  { id: 'venue-pyeongtaek', name: '평택 스테이션컨벤션', regionGroup: '경기·인천', locality: '평택', address: '경기 평택시 평택로 45', mealTypes: ['뷔페'], mealDetail: '한식 비중이 높은 연회 뷔페', venueType: '일반·컨벤션예식장(어두운 홀)', wishes: ['어두운 홀', '단독홀', '높은 천고'], accessPoints: [{ id: 'pyeongtaek-rail', name: '평택역', kind: '기차역', mode: '도보', minutes: 7, tagLabel: '평택역도보접근성' }, { id: 'pyeongtaek-terminal', name: '평택버스터미널', kind: '터미널', mode: '도보', minutes: 9, tagLabel: '평택버스터미널접근성' }], accessOptions: ['도보 10분 이내', '대형 주차'], shuttleNote: '셔틀 미운행', parkingNote: '하객 450대 주차 가능', summary: '기차역과 버스터미널을 모두 이용하기 쉬운 컨벤션홀', images: [s, m, a] },
  { id: 'venue-ilsan', name: '일산 레이크 스몰웨딩', regionGroup: '경기·인천', locality: '고양·일산', address: '경기 고양시 일산동구 호수로 320', mealTypes: ['양식', '기타'], mealDetail: '양식 코스와 브런치 메뉴', venueType: '스몰웨딩(100명 이하)', wishes: ['밝은 홀', '원형 테이블', '단독건물'], accessPoints: [{ id: 'daehwa-st', name: '대화역', kind: '지하철역', mode: '차량', minutes: 8, tagLabel: '대화역접근성' }, { id: 'ilsan-terminal', name: '고양종합터미널', kind: '터미널', mode: '차량', minutes: 12, tagLabel: '고양종합터미널접근성' }], accessOptions: ['셔틀 운행'], shuttleNote: '대화역 예약 셔틀', parkingNote: '하객 150대 주차 가능', summary: '호수공원 인근에서 여유롭게 진행하는 소규모 웨딩', images: [g, a, m] },
]

const mealPrices = [88_000, 82_000, 125_000, 78_000, 98_000, 79_000, 68_000, 75_000, 92_000, 73_000, 76_000, 110_000, 72_000, 77_000, 85_000, 74_000, 89_000]
const seeds: VenueSeed[] = seedsWithoutMealPrice.map((venue, index) => ({ ...venue, mealPrice: mealPrices[index] }))

export const weddingVenues: WeddingVenue[] = seeds.map(({ images, ...venue }) => ({ ...venue, vendorId: `vendor-${venue.id}`, referenceImageIds: images.map((_, index) => `ref-웨딩홀-${venue.id}-${index + 1}`) }))

export const venueVendors: Vendor[] = seeds.map((venue) => ({
  id: `vendor-${venue.id}`,
  name: venue.name,
  category: '웨딩홀',
  summary: venue.summary,
  tags: [venue.locality, ...venue.mealTypes, venue.venueType, ...venue.wishes.slice(0, 3)],
  priceRange: `1인 식대 ${venue.mealPrice.toLocaleString('ko-KR')}원`,
  match: 0,
  image: venue.images[0],
  gallery: venue.images,
  location: venue.locality,
  address: venue.address,
  hours: '상담 예약제',
  phone: '02-0000-0000',
  instagram: '',
  website: '',
  activeEvent: '',
  updatedAt: '2026-08-05',
  memo: `${venue.mealDetail} · ${venue.parkingNote}`,
}))

export const venueReferences: WeddingReference[] = seeds.flatMap((venue) => venue.images.map((image, index) => ({
  id: `ref-웨딩홀-${venue.id}-${index + 1}`,
  category: '웨딩홀' as ReferenceCategory,
  image,
  venueId: venue.id,
  vendorId: `vendor-${venue.id}`,
  vendorName: venue.name,
  account: 'VEILY 목업 데이터',
  tags: [venue.locality, ...venue.mealTypes, venue.accessPoints[0].tagLabel, venue.venueType, ...venue.wishes],
  purpose: index === 0 ? '대표 홀' : '공간 상세',
  source: '검수 아카이브' as const,
  reviewStatus: '검수완료' as const,
})))

export function getVenuePrimaryReference(venue: WeddingVenue) {
  return venueReferences.find((reference) => reference.id === venue.referenceImageIds[0])!
}

export function filterWeddingVenues(filters: VenueFilterState) {
  if (!filters.regionGroup || !filters.localities.length) return []
  const tokens = filters.query.trim().toLocaleLowerCase('ko').split(/\s+/).filter(Boolean)
  return weddingVenues
    .filter((venue) => venue.regionGroup === filters.regionGroup && filters.localities.includes(venue.locality))
    .filter((venue) => !filters.accessKinds.length || venue.accessPoints.some((point) => filters.accessKinds.includes(point.kind)))
    .filter((venue) => !filters.accessPointIds.length || venue.accessPoints.some((point) => filters.accessPointIds.includes(point.id)))
    .filter((venue) => !filters.accessOptions.length || filters.accessOptions.some((option) => venue.accessOptions.includes(option)))
    .filter((venue) => !filters.mealTypes.length || filters.mealTypes.some((meal) => venue.mealTypes.includes(meal)))
    .filter((venue) => !filters.mealPriceRanges.length || filters.mealPriceRanges.some((range) => matchesMealPriceRange(venue.mealPrice, range)))
    .filter((venue) => !filters.venueTypes.length || filters.venueTypes.includes(venue.venueType))
    .filter((venue) => !filters.wishes.length || filters.wishes.some((wish) => venue.wishes.includes(wish)))
    .filter((venue) => !tokens.length || tokens.every((token) => [venue.name, venue.locality, venue.address, venue.mealDetail, venue.venueType, ...venue.wishes, ...venue.accessPoints.flatMap((point) => [point.name, point.tagLabel])].join(' ').toLocaleLowerCase('ko').includes(token)))
}
