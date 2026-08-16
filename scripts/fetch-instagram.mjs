#!/usr/bin/env node
/**
 * 업체 인스타그램 사진 수집기.
 *
 *   node scripts/fetch-instagram.mjs [--category 드레스] [--account eloon_official] [--posts 10]
 *
 * "이미지가 있는 게시물 N개"를 채울 때까지 페이지네이션한다. 최근 N개를 그냥 자르면
 * 피드가 릴스 위주인 계정(에이바이봄 등)에서 사진이 0장 나온다.
 *
 * 캐러셀은 children을 전부 내려받는다. 장마다 다른 드레스가 걸리는 일이 흔해서
 * 표지 한 장으로 대표시키면 안 된다.
 *
 * 인스타 CDN URL은 서명이 붙어 며칠이면 만료되므로 반드시 파일로 받는다.
 * 저장 위치는 media/vendors/<분야디렉터리>/<계정>/ 이고 gitignore 된다.
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const GRAPH_VERSION = 'v21.0'
const DEFAULT_POSTS = 10
const PAGE_SIZE = 25
const MAX_PAGES = 12

function parseArgs(argv) {
  const args = { posts: DEFAULT_POSTS }
  for (let i = 0; i < argv.length; i += 2) {
    const key = argv[i]?.replace(/^--/, '')
    const value = argv[i + 1]
    if (!key || value === undefined) continue
    args[key] = key === 'posts' ? Number(value) : value
  }
  return args
}

function readToken() {
  const file = path.join(ROOT, 'server', '.secrets', 'instagram-token.json')
  if (!fs.existsSync(file)) {
    throw new Error('server/.secrets/instagram-token.json 이 없습니다. 먼저 토큰을 발급하세요.')
  }
  const saved = JSON.parse(fs.readFileSync(file, 'utf8'))
  const token = saved.pageToken || saved.userToken
  if (!token || !saved.igUserId) throw new Error('토큰 파일에 pageToken/userToken 또는 igUserId 가 없습니다.')
  return { token, igUserId: saved.igUserId }
}

function readVendors() {
  return JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'vendors.json'), 'utf8'))
}

/** 사진이 한 장이라도 들어 있는 게시물인지. 릴스·단일 영상은 제외한다. */
function imageCount(media) {
  if (media.media_product_type === 'REELS') return 0
  if (media.media_type === 'VIDEO') return 0
  if (media.media_type === 'CAROUSEL_ALBUM') {
    return (media.children?.data ?? []).filter((child) => child.media_type !== 'VIDEO').length
  }
  return media.media_url ? 1 : 0
}

async function fetchPage({ token, igUserId, account, after }) {
  const mediaArgs = [`limit(${PAGE_SIZE})`, after ? `after(${after})` : null].filter(Boolean).join('.')
  const fields =
    `business_discovery.username(${account}){username,name,followers_count,media_count,` +
    `media.${mediaArgs}{id,media_type,media_product_type,media_url,permalink,caption,timestamp,` +
    `children{id,media_type,media_url}}}`
  const url = `https://graph.facebook.com/${GRAPH_VERSION}/${igUserId}?fields=${fields}&access_token=${token}`
  const response = await fetch(url)
  const body = await response.json()
  if (body.error) throw new Error(`${account}: [${body.error.code}] ${body.error.message}`)
  return body.business_discovery
}

/** 이미지가 있는 게시물이 wanted개 모일 때까지 커서를 따라간다. */
async function collectPosts({ token, igUserId, account, wanted }) {
  const posts = []
  let after
  let profile
  let skippedVideo = 0
  for (let page = 0; page < MAX_PAGES && posts.length < wanted; page += 1) {
    const discovery = await fetchPage({ token, igUserId, account, after })
    profile ??= {
      username: discovery.username,
      name: discovery.name,
      followers: discovery.followers_count,
      mediaCount: discovery.media_count,
    }
    const items = discovery.media?.data ?? []
    if (!items.length) break
    for (const media of items) {
      if (posts.length >= wanted) break
      if (imageCount(media) === 0) { skippedVideo += 1; continue }
      posts.push(media)
    }
    after = discovery.media?.paging?.cursors?.after
    if (!after) break
  }
  return { profile, posts, skippedVideo }
}

