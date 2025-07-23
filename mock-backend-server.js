const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 3005;

// CORS 설정
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true
}));

app.use(express.json());

// Mock 페르소나 데이터
const mockPersonas = [
  {
    personaCode: 'personal_assistant',
    category: 'personal',
    title: '개인 비서',
    description: '일정 관리, 작업 우선순위 설정, 개인 생산성 향상을 도와드립니다.',
    descriptionEn: 'Helps with schedule management, task prioritization, and personal productivity improvement.',
    welcomeMsg: '안녕하세요! 개인 비서입니다.\n\n일정 관리나 작업 우선순위 설정 등 개인 생산성 향상에 도움이 필요하시면 언제든 말씀해 주세요.',
    systemPrompt: 'You are a personal assistant AI that helps with schedule management and productivity.'
  },
  {
    personaCode: 'data_analyst',
    category: 'general',
    title: '데이터 분석가',
    description: '데이터 분석, 시각화, 인사이트 도출을 전문으로 합니다.',
    descriptionEn: 'Specializes in data analysis, visualization, and insight generation.',
    welcomeMsg: '# 데이터 분석가입니다 📊\n\n데이터 분석, **시각화**, 그리고 비즈니스 인사이트 도출을 도와드리겠습니다.\n\n다음과 같은 업무를 지원합니다:\n- 데이터 분석 및 해석\n- 차트 및 그래프 생성\n- KPI 모니터링\n- 트렌드 분석',
    systemPrompt: 'You are a data analyst AI that helps with data analysis, visualization, and business insights.'
  },
  {
    personaCode: 'system_admin',
    category: 'operation',
    title: '시스템 관리자',
    description: '인프라 모니터링, 시스템 운영, 장애 대응을 담당합니다.',
    descriptionEn: 'Responsible for infrastructure monitoring, system operations, and incident response.',
    welcomeMsg: '## 시스템 관리자입니다 🔧\n\n**인프라 모니터링**과 시스템 운영을 담당하고 있습니다.\n\n### 주요 업무\n1. 서버 상태 모니터링\n2. 성능 최적화\n3. 장애 대응 및 복구\n4. 보안 관리\n\n시스템 관련 문의사항이 있으시면 언제든 말씀해 주세요!',
    systemPrompt: 'You are a system administrator AI that helps with infrastructure monitoring and system operations.'
  },
  {
    personaCode: 'project_manager',
    category: 'operation',
    title: '프로젝트 매니저',
    description: '프로젝트 계획, 진행상황 관리, 팀 협업을 지원합니다.',
    descriptionEn: 'Supports project planning, progress management, and team collaboration.',
    welcomeMsg: '# 프로젝트 매니저입니다 📋\n\n프로젝트의 **성공적인 완수**를 위해 다음과 같은 지원을 제공합니다:\n\n## 주요 서비스\n- ✅ 프로젝트 계획 수립\n- 📊 진행상황 모니터링\n- 👥 팀 협업 지원\n- ⚠️ 리스크 관리\n- 📈 성과 분석\n\n프로젝트 관련 어떤 도움이 필요하신가요?',
    systemPrompt: 'You are a project manager AI that helps with project planning, progress tracking, and team collaboration.'
  },
  {
    personaCode: 'business_analyst',
    category: 'general',
    title: '비즈니스 분석가',
    description: '비즈니스 프로세스 분석, 요구사항 정의, 개선안 제시를 합니다.',
    descriptionEn: 'Analyzes business processes, defines requirements, and proposes improvements.',
    welcomeMsg: '## 비즈니스 분석가입니다 💼\n\n비즈니스 프로세스 개선과 효율성 향상을 도와드립니다.\n\n### 전문 분야\n- 📋 요구사항 분석\n- 🔄 프로세스 최적화\n- 📊 성과 지표 설계\n- 💡 개선안 제시\n\n> 어떤 비즈니스 과제를 해결하고 싶으신가요?',
    systemPrompt: 'You are a business analyst AI that helps with process analysis and business improvement.'
  },
  {
    personaCode: 'weekly_report',
    category: 'operation',
    title: '주간 보고서 작성자',
    description: '주간 업무 진행 상황, 성과 분석, 이슈 요약을 포함한 보고서를 작성합니다.',
    descriptionEn: 'Creates weekly reports including work progress, performance analysis, and issue summaries.',
    welcomeMsg: '# 주간 보고서 작성자입니다 📋\n\n**주간 보고서 작성**을 전담하고 있습니다.\n\n## 제공하는 보고서\n- 📊 **업무 진행 현황**\n- 📈 **성과 지표 분석** \n- ⚠️ **주요 이슈 및 해결 방안**\n- 🎯 **다음 주 계획**\n- 👥 **팀 성과 요약**\n\n### 보고서 형식\n```markdown\n# 주간 보고서 (2024-W03)\n## 주요 성과\n## 진행 현황\n## 이슈 사항\n## 다음 주 계획\n```\n\n주간 보고서 작성이 필요하시면 언제든 말씀해 주세요!',
    systemPrompt: 'You are a weekly report writer AI that creates comprehensive weekly reports including work progress, achievements, issues, and next week plans.'
  },
  {
    personaCode: 'jql_reporter',
    category: 'operation',
    title: 'JQL 리포터',
    description: 'JIRA JQL 쿼리 작성과 개발 메트릭 분석을 전문으로 합니다.',
    descriptionEn: 'Specializes in JIRA JQL query writing and development metrics analysis.',
    welcomeMsg: '# JQL 리포터입니다 🎯\n\n**JIRA JQL 쿼리** 작성과 개발 메트릭 분석을 도와드립니다.\n\n## 제공 서비스\n```sql\n-- 예시 JQL 쿼리\nproject = "MYPROJECT" AND status = "In Progress"\nAND assignee = currentUser()\nORDER BY priority DESC\n```\n\n### 주요 기능\n- 🔍 JQL 쿼리 최적화\n- 📈 개발 메트릭 분석\n- 📊 대시보드 구성\n- 🎯 KPI 추적\n\nJQL 관련 질문이 있으시면 언제든 말씀해 주세요!',
    systemPrompt: 'You are a JQL reporter AI that specializes in JIRA JQL queries and development metrics.'
  }
];

