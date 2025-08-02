<!-- Reusable Elements Component -->
<template>
  <div :class="elementClass">
    <!-- Spinner -->
    <div v-if="componentType === 'spinner'" class="spinner" :class="[sizeClass, colorClass]">
      <div class="spinner-circle"></div>
    </div>

    <!-- Message -->
    <div v-else-if="componentType === 'message'" class="message" :class="messageClasses">
      <div class="message-content">
        <div class="message-header" v-if="message.type === 'ai'">
          <div class="message-avatar">
            <LucideIcon :name="getPersonaIcon()" fill="white" :width="16" :height="16" />
          </div>
          <span class="message-sender">{{ getPersonaName() }}</span>
          <span class="message-time">{{ formatTime(timestamp) }}</span>
        </div>
        
        <div class="message-body" v-html="formatMessage(message.content)"></div>
        
        <div class="message-actions" v-if="message.type === 'ai'">
          <button @click="$emit('copy-message', message)" class="message-action-btn" :title="title">
            <LucideIcon name="copy" :width="14" :height="14" />
          </button>
          <button @click="$emit('regenerate-message', message)" class="message-action-btn" title="재생성">
            <LucideIcon name="refresh-cw" :width="14" :height="14" />
          </button>
        </div>
      </div>
    </div>

    <!-- Default slot for other content -->
    <slot v-else></slot>
  </div>
</template>

<script>
import LucideIcon from './LucideIcon.vue'

export default {
  name: 'Elements',
  components: {
    LucideIcon
  },
  
  props: {
    componentType: {
      type: String,
      default: 'div'
    },
    size: {
      type: String,
      default: 'md',
      validator: value => ['xs', 'sm', 'md', 'lg', 'xl'].includes(value)
    },
    color: {
      type: String,
      default: 'primary'
    },
    centered: {
      type: Boolean,
      default: false
    },
    message: {
      type: Object,
      default: () => ({})
    },
    persona: {
      type: Object,
      default: () => ({})
    },
    currentLanguage: {
      type: String,
      default: 'ko'
    },
    timestamp: {
      type: [String, Number, Date],
      default: null
    },
    title: {
      type: String,
      default: ''
    }
  },

  emits: ['copy-message', 'regenerate-message', 'feedback-message'],

  computed: {
    elementClass() {
      return {
        'elements-component': true,
        'elements-centered': this.centered
      }
    },

    sizeClass() {
      return `spinner--${this.size}`
    },

    colorClass() {
      return `spinner--${this.color}`
    },

    messageClasses() {
      return {
        [`message--${this.message.type}`]: this.message.type,
        'message--error': this.message.error
      }
    }
  },

  methods: {
    getPersonaIcon() {
      return this.persona?.icon || 'message-square'
    },

    getPersonaName() {
      return this.persona?.title || this.persona?.personaCode || 'AI'
    },

    formatTime(timestamp) {
      if (!timestamp) return ''
      const date = new Date(timestamp)
      return date.toLocaleTimeString(this.currentLanguage === 'ko' ? 'ko-KR' : 'en-US', {
        hour: '2-digit',
        minute: '2-digit'
      })
    },

    formatMessage(content) {
      if (!content) return ''
      // Basic markdown to HTML conversion
      return content
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/\n/g, '<br>')
    }
  }
}
</script>

<style scoped>
.elements-component {
  display: contents;
}

.elements-centered {
  display: flex;
  justify-content: center;
  align-items: center;
}

/* Spinner Styles */
.spinner {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.spinner-circle {
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.spinner--xs .spinner-circle { width: 12px; height: 12px; }
.spinner--sm .spinner-circle { width: 16px; height: 16px; }
.spinner--md .spinner-circle { width: 20px; height: 20px; }
.spinner--lg .spinner-circle { width: 24px; height: 24px; }
.spinner--xl .spinner-circle { width: 32px; height: 32px; }

.spinner--primary { color: var(--color-primary); }
.spinner--accent { color: var(--color-accent); }
.spinner--success { color: var(--color-success); }
.spinner--warning { color: var(--color-warning); }
.spinner--error { color: var(--color-error); }

/* Message Styles */
.message {
  margin-bottom: var(--space-md);
  max-width: 100%;
}

.message-content {
  background: var(--color-surface-light);
  padding: var(--space-md);
  border-radius: var(--radius-lg);
  position: relative;
}

.message--user .message-content {
  background: var(--color-primary);
  color: white;
  margin-left: var(--space-xl);
}

.message--ai .message-content {
  background: var(--color-surface-light);
  margin-right: var(--space-xl);
}

.message--error .message-content {
  background: var(--color-error-light);
  border-left: 4px solid var(--color-error);
}

.message-header {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  margin-bottom: var(--space-sm);
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
}

.message-avatar {
  width: 20px;
  height: 20px;
  background: var(--color-primary);
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
}

.message-sender {
  font-weight: 500;
}

.message-time {
  margin-left: auto;
  font-size: var(--font-size-xs);
}

.message-body {
  line-height: 1.5;
}

.message-actions {
  display: flex;
  gap: var(--space-sm);
  margin-top: var(--space-sm);
  opacity: 0;
  transition: opacity var(--motion-fast);
}

.message:hover .message-actions {
  opacity: 1;
}

.message-action-btn {
  background: none;
  border: none;
  padding: var(--space-xs);
  border-radius: var(--radius-sm);
  color: var(--color-text-muted);
  cursor: pointer;
  transition: all var(--motion-fast);
}

.message-action-btn:hover {
  background: var(--color-surface-hover);
  color: var(--color-text-primary);
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>