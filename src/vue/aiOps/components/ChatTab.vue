<template>
  <div class="chat-tab">
    <div v-if="!selectedPersona" class="no-persona-selected">
      <div class="persona-selection-guide">
        <div class="guide-icon text-muted">
          <LucideIcon name="home-heart" fill="none" stroke="currentColor" :width="24" :height="24" />
        </div>
        <h3 class="guide-title text-primary">{{ getText('noPersonaSelected') }}</h3>
        <p class="guide-description text-secondary">{{ getText('noPersonaDesc') }}</p>
      </div>
    </div>

    <div v-else class="chat-interface">
      <div class="chat-header">
        <div class="persona-info">
          <div class="persona-badge" @mouseenter="showDevInfo = true" @mouseleave="showDevInfo = false">
            <LucideIcon :name="getPersonaIconName(selectedPersona)" fill="white" :width="16" :height="16" />
            <span>{{ getPersonaDisplayName(selectedPersona) }}</span>
          </div>

          <div v-if="showDevInfo" class="dev-info-tooltip-avatar" @mouseenter="showDevInfo = true"
            @mouseleave="showDevInfo = false">
            <div class="dev-info-header">🔧 Dev Info</div>
            <div class="dev-info-content">
              <div class="dev-info-item">
                <span class="dev-label">Messages:</span>
                <span class="dev-value">{{ messages.length }}/{{ maxSessionMessages }}</span>
              </div>
              <div class="dev-info-item">
                <span class="dev-label">Memory:</span>
                <span class="dev-value">{{ memoryUsage.used }}MB/{{ memoryUsage.total }}MB</span>
              </div>
              <div class="dev-info-item">
                <span class="dev-label">Pending:</span>
                <span class="dev-value" :class="{ 'dev-value--active': pendingMessages.length > 0 }">{{
                  pendingMessages.length }}</span>
              </div>
              <div class="dev-info-item">
                <span class="dev-label">Rendering:</span>
                <span class="dev-value" :class="{ 'dev-value--active': renderingScheduled }">{{ renderingScheduled ?
                  'Yes'
                  : 'No' }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="header-actions">
          <button @click="$emit('go-persona-list')"
            class="btn-system btn-system--ghost btn-system--sm btn-system--icon-only" title="Change persona">
            <LucideIcon name="refresh-cw" :width="14" :height="14" :interactive="true" />
          </button>

          <button @click="$emit('go-home')" class="btn-system btn-system--ghost btn-system--sm btn-system--icon-only"
            title="Go home">
            <LucideIcon name="home" :width="14" :height="14" :interactive="true" />
          </button>

          <button @click="clearChatHistory" class="btn-system btn-system--ghost btn-system--sm btn-system--icon-only"
            title="Delete messages">
            <LucideIcon name="trash" :width="14" :height="14" :interactive="true" />
          </button>
        </div>
      </div>

      <div ref="messagesContainer" class="messages-container" :class="messagesClasses">
        <div v-if="loadingHistory" class="loading-history">
          <Elements component-type="spinner" size="sm" color="accent" />
          <span class="loading-text">{{ getText('loadingHistory') }}</span>
        </div>

        <div v-else-if="messages.length === 0" class="welcome-section">
          <div class="welcome-content">
            <div class="welcome-header">
              <h2 class="welcome-title text-primary">
                {{ selectedPersona ? getPersonaDisplayName(selectedPersona) : '' }}
              </h2>
            </div>
            <div class="welcome-message text-secondary" v-if="formattedWelcomeMessage" v-html="formattedWelcomeMessage"></div>
            <p class="welcome-description" v-else>{{ getText('welcomeTip') || '' }}</p>
          </div>
        </div>

        <div class="messages-list">
          <Elements v-for="message in messages" :key="message.id" component-type="message" :message="message"
            :title="'복사'" :persona="selectedPersona" :current-language="currentLanguage" :timestamp="message.timestamp"
            @copy-message="handleCopyMessage" @regenerate-message="handleRegenerateMessage"
            @feedback-message="handleFeedbackMessage" />
        </div>
      </div>

      <div class="input-area" ref="inputArea">
        <div v-if="showQuickQuestions && quickQuestions.length > 0" class="quick-questions-dropdown"
          ref="quickQuestionsDropdown">
          <div class="quick-questions-list">
            <div v-for="(question, index) in quickQuestions" :key="index" @click="sendQuickQuestion(question)"
              class="quick-question-item">
              {{ question }}
            </div>
          </div>
        </div>

        <div class="input-container">
          <div class="input-box">
            <textarea v-model="currentMessage" ref="messageInput" :placeholder="getText('inputPlaceholder')"
              @keydown="handleKeyDown" @input="handleInput" @focus="handleFocus" :disabled="isProcessing"
              class="message-textarea input-base input-enhanced form-input enhanced-input" />

            <div class="input-bottom-row">
              <div class="left-actions">
                <button @click="generateQuickQuestions" :disabled="isProcessing || isQuickQuestionsLoading"
                  class="btn-system btn-system--ghost btn-system--sm quick-questions-generate-btn"
                  :title="getText('generateQuestions') || 'Generate questions'">
                  <div v-if="isQuickQuestionsLoading" class="loading-spinner"></div>
                  <LucideIcon v-else name="lightbulb" :width="12" :height="12" :interactive="true" />
                </button>

                <button @click="toggleContinuousChat" :disabled="isProcessing" :class="[
                  'btn-system',
                  'btn-system--sm',
                  'continuous-chat-btn',
                  continuousChatEnabled ? 'btn-system--success' : 'btn-system--ghost'
                ]" :title="continuousChatEnabled ? 'Switch to single chat' : 'Switch to continuous chat'">
                  <LucideIcon :name="continuousChatEnabled ? 'layers' : 'message-square'" :width="12" :height="12"
                    :interactive="true" />
                </button>
              </div>

              <button @click="sendMessage" :disabled="!canSendMessage" :class="[
                'btn-system',
                'btn-system--send',
                'btn-system--sm',
                'btn-system--icon-only',
                'send-button-enhanced',
                { 'loading': isProcessing }
              ]" title="Send message">
                <Elements v-if="isProcessing" component-type="spinner" size="sm" color="accent" />
                <LucideIcon v-else name="send-horizontal" fill="currentColor" :width="14" :height="14"
                  :interactive="true" />
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script>
import LucideIcon from './LucideIcon.vue';
import Elements from './Elements.vue';
import { getText, getTextArray } from '../utils/i18n.js';
import { timerMixin } from '../utils/timerUtils.js';
import aiChatOpsService from '../service/aiChatOpsService.js';

