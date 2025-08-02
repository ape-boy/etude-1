package com.ai.chatops;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.transaction.annotation.EnableTransactionManagement;

/**
 * Main application class for AI ChatOps Backend Service
 * 
 * This service provides REST API endpoints for:
 * - Persona management and administration
 * - Conversation analytics and reporting
 * - System configuration and settings
 * - LLM integration and prompt testing
 */
@SpringBootApplication
@EnableTransactionManagement
@EnableConfigurationProperties
public class Application {

    public static void main(String[] args) {
        System.setProperty("spring.profiles.default", "dev");
        SpringApplication.run(Application.class, args);
    }
}