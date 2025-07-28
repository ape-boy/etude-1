<template>
  <div class="admin-stats-page">
    <!-- Header -->
    <header class="admin-header">
      <div class="header-content">
        <h1>ChatOps 통계 분석</h1>
        <p>LLM 기반 운영 통계 및 인사이트</p>
      </div>
      <div class="header-actions">
        <button @click="refreshAnalysis" :disabled="isLoading" class="btn-system btn-system--primary btn-system--sm">
          <span v-if="isLoading">분석중...</span>
          <span v-else>분석 새로고침</span>
        </button>
      </div>
    </header>

    <!-- Analysis Controls -->
    <section class="analysis-controls">
      <div class="control-row">
        <div class="control-group">
          <label>분석 기간</label>
          <select v-model="analysisConfig.period" @change="updateAnalysis">
            <option value="today">오늘</option>
            <option value="7days">최근 7일</option>
            <option value="30days">최근 30일</option>
            <option value="90days">최근 90일</option>
            <option value="all">전체 기간</option>
          </select>
        </div>
        <div class="control-group">
          <label>대상 페르소나</label>
          <select v-model="analysisConfig.personaCode" @change="updateAnalysis">
            <option value="">전체 페르소나</option>
            <option v-for="persona in personas" :key="persona.personaCode" :value="persona.personaCode">
              {{ persona.title }} ({{ persona.personaCode }})
            </option>
          </select>
        </div>
        <div class="control-group">
          <label>분석 유형</label>
          <select v-model="analysisConfig.analysisType" @change="updateAnalysis">
            <option value="comprehensive">종합 분석</option>
            <option value="performance">성능 분석</option>
            <option value="usage">사용 패턴</option>
            <option value="quality">품질 분석</option>
          </select>
        </div>
      </div>
    </section>

    <!-- Analysis Results -->
    <section class="analysis-results">
      <div class="analysis-header">
        <h3>
          <span class="analysis-icon">🤖</span>
          AI 분석 결과
          <span v-if="analysisMetadata.generatedAt" class="analysis-time">
            ({{ formatDateTime(analysisMetadata.generatedAt) }})
          </span>
        </h3>
        <div class="analysis-metadata" v-if="analysisMetadata.processingTimeMs">
          <span class="processing-time">처리시간: {{ analysisMetadata.processingTimeMs }}ms</span>
          <span v-if="analysisMetadata.totalConversations" class="data-count">
            분석 대상: {{ formatNumber(analysisMetadata.totalConversations) }}개 대화
          </span>
        </div>
      </div>

      <div class="analysis-content">
        <!-- Loading State -->
        <div v-if="isLoading" class="loading-analysis">
          <div class="loading-spinner"></div>
          <div class="loading-text">
            <p>AI가 데이터를 분석하고 있습니다...</p>
            <p class="loading-subtitle">잠시만 기다려주세요</p>
          </div>
        </div>

        <!-- Analysis Display -->
        <div v-else-if="analysisResult" class="analysis-display">
          <div class="analysis-text" v-html="formattedAnalysisResult"></div>
        </div>

        <!-- No Data State -->
        <div v-else class="no-analysis">
          <div class="no-analysis-icon">📊</div>
          <h4>분석할 데이터가 없습니다</h4>
          <p>선택한 기간과 조건에 맞는 대화 데이터가 없습니다.</p>
          <p>다른 기간이나 페르소나를 선택해보세요.</p>
        </div>

        <!-- Error State -->
        <div v-if="analysisError" class="analysis-error">
          <div class="error-icon">⚠️</div>
          <h4>분석 중 오류가 발생했습니다</h4>
          <p>{{ analysisError }}</p>
          <button @click="retryAnalysis" class="btn-system btn-system--secondary btn-system--sm">
            다시 시도
          </button>
        </div>
      </div>
    </section>

    <!-- Quick Stats Cards -->
    <section class="quick-stats" v-if="quickStats && !isLoading">
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon">💬</div>
          <div class="stat-content">
            <div class="stat-value">{{ formatNumber(quickStats.totalConversations) }}</div>
            <div class="stat-label">총 대화수</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">👥</div>
          <div class="stat-content">
            <div class="stat-value">{{ formatNumber(quickStats.uniqueUsers) }}</div>
            <div class="stat-label">활성 사용자</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">⚡</div>
          <div class="stat-content">
            <div class="stat-value">{{ quickStats.avgResponseTime }}</div>
            <div class="stat-label">평균 응답시간</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">📈</div>
          <div class="stat-content">
            <div class="stat-value">{{ quickStats.successRate }}%</div>
            <div class="stat-label">성공률</div>
          </div>
        </div>
      </div>
    </section>

    <!-- Export Options -->
    <section class="export-options" v-if="analysisResult && !isLoading">
      <div class="export-header">
        <h4>결과 내보내기</h4>
      </div>
      <div class="export-actions">
        <button @click="exportAsText" class="btn-system btn-system--ghost btn-system--sm">
          📄 텍스트 파일
        </button>
        <button @click="exportAsMarkdown" class="btn-system btn-system--ghost btn-system--sm">
          📝 마크다운 파일
        </button>
        <button @click="copyToClipboard" class="btn-system btn-system--ghost btn-system--sm">
          📋 클립보드 복사
        </button>
      </div>
    </section>
  </div>