// 대화 기록을 저장할 메모리 스토리지
const conversationHistory = {};

// Mock AI 응답 생성 함수
function generateMockAIResponse(personaCode, userQuery, queryHistory) {
  const persona = mockPersonas.find(p => p.personaCode === personaCode);
  const personaTitle = persona ? persona.title : '어시스턴트';
  
  // 페르소나별 특화 응답
  if (personaCode === 'data_analyst') {
    return `# 데이터 분석 결과 📊

안녕하세요, **데이터 분석가**입니다. "${userQuery}" 관련하여 분석해드리겠습니다.

## 분석 개요
요청하신 내용에 대한 데이터 분석을 수행했습니다.

### 주요 지표
- **성능 지표**: 85% 향상
- **사용률**: 72% 증가  
- **만족도**: 4.2/5.0

## 시각화
\`\`\`
┌─────────────────────────────────┐
│  데이터 트렌드 차트              │
│  ████████████████████▒▒▒▒▒▒    │
│  Progress: 80%                  │
└─────────────────────────────────┘
\`\`\`

### 권장사항
1. **단기 목표**: 현재 트렌드 유지
2. **중기 계획**: 추가 최적화 필요
3. **장기 전략**: 새로운 접근 방식 검토

> 추가 분석이 필요하시면 언제든 말씀해 주세요!`;
  }
  
  if (personaCode === 'weekly_report') {
    const currentDate = new Date();
    const weekNum = Math.ceil((currentDate.getDate() + new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay()) / 7);
    const yearWeek = `${currentDate.getFullYear()}-W${weekNum.toString().padStart(2, '0')}`;
    
    return `# 주간 보고서 ${yearWeek} 📋

**주간 보고서 작성자**입니다. "${userQuery}" 요청에 따라 이번 주 보고서를 작성해드립니다.

## 📊 주요 성과 및 지표

### 업무 완료 현황
| 구분 | 계획 | 완료 | 진행률 |
|------|------|------|--------|
| 개발 작업 | 12건 | 10건 | 83% |
| 코드 리뷰 | 8건 | 8건 | 100% |
| 테스트 작업 | 6건 | 5건 | 83% |
| 문서화 | 4건 | 3건 | 75% |

### 성과 지표
- **전체 업무 완료율**: 85%
- **코드 품질 점수**: 4.2/5.0
- **버그 발견율**: 12% (목표: 15% 이하)
- **고객 만족도**: 4.5/5.0

## 🎯 주요 성과

### 이번 주 하이라이트
1. **신규 기능 출시** - AI 챗봇 기능 정식 런칭
2. **성능 개선** - 응답 시간 30% 단축 달성
3. **팀 협업** - 크로스팀 프로젝트 성공적 완료

\`\`\`
주간 성과 트렌드
│      ●
│    ●   ●
│  ●       ●
│            ●●
└─────────────────
 Mon Tue Wed Thu Fri
\`\`\`

## ⚠️ 주요 이슈 및 해결 방안

### 해결된 이슈
- ✅ **서버 지연 문제** → 캐싱 시스템 도입으로 해결
- ✅ **UI 호환성 문제** → 브라우저별 테스트 완료

### 진행 중인 이슈
- 🔄 **데이터베이스 최적화** → 다음 주 완료 예정
- 🔄 **보안 검토** → 외부 업체와 협의 중

### 위험 요소
- ⚠️ **리소스 부족** → 추가 인력 투입 검토 필요
- ⚠️ **일정 지연 위험** → 우선순위 재조정 필요

## 🚀 다음 주 계획

### 주요 목표
1. **데이터베이스 최적화** 완료
2. **모바일 앱 버전** 개발 시작
3. **성능 모니터링** 시스템 구축
4. **팀 교육** 프로그램 실시

### 예상 일정
- **월요일**: 데이터베이스 마이그레이션
- **화요일-수요일**: 모바일 앱 설계
- **목요일**: 성능 테스트
- **금요일**: 주간 회고 및 다음 주 계획

## 👥 팀별 성과 요약

### 개발팀
- 완료: 신규 기능 3개, 버그 수정 5건
- 진행: API 개선 작업
- 이슈: 없음

### QA팀  
- 완료: 테스트 케이스 20개 작성
- 진행: 자동화 테스트 환경 구축
- 이슈: 테스트 도구 라이선스 만료 예정

### DevOps팀
- 완료: CI/CD 파이프라인 개선
- 진행: 모니터링 시스템 업그레이드  
- 이슈: 클라우드 비용 증가

---

> **다음 주 보고서**는 금요일에 작성될 예정입니다.
> 
> 추가 세부사항이나 특정 영역에 대한 분석이 필요하시면 언제든 말씀해 주세요!`;
  }
  
  if (personaCode === 'system_admin') {
    return `## 시스템 상태 보고 🔧

**시스템 관리자**입니다. "${userQuery}" 관련 시스템 정보를 확인했습니다.

### 현재 시스템 상태
| 구분 | 상태 | 사용률 |
|------|------|--------|
| CPU | 정상 | 65% |
| 메모리 | 정상 | 78% |
| 디스크 | 주의 | 85% |
| 네트워크 | 정상 | 42% |

#### 주요 메트릭
- **가동시간**: 45일 12시간
- **응답시간**: 평균 120ms
- **오류율**: 0.02%

\`\`\`bash
# 시스템 점검 명령어
sudo systemctl status myapp
docker ps -a
tail -f /var/log/application.log
\`\`\`

### 권장 조치
1. ⚠️ **디스크 용량** 정리 필요
2. ✅ 전반적인 시스템 상태 양호
3. 🔍 정기 모니터링 지속

문제가 발생하면 즉시 알려주세요!`;
  }
  
  if (personaCode === 'project_manager') {
    return `# 프로젝트 현황 보고 📋

**프로젝트 매니저**입니다. "${userQuery}" 관련 프로젝트 상황을 정리해드립니다.

## 프로젝트 개요
현재 진행중인 프로젝트의 상태를 분석했습니다.

### 진행 현황
- **전체 진행률**: 68%
- **예정 완료일**: 2024-02-15
- **위험도**: 중간

#### 마일스톤 현황
\`\`\`
Phase 1: ████████████████████ 100% ✅
Phase 2: ███████████▒▒▒▒▒▒▒▒▒ 60%  🔄
Phase 3: ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒ 0%   ⏳
\`\`\`

### 팀 현황
| 팀원 | 역할 | 진행률 | 상태 |
|------|------|--------|------|
| 김개발 | Frontend | 75% | 순조 |
| 이백엔드 | Backend | 60% | 지연 |
| 박디자인 | Design | 90% | 완료 |

### 다음 액션 아이템
1. **백엔드 개발** 일정 재조정 필요
2. **코드 리뷰** 프로세스 강화
3. **QA 테스트** 준비 시작

궁금한 점이 있으시면 언제든 말씀해 주세요!`;
  }
  
  if (personaCode === 'jql_reporter') {
    return `# JQL 쿼리 분석 결과 🎯

**JQL 리포터**입니다. "${userQuery}" 관련 JIRA 데이터를 분석했습니다.

## 추천 JQL 쿼리
\`\`\`sql
project = "DEMO" AND status IN ("To Do", "In Progress") 
AND assignee = currentUser() 
AND created >= -30d 
ORDER BY priority DESC, created DESC
\`\`\`

### 메트릭 분석
| 구분 | 이번 주 | 지난 주 | 변화율 |
|------|---------|---------|--------|
| 생성된 이슈 | 23 | 18 | +28% |
| 완료된 이슈 | 19 | 22 | -14% |
| 진행중 이슈 | 31 | 27 | +15% |

#### 개발 효율성 지표
- **평균 처리시간**: 3.2일
- **백로그 크기**: 47개 이슈
- **번다운 속도**: 일일 2.1개

\`\`\`
이슈 트렌드 (최근 30일)
│     ●
│   ●   ●
│ ●       ●
│           ●
└─────────────────
  Week1  Week2  Week3  Week4
\`\`\`

### 추가 분석 쿼리
\`\`\`sql
-- 우선순위별 이슈 분포
project = "DEMO" AND status != "Done" 
GROUP BY priority

-- 담당자별 워크로드
assignee IN (membersOf("developers")) 
AND status = "In Progress"
\`\`\`

더 구체적인 JQL 쿼리가 필요하시면 말씀해 주세요!`;
  }
  
  // 기본 응답
  return `# ${personaTitle} 응답

안녕하세요! **${personaTitle}**입니다. 

"${userQuery}"에 대해 다음과 같이 답변드립니다:

## 주요 내용
귀하의 질문을 분석한 결과, 다음과 같은 사항들을 고려해볼 수 있습니다.

### 분석 결과
- **현황**: 전반적으로 양호한 상태입니다
- **권장사항**: 지속적인 모니터링이 필요합니다
- **다음 단계**: 구체적인 실행 계획을 세워보겠습니다

> 추가적인 질문이나 더 자세한 분석이 필요하시면 언제든 말씀해 주세요!

\`\`\`
상태: 정상 ✅
업데이트: ${new Date().toLocaleString('ko-KR')}
\`\`\``;
}

