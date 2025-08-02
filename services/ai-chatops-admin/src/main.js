import { createApp } from 'vue'
import router from './router'
import App from './App.vue'
import '@/styles/main.css'

const app = createApp(App)

app.use(router)

// Global error handler
app.config.errorHandler = (err, vm, info) => {
  console.error('Admin Vue Error:', err, info)
}

// Global properties
app.config.globalProperties.$version = '1.0.0'

app.mount('#app')