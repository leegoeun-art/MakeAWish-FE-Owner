# [2026-07-30 Log] 주문 관리 탭: 주문 목록 및 단건 상세 조회 실서버 API 연동 개발 일지

- **작업 일자**: 2026-07-30
- **담당자**: 염승빈
- **개발 브랜치**: `feat/order-list-api`
- **관련 PR 대상 기능**: 주문 관리 탭 실서버 API 기본 모듈 및 목록/단건 상세 조회 기능 연동

---

## 1. 🎯 개발 개요
사장님 웹 대시보드(`MakeAWish-FE-Owner`)의 주문 관리 탭에서 사용하던 임시 Mock 데이터를 백엔드(`MakeAWish-BE`) 실서버 REST API 응답으로 전환했습니다.  
`docs/PARTNER_API_GUIDE.md` 문서에 정의된 담당 구역 규칙을 준수하여 타 팀원 영역(`portfolioApi.js`, `storeApi.js`)과의 충돌을 100% 방지했습니다.

---

## 2. 🧩 핵심 로직 및 파일 구조 설명

### ① API 통신 모듈 (`src/api/orderApi.js`)
공통 HTTP 클라이언트(`src/api/client.js`)를 활용하여 염승빈님 담당 5대 API 요청 함수를 신규 구현했습니다.

```javascript
import { client } from './client'

// 1. 주문 목록 조회 (오늘 주문 필터 시 ?date=today 쿼리 지원)
export async function fetchOrders(params = {}) {
  const query = new URLSearchParams()
  if (params.date) query.append('date', params.date)
  return await client.get(`/api/orders${query.toString() ? `?${query.toString()}` : ''}`)
}

// 2. 주문 단건 상세 조회
export async function fetchOrderById(orderId) {
  return await client.get(`/api/orders/${orderId}`)
}
```

#### 🛠️ 방어적 설계 포인트
- **추가금 책정(`registerExtraFee`) 호환성**: 백엔드 `ExtraFeeCreateRequest.java`의 필수 검증 속성이 `extraFee`로 되어 있는 점을 고려하여, `{ extraFee: parsedAmount, amount: parsedAmount, reason }` 형태로 두 속성을 모두 전송하여 400 Bad Request를 원천 차단했습니다.
- **주문 상태 변경(`updateOrderStatus`)**: 백엔드의 `@RequestParam OrderStatus status`와 Body JSON을 동시에 수용하도록 설계했습니다.

---

### ② 주문 목록 페이지 (`src/pages/orders/OrderList.jsx`)
- **실서버 연동 로직**: 컴포넌트 마운트 시 `useEffect` 내에서 `fetchOrders()`를 호출하여 실제 주문 목록 배열을 가져옵니다.
- **안전 매핑(Defensive Mapping)**:  
  백엔드 DTO(`OrderSummaryResponse`)와 프론트엔드 UI 카드의 필드 차이를 극복하기 위해 아래와 같이 정규화합니다.
  ```javascript
  const mapped = data.map((item) => ({
    id: item.id || item.orderId,
    status: item.orderStatus || item.status || 'PENDING',
    customerName: item.customerName || item.userName || '주문 고객',
    cakeType: item.cakeType || item.designName || '주문제작 케이크',
    price: Number(item.totalPrice ?? item.price ?? 0),
    requestedDate: item.requestedDate || (item.pickupDate && String(item.pickupDate).split('T')[0]) || '2026-07-30',
    pickupTime: item.pickupTime || (item.pickupDate && String(item.pickupDate).split('T')[1]?.slice(0, 5)) || '14:00',
    ...item,
  }))
  ```
- **Fallback 처리**: 실서버 호출에 실패하거나 오프라인 개발 테스트 환경일 때는 기존 Zustand Mock 스토어의 데이터를 대체 출력하여 UI 테스트가 끊기지 않도록 했습니다.

---

