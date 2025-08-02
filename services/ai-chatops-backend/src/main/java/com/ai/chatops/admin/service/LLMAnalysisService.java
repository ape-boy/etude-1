package com.ai.chatops.admin.service;

import com.ai.chatops.admin.dto.AIChatOpsAdminDto;
import com.example.yourproject.llm.LLMService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class LLMAnalysisService {
    @Autowired
    private LLMService llmService;

    @Autowired
    private ChatOpsAdminService chatOpsAdminService;

    // Analyze conversations using LLM
    public String analyzeConversations(String personaCode, String period) {
        try {
            List<AIChatOpsAdminDto> conversations = chatOpsAdminService.getConversationsForAnalysis(personaCode,
                    period);

            if (conversations == null || conversations.isEmpty()) {
                return "No conversation data available for analysis.";
            }

            String systemPrompt = buildAnalysisSystemPrompt();
            String userPrompt = buildAnalysisUserPrompt(conversations);

            return llmService.LLMCallAsync("maverick", systemPrompt, userPrompt).join().toString();
        } catch (Exception e) {
            StringBuilder errorMessage = new StringBuilder();
            errorMessage.append("Failed to analyze conversations: ").append(e.getMessage());
            throw new RuntimeException(errorMessage.toString(), e);
        }
    }

    // Test system prompt with sample input
    public String testSystemPrompt(String systemPrompt, String testInput) {
        if (systemPrompt == null || systemPrompt.trim().isEmpty()) {
            throw new IllegalArgumentException("System prompt cannot be null or empty");
        }

        if (testInput == null || testInput.trim().isEmpty()) {
            throw new IllegalArgumentException("Test input cannot be null or empty");
        }

        try {
            return llmService.LLMCallAsync("maverick", systemPrompt, testInput).join().toString();
        } catch (Exception e) {
            StringBuilder errorMessage = new StringBuilder();
            errorMessage.append("Failed to test system prompt: ").append(e.getMessage());
            throw new RuntimeException(errorMessage.toString(), e);
        }
    }

    // Build system prompt for conversation analysis
    private String buildAnalysisSystemPrompt() {
        StringBuilder promptBuilder = new StringBuilder();
        promptBuilder.append(
                "You are an AI conversation analyst. Analyze the provided conversation data and provide comprehensive insights.\n\n");
        promptBuilder.append("Your analysis should include:\n");
        promptBuilder.append("1. **Usage Statistics**: Total conversations, active users, popular topics\n");
        promptBuilder.append("2. **Performance Metrics**: Response quality, user satisfaction indicators\n");
        promptBuilder.append("3. **Content Analysis**: Common questions, effective responses, improvement areas\n");
        promptBuilder.append("4. **Trend Analysis**: Usage patterns, peak times, user behavior\n");
        promptBuilder.append("5. **Recommendations**: Actionable insights for improvement\n\n");
        promptBuilder.append("Format your response in clear markdown with proper sections and bullet points.\n");
        promptBuilder.append("Provide specific numbers and percentages where possible.\n");
        promptBuilder.append("Keep the analysis concise but comprehensive.");
        return promptBuilder.toString();
    }

    // Build user prompt with conversation data
    private String buildAnalysisUserPrompt(List<AIChatOpsAdminDto> conversations) {
        StringBuilder promptBuilder = new StringBuilder();
        promptBuilder.append("Please analyze the following conversation data:\n\n");

        // Add summary info
        promptBuilder.append("## Dataset Summary\n");
        promptBuilder.append("- Total conversations: ").append(conversations.size()).append("\n");

        // Count unique users
        long uniqueUsers = conversations.stream()
                .map(AIChatOpsAdminDto::getCreator)
                .distinct()
                .count();
        promptBuilder.append("- Unique users: ").append(uniqueUsers).append("\n");

        // Count personas
        long uniquePersonas = conversations.stream()
                .map(AIChatOpsAdminDto::getPersonaCode)
                .distinct()
                .count();
        promptBuilder.append("- Personas involved: ").append(uniquePersonas).append("\n\n");

        // Add conversation samples (limit to first 50 for performance)
        promptBuilder.append("## Conversation Samples\n");
        int sampleCount = Math.min(50, conversations.size());

        for (int i = 0; i < sampleCount; i++) {
            AIChatOpsAdminDto conv = conversations.get(i);
            promptBuilder.append("### Conversation ").append(i + 1).append("\n");
            promptBuilder.append("- **Persona**: ").append(conv.getPersonaCode()).append("\n");
            promptBuilder.append("- **User**: ").append(conv.getCreator()).append("\n");
            promptBuilder.append("- **Date**: ").append(conv.getCreatedDate()).append("\n");
            promptBuilder.append("- **User Query**: ").append(truncateText(conv.getUserQuery(), 200)).append("\n");
            promptBuilder.append("- **AI Response**: ").append(truncateText(conv.getAiQuery(), 300)).append("\n\n");
        }

        if (conversations.size() > sampleCount) {
            promptBuilder.append("*Note: Showing first ").append(sampleCount)
                    .append(" conversations out of ").append(conversations.size()).append(" total.*\n\n");
        }

        // Add persona breakdown
        promptBuilder.append("## Persona Usage Breakdown\n");
        conversations.stream()
                .collect(java.util.stream.Collectors.groupingBy(
                        AIChatOpsAdminDto::getPersonaCode,
                        java.util.stream.Collectors.counting()))
                .entrySet().stream()
                .sorted(java.util.Map.Entry.<String, Long>comparingByValue().reversed())
                .forEach(entry -> promptBuilder.append("- ").append(entry.getKey())
                        .append(": ").append(entry.getValue()).append(" conversations\n"));

        promptBuilder.append("\nPlease provide a comprehensive analysis based on this data.");

        return promptBuilder.toString();
    }

    // Utility method to truncate text
    private String truncateText(String text, int maxLength) {
        if (text == null)
            return "";
        if (text.length() <= maxLength)
            return text;
        return new StringBuilder().append(text.substring(0, maxLength)).append("...").toString();
    }

    // Analyze specific persona performance
    public String analyzePersonaPerformance(String personaCode, String period) {
        try {
            List<AIChatOpsAdminDto> conversations = chatOpsAdminService.getConversationsForAnalysis(personaCode,
                    period);

            if (conversations == null || conversations.isEmpty()) {
                return new StringBuilder().append("No conversation data available for persona: ").append(personaCode)
                        .toString();
            }

            String systemPrompt = buildPersonaAnalysisSystemPrompt();
            String userPrompt = buildPersonaAnalysisUserPrompt(personaCode, conversations);

            return llmService.LLMCallAsync("maverick", systemPrompt, userPrompt).join().toString();
        } catch (Exception e) {
            StringBuilder errorMessage = new StringBuilder();
            errorMessage.append("Failed to analyze persona performance: ").append(e.getMessage());
            throw new RuntimeException(errorMessage.toString(), e);
        }
    }

    // Build system prompt for persona-specific analysis
    private String buildPersonaAnalysisSystemPrompt() {
        StringBuilder promptBuilder = new StringBuilder();
        promptBuilder.append("You are analyzing the performance of a specific AI persona. ");
        promptBuilder.append("Focus on persona-specific metrics and insights.\n\n");
        promptBuilder.append("Your analysis should cover:\n");
        promptBuilder.append("1. **Persona Effectiveness**: How well the persona serves its intended purpose\n");
        promptBuilder.append("2. **User Engagement**: Frequency of use, user retention, satisfaction\n");
        promptBuilder.append("3. **Response Quality**: Relevance, helpfulness, accuracy of responses\n");
        promptBuilder.append("4. **Common Use Cases**: What users typically ask this persona\n");
        promptBuilder.append("5. **Improvement Areas**: Specific recommendations for this persona\n\n");
        promptBuilder.append("Provide actionable insights with specific examples from the conversation data.");
        return promptBuilder.toString();
    }

    // Build user prompt for persona analysis
    private String buildPersonaAnalysisUserPrompt(String personaCode, List<AIChatOpsAdminDto> conversations) {
        StringBuilder promptBuilder = new StringBuilder();
        promptBuilder.append("Analyze the performance of persona: **").append(personaCode).append("**\n\n");

        promptBuilder.append("## Persona Data Summary\n");
        promptBuilder.append("- Total conversations: ").append(conversations.size()).append("\n");

        long uniqueUsers = conversations.stream()
                .map(AIChatOpsAdminDto::getCreator)
                .distinct()
                .count();
        promptBuilder.append("- Unique users: ").append(uniqueUsers).append("\n\n");

        // Add conversation details
        promptBuilder.append("## Recent Conversations\n");
        int limit = Math.min(20, conversations.size());

        for (int i = 0; i < limit; i++) {
            AIChatOpsAdminDto conv = conversations.get(i);
            promptBuilder.append("**Conversation ").append(i + 1).append("**\n");
            promptBuilder.append("User: ").append(truncateText(conv.getUserQuery(), 150)).append("\n");
            promptBuilder.append("AI: ").append(truncateText(conv.getAiQuery(), 200)).append("\n\n");
        }

        return promptBuilder.toString();
    }

    // Generate usage recommendations
    public String generateUsageRecommendations(String period) {
        try {
            String systemPrompt = buildRecommendationSystemPrompt();

            // Get overall statistics
            List<AIChatOpsAdminDto> personaStats = chatOpsAdminService.getConversationCountsByPersona(period);
            String userPrompt = buildRecommendationUserPrompt(personaStats, period);

            return llmService.LLMCallAsync("maverick", systemPrompt, userPrompt).join().toString();
        } catch (Exception e) {
            StringBuilder errorMessage = new StringBuilder();
            errorMessage.append("Failed to generate recommendations: ").append(e.getMessage());
            throw new RuntimeException(errorMessage.toString(), e);
        }
    }

    // Build system prompt for recommendations
    private String buildRecommendationSystemPrompt() {
        StringBuilder promptBuilder = new StringBuilder();
        promptBuilder.append("You are an AI system optimization consultant. ");
        promptBuilder.append("Based on usage statistics, provide actionable recommendations.\n\n");
        promptBuilder.append("Focus on:\n");
        promptBuilder.append("1. **Resource Optimization**: Which personas are over/under utilized\n");
        promptBuilder.append("2. **User Experience**: How to improve user satisfaction\n");
        promptBuilder.append("3. **System Efficiency**: Performance improvements\n");
        promptBuilder.append("4. **Feature Development**: New capabilities to consider\n");
        promptBuilder.append("5. **Training Needs**: Areas where personas need improvement\n\n");
        promptBuilder.append("Provide specific, measurable recommendations with priority levels.");
        return promptBuilder.toString();
    }

    // Build user prompt for recommendations
    private String buildRecommendationUserPrompt(List<AIChatOpsAdminDto> personaStats, String period) {
        StringBuilder promptBuilder = new StringBuilder();
        promptBuilder.append("Generate optimization recommendations based on ").append(period)
                .append(" usage data:\n\n");

        promptBuilder.append("## Persona Usage Statistics\n");
        for (AIChatOpsAdminDto stat : personaStats) {
            promptBuilder.append("- **").append(stat.getPersonaCode()).append("**: ")
                    .append(stat.getTotalConversations()).append(" conversations, ")
                    .append(stat.getUniqueUsers()).append(" users\n");
        }

        promptBuilder.append("\nPlease provide comprehensive optimization recommendations.");
        return promptBuilder.toString();
    }
}
