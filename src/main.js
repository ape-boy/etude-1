import { createApp } from 'vue'
import AIChatOpsLayout from './src/aiOps/AIChatOpsLayout.vue'

// 전역 CSS 스타일 가져오기
import './src/aiOps/styles/aiChatOps.css'

const app = createApp(AIChatOpsLayout)
app.mount('#app')