import { useCallback, useEffect, useState } from 'react'
import { AlertTriangle, Check, Loader2, Sparkles } from 'lucide-react'
import { Badge, Button } from '../../components/ui'
import {
  ClassifyApiError,
  classifyVendor,
  getClassifyStatus,
  type ClassifyResult,
  type ClassifyStatus,
} from '../../lib/classifyApi'
import { getReferenceProposalClassifyStatus } from '../../data/referenceProposalData'

/** 한 번에 분류할 사진 수. 사진 한 장이 곧 API 호출 하나라 기본을 작게 둔다. */
const BATCH_SIZES = [6, 12, 24]

interface ReferenceSyncPanelProps {
  category: string
  /** 분류가 끝나 새 사진이 생겼을 때. 보드가 검색을 다시 돌리게 한다. */
  onClassified: () => void
}

/**
 * 인스타에서 새 사진을 가져와 taxonomy 기준으로 자동 라벨링하는 패널.
 *
 * 수집해 둔 148장 밖의 사진은 라벨이 없어 보드 검색에 걸리지 않는다. 여기서 분류를
 * 돌리면 사진이 data/vendors 로 내려받아지고 labels.jsonl 에 라벨이 붙어 곧바로 검색된다.
 */
export function ReferenceSyncPanel({ category, onClassified }: ReferenceSyncPanelProps) {
  const [status, setStatus] = useState<ClassifyStatus | null>(null)
  const [batchSize, setBatchSize] = useState(BATCH_SIZES[0] ?? 6)
  const [busy, setBusy] = useState<string | null>(null)
  const [result, setResult] = useState<ClassifyResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const controller = new AbortController()
    getClassifyStatus(controller.signal)
      .then(setStatus)
      .catch((cause: unknown) => {
        if (controller.signal.aborted) return
        setStatus(getReferenceProposalClassifyStatus())
        setError(null)
      })
    return () => controller.abort()
  }, [])

  const run = useCallback(
    async (account: string) => {
      setBusy(account)
      setError(null)
      setResult(null)
      try {
        const next = await classifyVendor(account, { limit: 6, maxImages: batchSize })
        setResult(next)
        // 한 장이라도 붙었으면 보드를 다시 그린다.
        if (next.classified > 0) onClassified()
        setStatus((current) => (current ? { ...current, labelled: current.labelled + next.classified } : current))
      } catch (cause: unknown) {
        setError(cause instanceof ClassifyApiError ? cause.message : '분류에 실패했습니다.')
      } finally {
        setBusy(null)
      }
    },
    [batchSize, onClassified],
  )

  const vendors = (status?.vendors ?? []).filter((vendor) => vendor.category === category)

  return (
    <section className="reference-sync" aria-label="인스타 사진 자동 분류">
      <header className="reference-sync__head">
        <div>
          <p className="eyebrow">Auto labelling</p>
          <h3>인스타에서 새 사진 가져오기</h3>
          <p>
            가져온 사진을 <strong>taxonomy 기준으로 자동 라벨링</strong>해서 이 보드 검색에 바로 태웁니다.
            사진은 저장소에 내려받아 두기 때문에 인스타 링크가 만료돼도 남아 있어요.
          </p>
        </div>
        <div className="reference-sync__meta">
          {status && <Badge tone={status.ready ? 'sage' : 'amber'}>{status.ready ? status.model : 'API 키 없음'}</Badge>}
          {status && <span>라벨 {status.labelled}장</span>}
        </div>
      </header>

      {status && !status.ready && (
        <p className="reference-sync__notice">
          <AlertTriangle size={14} />
          <span>
            <code>server/.env</code> 에 <code>ANTHROPIC_API_KEY</code> 를 넣어야 분류를 돌릴 수 있습니다.
          </span>
        </p>
      )}

      <div className="reference-sync__controls">
        <span>한 번에</span>
        {BATCH_SIZES.map((size) => (
          <button
            key={size}
            type="button"
            className={batchSize === size ? 'active' : ''}
            aria-pressed={batchSize === size}
            onClick={() => setBatchSize(size)}
          >
            {size}장
          </button>
        ))}
      </div>

      <ul className="reference-sync__vendors">
        {vendors.map((vendor) => (
          <li key={vendor.account}>
            <div>
              <strong>{vendor.name}</strong>
              <small>@{vendor.account}</small>
            </div>
            <Button
              size="sm"
              variant="secondary"
              disabled={!status?.ready || busy !== null}
              icon={busy === vendor.account ? <Loader2 size={14} className="spin" /> : <Sparkles size={14} />}
              onClick={() => void run(vendor.account)}
            >
              {busy === vendor.account ? '분류 중' : '가져오기'}
            </Button>
          </li>
        ))}
        {!vendors.length && <li className="reference-sync__empty">이 분야에 등록된 업체가 없습니다.</li>}
      </ul>

      {error && (
        <p className="reference-sync__error">
          <AlertTriangle size={14} />
          {error}
        </p>
      )}

      {result && (
        <div className="reference-sync__result">
          <p>
            <Check size={14} />
            <strong>{result.vendorName}</strong> — 게시물 {result.posts}건에서 사진 {result.candidates}장,
            새로 라벨링 <strong>{result.classified}장</strong>
            {result.skipped > 0 && <> · 이미 있어 건너뜀 {result.skipped}장</>}
            {result.rejected > 0 && <> · 실물 없는 그래픽 {result.rejected}장 제외</>}
            {result.failures.length > 0 && <> · 실패 {result.failures.length}장</>}
          </p>
          {result.added.length > 0 && (
            <ul>
              {result.added.slice(0, 4).map((record) => (
                <li key={record.path}>
                  <span>{record.subject || '설명 없음'}</span>
                  <em>{Object.values(record.labels).flat().slice(0, 6).join(' · ') || '라벨 없음'}</em>
                </li>
              ))}
            </ul>
          )}
          {result.failures.length > 0 && <p className="reference-sync__failure">{result.failures[0]?.reason}</p>}
        </div>
      )}
    </section>
  )
}