export default {
  name: 'ChatTab',
  mixins: [timerMixin],
  components: {
    LucideIcon,
    Elements
  },

  props: {
    selectedPersona: {
      type: Object,
      default: null
    },
    isProcessing: {
      type: Boolean,
      default: false
    },
    currentLanguage: {
      type: String,
      default: 'ko'
    },
    windowSize: {
      type: Object,
      default: () => ({ width: 455, height: 676 })
    },
    selectedCategory: {
      type: String,
      default: null
    }
  },

  data() {
    return {
      currentMessage: '',
      messages: [],
      loadingHistory: false,
      loadingMessageId: null,
      showQuickQuestions: false,
      quickQuestions: [],
      continuousChatEnabled: true,
      isQuickQuestionsLoading: false,
      isInitialLoad: false,
      maxSessionMessages: 30,
      memoryUsage: { used: 0, total: 0 },
      memoryMonitorInterval: null,
      isDevelopment: true,
      showDevInfo: false,
      debugMode: true,
      renderingStates: [],
      lastApiCall: null,

      pendingMessages: [],
      renderingScheduled: false,
      batchUpdateTimeout: null,
      lastMessageTime: 0,
      resizeObserver: null,

      formattedWelcomeMessage: '',

      enhancedInputManager: {
        minHeight: 38,
        maxHeight: 400,
        scrollThreshold: 300,
        currentState: {
          isExpanded: false,
          hasScrolled: false,
          lineCount: 1
        }
      }
    };
  },

  computed: {
    canSendMessage() {
      return this.currentMessage.length > 0 && !this.isProcessing && this.selectedPersona;
    },

    recentConversations() {
      if (!this.continuousChatEnabled || !this.messages?.length) return [];

      const cacheKey = `${this.messages.length}-${this.continuousChatEnabled}`;
      if (this._conversationCache?.key === cacheKey) {
        return this._conversationCache.data;
      }

      const conversationPairs = [];
      for (let i = this.messages.length - 2; i >= 0 && conversationPairs.length < 5; i -= 2) {
        if (this.messages[i]?.type === 'user' && this.messages[i + 1]?.type === 'ai') {
          conversationPairs.unshift({
            question: this.messages[i].content,
            answer: this.messages[i + 1].content
          });
        }
      }

      this._conversationCache = { key: cacheKey, data: conversationPairs };
      return conversationPairs;
    },

    messagesClasses() {
      const isLoading = this.loadingHistory;
      const canScroll = !isLoading && !this.isInitialLoad && !this.renderingScheduled;

      return {
        'smooth-scroll': canScroll,
        'initial-loading': isLoading
      };
    },

    isExpanded() {
      return this.windowSize?.width > 600 || this.windowSize?.height > 800;
    }
  },

  watch: {
    currentLanguage() {
      this.$nextTick(() => {
        this.trackInputChanges();
      });
    },

    isProcessing(newVal, oldVal) {
      if (!newVal) {
        this.stopLoadingMessages();
      }
      if (newVal) {
        this.showQuickQuestions = false;
      }
    },

    selectedPersona: {
      handler(newPersona, oldPersona) {

        if (newPersona) {
          this.loadPersonaHistory();
          this.formatWelcomeMessage();
        } else {
          this.messages = [];
          this.formattedWelcomeMessage = '';
        }
      },
      immediate: true
    }
  },

  methods: {
    getText,

    getPersonaIconName(persona) {
      if (!persona) return 'message-square-heart';
      return aiChatOpsService.getPersonaIcon(persona.personaCode, persona.iconPath);
    },

    getPersonaWelcomeMessage(persona) {
      if (!persona || !persona.welcomeMsg) return null;
      return persona.welcomeMsg;
    },

    // Format welcome message for display
    formatWelcomeMessage() {
      const message = this.getPersonaWelcomeMessage(this.selectedPersona);
      if (!message) {
        this.formattedWelcomeMessage = '';
        return;
      }

      try {
        this.formattedWelcomeMessage = aiChatOpsService.formatContentMarkdown(message);
      } catch (error) {
        this.formattedWelcomeMessage = message;
      }
    },

    getPersonaDescription(persona) {
      if (!persona) return '';
      if (this.currentLanguage === 'en' && persona.descriptionEn) {
        return persona.descriptionEn;
      }
      return persona.description || this.getText('defaultPersonaDesc');
    },

    getPersonaDisplayName(persona) {
      if (!persona) return '';
      return persona.title || persona.personaName || persona.personaCode || '';
    },

    generateUniqueId() {
      if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return crypto.randomUUID();
      }
      return 'id-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    },

    getSessionId() {
      return 'session-' + Date.now();
    },

    async loadPersonaHistory() {
      if (!this.selectedPersona?.personaCode) {
        return;
      }

      this.loadingHistory = true;
      this.isInitialLoad = true;

      try {
        const response = await aiChatOpsService.getConversations(this.selectedPersona.personaCode);

        if (response.success && response.conversations && Array.isArray(response.conversations)) {
          this.messages = [];
          this.pendingMessages = [];

          const normalizedConversations = response.conversations.map(conv => ({
            ...conv,
            userQuery: conv.userQuery,
            conversationId: conv.conversationId || conv.id || Date.now()
          }));

          const historyMessages = aiChatOpsService.convertConversationsToMessages(normalizedConversations);

          if (historyMessages.length > 0) {
            this.messages = historyMessages;
            this.$nextTick(() => {
              this.setInitialScrollPosition();
            });
          } else {
            this.checkPersonaAutoQuery();
          }
        } else {
          this.checkPersonaAutoQuery();
        }
      } catch (error) {
        this.addErrorMessage('Failed to load conversation history.');
        this.checkPersonaAutoQuery();
      } finally {
        this.loadingHistory = false;
        this.isInitialLoad = false;
      }
    },

    measureMemoryUsage() {
      if (performance.memory) {
        const memory = performance.memory;
        this.memoryUsage = {
          used: Math.round(memory.usedJSHeapSize / 1024 / 1024),
          total: Math.round(memory.totalJSHeapSize / 1024 / 1024)
        };
      }
    },

    // Start memory monitoring at 60-second intervals
    startMemoryMonitoring() {
      if (performance.memory) {
        this.stopMemoryMonitoring();
        this.memoryMonitorInterval = this.timerManager.safeSetInterval(() => {
          this.measureMemoryUsage();
        }, 60000);
        this.measureMemoryUsage();
      }
    },

    stopMemoryMonitoring() {
      if (this.memoryMonitorInterval) {
        this.timerManager.safeClearInterval(this.memoryMonitorInterval);
        this.memoryMonitorInterval = null;
      }
    },

    clearAllTimers() {
      // Clear TimerManager timers
      this.timerManager.clearAllTimers();
      
      // Clear remaining manually managed timers
      if (this.memoryMonitorInterval) {
        this.timerManager.safeClearInterval(this.memoryMonitorInterval);
        this.memoryMonitorInterval = null;
      }
      if (this.batchUpdateTimeout) {
        this.timerManager.safeClearTimeout(this.batchUpdateTimeout);
        this.batchUpdateTimeout = null;
      }
    },

    adjustTextareaHeight() {
      const textarea = this.$refs.messageInput;
      if (!textarea) return;

      const manager = this.enhancedInputManager;

      textarea.style.height = 'auto';
      const newHeight = Math.min(Math.max(textarea.scrollHeight, manager.minHeight), manager.maxHeight);
      textarea.style.height = newHeight + 'px';

      const lineCount = Math.ceil(newHeight / 24);
      manager.currentState.lineCount = lineCount;
      manager.currentState.isExpanded = newHeight > manager.minHeight + 20;
      manager.currentState.hasScrolled = textarea.scrollHeight > manager.maxHeight;

      this.updateInputContainerClasses();
    },

    updateInputContainerClasses() {
      const container = this.$refs.messageInput?.closest('.input-container');
      if (!container) return;

      const manager = this.enhancedInputManager;

      if (manager.currentState.isExpanded) {
        container.classList.add('enhanced-input--expanded');
      } else {
        container.classList.remove('enhanced-input--expanded');
      }

      if (manager.currentState.hasScrolled) {
        container.classList.add('enhanced-input--scrolling');
      }
      else {
        container.classList.remove('enhanced-input--scrolling');
      }
    },

    applyInputVisualFeedback() {
      const container = this.$refs.messageInput?.closest('.input-container');
      if (container) {
        container.classList.add('enhanced-input--focused');
        this.timerManager.safeSetTimeout(() => {
          container.classList.remove('enhanced-input--focused');
        }, 150);
      }
    },

    handleKeyDown(event) {
      if (event.key === 'Enter') {
        if (event.shiftKey) {
          return;
        } else {
          event.preventDefault();
          if (this.canSendMessage) {
            this.sendMessage();
          }
          return;
        }
      }

      if (event.ctrlKey && event.key === 'Enter') {
        event.preventDefault();
        if (this.canSendMessage) {
          this.sendMessage();
        }
        return;
      }

      if (event.ctrlKey && event.key === 'a') {
        return;
      }
    },

    handleInput() {
      this.trackInputChanges();
    },

    handleFocus() {
      this.applyInputVisualFeedback();
    },

    trackInputChanges() {
      this.adjustTextareaHeight();
    },

    toggleContinuousChat() {
      this.continuousChatEnabled = !this.continuousChatEnabled;
    },

    async sendMessage() {

      if (!this.canSendMessage || !this.selectedPersona) {
        return;
      }

      const messageContent = this.currentMessage;
      const plainTextContent = aiChatOpsService.htmlToPlainText(messageContent);


      const userMessage = {
        id: `user-${this.generateUniqueId()}`,
        type: 'user',
        content: messageContent,
        timestamp: new Date(),
        isLoading: false
      };


      this.addMessageWithLimit(userMessage);
      this.currentMessage = '';

      this.$nextTick(() => {
        const textarea = this.$refs.messageInput;
        if (textarea) {
          textarea.style.height = this.enhancedInputManager.minHeight + 'px';
          textarea.classList.remove('enhanced-input--scrolling');
          this.enhancedInputManager.currentState.hasScrolled = false;
          this.applyInputVisualFeedback();
        }
      });

      this.startLoadingMessages();

      let queryHistory = null;

      if (this.continuousChatEnabled && this.recentConversations.length > 0) {
        queryHistory = this.recentConversations.map(conv => ({
          question: aiChatOpsService.htmlToPlainText(conv.question),
          answer: aiChatOpsService.htmlToPlainText(conv.answer)
        }));
      }

      try {
        const messageData = {
          personaCode: this.selectedPersona.personaCode,
          userQuery: plainTextContent,
          sessionId: this.getSessionId(),
          currentLanguage: this.currentLanguage
        };

        if (queryHistory) {
          messageData.queryHistory = queryHistory;
        }

        this.lastApiCall = {
          timestamp: new Date(),
          data: messageData,
          status: 'sent'
        };

        this.$emit('message-sent', messageData);

      } catch (error) {
        this.lastApiCall = {
          timestamp: new Date(),
          error: error,
          status: 'failed'
        };

        this.addAiResponse({
          success: false,
          message: 'Failed to send message.'
        });
      }
    },

    sendQuickQuestion(question) {
      this.currentMessage = question;
      this.showQuickQuestions = false;
      this.quickQuestions = [];

      this.$nextTick(() => {
        this.sendMessage();
      });
    },

    addAiResponse(response) {

      if (this.loadingMessageId) {
        const loadingIndex = this.messages.findIndex(msg => msg.id === this.loadingMessageId);
        if (loadingIndex !== -1) {
          this.messages.splice(loadingIndex, 1);
        }
        this.loadingMessageId = null;
      }

      this.stopLoadingMessages();

      let responseMessage;

      if (response.success) {
        const aiResponseContent = response.data.aiResponse || response.data.data;

        responseMessage = {
          id: `ai-${this.generateUniqueId()}`,
          type: 'ai',
          content: aiResponseContent,
          timestamp: new Date(),
          isLoading: false,
          conversationId: response.data.conversationId
        };
      } else {
        const errorContent = response.message || response.errorMessage || this.getText('aiError');

        responseMessage = {
          id: `error-${this.generateUniqueId()}`,
          type: 'ai',
          content: errorContent,
          timestamp: new Date(),
          isError: true,
          isLoading: false
        };
      }

      // AI 응답 메시지를 즉시 추가하고 스크롤 실행
      this.messages.push(responseMessage);
      
      // 메시지 제한 확인
      if (this.messages.length > this.maxSessionMessages) {
        const excessCount = this.messages.length - this.maxSessionMessages;
        const removeCount = Math.ceil(excessCount / 2) * 2;
        this.messages.splice(0, removeCount);
      }

      // AI 응답 완료 후 포커스 복원 및 스크롤 실행
      this.$nextTick(() => {
        // 마크다운 렌더링 완료를 위해 조금 더 대기
        this.timerManager.safeSetTimeout(() => {
          this.scrollToBottomSmooth();
        }, 100);
        
        // 입력창에 포커스 복원
        this.timerManager.safeSetTimeout(() => {
          this.focusInput();
        }, 300);
      });

      if (this.lastApiCall) {
        this.lastApiCall.status = 'completed';
        this.lastApiCall.response = response;
      }
    },

    addErrorMessage(errorText) {
      const errorMessage = {
        id: `error-${this.generateUniqueId()}`,
        type: 'ai',
        content: errorText,
        timestamp: new Date(),
        isError: true,
        isLoading: false
      };

      this.addMessageWithLimit(errorMessage);
    },

    async generateQuickQuestions() {
      if (this.isQuickQuestionsLoading || this.isProcessing) return;

      this.isQuickQuestionsLoading = true;

      try {
        const questionData = {
          personaCode: this.selectedPersona.personaCode,
          currentLanguage: this.currentLanguage
        };

        const response = await aiChatOpsService.generateQuickQuestions(questionData);

        if (response.success) {
          this.displayQuickQuestionsResponse(response.data);
        } else {
          throw new Error(response.message || response.errorMessage);
        }

      } catch (error) {
        this.quickQuestions = this.getDefaultQuickQuestions();
        this.showQuickQuestions = true;
      } finally {
        this.isQuickQuestionsLoading = false;
      }
    },

    getLoadingMessage() {
      const messages = getTextArray(this.currentLanguage, 'loadingMessages');
      if (messages && messages.length > 0) {
        const randomIndex = Math.floor(Math.random() * messages.length);
        return messages[randomIndex];
      }

      return this.currentLanguage === 'ko' ?
        '응답을 생성하고 있습니다...' :
        'Generating response...';
    },

    displayQuickQuestionsResponse(responseData) {
      try {
        let questionsList = [];

        if (typeof responseData === 'string') {
          const jsonMatch = responseData.match(/\[.*\]/);
          if (jsonMatch) {
            questionsList = JSON.parse(jsonMatch[0]);
          } else {
            questionsList = responseData.split('\n')
              .filter(q => q.trim())
              .map(q => q.replace(/^[-\*\xE2\x80\xA2]\s*/, '').trim())
              .slice(0, 5);
          }
        } else if (Array.isArray(responseData)) {
          questionsList = responseData.slice(0, 5);
        } else if (responseData && typeof responseData === 'object') {
          questionsList = responseData.questions || responseData.data || [];
          if (typeof questionsList === 'string') {
            questionsList = [questionsList];
          }
        }

        questionsList = questionsList.filter(q => q && q.trim()).slice(0, 5);

        if (questionsList.length > 0) {
          this.quickQuestions = questionsList;
          this.showQuickQuestions = true;
        } else {
          throw new Error('Quick questions list is empty.');
        }

      } catch (error) {
        this.quickQuestions = this.getDefaultQuickQuestions();
        this.showQuickQuestions = true;
      }
    },

    getDefaultQuickQuestions() {
      return [
        '당신은 무엇을 잘 합니까?',
      ];
    },

    startLoadingMessages() {
      if (this.loadingMessageId) return;

      const loadingMessage = {
        id: `loading-${this.generateUniqueId()}`,
        type: 'ai',
        content: '',
        timestamp: new Date(),
        isLoading: true
      };

      this.addMessageWithLimit(loadingMessage);
      this.loadingMessageId = loadingMessage.id;
    },

    stopLoadingMessages() {
      this.loadingMessageId = null;
    },

    addMessageWithLimit(newMessage) {

      this.pendingMessages.push(newMessage);
      this.lastMessageTime = Date.now();
      this.scheduleBatchUpdate();
    },

    scheduleBatchUpdate() {
      if (this.renderingScheduled) return;

      this.renderingScheduled = true;

      // 부드러운 렌더링을 위해 즉시 처리
      this.$nextTick(() => {
        this.processBatchMessages();
        // 렌더링 완료 후 상태 초기화
        this.timerManager.safeSetTimeout(() => {
          this.renderingScheduled = false;
        }, 50);
      });
    },

    processBatchMessages() {
      if (this.pendingMessages.length === 0) {
        this.renderingScheduled = false;
        return;
      }

      this.messages.push(...this.pendingMessages);

      if (this.messages.length > this.maxSessionMessages) {
        const excessCount = this.messages.length - this.maxSessionMessages;
        const removeCount = Math.ceil(excessCount / 2) * 2;
        this.messages.splice(0, removeCount);
      }

      this.pendingMessages = [];

      // 배치 처리 후 즉시 스크롤 실행
      this.$nextTick(() => {
        this.scrollToBottomSmooth();
        // 사용자 메시지 추가 후에는 포커스를 유지하지 않음 (AI 응답 대기 중)
      });
    },

    scrollToBottomInstantly() {
      this.$nextTick(() => {
        const container = this.$refs.messagesContainer;
        if (container) {
          const forceScrollToBottom = (attempts = 0) => {
            container.scrollTo({
              top: container.scrollHeight,
              behavior: 'auto'
            });
            
            // 마크다운 렌더링 완료까지 대기하며 재시도
            if (attempts < 3) {
              this.timerManager.safeSetTimeout(() => {
                if (container.scrollTop < container.scrollHeight - container.clientHeight - 10) {
                  forceScrollToBottom(attempts + 1);
                }
              }, 200);
            }
          };
          
          forceScrollToBottom();
        }
      });
    },

    scrollToBottomSmooth() {
      // renderingScheduled 상태에 관계없이 스크롤 실행
      this.$nextTick(() => {
        const container = this.$refs.messagesContainer;
        if (container) {
          const scrollToBottom = (attempts = 0) => {
            const currentHeight = container.scrollHeight;
            const targetTop = currentHeight - container.clientHeight;
            
            container.scrollTo({
              top: currentHeight,
              behavior: 'smooth'
            });
            
            // 마크다운 렌더링으로 인한 높이 변화를 감지하여 재스크롤
            if (attempts < 8) {
              this.timerManager.safeSetTimeout(() => {
                const newHeight = container.scrollHeight;
                const currentScrollTop = container.scrollTop;
                const isAtBottom = currentScrollTop >= newHeight - container.clientHeight - 100;
                
                if (newHeight > currentHeight || !isAtBottom) {
                  scrollToBottom(attempts + 1);
                }
              }, 100 + (attempts * 50)); // 점진적으로 대기 시간 증가
            }
          };
          
          scrollToBottom();
        }
      });
    },

    focusInput() {
      const textarea = this.$refs.messageInput;
      if (textarea && !this.isProcessing) {
        textarea.focus();
        // 커서를 텍스트 끝으로 이동
        textarea.setSelectionRange(textarea.value.length, textarea.value.length);
      }
    },

    setInitialScrollPosition() {
      this.$nextTick(() => {
        const container = this.$refs.messagesContainer;
        if (container) {
          container.style.scrollBehavior = 'auto';
          
          // 초기 스크롤을 여러 번 시도하여 확실하게 하단으로 이동
          const forceInitialScroll = (attempts = 0) => {
            container.scrollTop = container.scrollHeight;
            
            if (attempts < 5) {
              this.timerManager.safeSetTimeout(() => {
                const isAtBottom = container.scrollTop >= container.scrollHeight - container.clientHeight - 10;
                if (!isAtBottom) {
                  forceInitialScroll(attempts + 1);
                }
              }, 100 * (attempts + 1));
            }
          };
          
          forceInitialScroll();

          this.timerManager.safeSetTimeout(() => {
            container.style.scrollBehavior = 'smooth';
          }, 600);
        }
      });
    },

    async handleCopyMessage(message) {
      try {
        const textToCopy = aiChatOpsService.convertHtmlToMarkdown(message.content);
        await navigator.clipboard.writeText(textToCopy);
      } catch (error) {
      }
    },

    handleRegenerateMessage(message) {
      if (message.type === 'ai' && this.messages.length >= 2) {
        for (let i = this.messages.length - 1; i >= 0; i--) {
          if (this.messages[i].type === 'user') {
            this.currentMessage = this.messages[i].content;
            this.sendMessage();
            break;
          }
        }
      }
    },

    handleFeedbackMessage(message) {
      this.$emit('show-feedback', {
        messageId: message.id,
        content: message.content
      });
    },

    handleClickOutside(event) {
      if (this.showQuickQuestions) {
        const dropdown = this.$refs.quickQuestionsDropdown;
        const inputArea = this.$refs.inputArea;
        const generateBtn = event.target.closest('.quick-questions-generate-btn');

        if (generateBtn) {
          return;
        }

        if (dropdown && !dropdown.contains(event.target) &&
          inputArea && !inputArea.contains(event.target)) {
          this.showQuickQuestions = false;
        }
      }
    },

    clearChatHistory() {
      if (!this.selectedPersona) return;

      const confirmed = confirm(`Delete all conversation history for ${this.selectedPersona.title}?\n\nDeleted conversations cannot be recovered.`);

      if (!confirmed) return;

      aiChatOpsService.deleteConversations(this.selectedPersona.personaCode)
        .then(response => {
          if (response.success) {
            Object.assign(this, {
              messages: [],
              currentMessage: '',
              showQuickQuestions: false,
              continuousChatEnabled: false,
              pendingMessages: [],
              renderingScheduled: false
            });

            this.stopLoadingMessages();
            this.$nextTick(() => {
              const textarea = this.$refs.messageInput;
              if (textarea) {
                textarea.style.height = `${this.enhancedInputManager.minHeight}px`;
                this.applyInputVisualFeedback();
              }
            });
          }
        })
        .catch(error => {
        });
    },

    resetToInitialState() {
      this.stopLoadingMessages();
      this.stopMemoryMonitoring();

      Object.assign(this, {
        currentMessage: '',
        messages: [],
        loadingHistory: false,
        loadingMessageId: null,
        showQuickQuestions: false,
        quickQuestions: [],
        continuousChatEnabled: true,
        isQuickQuestionsLoading: false,
        isInitialLoad: false,
        pendingMessages: [],
        renderingScheduled: false
      });

      this.enhancedInputManager.currentState = {
        isExpanded: false,
        hasScrolled: false,
        lineCount: 1
      };
    },

    // Universal auto-query system for personas
    checkPersonaAutoQuery() {
      if (!this.selectedPersona?.personaCode || this.messages.length > 0) {
        return;
      }

      const autoQueryConfig = this.getPersonaAutoQueryConfig(this.selectedPersona.personaCode);

      if (autoQueryConfig) {
        this.$nextTick(() => {
          this.currentMessage = autoQueryConfig.query;
          this.sendMessage();
        });
      }
    },

    // Get auto query configuration for specific persona
    getPersonaAutoQueryConfig(personaCode) {
      const autoQueryMap = {
        'jql_reporter': {
          query: 'Generate weekly JQL report for development team',
          description: 'Automatically generates weekly development metrics',
          enabled: true
        },
        'weekly_report': {
          query: '주간 보고서를 작성해줘',
          description: 'Automatically generates comprehensive weekly reports',
          enabled: true
        }
      };

      const config = autoQueryMap[personaCode];
      return (config && config.enabled) ? config : null;
    },

    handleMessageContainerClick(event) {
      const button = event.target.closest('.copy-code-btn');
      if (button) {
        // Try both new and old class names for compatibility
        const codeBlock = button.closest('.md-code-block') || button.closest('.markdown-code-block');
        const pre = codeBlock?.querySelector('pre');
        
        if (pre) {
          // Use data attribute if available, otherwise fallback to text content
          const codeText = button.dataset.code || pre.innerText;
          
          navigator.clipboard.writeText(codeText).then(() => {
            const originalText = button.textContent;
            button.textContent = 'Copied!';
            button.classList.add('copied');
            
            this.timerManager.safeSetTimeout(() => {
              button.textContent = originalText;
              button.classList.remove('copied');
            }, 2000);
          }).catch((err) => {
            console.error('Copy failed:', err);
            button.textContent = 'Copy failed';
            this.timerManager.safeSetTimeout(() => {
              button.textContent = 'Copy';
            }, 2000);
          });
        }
      }
    }
  },

  mounted() {
    this.$nextTick(() => {
      const textarea = this.$refs.messageInput;
      if (textarea) {
        textarea.style.height = `${this.enhancedInputManager.minHeight}px`;
        this.applyInputVisualFeedback();
      }
      const messagesContainer = this.$refs.messagesContainer;
      if (messagesContainer) {
        messagesContainer.addEventListener('click', this.handleMessageContainerClick);
        
        // ResizeObserver로 컨텐츠 높이 변화 감지하여 자동 스크롤
        if (window.ResizeObserver) {
          this.resizeObserver = new ResizeObserver((entries) => {
            // 새 메시지가 추가된 후 짧은 시간 내에만 자동 스크롤
            if (this.shouldAutoScroll && Date.now() - this.lastMessageTime < 2000) {
              this.timerManager.safeSetTimeout(() => {
                this.scrollToBottomInstantly();
              }, 50);
            }
          });
          this.resizeObserver.observe(messagesContainer);
        }
        
        // 초기 진입 시 스크롤을 하단으로 이동
        this.timerManager.safeSetTimeout(() => {
          this.setInitialScrollPosition();
        }, 200);
      }
    });

    this.startMemoryMonitoring();

    document.addEventListener('click', this.handleClickOutside);
  },

  beforeDestroy() {
    const messagesContainer = this.$refs.messagesContainer;
    if (messagesContainer) {
      messagesContainer.removeEventListener('click', this.handleMessageContainerClick);
    }

    // ResizeObserver 정리
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }

    this.clearAllTimers();
    this.stopLoadingMessages();

    document.removeEventListener('click', this.handleClickOutside);

    Object.assign(this, {
      messages: [],
      currentMessage: '',
      pendingMessages: [],
      renderingScheduled: false,
      loadingMessageId: null,
      memoryMonitorInterval: null
    });
  }
};
</script>

