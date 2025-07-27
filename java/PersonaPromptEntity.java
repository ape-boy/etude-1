package com.ssss.devportal.ai.admin.entity;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * swp_chatops_persona_prompt 테이블과 매핑되는 엔티티 클래스
 * 
 * 테이블 구조:
 * - PROMPT_ID (BIGINT) - Primary Key, 히스토리 관리용
 * - PERSONA_CODE (VARCHAR) - 페르소나 식별자
 * - PROMPT_TYPE (VARCHAR) - CORE/PERSONA (PERSONA만 사용)
 * - PROMPT (TEXT) - 시스템 프롬프트 내용
 * - CREATED_DATE (DATETIME) - 생성일시
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PersonaPromptEntity {

    /**
     * 프롬프트 ID (Primary Key)
     * 히스토리 관리를 위한 자동 증가 ID
     */
    private Long promptId;

    /**
     * 페르소나 코드
     * 예: weekly_report, data_analyst, general_assistant
     */
    private String personaCode;

    /**
     * 프롬프트 타입
     * CORE: 시스템 코어 프롬프트
     * PERSONA: 페르소나별 프롬프트 (주로 사용)
     */
    private String promptType;

    /**
     * 시스템 프롬프트 내용
     */
    private String prompt;

    /**
     * 생성일시
     */
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime createdDate;

    /**
     * PersonaDto로 변환하는 메서드
     */
    public com.ssss.devportal.ai.admin.entity.PersonaMgntDto.PersonaDto toPersonaDto() {
        // 프롬프트 내용에서 제목과 설명 추출
        String title = extractTitleFromPrompt();
        String description = extractDescriptionFromPrompt();
        
        return com.ssss.devportal.ai.admin.entity.PersonaMgntDto.PersonaDto.builder()
                .personaCode(this.personaCode)
                .title(title)
                .description(description)
                .descriptionEn(description)
                .category(inferCategoryFromPersonaCode())
                .systemPrompt(this.prompt)
                .active(true)
                .createdDate(formatDateTime(this.createdDate))
                .updatedDate(formatDateTime(this.createdDate))
                .build();
    }

    /**
     * 프롬프트 내용에서 제목 추출
     */
    private String extractTitleFromPrompt() {
        if (prompt == null || prompt.trim().isEmpty()) {
            return personaCode != null ? personaCode.replace("_", " ").toUpperCase() : "Unknown";
        }
        
        String[] lines = prompt.split("\n");
        for (String line : lines) {
            line = line.trim();
            if (line.startsWith("# ")) {
                return line.substring(2).trim();
            }
        }
        
        return personaCode != null ? personaCode.replace("_", " ").toUpperCase() : "AI Assistant";
    }

    /**
     * 프롬프트 내용에서 설명 추출
     */
    private String extractDescriptionFromPrompt() {
        if (prompt == null || prompt.trim().isEmpty()) {
            return "AI Assistant Persona";
        }
        
        String[] lines = prompt.split("\n");
        for (String line : lines) {
            line = line.trim();
            if (!line.isEmpty() && !line.startsWith("#") && !line.startsWith("---")) {
                return line.length() > 200 ? line.substring(0, 200) + "..." : line;
            }
        }
        
        return "AI Assistant Persona";
    }

    /**
     * 페르소나 코드로부터 카테고리 추론
     */
    private String inferCategoryFromPersonaCode() {
        if (personaCode == null) return "general";
        
        String lower = personaCode.toLowerCase();
        if (lower.contains("personal") || lower.contains("private")) {
            return "personal";
        } else if (lower.contains("operation") || lower.contains("ops") || lower.contains("admin")) {
            return "operation";
        } else {
            return "general";
        }
    }

    /**
     * LocalDateTime을 문자열로 변환
     */
    private String formatDateTime(LocalDateTime dateTime) {
        if (dateTime == null) {
            return null;
        }
        return dateTime.toString().substring(0, 19).replace("T", " ");
    }

    /**
     * 엔티티 유효성 검증
     */
    public boolean isValid() {
        return personaCode != null && !personaCode.trim().isEmpty() &&
               promptType != null && !promptType.trim().isEmpty() &&
               prompt != null && !prompt.trim().isEmpty();
    }

    /**
     * 생성 시 기본값 설정
     */
    public void setDefaults() {
        if (this.createdDate == null) {
            this.createdDate = LocalDateTime.now();
        }
        if (this.promptType == null) {
            this.promptType = "PERSONA";
        }
    }

    /**
     * 요약 정보 반환
     */
    public String getSummary() {
        String shortPrompt = prompt != null && prompt.length() > 100 ? 
                            prompt.substring(0, 100) + "..." : prompt;
        return String.format("PersonaPrompt[id=%d, code=%s, type=%s, prompt=%s]", 
                           promptId, personaCode, promptType, shortPrompt);
    }

    /**
     * 히스토리 엔트리인지 확인 (최신 버전이 아닌 경우)
     */
    public boolean isHistoryEntry() {
        // 이 메서드는 서비스 레이어에서 최신 여부를 판단할 때 사용
        return false; // 기본값, 실제 판단은 서비스에서 수행
    }
}