package com.ssss.devportal.ai.admin.mapper;

import com.ssss.devportal.ai.admin.entity.ConversationEntity;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.time.LocalDateTime;
import java.util.List;

@Mapper
public interface ConversationMapper {

    /**
     * 대화 목록 조회 (페이지네이션)
     * swp_chatops_conversation_storage 테이블에서 단순 조회
     */
    List<ConversationEntity> findConversationsPaged(
            @Param("offset") int offset,
            @Param("limit") int limit,
            @Param("personaCode") String personaCode,
            @Param("userId") String userId,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate
    );

    /**
     * 대화 목록 총 개수 조회 (페이지네이션용)
     */
    long countConversations(
            @Param("personaCode") String personaCode,
            @Param("userId") String userId,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate
    );

    /**
     * LLM 분석용 대화 데이터 조회 (통계 분석을 위한 원본 데이터 제공)
     * 통계는 LLM에서 처리하고, 여기서는 단순히 데이터만 제공
     */
    List<ConversationEntity> getConversationsForAnalysis(
            @Param("personaCode") String personaCode,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate,
            @Param("limit") int limit
    );

}