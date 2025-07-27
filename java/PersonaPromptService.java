package com.ssss.devportal.ai.admin.service;

import com.ssss.devportal.ai.admin.entity.PersonaPromptEntity;
import com.ssss.devportal.ai.admin.entity.PersonaMgntDto.PersonaDto;
import com.ssss.devportal.ai.admin.mapper.PersonaPromptMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.annotation.Resource;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Persona System Prompt DB 관리 서비스
 * swp_chatops_persona_prompt 테이블 기반
 * 히스토리 관리: UPDATE 없이 INSERT만 사용
 */
@Service
@Transactional
public class PersonaPromptService {

    private static final Logger logger = LoggerFactory.getLogger(PersonaPromptService.class);
    
    private static final String DEFAULT_PROMPT_TYPE = "PERSONA";

    @Resource
    private PersonaPromptMapper personaPromptMapper;

    /**
     * 모든 페르소나 정보를 DB에서 로드 (최신 버전)
     */
    public List<PersonaDto> getAllPersonasWithPrompts() {
        try {
            List<PersonaPromptEntity> entities = personaPromptMapper.findAllLatestPrompts(DEFAULT_PROMPT_TYPE);
            
            List<PersonaDto> personas = entities.stream()
                .map(PersonaPromptEntity::toPersonaDto)
                .collect(Collectors.toList());
            
            logger.info("Loaded {} personas from database", personas.size());
            return personas;
            
        } catch (Exception e) {
            logger.error("Failed to load personas from database", e);
            return new ArrayList<>();
        }
    }

    /**
     * 특정 페르소나의 시스템 프롬프트 로드 (최신 버전)
     */
    public String getSystemPrompt(String personaCode) {
        if (personaCode == null || personaCode.trim().isEmpty()) {
            return null;
        }
        
        try {
            PersonaPromptEntity entity = personaPromptMapper.findLatestByPersonaCode(personaCode, DEFAULT_PROMPT_TYPE);
            
            if (entity == null) {
                logger.warn("Persona prompt not found: {}", personaCode);
                return null;
            }
            
            logger.debug("Loaded system prompt for persona: {}", personaCode);
            return entity.getPrompt();
            
        } catch (Exception e) {
            logger.error("Failed to load system prompt for persona: {}", personaCode, e);
            return null;
        }
    }

    /**
     * 페르소나 시스템 프롬프트 저장 (새 히스토리 생성)
     */
    public boolean saveSystemPrompt(String personaCode, String systemPrompt) {
        if (personaCode == null || personaCode.trim().isEmpty()) {
            logger.error("PersonaCode is required for saving system prompt");
            return false;
        }
        
        if (systemPrompt == null) {
            systemPrompt = "";
        }
        
        try {
            PersonaPromptEntity entity = PersonaPromptEntity.builder()
                .personaCode(personaCode)
                .promptType(DEFAULT_PROMPT_TYPE)
                .prompt(systemPrompt)
                .createdDate(LocalDateTime.now())
                .build();
            
            int result = personaPromptMapper.insertPersonaPrompt(entity);
            
            if (result > 0) {
                logger.info("Saved system prompt for persona: {} (ID: {})", personaCode, entity.getPromptId());
                
                // 히스토리 정리 (최근 10개만 유지)
                cleanupOldHistory(personaCode, 10);
                return true;
            }
            
            return false;
            
        } catch (Exception e) {
            logger.error("Failed to save system prompt for persona: {}", personaCode, e);
            return false;
        }
    }

    /**
     * 페르소나 존재 여부 확인
     */
    public boolean existsByPersonaCode(String personaCode) {
        if (personaCode == null || personaCode.trim().isEmpty()) {
            return false;
        }
        
        try {
            return personaPromptMapper.existsByPersonaCode(personaCode, DEFAULT_PROMPT_TYPE);
        } catch (Exception e) {
            logger.error("Failed to check persona existence: {}", personaCode, e);
            return false;
        }
    }

    /**
     * 페르소나 히스토리 조회
     */
    public List<PersonaPromptEntity> getPersonaHistory(String personaCode, int limit) {
        if (personaCode == null || personaCode.trim().isEmpty()) {
            return new ArrayList<>();
        }
        
        try {
            return personaPromptMapper.findHistoryByPersonaCode(personaCode, DEFAULT_PROMPT_TYPE, limit);
        } catch (Exception e) {
            logger.error("Failed to get persona history: {}", personaCode, e);
            return new ArrayList<>();
        }
    }

    /**
     * 페르소나 검색
     */
    public List<PersonaDto> searchPersonas(String keyword) {
        if (keyword == null || keyword.trim().isEmpty()) {
            return getAllPersonasWithPrompts();
        }
        
        try {
            List<PersonaPromptEntity> entities = personaPromptMapper.searchByKeyword(keyword, DEFAULT_PROMPT_TYPE);
            
            return entities.stream()
                .map(PersonaPromptEntity::toPersonaDto)
                .collect(Collectors.toList());
                
        } catch (Exception e) {
            logger.error("Failed to search personas with keyword: {}", keyword, e);
            return new ArrayList<>();
        }
    }

