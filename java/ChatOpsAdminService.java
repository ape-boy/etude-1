package com.ssss.devportal.ai.admin.impl;

import com.ssss.devportal.ai.admin.entity.PersonaMgntDto.*;
import com.ssss.devportal.ai.admin.entity.ConvMgntDto.*;
import com.ssss.devportal.ai.admin.entity.ConversationEntity;
import com.ssss.devportal.ai.admin.mapper.ConversationMapper;
import com.ssss.devportal.ai.admin.service.PersonaPromptService;
import com.ssss.devportal.ai.admin.service.LLMAnalysisService;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.annotation.Resource;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ChatOpsAdminService {

    private static final Logger logger = LoggerFactory.getLogger(ChatOpsAdminService.class);

    @Resource
    private PersonaPromptService personaPromptService;
    
    @Resource
    private LLMAnalysisService llmAnalysisService;
    
    @Resource
    private ConversationMapper conversationMapper;

    /**
     * DB에서 모든 페르소나 정보 로드 (최신 버전)
     */
    public List<PersonaDto> getAllPersonasWithPrompts() {
        try {
            List<PersonaDto> personas = personaPromptService.getAllPersonasWithPrompts();
            logger.info("Loaded {} personas from database", personas.size());
            return personas;
        } catch (Exception e) {
            logger.error("Failed to load personas from database", e);
            return new ArrayList<>();
        }
    }

    /**
     * 새 페르소나 생성 (DB에 히스토리 저장)
     */
    public PersonaDto createPersona(PersonaDto personaDto) {
        try {
            PersonaDto createdPersona = personaPromptService.createPersona(personaDto);
            logger.info("Created new persona: {}", personaDto.getPersonaCode());
            return createdPersona;
        } catch (IllegalArgumentException e) {
            if (e.getMessage().contains("already exists")) {
                throw new DuplicatePersonaException(e.getMessage());
            } else {
                throw new InvalidPersonaDataException(e.getMessage());
            }
        } catch (Exception e) {
            logger.error("Failed to create persona: {}", personaDto.getPersonaCode(), e);
            throw new RuntimeException("Failed to create persona", e);
        }
    }

    /**
     * 페르소나 업데이트 (DB에 새 히스토리 저장)
     */
    public PersonaDto updatePersona(PersonaDto personaDto) {
        try {
            PersonaDto updatedPersona = personaPromptService.updatePersona(personaDto);
            if (updatedPersona != null) {
                logger.info("Updated persona: {}", personaDto.getPersonaCode());
            }
            return updatedPersona;
        } catch (IllegalArgumentException e) {
            throw new InvalidPersonaDataException(e.getMessage());
        } catch (Exception e) {
            logger.error("Failed to update persona: {}", personaDto.getPersonaCode(), e);
            throw new RuntimeException("Failed to update persona", e);
        }
    }

    /**
     * 페르소나 삭제 (DB 히스토리 관리 방식에서는 논리적 삭제)
     */
    public boolean deletePersona(String personaCode) {
        if (personaCode == null || personaCode.trim().isEmpty()) {
            return false;
        }
        
        // 존재 여부 확인
        if (!personaPromptService.existsByPersonaCode(personaCode)) {
            return false;
        }
        
        // 히스토리 관리 방식에서는 실제 삭제보다는 비활성화 처리
        // 여기서는 단순히 존재 확인만 하고 false 리턴 (실제 삭제 안함)
        logger.warn("Persona deletion requested but not performed (history management): {}", personaCode);
        return false;
    }

    /**
     * 페르소나 존재 여부 확인
     */
    public boolean existsByPersonaCode(String personaCode) {
        return personaPromptService.existsByPersonaCode(personaCode);
    }

    /**
     * 시스템 프롬프트 테스트 (LLM에게 위임)
     */
    public String testSystemPrompt(String promptContent, String testInput, String personaCode) {
        // 입력 유효성 검증
        String validationError = personaPromptService.validateSystemPrompt(promptContent);
        if (!validationError.isEmpty()) {
            return "Validation Error: " + validationError;
        }
        
        if (testInput == null || testInput.trim().isEmpty()) {
            return "Error: Test input is required";
        }
        
        // LLM 서비스에 테스트 위임
        try {
            String result = llmAnalysisService.testSystemPrompt(promptContent, testInput, personaCode);
            logger.info("System prompt test completed for persona: {}", personaCode);
            return result;
        } catch (Exception e) {
            logger.error("System prompt test failed for persona: {}", personaCode, e);
            return "Test failed: " + e.getMessage();
        }
    }

    /**
     * 페르소나 시스템 프롬프트만 업데이트
     */
    public PersonaDto updatePersonaSystemPrompt(String personaCode, String systemPrompt) {
        if (personaCode == null || personaCode.trim().isEmpty()) {
            return null;
        }
        
        // 존재 여부 확인
        if (!personaPromptService.existsByPersonaCode(personaCode)) {
            return null;
        }
        
        // 시스템 프롬프트 유효성 검증
        String validationError = personaPromptService.validateSystemPrompt(systemPrompt);
        if (!validationError.isEmpty()) {
            throw new InvalidPersonaDataException("System prompt validation failed: " + validationError);
        }
        
        // 시스템 프롬프트 저장 (새 히스토리 생성)
        boolean updated = personaPromptService.saveSystemPrompt(personaCode, systemPrompt);
        
        if (!updated) {
            throw new RuntimeException("Failed to update system prompt");
        }
        
        // 업데이트된 페르소나 정보 반환
        List<PersonaDto> personas = personaPromptService.getAllPersonasWithPrompts();
        PersonaDto updatedPersona = personas.stream()
            .filter(p -> personaCode.equals(p.getPersonaCode()))
            .findFirst()
            .orElse(null);
        
        if (updatedPersona != null) {
            logger.info("Updated system prompt for persona: {}", personaCode);
        }
        
        return updatedPersona;
    }

    /**
     * 페르소나 코드로 단일 페르소나 조회
     */
    public PersonaDto getPersonaByCode(String personaCode) {
        if (personaCode == null || personaCode.trim().isEmpty()) {
            return null;
        }
        
        List<PersonaDto> personas = personaPromptService.getAllPersonasWithPrompts();
        return personas.stream()
            .filter(p -> personaCode.equals(p.getPersonaCode()))
            .findFirst()
            .orElse(null);
    }

    /**
     * 카테고리별 페르소나 조회
     */
    public List<PersonaDto> getPersonasByCategory(String category) {
        List<PersonaDto> allPersonas = personaPromptService.getAllPersonasWithPrompts();
        
        if (category == null || category.trim().isEmpty()) {
            return allPersonas;
        }
        
        return allPersonas.stream()
            .filter(p -> category.equals(p.getCategory()))
            .sorted(Comparator.comparing(PersonaDto::getTitle))
            .collect(Collectors.toList());
    }

    /**
     * 활성 페르소나만 조회
     */
    public List<PersonaDto> getActivePersonas() {
        List<PersonaDto> allPersonas = personaPromptService.getAllPersonasWithPrompts();
        
        return allPersonas.stream()
            .filter(p -> Boolean.TRUE.equals(p.getActive()))
            .sorted(Comparator.comparing(PersonaDto::getTitle))
            .collect(Collectors.toList());
    }

    /**
     * 페르소나 검색
     */
    public List<PersonaDto> searchPersonas(String keyword) {
        return personaPromptService.searchPersonas(keyword);
    }

    /**
     * 대화 목록 조회 (페이지네이션)
     */
    public ConversationPageDto getConversations(int page, int size, String personaCode, String userId, String startDate, String endDate) {
        try {
            // 날짜 파라미터 변환
            LocalDateTime startDateTime = parseDateTime(startDate);
            LocalDateTime endDateTime = parseDateTime(endDate);
            
            // 페이지네이션 계산
            int offset = page * size;
            
            // 대화 목록 조회
            List<ConversationEntity> entities = conversationMapper.findConversationsPaged(
                offset, size, personaCode, userId, startDateTime, endDateTime
            );
            
            // 총 개수 조회
            long totalElements = conversationMapper.countConversations(
                personaCode, userId, startDateTime, endDateTime
            );
            
            // DTO 변환
            List<ConversationDto> conversations = entities.stream()
                .map(ConversationEntity::toConversationDto)
                .collect(Collectors.toList());
            
            // 페이지 정보 계산
            int totalPages = (int) Math.ceil((double) totalElements / size);
            boolean isFirst = page == 0;
            boolean isLast = page >= totalPages - 1;
            boolean hasNext = page < totalPages - 1;
            boolean hasPrevious = page > 0;
            
            logger.info("Retrieved {} conversations (page {}, total {})", conversations.size(), page, totalElements);
            
            return ConversationPageDto.builder()
                .conversations(conversations)
                .currentPage(page)
                .pageSize(size)
                .totalPages(totalPages)
                .totalElements(totalElements)
                .first(isFirst)
                .last(isLast)
                .hasNext(hasNext)
                .hasPrevious(hasPrevious)
                .personaCode(personaCode)
                .userId(userId)
                .startDate(startDate)
                .endDate(endDate)
                .build();
                
        } catch (Exception e) {
            logger.error("Failed to retrieve conversations", e);
            // 빈 결과 반환
            return ConversationPageDto.builder()
                .conversations(new ArrayList<>())
                .currentPage(page)
                .pageSize(size)
                .totalPages(0)
                .totalElements(0)
                .first(true)
                .last(true)
                .hasNext(false)
                .hasPrevious(false)
                .build();
        }
    }

    /**
     * 대화 분석 (LLM에게 완전 위임)
     */
    public String getConversationAnalysis(String personaCode, String period) {
        try {
            // 날짜 범위 계산
            LocalDateTime startDate = calculatePeriodStartDate(period);
            LocalDateTime endDate = LocalDateTime.now();
            
            // 분석용 대화 데이터 조회 (최대 1000개)
            List<ConversationEntity> conversations = conversationMapper.getConversationsForAnalysis(
                personaCode, startDate, endDate, 1000
            );
            
            if (conversations.isEmpty()) {
                return "분석할 대화 데이터가 없습니다. 필터 조건을 확인해주세요.";
            }
            
            // LLM 분석 서비스에 완전 위임
            String analysisResult = llmAnalysisService.analyzeConversations(conversations, personaCode, period);
            
            logger.info("Conversation analysis completed for persona: {}, period: {}, conversations: {}", 
                       personaCode, period, conversations.size());
            
            return analysisResult;
            
        } catch (Exception e) {
            logger.error("Failed to analyze conversations", e);
            return "분석 중 오류가 발생했습니다: " + e.getMessage();
        }
    }

    /**
     * 시스템 프롬프트 유효성 검증 (DB 서비스에 위임)
     */
    public String validateSystemPrompt(String systemPrompt) {
        return personaPromptService.validateSystemPrompt(systemPrompt);
    }

    /**
     * 모든 페르소나 내보내기 (DB에서 로드)
     */
    public List<PersonaDto> exportAllPersonas() {
        return personaPromptService.getAllPersonasWithPrompts();
    }

    /**
     * 페르소나 가져오기 (일괄 DB 저장)
     */
    public String importPersonas(List<PersonaDto> personas) {
        if (personas == null || personas.isEmpty()) {
            return "Import failed: No personas provided";
        }
        
        int imported = 0;
        int skipped = 0;
        int errors = 0;
        StringBuilder errorDetails = new StringBuilder();
        
        for (PersonaDto persona : personas) {
            try {
                // 유효성 검증
                if (!persona.isValid()) {
                    errors++;
                    errorDetails.append("Invalid persona: ").append(persona.getPersonaCode()).append("\n");
                    continue;
                }
                
                // 중복 확인
                if (personaPromptService.existsByPersonaCode(persona.getPersonaCode())) {
                    skipped++;
                    continue;
                }
                
                // 페르소나 생성
                boolean saved = personaPromptService.saveSystemPrompt(
                    persona.getPersonaCode(), 
                    persona.getSystemPrompt()
                );
                
                if (saved) {
                    imported++;
                } else {
                    errors++;
                    errorDetails.append("Failed to save: ").append(persona.getPersonaCode()).append("\n");
                }
                
            } catch (Exception e) {
                errors++;
                errorDetails.append("Error importing ")
                          .append(persona.getPersonaCode())
                          .append(": ")
                          .append(e.getMessage())
                          .append("\n");
            }
        }
        
        String result = String.format("Import completed: %d imported, %d skipped, %d errors", 
                                     imported, skipped, errors);
        
        if (errorDetails.length() > 0) {
            result += "\n\nError details:\n" + errorDetails.toString();
        }
        
        logger.info("Persona import completed: {} imported, {} skipped, {} errors", imported, skipped, errors);
        return result;
    }
    
    // Helper methods
    
    /**
     * 날짜 문자열을 LocalDateTime으로 변환
     */
    private LocalDateTime parseDateTime(String dateString) {
        if (dateString == null || dateString.trim().isEmpty()) {
            return null;
        }
        
        try {
            // "yyyy-MM-dd" 또는 "yyyy-MM-dd HH:mm:ss" 형식 지원
            if (dateString.length() == 10) {
                return LocalDateTime.parse(dateString + " 00:00:00", 
                    DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));
            } else {
                return LocalDateTime.parse(dateString, 
                    DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));
            }
        } catch (DateTimeParseException e) {
            logger.warn("Failed to parse date string: {}", dateString);
            return null;
        }
    }
    
    /**
     * 기간 문자열을 시작 날짜로 변환
     */
    private LocalDateTime calculatePeriodStartDate(String period) {
        if (period == null || period.trim().isEmpty() || "all".equals(period)) {
            return null; // 전체 기간
        }
        
        LocalDateTime now = LocalDateTime.now();
        
        switch (period.toLowerCase()) {
            case "today":
            case "1day":
                return now.minusDays(1);
            case "7days":
            case "week":
                return now.minusDays(7);
            case "30days":
            case "month":
                return now.minusDays(30);
            case "90days":
            case "quarter":
                return now.minusDays(90);
            case "365days":
            case "year":
                return now.minusDays(365);
            default:
                // 숫자 + "days" 형태 파싱 시도
                if (period.endsWith("days")) {
                    try {
                        int days = Integer.parseInt(period.replace("days", ""));
                        return now.minusDays(days);
                    } catch (NumberFormatException e) {
                        logger.warn("Invalid period format: {}", period);
                    }
                }
                return null; // 전체 기간
        }
    }

    public static class DuplicatePersonaException extends RuntimeException {
        public DuplicatePersonaException(String message) {
            super(message);
        }
    }

    public static class PersonaNotFoundException extends RuntimeException {
        public PersonaNotFoundException(String message) {
            super(message);
        }
    }

    public static class InvalidPersonaDataException extends RuntimeException {
        public InvalidPersonaDataException(String message) {
            super(message);
        }
    }
}