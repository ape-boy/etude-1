import axios from 'axios';

const API_BASE_URL = 'http://localhost:3005';

const aiChatOpsAdminService = {

  // ============================================
  // Admin Persona Management
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
      return {
        success: false,
        errorMessage: this.getErrorMessage(error),
        error: error
      };
    }
  },

  async createPersona(personaData) {
    try {
      const response = await axios.post(`${API_BASE_URL}/admin/personas`, personaData, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 15000
      });

      return {
        success: response.data.success || true,
        data: response.data.data || response.data,
        message: response.data.message || 'Persona created successfully'
      };

    } catch (error) {
      return {
        success: false,
        errorMessage: this.getErrorMessage(error),
        error: error
      };
    }
  },

  async updatePersona(personaData) {
    try {
      const response = await axios.put(`${API_BASE_URL}/admin/personas/${personaData.personaCode}`, personaData, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 15000
      });

      return {
        success: response.data.success || true,
        data: response.data.data || response.data,
        message: response.data.message || 'Persona updated successfully'
      };

    } catch (error) {
      return {
        success: false,
        errorMessage: this.getErrorMessage(error),
        error: error
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
        data: response.data.data || response.data,
        message: response.data.message || 'Persona deleted successfully'
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
  // System Prompt Management
  // ============================================

  async testSystemPrompt(testData) {
    try {
      const response = await axios.post(`${API_BASE_URL}/admin/system-prompt/test`, testData, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 30000
      });

      return {
        success: response.data.success || true,
        data: response.data.data || response.data.response || response.data,
        message: response.data.message || 'System prompt test completed'
      };

    } catch (error) {
      return {
        success: false,
        errorMessage: this.getErrorMessage(error),
        error: error
      };
    }
  },

  async updateSystemPrompt(personaCode, promptData) {
    try {
      const response = await axios.put(`${API_BASE_URL}/admin/system-prompt/${personaCode}`, promptData, {
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
      return {
        success: false,
        errorMessage: this.getErrorMessage(error),
        error: error
      };
    }
  },

  // ============================================
  // Conversation Analytics
  // ============================================

  async getConversationStats(personaCode = '', period = 'all') {
    try {
      const params = new URLSearchParams();
      if (personaCode) params.append('personaCode', personaCode);
      if (period) params.append('period', period);

      const response = await axios.get(`${API_BASE_URL}/admin/conversations/stats?${params}`, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 15000
      });

      return {
        success: response.data.success || true,
        data: response.data.data || response.data,
        message: response.data.message || 'Conversation statistics loaded successfully'
      };

    } catch (error) {
      return {
        success: false,
        errorMessage: this.getErrorMessage(error),
        error: error
      };
    }
  },

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

  async getConversationSummary(personaCode = '') {
    try {
      const params = new URLSearchParams();
      if (personaCode) params.append('personaCode', personaCode);

      const response = await axios.get(`${API_BASE_URL}/admin/conversations/summary?${params}`, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 15000
      });

      return {
        success: response.data.success || true,
        data: response.data.data || response.data.summary || response.data,
        message: response.data.message || 'Conversation summary loaded successfully'
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
  // Utility Methods
  // ============================================

  async formatContentMarkdown(content) {
    try {
      // Simple markdown detection and formatting
      if (this.isMarkdown(content)) {
        // Use existing markdown conversion if available
        if (window.marked) {
          return window.marked(content);
        }
        // Fallback to simple formatting
        return this.formatContentForDisplay(content);
      }
      return this.escapeHtml(content);
    } catch (error) {
      return this.escapeHtml(content);
    }
  },

  isMarkdown(content) {
    if (!content || typeof content !== 'string') return false;
    
    const markdownPatterns = [
      /^#{1,6}\s+/m,        // Headers
      /\*\*.*?\*\*/,        // Bold
      /\*.*?\*/,            // Italic
      /`.*?`/,              // Inline code
      /```[\s\S]*?```/,     // Code blocks
      /^\s*[-*+]\s+/m,      // Lists
      /^\s*\d+\.\s+/m,      // Numbered lists
      /\[.*?\]\(.*?\)/      // Links
    ];
    
    return markdownPatterns.some(pattern => pattern.test(content));
  },

  formatContentForDisplay(content) {
    if (!content) return '';
    
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code>$1</code>')
      .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
      .replace(/^#{1,6}\s+(.*)$/gm, (match, text) => {
        const level = match.indexOf(' ');
        return `<h${level}>${text}</h${level}>`;
      })
      .replace(/^\s*[-*+]\s+(.*)$/gm, '<li>$1</li>')
      .replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>')
      .replace(/\n/g, '<br>');
  },

  escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  },

  getErrorMessage(error) {
    if (error.response) {
      // Server responded with error status
      const data = error.response.data;
      if (data && data.message) {
        return data.message;
      }
      if (data && data.errorMessage) {
        return data.errorMessage;
      }
      return `서버 오류 (${error.response.status}): ${error.response.statusText}`;
    } else if (error.request) {
      // Request made but no response received
      return '서버에 연결할 수 없습니다. 네트워크 상태를 확인해주세요.';
    } else {
      // Something else happened
      return error.message || '알 수 없는 오류가 발생했습니다.';
    }
  }
};

export default aiChatOpsAdminService;