<template>
  <div class="admin-conversation-page">
    <!-- 헤더 -->
    <header class="admin-header">
      <div class="header-content">
        <h1>대화 분석</h1>
        <p>사용자 대화 내역 및 운영 통계</p>
      </div>
      <div class="header-actions">
        <button @click="refreshData" :disabled="isLoading" class="btn-system btn-system--primary btn-system--sm">
          <span v-if="isLoading">새로고침중...</span>
          <span v-else>새로고침</span>
        </button>
      </div>
    </header>

    <!-- 통계 요약 -->
    <section class="stats-summary">
      <div class="summary-header">
        <h3>운영 통계</h3>
      </div>
      <div class="summary-content">
        <div v-if="isLoadingStats" class="loading">
          <div class="loading-spinner"></div>
          <span>통계를 불러오는 중...</span>
        </div>
        <div v-else-if="statsSummary" class="stats-text" v-html="formattedStatsSummary">
        </div>
        <div v-else class="no-stats">
          통계 데이터가 없습니다.
        </div>
      </div>
    </section>

    <!-- 필터 및 검색 -->
    <section class="filters">
      <div class="filter-row">
        <div class="filter-group">
          <label>페르소나</label>
          <select v-model="filters.personaCode" @change="applyFilters">
            <option value="">전체</option>
            <option v-for="persona in personas" :key="persona.personaCode" :value="persona.personaCode">
              {{ persona.title }} ({{ persona.personaCode }})
            </option>
          </select>
        </div>
        <div class="filter-group">
          <label>사용자ID</label>
          <input v-model="filters.userId" @input="debouncedFilter" placeholder="사용자 ID">
        </div>
        <div class="filter-group">
          <label>시작일</label>
          <input v-model="filters.startDate" @change="applyFilters" type="date">
        </div>
        <div class="filter-group">
          <label>종료일</label>
          <input v-model="filters.endDate" @change="applyFilters" type="date">
        </div>
        <div class="filter-group">
          <label>페이지 크기</label>
          <select v-model="filters.pageSize" @change="applyFilters">
            <option value="10">10개</option>
            <option value="20">20개</option>
            <option value="50">50개</option>
            <option value="100">100개</option>
          </select>
        </div>
      </div>
    </section>

    <!-- 대화 내역 테이블 -->
    <section class="conversations-table">
      <div class="table-header">
        <h3>대화 내역</h3>
        <div class="table-info">
          총 {{ formatNumber(conversationPage.totalElements) }}개
          ({{ conversationPage.currentPage + 1 }} / {{ conversationPage.totalPages }} 페이지)
        </div>
      </div>

      <div v-if="isLoadingConversations" class="loading">
        <div class="loading-spinner"></div>
        <span>대화 내역을 불러오는 중...</span>
      </div>

      <div v-else class="table-container">
        <table class="conversations-data-table">
          <thead>
            <tr>
              <th>시간</th>
              <th>페르소나</th>
              <th>사용자ID</th>
              <th>질문</th>
              <th>답변</th>
              <th>응답시간</th>
              <th>상태</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="conversation in conversationPage.conversations" :key="conversation.id">
              <td class="datetime">{{ formatDateTime(conversation.createdDate) }}</td>
              <td class="persona">
                <span class="persona-badge">{{ conversation.personaCode }}</span>
              </td>
              <td class="user-id">{{ conversation.userId || 'anonymous' }}</td>
              <td class="query">
                <div class="text-preview" :title="conversation.userQuery">
                  {{ truncateText(conversation.userQuery, 100) }}
                </div>
              </td>
              <td class="response">
                <div class="text-preview" :title="conversation.aiResponse">
                  {{ truncateText(conversation.aiResponse, 150) }}
                </div>
              </td>
              <td class="response-time">{{ formatTime(conversation.responseTime) }}</td>
              <td class="status">
                <span :class="['status-badge', conversation.success ? 'success' : 'error']">
                  {{ conversation.success ? '성공' : '실패' }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 페이지네이션 -->
      <div v-if="conversationPage.totalPages > 1" class="pagination">
        <button @click="goToPage(0)" :disabled="conversationPage.first" class="btn-system btn-system--ghost btn-system--sm">
          첫 페이지
        </button>
        <button @click="goToPage(currentPage - 1)" :disabled="!conversationPage.hasPrevious" class="btn-system btn-system--ghost btn-system--sm">
          이전
        </button>

        <div class="page-numbers">
          <button v-for="page in visiblePages" :key="page" @click="goToPage(page)"
            :class="['btn-system', 'btn-system--sm', page === currentPage ? 'btn-system--primary' : 'btn-system--ghost']">
            {{ page + 1 }}
          </button>
        </div>

        <button @click="goToPage(currentPage + 1)" :disabled="!conversationPage.hasNext" class="btn-system btn-system--ghost btn-system--sm">
          다음
        </button>
        <button @click="goToPage(conversationPage.totalPages - 1)" :disabled="conversationPage.last"
          class="btn-system btn-system--ghost btn-system--sm">
          마지막
        </button>
      </div>
    </section>
  </div>
</template>

<script>
import aiChatOpsAdminService from './aiChatOpsAdminService.js';

export default {
  name: 'AIChatOpsAdminConversation',

  data() {
    return {
      isLoading: false,
      isLoadingStats: false,
      isLoadingConversations: false,

      statsSummary: null,

      conversationPage: {
        conversations: [],
        currentPage: 0,
        totalPages: 0,
        totalElements: 0,
        first: true,
        last: true,
        hasNext: false,
        hasPrevious: false
      },

      personas: [],
      currentPage: 0,

      filters: {
        personaCode: '',
        userId: '',
        startDate: '',
        endDate: '',
        pageSize: '20'
      },

      filterTimeout: null
    };
  },

  computed: {
    visiblePages() {
      const total = this.conversationPage.totalPages;
      const current = this.currentPage;
      const pages = [];

      let start = Math.max(0, current - 2);
      let end = Math.min(total - 1, current + 2);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      return pages;
    },

    formattedStatsSummary() {
      if (!this.statsSummary) return '';
      
      // Format LLM-generated text for better display
      return this.formatMarkdownToHtml(this.statsSummary);
    }
  },

  methods: {
    async loadStatsSummary() {
      this.isLoadingStats = true;
      try {
        const response = await aiChatOpsAdminService.getConversationSummary(this.filters.personaCode);
        
        if (response.success) {
          this.statsSummary = response.data;
        } else {
          this.statsSummary = '통계 데이터를 불러올 수 없습니다.';
        }
      } catch (error) {
        this.statsSummary = '통계 로드 중 오류가 발생했습니다: ' + error.message;
      } finally {
        this.isLoadingStats = false;
      }
    },

    async loadConversations() {
      this.isLoadingConversations = true;
      try {
        const response = await aiChatOpsAdminService.getConversations({
          page: this.currentPage,
          size: parseInt(this.filters.pageSize),
          personaCode: this.filters.personaCode,
          userId: this.filters.userId,
          startDate: this.filters.startDate,
          endDate: this.filters.endDate
        });

        if (response.success) {
          this.conversationPage = response.data;
        } else {
          this.showError('대화 내역 로드 실패: ' + response.errorMessage);
        }
      } catch (error) {
        this.showError('대화 내역 로드 실패: ' + error.message);
      } finally {
        this.isLoadingConversations = false;
      }
    },

    async loadPersonas() {
      try {
        const response = await aiChatOpsAdminService.getAllPersonasWithPrompts();
        if (response.success) {
          this.personas = response.data || [];
        }
      } catch (error) {
        console.error('페르소나 로드 실패:', error);
      }
    },

    async refreshData() {
      this.isLoading = true;
      try {
        await Promise.all([
          this.loadStatsSummary(),
          this.loadConversations(),
          this.loadPersonas()
        ]);
      } finally {
        this.isLoading = false;
      }
    },

    applyFilters() {
      this.currentPage = 0;
      this.loadConversations();
      this.loadStatsSummary();
    },

    debouncedFilter() {
      clearTimeout(this.filterTimeout);
      this.filterTimeout = setTimeout(() => {
        this.applyFilters();
      }, 500);
    },

    goToPage(page) {
      this.currentPage = page;
      this.loadConversations();
    },

    formatNumber(num) {
      if (!num && num !== 0) return '0';
      return new Intl.NumberFormat('ko-KR').format(num);
    },

    formatTime(ms) {
      if (!ms && ms !== 0) return '-';
      if (ms < 1000) return ms + 'ms';
      return (ms / 1000).toFixed(1) + 's';
    },

    formatDateTime(dateStr) {
      if (!dateStr) return '-';
      const date = new Date(dateStr);
      return date.toLocaleString('ko-KR', {
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    },

    truncateText(text, maxLength) {
      if (!text) return '';
      if (text.length <= maxLength) return text;
      return text.substring(0, maxLength) + '...';
    },

    showError(message) {
      alert('❌ ' + message);
    },

    formatMarkdownToHtml(text) {
      if (!text) return '';
      
      return text
        // Headers
        .replace(/^### (.+)$/gm, '<h3>$1</h3>')
        .replace(/^## (.+)$/gm, '<h2>$1</h2>')
        .replace(/^# (.+)$/gm, '<h1>$1</h1>')
        
        // Bold and italic
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.+?)\*/g, '<em>$1</em>')
        
        // Lists
        .replace(/^- (.+)$/gm, '<li>$1</li>')
        .replace(/(<li>.*<\/li>)/gs, '<ul>$1</ul>')
        .replace(/^\d+\. (.+)$/gm, '<li>$1</li>')
        
        // Code blocks
        .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
        .replace(/`(.+?)`/g, '<code>$1</code>')
        
        // Line breaks
        .replace(/\n\n/g, '</p><p>')
        .replace(/\n/g, '<br>')
        
        // Wrap in paragraphs
        .replace(/^(.+)$/gm, '<p>$1</p>')
        
        // Clean up
        .replace(/<p><h([1-6])>/g, '<h$1>')
        .replace(/<\/h([1-6])><\/p>/g, '</h$1>')
        .replace(/<p><ul>/g, '<ul>')
        .replace(/<\/ul><\/p>/g, '</ul>')
        .replace(/<p><pre>/g, '<pre>')
        .replace(/<\/pre><\/p>/g, '</pre>');
    }
  },

  mounted() {
    this.refreshData();
  }
};
</script>

<style scoped>
.admin-conversation-page {
  display: flex;
  flex-direction: column;
  height: 100vh;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  font-size: 12px;
  background-color: #f8f9fa;
  color: #333;
}

/* 헤더 */
.admin-header {
  padding: 16px 20px;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: white;
  flex-shrink: 0;
}

.admin-header h1 {
  font-size: 18px;
  margin: 0;
  font-weight: 600;
}

.admin-header p {
  font-size: 12px;
  color: #64748b;
  margin: 2px 0 0 0;
}

/* 통계 요약 */
.stats-summary {
  padding: 16px 20px;
  background: white;
  border-bottom: 1px solid #e2e8f0;
  flex-shrink: 0;
}

.summary-header h3 {
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 600;
  color: #374151;
}

.summary-content {
  min-height: 60px;
  display: flex;
  align-items: center;
}

.stats-text {
  font-size: 13px;
  line-height: 1.5;
  color: #374151;
  background: #f8fafc;
  padding: 12px 16px;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
  width: 100%;
}

.stats-text h1, .stats-text h2, .stats-text h3 {
  margin: 12px 0 8px 0;
  color: #1f2937;
}

.stats-text h1 { font-size: 16px; }
.stats-text h2 { font-size: 15px; }
.stats-text h3 { font-size: 14px; }

.stats-text ul {
  margin: 8px 0;
  padding-left: 20px;
}

.stats-text li {
  margin: 2px 0;
}

.stats-text strong {
  font-weight: 600;
  color: #1f2937;
}

.stats-text code {
  background: #e5e7eb;
  padding: 1px 4px;
  border-radius: 2px;
  font-size: 12px;
}

.stats-text pre {
  background: #e5e7eb;
  padding: 8px;
  border-radius: 4px;
  overflow-x: auto;
  font-size: 12px;
  margin: 8px 0;
}

.no-stats {
  font-size: 12px;
  color: #64748b;
  font-style: italic;
}

/* 필터 */
.filters {
  padding: 16px 20px;
  background: white;
  border-bottom: 1px solid #e2e8f0;
  flex-shrink: 0;
}

.filter-row {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  align-items: end;
}

.filter-group {
  display: flex;
  flex-direction: column;
  min-width: 120px;
}

.filter-group label {
  font-size: 11px;
  font-weight: 500;
  color: #374151;
  margin-bottom: 4px;
}

.filter-group input,
.filter-group select {
  padding: 6px 8px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  font-size: 12px;
  background: white;
}

.filter-group input:focus,
.filter-group select:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
}

/* 대화 내역 테이블 */
.conversations-table {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: white;
  margin: 8px 20px 20px 20px;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
  overflow: hidden;
}

.table-header {
  padding: 12px 16px;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #f8fafc;
  flex-shrink: 0;
}

.table-header h3 {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
}

.table-info {
  font-size: 11px;
  color: #64748b;
}

.table-container {
  flex: 1;
  overflow: auto;
}

.conversations-data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 11px;
}

.conversations-data-table th,
.conversations-data-table td {
  padding: 8px 10px;
  text-align: left;
  border-bottom: 1px solid #f1f5f9;
}

.conversations-data-table th {
  background: #f8fafc;
  font-weight: 600;
  color: #374151;
  position: sticky;
  top: 0;
  z-index: 1;
}

.datetime {
  min-width: 80px;
  font-family: monospace;
  font-size: 10px;
}

.persona-badge {
  background: #e0f2fe;
  color: #0277bd;
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 10px;
  font-weight: 500;
}

.user-id {
  min-width: 80px;
  font-family: monospace;
  color: #64748b;
}

.text-preview {
  max-width: 200px;
  line-height: 1.3;
  cursor: pointer;
}

.response-time {
  min-width: 60px;
  font-family: monospace;
  text-align: right;
}

.status-badge {
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 10px;
  font-weight: 500;
}

.status-badge.success {
  background: #dcfce7;
  color: #166534;
}

.status-badge.error {
  background: #fee2e2;
  color: #991b1b;
}

/* 로딩 */
.loading {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
  gap: 12px;
  color: #64748b;
}

.loading-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid #e2e8f0;
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* 페이지네이션 */
.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 12px;
  border-top: 1px solid #e2e8f0;
  background: #f8fafc;
  gap: 8px;
  flex-wrap: wrap;
  flex-shrink: 0;
}

.page-numbers {
  display: flex;
  gap: 4px;
}

/* 반응형 */
@media (max-width: 1024px) {
  .filter-row {
    flex-direction: column;
    align-items: stretch;
  }

  .filter-group {
    min-width: unset;
  }
}
</style>