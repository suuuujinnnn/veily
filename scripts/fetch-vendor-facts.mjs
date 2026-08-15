#!/usr/bin/env node
/**
 * 업체 L2 메타데이터 씨앗 수집기.
 *
 *   node scripts/fetch-vendor-facts.mjs
 *
 * 지역·전화·영업시간은 사진에서 나오지 않는다. 인스타 프로필의 biography 와
 * website 에서 뽑을 수 있는 만큼만 뽑고, 못 뽑은 칸은 비워 둔다. 추측해서
 * 채우면 "검색되는 사실 정보"라는 목적 자체가 깨진다.
 *
 * 산출: data/vendor-facts.json — 원문 bio 를 함께 남겨 사람이 검수할 수 있게 한다.
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const GRAPH_VERSION = 'v21.0'

const SEOUL_DISTRICTS = [
  '강남구', '서초구', '송파구', '용산구', '마포구', '성동구', '종로구', '중구',
  '영등포구', '강서구', '광진구', '서대문구', '동작구', '관악구', '강동구',
]
const NEIGHBORHOODS = [
  '청담', '신사', '논현', '압구정', '삼성동', '역삼', '도산대로', '한남', '성수',
  '가로수길', '서래마을', '연희동', '검단', '홍대',
]

const PHONE = /(0\d{1,2}[-.\s]?\d{3,4}[-.\s]?\d{4})/
const HOURS = /(\d{1,2}\s*:\s*\d{2}\s*[~\-–]\s*\d{1,2}\s*:\s*\d{2})/
const ADDRESS = /([가-힣]+(?:대로|로|길)\s*\d+[-\d]*(?:\s*\d+[FfBb]?)?)/

function extract(bio) {
  const flat = (bio ?? '').replace(/\s+/g, ' ')
  return {
    phone: flat.match(PHONE)?.[1] ?? null,
    hours: flat.match(HOURS)?.[1]?.replace(/\s+/g, '') ?? null,
    address: flat.match(ADDRESS)?.[1] ?? null,
    district: SEOUL_DISTRICTS.find((d) => flat.includes(d)) ?? null,
    neighborhood: NEIGHBORHOODS.find((n) => flat.includes(n)) ?? null,
  }
}

async function main() {
  const saved = JSON.parse(fs.readFileSync(path.join(ROOT, 'server', '.secrets', 'instagram-token.json'), 'utf8'))
  const token = saved.pageToken || saved.userToken
  const catalog = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'vendors.json'), 'utf8'))

  const facts = []
  for (const vendor of catalog.vendors) {
    if (vendor.category === '웨딩홀') continue
    const fields = `business_discovery.username(${vendor.account}){username,name,biography,website,followers_count,media_count}`
    const url = `https://graph.facebook.com/${GRAPH_VERSION}/${saved.igUserId}?fields=${fields}&access_token=${token}`
    const body = await (await fetch(url)).json()
    if (body.error) {
      console.error(`${vendor.account} 실패 — ${body.error.message}`)
      continue
    }
    const profile = body.business_discovery
    const parsed = extract(profile.biography)
    facts.push({
      account: vendor.account,
      name: vendor.name,
      category: vendor.category,
      igName: profile.name ?? null,
      website: profile.website ?? null,
      ...parsed,
      source: 'instagram-bio',
      rawBio: profile.biography ?? '',
    })
    const filled = ['phone', 'hours', 'address', 'district', 'neighborhood'].filter((k) => parsed[k])
    console.log(
      `${vendor.category.padEnd(6)} ${vendor.account.padEnd(26)} ` +
        `${filled.length}/5 ${filled.length ? '— ' + filled.join(', ') : '— 없음'}`
    )
  }

  const out = path.join(ROOT, 'data', 'vendor-facts.json')
  fs.writeFileSync(out, JSON.stringify({ collectedAt: catalog.collectedAt, note: '인스타 프로필 bio에서 뽑은 씨앗값. 빈 칸은 추측하지 않고 비워 둔다.', facts }, null, 2) + '\n', 'utf8')

  const counts = { phone: 0, hours: 0, address: 0, district: 0, neighborhood: 0 }
  for (const f of facts) for (const k of Object.keys(counts)) if (f[k]) counts[k] += 1
  console.log(`\n${facts.length}곳 수집. 항목별 커버리지:`)
  for (const [k, v] of Object.entries(counts)) {
    console.log(`  ${k.padEnd(13)} ${v}/${facts.length} (${Math.round((v / facts.length) * 100)}%)`)
  }
}

main().catch((error) => {
  console.error(error.message)
  process.exit(1)
})
