<template>
  <div class="admin-layout">
    <!-- Sidebar -->
    <aside class="sidebar">
      <div class="sidebar-header">
        <div class="logo">
          <LucideIcon name="shield" :width="24" :height="24" />
          <h1>AI ChatOps Admin</h1>
        </div>
      </div>

      <nav class="sidebar-nav">
        <router-link to="/" class="nav-item" active-class="nav-item--active">
          <LucideIcon name="home" :width="20" :height="20" />
          <span>Dashboard</span>
        </router-link>

        <router-link to="/personas" class="nav-item" active-class="nav-item--active">
          <LucideIcon name="users" :width="20" :height="20" />
          <span>Personas</span>
        </router-link>

        <router-link to="/analytics" class="nav-item" active-class="nav-item--active">
          <LucideIcon name="bar-chart-3" :width="20" :height="20" />
          <span>Analytics</span>
        </router-link>

        <router-link to="/settings" class="nav-item" active-class="nav-item--active">
          <LucideIcon name="settings" :width="20" :height="20" />
          <span>Settings</span>
        </router-link>
      </nav>

      <div class="sidebar-footer">
        <div class="version">v{{ version }}</div>
      </div>
    </aside>

    <!-- Main Content -->
    <main class="main-content">
      <header class="main-header">
        <div class="header-title">
          <h2>{{ currentPageTitle }}</h2>
        </div>
        
        <div class="header-actions">
          <button class="header-btn" @click="refreshData" :disabled="loading">
            <LucideIcon name="refresh-cw" :width="16" :height="16" :class="{ 'animate-spin': loading }" />
          </button>
          
          <div class="connection-status" :class="{ 'connected': isConnected, 'disconnected': !isConnected }">
            <div class="status-dot"></div>
            <span>{{ isConnected ? 'Connected' : 'Disconnected' }}</span>
          </div>
        </div>
      </header>

      <div class="content-wrapper">
        <slot />
      </div>
    </main>
  </div>
</template>

<script>
import { computed, ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import LucideIcon from './LucideIcon.vue'
import adminService from '@/services/adminService.js'

export default {
  name: 'AdminLayout',
  components: {
    LucideIcon
  },

  setup() {
    const route = useRoute()
    const loading = ref(false)
    const isConnected = ref(true)
    const version = ref('1.0.0')

    const currentPageTitle = computed(() => {
      const titleMap = {
        'Dashboard': 'Dashboard',
        'PersonaManagement': 'Persona Management',
        'ConversationAnalytics': 'Conversation Analytics',
        'SystemSettings': 'System Settings'
      }
      return titleMap[route.name] || 'Admin'
    })

    const refreshData = async () => {
      loading.value = true
      try {
        // Emit refresh event to current page component
        // This could be improved with a global event bus or state management
        await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API call
      } catch (error) {
        console.error('Failed to refresh data:', error)
      } finally {
        loading.value = false
      }
    }

    const checkConnection = async () => {
      try {
        const response = await adminService.healthCheck()
        isConnected.value = response.success
      } catch (error) {
        isConnected.value = false
      }
    }

    onMounted(() => {
      // Check connection status periodically
      checkConnection()
      setInterval(checkConnection, 30000)
    })

    return {
      currentPageTitle,
      loading,
      isConnected,
      version,
      refreshData
    }
  }
}
</script>

<style scoped>
.admin-layout {
  display: flex;
  height: 100vh;
  width: 100vw;
  background-color: #f8fafc;
}

/* Sidebar */
.sidebar {
  width: 250px;
  background: white;
  border-right: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
}

.sidebar-header {
  padding: 1.5rem;
  border-bottom: 1px solid #e2e8f0;
}

.logo {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.logo h1 {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.sidebar-nav {
  flex: 1;
  padding: 1rem 0;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1.5rem;
  color: #6b7280;
  text-decoration: none;
  transition: all 0.15s ease;
  border-left: 3px solid transparent;
}

.nav-item:hover {
  background-color: #f3f4f6;
  color: #374151;
}

.nav-item--active {
  background-color: #dbeafe;
  color: #2563eb;
  border-left-color: #2563eb;
}

.nav-item span {
  font-weight: 500;
}

.sidebar-footer {
  padding: 1rem 1.5rem;
  border-top: 1px solid #e2e8f0;
}

.version {
  font-size: 0.75rem;
  color: #9ca3af;
}

/* Main Content */
.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.main-header {
  background: white;
  padding: 1rem 2rem;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
}

.header-title h2 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.header-btn {
  background: #f3f4f6;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  padding: 0.5rem;
  cursor: pointer;
  transition: all 0.15s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.header-btn:hover:not(:disabled) {
  background: #e5e7eb;
}

.header-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.connection-status {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.375rem 0.75rem;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
}

.connection-status.connected {
  background: #dcfce7;
  color: #166534;
}

.connection-status.disconnected {
  background: #fee2e2;
  color: #991b1b;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.connected .status-dot {
  background: #22c55e;
  animation: pulse 2s infinite;
}

.disconnected .status-dot {
  background: #ef4444;
}

.content-wrapper {
  flex: 1;
  overflow-y: auto;
  padding: 2rem;
}

.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

/* Responsive */
@media (max-width: 768px) {
  .sidebar {
    width: 200px;
  }
  
  .main-header {
    padding: 1rem;
  }
  
  .content-wrapper {
    padding: 1rem;
  }
}
</style>