package com.ssss.devportal.ai.admin.service;

import com.ssss.devportal.ai.admin.entity.ConversationEntity;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import javax.annotation.Resource;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

/**
 * LLM을 활용한 대화 분석 서비스
 * 모든 통계 분석 로직을 LLM에게 위임하여 처리
 */
@Service
public class LLMAnalysisService {

    private static final Logger logger = LoggerFactory.getLogger(LLMAnalysisService.class);
    
    // LLMService는 이미 구현되어 있다고 가정
    // @Autowired
    // private LLMService llmService;

    /**
     * 대화 데이터를 기반으로 LLM 분석 수행
     * @param conversations 분석할 대화 데이터
     * @param personaCode 분석 대상 페르소나 (선택사항)
     * @param period 분석 기간 (예: "7days", "30days", "all")
     * @return LLM 분석 결과
     */
    public String analyzeConversations(List<ConversationEntity> conversations, String personaCode, String period) {
        if (conversations == null || conversations.isEmpty()) {
            return "분석할 대화 데이터가 없습니다.";
        }

        try {
            // 시스템 프롬프트 생성
            String systemPrompt = buildAnalysisSystemPrompt();
            
            // 사용자 프롬프트 생성 (대화 데이터 포함)
            String userPrompt = buildAnalysisUserPrompt(conversations, personaCode, period);
            
            // LLM 호출
            String analysisResult = callLLMService(systemPrompt, userPrompt);
            
            logger.info("LLM analysis completed for {} conversations, persona: {}, period: {}", 
                       conversations.size(), personaCode, period);
            
            return analysisResult;
            
        } catch (Exception e) {
            logger.error("Failed to analyze conversations with LLM", e);
            return generateFallbackAnalysis(conversations, personaCode, period);
        }
    }

    /**
     * 시스템 프롬프트 테스트
     * @param systemPrompt 테스트할 시스템 프롬프트
     * @param testInput 테스트 입력
     * @param personaCode 페르소나 코드
     * @return 테스트 결과
     */
    public String testSystemPrompt(String systemPrompt, String testInput, String personaCode) {
        if (systemPrompt == null || systemPrompt.trim().isEmpty()) {
            return "Error: System prompt is empty";
        }
        
        if (testInput == null || testInput.trim().isEmpty()) {
            return "Error: Test input is empty";
        }

        try {
            // LLM 호출
            String testResult = callLLMService(systemPrompt, testInput);
            
            logger.info("System prompt test completed for persona: {}", personaCode);
            
            // 테스트 결과 포맷팅
            return formatTestResult(testResult, systemPrompt, testInput, personaCode);
            
        } catch (Exception e) {
            logger.error("Failed to test system prompt with LLM for persona: {}", personaCode, e);
            return "Error: Failed to test system prompt - " + e.getMessage();
        }
    }

    // Private helper methods

    /**
     * 분석용 시스템 프롬프트 생성
     */
    private String buildAnalysisSystemPrompt() {
        return """
        당신은 ChatOps 시스템의 운영 데이터 분석 전문가입니다.
        
        주어진 대화 데이터를 분석하여 다음 항목들에 대한 인사이트를 제공해주세요:
        
        1. **사용 패턴 분석**
        - 시간대별 사용 패턴
        - 사용자별 활동 분석
        - 페르소나별 인기도
        
        2. **대화 품질 분석**
        - 평균 대화 길이
        - 사용자 질문 유형 분석
        - AI 응답 품질 평가
        
        3. **운영 통계**
        - 총 대화 수
        - 활성 사용자 수
        - 가장 많이 사용된 페르소나
        
        4. **개선 권장사항**
        - 성능 최적화 방안
        - 사용자 경험 개선 제안
        - 시스템 운영 권장사항
        
        분석 결과는 다음 형식으로 제공해주세요:
        - 명확하고 구체적인 데이터 기반 인사이트
        - 실행 가능한 권장사항
        - 한국어로 작성
        - 마크다운 형식 사용
        """;
    }

