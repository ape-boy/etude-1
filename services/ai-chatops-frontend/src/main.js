import { createApp } from 'vue'
import router from './router'
import App from './App.vue'
import '@/styles/main.css'

const app = createApp(App)

app.use(router)

// Global error handler
app.config.errorHandler = (err, vm, info) => {
  console.error('Vue Error:', err, info)
}

app.mount('#app')