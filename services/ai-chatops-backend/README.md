# AI ChatOps Backend Service

Spring Boot-based backend service providing REST APIs for AI ChatOps persona management, conversation handling, and system administration.

## Overview

The AI ChatOps Backend Service is a robust Spring Boot application that serves as the central API layer for the ChatOps system. It provides comprehensive REST endpoints for persona management, conversation processing, analytics, and system administration, with integrated database support and comprehensive error handling.

## Technology Stack

- **Framework**: Spring Boot 3.2.1
- **Java Version**: JDK 17+
- **Build Tool**: Maven 3.8+
- **Database**: H2 (development), PostgreSQL/MySQL (production)
- **ORM**: MyBatis 3.0.3
- **Security**: Spring Security 6.x
- **Validation**: Jakarta Validation API
- **Documentation**: SpringDoc OpenAPI 3
- **Testing**: JUnit 5, Spring Boot Test

## Features

### 🎯 Core API Services
- RESTful API design with comprehensive endpoints
- JSON request/response handling
- Comprehensive error handling and validation
- API documentation with OpenAPI/Swagger
- Health check and monitoring endpoints

### 🎭 Persona Management
- CRUD operations for AI personas
- Category-based persona organization
- System prompt management and testing
- Persona status and lifecycle management
- Bulk operations support

### 💬 Conversation Processing
- Asynchronous message processing
- Conversation history management
- Real-time conversation analytics
- Message threading and context management
- Performance metrics tracking

### 📊 Analytics & Reporting
- Conversation statistics and trends
- Usage metrics and performance data
- Historical data analysis
- Export capabilities for reports
- Real-time dashboard data

### 🔧 System Administration
- Configuration management APIs
- Health monitoring and diagnostics
- Database migration and maintenance
- User management and permissions
- System settings and preferences

## Project Structure

```
src/main/java/com/ai/chatops/
├── config/
│   ├── CorsConfig.java         # CORS configuration
│   ├── DatabaseConfig.java     # Database setup and initialization
│   └── OpenApiConfig.java      # API documentation configuration
├── controller/
│   ├── AdminController.java    # Admin management endpoints
│   ├── ChatController.java     # Conversation and messaging endpoints
│   ├── HealthController.java   # Health check endpoints
│   └── PersonaController.java  # Persona management endpoints
├── dto/
│   ├── PersonaDto.java         # Persona data transfer objects
│   ├── ConversationDto.java    # Conversation data structures
│   ├── MessageDto.java         # Message request/response objects
│   └── StatsDto.java           # Analytics and statistics DTOs
├── mapper/
│   ├── PersonaMapper.java      # MyBatis persona data mapping
│   ├── ConversationMapper.java # Conversation data mapping
│   └── StatsMapper.java        # Analytics data mapping
├── model/
│   ├── Persona.java            # Persona entity model
│   ├── Conversation.java       # Conversation entity model
│   └── SystemPrompt.java       # System prompt entity model
├── service/
│   ├── PersonaService.java     # Persona business logic
│   ├── ConversationService.java # Conversation processing
│   ├── AnalyticsService.java   # Analytics and reporting
│   └── AdminService.java       # Administrative operations
└── ChatOpsBackendApplication.java # Main application class

src/main/resources/
├── application.yml             # Main configuration
├── application-dev.yml         # Development profile
├── application-prod.yml        # Production profile
├── schema.sql                  # Database schema
├── data.sql                    # Sample data
└── mapper/
    ├── PersonaMapper.xml       # MyBatis persona queries
    ├── ConversationMapper.xml  # Conversation queries
    └── StatsMapper.xml         # Analytics queries
```

## Installation & Setup

### Prerequisites
- JDK 17 or higher
- Maven 3.8 or higher
- Database (H2 for development, PostgreSQL/MySQL for production)

### Development Setup
```bash
# Navigate to the service directory
cd services/ai-chatops-backend

# Install dependencies and compile
mvn clean compile

# Run tests
mvn test

# Start development server
mvn spring-boot:run

# The service will be available at http://localhost:3005
```

### Build for Production
```bash
# Build JAR file
mvn clean package

# Run production build
java -jar target/ai-chatops-backend-1.0.0.jar
```

## Configuration

### Application Profiles
The service supports multiple profiles for different environments:

**Development (`application-dev.yml`)**:
```yaml
server:
  port: 3005
spring:
  datasource:
    url: jdbc:h2:mem:chatops;DB_CLOSE_DELAY=-1
    driver-class-name: org.h2.Driver
  h2:
    console:
      enabled: true
      path: /h2-console
```

**Production (`application-prod.yml`)**:
```yaml
server:
  port: 3005
spring:
  datasource:
    url: ${DATABASE_URL:jdbc:postgresql://localhost:5432/chatops}
    username: ${DATABASE_USER:chatops}
    password: ${DATABASE_PASSWORD:password}
```

### CORS Configuration
```java
@Configuration
public class CorsConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOrigins("http://localhost:3000", "http://localhost:3002")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true);
    }
}
```

## API Endpoints

### Persona Management
- `GET /personas` - Fetch all active personas
- `GET /admin/personas` - Fetch all personas (admin)
- `POST /admin/personas` - Create new persona
- `PUT /admin/personas/{code}` - Update persona
- `DELETE /admin/personas/{code}` - Delete persona
- `POST /admin/system-prompt/test` - Test system prompt

### Conversation Processing
- `POST /message-async` - Send chat message (async)
- `GET /conversations/{id}` - Get conversation details
- `GET /admin/conversations` - List all conversations (admin)
- `GET /admin/conversations/stats` - Get conversation statistics

