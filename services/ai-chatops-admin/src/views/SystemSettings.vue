<template>
  <div class="settings">
    <div class="page-header">
      <h2>System Settings</h2>
      <p>Configure system-wide settings and preferences</p>
    </div>

    <div class="settings-sections">
      <!-- General Settings -->
      <div class="settings-section">
        <div class="section-header">
          <h3>General Settings</h3>
          <p>Basic system configuration</p>
        </div>
        <div class="section-content">
          <div class="setting-item">
            <div class="setting-info">
              <label>System Name</label>
              <p>Display name for the AI ChatOps system</p>
            </div>
            <input type="text" v-model="settings.systemName" class="setting-input">
          </div>
          
          <div class="setting-item">
            <div class="setting-info">
              <label>Default Language</label>
              <p>Default language for new conversations</p>
            </div>
            <select v-model="settings.defaultLanguage" class="setting-input">
              <option value="ko">Korean (한국어)</option>
              <option value="en">English</option>
            </select>
          </div>

          <div class="setting-item">
            <div class="setting-info">
              <label>Enable Analytics</label>
              <p>Collect usage analytics for system improvement</p>
            </div>
            <label class="toggle-switch">
              <input type="checkbox" v-model="settings.enableAnalytics">
              <span class="toggle-slider"></span>
            </label>
          </div>
        </div>
      </div>

      <!-- Performance Settings -->
      <div class="settings-section">
        <div class="section-header">
          <h3>Performance Settings</h3>
          <p>Configure performance and resource limits</p>
        </div>
        <div class="section-content">
          <div class="setting-item">
            <div class="setting-info">
              <label>Max Concurrent Conversations</label>
              <p>Maximum number of simultaneous conversations</p>
            </div>
            <input type="number" v-model="settings.maxConcurrentConversations" min="1" max="1000" class="setting-input">
          </div>
          
          <div class="setting-item">
            <div class="setting-info">
              <label>Conversation Timeout (minutes)</label>
              <p>Automatic timeout for inactive conversations</p>
            </div>
            <input type="number" v-model="settings.conversationTimeout" min="5" max="120" class="setting-input">
          </div>

          <div class="setting-item">
            <div class="setting-info">
              <label>Message History Limit</label>
              <p>Maximum number of messages to keep in memory</p>
            </div>
            <input type="number" v-model="settings.messageHistoryLimit" min="10" max="100" class="setting-input">
          </div>
        </div>
      </div>

      <!-- Security Settings -->
      <div class="settings-section">
        <div class="section-header">
          <h3>Security Settings</h3>
          <p>Configure security and access controls</p>
        </div>
        <div class="section-content">
          <div class="setting-item">
            <div class="setting-info">
              <label>Enable Rate Limiting</label>
              <p>Limit the number of requests per user</p>
            </div>
            <label class="toggle-switch">
              <input type="checkbox" v-model="settings.enableRateLimit">
              <span class="toggle-slider"></span>
            </label>
          </div>

          <div class="setting-item">
            <div class="setting-info">
              <label>Request Rate Limit (per minute)</label>
              <p>Maximum requests per minute per user</p>
            </div>
            <input type="number" v-model="settings.rateLimit" min="1" max="1000" class="setting-input" :disabled="!settings.enableRateLimit">
          </div>

          <div class="setting-item">
            <div class="setting-info">
              <label>Enable Audit Logging</label>
              <p>Log all administrative actions</p>
            </div>
            <label class="toggle-switch">
              <input type="checkbox" v-model="settings.enableAuditLog">
              <span class="toggle-slider"></span>
            </label>
          </div>
        </div>
      </div>

      <!-- Notification Settings -->
      <div class="settings-section">
        <div class="section-header">
          <h3>Notification Settings</h3>
          <p>Configure system notifications and alerts</p>
        </div>
        <div class="section-content">
          <div class="setting-item">
            <div class="setting-info">
              <label>Enable Email Notifications</label>
              <p>Send email alerts for system events</p>
            </div>
            <label class="toggle-switch">
              <input type="checkbox" v-model="settings.enableEmailNotifications">
              <span class="toggle-slider"></span>
            </label>
          </div>

          <div class="setting-item">
            <div class="setting-info">
              <label>Admin Email</label>
              <p>Email address for system notifications</p>
            </div>
            <input type="email" v-model="settings.adminEmail" class="setting-input" :disabled="!settings.enableEmailNotifications">
          </div>

          <div class="setting-item">
            <div class="setting-info">
              <label>Alert Threshold (errors/hour)</label>
              <p>Trigger alert when error rate exceeds this threshold</p>
            </div>
            <input type="number" v-model="settings.alertThreshold" min="1" max="1000" class="setting-input">
          </div>
        </div>
      </div>
    </div>

    <!-- Save Actions -->
    <div class="settings-actions">
      <button @click="resetSettings" class="btn btn-ghost">
        Reset to Defaults
      </button>
      <button @click="saveSettings" class="btn btn-primary" :disabled="saving">
        {{ saving ? 'Saving...' : 'Save Settings' }}
      </button>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'

