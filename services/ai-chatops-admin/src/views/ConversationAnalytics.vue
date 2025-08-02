<template>
  <div class="analytics">
    <div class="page-header">
      <h2>Conversation Analytics</h2>
      <p>Analyze conversation patterns and performance metrics</p>
    </div>

    <div class="analytics-placeholder">
      <LucideIcon name="bar-chart-3" :width="48" :height="48" />
      <h3>Analytics Dashboard</h3>
      <p>Comprehensive conversation analytics and insights will be implemented here.</p>
      
      <div class="features-list">
        <div class="feature-item">
          <LucideIcon name="trending-up" :width="20" :height="20" />
          <span>Usage trends and patterns</span>
        </div>
        <div class="feature-item">
          <LucideIcon name="users" :width="20" :height="20" />
          <span>Persona performance metrics</span>
        </div>
        <div class="feature-item">
          <LucideIcon name="message-square" :width="20" :height="20" />
          <span>Conversation quality analysis</span>
        </div>
        <div class="feature-item">
          <LucideIcon name="clock" :width="20" :height="20" />
          <span>Response time analytics</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import LucideIcon from '@/components/LucideIcon.vue'

export default {
  name: 'ConversationAnalytics',
  components: {
    LucideIcon
  }
}
</script>

<style scoped>
.analytics {
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e2e8f0;
}

.page-header h2 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 0.25rem 0;
}

.page-header p {
  color: #6b7280;
  margin: 0;
}

.analytics-placeholder {
  background: white;
  border-radius: 0.75rem;
  border: 1px solid #e2e8f0;
  padding: 3rem;
  text-align: center;
}

.analytics-placeholder h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  margin: 1rem 0 0.5rem 0;
}

.analytics-placeholder p {
  color: #6b7280;
  margin-bottom: 2rem;
}

.features-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
  max-width: 600px;
  margin: 0 auto;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  background: #f8fafc;
  border-radius: 0.5rem;
  border: 1px solid #e2e8f0;
}

.feature-item span {
  font-weight: 500;
  color: #374151;
}
</style>