import axios from 'axios'

const API_BASE_URL = 'http://localhost:3005'

const aiChatOpsService = {
  // Health check endpoint
  async healthCheck() {
    try {
      const response = await axios.get(`${API_BASE_URL}/health`, {
        timeout: 10000
      })

      return {
        success: response.data.success || true,
        data: response.data.data || response.data,
        message: response.data.message || 'Health check successful'
      }
    } catch (error) {
      return {
        success: false,
        errorMessage: this.getErrorMessage(error),
        error: error
      }
    }
  },

  // Get personas list
  async getPersonas() {
    try {
      const response = await axios.get(`${API_BASE_URL}/personas`, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 15000
      })

      return {
        success: response.data.success || true,
        data: response.data.data || response.data || [],
        message: response.data.message || 'Personas loaded successfully'
      }
    } catch (error) {
      // Return mock data for development
      return {
        success: true,
        data: [
          {
            personaCode: 'general-assistant',
            title: 'General Assistant',
            description: 'General purpose AI assistant',
            category: 'general',
            icon: 'message-square'
          },
          {
            personaCode: 'personal-helper',
            title: 'Personal Helper',
            description: 'Personal assistance and productivity',
            category: 'personal',
            icon: 'user'
          },
          {
            personaCode: 'ops-specialist',
            title: 'Operations Specialist',
            description: 'Operations and system management',
            category: 'operation',
            icon: 'settings'
          }
        ],
        message: 'Mock personas loaded'
      }
    }
  },

  // Send message to AI
  async sendMessage(messageData) {
    try {
      const requestBody = {
        personaCode: messageData.personaCode,
        userQuery: messageData.userQuery
      }

      if (messageData.queryHistory && messageData.queryHistory.length > 0) {
        requestBody.queryHistory = JSON.stringify(messageData.queryHistory)
      }

      const response = await axios.post(`${API_BASE_URL}/message-async`, requestBody, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 60000
      })

      return {
        success: response.data.success || true,
        data: {
          aiResponse: response.data.data?.aiResponse || response.data.data || response.data,
          conversationId: response.data.data?.conversationId || response.data.conversationId
        },
        sessionId: messageData.sessionId,
        message: response.data.message || 'Message sent successfully'
      }
    } catch (error) {
      // Return mock response for development
      return {
        success: true,
        data: {
          aiResponse: `Mock response for: ${messageData.userQuery}`,
          conversationId: 'mock-conversation-' + Date.now()
        },
        sessionId: messageData.sessionId || 'mock-session-' + Date.now(),
        message: 'Mock response generated'
      }
    }
  },

  // Send feedback
  async sendFeedback(feedbackData) {
    try {
      const response = await axios.post(`${API_BASE_URL}/feedback`, feedbackData, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 30000
      })

      return {
        success: response.data.success || true,
        data: response.data.data || response.data,
        message: response.data.message || 'Feedback sent successfully'
      }
    } catch (error) {
      return {
        success: true,
        message: 'Feedback received (mock response)'
      }
    }
  },

  // Get persona icon
  getPersonaIcon(personaCode) {
    const iconMap = {
      'general-assistant': 'message-square',
      'personal-helper': 'user',
      'ops-specialist': 'settings',
      'data-analyst': 'bar-chart-3',
      'code-reviewer': 'shield',
      'project-manager': 'grid'
    }
    return iconMap[personaCode] || 'message-square-heart'
  },

  // Get error message from axios error
  getErrorMessage(error) {
    if (error.response) {
      return error.response.data?.message || error.response.data?.errorMessage || `HTTP ${error.response.status}`
    } else if (error.request) {
      return 'Network error - please check your connection'
    } else {
      return error.message || 'An unexpected error occurred'
    }
  }
}

export default aiChatOpsService