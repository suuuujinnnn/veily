#!/usr/bin/env node
/**
 * 인식 대상 목록을 만든다.
 *
 *   node scripts/build-worklist.mjs [--cap 20]
 *
 * 업체당 상한을 두되 앞에서 자르지 않는다. 게시물을 돌아가며 한 장씩 뽑는
 * 라운드로빈이다. 앞에서 자르면 캐러셀이 큰 게시물 하나가 업체 표본을 통째로
 * 먹는다. 꼬모스튜디오는 80장 중 첫 게시물 하나가 전부를 차지한다.
 *
 * 이미 라벨이 있는 사진은 목록에서 뺀다. 세션이 끊겨도 이어서 돌릴 수 있다.
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const DEFAULT_CAP = 20

function readJsonl(file) {
  if (!fs.existsSync(file)) return []
  return fs.readFileSync(file, 'utf8').split('\n').filter(Boolean).map((line) => JSON.parse(line))
}

/** 게시물별로 묶은 뒤 한 바퀴씩 돌며 뽑는다. 한 게시물이 표본을 독점하지 않는다. */
function roundRobin(items, cap) {
  const byPost = new Map()
  for (const item of items) {
    if (!byPost.has(item.postId)) byPost.set(item.postId, [])
    byPost.get(item.postId).push(item)
  }
  // 게시물 안에서는 캐러셀 순서를 지킨다. 첫 장이 대개 대표컷이다.
  for (const list of byPost.values()) {
    list.sort((a, b) => (a.childIndex ?? -1) - (b.childIndex ?? -1))
  }

  const queues = [...byPost.values()]
  const picked = []
  let round = 0
  while (picked.length < cap) {
    let tookAny = false
    for (const queue of queues) {
      if (picked.length >= cap) break
      if (round >= queue.length) continue
      picked.push(queue[round])
      tookAny = true
    }
    if (!tookAny) break
    round += 1
  }
  return picked
}

function main() {
  const capArgIndex = process.argv.indexOf('--cap')
  const cap = capArgIndex === -1 ? DEFAULT_CAP : Number(process.argv[capArgIndex + 1])

  const media = readJsonl(path.join(ROOT, 'data', 'media-manifest.jsonl'))
  const labelled = new Set(readJsonl(path.join(ROOT, 'data', 'labels.jsonl')).map((row) => row.path))

  const byVendor = new Map()
  for (const item of media) {
    if (!byVendor.has(item.vendor)) byVendor.set(item.vendor, [])
    byVendor.get(item.vendor).push(item)
  }

  const worklist = []
  const rows = []
  for (const [vendor, items] of byVendor) {
    const picked = roundRobin(items, cap)
    const perPost = new Map()
    for (const item of picked) perPost.set(item.postId, (perPost.get(item.postId) ?? 0) + 1)
    const remaining = picked.filter((item) => !labelled.has(item.path))

    rows.push({
      vendor,
      category: items[0].category,
      전체: items.length,
      선정: picked.length,
      게시물: perPost.size,
      최다: Math.max(...perPost.values()),
      완료: picked.length - remaining.length,
      남음: remaining.length,
    })
    worklist.push(...remaining)
  }

  fs.writeFileSync(
    path.join(ROOT, 'data', 'worklist.jsonl'),
    worklist.map((item) => JSON.stringify(item)).join('\n') + '\n',
    'utf8'
  )

  const order = { 드레스: 0, 스튜디오: 1, 헤어메이크업: 2 }
  rows.sort((a, b) => order[a.category] - order[b.category] || b.전체 - a.전체)
  console.log(`상한 ${cap}장 / 게시물 라운드로빈\n`)
  console.log('분야         업체                        전체  선정  게시물 최다  완료  남음')
  for (const r of rows) {
    console.log(
      `${r.category.padEnd(6)} ${r.vendor.padEnd(26)} ${String(r.전체).padStart(4)} ` +
        `${String(r.선정).padStart(5)} ${String(r.게시물).padStart(6)} ${String(r.최다).padStart(4)} ` +
        `${String(r.완료).padStart(5)} ${String(r.남음).padStart(5)}`
    )
  }
  const total = rows.reduce((n, r) => n + r.선정, 0)
  const left = rows.reduce((n, r) => n + r.남음, 0)
  const worst = Math.max(...rows.map((r) => r.최다))
  console.log(`\n선정 ${total}장 (전체 ${media.length}장 중) / 남은 인식 ${left}장`)
  console.log(`한 게시물이 차지하는 최대 장수: ${worst}장`)
}

main()
