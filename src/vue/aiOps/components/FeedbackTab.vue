<template>
  <div class="feedback-tab">
    <div v-if="resultMessage" class="result" :class="resultType">
      <template v-if="resultType === 'success'">
        <LucideIcon name="check-circle" fill="var(--success-color)" :width="24" :height="24" />
        <div class="result-content">
          <h4>{{ getText('feedbackSuccess') }}</h4>
          <p>{{ resultMessage }}</p>
        </div>
      </template>

      <div v-if="resultType === 'success'" class="result-actions-separate">
        <Elements component-type="button" @click="resetForm" variant="primary" icon="star">
          {{ getText('sendAnother') }}
        </Elements>
        <Elements component-type="button" @click="$emit('go-home')" variant="accent" icon="home">
          {{ getText('goHome') }}
        </Elements>
      </div>

      <template v-if="resultType === 'error'">
        <LucideIcon name="alert-triangle" fill="var(--error-color)" :width="20" :height="20" />
        <span>{{ resultMessage }}</span>
      </template>
    </div>

    <div v-if="!resultMessage || resultType === 'error'" class="feedback-form">
      <div class="form-header">
        <LucideIcon name="heart" fill="var(--color-primary)" :width="32" :height="32" />
        <h3>{{ getText('feedbackTitle') }}</h3>
        <p>{{ getText('feedbackDescription') }}</p>
      </div>

      <div class="rating-section">
        <label class="section-label">
          <LucideIcon name="star" fill="var(--color-primary)" :width="16" :height="16" />
          {{ getText('ratingLabel') }}
        </label>

        <Elements component-type="rating" v-model="selectedRating" :disabled="isSubmitting" :show-text="true" size="md"
          @change="clearResult" />
      </div>

      <div class="comment-section">
        <label class="section-label" for="feedback-comment">
          <LucideIcon name="edit" fill="var(--color-primary)" :width="16" :height="16" />
          {{ getText('feedbackComment') }}
          <span class="required">*</span>
        </label>

        <textarea id="feedback-comment" v-model="comment" :placeholder="getText('commentPlaceholder')" maxlength="1000"
          @input="updateCharCount" class="comment-textarea form-input form-textarea" :disabled="isSubmitting"
          required />

        <div class="char-count">
          {{ comment.length }} / 1000
        </div>
      </div>

      <div class="form-actions">
        <Elements component-type="button" @click="submitFeedback" :disabled="!isFormValid" :loading="isSubmitting"
          variant="primary" icon="send" size="lg" block class="submit-btn">
          {{ getText('submitFeedback') }}
        </Elements>

        <Elements component-type="button" @click="$emit('go-home')" variant="outline" icon="home" size="lg" block
          class="home-btn">
          {{ getText('goHome') }}
        </Elements>
      </div>
    </div>
  </div>
</template>

<script>
import { getText, getTextArray } from '../utils/i18n';
import Elements from './Elements.vue';
import LucideIcon from './LucideIcon.vue';

export default {
  name: 'FeedbackTab',
  components: {
    Elements,
    LucideIcon
  },

  props: {
    currentLanguage: {
      type: String,
      default: 'ko',
      validator: value => ['ko', 'en'].includes(value)
    }
  },

  data() {
    return {
      selectedRating: 0,
      comment: '',
      isSubmitting: false,
      resultMessage: '',
      resultType: '',
    };
  },

  computed: {
    isFormValid() {
      return this.comment.trim().length > 0;
    }
  },

  methods: {
    getText(key, params = {}) {
      return getText(this.currentLanguage, key, params);
    },

    updateCharCount() {
      this.clearResult();
    },

    clearResult() {
      if (this.resultMessage && this.resultType === 'error') {
        this.resultMessage = '';
        this.resultType = '';
      }
    },

    submitFeedback() {
      if (!this.isFormValid || this.isSubmitting) return;

      this.isSubmitting = true;
      this.resultMessage = '';
      this.resultType = '';

      const feedbackData = {
        rating: this.selectedRating || null,
        comment: this.comment.trim()
      };

      this.$emit('feedback-sent', feedbackData);
    },

    showSuccess(message) {
      this.isSubmitting = false;
      this.resultMessage = message || this.getText('feedbackSuccess');
      this.resultType = 'success';
    },

    showError(message) {
      this.isSubmitting = false;
      this.resultMessage = message || 'An error occurred while sending feedback.';
      this.resultType = 'error';
    },

    resetForm() {
      this.selectedRating = 0;
      this.comment = '';
      this.isSubmitting = false;
      this.resultMessage = '';
      this.resultType = '';
    }
  }
};
</script>