/** 게시물 하나를 사진 목록으로 편다. 캐러셀 내부 영상은 버린다. */
function flattenImages(media) {
  if (media.media_type !== 'CAROUSEL_ALBUM') {
    return [{ url: media.media_url, childIndex: null }]
  }
  return (media.children?.data ?? [])
    .filter((child) => child.media_type !== 'VIDEO' && child.media_url)
    .map((child, index) => ({ url: child.media_url, childIndex: index }))
}

async function download(url, destination) {
  if (fs.existsSync(destination)) return 'skipped'
  const response = await fetch(url)
  if (!response.ok) throw new Error(`다운로드 실패 ${response.status}`)
  const buffer = Buffer.from(await response.arrayBuffer())
  fs.writeFileSync(destination, buffer)
  return 'saved'
}

async function run() {
  const args = parseArgs(process.argv.slice(2))
  const { token, igUserId } = readToken()
  const catalog = readVendors()

  const targets = catalog.vendors.filter((vendor) => {
    if (args.account) return vendor.account === args.account
    if (args.category) return vendor.category === args.category
    return vendor.category !== '웨딩홀'
  })
  if (!targets.length) throw new Error('조건에 맞는 업체가 없습니다.')

  const manifest = []
  for (const vendor of targets) {
    const dir = catalog.categories[vendor.category].dir
    const outDir = path.join(ROOT, 'media', 'vendors', dir, vendor.account)
    fs.mkdirSync(outDir, { recursive: true })

    let saved = 0
    let skipped = 0
    let failed = 0
    try {
      const { posts, skippedVideo } = await collectPosts({
        token,
        igUserId,
        account: vendor.account,
        wanted: args.posts,
      })

      for (const media of posts) {
        for (const image of flattenImages(media)) {
          const suffix = image.childIndex === null ? '' : `_${image.childIndex}`
          const file = `ig_${media.id}${suffix}.jpg`
          const destination = path.join(outDir, file)
          try {
            const result = await download(image.url, destination)
            result === 'saved' ? (saved += 1) : (skipped += 1)
            manifest.push({
              path: `media/vendors/${dir}/${vendor.account}/${file}`,
              vendor: vendor.account,
              vendorName: vendor.name,
              category: vendor.category,
              postId: media.id,
              childIndex: image.childIndex,
              permalink: media.permalink,
              timestamp: media.timestamp,
              caption: media.caption ?? '',
            })
          } catch (error) {
            failed += 1
            console.error(`    ! ${file} — ${error.message}`)
          }
        }
      }
      console.log(
        `${vendor.category.padEnd(6)} ${vendor.account.padEnd(26)} ` +
          `게시물 ${String(posts.length).padStart(2)}개 → 사진 ${String(saved + skipped).padStart(3)}장 ` +
          `(신규 ${saved} / 기존 ${skipped} / 실패 ${failed} / 영상건너뜀 ${skippedVideo})`
      )
    } catch (error) {
      console.error(`${vendor.category.padEnd(6)} ${vendor.account.padEnd(26)} 실패 — ${error.message}`)
    }
  }

  const manifestPath = path.join(ROOT, 'data', 'media-manifest.jsonl')
  const existing = fs.existsSync(manifestPath)
    ? fs.readFileSync(manifestPath, 'utf8').split('\n').filter(Boolean).map((line) => JSON.parse(line))
    : []
  const merged = new Map(existing.map((item) => [item.path, item]))
  for (const item of manifest) merged.set(item.path, item)
  fs.writeFileSync(manifestPath, [...merged.values()].map((item) => JSON.stringify(item)).join('\n') + '\n', 'utf8')
  console.log(`\ndata/media-manifest.jsonl — 총 ${merged.size}장`)
}

run().catch((error) => {
  console.error(error.message)
  process.exit(1)
})
