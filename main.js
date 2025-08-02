import { createApp } from 'vue'
import AIChatOpsLayout from './src/vue/aiOps/AIChatOpsLayout.vue'

import './src/vue/aiOps/styles/aiChatOps.css'

window.copyCodeToClipboard = function(button) {
  const codeBlock = button.closest('.md-code-block') || button.closest('.markdown-code-block');
  const pre = codeBlock?.querySelector('pre');
  
  if (pre) {
    const rawCodeElement = pre.querySelector('.raw-code');
    const codeText = rawCodeElement ? rawCodeElement.textContent : pre.textContent.trim();
    
    navigator.clipboard.writeText(codeText).then(() => {
      const originalText = button.textContent;
      button.textContent = 'Copied!';
      button.classList.add('copied');
      
      setTimeout(() => {
        button.textContent = originalText;
        button.classList.remove('copied');
      }, 2000);
    }).catch(() => {
      button.textContent = 'Copy failed';
      setTimeout(() => {
        button.textContent = 'Copy';
      }, 2000);
    });
  }
};

const app = createApp(AIChatOpsLayout)
app.mount('#app')