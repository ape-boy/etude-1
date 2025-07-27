package com.ssss.devportal.ai.admin.entity;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Conversation Management DTOs for admin interface
 */
public class ConvMgntDto {

    /**
     * Main conversation data transfer object
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
        private String userId;
        
        @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
        private LocalDateTime createdDate;
        
        private Long responseTime; // in milliseconds
        
        @Builder.Default
        private Boolean success = true;
        
        /**
         * Get query length for stats
         */
        public int getQueryLength() {
            return userQuery != null ? userQuery.length() : 0;
        }
        
        /**
         * Get response length for stats
         */
        public int getResponseLength() {
            return aiResponse != null ? aiResponse.length() : 0;
        }
        
        /**
         * Get truncated query for display
         */
        public String getTruncatedQuery(int maxLength) {
            if (userQuery == null || userQuery.length() <= maxLength) {
                return userQuery;
            }
            return userQuery.substring(0, maxLength) + "...";
        }
        
        /**
         * Get truncated response for display
         */
        public String getTruncatedResponse(int maxLength) {
            if (aiResponse == null || aiResponse.length() <= maxLength) {
                return aiResponse;
            }
            return aiResponse.substring(0, maxLength) + "...";
        }
        
        /**
         * Format response time for display
         */
        public String getFormattedResponseTime() {
            if (responseTime == null) return "-";
            if (responseTime < 1000) return responseTime + "ms";
            return String.format("%.1fs", responseTime / 1000.0);
        }
        
        /**
         * Get display date
         */
        public String getDisplayDate() {
            if (createdDate == null) return "-";
            return createdDate.toString().replace("T", " ");
        }
    }

    /**
     * Paginated conversation list DTO
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ConversationPageDto {
        
        private List<ConversationDto> conversations;
        
        @Builder.Default
        private Integer currentPage = 0;
        
        @Builder.Default
        private Integer pageSize = 20;
        
        @Builder.Default
        private Integer totalPages = 0;
        
        @Builder.Default
        private Long totalElements = 0L;
        
        @Builder.Default
        private Boolean first = true;
        
        @Builder.Default
        private Boolean last = true;
        
        @Builder.Default
        private Boolean hasNext = false;
        
        @Builder.Default
        private Boolean hasPrevious = false;
        
        // Filter parameters
        private String personaCode;
        private String userId;
        private String startDate;
        private String endDate;
        
        /**
         * Check if page has content
         */
        public boolean hasContent() {
            return conversations != null && !conversations.isEmpty();
        }
        
        /**
         * Get number of elements in current page
         */
        public int getNumberOfElements() {
            return conversations != null ? conversations.size() : 0;
        }
        
        /**
         * Calculate start index for current page
         */
        public long getStartIndex() {
            return (long) currentPage * pageSize + 1;
        }
        
        /**
         * Calculate end index for current page
         */
        public long getEndIndex() {
            long start = getStartIndex();
            return Math.min(start + getNumberOfElements() - 1, totalElements);
        }
    }

    /**
     * Conversation search/filter request DTO
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ConversationSearchDto {
        
        @Builder.Default
        private Integer page = 0;
        
        @Builder.Default
        private Integer size = 20;
        
        private String personaCode;
        private String userId;
        private String startDate;
        private String endDate;
        private String keyword;
        
        @Builder.Default
        private String sortBy = "createdDate";
        
        @Builder.Default
        private String sortDirection = "DESC";
        
        /**
         * Check if any filter is applied
         */
        public boolean hasFilters() {
            return (personaCode != null && !personaCode.trim().isEmpty()) ||
                   (userId != null && !userId.trim().isEmpty()) ||
                   (startDate != null && !startDate.trim().isEmpty()) ||
                   (endDate != null && !endDate.trim().isEmpty()) ||
                   (keyword != null && !keyword.trim().isEmpty());
        }
    }

    /**
     * Conversation analytics request DTO
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ConversationAnalyticsRequestDto {
        
        private String personaCode;
        
        @Builder.Default
        private String period = "30days"; // 7days, 30days, 90days, all
        
        private String startDate;
        private String endDate;
        
        @Builder.Default
        private String analysisType = "comprehensive"; // summary, detailed, comprehensive
        
        @Builder.Default
        private Boolean includeUserQueries = true;
        
        @Builder.Default
        private Boolean includePerformanceMetrics = true;
        
        @Builder.Default
        private Boolean includeRecommendations = true;
        
        /**
         * Get period display name
         */
        public String getPeriodDisplayName() {
            if (period == null) return "All Time";
            
            switch (period.toLowerCase()) {
                case "today":
                case "1day": return "Today";
                case "7days": return "Last 7 Days";
                case "30days": return "Last 30 Days";
                case "90days": return "Last 90 Days";
                case "all": return "All Time";
                default: return period;
            }
        }
    }

    /**
     * Conversation analytics response DTO
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ConversationAnalyticsResponseDto {
        
        private String analysisResult; // LLM-generated analysis as raw text
        private String period;
        private String personaCode;
        
        @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
        private LocalDateTime generatedAt;
        
        @Builder.Default
        private Long processingTimeMs = 0L;
        
        private Long totalConversations;
        private Long uniqueUsers;
        
        /**
         * Get formatted processing time
         */
        public String getFormattedProcessingTime() {
            if (processingTimeMs == null) return "-";
            if (processingTimeMs < 1000) return processingTimeMs + "ms";
            return String.format("%.1fs", processingTimeMs / 1000.0);
        }
        
        /**
         * Check if analysis is available
         */
        public boolean hasAnalysis() {
            return analysisResult != null && !analysisResult.trim().isEmpty();
        }
        
        /**
         * Get analysis preview (first 200 characters)
         */
        public String getAnalysisPreview() {
            if (!hasAnalysis()) return "No analysis available";
            
            if (analysisResult.length() <= 200) {
                return analysisResult;
            }
            return analysisResult.substring(0, 200) + "...";
        }
    }

    /**
     * Conversation export DTO
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ConversationExportDto {
        
        private List<ConversationDto> conversations;
        private String exportDate;
        private String personaCode;
        private String period;
        
        @Builder.Default
        private String format = "json"; // json, csv, xlsx
        
        private Long totalRecords;
        
        /**
         * Create export data
         */
        public static ConversationExportDto createExport(List<ConversationDto> conversations, 
                                                        String personaCode, String period) {
            return ConversationExportDto.builder()
                .conversations(conversations)
                .exportDate(LocalDateTime.now().toString())
                .personaCode(personaCode)
                .period(period)
                .totalRecords((long) (conversations != null ? conversations.size() : 0))
                .format("json")
                .build();
        }
    }
}