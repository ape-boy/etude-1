package com.example.yourproject.chatAdmin.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.time.LocalDateTime;
import java.util.List;

/**
 * AI ChatOps Admin DTO - Integrated data transfer object
 * Uses createSuccessResponse/createErrorResponse pattern
 */
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
    public AIChatOpsAdminDto() {}
    
    // 성공 응답 생성 메서드
    public static AIChatOpsAdminDto createSuccessResponse(Object data, String message) {
        AIChatOpsAdminDto dto = new AIChatOpsAdminDto();
        dto.success = true;
        dto.data = data;
        dto.message = message;
        return dto;
    }
    
    // 리스트 데이터용 성공 응답 생성 메서드
    public static AIChatOpsAdminDto createSuccessResponse(List<?> dataList, String message) {
        AIChatOpsAdminDto dto = new AIChatOpsAdminDto();
        dto.success = true;
        dto.data = dataList;
        dto.message = message;
        return dto;
    }
    
    // 단일 객체용 성공 응답 생성 메서드
    public static AIChatOpsAdminDto createSuccessResponse(AIChatOpsAdminDto singleData, String message) {
        AIChatOpsAdminDto dto = new AIChatOpsAdminDto();
        dto.success = true;
        dto.data = singleData;
        dto.message = message;
        return dto;
    }
    
    // 에러 응답 생성 메서드
    public static AIChatOpsAdminDto createErrorResponse(String errorMessage) {
        AIChatOpsAdminDto dto = new AIChatOpsAdminDto();
        dto.success = false;
        dto.errorMessage = errorMessage;
        dto.message = "Operation failed";
        return dto;
    }
    
    // 분석 결과용 성공 응답 생성 메서드
    public static AIChatOpsAdminDto createAnalysisResponse(String analysisResult, String message) {
        AIChatOpsAdminDto dto = new AIChatOpsAdminDto();
        dto.success = true;
        dto.data = analysisResult;
        dto.analysisResult = analysisResult;
        dto.message = message;
        return dto;
    }
    
    // Builder 패턴을 위한 메서드들
    public static AIChatOpsAdminDto createPersona() {
        return new AIChatOpsAdminDto();
    }
    
    public AIChatOpsAdminDto personaCode(String personaCode) {
        this.personaCode = personaCode;
        return this;
    }
    
    public AIChatOpsAdminDto title(String title) {
        this.title = title;
        return this;
    }
    
    public AIChatOpsAdminDto description(String description) {
        this.description = description;
        return this;
    }
    
    public AIChatOpsAdminDto category(String category) {
        this.category = category;
        return this;
    }
    
    public AIChatOpsAdminDto promptType(String promptType) {
        this.promptType = promptType;
        return this;
    }
    
    public AIChatOpsAdminDto personaPrompt(String personaPrompt) {
        this.personaPrompt = personaPrompt;
        return this;
    }
    
    // Getter/Setter 메서드들
    public boolean isSuccess() {
        return success;
    }
    
    public void setSuccess(boolean success) {
        this.success = success;
    }
    
    public Object getData() {
        return data;
    }
    
    public void setData(Object data) {
        this.data = data;
    }
    
    public String getMessage() {
        return message;
    }
    
    public void setMessage(String message) {
        this.message = message;
    }
    
    public String getErrorMessage() {
        return errorMessage;
    }
    
    public void setErrorMessage(String errorMessage) {
        this.errorMessage = errorMessage;
    }
    
    public String getPersonaId() {
        return personaId;
    }
    
    public void setPersonaId(String personaId) {
        this.personaId = personaId;
    }
    
    public String getPersonaCode() {
        return personaCode;
    }
    
    public void setPersonaCode(String personaCode) {
        this.personaCode = personaCode;
    }
    
    public String getTitle() {
        return title;
    }
    
    public void setTitle(String title) {
        this.title = title;
    }
    
    public String getDescription() {
        return description;
    }
    
    public void setDescription(String description) {
        this.description = description;
    }
    
    public String getDescriptionEn() {
        return descriptionEn;
    }
    
    public void setDescriptionEn(String descriptionEn) {
        this.descriptionEn = descriptionEn;
    }
    
    public String getCategory() {
        return category;
    }
    
    public void setCategory(String category) {
        this.category = category;
    }
    
    public String getIconPath() {
        return iconPath;
    }
    
    public void setIconPath(String iconPath) {
        this.iconPath = iconPath;
    }
    
    public String getWelcomeMsg() {
        return welcomeMsg;
    }
    
    public void setWelcomeMsg(String welcomeMsg) {
        this.welcomeMsg = welcomeMsg;
    }
    
    public String getPromptType() {
        return promptType;
    }
    
    public void setPromptType(String promptType) {
        this.promptType = promptType;
    }
    
    public String getPersonaPrompt() {
        return personaPrompt;
    }
    
    public void setPersonaPrompt(String personaPrompt) {
        this.personaPrompt = personaPrompt;
    }
    
    public String getUserQuery() {
        return userQuery;
    }
    
    public void setUserQuery(String userQuery) {
        this.userQuery = userQuery;
    }
    
    public String getAiQuery() {
        return aiQuery;
    }
    
    public void setAiQuery(String aiQuery) {
        this.aiQuery = aiQuery;
    }
    
    public String getCreator() {
        return creator;
    }
    
    public void setCreator(String creator) {
        this.creator = creator;
    }
    
    public String getAnalysisResult() {
        return analysisResult;
    }
    
    public void setAnalysisResult(String analysisResult) {
        this.analysisResult = analysisResult;
    }
    
    public String getAnalysisType() {
        return analysisType;
    }
    
    public void setAnalysisType(String analysisType) {
        this.analysisType = analysisType;
    }
    
    public String getPeriod() {
        return period;
    }
    
    public void setPeriod(String period) {
        this.period = period;
    }
    
    public Integer getTotalConversations() {
        return totalConversations;
    }
    
    public void setTotalConversations(Integer totalConversations) {
        this.totalConversations = totalConversations;
    }
    
    public Integer getUniqueUsers() {
        return uniqueUsers;
    }
    
    public void setUniqueUsers(Integer uniqueUsers) {
        this.uniqueUsers = uniqueUsers;
    }
    
    public Double getAvgResponseTime() {
        return avgResponseTime;
    }
    
    public void setAvgResponseTime(Double avgResponseTime) {
        this.avgResponseTime = avgResponseTime;
    }
    
    public Double getSuccessRate() {
        return successRate;
    }
    
    public void setSuccessRate(Double successRate) {
        this.successRate = successRate;
    }
    
    public LocalDateTime getCreatedDate() {
        return createdDate;
    }
    
    public void setCreatedDate(LocalDateTime createdDate) {
        this.createdDate = createdDate;
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