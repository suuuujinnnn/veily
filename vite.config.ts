import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    entries: ['index.html'],
  },
  server: {
    // 개발 중 /api 를 server/ 로 넘긴다. 같은 출처로 붙어서 CORS 설정이 필요 없고,
    // 나중에 쿠키·세션을 붙일 때도 그대로 쓸 수 있다.
    proxy: {
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      },
    },
  },
})
