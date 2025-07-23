<template>
  <div class="ai-chatops-chat">
    <button :class="['ai-chatops-chat-button', { 'is-active': isOpen }]" @click="toggleChat">
      <Elements v-if="isLoading" component-type="spinner" size="md" />
      <LucideIcon v-if="!isLoading && isOpen" name="x" fill="currentColor" :width="28" :height="28" :interactive="true"
        key="close-icon" />
      <LucideIcon v-if="!isLoading && !isOpen" name="robot" fill="currentColor" :width="28" :height="28"
        :interactive="true" key="chat-icon" />
    </button>

    <div v-show="isOpen && isInitialized" class="ai-chatops-chat-window" :class="[windowClasses, currentTheme]"
      ref="chatWindow">
      <div class="chat-header">
        <div class="bot-info">
          <div class="avatar">
            <LucideIcon name="robot" fill="white" :width="26" :height="26" />
          </div>
          <div class="details">
            <span class="name">{{ getText('aiChatOpsTitle') }}</span>
            <div class="status" :class="{ offline: !isConnected }">
              <span class="status-dot"></span>
              <span>{{ isConnected ? getText('online') : getText('offline') }}</span>
            </div>
          </div>
          <button class="conversation-history-btn header-btn header-btn--md" @click="openConversationAnalytics"
            title="대화분석">
            <LucideIcon name="bar-chart-3" fill="currentColor" :width="16" :height="16" />
          </button>
        </div>

        <div class="actions">
          <div class="easter-egg-trigger" @click="openRandomEasterEgg">
            <LucideIcon name="sparkles" fill="currentColor" :width="4" :height="4" />
          </div>

          <button class="system-admin-btn header-btn header-btn--md" @click="openSystemAdmin" title="시스템 관리">
            <LucideIcon name="shield" fill="currentColor" :width="16" :height="16" />
          </button>

          <button class="theme-selector header-btn header-btn--md" @click="cycleTheme" :title="getCurrentThemeName()">
            <span class="theme-indicator">{{ getThemeDisplayName() }}</span>
          </button>

          <button class="language-btn header-btn header-btn--md" @click="toggleLanguage">
            <span>{{ currentLanguage === 'ko' ? 'KO' : 'EN' }}</span>
          </button>

          <div class="window-controls">
            <button class="window-control-btn header-btn" @click="minimizeWindow">
              <LucideIcon name="minus" fill="currentColor" :width="12" :height="12" :interactive="true" />
            </button>
            <button class="window-control-btn header-btn" @click="toggleMaximizeWindow">
              <LucideIcon :name="windowState === 'maximized' ? 'minimize-2' : 'maximize-2'" fill="currentColor"
                :width="12" :height="12" :interactive="true" />
            </button>
            <button class="window-control-btn header-btn" @click="closeChat">
              <LucideIcon name="x" fill="currentColor" :width="12" :height="12" :interactive="true" />
            </button>
          </div>
        </div>
      </div>

      <div class="content">
        <div v-show="currentView === 'categorySelect'" class="category-select">
          <div class="welcome-section">
            <div class="welcome-icon">
              <LucideIcon name="heart" fill="var(--color-primary)" :width="28" :height="28" />
            </div>
            <div class="welcome-content">
              <h3>{{ getText('welcomeTitle') }}</h3>
              <p>{{ getText('welcomeMessage') }}</p>
            </div>
          </div>

          <div class="category-container">
            <div class="category-grid">
              <div v-for="category in categories" :key="category.key" @click="selectCategory(category.key)"
                class="category-card card-system card-system--interactive"
                :class="{ disabled: chatProcessingCount > 0 }">
                <div class="category-icon" :class="`category-icon--${category.key}`">
                  <LucideIcon :name="category.icon" fill="white" :width="20" :height="20" />
                </div>
                <div class="category-content">
                  <h4>{{ getText(category.titleKey) }}</h4>
                  <p>{{ getText(category.descKey) }}</p>
                </div>
                <div class="category-arrow">
                  <LucideIcon name="chevron-right" fill="currentColor" :width="14" :height="14" />
                </div>
              </div>
            </div>

            <div class="feedback-section">
              <button @click="goToFeedback" :disabled="chatProcessingCount > 0"
                class="feedback-btn btn-system btn-system--accent btn-system--md">
                <LucideIcon name="heart" fill="currentColor" :width="16" :height="16" />
                {{ getText('sendFeedback') }}
              </button>
            </div>
          </div>
        </div>

        <div v-show="currentView === 'personaList'" class="persona-list-tab">
          <div class="persona-header">
            <button @click="goToCategorySelect" class="back-btn btn-system btn-system--ghost btn-system--sm">
              <LucideIcon name="arrow-left" fill="currentColor" :width="14" :height="14" />
              {{ getText('back') }}
            </button>

            <div class="header-content">
              <div class="category-badge">
                <LucideIcon :name="getCategoryIcon(selectedCategory)" fill="white" :width="16" :height="16" />
                <span>{{ getCategoryDisplayName(selectedCategory) }}</span>
              </div>
              <h3>{{ getText('selectPersonaDesc') }}</h3>
            </div>
          </div>

          <div class="persona-content">
            <div v-show="loadingPersonas" class="loading-container">
              <Elements component-type="spinner" size="lg" centered />
              <span>{{ getText('loadingPersonas') }}</span>
            </div>

            <div v-show="!loadingPersonas && filteredPersonas.length === 0" class="no-personas">
              <LucideIcon name="info" fill="var(--text-muted)" :width="40" :height="40" />
              <h4>{{ getText('noPersonas') }}</h4>
              <p>{{ getText('noPersonasDesc') }}</p>
              <button @click="goToCategorySelect" class="btn-system btn-system--primary btn-system--md">
                <LucideIcon name="home-heart" fill="currentColor" :width="16" :height="16" />
                {{ getText('goHome') }}
              </button>
            </div>

            <div v-show="!loadingPersonas && filteredPersonas.length > 0" class="persona-grid">
              <div v-for="(persona, index) in filteredPersonas" :key="persona.personaCode"
                @click="selectPersona(persona)" class="persona-card card-system card-system--interactive"
                :class="{ disabled: loadingPersonas }" data-testid="persona-card">
                <div class="persona-card-content">
                  <div class="persona-icon"
                    :style="{ backgroundColor: getPersonaColor(index, getPersonaDescription(persona)) }">
                    <LucideIcon :name="getPersonaIconName(persona)" fill="white" :width="20" :height="20" />
                  </div>

                  <div class="persona-info">
                    <h4 class="persona-title">{{ persona.title || persona.personaCode }}</h4>
                    <p class="persona-description">{{ getPersonaDescription(persona) }}</p>
                  </div>

                  <div class="persona-arrow">
                    <LucideIcon name="chevron-right" fill="currentColor" :width="14" :height="14" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <ChatTab v-if="currentView === 'chat' && isInitialized" ref="chatTab" :selected-persona="selectedPersona"
          :is-processing="chatProcessingCount > 0" :current-language="currentLanguage" :window-size="windowSize"
          :selected-category="selectedCategory" @message-sent="handleMessageSent"
          @processing-state-changed="handleProcessingStateChanged" @go-persona-list="goToPersonaList"
          @go-home="goToCategorySelect" />

        <FeedbackTab v-if="currentView === 'feedback' && isInitialized" ref="feedbackTab"
          :current-language="currentLanguage" @feedback-sent="handleFeedbackSent" @go-home="goToCategorySelect" />

      </div>
    </div>
  </div>
