# Frontend Guidelines

## Module Context

사용자 입력을 서버 생성 요청으로 전달하고 반환된 코드를 미리보기·복사 화면에 연결한다. 서버 API 계약을 바꾸는 작업은 서버 지침도 확인한다.

## Tech Stack & Constraints

- React 19, react-live 4, TypeScript strict. 버전 범위는 루트 `package.json`을 기준으로 한다.
- 앱 자체는 TSX지만 생성 코드에는 별도의 실행 제약이 있다. 앱 소스 규칙을 생성 코드에 그대로 적용하지 않는다.

## Implementation Patterns

- 생성 요청과 결과·로딩·오류 상태는 `useComponentGenerator`에 모으고, 카드에는 콜백을 전달한다. 근거: `hooks/useComponentGenerator.ts:13`, `App.tsx:181`.
- 공통 테마는 `App.css`의 CSS 변수, 전역 기본값은 `index.css`에서 조정한다. 생성된 UI의 인라인 스타일과 앱 테마를 구분한다.
- API 계약: `POST /api/generate`에 `{ prompt, provider, apiKey? }`, 성공 응답은 `{ code }`, 오류 표시는 응답의 `error`를 사용한다. 근거: `hooks/useComponentGenerator.ts:23`.

## Testing Strategy

- 입력 테스트: `bun run test -- src/components/PromptInput.test.tsx`.
- React Testing Library와 user-event를 사용하며 공통 cleanup은 `src/test/setup.ts`에 있다.
- 입력 테스트는 빈 값·일반 제출·로딩과 500자 경계·초과 안내·단축키 제출 차단·오류 복구를 검증한다. 모델 전환, 네트워크 오류, 카드 탭 변경은 별도로 확인한다. 근거: `components/PromptInput.test.tsx:7`.
- CSS는 테스트 설정에서 비활성화되어 있다. 레이아웃 변경은 데스크톱·모바일 화면과 키보드 포커스를 직접 확인한다. 근거: `../vite.config.ts:19`.

## Local Golden Rules

- **이중 방어:** 버튼 비활성화뿐 아니라 제출 핸들러의 trim·로딩 가드도 유지한다. 키보드 단축키는 핸들러를 직접 호출한다. 근거: `components/PromptInput.tsx:26`, `components/PromptInput.tsx:53`, `components/PromptInput.tsx:74`.
- **비대칭:** UI 기본 공급자는 Google이지만 서버의 생략 시 기본값은 Anthropic이다. 요청에서 `provider`를 빼지 않는다. 공급자 전환 시 직접 입력한 키를 지우는 동작도 유지한다. 근거: `App.tsx:16`, `App.tsx:41`, `hooks/useComponentGenerator.ts:26`, `../server/index.ts:161`.
- **상태 제약:** 미리보기 새로고침은 key를 바꿔 리마운트하며 AI 재생성과 다르다. 새로고침에 생성 API를 연결하지 않는다. 근거: `components/ComponentCard.tsx:33`, `components/ComponentCard.tsx:41`, `components/ComponentCard.tsx:70`.
- **자료형 제약:** `createdAt`은 Date 객체다. 저장·복원 기능을 추가하면 문자열을 Date로 복구해야 시간 표시가 유지된다. 근거: `types/index.ts:7`, `hooks/useComponentGenerator.ts:39`, `components/ComponentCard.tsx:18`.
- **보안 경계:** `react-live`는 현재 페이지에서 생성 코드를 실행하며 격리된 샌드박스가 아니다. API 키나 앱 내부 상태를 추가 scope로 노출하지 않는다. 근거: `components/LivePreview.tsx:14`.
