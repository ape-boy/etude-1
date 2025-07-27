package com.ssss.devportal.ai.admin.entity;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.Pattern;
import javax.validation.constraints.Size;
import java.util.List;

/**
 * Persona Management DTOs for admin interface
 */
public class PersonaMgntDto {

    /**
     * Main persona data transfer object
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class PersonaDto {
        
        @NotBlank(message = "PersonaCode is required")
        @Pattern(regexp = "^[a-zA-Z0-9_]+$", message = "PersonaCode can only contain letters, numbers, and underscores")
        @Size(max = 50, message = "PersonaCode must be 50 characters or less")
        private String personaCode;
        
        @NotBlank(message = "Title is required")
        @Size(max = 200, message = "Title must be 200 characters or less")
        private String title;
        
        @Size(max = 1000, message = "Description must be 1000 characters or less")
        private String description;
        
        @Size(max = 1000, message = "Description (English) must be 1000 characters or less")
        private String descriptionEn;
        
        @Builder.Default
        private String category = "general";
        
        @Size(max = 100000, message = "System prompt must be 100000 characters or less")
        private String systemPrompt;
        
        @Builder.Default
        private Boolean active = true;
        
        private String createdDate;
        private String updatedDate;
        
        /**
         * Check if this persona data is valid
         */
        public boolean isValid() {
            return personaCode != null && !personaCode.trim().isEmpty() &&
                   title != null && !title.trim().isEmpty() &&
                   category != null && !category.trim().isEmpty() &&
                   personaCode.matches("^[a-zA-Z0-9_]+$");
        }
        
        /**
         * Get display name for UI
         */
        public String getDisplayName() {
            return title != null ? title : (personaCode != null ? personaCode : "Unknown");
        }
        
        /**
         * Get short description for preview
         */
        public String getShortDescription() {
            if (description == null || description.trim().isEmpty()) {
                return "No description available";
            }
            return description.length() > 100 ? description.substring(0, 100) + "..." : description;
        }
        
        /**
         * Get category display name
         */
        public String getCategoryDisplayName() {
            if (category == null) return "General";
            
            switch (category.toLowerCase()) {
                case "personal": return "Personal";
                case "general": return "General";
                case "operation": return "Operation";
                case "extension": return "Extension";
                default: return category;
            }
        }
    }

    /**
     * System prompt test request DTO
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class SystemPromptTestRequestDto {
        
        @NotBlank(message = "Prompt content is required")
        private String promptContent;
        
        @NotBlank(message = "Test input is required")
        private String testInput;
        
        @NotBlank(message = "Persona code is required")
        private String personaCode;
    }

    /**
     * System prompt update request DTO
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class SystemPromptUpdateRequestDto {
        
        @NotBlank(message = "System prompt is required")
        @Size(max = 100000, message = "System prompt must be 100000 characters or less")
        private String systemPrompt;
    }

    /**
     * Generic API response wrapper
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ApiResponseDto<T> {
        
        @Builder.Default
        private Boolean success = true;
        
        private T data;
        private String message;
        private String errorMessage;
        
        @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
        private java.time.LocalDateTime timestamp;
        
        /**
         * Create success response
         */
        public static <T> ApiResponseDto<T> success(T data, String message) {
            return ApiResponseDto.<T>builder()
                .success(true)
                .data(data)
                .message(message)
                .timestamp(java.time.LocalDateTime.now())
                .build();
        }
        
        /**
         * Create error response
         */
        public static <T> ApiResponseDto<T> error(String errorMessage) {
            return ApiResponseDto.<T>builder()
                .success(false)
                .errorMessage(errorMessage)
                .timestamp(java.time.LocalDateTime.now())
                .build();
        }
    }

    /**
     * Persona list response with metadata
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class PersonaListDto {
        
        private List<PersonaDto> personas;
        
        @Builder.Default
        private Integer totalCount = 0;
        
        private String category;
        private Boolean activeOnly;
        
        /**
         * Get personas count by category
         */
        public long getCountByCategory(String categoryFilter) {
            if (personas == null || categoryFilter == null) return 0;
            
            return personas.stream()
                .filter(p -> categoryFilter.equals(p.getCategory()))
                .count();
        }
        
        /**
         * Get active personas count
         */
        public long getActiveCount() {
            if (personas == null) return 0;
            
            return personas.stream()
                .filter(p -> Boolean.TRUE.equals(p.getActive()))
                .count();
        }
    }

    /**
     * Persona import/export DTO
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class PersonaImportExportDto {
        
        private List<PersonaDto> personas;
        private String exportDate;
        private String version;
        
        @Builder.Default
        private String format = "json";
        
        /**
         * Create export data
         */
        public static PersonaImportExportDto createExport(List<PersonaDto> personas) {
            return PersonaImportExportDto.builder()
                .personas(personas)
                .exportDate(java.time.LocalDateTime.now().toString())
                .version("1.0")
                .format("json")
                .build();
        }
    }
}