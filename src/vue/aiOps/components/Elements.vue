<template>
  <div>
    <component v-if="componentType === 'button'" :is="'button'" :class="buttonClasses" :disabled="disabled || loading"
      :type="type" @click="handleClick">
      <Elements v-if="loading" component-type="spinner" :size="size" class="ai-chatops-button__spinner" />

      <LucideIcon v-if="icon && !loading" :name="icon" fill="currentColor" :width="iconSize" :height="iconSize"
        :interactive="true" class="ai-chatops-button__icon" />

      <span v-if="$slots.default" class="ai-chatops-button__text">
        <slot />
      </span>
    </component>

    <div v-if="componentType === 'spinner'" :class="spinnerClasses" role="status">
      <span class="sr-only">{{ loadingText }}</span>
    </div>

    <div v-if="componentType === 'rating'" class="star-rating">
      <div class="star-rating__stars">
        <button v-for="star in maxRating" :key="star" :class="getStarClasses(star)" @click="selectRating(star)"
          @mouseenter="hoverRating = star" @mouseleave="hoverRating = 0" @focus="hoverRating = star"
          @blur="hoverRating = 0" :disabled="disabled" type="button">
          <LucideIcon name="star" :fill="getStarFill(star)" :width="starIconSize" :height="starIconSize"
            :interactive="true" />
        </button>
      </div>
    </div>

    <div v-if="componentType === 'message'" :class="['message', `message--${messageType}`]">
      <div :class="messageClasses">
        <template v-if="isCurrentlyLoading">
          <div class="message-bubble__loading">
            <div class="loading-text">{{ dynamicLoadingMessage }}</div>
          </div>
        </template>

        <template v-else>
          <div v-if="effectiveMessageType === 'user'" class="user-message-brand">
            <div v-if="timestamp" class="message-timestamp">
              {{ formatTimestamp(timestamp) }}
            </div>
            <div class="user-badge">
              <LucideIcon name="user" fill="currentColor" :width="14" :height="14" />
              <span>USER</span>
            </div>
          </div>

          <div v-if="effectiveMessageType === 'ai'" class="bot-message-brand">
            <div class="bot-badge">
              <LucideIcon name="robot" fill="currentColor" :width="14" :height="14" />
              <span>Bot</span>
            </div>
            <div v-if="timestamp" class="message-timestamp">
              {{ formatTimestamp(timestamp) }}
            </div>
          </div>

          <div class="message-bubble__content" v-html="formattedContent"></div>

          <div v-if="effectiveMessageType === 'ai' && !isError && !isCurrentlyLoading" class="message-bubble__actions">
            <button v-if="showCopy"
              :class="['message-action', 'message-action--copy', 'btn-system', 'btn-system--ghost', 'btn-system--sm', 'btn-system--icon-only', { 'message-action--copied': effectiveCopyStatus === 'copied' }]"
              @click="handleCopy">
              <LucideIcon :name="effectiveCopyStatus === 'copied' ? 'check' : 'copy'" fill="currentColor" :width="12"
                :height="12" :interactive="true" />
            </button>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script>
import LucideIcon from './LucideIcon.vue';
import { getTextArray } from '../utils/i18n.js';
import { timerMixin } from '../utils/timerUtils.js';
import aiChatOpsService from '../service/aiChatOpsService.js';

