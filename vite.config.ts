import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

/**
 * 수집한 업체 사진은 `media/vendors/` 에 있고 gitignore 된다. 360MB 라
 * 빌드 산출물에 들어가면 안 된다.
 *
 * 개발 중에는 `media` 를 publicDir 로 삼아 `/vendors/...` 로 그대로 열어주고,
 * 빌드에서는 publicDir 을 꺼서 dist 로 복사되지 않게 한다. 배포할 때는
 * 사진을 별도 스토리지로 올리고 그 주소를 쓰면 된다.
 */
export default defineConfig(({ command }) => ({
  publicDir: command === 'serve' ? 'media' : false,
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      },
    },
  },
  optimizeDeps: {
    entries: ['index.html'],
  },
}))
