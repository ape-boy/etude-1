# AI ChatOps 아키텍처 문서

이 문서는 AI ChatOps 애플리케이션의 전체 아키텍처와 주요 데이터 흐름을 설명합니다.

## 1. 개요

AI ChatOps는 Vue.js 기반의 웹 애플리케이션으로, 사용자가 다양한 전문가(페르소나)와 대화할 수 있도록 설계되었습니다. 애플리케이션은 주로 두 가지 모드로 동작합니다:

- **사용자 모드**: 일반 사용자가 페르소나를 선택하고 대화를 나누는 모드
- **관리자 모드**: 페르소나와 시스템 프롬프트를 관리하는 모드

## 2. 주요 구성 요소

### 2.1. 프론트엔드 (Vue.js)

#### 2.1.1. 루트 컴포넌트

- `src/main.js`: 애플리케이션의 진입점. `AIChatOpsLayout` 컴포넌트를 마운트합니다.
- `src/aiOps/AIChatOpsLayout.vue`: 메인 레이아웃 컴포넌트로, 전체 애플리케이션의 구조를 담당합니다.

#### 2.1.2. 주요 뷰 컴포넌트

- `ChatTab.vue`: 사용자와 페르소나 간의 대화를 표시하고 관리합니다.
- `FeedbackTab.vue`: 사용자 피드백을 수집하는 컴포넌트입니다.
- `AIChatOpsAdminPersona.vue`: 페르소나를 생성, 수정, 삭제할 수 있는 관리자 페이지입니다.
- `AIChatOpsAdminConversation.vue`: 대화 내역을 분석하고 통계를 제공하는 관리자 페이지입니다.

#### 2.1.3. UI 컴포넌트

- `Elements.vue`: 재사용 가능한 UI 요소(버튼, 스피너, 레이팅 등)를 제공합니다.
- `LucideIcon.vue`: Lucide 아이콘을 렌더링하는 컴포넌트입니다.

### 2.2. 서비스 계층

#### 2.2.1. 비즈니스 로직 서비스

- `aiChatOpsService.js`: 사용자 모드에서 사용되는 주요 API 호출을 담당합니다.
  - 페르소나 목록 조회
  - 메시지 전송
  - 빠른 질문 생성
  - 대화 기록 조회 및 삭제
  - 피드백 전송

- `aiChatOpsAdminService.js`: 관리자 모드에서 사용되는 API 호출을 담당합니다.
  - 페르소나 관리 (CRUD)
  - 시스템 프롬프트 테스트
  - 대화 분석 통계 조회

#### 2.2.2. 유틸리티 서비스

- `utilService.js`: 다양한 유틸리티 기능을 제공합니다.
  - 마크다운을 HTML로 변환
  - 콘텐츠 타입 감지
  - 대화 기록을 메시지 형식으로 변환
  - 페르소나 아이콘 생성

### 2.3. 백엔드 (Mock 서버)

- `mock-backend-server.js`: 애플리케이션의 백엔드 역할을 하는 Node.js/Express 서버입니다.
  - `/personas`: 페르소나 목록을 반환합니다.
  - `/message-async`: 사용자 메시지를 처리하고 AI 응답을 생성합니다.
  - `/quick-questions`: 페르소나별 빠른 질문을 생성합니다.
  - `/conversations/:personaCode`: 특정 페르소나의 대화 기록을 반환합니다.
  - `/feedback`: 사용자 피드백을 수신합니다.
  - 관리자 전용 엔드포인트: 페르소나 관리, 대화 분석 등

## 3. 데이터 흐름

### 3.1. 사용자 모드 데이터 흐름

1. 사용자가 `AIChatOpsLayout`의 카테고리를 선택합니다.
2. `AIChatOpsLayout`은 선택된 카테고리에 해당하는 페르소나 목록을 `aiChatOpsService.getPersonas()`를 통해 요청합니다.
3. 백엔드는 `mock-backend-server.js`에서 정의된 `mockPersonas` 데이터를 반환합니다.
4. 사용자가 페르소나를 선택하면, `AIChatOpsLayout`은 `ChatTab` 컴포넌트를 표시합니다.
5. 사용자가 메시지를 입력하면, `ChatTab`은 `aiChatOpsService.sendMessage()`를 호출합니다.
6. 백엔드는 `generateMockAIResponse()` 함수를 사용하여 AI 응답을 생성하고 반환합니다.
7. `ChatTab`은 응답을 수신하여 대화 기록에 추가하고 화면에 표시합니다.

