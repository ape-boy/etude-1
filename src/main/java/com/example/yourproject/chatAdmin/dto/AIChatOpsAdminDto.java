package com.example.yourproject.chatAdmin.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.time.LocalDateTime;
import java.util.List;
import lombok.Data;

/**
 * AI ChatOps Admin DTO - Integrated data transfer object
 * Uses createSuccessResponse/createErrorResponse pattern
 */

@Data
@JsonInclude(JsonInclude.Include.NON_NULL)
public class AIChatOpsAdminDto {
    private boolean success;
    private Object data;
    private String message;
    private String errorMessage;

    // Persona fields
    private String personaId;
    private String personaCode;
    private String title;
    private String description;
    private String descriptionEn;
    private String category;
    private String iconPath;
    private String welcomeMsg;

    // Prompt fields
    private String promptType;
    private String personaPrompt;

    // Conversation fields
    private String userQuery;
    private String aiQuery;
    private String creator;

    // Analysis fields
    private String analysisResult;
    private String analysisType;
    private String period;
    private Integer totalConversations;
    private Integer uniqueUsers;
    private Double avgResponseTime;
    private Double successRate;

    // Common fields
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime createdDate;

    // 기본 생성자
    public AIChatOpsAdminDto() {
    }

    // Success response factory method
    public static AIChatOpsAdminDto createSuccessResponse(Object data, String message) {
        AIChatOpsAdminDto dto = new AIChatOpsAdminDto();
        dto.success = true;
        dto.data = data;
        dto.message = message;
        return dto;
    }

    // Error response factory method
    public static AIChatOpsAdminDto createErrorResponse(String errorMessage) {
        AIChatOpsAdminDto dto = new AIChatOpsAdminDto();
        dto.success = false;
        dto.errorMessage = errorMessage;
        dto.message = "Operation failed";
        return dto;
    }

    @Override
    public String toString() {
        return "AIChatOpsAdminDto{" +
                "success=" + success +
                ", data=" + data +
                ", message='" + message + '\'' +
                ", errorMessage='" + errorMessage + '\'' +
                ", personaCode='" + personaCode + '\'' +
                ", title='" + title + '\'' +
                ", category='" + category + '\'' +
                '}';
    }
}