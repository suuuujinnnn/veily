#!/usr/bin/env node
/**
 * 라벨 개편의 제약 두 개를 코드로 확인한다.
 *
 *   node scripts/verify-labels.mjs [기준브랜치]
 *
 * 1. UI 파일(.tsx/.css)이 허용된 범위 밖으로 바뀌지 않았는가
 * 2. 기존 키워드 값이 지워지지 않았는가 (그룹 이름 변경과 값 추가는 허용)
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
const removed = [...oldValues].filter((v) => !newValues.has(v))
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
