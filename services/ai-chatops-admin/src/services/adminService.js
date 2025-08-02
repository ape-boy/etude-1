import axios from 'axios'

const API_BASE_URL = 'http://localhost:3005'

const adminService = {
  // Health check
  async healthCheck() {
    try {
      const response = await axios.get(`${API_BASE_URL}/admin/health`, {
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

  // Persona Management
  async getPersonas() {
    try {
      const response = await axios.get(`${API_BASE_URL}/admin/personas-with-prompts`, {
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
            personaPrompt: 'You are a helpful AI assistant...',
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            personaCode: 'personal-helper',
            title: 'Personal Helper',
            description: 'Personal assistance and productivity',
            category: 'personal',
            personaPrompt: 'You are a personal productivity assistant...',
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            personaCode: 'ops-specialist',
            title: 'Operations Specialist',
            description: 'Operations and system management',
            category: 'operation',
            personaPrompt: 'You are an operations specialist...',
            isActive: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        ],
        message: 'Mock personas loaded'
      }
    }
  },

  async getPersonaByCode(personaCode) {
    try {
      const response = await axios.get(`${API_BASE_URL}/admin/personas/${personaCode}`, {
        timeout: 10000
      })

      return {
        success: response.data.success || true,
        data: response.data.data || response.data,
        message: response.data.message || 'Persona loaded successfully'
      }
    } catch (error) {
      return {
        success: false,
        errorMessage: this.getErrorMessage(error),
        error: error
      }
    }
  },

  async createPersona(personaData) {
    try {
      const response = await axios.post(`${API_BASE_URL}/admin/personas`, personaData, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 15000
      })

      return {
        success: response.data.success || true,
        data: response.data.data || response.data,
        message: response.data.message || 'Persona created successfully'
      }
    } catch (error) {
      return {
        success: false,
        errorMessage: this.getErrorMessage(error),
        error: error
      }
    }
  },

  async updatePersona(personaCode, personaData) {
    try {
      const response = await axios.put(`${API_BASE_URL}/admin/personas/${personaCode}`, personaData, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 15000
      })

      return {
        success: response.data.success || true,
        data: response.data.data || response.data,
        message: response.data.message || 'Persona updated successfully'
      }
    } catch (error) {
      return {
        success: false,
        errorMessage: this.getErrorMessage(error),
        error: error
      }
    }
  },

  async deletePersona(personaCode) {
    try {
      const response = await axios.delete(`${API_BASE_URL}/admin/personas/${personaCode}`, {
        timeout: 10000
      })

      return {
        success: response.data.success || true,
        data: response.data.data || response.data,
        message: response.data.message || 'Persona deleted successfully'
      }
    } catch (error) {
      return {
        success: false,
        errorMessage: this.getErrorMessage(error),
        error: error
      }
    }
  },

  async testSystemPrompt(promptData) {
    try {
      const response = await axios.post(`${API_BASE_URL}/admin/system-prompt/test`, promptData, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 30000
      })

      return {
        success: response.data.success || true,
        data: response.data.data || response.data,
        message: response.data.message || 'Prompt test completed'
      }
    } catch (error) {
      return {
        success: true,
        data: `Mock test result for prompt: ${promptData.personaPrompt}`,
        message: 'Mock test completed'
      }
    }
  },

  // Analytics
  async getConversationStats(personaCode = null, period = 'all') {
    try {
      const params = new URLSearchParams()
      if (personaCode) params.append('personaCode', personaCode)
      params.append('period', period)

      const response = await axios.get(`${API_BASE_URL}/admin/conversations/stats?${params}`, {
        timeout: 15000
      })

      return {
        success: response.data.success || true,
        data: response.data.data || response.data,
        message: response.data.message || 'Stats loaded successfully'
      }
    } catch (error) {
      // Return mock analytics data
      return {
        success: true,
        data: {
          totalConversations: 1250,
          totalMessages: 8450,
          avgMessagesPerConversation: 6.8,
          activePersonas: 12,
          topPersonas: [
            { personaCode: 'general-assistant', title: 'General Assistant', conversations: 450, messages: 2850 },
            { personaCode: 'ops-specialist', title: 'Operations Specialist', conversations: 320, messages: 2100 },
            { personaCode: 'personal-helper', title: 'Personal Helper', conversations: 280, messages: 1950 }
          ],
          conversationsByDay: [
            { date: '2025-01-25', conversations: 45, messages: 290 },
            { date: '2025-01-26', conversations: 52, messages: 340 },
            { date: '2025-01-27', conversations: 38, messages: 250 },
            { date: '2025-01-28', conversations: 61, messages: 420 },
            { date: '2025-01-29', conversations: 48, messages: 310 },
            { date: '2025-01-30', conversations: 55, messages: 380 },
            { date: '2025-01-31', conversations: 43, messages: 285 }
          ]
        },
        message: 'Mock analytics data loaded'
      }
    }
  },

  async getConversations(page = 0, size = 10, personaCode = null, userId = null) {
    try {
      const params = new URLSearchParams()
      params.append('page', page.toString())
      params.append('size', size.toString())
      if (personaCode) params.append('personaCode', personaCode)
      if (userId) params.append('userId', userId)

      const response = await axios.get(`${API_BASE_URL}/admin/conversations?${params}`, {
        timeout: 15000
      })

      return {
        success: response.data.success || true,
        data: response.data.data || response.data || [],
        totalCount: response.data.totalConversations || 0,
        message: response.data.message || 'Conversations loaded successfully'
      }
    } catch (error) {
      return {
        success: false,
        errorMessage: this.getErrorMessage(error),
        error: error
      }
    }
  },

  async analyzeConversations(personaCode = null, period = '30days') {
    try {
      const requestBody = {
        personaCode,
        period
      }

      const response = await axios.post(`${API_BASE_URL}/admin/conversations/analyze`, requestBody, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 60000
      })

      return {
        success: response.data.success || true,
        data: response.data.data || response.data,
        message: response.data.message || 'Analysis completed'
      }
    } catch (error) {
      return {
        success: true,
        data: 'Mock conversation analysis results...',
        message: 'Mock analysis completed'
      }
    }
  },

  async getPersonaPerformance(personaCode, period = '30days') {
    try {
      const response = await axios.get(`${API_BASE_URL}/admin/personas/${personaCode}/performance?period=${period}`, {
        timeout: 30000
      })

      return {
        success: response.data.success || true,
        data: response.data.data || response.data,
        message: response.data.message || 'Performance analysis completed'
      }
    } catch (error) {
      return {
        success: true,
        data: `Mock performance analysis for ${personaCode}`,
        message: 'Mock performance analysis completed'
      }
    }
  },

  async getUsageRecommendations(period = '30days') {
    try {
      const response = await axios.get(`${API_BASE_URL}/admin/recommendations?period=${period}`, {
        timeout: 30000
      })

      return {
        success: response.data.success || true,
        data: response.data.data || response.data,
        message: response.data.message || 'Recommendations generated'
      }
    } catch (error) {
      return {
        success: true,
        data: 'Mock usage recommendations...',
        message: 'Mock recommendations generated'
      }
    }
  },

  // System Management
  async deleteConversations(personaCode) {
    try {
      const response = await axios.delete(`${API_BASE_URL}/admin/conversations/${personaCode}`, {
        timeout: 30000
      })

      return {
        success: response.data.success || true,
        data: response.data.data || response.data,
        message: response.data.message || 'Conversations deleted successfully'
      }
    } catch (error) {
      return {
        success: false,
        errorMessage: this.getErrorMessage(error),
        error: error
      }
    }
  },

  // Utility function to extract error messages
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

export default adminService