### ③ 주문 상세 페이지 (`src/pages/orders/OrderDetail.jsx`)
- **단건 조회 연동**: `useParams()`에서 획득한 `orderId`를 기반으로 `fetchOrderById(orderId)`를 호출해 단건 상세 데이터를 렌더링합니다.
- **백엔드 DTO(`OrderDetailResponse`) 맞춤 정밀 매핑**:
  - `cakeType`: 백엔드 DTO 내 주문 상품 목록(`List<OrderItemResponse> items`)의 첫 번째 상품명(`items[0]?.productName`)을 케이크 종류 이름으로 자동 연계.
  - `schemaAnswers`: 손님이 선택한 커스텀 응답 맵(`Map<String, Object> orderData`)을 UI 요청 사항 표시부(`schemaAnswers`)에 자동 연결.
  - `pickupDate`: 백엔드의 ISO-8601 `LocalDateTime`(`2026-07-30T14:00:00`) 문자열을 `split('T')`로 나누어 날짜(`requestedDate`)와 시간(`pickupTime`)을 분리 표시.
- **안전 연산 및 렌더링 보호**:
  - `totalPrice` 계산 시 `(Number(order.price) || 0) + extraCharges.reduce(...)`를 적용하여 값이 `NaN`으로 변질되는 현상을 방지했습니다.
  - 가격 표기부(`toLocaleString()`)에 널 병합 보호 구문(`(Number(order.price) || 0).toLocaleString()`)을 적용하여 `TypeError` 발생을 방지했습니다.

---

### ④ 백엔드 소스코드(`MakeAWish-BE`) 직접 대조 및 검증 결과
- **컨트롤러 대조**: `OrderController.java`와 `ExtraFeeController.java`의 `@GetMapping`, `@PatchMapping`, `@PostMapping` 엔드포인트를 직접 조회하여 5대 API(`fetchOrders`, `fetchOrderById`, `updateOrderStatus`, `registerExtraFee`, `fetchExtraFee`)의 요청 경로 및 파라미터가 100% 일치함을 입증했습니다.

---

## 3. 🔍 코드 리뷰 및 안정성 확보 내역
1. **메모리 누수 방지**: `useEffect` 내부에 `let isMounted = true` 클로저 변수를 도입해 비동기 응답 도중 페이지 이동 시 불필요한 상태 갱신(Warning)을 방지했습니다.
2. **타 도메인 불변성 보장**: 고은님의 관리 탭 영역(`portfolioApi.js`, `storeApi.js`) 및 공통 통신 파일(`client.js`)을 건드리지 않고 분리된 모듈로 개발하여 병합 충돌 제로(0%)를 보장합니다.

---

## 4. 🧪 빌드 및 검증 로그
- **검증 결과**: 린트 에러 0건, 문법 오류 0건, 정상 번들링 성공 (`✓ built in 2.32s`)

---

## 5. 🛠️ 트러블슈팅 (Troubleshooting)

### ① `400 Bad Request (For input string: "order_004")` 에러 해결
- **문제 상황**: 프론트엔드의 로컬 Mock 주문 데이터 ID(`'order_004'`) 클릭 시, 백엔드 `OrderController`의 단건 조회 API(`GET /api/orders/order_004`)가 호출되면서 `400 Bad Request` 발생.
- **원인 분석**: 백엔드 컨트롤러 메소드는 숫자형 ID(`@PathVariable Long orderId`)를 기대하지만, 문자열 `'order_004'`가 인입되어 Spring Boot의 `NumberFormatException`이 발생함.
- **해결 방안 (`isMockOrderId` 방어 함수 도입)**:
  - `src/api/orderApi.js` 내부에 ID가 `'order_'`로 시작하거나 숫자로 파싱되지 않는 경우를 탐지하는 `isMockOrderId(orderId)` 검증 함수를 도입.
  - Mock 문자열 ID가 들어올 경우 실서버 네트워크 요청을 자동 생략(Bypass)하고, 프론트엔드 Zustand 스토어의 로컬 Mock 데이터를 부드럽게 렌더링하도록 개선.

### ② `ReferenceError: useEffect is not defined` 에러 해결
- **문제 상황**: `OrderDetail.jsx` 페이지 진입 시 런타임에서 `useEffect is not defined` 에러 발생.
- **원인 분석**: 코드 내에서 비동기 조회 훅으로 `useEffect`를 작성하였으나 최상단 React import 목록에서 누락됨. (Vite 번들러 빌드(`npm run build`)는 번들링 시 런타임 식별자 참조를 검출하지 않아 빌드가 성공했던 상황).
- **해결 방안**: `import { useState, useEffect, Fragment } from 'react'`로 명시적 추가 후 즉시 커밋 및 빌드 재검증 완료.