export default {
  name: 'SystemSettings',

  setup() {
    const saving = ref(false)
    
    const settings = ref({
      systemName: 'AI ChatOps',
      defaultLanguage: 'ko',
      enableAnalytics: true,
      maxConcurrentConversations: 100,
      conversationTimeout: 30,
      messageHistoryLimit: 50,
      enableRateLimit: true,
      rateLimit: 60,
      enableAuditLog: true,
      enableEmailNotifications: false,
      adminEmail: '',
      alertThreshold: 10
    })

    const defaultSettings = { ...settings.value }

    const loadSettings = async () => {
      // Load settings from API or localStorage
      try {
        const savedSettings = localStorage.getItem('ai-chatops-admin-settings')
        if (savedSettings) {
          settings.value = { ...settings.value, ...JSON.parse(savedSettings) }
        }
      } catch (error) {
        console.error('Failed to load settings:', error)
      }
    }

    const saveSettings = async () => {
      saving.value = true
      try {
        // Save to API and localStorage
        localStorage.setItem('ai-chatops-admin-settings', JSON.stringify(settings.value))
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        alert('Settings saved successfully!')
      } catch (error) {
        console.error('Failed to save settings:', error)
        alert('Failed to save settings. Please try again.')
      } finally {
        saving.value = false
      }
    }

    const resetSettings = () => {
      if (confirm('Are you sure you want to reset all settings to defaults?')) {
        settings.value = { ...defaultSettings }
      }
    }

    onMounted(() => {
      loadSettings()
    })

    return {
      settings,
      saving,
      saveSettings,
      resetSettings
    }
  }
}
</script>

<style scoped>
.settings {
  max-width: 800px;
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

.settings-sections {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  margin-bottom: 2rem;
}

.settings-section {
  background: white;
  border-radius: 0.75rem;
  border: 1px solid #e2e8f0;
  overflow: hidden;
}

.section-header {
  padding: 1.5rem;
  border-bottom: 1px solid #e2e8f0;
  background: #f8fafc;
}

.section-header h3 {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 0.25rem 0;
}

.section-header p {
  color: #6b7280;
  margin: 0;
  font-size: 0.875rem;
}

.section-content {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.setting-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.setting-info {
  flex: 1;
}

.setting-info label {
  display: block;
  font-weight: 500;
  color: #1f2937;
  margin-bottom: 0.25rem;
}

.setting-info p {
  color: #6b7280;
  font-size: 0.875rem;
  margin: 0;
}

.setting-input {
  width: 200px;
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.875rem;
}

.setting-input:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.setting-input:disabled {
  background: #f3f4f6;
  color: #9ca3af;
  cursor: not-allowed;
}

.toggle-switch {
  position: relative;
  display: inline-block;
  width: 44px;
  height: 24px;
}

.toggle-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #d1d5db;
  transition: 0.15s;
  border-radius: 24px;
}

.toggle-slider:before {
  position: absolute;
  content: "";
  height: 18px;
  width: 18px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: 0.15s;
  border-radius: 50%;
}

input:checked + .toggle-slider {
  background-color: #2563eb;
}

input:checked + .toggle-slider:before {
  transform: translateX(20px);
}

.settings-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding: 1.5rem;
  border-top: 1px solid #e2e8f0;
  background: white;
  border-radius: 0.75rem;
  border: 1px solid #e2e8f0;
}

.btn {
  padding: 0.5rem 1rem;
  border: 1px solid transparent;
  border-radius: 0.375rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;
}

.btn-primary {
  background: #2563eb;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #1d4ed8;
}

.btn-ghost {
  background: transparent;
  color: #6b7280;
  border-color: #e2e8f0;
}

.btn-ghost:hover {
  background: #f3f4f6;
  color: #374151;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Responsive */
@media (max-width: 768px) {
  .setting-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }
  
  .setting-input {
    width: 100%;
  }
  
  .settings-actions {
    flex-direction: column;
  }
}
</style>