<style scoped>
.chat-tab {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--color-surface-light);
  position: relative;
}

.no-persona-selected {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: var(--space-xl);
}

.persona-selection-guide {
  text-align: center;
  max-width: 320px;
}

.guide-icon {
  margin-bottom: var(--space-lg);
}

.guide-title {
  font-size: var(--font-size-lg);
  font-weight: 600;
  margin-bottom: var(--space-sm);
}

.guide-description {
  font-size: var(--font-size-base);
  line-height: 1.6;
}

.chat-interface {
  display: flex;
  flex-direction: column;
  height: 100%;
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-md);
  overflow: hidden;
  background: var(--color-surface-white);
}

.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: var(--space-lg) var(--space-xl) var(--space-md);
  scroll-behavior: smooth;
  background: var(--color-surface-light);
}

.messages-container.smooth-scroll {
  scroll-behavior: smooth;
}

.messages-container.initial-loading {
  scroll-behavior: auto;
}

.loading-history {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-md);
  padding: var(--space-xl);
}

.loading-text {
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
  font-weight: 500;
}

.welcome-section {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  margin-bottom: var(--space-xl);
}

.welcome-content {
  text-align: center;
  max-width: 400px;
}

.welcome-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-md);
  margin-bottom: var(--space-lg);
}

.persona-avatar {
  width: 48px;
  height: 48px;
  background: var(--color-primary);
  color: var(--color-text-light);
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: var(--shadow-soft);
}

