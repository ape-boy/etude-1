<!-- Feedback Tab Component -->
<template>
  <div class="feedback-tab">
    <div class="feedback-form">
      <h3>{{ getText('feedbackTitle') }}</h3>
      <p>{{ getText('feedbackDescription') }}</p>
      
      <form @submit.prevent="submitFeedback">
        <div class="form-group">
          <label>{{ getText('feedbackType') }}</label>
          <select v-model="feedbackData.type">
            <option value="suggestion">{{ getText('suggestion') }}</option>
            <option value="bug">{{ getText('bug') }}</option>
            <option value="feature">{{ getText('feature') }}</option>
          </select>
        </div>

        <div class="form-group">
          <label>{{ getText('feedbackMessage') }}</label>
          <textarea v-model="feedbackData.message" :placeholder="getText('feedbackPlaceholder')" rows="4"></textarea>
        </div>

        <div class="form-actions">
          <button type="button" @click="$emit('go-home')" class="btn-system btn-system--ghost">
            {{ getText('cancel') }}
          </button>
          <button type="submit" class="btn-system btn-system--primary" :disabled="!feedbackData.message.trim()">
            {{ getText('sendFeedback') }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import { getText } from '@utils/i18n.js'

export default {
  name: 'FeedbackTab',
  props: {
    currentLanguage: String
  },
  emits: ['feedback-sent', 'go-home'],

  data() {
    return {
      feedbackData: {
        type: 'suggestion',
        message: ''
      }
    }
  },

  methods: {
    getText(key, params = {}) {
      return getText(this.currentLanguage, key, params)
    },

    submitFeedback() {
      if (this.feedbackData.message.trim()) {
        this.$emit('feedback-sent', this.feedbackData)
        this.resetForm()
      }
    },

    resetForm() {
      this.feedbackData = {
        type: 'suggestion',
        message: ''
      }
    },

    showSuccess(message) {
      // Show success message
      console.log('Success:', message)
    },

    showError(message) {
      // Show error message
      console.error('Error:', message)
    }
  }
}
</script>

<style scoped>
.feedback-tab {
  height: 100%;
  padding: var(--space-lg);
  overflow-y: auto;
}

.feedback-form h3 {
  margin-bottom: var(--space-md);
  color: var(--color-text-primary);
}

.form-group {
  margin-bottom: var(--space-lg);
}

.form-group label {
  display: block;
  margin-bottom: var(--space-sm);
  font-weight: 500;
  color: var(--color-text-primary);
}

.form-group select,
.form-group textarea {
  width: 100%;
  padding: var(--space-md);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-md);
  font-family: inherit;
}

.form-actions {
  display: flex;
  gap: var(--space-md);
  justify-content: flex-end;
}
</style>