import { useEffect, useRef, useState } from 'react'
import { AlertCircle, Clipboard, ImagePlus, LoaderCircle, UploadCloud } from 'lucide-react'
import { Button, Modal } from '../ui'
import { analyzeReferenceImage, imageFileToDataUrl, validateReferenceImage } from '../../lib/referenceAnalysisApi'
import type { ReferenceCategory, ReferenceSource, WeddingReference } from '../../types'

interface ReferenceImageAnalyzerModalProps {
  open: boolean
  source: Extract<ReferenceSource, '플래너 업로드' | '고객 업로드'>
  preferredCategory: ReferenceCategory
  onClose: () => void
  onComplete: (reference: Omit<WeddingReference, 'id'>) => void
}

export function ReferenceImageAnalyzerModal({ open, source, preferredCategory, onClose, onComplete }: ReferenceImageAnalyzerModalProps) {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState('')
  const [analyzing, setAnalyzing] = useState(false)
  const [error, setError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)
  const controllerRef = useRef<AbortController | null>(null)

  const reset = () => {
    controllerRef.current?.abort()
    controllerRef.current = null
    if (preview) URL.revokeObjectURL(preview)
    setFile(null)
    setPreview('')
    setAnalyzing(false)
    setError('')
  }

  const close = () => { reset(); onClose() }

  const run = async (nextFile: File) => {
    try {
      validateReferenceImage(nextFile)
      if (preview) URL.revokeObjectURL(preview)
      const nextPreview = URL.createObjectURL(nextFile)
      setFile(nextFile)
      setPreview(nextPreview)
      setError('')
      setAnalyzing(true)
      const controller = new AbortController()
      controllerRef.current = controller
      const [analysis, image] = await Promise.all([analyzeReferenceImage(nextFile, preferredCategory, controller.signal), imageFileToDataUrl(nextFile)])
      if (controller.signal.aborted) return
      onComplete({
        category: analysis.category,
        image,
        vendorName: '외부 레퍼런스',
        account: source === '고객 업로드' ? '고객 직접 업로드' : '플래너 직접 업로드',
        tags: analysis.tags,
        purpose: analysis.subject || 'AI 분석 레퍼런스',
        source,
        reviewStatus: '확인필요',
      })
      reset()
      onClose()
    } catch (caught: unknown) {
      if (caught instanceof DOMException && caught.name === 'AbortError') return
      setError(caught instanceof Error ? caught.message : '이미지 분석에 실패했습니다.')
      setAnalyzing(false)
      controllerRef.current = null
    }
  }

  useEffect(() => {
    if (!open) return
    const paste = (event: ClipboardEvent) => {
      const image = [...(event.clipboardData?.files ?? [])].find((item) => item.type.startsWith('image/'))
      if (!image || analyzing) return
      event.preventDefault()
      void run(image)
    }
    window.addEventListener('paste', paste)
    return () => window.removeEventListener('paste', paste)
  // run intentionally uses the modal's current preview and analyzing state.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, analyzing, preview, preferredCategory])

  useEffect(() => () => controllerRef.current?.abort(), [])

  return <Modal open={open} onClose={close} eyebrow="Mock reference analysis" title="외부 이미지 자동 분석">
    <div className="reference-analyzer">
      <button type="button" className={`reference-analyzer__dropzone ${preview ? 'has-image' : ''}`} disabled={analyzing} onClick={() => fileRef.current?.click()}>
        {preview ? <img src={preview} alt="분석할 이미지 미리보기" /> : <><span><UploadCloud size={23} /></span><strong>이미지를 선택하거나 붙여넣어 주세요</strong><small>JPG · PNG · WebP, 최대 15MB</small></>}
        {analyzing && <em><LoaderCircle size={22} /> 분류와 해시태그를 분석하고 있어요</em>}
      </button>
      <input ref={fileRef} hidden type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => { const selected = event.target.files?.[0]; event.target.value = ''; if (selected) void run(selected) }} />
      <div className="reference-analyzer__paste"><Clipboard size={15} /><span>클립보드의 이미지는 <strong>Ctrl+V</strong>로 바로 분석할 수 있어요.</span></div>
      {error && <div className="reference-analyzer__error" role="alert"><AlertCircle size={16} /><span>{error}</span></div>}
      <div className="reference-analyzer__actions"><Button variant="ghost" disabled={analyzing} onClick={close}>취소</Button>{file && error && <Button icon={<ImagePlus size={14} />} onClick={() => void run(file)}>다시 분석</Button>}{!analyzing && <Button variant="secondary" icon={<ImagePlus size={14} />} onClick={() => fileRef.current?.click()}>이미지 선택</Button>}</div>
    </div>
  </Modal>
}