// 빠른 질문 생성 함수
function generateQuickQuestions(personaCode) {
  const questionSets = {
    'data_analyst': [
      "최근 1개월 사용자 증가율은?",
      "주요 KPI 지표 현황을 알려줘",
      "데이터 시각화 차트를 만들어줘",
      "성과 분석 보고서를 작성해줘",
      "트렌드 분석 결과는?"
    ],
    'system_admin': [
      "현재 서버 상태를 확인해줘",
      "디스크 사용량은 얼마나 되나?",
      "최근 에러 로그를 분석해줘",
      "시스템 성능 최적화 방법은?",
      "백업 상태를 점검해줘"
    ],
    'project_manager': [
      "프로젝트 진행률은 어떻게 되나?",
      "팀 업무 배분 상황을 알려줘",
      "일정 지연 위험도는?",
      "다음 마일스톤까지 남은 작업은?",
      "리소스 현황을 정리해줘"
    ],
    'jql_reporter': [
      "이번 주 완료된 이슈는?",
      "우선순위 높은 버그 목록을 보여줘",
      "팀별 이슈 처리 현황은?",
      "백로그 크기는 얼마나 되나?",
      "평균 이슈 처리 시간은?"
    ],
    'personal_assistant': [
      "오늘 일정을 정리해줘",
      "중요한 작업 우선순위를 알려줘",
      "회의 준비사항은?",
      "이번 주 목표 달성률은?",
      "시간 관리 팁을 알려줘"
    ],
    'weekly_report': [
      "주간 보고서를 작성해줘",
      "이번 주 주요 성과는?",
      "팀별 업무 완료 현황을 알려줘",
      "다음 주 계획을 세워줘",
      "주요 이슈와 해결 방안은?"
    ]
  };
  
  return questionSets[personaCode] || [
    "현재 상황을 분석해줘",
    "개선 방안을 제시해줘",
    "주요 이슈는 무엇인가?",
    "다음 단계는?",
    "추천 사항을 알려줘"
  ];
}