### Health & Monitoring
- `GET /health` - Basic health check
- `GET /actuator/health` - Detailed health information
- `GET /actuator/metrics` - Application metrics
- `GET /api-docs` - OpenAPI documentation

### System Administration
- `GET /admin/config` - Get system configuration
- `PUT /admin/config` - Update system configuration
- `GET /admin/users` - User management
- `POST /admin/maintenance` - System maintenance operations

## Database Schema

### Personas Table
```sql
CREATE TABLE personas (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    persona_code VARCHAR(100) UNIQUE NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL,
    persona_prompt TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### Conversations Table
```sql
CREATE TABLE conversations (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    conversation_id VARCHAR(100) NOT NULL,
    persona_code VARCHAR(100) NOT NULL,
    user_id VARCHAR(100),
    message_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

## Service Layer Architecture

### PersonaService
Handles all persona-related business logic:
```java
@Service
public class PersonaService {
    
    public List<PersonaDto> getAllActivePersonas() {
        return personaMapper.findAllActive()
                .stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }
    
    public PersonaDto createPersona(PersonaDto personaDto) {
        validatePersona(personaDto);
        Persona persona = convertToEntity(personaDto);
        personaMapper.insert(persona);
        return convertToDto(persona);
    }
}
```

### ConversationService
Manages conversation processing and analytics:
```java
@Service
public class ConversationService {
    
    @Async
    public CompletableFuture<MessageResponseDto> processMessageAsync(MessageRequestDto request) {
        // Process message asynchronously
        return CompletableFuture.completedFuture(response);
    }
    
    public ConversationStatsDto getConversationStats() {
        return conversationMapper.getStats();
    }
}
```

## Error Handling

### Global Exception Handler
```java
@ControllerAdvice
public class GlobalExceptionHandler {
    
    @ExceptionHandler(PersonaNotFoundException.class)
    public ResponseEntity<ErrorResponse> handlePersonaNotFound(PersonaNotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new ErrorResponse("PERSONA_NOT_FOUND", ex.getMessage()));
    }
    
    @ExceptionHandler(ValidationException.class)
    public ResponseEntity<ErrorResponse> handleValidation(ValidationException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new ErrorResponse("VALIDATION_ERROR", ex.getMessage()));
    }
}
```

## Security

### Authentication & Authorization
- JWT token-based authentication
- Role-based access control (RBAC)
- API key authentication for external services
- Request rate limiting and throttling

### Data Protection
- Input validation and sanitization
- SQL injection prevention through MyBatis
- XSS protection headers
- CSRF protection for state-changing operations

## Testing

### Unit Testing
```bash
# Run unit tests
mvn test

# Run tests with coverage
mvn test jacoco:report
```

### Integration Testing
```bash
# Run integration tests
mvn verify -P integration-tests

# Run specific test class
mvn test -Dtest=PersonaControllerTest
```

### Test Configuration
```java
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
class PersonaControllerTest {
    
    @Test
    void shouldCreatePersona() {
        // Test implementation
    }
}
```

## Performance

### Optimization Features
- Connection pooling for database operations
- Async processing for long-running operations
- Caching for frequently accessed data
- Query optimization with MyBatis

### Monitoring
- Spring Boot Actuator for metrics
- Database performance monitoring
- API response time tracking
- Resource usage monitoring

## Deployment

### Production Build
```bash
# Create production JAR
mvn clean package -P production

# Run with specific profile
java -jar target/ai-chatops-backend-1.0.0.jar --spring.profiles.active=prod
```

### Docker Deployment
```dockerfile
FROM openjdk:17-jre-slim
COPY target/ai-chatops-backend-1.0.0.jar app.jar
EXPOSE 3005
ENTRYPOINT ["java", "-jar", "/app.jar"]
```

### Environment Variables
- `DATABASE_URL` - Database connection URL
- `DATABASE_USER` - Database username
- `DATABASE_PASSWORD` - Database password
- `JWT_SECRET` - JWT signing secret
- `API_KEY` - External API authentication key

## API Documentation

### OpenAPI/Swagger
Access interactive API documentation at:
- Development: `http://localhost:3005/swagger-ui.html`
- API Docs: `http://localhost:3005/api-docs`

### Example API Requests

**Create Persona**:
```json
POST /admin/personas
{
  "personaCode": "tech-support",
  "title": "Technical Support Specialist",
  "description": "AI assistant for technical support and troubleshooting",
  "category": "operation",
  "personaPrompt": "You are a technical support specialist...",
  "isActive": true
}
```

**Send Message**:
```json
POST /message-async
{
  "personaCode": "general-assistant",
  "message": "Hello, I need help with my project",
  "conversationId": "conv-12345",
  "userId": "user-001"
}
```

## Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Check database server status
   - Verify connection string and credentials
   - Ensure database exists and is accessible

2. **Port Already in Use**
   - Change port in application.yml
   - Kill process using port 3005
   - Use different profile with alternate port

3. **MyBatis Mapping Errors**
   - Verify XML mapper files are in classpath
   - Check SQL syntax and parameter names
   - Ensure entity-mapper alignment

4. **CORS Issues**
   - Verify allowed origins in CorsConfig
   - Check request headers and methods
   - Ensure credentials handling is correct

## Contributing

1. Follow Java coding standards and conventions
2. Write comprehensive unit tests
3. Update API documentation for new endpoints
4. Use conventional commit messages
5. Ensure backward compatibility

## License

This project is part of the AI ChatOps system and follows the main project's licensing terms.