.welcome-title {
  font-size: var(--font-size-xl);
  font-weight: 600;
  margin: 0;
}

.welcome-section {
  text-align: center;
  padding: var(--space-lg) var(--space-xl) var(--space-md);
  flex-shrink: 0;
}

.welcome-message {
  font-size: var(--font-size-base);
  margin: 0;
  line-height: 1.5;
  padding: 0 var(--space-md);
}

.input-area {
  background: var(--color-surface-white);
  border-top: 1px solid var(--color-border-light);
  padding: var(--space-md) var(--space-xl) var(--space-lg);
  z-index: 5;
  position: relative;
}

/* 빠른 질문 드롭다운 스타일 */
.quick-questions-dropdown {
  position: absolute;
  top: -8px;
  left: var(--space-xl);
  right: var(--space-xl);
  background: var(--color-surface-white);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-moderate);
  z-index: 10;
  transform: translateY(-100%);
}

.quick-questions-list {
  max-height: 200px;
  overflow-y: auto;
}

.quick-question-item {
  padding: var(--space-sm) var(--space-md);
  cursor: pointer;
  border-bottom: 1px solid var(--color-border-light);
  transition: background-color var(--motion-fast);
  font-size: var(--font-size-sm);
  line-height: 1.4;
}

.quick-question-item:last-child {
  border-bottom: none;
}

