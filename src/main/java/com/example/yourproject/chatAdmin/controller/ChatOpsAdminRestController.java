package com.example.yourproject.chatAdmin.controller;

import com.example.yourproject.chatAdmin.dto.AIChatOpsAdminDto;
import com.example.yourproject.chatAdmin.service.ChatOpsAdminService;
import com.example.yourproject.chatAdmin.service.LLMAnalysisService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/admin")
public class ChatOpsAdminRestController {
    @Autowired
    private ChatOpsAdminService chatOpsAdminService;

    @Autowired
    private LLMAnalysisService llmAnalysisService;

    @GetMapping("/personas-with-prompts")
    public ResponseEntity<AIChatOpsAdminDto> getPersonasWithPrompts() {
        try {
            List<AIChatOpsAdminDto> personas = chatOpsAdminService.getAllPersonasWithPrompts();
            AIChatOpsAdminDto response = AIChatOpsAdminDto.createSuccessResponse(personas,
                    "Successfully fetched personas");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            AIChatOpsAdminDto errorResponse = AIChatOpsAdminDto
                    .createErrorResponse("Error occurred during message processing: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    @GetMapping("/personas/{personaCode}")
    public ResponseEntity<AIChatOpsAdminDto> getPersonaByCode(@PathVariable String personaCode) {
        try {
            AIChatOpsAdminDto persona = chatOpsAdminService.getPersonaByCode(personaCode);
            AIChatOpsAdminDto response = AIChatOpsAdminDto.createSuccessResponse(persona,
                    "Successfully fetched persona");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            AIChatOpsAdminDto errorResponse = AIChatOpsAdminDto
                    .createErrorResponse("Error occurred during message processing: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    @PostMapping("/personas")
    public ResponseEntity<AIChatOpsAdminDto> createPersona(@RequestBody AIChatOpsAdminDto personaDto) {
        try {
            AIChatOpsAdminDto createdPersona = chatOpsAdminService.createPersona(personaDto);
            AIChatOpsAdminDto response = AIChatOpsAdminDto.createSuccessResponse(createdPersona,
                    "Successfully created persona");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            AIChatOpsAdminDto errorResponse = AIChatOpsAdminDto
                    .createErrorResponse("Error occurred during message processing: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    @PutMapping("/personas/{personaCode}")
    public ResponseEntity<AIChatOpsAdminDto> updatePersona(@PathVariable String personaCode,
            @RequestBody AIChatOpsAdminDto personaDto) {
        try {
            personaDto.setPersonaCode(personaCode);
            AIChatOpsAdminDto updatedPersona = chatOpsAdminService.updatePersona(personaDto);
            AIChatOpsAdminDto response = AIChatOpsAdminDto.createSuccessResponse(updatedPersona,
                    "Successfully updated persona");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            AIChatOpsAdminDto errorResponse = AIChatOpsAdminDto
                    .createErrorResponse("Error occurred during message processing: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    @DeleteMapping("/personas/{personaCode}")
    public ResponseEntity<AIChatOpsAdminDto> deletePersona(@PathVariable String personaCode) {
        try {
            boolean deleted = chatOpsAdminService.deletePersona(personaCode);
            if (deleted) {
                AIChatOpsAdminDto response = AIChatOpsAdminDto.createSuccessResponse(null,
                        "Successfully deleted persona");
                return ResponseEntity.ok(response);
            } else {
                AIChatOpsAdminDto errorResponse = AIChatOpsAdminDto.createErrorResponse("Failed to delete persona");
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
            }
        } catch (Exception e) {
            AIChatOpsAdminDto errorResponse = AIChatOpsAdminDto
                    .createErrorResponse("Error occurred during message processing: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    @PostMapping("/system-prompt/test")
    public ResponseEntity<AIChatOpsAdminDto> testSystemPrompt(@RequestBody AIChatOpsAdminDto testData) {
        try {
            String systemPrompt = testData.getPersonaPrompt();
            String testInput = testData.getUserQuery();

            String testResult = llmAnalysisService.testSystemPrompt(systemPrompt, testInput);
            AIChatOpsAdminDto response = AIChatOpsAdminDto.createSuccessResponse(testResult,
                    "System prompt test completed");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            AIChatOpsAdminDto errorResponse = AIChatOpsAdminDto
                    .createErrorResponse("Error occurred during message processing: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    @PutMapping("/system-prompt/{personaCode}")
    public ResponseEntity<AIChatOpsAdminDto> updateSystemPrompt(@PathVariable String personaCode,
            @RequestBody AIChatOpsAdminDto promptData) {
        try {
            String promptType = promptData.getPromptType() != null ? promptData.getPromptType() : "system";
            String personaPrompt = promptData.getPersonaPrompt();

            boolean updated = chatOpsAdminService.updatePersonaPrompt(personaCode, promptType, personaPrompt);
            if (updated) {
                AIChatOpsAdminDto response = AIChatOpsAdminDto.createSuccessResponse(null,
                        "System prompt updated successfully");
                return ResponseEntity.ok(response);
            } else {
                AIChatOpsAdminDto errorResponse = AIChatOpsAdminDto
                        .createErrorResponse("Failed to update system prompt");
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
            }
        } catch (Exception e) {
            AIChatOpsAdminDto errorResponse = AIChatOpsAdminDto
                    .createErrorResponse("Error occurred during message processing: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    @GetMapping("/conversations/stats")
    public ResponseEntity<AIChatOpsAdminDto> getConversationStats(
            @RequestParam(required = false) String personaCode,
            @RequestParam(defaultValue = "all") String period) {
        try {
            String analysisResult = llmAnalysisService.analyzeConversations(personaCode, period);
            AIChatOpsAdminDto response = AIChatOpsAdminDto.createAnalysisResponse(analysisResult,
                    "Conversation analysis completed successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            AIChatOpsAdminDto errorResponse = AIChatOpsAdminDto
                    .createErrorResponse("Error occurred during message processing: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    @GetMapping("/conversations")
    public ResponseEntity<AIChatOpsAdminDto> getConversations(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String personaCode,
            @RequestParam(required = false) String userId) {
        try {
            List<AIChatOpsAdminDto> conversations = chatOpsAdminService.getConversationsWithPaging(
                    personaCode, userId, null, null, page, size);

            int totalCount = chatOpsAdminService.getConversationCount(personaCode, userId, null, null);

            AIChatOpsAdminDto response = AIChatOpsAdminDto.createSuccessResponse(conversations,
                    "Conversations loaded successfully");
            response.setTotalConversations(totalCount);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            AIChatOpsAdminDto errorResponse = AIChatOpsAdminDto
                    .createErrorResponse("Error occurred during message processing: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    @GetMapping("/conversations/summary")
    public ResponseEntity<AIChatOpsAdminDto> getConversationSummary(
            @RequestParam(required = false) String personaCode) {
        try {
            AIChatOpsAdminDto statistics = chatOpsAdminService.getConversationStatistics(personaCode, "all");
            AIChatOpsAdminDto response = AIChatOpsAdminDto.createSuccessResponse(statistics,
                    "Conversation summary loaded successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            AIChatOpsAdminDto errorResponse = AIChatOpsAdminDto
                    .createErrorResponse("Error occurred during message processing: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    @PostMapping("/conversations/analyze")
    public ResponseEntity<AIChatOpsAdminDto> analyzeConversations(@RequestBody AIChatOpsAdminDto analysisRequest) {
        try {
            String personaCode = analysisRequest.getPersonaCode();
            String period = analysisRequest.getPeriod() != null ? analysisRequest.getPeriod() : "30days";

            String analysisResult = llmAnalysisService.analyzeConversations(personaCode, period);
            AIChatOpsAdminDto response = AIChatOpsAdminDto.createAnalysisResponse(analysisResult,
                    "Conversation analysis completed");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            AIChatOpsAdminDto errorResponse = AIChatOpsAdminDto
                    .createErrorResponse("Error occurred during message processing: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    @GetMapping("/personas/{personaCode}/performance")
    public ResponseEntity<AIChatOpsAdminDto> getPersonaPerformance(
            @PathVariable String personaCode,
            @RequestParam(defaultValue = "30days") String period) {
        try {
            String analysisResult = llmAnalysisService.analyzePersonaPerformance(personaCode, period);
            AIChatOpsAdminDto response = AIChatOpsAdminDto.createAnalysisResponse(analysisResult,
                    "Persona performance analysis completed");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            AIChatOpsAdminDto errorResponse = AIChatOpsAdminDto
                    .createErrorResponse("Error occurred during message processing: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    @GetMapping("/recommendations")
    public ResponseEntity<AIChatOpsAdminDto> getUsageRecommendations(
            @RequestParam(defaultValue = "30days") String period) {
        try {
            String recommendations = llmAnalysisService.generateUsageRecommendations(period);
            AIChatOpsAdminDto response = AIChatOpsAdminDto.createAnalysisResponse(recommendations,
                    "Usage recommendations generated");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            AIChatOpsAdminDto errorResponse = AIChatOpsAdminDto
                    .createErrorResponse("Error occurred during message processing: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    @DeleteMapping("/conversations/{personaCode}")
    public ResponseEntity<AIChatOpsAdminDto> deleteConversations(@PathVariable String personaCode) {
        try {
            boolean deleted = chatOpsAdminService.deleteConversationsByPersonaCode(personaCode);
            if (deleted) {
                AIChatOpsAdminDto response = AIChatOpsAdminDto.createSuccessResponse(null,
                        "Successfully deleted conversations");
                return ResponseEntity.ok(response);
            } else {
                AIChatOpsAdminDto errorResponse = AIChatOpsAdminDto
                        .createErrorResponse("No conversations found to delete");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
            }
        } catch (Exception e) {
            AIChatOpsAdminDto errorResponse = AIChatOpsAdminDto
                    .createErrorResponse("Error occurred during message processing: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    @GetMapping("/health")
    public ResponseEntity<AIChatOpsAdminDto> healthCheck() {
        try {
            AIChatOpsAdminDto response = AIChatOpsAdminDto.createSuccessResponse("healthy", "Admin service is running");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            AIChatOpsAdminDto errorResponse = AIChatOpsAdminDto.createErrorResponse("Service unavailable");
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(errorResponse);
        }
    }
}