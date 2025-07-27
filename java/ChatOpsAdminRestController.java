package com.ssss.devportal.ai.admin.rest;

import com.ssss.devportal.ai.admin.entity.PersonaMgntDto.*;
import com.ssss.devportal.ai.admin.entity.ConvMgntDto.*;
import com.ssss.devportal.ai.admin.impl.ChatOpsAdminService;
import javax.annotation.Resource;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/admin")
@CrossOrigin(origins = "*")
public class ChatOpsAdminRestController {

    @Resource
    private ChatOpsAdminService chatOpsAdminService;

    @GetMapping("/personas-with-prompts")
    public ResponseEntity<ApiResponseDto<List<PersonaDto>>> getPersonasWithPrompts() {
        try {
            List<PersonaDto> personas = chatOpsAdminService.getAllPersonasWithPrompts();
            return ResponseEntity.ok(ApiResponseDto.<List<PersonaDto>>builder()
                .success(true)
                .data(personas)
                .message("Personas with prompts loaded successfully")
                .timestamp(LocalDateTime.now())
                .build());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponseDto.<List<PersonaDto>>builder()
                    .success(false)
                    .errorMessage("Failed to load personas: " + e.getMessage())
                    .timestamp(LocalDateTime.now())
                    .build());
        }
    }

    @PostMapping("/personas")
    public ResponseEntity<ApiResponseDto<PersonaDto>> createPersona(@Valid @RequestBody PersonaDto personaDto) {
        try {
            if (personaDto.getPersonaCode() == null || personaDto.getPersonaCode().trim().isEmpty()) {
                return ResponseEntity.badRequest()
                    .body(ApiResponseDto.<PersonaDto>builder()
                        .success(false)
                        .errorMessage("PersonaCode is required")
                        .timestamp(LocalDateTime.now())
                        .build());
            }
            if (!personaDto.getPersonaCode().matches("^[a-zA-Z0-9_]+$")) {
                return ResponseEntity.badRequest()
                    .body(ApiResponseDto.<PersonaDto>builder()
                        .success(false)
                        .errorMessage("PersonaCode can only contain letters, numbers, and underscores")
                        .timestamp(LocalDateTime.now())
                        .build());
            }
            if (chatOpsAdminService.existsByPersonaCode(personaDto.getPersonaCode())) {
                return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(ApiResponseDto.<PersonaDto>builder()
                        .success(false)
                        .errorMessage("PersonaCode already exists")
                        .timestamp(LocalDateTime.now())
                        .build());
            }
            PersonaDto createdPersona = chatOpsAdminService.createPersona(personaDto);
            return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponseDto.<PersonaDto>builder()
                    .success(true)
                    .data(createdPersona)
                    .message("Persona created successfully")
                    .timestamp(LocalDateTime.now())
                    .build());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponseDto.<PersonaDto>builder()
                    .success(false)
                    .errorMessage("Failed to create persona: " + e.getMessage())
                    .timestamp(LocalDateTime.now())
                    .build());
        }
    }

    @PutMapping("/personas/{personaCode}")
    public ResponseEntity<ApiResponseDto<PersonaDto>> updatePersona(
            @PathVariable String personaCode,
            @Valid @RequestBody PersonaDto personaDto) {
        try {
            if (!personaCode.equals(personaDto.getPersonaCode())) {
                return ResponseEntity.badRequest()
                    .body(ApiResponseDto.<PersonaDto>builder()
                        .success(false)
                        .errorMessage("PersonaCode mismatch between URL and request body")
                        .timestamp(LocalDateTime.now())
                        .build());
            }
            PersonaDto updatedPersona = chatOpsAdminService.updatePersona(personaDto);
            if (updatedPersona == null) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.ok(ApiResponseDto.<PersonaDto>builder()
                .success(true)
                .data(updatedPersona)
                .message("Persona updated successfully")
                .timestamp(LocalDateTime.now())
                .build());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponseDto.<PersonaDto>builder()
                    .success(false)
                    .errorMessage("Failed to update persona: " + e.getMessage())
                    .timestamp(LocalDateTime.now())
                    .build());
        }
    }

    @DeleteMapping("/personas/{personaCode}")
    public ResponseEntity<ApiResponseDto<Void>> deletePersona(@PathVariable String personaCode) {
        try {
            boolean deleted = chatOpsAdminService.deletePersona(personaCode);
            if (!deleted) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.ok(ApiResponseDto.<Void>builder()
                .success(true)
                .message("Persona deleted successfully")
                .timestamp(LocalDateTime.now())
                .build());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponseDto.<Void>builder()
                    .success(false)
                    .errorMessage("Failed to delete persona: " + e.getMessage())
                    .timestamp(LocalDateTime.now())
                    .build());
        }
    }

    @PostMapping("/system-prompt/test")
    public ResponseEntity<ApiResponseDto<String>> testSystemPrompt(
            @Valid @RequestBody SystemPromptTestRequestDto testRequest) {
        try {
            String testResult = chatOpsAdminService.testSystemPrompt(
                testRequest.getPromptContent(), 
                testRequest.getTestInput(), 
                testRequest.getPersonaCode()
            );
            return ResponseEntity.ok(ApiResponseDto.<String>builder()
                .success(true)
                .data(testResult)
                .message("System prompt test completed")
                .timestamp(LocalDateTime.now())
                .build());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponseDto.<String>builder()
                    .success(false)
                    .errorMessage("Failed to test system prompt: " + e.getMessage())
                    .timestamp(LocalDateTime.now())
                    .build());
        }
    }

    @PutMapping("/system-prompt/{personaCode}")
    public ResponseEntity<ApiResponseDto<PersonaDto>> updateSystemPrompt(
            @PathVariable String personaCode,
            @RequestBody SystemPromptUpdateRequestDto updateRequest) {
        try {
            PersonaDto updatedPersona = chatOpsAdminService.updatePersonaSystemPrompt(
                personaCode, 
                updateRequest.getSystemPrompt()
            );
            if (updatedPersona == null) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.ok(ApiResponseDto.<PersonaDto>builder()
                .success(true)
                .data(updatedPersona)
                .message("System prompt updated successfully")
                .timestamp(LocalDateTime.now())
                .build());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponseDto.<PersonaDto>builder()
                    .success(false)
                    .errorMessage("Failed to update system prompt: " + e.getMessage())
                    .timestamp(LocalDateTime.now())
                    .build());
        }
    }

    @GetMapping("/categories")
    public ResponseEntity<ApiResponseDto<List<String>>> getCategories() {
        List<String> categories = Arrays.asList("personal", "general", "operation", "extension");
        return ResponseEntity.ok(ApiResponseDto.<List<String>>builder()
            .success(true)
            .data(categories)
            .message("Categories retrieved successfully")
            .timestamp(LocalDateTime.now())
            .build());
    }

    @GetMapping("/conversations")
    public ResponseEntity<ApiResponseDto<ConversationPageDto>> getConversations(@RequestParam Map<String, String> request) {
        try {
            int page = Integer.parseInt(request.getOrDefault("page", "0"));
            int size = Integer.parseInt(request.getOrDefault("size", "20"));
            String personaCode = request.get("personaCode");
            String userId = request.get("userId");
            String startDate = request.get("startDate");
            String endDate = request.get("endDate");
            
            ConversationPageDto conversations = chatOpsAdminService.getConversations(
                page, size, personaCode, userId, startDate, endDate);
            return ResponseEntity.ok(ApiResponseDto.<ConversationPageDto>builder()
                .success(true)
                .data(conversations)
                .message("Conversations retrieved successfully")
                .timestamp(LocalDateTime.now())
                .build());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponseDto.<ConversationPageDto>builder()
                    .success(false)
                    .errorMessage("Failed to retrieve conversations: " + e.getMessage())
                    .timestamp(LocalDateTime.now())
                    .build());
        }
    }

    @GetMapping("/conversations/stats")
    public ResponseEntity<ApiResponseDto<String>> getConversationStats(@RequestParam Map<String, String> request) {
        try {
            String personaCode = request.get("personaCode");
            String period = request.get("period");
            
            String analysis = chatOpsAdminService.getConversationAnalysis(personaCode, period);
            return ResponseEntity.ok(ApiResponseDto.<String>builder()
                .success(true)
                .data(analysis)
                .message("Conversation statistics loaded successfully")
                .timestamp(LocalDateTime.now())
                .build());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponseDto.<String>builder()
                    .success(false)
                    .errorMessage("Failed to get conversation statistics: " + e.getMessage())
                    .timestamp(LocalDateTime.now())
                    .build());
        }
    }

    @GetMapping("/conversations/summary")
    public ResponseEntity<ApiResponseDto<String>> getConversationSummary(@RequestParam Map<String, String> request) {
        try {
            String personaCode = request.get("personaCode");
            
            String summary = chatOpsAdminService.getConversationAnalysis(personaCode, "30days");
            return ResponseEntity.ok(ApiResponseDto.<String>builder()
                .success(true)
                .data(summary)
                .message("Conversation summary loaded successfully")
                .timestamp(LocalDateTime.now())
                .build());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponseDto.<String>builder()
                    .success(false)
                    .errorMessage("Failed to get conversation summary: " + e.getMessage())
                    .timestamp(LocalDateTime.now())
                    .build());
        }
    }



    @GetMapping("/health")
    public ResponseEntity<ApiResponseDto<String>> adminHealthCheck() {
        return ResponseEntity.ok(ApiResponseDto.<String>builder()
            .success(true)
            .data("Admin system is running")
            .message("Admin system health check passed")
            .timestamp(LocalDateTime.now())
            .build());
    }
}