# 스타일매칭분석 제거 & 매장 운영시간 설정 추가

## 배경
프로토타입에서 주문 상세 화면의 "스타일 매칭 분석" 기능은 더 이상 필요하지 않아 제거한다.
대신 매장관리 화면에 매장 운영 시간을 요일별로 설정할 수 있는 기능을 추가한다.

## 1. 스타일매칭분석 기능 제거

### 대상
- `src/pages/orders/OrderDetail.jsx`
  - "스타일 매칭 분석" `Card` 블록 전체 삭제
  - `styleLoading` state, `styleResult` 변수 삭제
  - `useOrderStore`에서 `createStyleAnalysis`, `styleAnalyses` 구조분해 제거
  - 미사용 `PaintBrush` import 제거
- `src/store/useOrderStore.js`
  - `styleAnalyses: {}` 초기 상태 제거
  - `createStyleAnalysis` 액션 제거
  - `STYLE_TAGS_POOL` 상수 제거

### 영향
다른 화면에서 해당 기능을 참조하는 곳은 없음 (grep 확인 완료).

## 2. 매장 운영 시간 설정 추가

### 데이터 모델
`src/mocks/seed.js`의 `INITIAL_STORE_PROFILE`에 `businessHours` 필드 추가:

```js
businessHours: [
  { day: '월', open: '09:00', close: '20:00', closed: false },
  { day: '화', open: '09:00', close: '20:00', closed: false },
  { day: '수', open: '09:00', close: '20:00', closed: false },
  { day: '목', open: '09:00', close: '20:00', closed: false },
  { day: '금', open: '09:00', close: '20:00', closed: false },
  { day: '토', open: '10:00', close: '18:00', closed: false },
  { day: '일', open: '10:00', close: '18:00', closed: true },
]
```

### UI (`src/pages/store/StoreManage.jsx`)
기존 프로필 카드 바로 아래에 "운영 시간" 카드를 신규 추가한다. 이 카드는 상단 프로필 편집과 별개의 독립적인 편집 상태(`hoursEditing`, `hoursForm`, `savingHours`)를 갖는다.

- **읽기 모드**: 요일별 한 줄 요약 (`월  09:00 - 20:00`, 휴무일은 `일  휴무`)
- **편집 모드**: 요일마다 한 행에 요일 라벨, 오픈 시간(`<input type="time">`), 마감 시간(`<input type="time">`), 휴무 체크박스. 체크박스가 켜지면 해당 요일의 시간 입력 두 개는 비활성화된다.
- 편집 모드 진입/저장은 상단 프로필 카드와 동일한 연필 아이콘 + 저장 버튼 패턴을 따른다.
- 저장 시 기존 `updateProfile({ businessHours: hoursForm })`을 호출한다 (스토어에 새 액션을 추가하지 않고 기존 범용 액션 재사용).

### 범위 밖
- 공휴일 별도 설정, 시간대별 브레이크타임 등은 다루지 않는다 (요청 범위 밖).
