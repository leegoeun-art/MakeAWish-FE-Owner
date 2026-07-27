import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react(), tailwindcss()],
    server: {
      port: 5173,
      proxy: {
        // AI 서버에 CORS 설정이 없어 로컬 개발 중에만 이 프록시로 우회한다.
        // 배포본(build)에는 영향 없음 — 프로덕션에서는 AI 서버가 CORS를 직접 허용해야 한다.
        '/ai-proxy': {
          target: env.VITE_AI_API_URL || 'https://makeawish-ai.onrender.com',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/ai-proxy/, ''),
        },
      },
    },
  }
})