</template>

<script>
import aiChatOpsService from './service/aiChatOpsService.js';
import { getText } from './utils/i18n.js';
import ChatTab from './components/ChatTab.vue';
import FeedbackTab from './components/FeedbackTab.vue';
import Elements from './components/Elements.vue';
import LucideIcon from './components/LucideIcon.vue';

export default {
  name: 'AIChatOpsLayout',
  components: {
    ChatTab,
    FeedbackTab,
    Elements,
    LucideIcon
  },

  data() {
    return {
      isOpen: false,
      isInitialized: false,
      isLoading: false,
      isInitializing: false,
      isClosing: false,
      currentView: 'categorySelect',
      selectedCategory: null,
      selectedPersona: null,
      personas: [],
      loadingPersonas: false,
      isConnected: true,
      currentLanguage: this.getInitialLanguage(),
      currentTheme: this.getInitialTheme(),
      personaSessionMap: {},
      personaMessageCache: new Map(),
      cacheAccessOrder: [],
      maxMessagesPerPersona: 10,
      windowState: 'normal',
      windowSize: {
        width: 455,
        height: 676
      },
      chatProcessingCount: 0,
      pendingRequests: new Map(),
      healthCheckInterval: null,
      cacheCleanupInterval: null,

      activeTimers: new Set(),
      activeIntervals: new Set(),
      availableThemes: [
        { key: 'theme-ai-chatops', name: 'AI-ChatOps', displayName: 'AI' },
        { key: 'theme-heritage', name: 'Heritage', displayName: 'HT' },
        { key: 'theme-classic', name: 'classic', displayName: 'NY' },
        { key: 'theme-retro', name: 'retro', displayName: 'RT' }
      ],
      personaColors: [
        '#8B7FD6', '#7FB069', '#D4A574', '#9B8AA0', '#6B9BD2',
        '#C49A9A', '#85A392', '#D6B85A', '#A084C2', '#6FAADB',
        '#C5906D', '#9A9FD4', '#7DC4A8', '#E0A458', '#B39BC7',
        '#6DB4D6', '#D9976B', '#8FA8D3', '#A8D4A8', '#E8B86D',
        '#C2A2D6', '#7ACFD6', '#D4A285', '#98B6E8', '#B8D4B8',
        '#F0C570', '#D0A8E8', '#85D4D4', '#E8C085', '#A8C0F0'
      ],
      categories: [
        {
          key: 'personal',
          icon: 'user',
          titleKey: 'personalCategory',
          descKey: 'personalCategoryDesc'
        },
        {
          key: 'general',
          icon: 'users',
          titleKey: 'generalCategory',
          descKey: 'generalCategoryDesc'
        },
        {
          key: 'operation',
          icon: 'settings',
          titleKey: 'operationCategory',
          descKey: 'operationCategoryDesc'
        }
      ]
    };
  },

  computed: {
    windowClasses() {
      return {
        'minimized': this.windowState === 'minimized',
        'maximized': this.windowState === 'maximized'
      };
    },

    filteredPersonas() {
      if (!this.selectedCategory || !Array.isArray(this.personas)) {
        return [];
      }

      const cacheKey = `${this.selectedCategory}-${this.personas.length}`;
      if (this._personaFilterCache?.key === cacheKey) {
        return this._personaFilterCache.data;
      }

      const filtered = this.personas.filter(persona =>
        persona?.category === this.selectedCategory
      );

      this._personaFilterCache = { key: cacheKey, data: filtered };
      return filtered;
    }
  },

  methods: {
    getText(key, params = {}) {
      return getText(this.currentLanguage, key, params);
    },

    getInitialLanguage() {
      try {
        return localStorage.getItem('ai-chatops-chat-lang') || 'ko';
      } catch (error) {
        return 'ko';
      }
    },

    getInitialTheme() {
      try {
        return localStorage.getItem('ai-chatops-chat-theme') || 'theme-ai-chatops';
      } catch (error) {
        return 'theme-ai-chatops';
      }
    },

    cycleTheme() {
      const currentIndex = this.availableThemes.findIndex(theme => theme.key === this.currentTheme);
      const nextIndex = (currentIndex + 1) % this.availableThemes.length;
      const nextTheme = this.availableThemes[nextIndex];

      this.currentTheme = nextTheme.key;
      this.applyTheme(nextTheme.key);
      this.saveThemePreference(nextTheme.key);
    },

    // Apply theme classes to body and chat window
    applyTheme(themeKey) {
      const body = document.body;
      const chatWindow = this.$refs.chatWindow;

      this.availableThemes.forEach(theme => {
        body.classList.remove(theme.key);
        if (chatWindow) {
          chatWindow.classList.remove(theme.key);
        }
      });

      body.classList.add(themeKey);
      if (chatWindow) {
        chatWindow.classList.add(themeKey);
      }
    },

    getCurrentThemeName() {
      const theme = this.availableThemes.find(t => t.key === this.currentTheme);
      return theme ? theme.name : 'Default';
    },

    getThemeDisplayName() {
      const theme = this.availableThemes.find(t => t.key === this.currentTheme);
      return theme ? theme.displayName : 'D';
    },

    saveThemePreference(themeKey) {
      try {
        localStorage.setItem('ai-chatops-chat-theme', themeKey);
      } catch (error) {
      }
    },

    getCategoryIcon(category) {
      const iconMap = {
        'operation': 'settings',
        'general': 'users',
        'personal': 'user',
        'systemAdmin': 'shield'
      };
      return iconMap[category] || 'grid';
    },

    getCategoryDisplayName(category) {
      const displayNames = {
        'personal': 'personalCategory',
        'general': 'generalCategory',
        'operation': 'operationCategory',
        'systemAdmin': 'systemAdminCategory'
      };

      return this.getText(displayNames[category] || category);
    },

    getPersonaIconName(persona) {
      if (!persona) return 'message-square-heart';
      return aiChatOpsService.getPersonaIcon(persona.personaCode);
    },

    getPersonaDescription(persona) {
      if (!persona) return '';
      if (this.currentLanguage === 'en' && persona.descriptionEn) {
        return persona.descriptionEn;
      }
      return persona.description || this.getText('defaultPersonaDesc');
    },

    getPersonaColor(index, description = '') {
      const descLength = description.length || 1;
      const colorIndex = (index + descLength) % this.personaColors.length;
      return this.personaColors[colorIndex];
    },

    async toggleChat() {
      if (!this.isOpen) {
        if (this.isInitializing || this.isClosing) {
          return;
        }

        this.isInitializing = true;

        const newState = {
          windowState: 'normal',
          currentView: 'categorySelect',
          isOpen: true,
          isInitialized: true
        };

        Object.assign(this, newState);

        await this.$nextTick();

        this.applyTheme(this.currentTheme);

        this.$nextTick(() => {
          Promise.all([
            this.loadPersonas(),
          ]).catch(() => { });
        });

        this.isInitializing = false;

      } else {
        if (this.isClosing) {
          return;
        }

        this.isClosing = true;
        this.isOpen = false;

        this.safeSetTimeout(() => {
          this.isInitialized = false;
          this.isClosing = false;
        }, 150);
      }
    },

    closeChat() {
      // body 스크롤 복원
      document.body.style.overflow = '';

      Object.assign(this, {
        isOpen: false,
        currentView: 'categorySelect',
        selectedCategory: null,
        selectedPersona: null,
        windowState: 'normal'
      });

      this.cancelAllPendingRequests();

      this.$nextTick(() => {
        this.saveCurrentMessages();
        if (this.$refs.chatTab) this.$refs.chatTab.resetToInitialState();

        this.safeSetTimeout(() => {
          this.isInitialized = false;
        }, 150);
      });
    },

    minimizeWindow() {
      if (this.windowState === 'minimized') {
        this.windowState = 'normal';
      } else {
        this.windowState = 'minimized';
      }
    },

    toggleMaximizeWindow() {
      if (this.windowState === 'maximized') {
        this.windowState = 'normal';
      } else {
        this.windowState = 'maximized';
      }
    },

    goToCategorySelect() {
      this.saveCurrentMessages();

      // 시스템 관리 모드에서 나가는 경우 body 스크롤 복원
      if (this.currentView === 'systemAdmin') {
        document.body.style.overflow = '';
      }

      Object.assign(this, {
        currentView: 'categorySelect',
        selectedCategory: null,
        selectedPersona: null
      });

      if (this.$refs.chatTab) this.$refs.chatTab.resetToInitialState();
    },

    goToPersonaList() {
      this.saveCurrentMessages();

      Object.assign(this, {
        currentView: 'personaList',
        selectedPersona: null
      });

      if (this.$refs.chatTab) this.$refs.chatTab.resetToInitialState();
    },

    goToFeedback() {
      this.currentView = 'feedback';
    },

    selectCategory(category) {
      if (category === 'systemAdmin') {
        Object.assign(this, {
          currentView: 'systemAdmin',
          selectedCategory: category
        });
      } else {
        Object.assign(this, {
          selectedCategory: category,
          currentView: 'personaList'
        });
      }
    },

    selectPersona(persona) {
      this.saveCurrentMessages();

      Object.assign(this, {
        selectedPersona: persona,
        currentView: 'chat'
      });

      this.$nextTick(() => {
        if (this.$refs.chatTab) {
          if (!this.loadCachedMessages(persona.personaCode)) {
            this.$refs.chatTab.loadPersonaHistory();
          }
        }
      });
    },

    toggleLanguage() {
      this.currentLanguage = this.currentLanguage === 'ko' ? 'en' : 'ko';
      try {
        localStorage.setItem('ai-chatops-chat-lang', this.currentLanguage);
      } catch (error) {
      }
    },

    openRandomEasterEgg() {
      const randomNumber = Math.floor(Math.random() * 5) + 1;
      const easterEggUrl = `/playground/easter-egg${randomNumber}.html`;
      window.open(easterEggUrl, '_blank', 'width=800,height=600,scrollbars=yes,resizable=yes');
    },

    openSystemAdmin() {
      // 시스템 관리 페이지를 새 창에서 전체화면으로 열기
      const adminUrl = '/admin.html';
      window.open(adminUrl, '_blank', 'fullscreen=yes,scrollbars=yes');
    },

    openConversationAnalytics() {
      // 대화 분석 페이지를 새 창에서 전체화면으로 열기
      const analyticsUrl = '/analytics.html';
      window.open(analyticsUrl, '_blank', 'fullscreen=yes,scrollbars=yes');
    },

    saveCurrentMessages() {
      if (this.selectedPersona && this.$refs.chatTab && this.$refs.chatTab.messages.length > 0) {
        const currentMessages = this.$refs.chatTab.messages;
        const messagesToSave = currentMessages.slice(-this.maxMessagesPerPersona);
        this.setCache(this.selectedPersona.personaCode, messagesToSave);
      }
    },

    loadCachedMessages(personaCode) {
      const cachedMessages = this.getCache(personaCode);
      if (cachedMessages && cachedMessages.length > 0) {
        this.$refs.chatTab.messages = [...cachedMessages];
        this.$refs.chatTab.scrollToBottomInstantly();
        return true;
      }
      return false;
    },

    accessCache(personaCode) {
      if (this.cacheAccessOrder) {
        const index = this.cacheAccessOrder.indexOf(personaCode);
        if (index > -1) {
          this.cacheAccessOrder.splice(index, 1);
        }
        this.cacheAccessOrder.push(personaCode);
      }
    },

    setCache(personaCode, messages) {
      const maxCacheSize = this.maxMessagesPerPersona || 10;

      if (this.personaMessageCache.size >= maxCacheSize && !this.personaMessageCache.has(personaCode)) {
        const oldestKey = this.cacheAccessOrder?.[0];
        if (oldestKey) {
          this.personaMessageCache.delete(oldestKey);
          this.cacheAccessOrder.shift();
        }
      }

      this.personaMessageCache.set(personaCode, messages);
      this.accessCache(personaCode);
    },

    getCache(personaCode) {
      if (this.personaMessageCache.has(personaCode)) {
        this.accessCache(personaCode);
        return this.personaMessageCache.get(personaCode);
      }
      return null;
    },

    cleanupCache() {
      const maxSize = this.maxMessagesPerPersona || 10;
      if (this.personaMessageCache.size > maxSize) {
        const excessCount = this.personaMessageCache.size - maxSize;
        const keysToRemove = this.cacheAccessOrder?.slice(0, excessCount) || [];

        keysToRemove.forEach(key => {
          this.personaMessageCache.delete(key);
          const index = this.cacheAccessOrder.indexOf(key);
          if (index > -1) {
            this.cacheAccessOrder.splice(index, 1);
          }
        });
      }
    },

    startCacheCleanup() {
      this.stopCacheCleanup();
      this.cacheCleanupInterval = this.safeSetInterval(() => {
        this.cleanupCache();
      }, 300000);
    },

    stopCacheCleanup() {
      if (this.cacheCleanupInterval) {
        this.safeClearInterval(this.cacheCleanupInterval);
        this.cacheCleanupInterval = null;
      }
    },

    safeSetTimeout(callback, delay) {
      const timerId = setTimeout(() => {
        this.activeTimers.delete(timerId);
        if (typeof callback === 'function') {
          callback();
        }
      }, delay);
      this.activeTimers.add(timerId);
      return timerId;
    },

    safeSetInterval(callback, interval) {
      const intervalId = setInterval(() => {
        if (typeof callback === 'function') {
          callback();
        }
      }, interval);
      this.activeIntervals.add(intervalId);
      return intervalId;
    },

    safeClearTimeout(timerId) {
      if (timerId && this.activeTimers.has(timerId)) {
        clearTimeout(timerId);
        this.activeTimers.delete(timerId);
      }
    },

    safeClearInterval(intervalId) {
      if (intervalId && this.activeIntervals.has(intervalId)) {
        clearInterval(intervalId);
        this.activeIntervals.delete(intervalId);
      }
    },

    clearAllTimers() {
      this.activeTimers.forEach(timerId => {
        clearTimeout(timerId);
      });
      this.activeTimers.clear();

      this.activeIntervals.forEach(intervalId => {
        clearInterval(intervalId);
      });
      this.activeIntervals.clear();

      if (this.healthCheckInterval) {
        clearInterval(this.healthCheckInterval);
        this.healthCheckInterval = null;
      }
      if (this.cacheCleanupInterval) {
        clearInterval(this.cacheCleanupInterval);
        this.cacheCleanupInterval = null;
      }
    },

    // Load personas from API
    loadPersonas() {
      if (this.loadingPersonas) {
        return Promise.resolve();
      }

      this.loadingPersonas = true;

      return aiChatOpsService.getPersonas()
        .then(response => {
          if (response.success) {
            this.personas = response.data.data || response.data || [];
          }
        })
        .catch(error => {
        })
        .finally(() => {
          this.loadingPersonas = false;
        });
    },

    handleMessageSent(data) {
      const requestId = `${data.personaCode}-${Date.now()}-${Math.random()}`;
      this.pendingRequests.set(requestId, {
        personaCode: data.personaCode,
        startTime: Date.now()
      });

      this.updateProcessingState();

      if (!data.sessionId && this.personaSessionMap[data.personaCode]) {
        data.sessionId = this.personaSessionMap[data.personaCode];
      }

      aiChatOpsService.sendMessage(data)
        .then(response => {
          if (response.success) {
            this.handleSuccessResponse(data, response);
          } else {
            this.handleErrorResponse(response.errorMessage || this.getText('aiError'));
          }
        })
        .catch(error => {
          this.handleErrorResponse(this.getText('networkError'));
          this.isConnected = false;
        })
        .finally(() => {
          this.pendingRequests.delete(requestId);
          this.updateProcessingState();
        });
    },

    // Handle successful API response
    handleSuccessResponse(data, response) {
      if (response.sessionId) {
        this.personaSessionMap[data.personaCode] = response.sessionId;
        try {
          localStorage.setItem('ai-chatops-chat-sessions', JSON.stringify(this.personaSessionMap));
        } catch (error) {
        }
      }

      if (this.$refs.chatTab) {
        this.$refs.chatTab.addAiResponse(response);
      }

      this.isConnected = true;
    },

    handleErrorResponse(errorMessage) {
      if (this.$refs.chatTab) {
        this.$refs.chatTab.addAiResponse({
          success: false,
          message: errorMessage
        });
      }
    },

    updateProcessingState() {
      const newCount = this.pendingRequests.size;
      const oldCount = this.chatProcessingCount;
      this.chatProcessingCount = newCount;

      if (oldCount !== newCount) {
        this.$emit('processing-state-changed', newCount > 0);
      }
    },

    handleProcessingStateChanged(isProcessing) {

    },

    cancelAllPendingRequests() {
      this.pendingRequests.clear();
      this.updateProcessingState();
      this.chatProcessingCount = 0;
    },

    handleFeedbackSent(feedbackData) {
      aiChatOpsService.sendFeedback(feedbackData)
        .then(response => {
          if (response.success) {
            if (this.$refs.feedbackTab) {
              this.$refs.feedbackTab.showSuccess(response.message);
            }
          } else {
            if (this.$refs.feedbackTab) {
              this.$refs.feedbackTab.showError(response.errorMessage || 'An error occurred while sending feedback.');
            }
          }
        })
        .catch(error => {
          if (this.$refs.feedbackTab) {
            this.$refs.feedbackTab.showError('An error occurred while sending feedback.');
          }
        });
    },

    loadStoredSessions() {
      try {
        const sessionData = localStorage.getItem('ai-chatops-chat-sessions');
        if (sessionData) {
          this.personaSessionMap = JSON.parse(sessionData);
        }
      } catch (error) {
        this.personaSessionMap = {};
      }
    },

    startHealthCheck() {
      if (this.healthCheckInterval) {
        this.safeClearInterval(this.healthCheckInterval);
      }
      this.healthCheckInterval = this.safeSetInterval(() => {
        aiChatOpsService.healthCheck()
          .then(response => {
            this.isConnected = response.success;
          })
          .catch(() => {
            this.isConnected = false;
          });
      }, 30000);
    },

    stopHealthCheck() {
      if (this.healthCheckInterval) {
        this.safeClearInterval(this.healthCheckInterval);
        this.healthCheckInterval = null;
      }
    },

    cleanup() {
      this.clearAllTimers();
      this.stopHealthCheck();
      this.stopCacheCleanup();
    }
  },

  mounted() {
    this.loadStoredSessions();
    this.startHealthCheck();
    this.startCacheCleanup();

    this.$nextTick(() => {
      this.applyTheme(this.currentTheme);
    });
  },

  beforeDestroy() {
    this.cleanup();
    this.cancelAllPendingRequests();
    this.personas = [];
    this.selectedPersona = null;
    this.selectedCategory = null;
    this.pendingRequests.clear();
    this.personaMessageCache.clear();
    this.personaSessionMap = {};

    if (this.$refs.chatTab) {
      this.$refs.chatTab.resetToInitialState();
    }
    if (this.$refs.feedbackTab) {
      this.$refs.feedbackTab.resetForm();
    }
  }
};
</script>

