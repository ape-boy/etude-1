package com.example.yourproject.chatAdmin.mapper;

import com.example.yourproject.chatAdmin.dto.AIChatOpsAdminDto;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * PersonaPromptMapper - swp_ai_chatops_persona_prompt table mapping
 */
@Mapper
public interface PersonaPromptMapper {
    
    /**
     * Get all personas with prompts
     * @return persona list
     */
    List<AIChatOpsAdminDto> selectAllPersonasWithPrompts();
    
    /**
     * Get persona by code
     * @param personaCode persona code
     * @return persona info
     */
    AIChatOpsAdminDto selectPersonaByCode(@Param("personaCode") String personaCode);
    
    /**
     * Create persona
     * @param persona persona info
     * @return created rows
     */
    int insertPersona(AIChatOpsAdminDto persona);
    
    /**
     * Update persona
     * @param persona persona info
     * @return updated rows
     */
    int updatePersona(AIChatOpsAdminDto persona);
    
    /**
     * Delete persona
     * @param personaCode persona code
     * @return deleted rows
     */
    int deletePersona(@Param("personaCode") String personaCode);
    
    /**
     * Get prompt by type and code
     * @param personaCode persona code
     * @param promptType prompt type
     * @return prompt info
     */
    AIChatOpsAdminDto selectPersonaPromptByTypeAndCode(
        @Param("personaCode") String personaCode, 
        @Param("promptType") String promptType
    );
    
    /**
     * Update persona prompt
     * @param personaCode persona code
     * @param promptType prompt type
     * @param personaPrompt prompt content
     * @return updated rows
     */
    int updatePersonaPrompt(
        @Param("personaCode") String personaCode,
        @Param("promptType") String promptType,
        @Param("personaPrompt") String personaPrompt
    );
    
    /**
     * Check persona code duplication
     * @param personaCode persona code to check
     * @return existing count
     */
    int countByPersonaCode(@Param("personaCode") String personaCode);
    
    /**
     * Get personas by category
     * @param category category
     * @return persona list
     */
    List<AIChatOpsAdminDto> selectPersonasByCategory(@Param("category") String category);
    
    /**
     * Get personas with paging
     * @param offset start position
     * @param limit count limit
     * @return persona list
     */
    List<AIChatOpsAdminDto> selectPersonasWithPaging(
        @Param("offset") int offset, 
        @Param("limit") int limit
    );
    
    /**
     * Get total persona count
     * @return total count
     */
    int countAllPersonas();
}