<style scoped>
.feedback-tab {
  height: 100%;
  background: var(--color-surface-light);
  display: flex;
  flex-direction: column;
  padding: var(--space-lg) var(--space-xl) var(--space-xl);
  box-sizing: border-box;
  overflow: hidden;
}

.form-header {
  text-align: center;
  margin-bottom: var(--space-lg);
  flex-shrink: 0;
}

.form-header h3 {
  font-size: var(--font-size-xl);
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0 0 6px 0;
  letter-spacing: -0.01em;
}

.form-header p {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  line-height: 1.4;
  margin: 0;
}

.feedback-form {
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
}

.rating-section {
  flex-shrink: 0;
  background: var(--color-surface-white);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-lg);
  padding: var(--space-lg);
  box-shadow: var(--shadow-minimal);
  transition: all var(--motion-normal);
}

.rating-section:hover {
  border-color: var(--color-accent);
  box-shadow: var(--shadow-soft);
}

.comment-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: var(--color-surface-white);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-lg);
  padding: var(--space-lg);
  box-shadow: var(--shadow-minimal);
  transition: all var(--motion-normal);
  min-height: 0;
}

.comment-section:hover {
  border-color: var(--color-accent);
  box-shadow: var(--shadow-soft);
}

.section-label {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  font-size: var(--font-size-base);
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: var(--space-md);
  cursor: pointer;
}

.required {
  color: var(--color-error);
  margin-left: 2px;
}

.comment-textarea {
  flex: 1;
  min-height: 120px;
  background: var(--color-surface-light);
  margin-bottom: 0;
  resize: vertical;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
  font-size: 14px;
  line-height: 1.5;
  color: var(--color-text-primary);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-md);
  padding: var(--space-md);
  transition: all var(--motion-fast);
}

.comment-textarea::placeholder {
  color: var(--color-text-tertiary);
  font-style: normal;
  font-weight: 500;
  opacity: 0.7;
  font-size: 14px;
  letter-spacing: 0.025em;
}

.comment-textarea:focus {
  background: var(--color-surface-white);
}

.char-count {
  text-align: right;
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
  margin-top: var(--space-sm);
  font-weight: 500;
}

.form-actions {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
  flex-shrink: 0;
}

.submit-btn,
.home-btn {
  height: 48px !important;
  min-height: 48px !important;
}

.result {
  background: var(--color-surface-white);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-lg);
  padding: var(--space-xl);
  margin-bottom: var(--space-lg);
  display: flex;
  align-items: center;
  gap: var(--space-lg);
  box-shadow: var(--shadow-soft);
  flex-shrink: 0;
}

.result.success {
  border-color: var(--color-success);
  background: var(--alert-success-bg);
  flex-direction: column;
  text-align: center;
}

.result.error {
  border-color: var(--color-error);
  background: var(--alert-error-bg);
  color: var(--color-error);
  flex-direction: row;
  text-align: left;
}

.result-content h4 {
  margin: 0 0 6px 0;
  font-size: var(--font-size-lg);
  font-weight: 600;
  color: var(--color-text-primary);
}

.result-content p {
  margin: 0;
  font-size: var(--font-size-base);
  color: var(--color-text-secondary);
  line-height: 1.5;
}

.result-actions {
  display: flex;
  gap: var(--space-sm);
  margin-top: var(--space-md);
}

.result-actions-separate {
  display: flex;
  gap: var(--space-sm);
  margin-top: var(--space-md);
}

.result-actions-separate .premium-button {
  color: white !important;
  flex: 1;
  justify-content: center;
}

.result-actions-separate .premium-button:hover {
  color: white !important;
}

@media (max-width: 640px) {
  .feedback-tab {
    padding: var(--space-md) var(--space-lg) var(--space-lg);
  }

  .form-header {
    margin-bottom: var(--space-lg);
  }

  .rating-section,
  .comment-section {
    padding: var(--space-md);
  }

  .submit-btn,
  .home-btn {
    height: 44px !important;
    min-height: 44px !important;
    font-size: var(--font-size-sm) !important;
  }

  .result-actions {
    flex-direction: column;
    width: 100%;
  }

  .result-actions .premium-button {
    width: 100%;
    justify-content: center;
  }

  .result-actions-separate {
    flex-direction: column;
    width: 100%;
  }

  .result-actions-separate .premium-button {
    width: 100%;
    justify-content: center;
    color: white !important;
  }
}
</style>