<style>
@import './styles/aiChatOps.css';
@import './styles/customMarkdown.css';
</style>

<style scoped>
.ai-chatops-chat {
  position: fixed;
  bottom: var(--space-2xl);
  right: var(--space-2xl);
  z-index: 9999;
  font-family: var(--font-family);
}

.ai-chatops-chat-window {
  position: absolute;
  right: 0;
  bottom: calc(var(--layout-float-size) + 16px);
  width: var(--layout-chat-width);
  height: var(--layout-chat-height);
  background: rgba(255, 255, 255, 0.95);
  border: 1px solid var(--color-border-light);
  border-radius: 15px;
  box-shadow: var(--shadow-floating);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transition: all var(--motion-normal);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  transform: translateZ(0);
  backface-visibility: hidden;
  will-change: transform, opacity;
}

/* 시스템 관리 페이지 전체 화면 모드 */
.ai-chatops-chat-window.system-admin-mode {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100vw;
  height: 100vh;
  border-radius: 0;
  border: none;
  background: #f8fafc;
  z-index: 10000;
}

.ai-chatops-chat-window.minimized {
  height: var(--layout-header-height);
}

.ai-chatops-chat-window.maximized {
  width: min(810px, 85vw);
  height: min(750px, 90vh);
  bottom: calc(var(--layout-float-size) + 24px);
  right: 24px;
}

