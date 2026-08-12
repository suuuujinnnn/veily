import { vendorReviewImages } from '../assets/vendorReviewImages'
import type { AnalyzedVendorCategory, Vendor } from '../types'

export type PartnerCategory = AnalyzedVendorCategory

export interface VendorStyleProfile {
  vendor: Vendor
  account: string
  sampleCount: number
  primaryStyle: string
  primaryShare: number
  profileType: '집중형' | '균형형'
  styleCounts: Record<string, number>
}

export interface VendorStyleOption {
  label: string
  count: number
  description: string
}

export const vendorStyleTaxonomy: Record<PartnerCategory, VendorStyleOption[]> = {
  드레스: [
    { label: '실크', count: 26, description: '광택과 구조감이 정돈된 미니멀 무드' },
    { label: '비즈와레이스', count: 27, description: '섬세한 자수와 반짝임이 중심인 디테일' },
    { label: '화려', count: 19, description: '볼륨과 장식이 확실한 존재감 있는 스타일' },
    { label: '유니크', count: 10, description: '비정형 실루엣과 개성 있는 포인트' },
  ],
  스튜디오: [
    { label: '깔끔함', count: 40, description: '정돈된 배경과 인물 중심의 담백한 컷' },
    { label: '화보', count: 29, description: '패션 에디토리얼처럼 연출된 장면' },
    { label: '초록초록', count: 20, description: '정원과 자연광을 활용한 생기 있는 무드' },
    { label: '빈티지', count: 8, description: '필름 질감과 오래된 공간의 감도' },
    { label: '화려', count: 4, description: '세트와 조명이 드라마틱한 장면' },
  ],
  메이크업: [
    { label: '과즙', count: 36, description: '생기 있는 혈색과 맑은 포인트 컬러' },
    { label: '깔끔', count: 23, description: '선과 결을 정돈한 단정한 표현' },
    { label: '누디', count: 20, description: '피부 본연의 톤을 살린 차분한 무드' },
    { label: '강하게', count: 3, description: '눈매와 윤곽이 또렷한 포인트 메이크업' },
  ],
}

interface PartnerSeed {
  id: string
  name: string
  account: string
  category: PartnerCategory
  location: string
  priceRange: string
  summary: string
  sampleCount: number
  primaryStyle: string
  primaryShare: number
  profileType: '집중형' | '균형형'
  styleCounts: Record<string, number>
  imagePosition?: string
}

function createProfile(seed: PartnerSeed): VendorStyleProfile {
  const gallery = vendorReviewImages[seed.account]
  if (!gallery) throw new Error(`Missing reviewed images for ${seed.account}`)
  return {
    account: seed.account,
    sampleCount: seed.sampleCount,
    primaryStyle: seed.primaryStyle,
    primaryShare: seed.primaryShare,
    profileType: seed.profileType,
    styleCounts: seed.styleCounts,
    vendor: {
      id: seed.id,
      name: seed.name,
      category: seed.category,
      summary: seed.summary,
      tags: Object.entries(seed.styleCounts).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([label]) => label),
      priceRange: seed.priceRange,
      match: Math.min(98, 80 + Math.round(seed.primaryShare * 18)),
      image: gallery[0],
      imagePosition: seed.imagePosition,
      location: seed.location,
      address: `서울 ${seed.location} 제휴 상담 공간`,
      hours: '화–일 10:00–19:00',
      phone: '02-000-0000',
      instagram: `@${seed.account}`,
      activeEvent: `${seed.primaryStyle} 스타일 상담 위크 · 플래너 동행 혜택`,
      gallery,
      website: `https://www.instagram.com/${seed.account}`,
      lastContact: '',
      memo: 'conference/label_review.html 이미지·라벨 분석 결과를 연결한 업체입니다.',
      evidenceSource: 'analyzed',
    },
  }
}

