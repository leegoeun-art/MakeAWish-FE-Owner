# 🤖 AI 코딩 어시스턴트 및 팀원 공통 API 연동 가이드라인 (`PARTNER_API_GUIDE.md`)

이 문서는 사장님 앱(`MakeAWish-FE-Owner`)에서 백엔드(`MakeAWish-BE`) API를 연동할 때 **모든 팀원(승빈, 고은)과 AI 코딩 어시스턴트가 반드시 준수해야 하는 공통 지침 및 필드 매핑 규칙**입니다.

> [!IMPORTANT]
> **AI 어시스턴트 필수 준수 사항:**  
> API 연동 코드를 작성할 때 절대 자의적으로 변수명을 짓지 말고, 아래에 기술된 백엔드 DTO 규격을 100% 반영하세요.  
> API 요청 시에는 무조건 공통 통신 모듈인 `src/api/client.js`(`import { client } from '../api/client'`)를 사용해야 합니다.

---

## 1. ⚙️ 공통 통신 모듈 사용법
모든 API 호출은 `fetch`나 `axios`를 직접 쓰지 말고, 아래와 같이 **`client` 객체**를 사용하여 작성합니다.

```javascript
import { client } from '../api/client'

// GET 예시
const orders = await client.get('/api/orders?date=today')

// POST 예시
const created = await client.post('/api/portfolios', {
  title: '파스텔 케이크',
  description: '설명',
  imageUrl: 'https://...',
  productId: 1, // 🚨 필수
  tags: ['생일', '파스텔']
})

// PATCH 예시
await client.patch('/api/stores/profile', {
  name: '달콤공방', // 🚨 storeName이 아니라 name
  description: '소개글' // 🚨 intro가 아니라 description
})
```

---

## 2. 👑 이고은님 담당 구역 (관리 탭 - BE 완료 API 규칙)

### ① 포트폴리오 신규 등록 (`POST /api/portfolios`)
* **필수 포함 파라미터 (`productId`) 주의!**
  * 백엔드 `PortfolioRegisterRequest.java`에서는 **`productId` (상위 제품/카테고리 ID)를 `@NotNull` 필수값**으로 요구합니다.
  * 프론트엔드 화면에 제품 ID를 고르는 란이 없더라도, 기본 카테고리 ID인 **`productId: 1`**을 반드시 페이로드에 포함시켜야 400 에러가 나지 않습니다.
* **전송 페이로드 예시:**
  ```json
  {
    "title": "디자인 제목",
    "description": "디자인 설명",
    "imageUrl": "https://...",
    "productId": 1,
    "tags": ["레터링", "기념일"]
  }
  ```

### ② 매장 프로필 정보 수정 (`PATCH /api/stores/profile`)
* **프론트-백엔드 필드명 불일치 변환(Mapping) 주의!**
  * 프론트엔드 화면 상태(State)의 필드 이름은 `storeName`, `intro`이지만, 백엔드 `StoreProfileUpdateRequest.java`는 **`name`**과 **`description`**을 요구합니다.
  * API 호출 함수(`src/api/storeApi.js`) 내부에서 반드시 아래와 같이 변환하여 보내야 합니다:
  ```javascript
  export async function updateStoreProfile(data) {
    return await client.patch('/api/stores/profile', {
      name: data.storeName || data.name,
      description: data.intro || data.description,
      hours: data.hours || '10:00 - 20:00',
      notice: data.notice || '',
      cautionNotice: data.cautionNotice || ''
    })
  }
  ```

---

## 3. 🤝 염승빈님 담당 구역 (주문 관리 탭 - BE 완료 API 규칙)

### ① 주문 상태 변경 (`PATCH /api/orders/{orderId}/status`)
* **상태값 Enum 일치 주의:**
  * 백엔드에서 허용하는 주문 상태 문자열 대문자 포맷: `PENDING`, `ACCEPTED`, `REJECTED`, `IN_PROGRESS`, `PICKUP_READY`, `COMPLETED`

### ② 추가금 책정/등록 (`POST /api/orders/{orderId}/extra-fee`)
* **전송 페이로드 규격:**
  ```json
  {
    "amount": 5000,
    "reason": "디자인 난이도 추가"
  }
  ```

---

## 4. 🌿 협업 규칙
1. 각자 담당하는 도메인 폴더/파일만 수정합니다:
   - 이고은님: `src/api/portfolioApi.js`, `src/api/storeApi.js`, `src/api/reviewApi.js`
   - 염승빈님: `src/api/orderApi.js`
2. 공통 모듈인 `src/api/client.js`는 임의로 수정하지 않고, 수정 시 서로 사전 공유합니다.