</template>

<script>
import aiChatOpsAdminService from './aiChatOpsAdminService.js';

export default {
  name: 'AIChatOpsAdminStats',

  data() {
    return {
      isLoading: false,
      analysisResult: null,
      analysisError: null,
      
      analysisConfig: {
        period: '30days',
        personaCode: '',
        analysisType: 'comprehensive'
      },
      
      analysisMetadata: {
        generatedAt: null,
        processingTimeMs: null,
        totalConversations: null,
        uniqueUsers: null
      },
      
      quickStats: null,
      personas: [],
      
      retryCount: 0,
      maxRetries: 3
    };
  },

  computed: {
    formattedAnalysisResult() {
      if (!this.analysisResult) return '';
      
      // Convert markdown-like formatting to HTML for better display
      return this.formatMarkdownToHtml(this.analysisResult);
    }
  },

  methods: {
    async loadPersonas() {
      try {
        const response = await aiChatOpsAdminService.getAllPersonasWithPrompts();
        if (response.success) {
          this.personas = response.data || [];
        }
      } catch (error) {
        console.error('Failed to load personas:', error);
      }
    },

    async updateAnalysis() {
      this.retryCount = 0;
      await this.performAnalysis();
    },

    async refreshAnalysis() {
      this.retryCount = 0;
      await this.performAnalysis();
    },

    async retryAnalysis() {
      if (this.retryCount < this.maxRetries) {
        this.retryCount++;
        await this.performAnalysis();
      } else {
        this.analysisError = '최대 재시도 횟수를 초과했습니다. 나중에 다시 시도해주세요.';
      }
    },

    async performAnalysis() {
      this.isLoading = true;
      this.analysisError = null;
      
      const startTime = Date.now();
      
      try {
        const response = await aiChatOpsAdminService.getConversationStats(
          this.analysisConfig.personaCode,
          this.analysisConfig.period
        );
        
        const processingTime = Date.now() - startTime;
        
        if (response.success) {
          this.analysisResult = response.data;
          this.analysisMetadata = {
            generatedAt: new Date().toISOString(),
            processingTimeMs: processingTime,
            totalConversations: this.extractStatFromResult('총 대화'),
            uniqueUsers: this.extractStatFromResult('활성 사용자')
          };
          
          // Extract quick stats from analysis result
          this.extractQuickStats();
          
        } else {
          this.analysisError = response.errorMessage || '분석을 수행할 수 없습니다.';
        }
        
      } catch (error) {
        this.analysisError = `분석 중 오류가 발생했습니다: ${error.message}`;
        console.error('Analysis failed:', error);
      } finally {
        this.isLoading = false;
      }
    },

    extractStatFromResult(statName) {
      if (!this.analysisResult) return null;
      
      const regex = new RegExp(`${statName}[^\\d]*(\\d+(?:,\\d+)*)`, 'i');
      const match = this.analysisResult.match(regex);
      
      if (match) {
        return parseInt(match[1].replace(/,/g, ''));
      }
      return null;
    },

    extractQuickStats() {
      if (!this.analysisResult) return;
      
      this.quickStats = {
        totalConversations: this.extractStatFromResult('총 대화') || 0,
        uniqueUsers: this.extractStatFromResult('활성 사용자') || 0,
        avgResponseTime: this.extractResponseTime() || '-',
        successRate: this.extractSuccessRate() || 0
      };
    },

    extractResponseTime() {
      if (!this.analysisResult) return null;
      
      const patterns = [
        /평균 응답[^\d]*([\d.]+)\s*초/i,
        /응답 시간[^\d]*([\d.]+)\s*초/i,
        /response time[^\d]*([\d.]+)\s*s/i
      ];
      
      for (const pattern of patterns) {
        const match = this.analysisResult.match(pattern);
        if (match) {
          return `${match[1]}초`;
        }
      }
      return null;
    },

    extractSuccessRate() {
      if (!this.analysisResult) return null;
      
      const patterns = [
        /성공률[^\d]*([\d.]+)\s*%/i,
        /만족도[^\d]*([\d.]+)\s*%/i,
        /success rate[^\d]*([\d.]+)\s*%/i
      ];
      
      for (const pattern of patterns) {
        const match = this.analysisResult.match(pattern);
        if (match) {
          return parseFloat(match[1]);
        }
      }
      return null;
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
    },

    async exportAsText() {
      if (!this.analysisResult) return;
      
      const filename = `chatops-analysis-${this.analysisConfig.period}-${Date.now()}.txt`;
      this.downloadFile(this.analysisResult, filename, 'text/plain');
    },

    async exportAsMarkdown() {
      if (!this.analysisResult) return;
      
      const content = `# ChatOps 분석 결과

**분석 기간**: ${this.analysisConfig.period}
**대상 페르소나**: ${this.analysisConfig.personaCode || '전체'}
**생성 시간**: ${this.formatDateTime(this.analysisMetadata.generatedAt)}

---

${this.analysisResult}
`;
      
      const filename = `chatops-analysis-${this.analysisConfig.period}-${Date.now()}.md`;
      this.downloadFile(content, filename, 'text/markdown');
    },

    async copyToClipboard() {
      if (!this.analysisResult) return;
      
      try {
        await navigator.clipboard.writeText(this.analysisResult);
        this.showMessage('분석 결과가 클립보드에 복사되었습니다.');
      } catch (error) {
        console.error('Failed to copy to clipboard:', error);
        this.showError('클립보드 복사에 실패했습니다.');
      }
    },

    downloadFile(content, filename, mimeType) {
      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(url);
    },

    formatNumber(num) {
      if (!num && num !== 0) return '0';
      return new Intl.NumberFormat('ko-KR').format(num);
    },

    formatDateTime(dateStr) {
      if (!dateStr) return '-';
      const date = new Date(dateStr);
      return date.toLocaleString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    },

    showMessage(message) {
      // Simple message display - could be enhanced with a proper toast system
      alert('✅ ' + message);
    },

    showError(message) {
      alert('❌ ' + message);
    }
  },

  async mounted() {
    await this.loadPersonas();
    await this.performAnalysis();
  }
};
</script>