export const vendorStyleProfiles: VendorStyleProfile[] = [
  createProfile({ id: 'vp-d1', name: '아틀리에 오화', account: 'atelier_ohwa', category: '드레스', location: '청담동', priceRange: '290–450만원', summary: '플라워 아플리케와 볼륨감 있는 실루엣을 폭넓게 다루는 아틀리에', sampleCount: 7, primaryStyle: '화려', primaryShare: .4, profileType: '균형형', styleCounts: { 화려: 4, 비즈와레이스: 3, 유니크: 2, 실크: 1 } }),
  createProfile({ id: 'vp-d2', name: '크리드제이', account: 'creedj_official', category: '드레스', location: '청담동', priceRange: '320–480만원', summary: '선명한 장식과 드라마틱한 볼륨으로 존재감을 만드는 드레스숍', sampleCount: 5, primaryStyle: '화려', primaryShare: .5, profileType: '집중형', styleCounts: { 화려: 3, 비즈와레이스: 2, 유니크: 1 }, imagePosition: '50% 58%' }),
  createProfile({ id: 'vp-d3', name: '엘룬', account: 'eloon_official', category: '드레스', location: '신사동', priceRange: '270–430만원', summary: '비즈와 레이스의 밀도감에 세련된 실루엣을 더하는 컬렉션', sampleCount: 15, primaryStyle: '비즈와레이스', primaryShare: .48, profileType: '집중형', styleCounts: { 비즈와레이스: 12, 화려: 6, 실크: 5, 유니크: 2 }, imagePosition: '38% 50%' }),
  createProfile({ id: 'vp-d4', name: '라포레', account: 'laforet___official', category: '드레스', location: '청담동', priceRange: '260–410만원', summary: '장식을 덜어낸 실크와 구조적인 선이 분명한 미니멀 드레스숍', sampleCount: 16, primaryStyle: '실크', primaryShare: .65, profileType: '집중형', styleCounts: { 실크: 13, 유니크: 3, 화려: 2, 비즈와레이스: 2 }, imagePosition: '48% 60%' }),
  createProfile({ id: 'vp-d5', name: '루이즈블랑', account: 'louisblanc_official', category: '드레스', location: '논현동', priceRange: '250–390만원', summary: '레이스와 실크를 균형 있게 제안해 취향 탐색에 적합한 드레스숍', sampleCount: 16, primaryStyle: '비즈와레이스', primaryShare: .381, profileType: '균형형', styleCounts: { 비즈와레이스: 8, 실크: 7, 화려: 4, 유니크: 2 }, imagePosition: '62% 48%' }),
  createProfile({ id: 'vp-s1', name: '클레브 스튜디오', account: 'cleve_studio', category: '스튜디오', location: '성수동', priceRange: '210–290만원', summary: '인물 중심의 화보 컷과 자연스러운 초록 배경을 함께 구성하는 스튜디오', sampleCount: 24, primaryStyle: '화보', primaryShare: .391, profileType: '균형형', styleCounts: { 화보: 9, 깔끔함: 8, 초록초록: 6 } }),
  createProfile({ id: 'vp-s2', name: '그에온 스튜디오', account: 'gue_on.studio.official', category: '스튜디오', location: '용산구', priceRange: '190–260만원', summary: '군더더기 없는 배경과 단정한 구도로 두 사람에게 집중하는 공간', sampleCount: 14, primaryStyle: '깔끔함', primaryShare: .5, profileType: '집중형', styleCounts: { 깔끔함: 7, 초록초록: 4, 화려: 3 }, imagePosition: '50% 43%' }),
  createProfile({ id: 'vp-s3', name: '모닌 스튜디오', account: 'moninstudio', category: '스튜디오', location: '서초구', priceRange: '220–310만원', summary: '에디토리얼 연출과 빈티지 질감을 오가는 감도 높은 스튜디오', sampleCount: 16, primaryStyle: '화보', primaryShare: .389, profileType: '균형형', styleCounts: { 화보: 7, 깔끔함: 6, 빈티지: 5 }, imagePosition: '32% 48%' }),
  createProfile({ id: 'vp-s4', name: '스튜디오 고유', account: 'studio.goyou', category: '스튜디오', location: '성수동', priceRange: '200–280만원', summary: '깔끔한 인물 컷을 중심으로 화보와 자연광 세트를 폭넓게 제안하는 곳', sampleCount: 22, primaryStyle: '깔끔함', primaryShare: .423, profileType: '균형형', styleCounts: { 깔끔함: 11, 화보: 8, 초록초록: 4, 빈티지: 2, 화려: 1 }, imagePosition: '67% 45%' }),
  createProfile({ id: 'vp-s5', name: '유하 하우스', account: 'yuha_haus', category: '스튜디오', location: '남양주', priceRange: '180–250만원', summary: '정돈된 실내와 푸른 야외 공간을 자연스럽게 잇는 하우스 스튜디오', sampleCount: 22, primaryStyle: '깔끔함', primaryShare: .4, profileType: '균형형', styleCounts: { 깔끔함: 8, 초록초록: 6, 화보: 5, 빈티지: 1 }, imagePosition: '52% 50%' }),
  createProfile({ id: 'vp-m1', name: '김청경 헤어페이스', account: 'kimchungkyung_hairface', category: '메이크업', location: '청담동', priceRange: '130–190만원', summary: '생기 있는 컬러와 단정한 피부 표현을 신부 톤에 맞게 조율하는 숍', sampleCount: 15, primaryStyle: '과즙', primaryShare: .357, profileType: '균형형', styleCounts: { 과즙: 5, 깔끔: 4, 누디: 4, 강하게: 1 }, imagePosition: '50% 35%' }),
  createProfile({ id: 'vp-m2', name: '라메종 브라이드', account: 'lamaison_bride', category: '메이크업', location: '청담동', priceRange: '140–210만원', summary: '맑은 피부와 생기 있는 컬러가 분명한 과즙 메이크업 전문 숍', sampleCount: 31, primaryStyle: '과즙', primaryShare: .824, profileType: '집중형', styleCounts: { 과즙: 14, 누디: 2, 깔끔: 1 }, imagePosition: '44% 31%' }),
  createProfile({ id: 'vp-m3', name: '포레 웨딩', account: 'lkmforetwedding', category: '메이크업', location: '신사동', priceRange: '120–180만원', summary: '결을 깔끔하게 정돈하면서 누디 톤의 깊이를 살리는 메이크업', sampleCount: 16, primaryStyle: '깔끔', primaryShare: .533, profileType: '집중형', styleCounts: { 깔끔: 8, 누디: 5, 과즙: 2 }, imagePosition: '56% 35%' }),
  createProfile({ id: 'vp-m4', name: '미파레 웨딩', account: 'me.parer_wedding', category: '메이크업', location: '청담동', priceRange: '125–185만원', summary: '과즙과 누디 무드를 같은 비중으로 다뤄 상담 선택지가 넓은 숍', sampleCount: 17, primaryStyle: '과즙', primaryShare: .4, profileType: '균형형', styleCounts: { 과즙: 6, 누디: 6, 강하게: 2, 깔끔: 1 }, imagePosition: '62% 36%' }),
  createProfile({ id: 'vp-m5', name: '밈 웨딩', account: 'mimm_wedding', category: '메이크업', location: '논현동', priceRange: '115–175만원', summary: '맑은 생기와 깔끔한 윤곽을 균형 있게 제안하는 메이크업숍', sampleCount: 21, primaryStyle: '과즙', primaryShare: .429, profileType: '균형형', styleCounts: { 과즙: 9, 깔끔: 9, 누디: 3 }, imagePosition: '38% 33%' }),
]