// API 엔드포인트들
app.get('/health', (req, res) => {
  res.json({
    success: true,
    data: {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    },
    message: 'Server is running successfully'
  });
});

app.get('/personas', (req, res) => {
  res.json({
    success: true,
    data: mockPersonas,
    message: 'Personas loaded successfully'
  });
});

app.post('/message-async', (req, res) => {
  const { personaCode, userQuery, queryHistory } = req.body;
  
  if (!personaCode || !userQuery) {
    return res.status(400).json({
      success: false,
      message: 'personaCode and userQuery are required'
    });
  }
  
  // 대화 기록 저장
  if (!conversationHistory[personaCode]) {
    conversationHistory[personaCode] = [];
  }
  
  const conversationId = `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const conversation = {
    conversationId,
    personaCode,
    userQuery,
    aiResponse: generateMockAIResponse(personaCode, userQuery, queryHistory),
    createdDate: new Date().toISOString()
  };
  
  conversationHistory[personaCode].push(conversation);
  
  // 최근 20개만 유지
  if (conversationHistory[personaCode].length > 20) {
    conversationHistory[personaCode] = conversationHistory[personaCode].slice(-20);
  }
  
  // 응답 지연 시뮬레이션 (500ms ~ 1500ms)
  const delay = Math.random() * 1000 + 500;
  
  setTimeout(() => {
    res.json({
      success: true,
      data: {
        aiResponse: conversation.aiResponse,
        conversationId: conversationId
      },
      message: 'Message processed successfully'
    });
  }, delay);
});

app.get('/quick-questions', (req, res) => {
  const { personaCode } = req.query;
  const questions = generateQuickQuestions(personaCode);
  
  res.json({
    success: true,
    data: questions,
    message: 'Quick questions generated successfully'
  });
});

app.get('/conversations/:personaCode', (req, res) => {
  const { personaCode } = req.params;
  const conversations = conversationHistory[personaCode] || [];
  
  res.json({
    success: true,
    data: conversations,
    message: 'Conversations loaded successfully'
  });
});

app.delete('/conversations/:personaCode', (req, res) => {
  const { personaCode } = req.params;
  
  if (conversationHistory[personaCode]) {
    delete conversationHistory[personaCode];
  }
  
  res.json({
    success: true,
    data: { deletedPersonaCode: personaCode },
    message: 'Conversations deleted successfully'
  });
});

app.get('/feedback', (req, res) => {
  res.json({
    success: true,
    data: { received: true, timestamp: new Date().toISOString() },
    message: 'Feedback received successfully'
  });
});

// 서버 시작
app.listen(PORT, () => {
  console.log(`🚀 Mock backend server is running on http://localhost:${PORT}`);
  console.log('📊 Available endpoints:');
  console.log('  GET  /health');
  console.log('  GET  /personas');
  console.log('  POST /message-async');
  console.log('  GET  /quick-questions');
  console.log('  GET  /conversations/:personaCode');
  console.log('  DELETE /conversations/:personaCode');
  console.log('  GET  /feedback');
});