.quick-question-item:hover {
  background-color: var(--color-accent-subtle);
}

.quick-question-item:active {
  background-color: var(--color-accent-medium);
}

.input-container {
  padding: var(--space-sm);
  transition: all var(--motion-fast);
  position: relative;
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.input-container.enhanced-input--focused {
  border-color: var(--color-accent);
  box-shadow: 0 0 0 3px var(--color-accent-subtle);
  transform: translateY(-1px);
}

.input-container.enhanced-input--expanded {
  border-color: var(--color-accent-secondary);
}

.input-box {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.message-textarea {
  height: 38px;
  min-height: 38px;
  max-height: 400px;
  border: 1px solid rgba(0, 0, 0, 0.03);
  resize: none;
  margin: 0;
  transition: none;
  overflow: hidden;
  overflow-y: auto;
  word-wrap: break-word;
  white-space: pre-wrap;
  border-radius: var(--radius-md);
}

.message-textarea::placeholder {
  opacity: 0.7;
}

.message-textarea:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.input-bottom-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.left-actions {
  display: flex;
  align-items: center;
  gap: 6px;
}

.btn-text {
  margin-left: 4px;
  font-size: var(--font-size-xs);
  font-weight: 500;
  white-space: nowrap;
}

.quick-questions-generate-btn,
.continuous-chat-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: var(--space-sm) !important;
  transition: all 0.2s ease;
  border-radius: var(--radius-md);
  background: transparent !important;
  border: none !important;
}

.quick-questions-generate-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(14, 165, 233, 0.15);
}

