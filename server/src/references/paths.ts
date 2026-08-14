import { existsSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

/**
 * 라벨 데이터는 저장소 루트의 data/ 에 있다. tsx 로 직접 실행할 때(server/src)와
 * 빌드 산출물로 실행할 때(server/dist)의 깊이가 달라서, 파일 위치를 기준으로
 * data/labels.jsonl 이 나올 때까지 위로 올라간다.
 */
export function findDataDir(): string {
  let current = dirname(fileURLToPath(import.meta.url))
  for (let depth = 0; depth < 6; depth += 1) {
    const candidate = join(current, 'data')
    if (existsSync(join(candidate, 'labels.jsonl'))) return candidate
    const parent = resolve(current, '..')
    if (parent === current) break
    current = parent
  }
  throw new Error('data/labels.jsonl 을 찾지 못했습니다. 저장소 루트에서 서버를 실행하세요.')
}