.chat-header {
  background: var(--color-header-bg);
  padding: var(--space-md) var(--space-lg);
  border-bottom: 1px solid var(--color-border-light);
  display: flex;
  justify-content: space-between;
  align-items: center;
  min-height: var(--layout-header-height);
  position: relative;
  z-index: 10;
}

.chat-header::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: var(--space-lg);
  right: var(--space-lg);
  height: 1px;
  background: linear-gradient(90deg, transparent 0%, var(--color-header-accent) 50%, transparent 100%);
  opacity: 0.6;
}

.bot-info {
  display: flex;
  align-items: center;
  gap: var(--space-md);
}

.avatar {
  width: 36px;
  height: 36px;
  background: var(--color-header-accent);
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: var(--shadow-soft);
  position: relative;
}

.avatar::before {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at 25% 25%, rgba(255, 255, 255, 0.4) 0%, transparent 70%);
  border-radius: var(--radius-full);
}

.details .name {
  font-size: var(--font-size-base);
  font-weight: 500;
  color: var(--color-header-text);
  margin-bottom: 2px;
  letter-spacing: -0.01em;
}

.status {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: var(--font-size-sm);
  color: var(--color-header-text-secondary);
  font-weight: 400;
}

.status-dot {
  width: 6px;
  height: 6px;
  background: var(--color-success);
  border-radius: var(--radius-full);
  box-shadow: 0 0 8px var(--color-success);
  animation: pulse 2s infinite;
}

