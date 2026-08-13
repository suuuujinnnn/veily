interface Entry<T> {
  value: T
  expiresAt: number
}

/**
 * business_discovery 는 앱 단위 쿼터를 쓰기 때문에 같은 업체를 반복 조회하면
 * 앱 전체가 막힌다. 화면 진입마다 Graph 를 때리지 않도록 짧게 캐시한다.
 *
 * 미디어 CDN URL 은 만료 시간이 공식 문서에 없으므로 TTL 을 길게 잡지 않는다.
 */
export class TtlCache<T> {
  private readonly store = new Map<string, Entry<T>>()

  constructor(private readonly ttlMs: number) {}

  get(key: string, now: number): T | undefined {
    const entry = this.store.get(key)
    if (!entry) return undefined
    if (entry.expiresAt <= now) {
      this.store.delete(key)
      return undefined
    }
    return entry.value
  }

  set(key: string, value: T, now: number): void {
    this.store.set(key, { value, expiresAt: now + this.ttlMs })
  }

  delete(key: string): void {
    this.store.delete(key)
  }
}
