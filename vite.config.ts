import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { viteSingleFile } from 'vite-plugin-singlefile'

export default defineConfig(({ mode }) => {
  const isSingleFileExport = mode === 'singlefile'

  return {
    base: isSingleFileExport ? './' : '/',
    plugins: [
      react(),
      ...(isSingleFileExport
        ? [viteSingleFile({ removeViteModuleLoader: true })]
        : []),
    ],
    build: isSingleFileExport
      ? {
          outDir: 'dist-single',
          assetsInlineLimit: Number.MAX_SAFE_INTEGER,
          cssCodeSplit: false,
          copyPublicDir: false,
        }
      : undefined,
    test: {
      environment: 'jsdom',
      setupFiles: './src/test/setup.ts',
    },
  }
})
