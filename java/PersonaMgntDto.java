package com.ssss.devportal.ai.admin.entity;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.Size;
import java.time.LocalDateTime;
import java.util.List;

public class PersonaMgntDto {

    /**
     * 간단한 페르소나 DTO - 프론트엔드 실제 사용 필드만 포함
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class PersonaDto {
        private String personaCode;
        private String title;
        private String description;
        private String descriptionEn;
        private String category;
        private String welcomeMsg;
        private String systemPrompt;

        public boolean isValid() {
            return personaCode != null && !personaCode.trim().isEmpty() &&
                   title != null && !title.trim().isEmpty() &&
                   description != null && !description.trim().isEmpty() &&
                   descriptionEn != null && !descriptionEn.trim().isEmpty() &&
                   category != null && !category.trim().isEmpty();
        }
    }

    /**
     * 시스템 프롬프트 테스트 요청 - 단순화
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SystemPromptTestRequestDto {
        private String promptContent;
        private String testInput;
        private String personaCode;

        public boolean isValid() {
            return promptContent != null && !promptContent.trim().isEmpty() &&
                   testInput != null && !testInput.trim().isEmpty() &&
                   personaCode != null && !personaCode.trim().isEmpty();
        }
    }

    /**
     * 시스템 프롬프트 업데이트 요청 - 단순화
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SystemPromptUpdateRequestDto {
        private String systemPrompt;

        public boolean isValid() {
            return systemPrompt != null && !systemPrompt.trim().isEmpty();
        }
    }

    /**
     * 통일된 API 응답 형식 - 단순화
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class ApiResponseDto<T> {
        @Builder.Default
        private Boolean success = true;
        private T data;
        private String message;
        private String errorMessage;
        @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
        private LocalDateTime timestamp;

        public static <T> ApiResponseDto<T> success(T data) {
            return ApiResponseDto.<T>builder()
                .success(true)
                .data(data)
                .timestamp(LocalDateTime.now())
                .build();
        }

        public static <T> ApiResponseDto<T> success(T data, String message) {
            return ApiResponseDto.<T>builder()
                .success(true)
                .data(data)
                .message(message)
                .timestamp(LocalDateTime.now())
                .build();
        }

        public static <T> ApiResponseDto<T> error(String errorMessage) {
            return ApiResponseDto.<T>builder()
                .success(false)
                .errorMessage(errorMessage)
                .timestamp(LocalDateTime.now())
                .build();
        }
    }
}