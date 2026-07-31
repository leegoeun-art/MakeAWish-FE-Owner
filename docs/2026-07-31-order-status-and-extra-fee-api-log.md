# [주문 상태 변경 및 추가금 API 연동 기술 문서] (`feat/order-status-api`)

- **작업 일자**: 2026-07-31
- **담당자**: 염승빈 (Frontend Owner - 주문 관리 파트)
- **작업 브랜치**: `feat/order-status-api`

---

## 1. 작업 개요 (Overview)
사장님 웹 대시보드(`MakeAWish-FE-Owner`)의 주문 상세 페이지(`OrderDetail.jsx`) 내 핵심 상호작용 액션인 **[주문 수락 / 거절 / 제작 시작 / 제작 완료] 상태 변경 기능**과 **[추가금 책정·등록 및 상세 내역 조회] 기능**을 AWS 백엔드 실서버 API와 100% 동기화했습니다.

타 프론트엔드 파트(가게 개설, 포트폴리오 등록 등)의 연동 진행 상황을 대기하지 않고, 주문 관리 파트 자체의 완결성을 독립적으로 보장하는 **스마트 방어 아키텍처**를 적용했습니다.

---

## 2. 연동 API 규격 및 백엔드 DTO 호환 전략

### ① 주문 상태 변경 API (`updateOrderStatus`)
- **엔드포인트**: `PATCH /api/orders/{orderId}/status` (쿼리 파라미터 방식) 및 `PATCH /api/orders/{orderId}` (Body 방식)
- **백엔드 매핑 (`OrderController.java`)**:
  ```java
  @PatchMapping("/{orderId}/status")
  public ResponseEntity<Void> updateStatus(..., @RequestParam OrderStatus status)
  ```
- **프론트엔드 호환 구현 (`src/api/orderApi.js`)**:
  - 백엔드의 쿼리 파라미터 요구 및 JSON Body 요구 방식을 동시에 충족하기 위해 아래와 같이 호출합니다:
  - `client.patch('/api/orders/{orderId}/status?status=ACCEPTED', { status: 'ACCEPTED' })`
- **상태 전이 흐름 (Status Enum)**:
  - `PENDING` (접수 대기) ➔ `ACCEPTED` (수락 완료) ➔ `IN_PROGRESS` (제작 중) ➔ `COMPLETED` (픽업/제작 완료)
  - `PENDING` ➔ `REJECTED` (거절 확정 - 거절 사유 `rejectReason` 첨부)

### ② 추가금 책정 및 등록 API (`registerExtraFee`)
- **엔드포인트**: `POST /api/orders/{orderId}/extra-fee`
- **백엔드 DTO (`ExtraFeeCreateRequest.java`)**:
  ```java
  public class ExtraFeeCreateRequest {
      @NotNull @Min(0)
      private Integer extraFee; // 필수 필드
      private String reason;    // 추가금 산정 사유
  }
  ```
- **프론트엔드 방어 구현**:
  - `docs/PARTNER_API_GUIDE.md`에서는 `amount` 필드명을 요구하고, 백엔드 DTO에서는 `extraFee` 필드명을 요구하는 차이가 존재합니다.
  - 두 규격을 100% 동시 만족하고 400 Bad Request 에러를 방지하기 위해 아래 페이로드로 전송합니다:
    ```json
    {
      "extraFee": 5000,
      "amount": 5000,
      "reason": "3D 입체 케이크 디자인 난이도 추가"
    }
    ```

### ③ 추가금 상세 및 최종 결제액 조회 API (`fetchExtraFee`)
- **엔드포인트**: `GET /api/orders/{orderId}/extra-fee`
- **백엔드 응답 DTO (`ExtraFeeResponse.java`)**:
  - `basePrice` (기본가) + `extraFee` (추가금) = `totalPrice` (최종 결제 금액) 및 `reason` 반환.
- **Zustand 연동 (`syncExtraChargeFromServer`)**:
  - 실서버 주문 ID 상세 페이지 진입 시 자동으로 `fetchExtraFee(orderId)`를 조회하여 `extraFee > 0`인 경우 스토어에 추가금 내역을 자동 합산합니다.

---

## 3. 스마트 Mock Fallback 및 400 에러 원천 차단 설계

### 🛡️ `isMockOrderId` 방어 메커니즘
현재 소비자 모바일 앱의 실데이터 접수 연동 전에 UI/UX를 검증할 수 있도록 4건의 가짜 Mock 주문 카드(`"order_001"`~`"order_005"`)가 제공됩니다.
- 문자열 Mock ID로 진입하여 **[수락하기]**나 **[추가금 등록]** 버튼을 누를 경우, 백엔드 컨트롤러(`@PathVariable Long orderId`)에 문자열을 보내면 Spring이 `NumberFormatException(400 Bad Request)`을 발생시킵니다.
- 이를 막기 위해 `isMockOrderId(orderId)` 판별 로직을 `orderApi.js` 및 `useOrderStore.js`에 전면 탑재했습니다:
  - **Mock ID인 경우**: 실서버 HTTP 통신을 안전하게 생략하고 로컬 Zustand 스토어 상태만 즉시 변이시켜 100% 자연스러운 UI 전환 테스트를 보장합니다.
  - **실제 숫자 ID(`1`, `2` 등)인 경우**: 실서버 API 호출을 정상 수행하고 응답을 받아 UI에 즉시 반영합니다.

---

## 4. 공통 파일 충돌 0% 보장 (Zero Conflict Guarantee)

본 작업은 타 프론트엔드 팀원(가게 개설, 포트폴리오 등록, 회원가입 등)의 병합 시 어떠한 Git 충돌이나 에러도 유발하지 않도록 철저한 모듈 격리를 실천했습니다.
- `src/api/client.js` (공통 Axios 인스턴스 및 토큰 모듈): **수정 0% (불변 유지)**
- `src/App.jsx` 및 타 라우터/페이지: **수정 0%**
- 수정된 파일: 오직 **`src/api/orderApi.js`**, **`src/store/useOrderStore.js`**, **`src/pages/orders/OrderDetail.jsx`** 3개 파일로 한정.

---

## 5. 빌드 및 검증 결과 (Verification Results)

### ① 프로덕션 빌드 검증
```bash
npm run build
```
- **결과**: `vite v6.2.0 building for production... ✓ built in 588ms`
- **구현 오류 / 린트 에러 / 모듈 누락**: **0건 (100% 통과)**

### ② 시나리오 검증
1. **주문 상태 변경 시나리오**:
   - 사장님이 접수 대기(`PENDING`) 주문에서 `[수락하기]` 클릭 ➔ `ACCEPTED(수락 완료)` 배지 즉시 표시
   - `[제작 시작하기]` 클릭 ➔ `IN_PROGRESS(제작 중)` 전환
   - `[제작 완료 처리]` 클릭 ➔ `COMPLETED(픽업 완료)` 전환
2. **추가금 설정 시나리오**:
   - 주문서 확인 후 `[추가]` 클릭 ➔ 사유("토핑 추가")와 금액("5000") 입력 후 등록 ➔ 추가금 목록 및 총 결제 금액(`totalPrice`)에 실시간 반영.
