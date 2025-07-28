package com.example.yourproject.chatAdmin.mapper;

import com.example.yourproject.chatAdmin.dto.AIChatOpsAdminDto;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.time.LocalDateTime;
import java.util.List;

/**
 * ConversationMapper - swp_ai_chatops_storage table mapping
 */
@Mapper
public interface ConversationMapper {
    /**
     * Get conversations for analysis
     * 
     * @param personaCode persona code (null for all)
     * @param period      period (today, 7days, 30days, 90days, all)
     * @return conversation list
     */
    List<AIChatOpsAdminDto> selectConversationsForAnalysis(
            @Param("personaCode") String personaCode,
            @Param("period") String period);

    /**
     * Get conversations with paging
     * 
     * @param personaCode persona code (null for all)
     * @param creator     creator (null for all)
     * @param startDate   start date (null to ignore)
     * @param endDate     end date (null to ignore)
     * @param offset      start position
     * @param limit       count limit
     * @return conversation list
     */
    List<AIChatOpsAdminDto> selectConversationsWithPaging(
            @Param("personaCode") String personaCode,
            @Param("creator") String creator,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate,
            @Param("offset") int offset,
            @Param("limit") int limit);

    /**
     * Count total conversations
     * 
     * @param personaCode persona code (null for all)
     * @param creator     creator (null for all)
     * @param startDate   start date (null to ignore)
     * @param endDate     end date (null to ignore)
     * @return total count
     */
    int countConversations(
            @Param("personaCode") String personaCode,
            @Param("creator") String creator,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate);

    /**
     * Delete conversations by persona code
     * 
     * @param personaCode persona code
     * @return deleted rows
     */
    int deleteConversationsByPersonaCode(@Param("personaCode") String personaCode);

    /**
     * Get conversation statistics by period
     * 
     * @param personaCode persona code (null for all)
     * @param period      period
     * @return statistics info
     */
    AIChatOpsAdminDto selectConversationStatistics(
            @Param("personaCode") String personaCode,
            @Param("period") String period);

    /**
     * Get conversation counts by persona
     * 
     * @param period period
     * @return persona statistics list
     */
    List<AIChatOpsAdminDto> selectConversationCountsByPersona(@Param("period") String period);
}