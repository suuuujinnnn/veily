#!/usr/bin/env node
/**
 * data/labels.jsonl(L0) + data/vendors.json + data/vendor-facts.json(L2)
 * → src/data/vendorLabelData.ts (생성 파일)
 *
 *   node scripts/build-frontend-data.mjs
 *
 * 화면은 이 파일을 직접 고치지 않는다. 인식이 더 진행되면 다시 돌리면 된다.
 * L0 → L1 변환 규칙은 src/data/labelMapping.ts 한 곳에만 있고, 여기서는
 * 그 규칙을 그대로 옮겨 쓴다(스크립트는 .mjs 라 .ts 를 import 할 수 없다).
 */

import fs from 'node:fs'

const LABELS = 'data/labels.jsonl'
const OUT = 'src/data/vendorLabelData.ts'

// labelMapping.ts 의 PASS_THROUGH 와 같은 표. 둘이 어긋나면 화면 태그가 조용히 빠진다.
const PASS_THROUGH = {
  드레스: ['넥라인', '소매', '소재', '장식', '스커트라인', '특별디자인', '색상'],
  헤어: [],
  메이크업: [],
  스튜디오: ['화면구성', '무드', '빛컬러', '공간장면', '시간구도', '소품'],
  웨딩홀: [],
}

/** labelMapping.ts 의 hairTags 와 같은 규칙. 둘이 어긋나면 화면 태그가 조용히 빠진다. */
function hairTags(l0) {
  const tags = []
  if (l0.길이?.[0] === '단발') {
    if (l0.텍스처?.[0] === '생머리') tags.push('단발 생머리')
    if (l0.텍스처?.[0] === '웨이브') tags.push('단발 웨이브')
    if (l0.반묶음?.[0] === '반묶음') tags.push('단발 반묶음')
    return [...new Set(tags)]
  }
  const position = l0.묶음위치?.[0]
  const shape = l0.묶음형태?.[0]
  if (position === '하이' && shape === '번') tags.push('하이 번')
  if (shape === '포니테일' && (position === '로우' || position === '하이')) tags.push(`${position} 포니테일`)
  if (l0.반묶음?.[0] === '반묶음') tags.push('반묶음')
  if (l0.반묶음?.[0] === '내림' && l0.텍스처?.[0] === '생머리') tags.push('생머리')
  return [...new Set(tags)]
}

/** 피부표현과 무드컬러를 합쳐 스타일 하나로 넘긴다. */
function makeupTags(l0) {
  const skin = l0.피부표현?.[0]
  const mood = l0.무드컬러?.[0]
  if (mood === '과즙') return ['뽀용 과즙']
  if (mood === '강한') return ['세련·음영·펄감']
  if (mood === '음영') return skin === '물광' ? ['세련·음영·펄감'] : ['깔끔·은은한 음영']
  if (mood === '깔끔') return ['깔끔·단아·청순']
  return []
}

function toReferenceTags(category, l0) {
  if (category === '헤어') return hairTags(l0)
  if (category === '메이크업') return makeupTags(l0)
  return [...new Set((PASS_THROUGH[category] ?? []).flatMap((axis) => l0[axis] ?? []))]
}

/** 인스타 계정명 → 화면에서 쓸 업체 id. 기존 vp-* 와 겹치지 않게 접두어를 둔다. */
const vendorId = (account) => `ig-${account.replace(/[^a-z0-9]/gi, '')}`

