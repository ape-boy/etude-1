import { createRouter, createWebHistory } from 'vue-router'
import Dashboard from '@/views/Dashboard.vue'
import PersonaManagement from '@/views/PersonaManagement.vue'
import ConversationAnalytics from '@/views/ConversationAnalytics.vue'
import SystemSettings from '@/views/SystemSettings.vue'

const routes = [
  {
    path: '/',
    name: 'Dashboard',
    component: Dashboard,
    meta: {
      title: 'Dashboard - AI ChatOps Admin',
      requiresAuth: false // Change to true when auth is implemented
    }
  },
  {
    path: '/personas',
    name: 'PersonaManagement',
    component: PersonaManagement,
    meta: {
      title: 'Persona Management - AI ChatOps Admin',
      requiresAuth: false
    }
  },
  {
    path: '/analytics',
    name: 'ConversationAnalytics',
    component: ConversationAnalytics,
    meta: {
      title: 'Analytics - AI ChatOps Admin',
      requiresAuth: false
    }
  },
  {
    path: '/settings',
    name: 'SystemSettings',
    component: SystemSettings,
    meta: {
      title: 'Settings - AI ChatOps Admin',
      requiresAuth: false
    }
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Navigation guard for setting page titles
router.beforeEach((to, from, next) => {
  document.title = to.meta?.title || 'AI ChatOps Admin'
  
  // TODO: Add authentication check here when implemented
  // if (to.meta.requiresAuth && !isAuthenticated()) {
  //   next('/login')
  // } else {
  //   next()
  // }
  
  next()
})

export default router