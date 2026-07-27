import { client } from './client'

export async function uploadPortfolioImage(file) {
  // 백엔드 이미지 업로드 API가 아직 없어 임시로 placeholder URL을 반환한다.
  // API가 준비되면 이 함수 내부만 client.post(...)로 교체하면 된다.
  await new Promise((resolve) => setTimeout(resolve, 500))
  return `https://picsum.photos/seed/${Date.now()}/600/600`
}

export async function createPortfolio({ title, description, imageUrl, isInpaintingAllowed, tags }) {
  return client.post('/api/portfolios', { title, description, imageUrl, isInpaintingAllowed, productId: 1, tags })
}

export async function updatePortfolio(portfolioId, { title, description, imageUrl, isInpaintingAllowed, tags }) {
  return client.patch(`/api/portfolios/${portfolioId}`, { title, description, imageUrl, isInpaintingAllowed, tags })
}

export async function recommendPortfolioTags({ imageUrl, description }) {
  // AI 서버에 CORS 설정이 없어 로컬 개발 중엔 vite.config.js의 /ai-proxy로 우회한다.
  // 프로덕션 빌드에서는 실제 AI 서버 주소로 직접 요청한다 (그땐 서버가 CORS를 허용해야 함).
  const baseUrl = import.meta.env.DEV ? '/ai-proxy' : import.meta.env.VITE_AI_API_URL
  const res = await client.post(
    '/api/ai/portfolios/tags/recommend',
    { image_url: imageUrl, description },
    { baseUrl },
  )
  return res.recommended_tags
}