/** media/ 는 dev 서버에서 publicDir 로 붙는다. 따라서 앞의 media 만 떼면 URL 이다. */
const toUrl = (p) => '/' + p.replace(/^media\//, '')

const labels = fs
  .readFileSync(LABELS, 'utf8')
  .trim()
  .split('\n')
  .filter(Boolean)
  .map((line) => JSON.parse(line))
  .filter((row) => row.usable)

const vendorsMeta = JSON.parse(fs.readFileSync('data/vendors.json', 'utf8')).vendors
const facts = JSON.parse(fs.readFileSync('data/vendor-facts.json', 'utf8')).facts
const factByAccount = new Map(facts.map((f) => [f.account, f]))

// 라벨이 붙은 계정만 화면에 올린다. 사진 없는 업체 카드는 빈 껍데기다.
const labeledAccounts = new Map()
for (const row of labels) {
  if (!labeledAccounts.has(row.vendor)) labeledAccounts.set(row.vendor, [])
  labeledAccounts.get(row.vendor).push(row)
}

const references = []
const vendors = []

for (const [account, rows] of labeledAccounts) {
  const meta = vendorsMeta.find((v) => v.account === account)
  const fact = factByAccount.get(account) ?? {}
  const id = vendorId(account)
  const name = meta?.name ?? rows[0].vendorName
  // 헤어와 메이크업은 같은 숍이라 업체는 하나로 센다. 수집 기준 이름만 화면 값에 맞춘다.
  const category = meta?.category === '헤어메이크업' ? '헤어&메이크업' : (meta?.category ?? rows[0].category)

  rows.forEach((row, index) => {
    references.push({
      id: `ref-${id}-${index + 1}`,
      category: row.category,
      image: toUrl(row.path),
      vendorId: id,
      vendorName: name,
      account,
      tags: toReferenceTags(row.category, row.l0 ?? {}),
      purpose: row.category === '드레스' ? '본식' : '상담 레퍼런스',
      source: '검수 아카이브',
      reviewStatus: '검수완료',
    })
  })

  // 사진에서 가장 자주 나온 태그를 업체 태그로 올린다. 이게 이 업체의 실제 성향이다.
  const counts = new Map()
  for (const row of rows) {
    for (const tag of toReferenceTags(row.category, row.l0 ?? {})) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1)
    }
  }
  const topTags = [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, 5)
    .map(([tag]) => tag)

  vendors.push({
    id,
    name,
    category,
    // 없는 정보는 지어내지 않는다. bio 에 가격대가 있는 계정이 하나도 없었다.
    summary: `인스타 게시물 ${rows.length}장을 판정해 태그를 붙였습니다.`,
    tags: topTags,
    priceRange: '문의',
    match: 0,
    image: references[references.length - rows.length].image,
    location: fact.district ?? fact.neighborhood ?? '확인 필요',
    address: fact.address ?? '',
    hours: fact.hours ?? '',
    phone: fact.phone ?? '',
    instagram: `https://instagram.com/${account}`,
    activeEvent: '',
    gallery: rows.slice(0, 6).map((row) => toUrl(row.path)),
    website: fact.website ?? undefined,
    updatedAt: new Date().toISOString().slice(0, 10),
    evidenceSource: 'analyzed',
  })
}

const header = `// 자동 생성 파일. 직접 고치지 말 것.
// 생성: node scripts/build-frontend-data.mjs
// 원본: data/labels.jsonl (L0 사진 라벨) + data/vendors.json + data/vendor-facts.json (L2)
//
// 사진은 media/ 아래에 있고 dev 서버에서만 붙는다(vite.config.ts publicDir).
// 프로덕션 빌드에는 포함되지 않으므로 배포 전에 이미지 호스팅을 정해야 한다.

import type { Vendor, WeddingReference } from '../types'

`

const body =
  `export const labeledReferences: WeddingReference[] = ${JSON.stringify(references, null, 2)}\n\n` +
  `export const labeledVendors: Vendor[] = ${JSON.stringify(vendors, null, 2)}\n`

fs.writeFileSync(OUT, header + body)

console.log(`레퍼런스 ${references.length}장 / 업체 ${vendors.length}곳 → ${OUT}`)
for (const v of vendors) {
  console.log(`  ${v.name.padEnd(10)} ${String(v.category).padEnd(5)} 사진 ${v.gallery.length}장  태그 ${v.tags.join(', ')}`)
}
