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

// 목업 업체 프로필(vendorStyleProfiles)은 삭제했다. 실존 업체 이름에 지어낸
// 가격대·지역·표본수와 AI 생성 이미지를 붙인 데이터였다. 실제 업체는
// src/data/vendorLabelData.ts 가 인스타 수집·사진 판정 결과로 만든다.
