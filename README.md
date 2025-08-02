# AI ChatOps 모듈형 서비스 시스템

내부망 통합을 위한 모듈형 AI ChatOps 서비스 시스템입니다. 4개의 독립적인 서비스로 구성되어 있으며, 각각 별도로 배포 및 운영이 가능합니다.

## 🏗️ 시스템 아키텍처

```
AI ChatOps System
├── 📱 Frontend Service (Port 3000)     - 사용자 채팅 인터페이스
├── 👑 Admin Service (Port 3002)        - 관리자 인터페이스
├── 🚀 Backend Service (Port 3005)      - REST API 서버
└── 🔧 VSCode Extension                 - 주간 보고서 생성 도구
```

## 📦 서비스 구성

### 1. AI ChatOps Frontend Service (`services/ai-chatops-frontend/`)
**사용자용 채팅 인터페이스**
- **기술스택**: Vue.js 3 + Vite
- **포트**: 3000
- **주요기능**: 
  - 다중 페르소나 채팅 시스템
  - 4가지 테마 지원 (AI-ChatOps, Heritage, Classic, Retro)
  - 한국어/영어 다국어 지원
  - 반응형 디자인

### 2. AI ChatOps Admin Service (`services/ai-chatops-admin/`)
**관리자용 인터페이스**
- **기술스택**: Vue.js 3 + Chart.js
- **포트**: 3002
- **주요기능**:
  - 페르소나 관리 (CRUD)
  - 시스템 프롬프트 관리
  - 대화 통계 및 분석
  - 실시간 차트 및 리포팅

### 3. AI ChatOps Backend Service (`services/ai-chatops-backend/`)
**REST API 서버**
- **기술스택**: Spring Boot 3.2.1 + MyBatis
- **포트**: 3005
- **주요기능**:
  - RESTful API 제공
  - H2 데이터베이스 (개발용)
  - 페르소나 및 대화 데이터 관리
  - 종합적인 에러 핸들링

### 4. AI ChatOps VSCode Extension (`services/ai-chatops-vscode-extension/`)
**주간 보고서 생성 도구**
- **기술스택**: JavaScript + VSCode Extension API
- **주요기능**:
  - AI 기반 주간 보고서 자동 생성
  - Git 연동 사용자 식별
  - 피드백 시스템
  - 워크스페이스 자동 저장

## 🚀 빠른 시작

### 1. 전체 시스템 구동

```bash
# Backend 서비스 시작 (포트 3005)
cd services/ai-chatops-backend
mvn spring-boot:run

# Frontend 서비스 시작 (포트 3000)  
cd services/ai-chatops-frontend
npm install && npm run dev

# Admin 서비스 시작 (포트 3002)
cd services/ai-chatops-admin  
npm install && npm run dev

# VSCode Extension 개발
cd services/ai-chatops-vscode-extension
npm install && npm run compile
```

### 2. 개별 서비스 빌드 확인

✅ **모든 서비스 빌드 테스트 완료**

```bash
# Frontend 빌드 성공 (161.22 kB bundle)
cd services/ai-chatops-frontend && npm run build

# Admin 빌드 성공 (163.50 kB bundle)  
cd services/ai-chatops-admin && npm run build

# VSCode Extension 빌드 성공 (10.1 KiB bundle)
cd services/ai-chatops-vscode-extension && npm run compile

# Backend 빌드 (Java/Maven 환경 필요)
cd services/ai-chatops-backend && mvn clean package
```

## 🔧 설정 및 구성

### 포트 구성
- **Frontend**: 3000 (사용자 접근)
- **Admin**: 3002 (관리자 접근)  
- **Backend**: 3005 (API 서버)

### CORS 설정
Backend에서 Frontend(3000)와 Admin(3002) 포트에 대한 CORS가 설정되어 있습니다.

### 데이터베이스
- **개발환경**: H2 인메모리 데이터베이스
- **운영환경**: PostgreSQL/MySQL (설정 변경 가능)

## 📚 각 서비스별 상세 문서

각 서비스 디렉토리에 완전한 독립 문서가 제공됩니다:

- [`services/ai-chatops-frontend/README.md`](services/ai-chatops-frontend/README.md) - Frontend 서비스 전체 가이드
- [`services/ai-chatops-admin/README.md`](services/ai-chatops-admin/README.md) - Admin 서비스 전체 가이드  
- [`services/ai-chatops-backend/README.md`](services/ai-chatops-backend/README.md) - Backend 서비스 전체 가이드
- [`services/ai-chatops-vscode-extension/README.md`](services/ai-chatops-vscode-extension/README.md) - VSCode Extension 전체 가이드

## 🔒 보안 및 인증

- JWT 기반 토큰 인증 (Backend)
- CORS 정책 적용
- Input validation 및 sanitization
- API rate limiting (설정 가능)

## 📊 모니터링 및 로깅

- Spring Boot Actuator (Backend)
- 구조화된 로깅 시스템
- 에러 추적 및 보고
- 성능 메트릭 수집

## 🚢 배포 가이드

### Docker 배포 (권장)
```bash
# 각 서비스별 Dockerfile 제공
docker build -t ai-chatops-frontend ./services/ai-chatops-frontend
docker build -t ai-chatops-admin ./services/ai-chatops-admin  
docker build -t ai-chatops-backend ./services/ai-chatops-backend
```

### 일반 배포
- Frontend/Admin: 정적 호스팅 (Nginx, Apache)
- Backend: JAR 파일 실행 또는 서블릿 컨테이너
- VSCode Extension: VSIX 패키지 배포

## 🔧 개발 환경 요구사항

### 공통
- Node.js >= 18.0.0
- npm >= 9.0.0

### Backend 추가
- JDK 17+
- Maven 3.8+

### VSCode Extension 추가  
- VSCode >= 1.74.0
- Git 설정 (user.name, user.email)

## 🛠️ 트러블슈팅

### 공통 문제해결

1. **포트 충돌**
   ```bash
   # 포트 사용 확인
   netstat -ano | findstr :3000
   netstat -ano | findstr :3002  
   netstat -ano | findstr :3005
   ```

2. **CORS 에러**
   - Backend의 `CorsConfig.java` 확인
   - 허용된 오리진에 Frontend/Admin URL 포함 확인

3. **의존성 문제**
   ```bash
   # 의존성 재설치
   rm -rf node_modules package-lock.json
   npm install
   ```

## 📈 성능 최적화

- **Frontend**: 번들 크기 최적화 (gzip: 60KB)
- **Admin**: 차트 라이브러리 지연 로딩
- **Backend**: 커넥션 풀링 및 쿼리 최적화
- **Extension**: 경량화된 번들 (10KB)

## 🤝 기여 가이드

1. 각 서비스별 코딩 표준 준수
2. 포괄적인 테스트 작성
3. 문서 업데이트
4. 컨벤셔널 커밋 메시지 사용

## 📝 라이선스

이 프로젝트는 내부망 통합용 모듈형 서비스로 개발되었습니다.