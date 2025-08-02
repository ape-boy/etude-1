import { createRouter, createWebHistory } from 'vue-router'
import AIChatOpsLayout from '@/views/AIChatOpsLayout.vue'

const routes = [
  {
    path: '/',
    name: 'ChatOps',
    component: AIChatOpsLayout,
    meta: {
      title: 'AI ChatOps'
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
  document.title = to.meta?.title || 'AI ChatOps'
  next()
})

export default router