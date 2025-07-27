package com.ssss.devportal.ai.admin.entity;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

public class ConvMgntDto {

    /**
     * 간단한 대화 DTO - 프론트엔드 실제 사용 필드만 포함
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ConversationDto {
        private Long id;
        private String personaCode;
        private String userQuery;
        private String aiResponse;
        @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
        private LocalDateTime createdDate;
        private String userId;
        private Integer responseTime;
        private Boolean success;
    }

    /**
     * 대화 페이지네이션 DTO - 단순화
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ConversationPageDto {
        private List<ConversationDto> conversations;
        private int currentPage;
        private int pageSize;
        private int totalPages;
        private long totalElements;
        private boolean first;
        private boolean last;
        private boolean hasNext;
        private boolean hasPrevious;
        private String personaCode;
        private String userId;
        private String startDate;
        private String endDate;
    }
}