.continuous-chat-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(34, 197, 94, 0.15);
}

.send-button-enhanced {
  position: relative;
}

.send-button-enhanced.loading {
  animation: pulse-send-enhanced 1.8s ease-in-out infinite;
}

.loading-spinner {
  width: 12px;
  height: 12px;
  border: 2px solid var(--color-border-light);
  border-top: 2px solid var(--color-accent);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

@keyframes pulse-send-enhanced {

  0%,
  100% {
    box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.4);
  }

  50% {
    box-shadow: 0 0 0 8px rgba(16, 185, 129, 0);
  }
}

.dev-info-tooltip {
  position: absolute;
  bottom: 100%;
  right: 0;
  background: var(--color-text-primary);
  color: var(--color-text-light);
  padding: var(--space-sm);
  border-radius: var(--radius-md);
  font-size: var(--font-size-xs);
  white-space: nowrap;
  z-index: 1000;
  margin-bottom: var(--space-sm);
  border: 1px solid var(--color-border-medium);
  box-shadow: var(--shadow-moderate);
  font-family: 'Monaco', 'Menlo', 'SF Mono', 'Consolas', 'Courier New', monospace;
  backdrop-filter: blur(var(--blur-strong));
  -webkit-backdrop-filter: blur(var(--blur-strong));
  animation: fadeInUp 0.2s ease-out;
}