export default {
  name: 'Elements',
  mixins: [timerMixin],
  components: {
    LucideIcon
  },

  props: {
    componentType: {
      type: String,
      required: true,
      validator: value => ['button', 'spinner', 'rating', 'message'].includes(value)
    },
    variant: { type: String, default: 'primary' },
    size: { type: String, default: 'md' },
    disabled: { type: Boolean, default: false },
    loading: { type: Boolean, default: false },
    icon: { type: String, default: null },
    type: { type: String, default: 'button' },
    block: { type: Boolean, default: false },
    color: { type: String, default: 'primary' },
    centered: { type: Boolean, default: false },
    loadingText: { type: String, default: '로딩 중입니다...' },

    // Rating props
    value: { type: Number, default: 0 },
    maxRating: { type: Number, default: 5 },
    showText: { type: Boolean, default: false },

    // Message props
    message: { type: Object, default: () => ({}) },
    messageType: { type: String, default: 'user' },
    content: { type: [String, Number], default: '' },
    loadingMessage: { type: String, default: '응답을 생성하고 있습니다' },
    isError: { type: Boolean, default: false },
    showCopy: { type: Boolean, default: true },
    copyStatus: { type: String, default: null },
    timestamp: { type: [Number, String, Date], default: null },
    currentLanguage: { type: String, default: 'ko' }
  },

  data() {
    return {
      hoverRating: 0,
      localCopyStatus: null,
      dotCount: 0,
      dotInterval: null,
      messageInterval: null,
      currentLoadingMessage: '',
      selectedRating: 0,
      formattedContent: ''
    };
  },

  computed: {
    buttonClasses() {
      return [
        'btn-system',
        `btn-system--${this.variant}`,
        `btn-system--${this.size}`,
        {
          'btn-system--block': this.block,
          'btn-system--loading': this.loading,
          'btn-system--icon-only': this.icon && !this.$slots.default
        }
      ];
    },

    spinnerClasses() {
      return [
        'loading-spinner',
        `loading-spinner--${this.size}`,
        `loading-spinner--${this.color}`,
        { 'loading-spinner--centered': this.centered }
      ];
    },

    messageClasses() {
      const msgType = this.message?.type || this.messageType;
      return [
        'message-bubble',
        `message-bubble--${msgType}`,
        {
          'message-bubble--loading': this.isCurrentlyLoading,
          'message-bubble--error': this.message?.isError || this.isError
        }
      ];
    },

    iconSize() {
      return { sm: 12, md: 14, lg: 16 }[this.size] || 14;
    },

    starIconSize() {
      return { sm: 16, md: 18, lg: 20 }[this.size] || 18;
    },

    currentRating() {
      return this.hoverRating || this.selectedRating || this.value;
    },


    effectiveTimestamp() {
      return this.message?.timestamp || this.timestamp;
    },

    effectiveMessageType() {
      return this.message?.type || this.messageType;
    },

    effectiveCopyStatus() {
      return this.localCopyStatus || this.copyStatus;
    },

    dynamicLoadingMessage() {
      const dots = '.'.repeat(this.dotCount === 0 ? 1 : this.dotCount); // 1-5개 점 표시
      const baseMessage = this.currentLoadingMessage || this.getRandomLoadingMessage();
      return baseMessage + dots;
    },

    isCurrentlyLoading() {
      return this.loading || this.message?.isLoading || false;
    }
  },

  methods: {
    async formatContent() {
      const content = this.message?.content || this.content || '';
      const contentStr = String(content);

      try {
        this.formattedContent = await aiChatOpsService.formatContentMarkdown(contentStr);
      } catch (error) {
        this.formattedContent = contentStr;
      }
    },

    handleClick(event) {
      if (!this.disabled && !this.loading) {
        this.$emit('click', event);
      }
    },

    selectRating(rating) {
      if (this.disabled) return;
      this.selectedRating = rating;
      this.$emit('input', rating);
      this.$emit('change', rating);
    },

    getStarClasses(star) {
      return [
        'star-rating__star',
        'btn-system',
        'btn-system--ghost',
        'btn-system--sm',
        'btn-system--icon-only',
        {
          'star-rating__star--active': star <= this.currentRating,
          'star-rating__star--disabled': this.disabled
        }
      ];
    },

    getStarFill(star) {
      const isActive = star <= this.currentRating;
      return isActive ? '#F59E0B' : 'none';
    },

    handleCopy() {
      this.localCopyStatus = 'copied';

      const messageData = this.message || {
        content: this.content,
        id: Date.now(),
        type: this.messageType
      };

      this.$emit('copy-message', messageData);

      this.timerManager.safeSetTimeout(() => {
        this.localCopyStatus = null;
      }, 2000);
    },

    formatTimestamp(timestamp) {
      if (!timestamp) return '';

      const date = new Date(timestamp);
      const now = new Date();
      const diff = now - date;

      if (diff < 6000) {
        return 'Just now';
      }

      if (diff < 3600000) {
        const minutes = Math.floor(diff / 60000);
        return `${minutes}m ago`;
      }

      if (diff < 86400000) {
        const hours = Math.floor(diff / 3600000);
        return `${hours}h ago`;
      }

      return date.toLocaleDateString('ko-KR', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    },

    startDotAnimation() {
      this.dotCount = 0;
      this.currentLoadingMessage = this.getRandomLoadingMessage();

      this.dotInterval = this.timerManager.safeSetInterval(() => {
        this.dotCount = (this.dotCount + 1) % 6;
      }, 300);

      this.messageInterval = this.timerManager.safeSetInterval(() => {
        this.currentLoadingMessage = this.getRandomLoadingMessage();
      }, 1500);
    },

    stopDotAnimation() {
      if (this.dotInterval) {
        this.timerManager.safeClearInterval(this.dotInterval);
        this.dotInterval = null;
      }
      if (this.messageInterval) {
        this.timerManager.safeClearInterval(this.messageInterval);
        this.messageInterval = null;
      }
    },

    getRandomLoadingMessage() {
      const messages = getTextArray(this.currentLanguage, 'loadingMessages');
      if (messages && messages.length > 0) {
        const randomIndex = Math.floor(Math.random() * messages.length);
        return messages[randomIndex];
      }

      return this.currentLanguage === 'ko' ?
        'Generating response' :
        'Generating response';
    }
  },

  watch: {
    'message.content': {
      handler() {
        this.formatContent();
      },
      immediate: true
    },

    content: {
      handler() {
        this.formatContent();
      },
      immediate: true
    },
    isCurrentlyLoading(newVal) {
      if (newVal) {
        this.startDotAnimation();
      } else {
        this.stopDotAnimation();
      }
    },

    value(newVal) {
      this.selectedRating = newVal;
    }
  },

  mounted() {
    if (this.isCurrentlyLoading) {
      this.startDotAnimation();
    }

    this.selectedRating = this.value;
  },

  beforeDestroy() {
    this.stopDotAnimation();
    this.currentLoadingMessage = '';
  }
};
</script>

<style scoped></style>