    /**
     * 시스템 프롬프트 유효성 검증
     */
    public String validateSystemPrompt(String systemPrompt) {
        if (systemPrompt == null || systemPrompt.trim().isEmpty()) {
            return "System prompt cannot be empty";
        }
        if (systemPrompt.length() < 10) {
            return "System prompt too short (minimum 10 characters)";
        }
        if (systemPrompt.length() > 100000) {
            return "System prompt too long (maximum 100000 characters)";
        }
        return "";
    }

    /**
     * 전체 페르소나 코드 목록 조회
     */
    public List<String> getAllPersonaCodes() {
        try {
            return personaPromptMapper.findAllPersonaCodes(DEFAULT_PROMPT_TYPE);
        } catch (Exception e) {
            logger.error("Failed to get all persona codes", e);
            return new ArrayList<>();
        }
    }

    /**
     * 페르소나별 히스토리 개수 조회
     */
    public int getHistoryCount(String personaCode) {
        if (personaCode == null || personaCode.trim().isEmpty()) {
            return 0;
        }
        
        try {
            return personaPromptMapper.countByPersonaCode(personaCode, DEFAULT_PROMPT_TYPE);
        } catch (Exception e) {
            logger.error("Failed to get history count for persona: {}", personaCode, e);
            return 0;
        }
    }

    /**
     * 특정 기간 내 생성된 프롬프트 조회
     */
    public List<PersonaPromptEntity> getPromptsInDateRange(LocalDateTime startDate, LocalDateTime endDate) {
        try {
            return personaPromptMapper.findByDateRange(startDate, endDate, DEFAULT_PROMPT_TYPE);
        } catch (Exception e) {
            logger.error("Failed to get prompts in date range", e);
            return new ArrayList<>();
        }
    }

    /**
     * 페르소나 생성 (새 프롬프트 저장)
     */
    public PersonaDto createPersona(PersonaDto personaDto) {
        if (personaDto == null || !personaDto.isValid()) {
            throw new IllegalArgumentException("Invalid persona data");
        }
        
        // 중복 체크
        if (existsByPersonaCode(personaDto.getPersonaCode())) {
            throw new IllegalArgumentException("PersonaCode already exists: " + personaDto.getPersonaCode());
        }
        
        // 기본 시스템 프롬프트 설정
        String systemPrompt = personaDto.getSystemPrompt();
        if (systemPrompt == null || systemPrompt.trim().isEmpty()) {
            systemPrompt = buildDefaultSystemPrompt(personaDto);
        }
        
        // 저장
        boolean saved = saveSystemPrompt(personaDto.getPersonaCode(), systemPrompt);
        
        if (!saved) {
            throw new RuntimeException("Failed to save persona");
        }
        
        // 생성된 페르소나 반환
        PersonaPromptEntity entity = personaPromptMapper.findLatestByPersonaCode(personaDto.getPersonaCode(), DEFAULT_PROMPT_TYPE);
        return entity != null ? entity.toPersonaDto() : personaDto;
    }

    /**
     * 페르소나 업데이트 (새 히스토리 생성)
     */
    public PersonaDto updatePersona(PersonaDto personaDto) {
        if (personaDto == null || !personaDto.isValid()) {
            throw new IllegalArgumentException("Invalid persona data");
        }
        
        // 존재 여부 확인
        if (!existsByPersonaCode(personaDto.getPersonaCode())) {
            return null;
        }
        
        // 새 히스토리 저장
        boolean saved = saveSystemPrompt(personaDto.getPersonaCode(), personaDto.getSystemPrompt());
        
        if (!saved) {
            throw new RuntimeException("Failed to update persona");
        }
        
        // 업데이트된 페르소나 반환
        PersonaPromptEntity entity = personaPromptMapper.findLatestByPersonaCode(personaDto.getPersonaCode(), DEFAULT_PROMPT_TYPE);
        return entity != null ? entity.toPersonaDto() : personaDto;
    }

    // Private helper methods
    
    /**
     * 기본 시스템 프롬프트 생성
     */
    private String buildDefaultSystemPrompt(PersonaDto personaDto) {
        StringBuilder prompt = new StringBuilder();
        prompt.append("# ").append(personaDto.getTitle()).append("\n\n");
        
        if (personaDto.getDescription() != null && !personaDto.getDescription().trim().isEmpty()) {
            prompt.append(personaDto.getDescription()).append("\n\n");
        }
        
        prompt.append("당신은 ").append(personaDto.getTitle()).append(" 역할을 하는 AI 어시스턴트입니다.\n");
        prompt.append("사용자의 요청에 정확하고 도움이 되는 답변을 제공해주세요.");
        
        return prompt.toString();
    }

    /**
     * 오래된 히스토리 정리
     */
    private void cleanupOldHistory(String personaCode, int keepCount) {
        try {
            int deleted = personaPromptMapper.cleanupOldHistory(personaCode, DEFAULT_PROMPT_TYPE, keepCount);
            if (deleted > 0) {
                logger.debug("Cleaned up {} old history entries for persona: {}", deleted, personaCode);
            }
        } catch (Exception e) {
            logger.warn("Failed to cleanup old history for persona: {}", personaCode, e);
        }
    }
}