    /**
     * 분석용 사용자 프롬프트 생성 (대화 데이터 포함)
     */
    private String buildAnalysisUserPrompt(List<ConversationEntity> conversations, String personaCode, String period) {
        StringBuilder prompt = new StringBuilder();
        
        // 분석 컨텍스트 정보
        prompt.append("## 분석 요청\n\n");
        prompt.append(String.format("- **분석 기간**: %s\n", period != null ? period : "전체"));
        prompt.append(String.format("- **대상 페르소나**: %s\n", personaCode != null ? personaCode : "전체"));
        prompt.append(String.format("- **총 대화 수**: %d개\n\n", conversations.size()));
        
        // 대화 데이터 샘플링 (너무 많으면 일부만 포함)
        prompt.append("## 대화 데이터\n\n");
        
        int maxConversations = Math.min(conversations.size(), 50); // 최대 50개만 포함
        for (int i = 0; i < maxConversations; i++) {
            ConversationEntity conv = conversations.get(i);
            prompt.append(String.format("### 대화 %d\n", i + 1));
            prompt.append(String.format("- **페르소나**: %s\n", conv.getPersona()));
            prompt.append(String.format("- **사용자**: %s\n", conv.getCreator()));
            prompt.append(String.format("- **시간**: %s\n", formatDateTime(conv.getCreatedDate())));
            prompt.append(String.format("- **질문 길이**: %d자\n", 
                                      conv.getUserQuery() != null ? conv.getUserQuery().length() : 0));
            prompt.append(String.format("- **응답 길이**: %d자\n", 
                                      conv.getAiQuery() != null ? conv.getAiQuery().length() : 0));
            
            // 질문 내용 (100자로 제한)
            String userQuery = conv.getUserQuery();
            if (userQuery != null) {
                String shortQuery = userQuery.length() > 100 ? userQuery.substring(0, 100) + "..." : userQuery;
                prompt.append(String.format("- **질문**: %s\n", shortQuery));
            }
            
            prompt.append("\n");
        }
        
        if (conversations.size() > maxConversations) {
            prompt.append(String.format("*(총 %d개 대화 중 %d개만 표시)*\n\n", conversations.size(), maxConversations));
        }
        
        prompt.append("위 데이터를 기반으로 종합적인 분석을 수행해주세요.");
        
        return prompt.toString();
    }

    /**
     * LLM 서비스 호출 (실제 구현은 기존 서비스 사용)
     */
    private String callLLMService(String systemPrompt, String userPrompt) {
        try {
            // 실제 구현에서는 다음과 같이 호출
            // return llmService.LLMCallAsync("maverick", systemPrompt, userPrompt);
            
            // 임시 Mock 응답 (실제로는 위 코드로 교체)
            return generateMockAnalysisResult(userPrompt);
            
        } catch (Exception e) {
            logger.error("LLM service call failed", e);
            throw new RuntimeException("LLM service unavailable", e);
        }
    }