.status.offline .status-dot {
  background: var(--color-error);
  box-shadow: 0 0 8px var(--color-error);
  animation: none;
}

.actions {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
}

.easter-egg-trigger {
  opacity: 0.3;
  width: 1px;
  height: 1px;
  border-radius: 50%;
  background: var(--color-text-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border: none;
  box-shadow: none;
  position: relative;
}

.easter-egg-trigger:hover {
  opacity: 0.5;
  transform: scale(1.5);
}

.theme-selector .theme-indicator {
  font-size: var(--font-size-xs);
  font-weight: 600;
}

.system-admin-btn {
  background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
  color: white;
  border: none;
}

.system-admin-btn:hover {
  background: linear-gradient(135deg, #b91c1c 0%, #991b1b 100%);
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(220, 38, 38, 0.3);
}

.language-btn span {
  font-size: var(--font-size-xs);
  font-weight: 600;
}

.window-controls {
  display: flex;
  gap: 4px;
}

.content {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

/* 시스템 관리 모드에서 content가 전체 공간 사용 */
.system-admin-mode .content {
  height: 100vh;
}

.category-select {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--color-surface-light);
  overflow: hidden;
}

.welcome-section {
  text-align: center;
  padding: var(--space-lg) var(--space-xl) var(--space-md);
  flex-shrink: 0;
}

.welcome-content h3 {
  font-size: var(--font-size-lg);
  font-weight: 600;
  color: var(--color-text-primary);
  margin: var(--space-md) 0 var(--space-sm) 0;
  letter-spacing: -0.01em;
  line-height: 1.4;
}

.welcome-content p {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  margin: 0;
  line-height: 1.5;
  padding: 0 var(--space-md);
}

.category-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 0 var(--space-xl) var(--space-lg);
  min-height: 0;
  overflow: hidden;
}

.category-grid {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
  margin-bottom: var(--space-lg);
  overflow-y: auto;
}

.category-grid .category-card:first-child {
  margin-top: 3px;
}

.category-card {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  min-height: 64px;
  padding: var(--space-md);
  cursor: pointer;
  transition: all var(--motion-fast);
  background: var(--color-card-bg);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-card-enhanced);
  border: 1px solid var(--color-border-light);
}

