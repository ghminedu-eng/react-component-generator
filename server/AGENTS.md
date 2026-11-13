# Server Guidelines

## Module Context

Bun API가 공급자별 생성 요청과 응답 정규화를 담당한다. 순수 변환·폴백 모듈은 서버 시작 부수효과 없이 테스트할 수 있도록 분리되어 있다.

## Tech Stack & Constraints

- 런타임은 Bun의 `Bun.serve`, 외부 API 통신은 현재 native fetch다. 서버 엔트리포인트를 Node 전용 실행으로 대체하지 않는다. 근거: `index.ts:138`, `../package.json:8`.
- 생성물은 앱 소스와 달리 import·TypeScript 구문·외부 CSS 없는 JavaScript/JSX다. React는 실행기 scope에서 제공된다. 근거: `index.ts:10`, `index.ts:11`, `index.ts:20`.

## Implementation Patterns

- 응답은 코드펜스 제거 후 render 호출 보완 순서로 정규화한다. 모델 호출과 순수 코드 변환을 분리한다. 근거: `index.ts:188`, `generator.ts:1`.
- 공급자를 추가하면 서버의 Provider·키 매핑·호출 분기와 클라이언트의 Provider·설정 UI를 함께 맞춘다. 근거: `index.ts:57`, `index.ts:59`, `index.ts:184`, `../src/types/index.ts:1`, `../src/App.tsx:8`.

## Testing Strategy

- 순수 함수 테스트: `bun run test -- server/generator.test.ts server/fallback.test.ts`.
- 테스트는 vitest의 `describe/it/expect/vi`를 사용하며 순수 모듈을 직접 import한다. 테스트를 위해 `index.ts`를 import해 서버를 띄우지 않는다.
- `bun run build`의 TypeScript 프로젝트에는 서버가 포함되지 않는다. 서버 변경 검증에서 빌드 성공만으로 서버 타입 검사가 완료됐다고 보고하지 않는다. 근거: `../tsconfig.app.json:27`, `../tsconfig.node.json:25`.
- HTTP·공급자 통합 경로는 현재 테스트되지 않는다. 요청/응답을 변경할 때 fetch 대역 또는 로컬 HTTP 확인을 추가하고 외부 API 미검증 여부를 명시한다.

## Local Golden Rules

- **비대칭:** 순차 모델 폴백은 Google 경로에만 있다. 목록 순서, 첫 성공 시 종료, 모두 실패하면 마지막 오류 전달을 유지한다. Anthropic까지 확장하는 것은 별도 동작 변경이다. 근거: `index.ts:5`, `index.ts:135`, `fallback.ts:12`, `fallback.test.ts:5`.
- **비대칭:** Google의 `MAX_TOKENS` 결과는 잘린 코드를 성공으로 반환하지 않고 오류로 처리한다. 텍스트 추출 리팩터링 시 이 검사를 생략하지 않는다. 근거: `index.ts:122`.
- **이중 방어:** 시스템 프롬프트가 render 호출을 요구해도 정규화의 `ensureRenderCall`을 제거하지 않는다. 기존 render 호출은 중복 삽입하지 않는다. 근거: `index.ts:12`, `index.ts:188`, `generator.ts:14`, `generator.test.ts:21`.
- **키 선택:** 직접 입력한 키가 서버 환경 키보다 우선한다. 서버 키가 있다는 이유로 사용자 입력을 무시하지 않는다. 근거: `index.ts:64`.
- **오류 계약:** 공급자 오류의 503·429 상태와 사용자 안내를 유지한다. 일반 500으로 합치면 클라이언트가 상태를 구분하지 못한다. 근거: `index.ts:194`, `index.ts:201`.
- **보안 한계:** 현재 CORS는 `*`이고 생성 경로에 인증이 없다. 이 상태를 인증된 공개 서비스로 간주하지 않는다. 외부 노출 작업에서는 접근 제어를 별도로 검토한다. 근거: `index.ts:51`, `index.ts:159`.