.dev-info-tooltip-avatar {
  position: absolute;
  top: 100%;
  left: 0;
  background: var(--color-text-primary);
  color: var(--color-text-light);
  padding: var(--space-sm);
  border-radius: var(--radius-md);
  font-size: var(--font-size-xs);
  white-space: nowrap;
  z-index: 1000;
  margin-top: var(--space-sm);
  border: 1px solid var(--color-border-medium);
  box-shadow: var(--shadow-moderate);
  font-family: 'Monaco', 'Menlo', 'SF Mono', 'Consolas', 'Courier New', monospace;
  backdrop-filter: blur(var(--blur-strong));
  -webkit-backdrop-filter: blur(var(--blur-strong));
  animation: fadeInDown 0.2s ease-out;
}

.dev-info-header {
  font-weight: 600;
  margin-bottom: var(--space-xs);
  text-align: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  padding-bottom: var(--space-xs);
}

.dev-info-content {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.dev-info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--space-sm);
}

.dev-label {
  opacity: 0.8;
}

.dev-value {
  font-weight: 600;
  color: var(--color-accent-secondary);
}

.dev-value--active {
  color: var(--color-success) !important;
  position: relative;
}

.dev-value--active::before {
  content: '';
  position: absolute;
  left: -8px;
  top: 50%;
  transform: translateY(-50%);
  width: 4px;
  height: 4px;
  background: var(--color-success);
  border-radius: 50%;
  animation: pulse-dot 2s ease-in-out infinite;
}

