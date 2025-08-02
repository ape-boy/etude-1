<template>
  <div class="dashboard">
    <!-- Summary Cards -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon">
          <LucideIcon name="message-square" :width="24" :height="24" />
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ stats.totalConversations || 0 }}</div>
          <div class="stat-label">Total Conversations</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon">
          <LucideIcon name="users" :width="24" :height="24" />
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ stats.activePersonas || 0 }}</div>
          <div class="stat-label">Active Personas</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon">
          <LucideIcon name="trending-up" :width="24" :height="24" />
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ Math.round(stats.avgMessagesPerConversation || 0) }}</div>
          <div class="stat-label">Avg Messages/Conv</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon">
          <LucideIcon name="clock" :width="24" :height="24" />
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ stats.totalMessages || 0 }}</div>
          <div class="stat-label">Total Messages</div>
        </div>
      </div>
    </div>

    <!-- Charts and Analytics -->
    <div class="charts-grid">
      <!-- Daily Activity Chart -->
      <div class="chart-card">
        <div class="chart-header">
          <h3>Daily Activity (Last 7 Days)</h3>
          <select v-model="selectedPeriod" @change="loadStats" class="period-selector">
            <option value="7days">Last 7 Days</option>
            <option value="30days">Last 30 Days</option>
            <option value="90days">Last 90 Days</option>
          </select>
        </div>
        <div class="chart-content">
          <div class="chart-placeholder">
            <div v-for="(day, index) in dailyData" :key="index" class="chart-bar">
              <div 
                class="bar" 
                :style="{ height: `${(day.conversations / maxDailyConversations) * 100}%` }"
                :title="`${day.date}: ${day.conversations} conversations`"
              ></div>
              <div class="bar-label">{{ formatDate(day.date) }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Top Personas -->
      <div class="chart-card">
        <div class="chart-header">
          <h3>Top Personas</h3>
        </div>
        <div class="chart-content">
          <div class="persona-list">
            <div v-for="persona in topPersonas" :key="persona.personaCode" class="persona-item">
              <div class="persona-info">
                <div class="persona-name">{{ persona.title }}</div>
                <div class="persona-stats">
                  {{ persona.conversations }} conversations • {{ persona.messages }} messages
                </div>
              </div>
              <div class="persona-bar">
                <div 
                  class="bar-fill" 
                  :style="{ width: `${(persona.conversations / maxPersonaConversations) * 100}%` }"
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="actions-section">
      <h3>Quick Actions</h3>
      <div class="actions-grid">
        <router-link to="/personas" class="action-card">
          <LucideIcon name="users" :width="20" :height="20" />
          <span>Manage Personas</span>
        </router-link>

        <router-link to="/analytics" class="action-card">
          <LucideIcon name="bar-chart-3" :width="20" :height="20" />
          <span>View Analytics</span>
        </router-link>

        <router-link to="/settings" class="action-card">
          <LucideIcon name="settings" :width="20" :height="20" />
          <span>System Settings</span>
        </router-link>

        <button @click="exportData" class="action-card" :disabled="loading">
          <LucideIcon name="download" :width="20" :height="20" />
          <span>Export Data</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue'
import LucideIcon from '@/components/LucideIcon.vue'
import adminService from '@/services/adminService.js'

export default {
  name: 'Dashboard',
  components: {
    LucideIcon
  },

  setup() {
    const loading = ref(false)
    const stats = ref({})
    const selectedPeriod = ref('7days')

    const dailyData = computed(() => {
      return stats.value.conversationsByDay || []
    })

    const topPersonas = computed(() => {
      return stats.value.topPersonas || []
    })

    const maxDailyConversations = computed(() => {
      const data = dailyData.value
      return data.length > 0 ? Math.max(...data.map(d => d.conversations)) : 1
    })

    const maxPersonaConversations = computed(() => {
      const data = topPersonas.value
      return data.length > 0 ? Math.max(...data.map(p => p.conversations)) : 1
    })

    const loadStats = async () => {
      loading.value = true
      try {
        const response = await adminService.getConversationStats(null, selectedPeriod.value)
        if (response.success) {
          stats.value = response.data
        } else {
          console.error('Failed to load stats:', response.errorMessage)
        }
      } catch (error) {
        console.error('Error loading stats:', error)
      } finally {
        loading.value = false
      }
    }

    const formatDate = (dateString) => {
      const date = new Date(dateString)
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }

    const exportData = () => {
      // Simulate data export
      const data = JSON.stringify(stats.value, null, 2)
      const blob = new Blob([data], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `chatops-stats-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }

    onMounted(() => {
      loadStats()
    })

    return {
      loading,
      stats,
      selectedPeriod,
      dailyData,
      topPersonas,
      maxDailyConversations,
      maxPersonaConversations,
      loadStats,
      formatDate,
      exportData
    }
  }
}
</script>

<style scoped>
.dashboard {
  max-width: 1200px;
  margin: 0 auto;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: white;
  border-radius: 0.75rem;
  padding: 1.5rem;
  border: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: all 0.15s ease;
}

.stat-card:hover {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.stat-icon {
  background: #dbeafe;
  color: #2563eb;
  padding: 0.75rem;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  color: #1f2937;
  line-height: 1;
}

.stat-label {
  font-size: 0.875rem;
  color: #6b7280;
  margin-top: 0.25rem;
}

.charts-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.chart-card {
  background: white;
  border-radius: 0.75rem;
  border: 1px solid #e2e8f0;
  overflow: hidden;
}

.chart-header {
  padding: 1.5rem 1.5rem 1rem;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.chart-header h3 {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.period-selector {
  padding: 0.375rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.875rem;
}

.chart-content {
  padding: 1.5rem;
}

.chart-placeholder {
  display: flex;
  align-items: end;
  gap: 0.5rem;
  height: 200px;
}

.chart-bar {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.bar {
  background: linear-gradient(to top, #2563eb, #3b82f6);
  border-radius: 0.25rem 0.25rem 0 0;
  width: 100%;
  min-height: 4px;
  transition: all 0.15s ease;
  cursor: pointer;
}

.bar:hover {
  background: linear-gradient(to top, #1d4ed8, #2563eb);
}

.bar-label {
  font-size: 0.75rem;
  color: #6b7280;
  text-align: center;
}

.persona-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.persona-item {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.persona-info {
  flex: 1;
}

.persona-name {
  font-weight: 500;
  color: #1f2937;
}

.persona-stats {
  font-size: 0.875rem;
  color: #6b7280;
}

.persona-bar {
  width: 100px;
  height: 8px;
  background: #f3f4f6;
  border-radius: 4px;
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  background: linear-gradient(to right, #2563eb, #3b82f6);
  transition: width 0.3s ease;
}

.actions-section {
  margin-top: 2rem;
}

.actions-section h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 1rem;
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.action-card {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 0.75rem;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  text-decoration: none;
  color: #374151;
  font-weight: 500;
  transition: all 0.15s ease;
  cursor: pointer;
}

.action-card:hover:not(:disabled) {
  background: #f8fafc;
  border-color: #2563eb;
  color: #2563eb;
  transform: translateY(-1px);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.action-card:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Responsive */
@media (max-width: 768px) {
  .charts-grid {
    grid-template-columns: 1fr;
  }
  
  .stats-grid {
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  }
}
</style>