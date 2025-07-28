package com.example.yourproject.chatAdmin.service;

import com.example.yourproject.chatAdmin.dto.AIChatOpsAdminDto;
import com.example.yourproject.chatAdmin.mapper.ConversationMapper;
import com.example.yourproject.chatAdmin.mapper.PersonaPromptMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ChatOpsAdminService {

    @Autowired
    private PersonaPromptMapper personaPromptMapper;
    
    @Autowired
    private ConversationMapper conversationMapper;

    // Persona management
    public List<AIChatOpsAdminDto> getAllPersonasWithPrompts() {
        try {
            return personaPromptMapper.selectAllPersonasWithPrompts();
        } catch (Exception e) {
            throw new RuntimeException("Failed to fetch personas with prompts: " + e.getMessage(), e);
        }
    }

    public AIChatOpsAdminDto getPersonaByCode(String personaCode) {
        if (personaCode == null || personaCode.trim().isEmpty()) {
            throw new IllegalArgumentException("Persona code cannot be null or empty");
        }
        
        try {
            AIChatOpsAdminDto persona = personaPromptMapper.selectPersonaByCode(personaCode);
            if (persona == null) {
                throw new RuntimeException("Persona not found with code: " + personaCode);
            }
            return persona;
        } catch (Exception e) {
            throw new RuntimeException("Failed to fetch persona: " + e.getMessage(), e);
        }
    }

    @Transactional
    public AIChatOpsAdminDto createPersona(AIChatOpsAdminDto personaDto) {
        if (personaDto == null) {
            throw new IllegalArgumentException("Persona data cannot be null");
        }
        
        if (personaDto.getPersonaCode() == null || personaDto.getPersonaCode().trim().isEmpty()) {
            throw new IllegalArgumentException("Persona code is required");
        }

        try {
            // Check duplicate
            int existingCount = personaPromptMapper.countByPersonaCode(personaDto.getPersonaCode());
            if (existingCount > 0) {
                throw new RuntimeException("Persona code already exists: " + personaDto.getPersonaCode());
            }

            // Set defaults
            if (personaDto.getPromptType() == null) {
                personaDto.setPromptType("system");
            }
            
            if (personaDto.getPersonaPrompt() == null) {
                personaDto.setPersonaPrompt("You are an AI assistant.");
            }

            personaDto.setCreatedDate(LocalDateTime.now());

            int result = personaPromptMapper.insertPersona(personaDto);
            if (result <= 0) {
                throw new RuntimeException("Failed to create persona");
            }

            return personaPromptMapper.selectPersonaByCode(personaDto.getPersonaCode());
        } catch (Exception e) {
            throw new RuntimeException("Failed to create persona: " + e.getMessage(), e);
        }
    }

    @Transactional
    public AIChatOpsAdminDto updatePersona(AIChatOpsAdminDto personaDto) {
        if (personaDto == null || personaDto.getPersonaCode() == null) {
            throw new IllegalArgumentException("Persona data and code are required");
        }

        try {
            // Check existence
            AIChatOpsAdminDto existing = personaPromptMapper.selectPersonaByCode(personaDto.getPersonaCode());
            if (existing == null) {
                throw new RuntimeException("Persona not found: " + personaDto.getPersonaCode());
            }

            int result = personaPromptMapper.updatePersona(personaDto);
            if (result <= 0) {
                throw new RuntimeException("Failed to update persona");
            }

            return personaPromptMapper.selectPersonaByCode(personaDto.getPersonaCode());
        } catch (Exception e) {
            throw new RuntimeException("Failed to update persona: " + e.getMessage(), e);
        }
    }

    @Transactional
    public boolean deletePersona(String personaCode) {
        if (personaCode == null || personaCode.trim().isEmpty()) {
            throw new IllegalArgumentException("Persona code cannot be null or empty");
        }

        try {
            // Check existence
            AIChatOpsAdminDto existing = personaPromptMapper.selectPersonaByCode(personaCode);
            if (existing == null) {
                throw new RuntimeException("Persona not found: " + personaCode);
            }

            // Delete related conversations first
            conversationMapper.deleteConversationsByPersonaCode(personaCode);
            
            // Delete persona
            int result = personaPromptMapper.deletePersona(personaCode);
            return result > 0;
        } catch (Exception e) {
            throw new RuntimeException("Failed to delete persona: " + e.getMessage(), e);
        }
    }

    // Conversation management
    public List<AIChatOpsAdminDto> getConversationsWithPaging(
            String personaCode, String creator, LocalDateTime startDate, LocalDateTime endDate,
            int page, int size) {
        
        if (page < 0 || size <= 0) {
            throw new IllegalArgumentException("Invalid pagination parameters");
        }

        try {
            int offset = page * size;
            return conversationMapper.selectConversationsWithPaging(
                personaCode, creator, startDate, endDate, offset, size);
        } catch (Exception e) {
            throw new RuntimeException("Failed to fetch conversations with paging: " + e.getMessage(), e);
        }
    }

    public int getConversationCount(String personaCode, String creator, 
                                   LocalDateTime startDate, LocalDateTime endDate) {
        try {
            return conversationMapper.countConversations(personaCode, creator, startDate, endDate);
        } catch (Exception e) {
            throw new RuntimeException("Failed to count conversations: " + e.getMessage(), e);
        }
    }

    @Transactional
    public boolean deleteConversationsByPersonaCode(String personaCode) {
        if (personaCode == null || personaCode.trim().isEmpty()) {
            throw new IllegalArgumentException("Persona code cannot be null or empty");
        }

        try {
            int result = conversationMapper.deleteConversationsByPersonaCode(personaCode);
            return result > 0;
        } catch (Exception e) {
            throw new RuntimeException("Failed to delete conversations: " + e.getMessage(), e);
        }
    }

    // Statistics methods
    public AIChatOpsAdminDto getConversationStatistics(String personaCode, String period) {
        try {
            return conversationMapper.selectConversationStatistics(personaCode, period);
        } catch (Exception e) {
            throw new RuntimeException("Failed to fetch conversation statistics: " + e.getMessage(), e);
        }
    }

    public List<AIChatOpsAdminDto> getConversationCountsByPersona(String period) {
        try {
            return conversationMapper.selectConversationCountsByPersona(period);
        } catch (Exception e) {
            throw new RuntimeException("Failed to fetch conversation counts by persona: " + e.getMessage(), e);
        }
    }

    // Analysis data preparation
    public List<AIChatOpsAdminDto> getConversationsForAnalysis(String personaCode, String period) {
        try {
            return conversationMapper.selectConversationsForAnalysis(personaCode, period);
        } catch (Exception e) {
            throw new RuntimeException("Failed to fetch conversations for analysis: " + e.getMessage(), e);
        }
    }

    // Prompt management
    public AIChatOpsAdminDto getPersonaPrompt(String personaCode, String promptType) {
        if (personaCode == null || promptType == null) {
            throw new IllegalArgumentException("Persona code and prompt type are required");
        }

        try {
            return personaPromptMapper.selectPersonaPromptByTypeAndCode(personaCode, promptType);
        } catch (Exception e) {
            throw new RuntimeException("Failed to fetch persona prompt: " + e.getMessage(), e);
        }
    }

    @Transactional
    public boolean updatePersonaPrompt(String personaCode, String promptType, String personaPrompt) {
        if (personaCode == null || promptType == null || personaPrompt == null) {
            throw new IllegalArgumentException("All parameters are required");
        }

        try {
            int result = personaPromptMapper.updatePersonaPrompt(personaCode, promptType, personaPrompt);
            return result > 0;
        } catch (Exception e) {
            throw new RuntimeException("Failed to update persona prompt: " + e.getMessage(), e);
        }
    }
}