@keyframes pulse-dot {

  0%,
  100% {
    opacity: 0.7;
    transform: translateY(-50%) scale(1);
  }

  50% {
    opacity: 1;
    transform: translateY(-50%) scale(1.2);
    box-shadow: 0 0 8px var(--color-success);
  }
}

.input-container.enhanced-input--scrolling::after {
  content: "↕️ 스크롤하여 전체 내용 확인";
  position: absolute;
  bottom: -22px;
  right: 0;
  font-size: 10px;
  color: var(--color-text-muted);
  background: var(--color-surface-white);
  padding: 2px 6px;
  border-radius: 4px;
  border: 1px solid var(--color-border-light);
  z-index: 5;
}

@media (max-width: 768px) {

  .quick-questions-generate-btn,
  .continuous-chat-btn {
    min-width: auto;
    padding: var(--space-sm) !important;
  }

  .btn-text {
    display: none;
  }
}

@media (max-width: 640px) {
  .input-area {
    padding: var(--space-sm) var(--space-md) var(--space-sm);
  }

  .input-container {
    padding: 6px;
  }

  .input-box {
    gap: 6px;
  }

  .message-textarea {
    height: 21px;
    min-height: 21px;
  }

  .left-actions {
    gap: 4px;
  }

  .dev-info-tooltip {
    font-size: 10px;
    min-width: 140px;
  }

  .dev-info-header,
  .dev-label,
  .dev-value {
    font-size: 9px;
  }

  .quick-questions-dropdown {
    left: var(--space-md);
    right: var(--space-md);
  }
}

@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translateY(-16px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 채팅 헤더 스타일 */
.chat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-md) var(--space-lg);
  background: var(--color-surface-white);
  border-bottom: 1px solid var(--color-border-light);
  min-height: 56px;
}

.persona-info {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  position: relative;
}

.persona-badge {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-xs) var(--space-sm);
  background: var(--color-primary);
  color: white;
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  font-weight: 500;
  cursor: pointer;
  transition: all var(--motion-fast);
  position: relative;
}

.persona-badge:hover {
  background: var(--color-primary-dark);
  transform: translateY(-1px);
  box-shadow: var(--shadow-soft);
}

.header-actions {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
}
</style>