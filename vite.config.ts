import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { existsSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import type { Plugin } from 'vite'

interface LabelReviewVendor {
  type: string
  account: string
  top: string | null
}

interface LabelReviewImage {
  type: string
  account: string
  labels: string[]
  confidence: string
  src: string
}

interface LabelReviewData {
  vendors: LabelReviewVendor[]
  images: LabelReviewImage[]
}

function vendorReferenceImagesPlugin(): Plugin {
  const moduleId = 'virtual:vendor-reference-images'
  const resolvedModuleId = `\0${moduleId}`
  const reviewUrl = new URL('./conference/label_review.html', import.meta.url)

  return {
    name: 'veily-vendor-reference-images',
    resolveId(id) {
      if (id === moduleId) return resolvedModuleId
    },
    load(id) {
      if (id !== resolvedModuleId) return
      const reviewPath = fileURLToPath(reviewUrl)
      this.addWatchFile(reviewPath)
      if (!existsSync(reviewPath)) return 'export default {}'

      const html = readFileSync(reviewPath, 'utf8')
      const marker = '<script>window.__LABELS__ = '
      const payloadStart = html.indexOf(marker)
      const payloadEnd = html.indexOf(';</script>', payloadStart + marker.length)
      if (payloadStart < 0 || payloadEnd < 0) return 'export default {}'

      const data = JSON.parse(html.slice(payloadStart + marker.length, payloadEnd)) as LabelReviewData
      const confidenceOrder: Record<string, number> = { 높음: 0, 보통: 1, 낮음: 2 }
      const imagesByAccount = Object.fromEntries(data.vendors
        .filter((vendor) => ['dress', 'studio', 'makeup'].includes(vendor.type))
        .map((vendor) => {
          const candidates = data.images
            .filter((image) => image.account === vendor.account && image.type === vendor.type)
            .filter((image) => !image.labels.some((label) => label === '대상아님' || label === '해당없음'))
            .sort((first, second) => {
              const firstPrimary = vendor.top && first.labels.includes(vendor.top) ? 1 : 0
              const secondPrimary = vendor.top && second.labels.includes(vendor.top) ? 1 : 0
              return secondPrimary - firstPrimary
                || (confidenceOrder[first.confidence] ?? 9) - (confidenceOrder[second.confidence] ?? 9)
            })
          return [vendor.account, candidates.slice(0, 3).map((image) => image.src)]
        }))

      return `export default ${JSON.stringify(imagesByAccount)}`
    },
  }
}

export default defineConfig({
  plugins: [vendorReferenceImagesPlugin(), react()],
  test: {
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
  },
})
