import { appendFileSync, existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import type { Config } from '../config.js'
import { fetchBusinessDiscovery } from '../instagram/graphClient.js'
import { toPortfolio } from '../instagram/mapper.js'
import type { InstagramMediaItem } from '../instagram/types.js'
import type { TokenStore } from '../instagram/tokenStore.js'
import { vendorDirectory } from '../references/facets.js'
import type { ReferenceStore } from '../references/store.js'
import type { LabelRecord } from '../references/types.js'
import { PublicError } from '../lib/errors.js'
import { Classifier } from './classifier.js'
import { loadCategorySpec } from './taxonomy.js'

/**
 * 카테고리 → data/vendors 하위 디렉터리. 기존 148장이 쓰던 배치를 그대로 따른다.
 * 업체 DB 가 서버로 올라오면 이 표도 vendorDirectory 와 함께 사라진다.
 */
const CATEGORY_DIRS: Record<string, string> = {
  드레스: 'dressshop',
  '헤어&메이크업': 'makeupshop',
  스튜디오: 'studio',
  웨딩홀: 'weddinghall',
}

/** 한 장이 이보다 크면 받지 않는다. 인스타 원본은 보통 100KB~2MB 다. */
const MAX_IMAGE_BYTES = 15 * 1024 * 1024
/** 동시에 도는 분류 요청 수. 올리면 빨라지지만 레이트 리밋에 걸리기 쉽다. */
const CONCURRENCY = 3

const EXTENSIONS: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif',
}

export interface IngestOptions {
  account: string
  /** 가져올 게시물 수. 캐러셀은 한 건이 여러 장이다. */
  limit: number
  /** 분류할 사진 수 상한. 분류는 건당 과금이라 기본값을 낮게 둔다. */
  maxImages: number
  /** true 면 내려받기·분류 없이 무엇이 대상인지만 센다. */
  dryRun: boolean
}

export interface IngestFailure {
  path: string
  reason: string
}

export interface IngestResult {
  account: string
  vendorName: string
  category: string
  taxonomyVersion: string
  /** 조회한 게시물 수. */
  posts: number
  /** 게시물에서 뽑은 사진 수. */
  candidates: number
  /** 이미 라벨이 있어 건너뛴 수. */
  skipped: number
  /** 드레스·홀 실물이 없는 브랜드 그래픽이라 버린 수. */
  rejected: number
  classified: number
  failures: IngestFailure[]
  added: LabelRecord[]
}

interface Candidate {
  /** data/vendors/... 로 시작하는 저장소 상대 경로. labels.jsonl 의 키다. */
  path: string
  absolutePath: string
  url: string
  mediaId: string
}

export class Ingestor {
  constructor(
    private readonly config: Config,
    private readonly tokens: TokenStore,
    private readonly store: ReferenceStore,
    private readonly dataDir: string,
  ) {}

  async run(options: IngestOptions): Promise<IngestResult> {
    const account = options.account.replace(/^@/, '').trim()
    const profile = vendorDirectory[account]
    if (!profile) {
      throw new PublicError(404, 'UNKNOWN_VENDOR', `'${account}' 는 등록된 업체가 아닙니다. facets.ts 의 vendorDirectory 에 추가해 주세요.`)
    }
    const dir = CATEGORY_DIRS[profile.type]
    if (!dir) {
      throw new PublicError(500, 'UNKNOWN_CATEGORY_DIR', `'${profile.type}' 카테고리의 저장 위치가 정의돼 있지 않습니다.`)
    }

    const spec = loadCategorySpec(profile.type, this.dataDir)
    const portfolio = await this.fetchPortfolio(account, options.limit)
    const candidates = this.collectCandidates(portfolio.media, account, dir)

    const fresh = candidates.filter((candidate) => !this.store.has(candidate.path))
    const targets = fresh.slice(0, options.maxImages)

    const result: IngestResult = {
      account,
      vendorName: profile.name,
      category: profile.type,
      taxonomyVersion: spec.version,
      posts: portfolio.media.length,
      candidates: candidates.length,
      skipped: candidates.length - fresh.length,
      rejected: 0,
      classified: 0,
      failures: [],
      added: [],
    }

    if (options.dryRun) return result

    if (!this.config.ANTHROPIC_API_KEY) {
      throw new PublicError(
        503,
        'CLASSIFY_KEY_MISSING',
        'server/.env 에 ANTHROPIC_API_KEY 를 넣어야 자동 분류를 쓸 수 있습니다.',
      )
    }
    const classifier = new Classifier({ apiKey: this.config.ANTHROPIC_API_KEY, model: this.config.CLASSIFY_MODEL })
    const labelsPath = join(this.dataDir, 'labels.jsonl')

    await pool(targets, CONCURRENCY, async (candidate) => {
      try {
        await download(candidate.url, candidate.absolutePath)
        const classified = await classifier.classify(candidate.absolutePath, spec)

        // 브랜드 카드·공지 같은 이미지는 라벨도 파일도 남기지 않는다. 남겨두면
        // 라벨 없는 사진으로 보드에 뜨고, 다음 실행 때 또 분류 대상이 된다.
        if (!classified.usable) {
          rmSync(candidate.absolutePath, { force: true })
          result.rejected += 1
          return
        }

        const record: LabelRecord = {
          path: candidate.path,
          vendor: account,
          category: profile.type,
          subject: classified.subject,
          labels: classified.labels,
          confidence: classified.confidence,
        }
        // 파일에 먼저 쓰고 메모리에 얹는다. 반대 순서면 저장에 실패한 라벨이
        // 화면에만 보이다가 재시작 때 사라진다.
        appendFileSync(labelsPath, `${JSON.stringify(record)}\n`, 'utf8')
        this.store.add(record)
        result.added.push(record)
        result.classified += 1
      } catch (error: unknown) {
        result.failures.push({
          path: candidate.path,
          reason: error instanceof PublicError ? error.message : error instanceof Error ? error.message : '알 수 없는 오류',
        })
      }
    })

    return result
  }