.category-card:hover:not(.disabled) {
  transform: translateY(-2px);
  box-shadow:
    0 4px 16px rgba(0, 0, 0, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.3);
}

.category-card.disabled {
  opacity: 0.6;
  cursor: not-allowed;
  pointer-events: none;
}

.category-icon {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  position: relative;
  overflow: hidden;
  transition: transform var(--motion-fast);
}

.category-icon--personal {
  background: var(--color-primary);
}

.category-icon--general {
  background: var(--color-primary-dark);
}

.category-icon--operation {
  background: var(--color-accent);
}

.category-icon--systemAdmin {
  background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
}

.category-icon::before {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.3) 0%, transparent 60%);
  border-radius: var(--radius-md);
}

.category-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 2px;
}

.category-content h4 {
  font-size: var(--font-size-base);
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0;
  line-height: 1.2;
}

.category-content p {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  margin: 0;
  line-height: 1.4;
}

.category-arrow {
  color: var(--color-text-muted);
  display: flex;
  align-items: center;
  transition: all var(--motion-fast);
}

.category-card:hover:not(.disabled) .category-arrow {
  color: var(--color-primary);
  transform: translateX(2px);
}

.category-card:hover:not(.disabled) .category-icon {
  transform: scale(1.05);
}

.feedback-section {
  padding-top: var(--space-md);
  border-top: 1px solid var(--color-border-light);
  text-align: center;
  flex-shrink: 0;
}