### 3.2. 관리자 모드 데이터 흐름

1. 사용자가 `AIChatOpsLayout`의 시스템 관리 버튼을 클릭합니다.
2. `AIChatOpsLayout`은 `AIChatOpsAdminPersona` 또는 `AIChatOpsAdminConversation` 컴포넌트를 새 창에서 엽니다.
3. 관리자 페이지는 `aiChatOpsAdminService`를 통해 백엔드 API를 호출합니다.
4. 백엔드는 요청에 따라 페르소나 데이터를 조회, 생성, 수정, 삭제하거나 대화 분석 데이터를 반환합니다.

## 4. 주요 기능

### 4.1. 페르소나 기반 대화

- 사용자는 카테고리별로 다양한 전문가(페르소나)를 선택할 수 있습니다.
- 각 페르소나는 고유한 시스템 프롬프트를 가지며, 이에 따라 다른 응답 스타일과 전문성을 보여줍니다.

### 4.2. 마크다운 지원

- AI 응답은 마크다운 형식으로 작성되며, `utilService.formatContentMarkdown()`을 통해 HTML로 변환되어 표시됩니다.
- 테이블, 코드 블록, 강조, 링크 등 다양한 마크다운 기능을 지원합니다.

### 4.3. 대화 기록 관리

- 사용자의 대화 기록은 백엔드의 `conversationHistory` 객체에 저장됩니다.
- 사용자는 언제든지 대화 기록을 삭제할 수 있습니다.

### 4.4. 피드백 시스템

- 사용자는 `FeedbackTab`을 통해 서비스에 대한 피드백을 제출할 수 있습니다.
- 피드백은 별점과 코멘트로 구성되며, 백엔드에 저장됩니다.

## 5. 스타일링

- `aiChatOps.css`: 애플리케이션의 전역 CSS 변수와 주요 UI 컴포넌트 스타일을 정의합니다.
  - 테마 시스템 (AI-ChatOps, Heritage, Classic, Retro)
  - 버튼, 카드, 입력 요소 등의 통합 스타일
  - 반응형 디자인
- `customMarkdown.css`: 마크다운 콘텐츠의 스타일을 정의합니다.

## 6. 기타

- `i18n.js`: 다국어 지원을 위한 텍스트 리소스를 제공합니다. (한국어, 영어)
- `timerUtils.js`: 타이머 관련 유틸리티를 제공합니다.
- `vite.config.js`: Vite 빌드 설정을 정의합니다.

현재 프로젝트는 외부망에 있는 모듈 코드 최종본은 내부망 프로젝트에 인테그레이션 될 예정

원본 프로젝트의 프로젝트 구조

src/main/java/com/example/yourproject/
│
├── agent
│ ├── impl
│ │ ├── DomainRagService.java
│ │ ├── ReleaseNoteService.java
│ │ ├── VocAgentService.java
│ │ └── WeeklyReportService.java
│ └── rest
│ ├── LLMContextRestController.java
│ ├── ReleaseNotesRestController.java
│ └── WeeklyReportRestController.java
│
├── chatAdmin
│ ├── controller
│ │ └── ChatOpsAdminRestController.java
│ ├── dto
│ │ └── AIChatOpsAdminDto.java
│ ├── mapper
│ │ ├── ConversationMapper.java
│ │ └── PersonaPromptMapper.java
│ └── service
│ ├── ChatOpsAdminService.java
│ └── LLMAnalysisService.java
│
├── chatops
│ ├── config
│ │ ├── AIChatOpsConfig.java
│ │ ├── PromptConfig.java
│ │ └── PromptTemplateRegistry.java
│ ├── dto
│ │ └── AIChatOpsDto.java
│ ├── impl
│ │ └── AIChatOpsService.java
│ └── rest
│ ├── AIChatOpsRestController.java
│ └── ExtensionOpsRestController.java
│
├── llm
│ ├── config
│ │ └── LLMConfig.java
│ ├── service
│ │ └── LLMContextService.java
│ ├── rest
│ │ └── LLMCallRestController.java
│ └── LLMService.java
