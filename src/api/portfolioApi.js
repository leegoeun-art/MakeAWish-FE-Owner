export async function uploadPortfolioImage(file) {
  // 백엔드 이미지 업로드 API가 아직 없어 임시로 placeholder URL을 반환한다.
  // API가 준비되면 이 함수 내부만 client.post(...)로 교체하면 된다.
  await new Promise((resolve) => setTimeout(resolve, 500))
  return `https://picsum.photos/seed/${Date.now()}/600/600`
}