<style scoped>
.admin-stats-page {
  display: flex;
  flex-direction: column;
  height: 100vh;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background-color: #f8f9fa;
  color: #333;
}

/* Header */
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

/* Analysis Controls */
.analysis-controls {
  padding: 16px 20px;
  background: white;
  border-bottom: 1px solid #e2e8f0;
  flex-shrink: 0;
}

.control-row {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  align-items: end;
}

.control-group {
  display: flex;
  flex-direction: column;
  min-width: 150px;
}

.control-group label {
  font-size: 11px;
  font-weight: 500;
  color: #374151;
  margin-bottom: 4px;
}

.control-group select {
  padding: 6px 8px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  font-size: 12px;
  background: white;
}

.control-group select:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
}

/* Analysis Results */
.analysis-results {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: white;
  margin: 8px 20px;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
  overflow: hidden;
}

.analysis-header {
  padding: 16px 20px;
  border-bottom: 1px solid #e2e8f0;
  background: #f8fafc;
}

.analysis-header h3 {
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
}

.analysis-icon {
  font-size: 18px;
}

.analysis-time {
  font-size: 11px;
  color: #64748b;
  font-weight: normal;
}

.analysis-metadata {
  display: flex;
  gap: 16px;
  font-size: 11px;
  color: #64748b;
}

