import { createApp } from 'vue'
import AIChatOpsLayout from './aiOps/AIChatOpsLayout.vue'

// 전역 CSS 스타일 가져오기
import './aiOps/styles/aiChatOps.css'

const app = createApp(AIChatOpsLayout)
app.mount('#app')