.persona-list-tab {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--color-surface-light);
  overflow: hidden;
}

.persona-header {
  padding: var(--space-lg) var(--space-xl) var(--space-md);
  background: var(--color-surface-light);
  border-bottom: 1px solid var(--color-border-light);
  flex-shrink: 0;
}

.header-content {
  text-align: center;
}

.category-badge {
  display: inline-flex;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-sm) var(--space-lg);
  border-radius: 20px;
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: white;
  margin-bottom: var(--space-md);
  box-shadow: var(--shadow-soft);
  background: var(--color-primary);
}

.header-content h3 {
  font-size: var(--font-size-lg);
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0;
  letter-spacing: -0.01em;
}

.persona-content {
  flex: 1;
  overflow-y: auto;
  padding: var(--space-md) var(--space-xl) var(--space-lg);
  min-height: 0;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  gap: var(--space-lg);
  color: var(--color-text-secondary);
  font-size: var(--font-size-base);
  font-weight: 500;
}

.no-personas {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  text-align: center;
  gap: var(--space-lg);
}

.no-personas h4 {
  font-size: var(--font-size-lg);
  font-weight: 500;
  color: var(--color-text-primary);
  margin: 0;
}

.no-personas p {
  font-size: var(--font-size-base);
  color: var(--color-text-muted);
  margin: 0;
  line-height: 1.5;
}