.processing-time, .data-count {
  padding: 2px 6px;
  background: #e0f2fe;
  border-radius: 3px;
}

.analysis-content {
  flex: 1;
  overflow: auto;
}

/* Loading Analysis */
.loading-analysis {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  gap: 16px;
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #e2e8f0;
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.loading-text {
  text-align: center;
}

.loading-text p {
  margin: 0;
  font-size: 14px;
  color: #374151;
}

.loading-subtitle {
  font-size: 12px !important;
  color: #64748b !important;
  margin-top: 4px !important;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Analysis Display */
.analysis-display {
  padding: 20px;
}

.analysis-text {
  line-height: 1.6;
  font-size: 13px;
  color: #374151;
}

.analysis-text h1 {
  font-size: 18px;
  margin: 24px 0 12px 0;
  color: #1f2937;
  border-bottom: 2px solid #e5e7eb;
  padding-bottom: 8px;
}

.analysis-text h2 {
  font-size: 16px;
  margin: 20px 0 10px 0;
  color: #374151;
}

.analysis-text h3 {
  font-size: 14px;
  margin: 16px 0 8px 0;
  color: #4b5563;
}

.analysis-text ul {
  margin: 8px 0;
  padding-left: 20px;
}

.analysis-text li {
  margin: 4px 0;
}

.analysis-text pre {
  background: #f3f4f6;
  padding: 12px;
  border-radius: 4px;
  overflow-x: auto;
  font-size: 12px;
}

.analysis-text code {
  background: #f3f4f6;
  padding: 2px 4px;
  border-radius: 2px;
  font-size: 12px;
}

.analysis-text strong {
  font-weight: 600;
  color: #1f2937;
}

/* No Analysis State */
.no-analysis {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
}

.no-analysis-icon {
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.6;
}

.no-analysis h4 {
  margin: 0 0 8px 0;
  font-size: 16px;
  color: #374151;
}

.no-analysis p {
  margin: 4px 0;
  font-size: 13px;
  color: #64748b;
}

/* Error State */
.analysis-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  text-align: center;
}

.error-icon {
  font-size: 32px;
  margin-bottom: 12px;
}

.analysis-error h4 {
  margin: 0 0 8px 0;
  font-size: 14px;
  color: #dc2626;
}

.analysis-error p {
  margin: 0 0 16px 0;
  font-size: 12px;
  color: #64748b;
}

/* Quick Stats */
.quick-stats {
  margin: 8px 20px;
  background: white;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
  padding: 16px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border: 1px solid #f1f5f9;
  border-radius: 6px;
  background: #f8fafc;
}

.stat-icon {
  font-size: 24px;
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
}

.stat-label {
  font-size: 11px;
  color: #64748b;
  margin-top: 2px;
}

/* Export Options */
.export-options {
  margin: 8px 20px 20px 20px;
  background: white;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
  padding: 16px;
}

.export-header h4 {
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 600;
  color: #374151;
}

.export-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

/* Responsive */
@media (max-width: 768px) {
  .control-row {
    flex-direction: column;
  }
  
  .control-group {
    min-width: unset;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .export-actions {
    flex-direction: column;
  }
}

/* Button styles (if not already defined) */
.btn-system {
  padding: 6px 12px;
  border: 1px solid transparent;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

.btn-system--primary {
  background: #3b82f6;
  color: white;
  border-color: #3b82f6;
}

.btn-system--primary:hover:not(:disabled) {
  background: #2563eb;
  border-color: #2563eb;
}

.btn-system--secondary {
  background: #64748b;
  color: white;
  border-color: #64748b;
}

.btn-system--secondary:hover:not(:disabled) {
  background: #475569;
  border-color: #475569;
}

.btn-system--ghost {
  background: transparent;
  color: #64748b;
  border-color: #d1d5db;
}

.btn-system--ghost:hover:not(:disabled) {
  background: #f8fafc;
  color: #374151;
}

.btn-system--sm {
  padding: 4px 8px;
  font-size: 11px;
}

.btn-system:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>