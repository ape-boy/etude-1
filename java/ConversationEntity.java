package com.ssss.devportal.ai.admin.entity;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * swp_chatops_conversation_storage 테이블과 매핑되는 엔티티 클래스
 * 
 * 테이블 구조:
 * - PERSONA (VARCHAR) - 페르소나 코드
 * - USER_QUERY (TEXT) - 사용자 질문
 * - AI_QUERY (TEXT) - AI 응답
 * - CREATOR (VARCHAR) - 사용자 ID
 * - CREATED_DATE (DATETIME) - 생성 날짜
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ConversationEntity {

    /**
     * 데이터베이스 자동 생성 ID (Primary Key)
     */
    private Long id;

    /**
     * 페르소나 코드 (PERSONA 컬럼)
     */
    private String persona;

    /**
     * 사용자 질문 내용 (USER_QUERY 컬럼)
     */
    private String userQuery;

    /**
     * AI 응답 내용 (AI_QUERY 컬럼)
     */
    private String aiQuery;

    /**
     * 사용자 ID (CREATOR 컬럼)
     */
    private String creator;

    /**
     * 대화 생성 날짜 (CREATED_DATE 컬럼)
     */
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime createdDate;

    /**
     * ConversationDto로 변환하는 메서드 - 단순화된 DTO 필드에 맞춤
     */
    public com.ssss.devportal.ai.admin.entity.ConvMgntDto.ConversationDto toConversationDto() {
        return com.ssss.devportal.ai.admin.entity.ConvMgntDto.ConversationDto.builder()
                .id(this.id)
                .personaCode(this.persona)
                .userQuery(this.userQuery)
                .aiResponse(this.aiQuery)
                .userId(this.creator)
                .createdDate(this.createdDate)
                .responseTime(null)  // 응답시간은 별도 계산 필요
                .success(true)       // 기본값 true, 실제로는 에러 정보 기반으로 설정
                .build();
    }
}