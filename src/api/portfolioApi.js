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
  const res = await client.post(
    '/api/ai/portfolios/tags/recommend',
    { image_url: imageUrl, description },
    { baseUrl: import.meta.env.VITE_AI_API_URL },
  )
  return res.recommended_tags
}