    /**
     * 테스트 결과 포맷팅
     */
    private String formatTestResult(String llmResponse, String systemPrompt, String testInput, String personaCode) {
        StringBuilder result = new StringBuilder();
        
        result.append("# System Prompt Test Result\n\n");
        result.append(String.format("**페르소나**: %s\n", personaCode));
        result.append(String.format("**테스트 시간**: %s\n\n", LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"))));
        
        result.append("## 테스트 입력\n");
        result.append(String.format("```\n%s\n```\n\n", testInput));
        
        result.append("## AI 응답\n");
        result.append(llmResponse).append("\n\n");
        
        result.append("## 시스템 프롬프트 정보\n");
        result.append(String.format("- **길이**: %d 문자\n", systemPrompt.length()));
        result.append(String.format("- **응답 길이**: %d 문자\n", llmResponse.length()));
        
        return result.toString();
    }

    /**
     * LLM 호출 실패 시 폴백 분석 결과 생성
     */
    private String generateFallbackAnalysis(List<ConversationEntity> conversations, String personaCode, String period) {
        StringBuilder result = new StringBuilder();
        
        result.append("# 대화 분석 결과 (기본 분석)\n\n");
        result.append("*LLM 분석 서비스를 사용할 수 없어 기본 통계를 제공합니다.*\n\n");
        
        // 기본 통계 정보
        result.append("## 기본 통계\n\n");
        result.append(String.format("- **총 대화 수**: %d개\n", conversations.size()));
        result.append(String.format("- **분석 기간**: %s\n", period != null ? period : "전체"));
        result.append(String.format("- **대상 페르소나**: %s\n\n", personaCode != null ? personaCode : "전체"));
        
        if (!conversations.isEmpty()) {
            // 사용자 수 계산
            long uniqueUsers = conversations.stream()
                    .map(ConversationEntity::getCreator)
                    .distinct()
                    .count();
            
            // 평균 길이 계산
            double avgQueryLength = conversations.stream()
                    .mapToInt(c -> c.getUserQuery() != null ? c.getUserQuery().length() : 0)
                    .average()
                    .orElse(0.0);
            
            double avgResponseLength = conversations.stream()
                    .mapToInt(c -> c.getAiQuery() != null ? c.getAiQuery().length() : 0)
                    .average()
                    .orElse(0.0);
            
            result.append(String.format("- **활성 사용자 수**: %d명\n", uniqueUsers));
            result.append(String.format("- **평균 질문 길이**: %.1f자\n", avgQueryLength));
            result.append(String.format("- **평균 응답 길이**: %.1f자\n\n", avgResponseLength));
        }
        
        result.append("## 권장사항\n\n");
        result.append("- LLM 분석 서비스 연결을 확인하여 더 상세한 분석을 받아보세요.\n");
        result.append("- 정기적인 대화 품질 모니터링을 수행하세요.\n");
        result.append("- 사용자 피드백을 수집하여 서비스를 개선하세요.\n");
        
        return result.toString();
    }

    /**
     * Mock 분석 결과 생성 (개발/테스트용)
     */
    private String generateMockAnalysisResult(String userPrompt) {
        return """
        # ChatOps 대화 분석 결과
        
        ## 📊 주요 통계
        
        - **총 대화 수**: 1,247개
        - **활성 사용자**: 156명
        - **평균 응답 시간**: 2.3초
        - **사용자 만족도**: 87%
        
        ## 📈 사용 패턴 분석
        
        ### 시간대별 사용 패턴
        - **피크 시간**: 오전 9-11시, 오후 2-4시
        - **최고 활성도**: 화요일, 수요일
        - **주말 사용률**: 평일 대비 23% 감소
        
        ### 인기 페르소나
        1. **weekly_report** (34%) - 주간 보고서 작성
        2. **data_analyst** (28%) - 데이터 분석 지원
        3. **general_assistant** (22%) - 일반 업무 지원
        
        ## 💡 개선 권장사항
        
        ### 즉시 개선 가능
        - 응답 속도 15% 향상 가능 (캐싱 최적화)
        - 자주 묻는 질문 템플릿 추가 필요
        
        ### 중장기 개선
        - 개인화된 추천 시스템 도입
        - 다국어 지원 확대
        - 모바일 접근성 개선
        
        ## 🎯 다음 달 목표
        
        - 사용자 만족도 90% 달성
        - 평균 응답 시간 2초 이하 달성
        - 신규 페르소나 3개 추가
        
        *분석 완료 시간: 2024-01-15 14:30*
        """;
    }

    /**
     * 날짜 시간 포맷팅
     */
    private String formatDateTime(LocalDateTime dateTime) {
        if (dateTime == null) {
            return "Unknown";
        }
        return dateTime.format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm"));
    }
}