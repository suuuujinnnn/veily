/**
 * 목업 데이터를 화면에 올릴지 판정한다.
 *
 * 백엔드가 떠 있으면 실데이터로 화면을 채울 수 있으므로 목업을 뺀다.
 * 백엔드가 없으면 목업을 그대로 쓴다 — 안 그러면 화면에 아무것도 안 남는다.
 *
 * 값은 dev 서버가 뜰 때 vite.config.ts 가 백엔드 /api/health 를 찔러 정한다.
 * 백엔드를 나중에 켰다면 dev 서버를 다시 띄워야 반영된다.
 */
// 값은 vite.config.ts 의 backendGate 플러그인이 가상 모듈로 넣어 준다.
export { backendLive } from 'virtual:backend-live'
import { backendLive } from 'virtual:backend-live'

/** 목업을 쓸 때만 값을 흘려보낸다. 백엔드가 살아 있으면 빈 배열이다. */
export function mockOnly<T>(items: T[]): T[] {
  return backendLive ? [] : items
}

/**
 * 목업 업체(vp-*)를 가리키는 레코드를 걸러낸다.
 * 업체가 화면에서 빠졌는데 그 업체를 가리키는 발주·계약·추천이 남으면
 * 이름 없는 카드가 뜬다. 참조하는 쪽도 같이 빼야 한다.
 */
export function withoutMockVendors<T extends { vendorId?: string }>(items: T[]): T[] {
  return backendLive ? items.filter((item) => !item.vendorId?.startsWith('vp-')) : items
}
