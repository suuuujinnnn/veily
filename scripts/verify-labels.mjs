#!/usr/bin/env node
/**
 * 라벨 개편의 제약 두 개를 코드로 확인한다.
 *
 *   node scripts/verify-labels.mjs [기준브랜치]
 *
 * 1. UI 파일(.tsx/.css)이 허용된 범위 밖으로 바뀌지 않았는가
 * 2. 기존 키워드 값이 허락 없이 지워지지 않았는가
 *    (그룹 이름 변경과 값 추가는 허용. 의도적으로 뺀 값은 아래 목록에 등록한다)
 *
 * 이번 작업의 핵심 제약이라 눈으로 보지 않고 매번 돌린다.
 */

import { execSync } from 'node:child_process'
import fs from 'node:fs'

const BASE = process.argv[2] ?? 'develop'
const FILE = 'src/data/referenceKeywordData.ts'

/** 주석을 걷어낸 뒤 그룹 이름 → 키워드 목록으로 만든다. */
function parseGroups(source) {
  const body = source
    .slice(source.indexOf('export const referenceCategories'), source.indexOf('export const vendorReferenceKeywords'))
    .replace(/\/\/[^\n]*/g, '')
    .replace(/\/\*[\s\S]*?\*\//g, '')

  const groups = new Map()
  for (const match of body.matchAll(/label:\s*'([^']+)'[\s\S]*?keywords:\s*\[([^\]]*)\]/g)) {
    groups.set(match[1], [...match[2].matchAll(/'([^']+)'/g)].map((m) => m[1]))
  }
  return groups
}

const before = parseGroups(execSync(`git show ${BASE}:${FILE}`, { encoding: 'utf8' }))
const after = parseGroups(fs.readFileSync(FILE, 'utf8'))

const values = (groups) => new Set([...groups.values()].flat())
const oldValues = values(before)
const newValues = values(after)
/**
 * 플래너 피드백으로 일부러 걷어낸 값들. 각각 이유가 있다.
 *
 * 헤어 운영 조건(단독룸·담당자 지정·얼리스타트·발렛·헤어피스·컷트)은
 * "사실상 모든 샵이 다 된다"고 확인받아 변별력이 없다. 헤어 액세서리는
 * 헤어샵이 아니라 드레스샵에서 나온다.
 *
 * 헤어·메이크업 디자인 값은 시안 찾기용 새 키워드로 대체됐다.
 */
const INTENTIONALLY_REMOVED = new Set([
  '단독룸', '반독립석', '오픈형',
  '원장 지정 가능', '실장 지정 가능', '담당자 지정 없음', '1:1 진행', '동시 진행',
  '얼리 스타트 가능', '레이트 스타트 가능', '휴무일 진행 가능', '주차·발렛', '출장 가능',
  '본식 헤어피스', '촬영 헤어피스', '혼주 헤어·메이크업', '커트 가능', '헤어 액세서리',
  '웨이브', '단발', '로우 번', '미들 번', '땋은 머리',
  '물광', '세미 매트', '투명', '누드', '과즙', '음영', '글램', '강한', '깔끔',
  // 스튜디오 화면구성은 값 이름만 바뀌었다.
  // 인물 중심 → 깔끔한 인물 중심 / 인물+배경 → 인물+배경 적당히 / 배경 중심 → 배경·컨셉 중심
  '인물 중심', '인물+배경', '배경 중심',
])

const removed = [...oldValues].filter((v) => !newValues.has(v) && !INTENTIONALLY_REMOVED.has(v))
const removedOnPurpose = [...oldValues].filter((v) => !newValues.has(v) && INTENTIONALLY_REMOVED.has(v))
const added = [...newValues].filter((v) => !oldValues.has(v))

const renamedFrom = [...before.keys()].filter((g) => !after.has(g))
const renamedTo = [...after.keys()].filter((g) => !before.has(g))

/**
 * 업체 카테고리를 '메이크업' → '헤어&메이크업' 으로 바꾸면서 세 파일을 고쳤다.
 * 헤어와 메이크업은 같은 숍이 함께 하므로 업체 DB에서 하나로 세야 한다는
 * 요구였고, 카테고리 값이 타입에 박혀 있어 UI 파일을 피할 수 없었다.
 * 이 셋만 예외로 두고 나머지는 그대로 막는다.
 */
const ALLOWED_UI = [
  'src/features/vendors/VendorDatabase.tsx',
  'src/features/vendors/VendorsPage.tsx',
  'src/features/calendar/AddEventModal.tsx',
]

const uiDiff = execSync(`git diff --name-only ${BASE} -- "*.tsx" "*.css"`, { encoding: 'utf8' })
  .split(/\r?\n/)
  .map((line) => line.trim())
  .filter(Boolean)
  .filter((file) => !ALLOWED_UI.includes(file))
  .join('\n')

console.log(`기준 브랜치: ${BASE}\n`)
console.log(`키워드 값   ${oldValues.size}개 → ${newValues.size}개`)
console.log(`  지워진 값  ${removed.length ? '❌ ' + removed.join(', ') : '없음 ✅'}`)
console.log(`  추가된 값  ${added.length ? added.join(', ') : '없음'}`)
console.log(`  일부러 뺀 값  ${removedOnPurpose.length}개`)
console.log(`\n그룹        ${before.size}개 → ${after.size}개`)
if (renamedFrom.length || renamedTo.length) {
  console.log(`  이름 변경  ${renamedFrom.join(', ')}  →  ${renamedTo.join(', ')}`)
} else {
  console.log('  이름 변경  없음')
}
console.log(`\nUI 파일 변경  ${uiDiff ? '❌\n' + uiDiff : '없음 ✅'}`)

const failed = removed.length > 0 || uiDiff.length > 0
console.log(`\n${failed ? '실패 — 제약 위반' : '통과'}`)
process.exit(failed ? 1 : 0)
