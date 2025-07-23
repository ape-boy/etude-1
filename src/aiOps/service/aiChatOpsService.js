import axios from 'axios';
import utilService from './utilService.js';

const API_BASE_URL = 'http://localhost:3005';

const aiChatOpsService = {

  // ============================================
  // Core API Methods
  // ============================================

  async healthCheck() {
    try {
      const response = await axios.get(`${API_BASE_URL}/health`, {
        timeout: 10000
      });

      return {
        success: response.data.success || true,
        data: response.data.data || response.data,
        message: response.data.message || 'Health check successful'
      };

    } catch (error) {
      return {
        success: false,
        errorMessage: this.getErrorMessage(error),
        error: error
      };
    }
  },

  async getPersonas() {
    try {
      const response = await axios.get(`${API_BASE_URL}/personas`, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 15000
      });

      return {
        success: response.data.success || true,
        data: response.data.data || response.data || [],
        message: response.data.message || 'Personas loaded successfully'
      };

    } catch (error) {
      return {
        success: false,
        errorMessage: this.getErrorMessage(error),
        error: error
      };
    }
  },

  async sendMessage(messageData) {
    try {
      const requestBody = {
        personaCode: messageData.personaCode,
        userQuery: messageData.userQuery
      };

      if (messageData.queryHistory && messageData.queryHistory.length > 0) {
        requestBody.queryHistory = JSON.stringify(messageData.queryHistory);
      }

      const response = await axios.post(`${API_BASE_URL}/message-async`, requestBody, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 60000
      });

      return {
        success: response.data.success || true,
        data: {
          aiResponse: response.data.data || response.data,
          conversationId: response.data.conversationId
        },
        sessionId: messageData.sessionId,
        message: response.data.message || 'Message sent successfully'
      };

    } catch (error) {
      return {
        success: false,
        errorMessage: this.getErrorMessage(error),
        error: error
      };
    }
  },

  async generateQuickQuestions(questionData) {
    try {
      const response = await axios.get(`${API_BASE_URL}/quick-questions`, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 30000
      });

      // 직접 응답 데이터를 정제해서 리턴
      const questionsData = response.data.data || response.data;
      const parsedQuestions = utilService.parseQuickQuestions(questionsData);
      
      return {
        success: response.data.success || true,
        data: parsedQuestions, // 직접 questions 배열 리턴
        message: response.data.message || 'Quick questions generated successfully'
      };

    } catch (error) {
      return {
        success: false,
        errorMessage: this.getErrorMessage(error),
        error: error
      };
    }
  },

  async getConversations(personaCode) {
    try {
      const response = await axios.get(`${API_BASE_URL}/conversations/${personaCode}`, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 15000
      });

      return {
        success: response.data.success || true,
        data: response.data.data || response.data,
        message: response.data.message || 'Conversations loaded successfully'
      };

    } catch (error) {
      return {
        success: false,
        errorMessage: this.getErrorMessage(error),
        error: error
      };
    }
  },


  async deleteConversations(personaCode) {
    try {
      const response = await axios.delete(`${API_BASE_URL}/conversations/${personaCode}`, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 15000
      });

      return {
        success: response.data.success || true,
        data: response.data.data || response.data,
        message: response.data.message || 'Conversations deleted successfully'
      };

    } catch (error) {
      return {
        success: false,
        errorMessage: this.getErrorMessage(error),
        error: error
      };
    }
  },

  async sendFeedback(feedbackData) {
    try {
      const response = await axios.get(`${API_BASE_URL}/feedback`, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 20000
      });

      return {
        success: response.data.success || true,
        data: response.data.data || response.data,
        message: response.data.message || 'Feedback sent successfully'
      };

    } catch (error) {
      return {
        success: false,
        errorMessage: this.getErrorMessage(error),
        error: error
      };
    }
  },

  // ============================================
  // System Admin API Methods
  // ============================================

  async getSystemPrompts() {
    try {
      const response = await axios.get(`${API_BASE_URL}/admin/prompts`, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 15000
      });

      return {
        success: response.data.success || true,
        data: response.data.data || response.data.prompts || response.data || [],
        message: response.data.message || 'System prompts loaded successfully'
      };

    } catch (error) {
      return {
        success: false,
        message: 'Mock system prompts loaded successfully (fallback)'
      };
    }
  },

  async updateSystemPrompt(promptData) {
    try {
      const response = await axios.put(`${API_BASE_URL}/admin/prompts/${promptData.id}`, {
        content: promptData.content,
        name: promptData.name,
        type: promptData.type,
        description: promptData.description
      }, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 15000
      });

      return {
        success: response.data.success || true,
        data: response.data.data || response.data,
        message: response.data.message || 'System prompt updated successfully'
      };

    } catch (error) {
      // Mock success for development
      return {
        success: true,
        data: promptData,
        message: 'Mock system prompt updated successfully (fallback)'
      };
    }
  },

  async testSystemPrompt(testData) {
    try {
      const response = await axios.post(`${API_BASE_URL}/admin/test-prompt`, {
        promptContent: testData.promptContent,
        testInput: testData.testInput,
        promptId: testData.promptId
      }, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 30000
      });

      return {
        success: response.data.success || true,
        data: response.data.data || response.data.response || response.data,
        message: response.data.message || 'Prompt test completed successfully'
      };

    } catch (error) {
      return {
        success: true,
        message: 'Mock prompt test completed successfully (fallback)'
      };
    }
  },

  async createSystemPrompt(promptData) {
    try {
      const response = await axios.post(`${API_BASE_URL}/admin/prompts`, {
        name: promptData.name,
        type: promptData.type || 'system',
        description: promptData.description,
        content: promptData.content
      }, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 15000
      });

      return {
        success: response.data.success || true,
        data: response.data.data || response.data,
        message: response.data.message || 'System prompt created successfully'
      };

    } catch (error) {
      // Mock success for development
      const newPrompt = {
        id: `custom_${Date.now()}`,
        ...promptData,
        type: promptData.type || 'system',
        createdAt: new Date().toISOString()
      };

      return {
        success: true,
        data: newPrompt,
        message: 'Mock system prompt created successfully (fallback)'
      };
    }
  },

  async deleteSystemPrompt(promptId) {
    try {
      const response = await axios.delete(`${API_BASE_URL}/admin/prompts/${promptId}`, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 15000
      });

      return {
        success: response.data.success || true,
        data: response.data.data || response.data,
        message: response.data.message || 'System prompt deleted successfully'
      };

    } catch (error) {
      // Mock success for development
      return {
        success: true,
        data: { id: promptId },
        message: 'Mock system prompt deleted successfully (fallback)'
      };
    }
  },

  async getSystemConfiguration() {
    try {
      const response = await axios.get(`${API_BASE_URL}/admin/config`, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 15000
      });

      return {
        success: response.data.success || true,
        data: response.data.data || response.data,
        message: response.data.message || 'System configuration loaded successfully'
      };

    } catch (error) {
      // Mock configuration for development
      const mockConfig = {
        systemPrompts: {
          enabled: true,
          defaultPromptId: 'default_system',
          maxPromptLength: 4000,
          allowCustomPrompts: true
        },
        testing: {
          enabled: true,
          maxTestsPerHour: 100,
          testTimeout: 30000
        },
        api: {
          baseUrl: API_BASE_URL,
          timeout: 30000,
          retries: 3
        }
      };

      return {
        success: true,
        data: mockConfig,
        message: 'Mock system configuration loaded successfully (fallback)'
      };
    }
  },

  // ============================================
  // Persona Management API Methods
  // ============================================

  async getAllPersonasWithPrompts() {
    try {
      const response = await axios.get(`${API_BASE_URL}/admin/personas-with-prompts`, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 15000
      });

      return {
        success: response.data.success || true,
        data: response.data.data || response.data || [],
        message: response.data.message || 'Personas with prompts loaded successfully'
      };

    } catch (error) {
      // Fallback to regular personas API
      try {
        const personasResponse = await this.getPersonas();
        if (personasResponse.success) {
          return {
            success: true,
            data: personasResponse.data || [],
            message: 'Personas loaded successfully (fallback)'
          };
        }
      } catch (fallbackError) {
        // Return error response
      }

      return {
        success: false,
        errorMessage: this.getErrorMessage(error),
        error: error
      };
    }
  },

  async createPersona(personaData) {
    try {
      const response = await axios.post(`${API_BASE_URL}/admin/personas`, {
        ...personaData,
        createdAt: new Date().toISOString()
      }, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 15000
      });

      return {
        success: response.data.success || true,
        data: response.data.data || response.data || personaData,
        message: response.data.message || 'Persona created successfully'
      };

    } catch (error) {
      // Mock success for development
      const newPersona = {
        ...personaData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      return {
        success: true,
        data: newPersona,
        message: 'Mock persona created successfully (fallback)'
      };
    }
  },

  async updatePersona(personaData) {
    try {
      const response = await axios.put(`${API_BASE_URL}/admin/personas/${personaData.personaCode}`, {
        ...personaData,
        updatedAt: new Date().toISOString()
      }, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 15000
      });

      return {
        success: response.data.success || true,
        data: response.data.data || response.data || personaData,
        message: response.data.message || 'Persona updated successfully'
      };

    } catch (error) {
      // Mock success for development
      const updatedPersona = {
        ...personaData,
        updatedAt: new Date().toISOString()
      };

      return {
        success: true,
        data: updatedPersona,
        message: 'Mock persona updated successfully (fallback)'
      };
    }
  },

  async deletePersona(personaCode) {
    try {
      const response = await axios.delete(`${API_BASE_URL}/admin/personas/${personaCode}`, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 15000
      });

      return {
        success: response.data.success || true,
        data: { personaCode },
        message: response.data.message || 'Persona deleted successfully'
      };

    } catch (error) {
      // Mock success for development
      return {
        success: true,
        data: { personaCode },
        message: 'Mock persona deleted successfully (fallback)'
      };
    }
  },

  async updatePersonaSystemPrompt(promptData) {
    try {
      const response = await axios.put(`${API_BASE_URL}/admin/personas/${promptData.personaCode}/system-prompt`, {
        systemPrompt: promptData.systemPrompt,
        updatedAt: new Date().toISOString()
      }, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 15000
      });

      return {
        success: response.data.success || true,
        data: response.data.data || response.data,
        message: response.data.message || 'System prompt updated successfully'
      };

    } catch (error) {
      // Mock success for development
      return {
        success: true,
        data: promptData,
        message: 'Mock system prompt updated successfully (fallback)'
      };
    }
  },

  // ============================================
  // Conversation Analytics API Methods
  // ============================================

  async getConversations(params = {}) {
    try {
      const queryParams = new URLSearchParams();
      if (params.page !== undefined) queryParams.append('page', params.page);
      if (params.size !== undefined) queryParams.append('size', params.size);
      if (params.personaCode) queryParams.append('personaCode', params.personaCode);
      if (params.userId) queryParams.append('userId', params.userId);
      if (params.startDate) queryParams.append('startDate', params.startDate);
      if (params.endDate) queryParams.append('endDate', params.endDate);

      const response = await axios.get(`${API_BASE_URL}/admin/conversations?${queryParams}`, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 15000
      });

      return {
        success: response.data.success || true,
        data: response.data.data || response.data,
        message: response.data.message || 'Conversations loaded successfully'
      };

    } catch (error) {
      return {
        success: false,
        errorMessage: this.getErrorMessage(error),
        error: error
      };
    }
  },

  async getConversationStats(personaCode = null, period = 'all') {
    try {
      const queryParams = new URLSearchParams();
      if (personaCode) queryParams.append('personaCode', personaCode);
      if (period) queryParams.append('period', period);

      const response = await axios.get(`${API_BASE_URL}/admin/conversation-stats?${queryParams}`, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 15000
      });

      return {
        success: response.data.success || true,
        data: response.data.data || response.data,
        message: response.data.message || 'Statistics loaded successfully'
      };

    } catch (error) {
      return {
        success: false,
        errorMessage: this.getErrorMessage(error),
        error: error
      };
    }
  },

  // ============================================
  // Utility Method Delegation
  // ============================================

  getPersonaIcon(personaCode, iconPath) {
    return utilService.getPersonaIcon(personaCode, iconPath);
  },

  convertConversationsToMessages(conversations) {
    return utilService.convertConversationsToMessages(conversations);
  },

  htmlToMarkdown(htmlContent) {
    return utilService.htmlToMarkdown(htmlContent);
  },

  htmlToPlainText(htmlContent) {
    return utilService.htmlToPlainText(htmlContent);
  },

  async formatContentMarkdown(content) {
    return await utilService.formatContentMarkdown(content);
  },

  convertHtmlToMarkdown(content) {
    return utilService.convertHtmlToMarkdown(content);
  },


  // ============================================
  // Error Handling
  // ============================================

  // Get user-friendly error message from error object
  getErrorMessage(error) {
    if (error?.response?.status) {
      const status = error.response.status;
      const statusMessages = {
        400: 'BAD_REQUEST',
        401: 'UNAUTHORIZED',
        403: 'FORBIDDEN',
        404: 'NOT_FOUND',
        408: 'REQUEST_TIMEOUT',
        429: 'RATE_LIMITED',
        500: 'INTERNAL_SERVER_ERROR',
        502: 'BAD_GATEWAY',
        503: 'SERVICE_UNAVAILABLE',
        504: 'GATEWAY_TIMEOUT'
      };
      
      return statusMessages[status] || `HTTP_${status}`;
    }

    if (error?.request) {
      return error.code || 'NETWORK_ERROR';
    }

    return error?.message || 'UNKNOWN_ERROR';
  }
};

export default aiChatOpsService;