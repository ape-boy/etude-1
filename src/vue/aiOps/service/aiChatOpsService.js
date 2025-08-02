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
          aiResponse: response.data.data?.aiResponse || response.data.data || response.data,
          conversationId: response.data.data?.conversationId || response.data.conversationId
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
        conversations: response.data.data || response.data,
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