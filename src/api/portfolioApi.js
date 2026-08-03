import { client } from './client'

export async function fetchStorePortfolios(storeId = 1) {
  const res = await client.get(`/api/stores/${storeId}`)
  return res.categories.flatMap((c) => c.portfolios).filter((p) => p.storeId === storeId)
}

// TEMP: 백엔드 이미지 업로드 API(POST /api/images/upload)가 500 에러를 내는 동안,
// 실제 업로드 대신 고정된 이미지 URL을 반환한다. 백엔드 고쳐지면 아래 주석 처리된
// 원래 코드로 되돌리면 된다.
export async function uploadPortfolioImage(file) {
  await new Promise((resolve) => setTimeout(resolve, 300))
  return 'https://elasticbeanstalk-ap-northeast-2-496251221995.s3.ap-northeast-2.amazonaws.com/images/338ee370-576f-4af1-bbc3-ee78cd85d3f2.jpg'

  // const formData = new FormData()
  // formData.append('file', file)
  // const res = await client.post('/api/images/upload', formData)
  // return res.imageUrl
}

export async function createPortfolio({ title, description, imageUrl, isInpaintingAllowed, tags }) {
  return client.post('/api/portfolios', { title, description, imageUrl, isInpaintingAllowed, productId: 1, tags })
}

export async function updatePortfolio(portfolioId, { title, description, imageUrl, isInpaintingAllowed, tags }) {
  return client.patch(`/api/portfolios/${portfolioId}`, { title, description, imageUrl, isInpaintingAllowed, tags })
}

export async function recommendPortfolioTags({ imageUrl, description }) {
  // AI 서버로 직접 가는 게 아니라 Spring 서버가 내부적으로 AI를 호출해주는 구조다.
  // 응답은 { recommendedTags: [...] }가 아니라 문자열 배열을 그대로 반환한다.
  return client.post('/api/portfolios/tags/recommend', { imageUrl, description })
}