  private async fetchPortfolio(account: string, limit: number) {
    await this.tokens.ensureFresh()
    const token = this.tokens.getAccessToken()
    const igUserId = this.tokens.getIgUserId()
    if (!token || !igUserId) {
      throw new PublicError(503, 'TOKEN_MISSING', '인스타그램 토큰이 없어 게시물을 가져올 수 없습니다.')
    }
    const { discovery } = await fetchBusinessDiscovery(this.config, { token, igUserId }, { account, limit })
    return toPortfolio(discovery, account, new Date().toISOString())
  }

  /**
   * 게시물에서 분류 대상 사진을 뽑는다. 캐러셀은 장마다 다른 드레스가 걸리는 일이
   * 흔해서 내부 이미지를 전부 대상으로 삼는다. 영상과 릴스는 표지 한 장만으로
   * 라벨을 달면 틀리기 쉬워 건너뛴다.
   */
  private collectCandidates(media: InstagramMediaItem[], account: string, dir: string): Candidate[] {
    const candidates: Candidate[] = []
    for (const item of media) {
      if (item.mediaType === 'VIDEO' || item.isReel) continue
      const urls = item.children?.length ? item.children : item.imageUrl ? [item.imageUrl] : []
      urls.forEach((url, index) => {
        if (!url) return
        const suffix = urls.length > 1 ? `_${index + 1}` : ''
        const name = `ig_${item.id}${suffix}.jpg`
        const path = `data/vendors/${dir}/${account}/${name}`
        candidates.push({ path, absolutePath: join(this.dataDir, 'vendors', dir, account, name), url, mediaId: item.id })
      })
    }
    return candidates
  }
}

async function download(url: string, destination: string): Promise<void> {
  const response = await fetch(url)
  if (!response.ok) {
    throw new PublicError(502, 'IMAGE_FETCH_FAILED', `사진을 내려받지 못했습니다. (HTTP ${response.status})`)
  }
  const contentType = (response.headers.get('content-type') ?? '').split(';')[0]?.trim() ?? ''
  if (!EXTENSIONS[contentType]) {
    throw new PublicError(502, 'IMAGE_UNSUPPORTED', `이미지가 아닌 응답입니다: ${contentType || '형식 불명'}`)
  }
  const buffer = Buffer.from(await response.arrayBuffer())
  if (buffer.byteLength > MAX_IMAGE_BYTES) {
    throw new PublicError(502, 'IMAGE_TOO_LARGE', '사진이 너무 큽니다.')
  }
  mkdirSync(dirname(destination), { recursive: true })
  if (!existsSync(destination)) writeFileSync(destination, buffer)
}

/** 동시 실행 수를 묶는 최소한의 풀. 실패는 worker 안에서 삼키므로 여기서 안 터진다. */
async function pool<T>(items: T[], size: number, worker: (item: T) => Promise<void>): Promise<void> {
  let cursor = 0
  const lanes = Array.from({ length: Math.min(size, items.length) }, async () => {
    while (cursor < items.length) {
      const item = items[cursor]
      cursor += 1
      if (item !== undefined) await worker(item)
    }
  })
  await Promise.all(lanes)
}