.persona-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--space-md);
}

.persona-card {
  display: flex;
  align-items: center;
  min-height: 80px;
  max-height: 80px;
  padding: var(--space-md);
  cursor: pointer;
  transition: all var(--motion-fast);
  background: var(--color-card-bg);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-card-enhanced);
  border: 1px solid var(--color-border-light);
}

.persona-card:hover:not(.disabled) {
  transform: translateY(-2px);
  box-shadow:
    0 4px 16px rgba(0, 0, 0, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.25);
}

.persona-card.disabled {
  opacity: 0.6;
  cursor: not-allowed;
  pointer-events: none;
}

.persona-card-content {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  height: 100%;
}

.persona-icon {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  position: relative;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
  transition: transform var(--motion-fast);
}

.persona-icon::before {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.3) 0%, transparent 60%);
  border-radius: var(--radius-lg);
}

.persona-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 2px;
  min-width: 0;
}

.persona-title {
  font-size: var(--font-size-base);
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0;
  line-height: 1.2;
  letter-spacing: -0.01em;
}

.persona-description {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  margin: 0;
  line-height: 1.3;

  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  word-break: break-word;
  hyphens: auto;
}

.persona-arrow {
  color: var(--color-text-muted);
  display: flex;
  align-items: center;
  flex-shrink: 0;
  transition: all var(--motion-fast);
}

.persona-card:hover:not(.disabled) .persona-arrow {
  color: var(--color-primary);
  transform: translateX(2px);
}

.persona-card:hover:not(.disabled) .persona-icon {
  transform: scale(1.05);
}

/* Floating chatbot button */
.ai-chatops-chat-button {
  width: var(--layout-float-size);
  height: var(--layout-float-size);
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%);
  border: none;
  /* Remove border */
  border-radius: var(--radius-full);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: var(--shadow-floating);
  transition: all var(--motion-normal);
  position: relative;
  overflow: hidden;
  color: var(--color-surface-white);

  transform: translateZ(0);
  backface-visibility: hidden;
  will-change: transform;
}

.ai-chatops-chat-button .lucide-icon {
  color: var(--color-surface-white);
  fill: var(--color-surface-white);
  transform: translateZ(0);
  backface-visibility: hidden;
}

.ai-chatops-chat-button.is-active {
  transform: scale(0.95) translateZ(0);
  background: linear-gradient(135deg, var(--color-accent) 0%, #0891b2 100%);
  box-shadow: var(--shadow-soft);
}

.ai-chatops-chat-button.is-active .lucide-icon {
  color: var(--color-surface-white);
  fill: var(--color-surface-white);
}

.ai-chatops-chat-button:hover {
  transform: scale(1.05) translateZ(0);
  box-shadow: var(--shadow-floating), 0 0 20px rgba(37, 99, 235, 0.3);
}

@keyframes pulse {

  0%,
  100% {
    opacity: 1;
    transform: scale(1);
  }

  50% {
    opacity: 0.8;
    transform: scale(1.05);
  }
}

@media (max-width: 640px) {

  .category-select,
  .persona-list-tab {
    padding: 0;
  }

  .welcome-section {
    padding: var(--space-md) var(--space-lg) var(--space-sm);
  }

  .category-container {
    padding: 0 var(--space-lg) var(--space-md);
  }

  .persona-content {
    padding: var(--space-sm) var(--space-lg) var(--space-md);
  }

  .category-card,
  .persona-card {
    padding: var(--space-sm);
    gap: var(--space-sm);
    min-height: 60px;
  }

  .persona-card {
    max-height: 60px;
  }

  .category-icon,
  .persona-icon {
    width: 36px;
    height: 36px;
  }

  .category-content h4,
  .persona-title {
    font-size: var(--font-size-sm);
  }

  .category-content p,
  .persona-description {
    font-size: var(--font-size-xs);
  }

  .ai-chatops-chat {
    bottom: 16px;
    right: 16px;
  }

  .ai-chatops-chat-window {
    width: calc(100vw - 32px);
    height: calc(100vh - 100px);
    max-width: none;
    max-height: none;
  }
}
</style>