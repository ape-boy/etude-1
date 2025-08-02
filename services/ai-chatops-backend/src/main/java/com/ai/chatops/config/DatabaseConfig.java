package com.ai.chatops.config;

import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.event.EventListener;
import org.springframework.core.io.ClassPathResource;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.util.FileCopyUtils;

import java.io.IOException;
import java.nio.charset.StandardCharsets;

/**
 * Database configuration and initialization
 * Sets up initial data for development and testing
 */
@Configuration
public class DatabaseConfig {

    private final JdbcTemplate jdbcTemplate;

    public DatabaseConfig(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @EventListener(ApplicationReadyEvent.class)
    public void initializeDatabase() {
        try {
            // Initialize personas table
            createPersonasTable();
            insertSamplePersonas();
            
            // Initialize conversations table for analytics
            createConversationsTable();
            insertSampleConversations();
            
        } catch (Exception e) {
            // Log error but don't fail startup
            System.err.println("Warning: Failed to initialize database: " + e.getMessage());
        }
    }

    private void createPersonasTable() {
        String sql = """
            CREATE TABLE IF NOT EXISTS personas (
                id BIGINT AUTO_INCREMENT PRIMARY KEY,
                persona_code VARCHAR(100) UNIQUE NOT NULL,
                title VARCHAR(200) NOT NULL,
                description TEXT,
                category VARCHAR(50) NOT NULL,
                persona_prompt TEXT NOT NULL,
                is_active BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
            """;
        jdbcTemplate.execute(sql);
    }

    private void createConversationsTable() {
        String sql = """
            CREATE TABLE IF NOT EXISTS conversations (
                id BIGINT AUTO_INCREMENT PRIMARY KEY,
                conversation_id VARCHAR(100) NOT NULL,
                persona_code VARCHAR(100) NOT NULL,
                user_id VARCHAR(100),
                message_count INT DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
            """;
        jdbcTemplate.execute(sql);
    }

    private void insertSamplePersonas() {
        // Check if data already exists
        Integer count = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM personas", Integer.class);
        if (count != null && count > 0) {
            return; // Data already exists
        }

        String[] insertSqls = {
            """
            INSERT INTO personas (persona_code, title, description, category, persona_prompt, is_active) VALUES
            ('general-assistant', 'General Assistant', 'General purpose AI assistant for various tasks', 'general', 
             'You are a helpful and knowledgeable AI assistant. Provide clear, accurate, and helpful responses to user queries.', true)
            """,
            """
            INSERT INTO personas (persona_code, title, description, category, persona_prompt, is_active) VALUES
            ('personal-helper', 'Personal Helper', 'Personal productivity and task management assistant', 'personal', 
             'You are a personal productivity assistant. Help users organize tasks, manage schedules, and improve efficiency.', true)
            """,
            """
            INSERT INTO personas (persona_code, title, description, category, persona_prompt, is_active) VALUES
            ('ops-specialist', 'Operations Specialist', 'System operations and infrastructure management', 'operation', 
             'You are an operations specialist. Assist with system monitoring, troubleshooting, and infrastructure management.', true)
            """,
            """
            INSERT INTO personas (persona_code, title, description, category, persona_prompt, is_active) VALUES
            ('data-analyst', 'Data Analyst', 'Data analysis and insights specialist', 'general', 
             'You are a data analyst. Help users analyze data, create reports, and derive meaningful insights.', false)
            """
        };

        for (String sql : insertSqls) {
            try {
                jdbcTemplate.execute(sql);
            } catch (Exception e) {
                System.err.println("Warning: Failed to insert sample persona: " + e.getMessage());
            }
        }
    }

    private void insertSampleConversations() {
        // Check if data already exists
        Integer count = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM conversations", Integer.class);
        if (count != null && count > 0) {
            return; // Data already exists
        }

        // Insert sample conversation data for analytics
        String[] insertSqls = {
            "INSERT INTO conversations (conversation_id, persona_code, user_id, message_count) VALUES ('conv-001', 'general-assistant', 'user-001', 5)",
            "INSERT INTO conversations (conversation_id, persona_code, user_id, message_count) VALUES ('conv-002', 'personal-helper', 'user-002', 8)",
            "INSERT INTO conversations (conversation_id, persona_code, user_id, message_count) VALUES ('conv-003', 'ops-specialist', 'user-001', 12)",
            "INSERT INTO conversations (conversation_id, persona_code, user_id, message_count) VALUES ('conv-004', 'general-assistant', 'user-003', 3)",
            "INSERT INTO conversations (conversation_id, persona_code, user_id, message_count) VALUES ('conv-005', 'personal-helper', 'user-002', 7)"
        };

        for (String sql : insertSqls) {
            try {
                jdbcTemplate.execute(sql);
            } catch (Exception e) {
                System.err.println("Warning: Failed to insert sample conversation: " + e.getMessage());
            }
        }
    }
}