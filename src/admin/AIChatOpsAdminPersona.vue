<template>
  <div class="admin-persona-page">
    <!-- 상단 헤더 -->
    <header class="admin-header">
      <div class="header-content">
        <h1>페르소나 관리</h1>
        <p>페르소나 생성, 수정 및 시스템 프롬프트 관리</p>
      </div>
      <div class="header-actions">
        <button @click="refreshData" :disabled="isLoading" class="btn-refresh">
          <span v-if="isLoading">로딩중...</span>
          <span v-else>새로고침</span>
        </button>
      </div>
    </header>

    <!-- 페르소나 선택 -->
    <section class="persona-selector">
      <div class="selector-row">
        <div class="selector-group">
          <label>페르소나 선택</label>
          <select v-model="selectedPersonaCode" @change="onPersonaChange">
            <option value="">페르소나를 선택하세요</option>
            <option v-for="persona in personas" :key="persona.personaCode" :value="persona.personaCode">
              {{ persona.title }} ({{ persona.personaCode }})
            </option>
          </select>
        </div>
        <button @click="createNewPersona" class="btn-new">+ 새 페르소나</button>
      </div>
    </section>

    <!-- 메인 컨텐츠 -->
    <main class="admin-main">
      <!-- 페르소나 편집기 -->
      <div class="editor-panel">
        <div v-if="!selectedPersona && editMode !== 'create'" class="editor-placeholder">
          페르소나를 선택하거나 새 페르소나를 생성하세요.
        </div>
        <div v-else class="editor-content">
          <div class="editor-header">
            <h2>{{ editMode === 'create' ? '새 페르소나 생성' : '페르소나 편집' }}</h2>
            <div class="editor-actions">
              <button v-if="editMode !== 'create'" @click="deleteCurrentPersona" class="btn-delete"
                :disabled="isDeleting">
                {{ isDeleting ? '삭제중...' : '삭제' }}
              </button>
              <button @click="savePersona" :disabled="!canSave || isSaving" class="btn-save">
                {{ isSaving ? '저장중...' : '저장' }}
              </button>
              <button v-if="editMode !== 'view'" @click="cancelEdit" class="btn-cancel">
                취소
              </button>
            </div>
          </div>

          <div class="form-scroll-area">
            <section class="form-section">
              <h4>기본 정보</h4>
              <div class="form-grid">
                <div class="form-group">
                  <label>페르소나 코드 *</label>
                  <input v-model="editingPersona.personaCode" type="text" :readonly="editMode === 'edit'"
                    placeholder="영문, 숫자, 언더스코어만 사용">
                </div>
                <div class="form-group">
                  <label>카테고리 *</label>
                  <select v-model="editingPersona.category">
                    <option value="">선택하세요</option>
                    <option value="personal">Personal</option>
                    <option value="general">General</option>
                    <option value="operation">Operation</option>
                    <option value="extension">Extension</option>
                  </select>
                </div>
                <div class="form-group form-group-full">
                  <label>제목 (한글) *</label>
                  <input v-model="editingPersona.title" type="text">
                </div>
                <div class="form-group form-group-full">
                  <label>설명 (한글) *</label>
                  <textarea v-model="editingPersona.description" rows="2"></textarea>
                </div>
                <div class="form-group form-group-full">
                  <label>설명 (영문) *</label>
                  <textarea v-model="editingPersona.descriptionEn" rows="2"></textarea>
                </div>
                <div class="form-group form-group-full">
                  <label>환영 메시지 (마크다운 지원)</label>
                  <textarea v-model="editingPersona.welcomeMsg" rows="3"></textarea>
                </div>
              </div>
            </section>

            <section class="form-section">
              <h4>시스템 프롬프트</h4>
              <div class="prompt-editor">
                <textarea v-model="editingPersona.systemPrompt" rows="15" class="prompt-textarea"></textarea>
                <div class="char-count">{{ editingPersona.systemPrompt?.length || 0 }}자</div>
              </div>
            </section>

            <section class="form-section">
              <h4>프롬프트 테스트</h4>
              <div class="test-area">
                <textarea v-model="userPrompt" rows="3" placeholder="테스트할 메시지를 입력하세요..."></textarea>
                <button @click="testPrompt" :disabled="!canTest" class="btn-test">
                  {{ isTesting ? '테스트중...' : '테스트 실행' }}
                </button>
              </div>
            </section>
          </div>
        </div>
      </div>

      <!-- 오른쪽 패널: 테스트 결과 -->
      <div class="result-panel">
        <div class="result-header">
          <h3>테스트 결과</h3>
        </div>
        <div class="result-content">
          <div v-if="!lastResponse" class="result-placeholder">
            테스트 실행 버튼을 클릭하면 AI 응답이 여기에 표시됩니다.
          </div>
          <div v-else class="response-wrapper">
            <div class="response-meta">
              <span :class="['status', lastResponse.success ? 'success' : 'error']">
                {{ lastResponse.success ? '성공' : '실패' }}
              </span>
              <span class="time">{{ formatTimestamp(lastResponse.timestamp) }}</span>
            </div>
            <div class="response-body" v-html="lastResponse.formattedContent"></div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script>
import aiChatOpsAdminService from './aiChatOpsAdminService.js';

export default {
  name: 'AIChatOpsAdminPersona',

  data() {
    return {
      isLoading: false,
      isTesting: false,
      isSaving: false,
      isDeleting: false,

      personas: [],
      selectedPersonaCode: '',
      selectedPersona: null,

      editMode: 'view', // 'view', 'edit', 'create'
      editingPersona: {},
      originalPersona: null,

      userPrompt: '안녕하세요. 테스트 메시지입니다.',
      lastResponse: null
    };
  },

  computed: {
    canTest() {
      return this.selectedPersona &&
        this.editingPersona.systemPrompt &&
        this.editingPersona.systemPrompt.trim() &&
        this.userPrompt.trim() &&
        !this.isTesting;
    },

    canSave() {
      if (this.editMode === 'view') return false;
      if (this.isSaving) return false;

      const p = this.editingPersona;
      if (!p.personaCode || !p.title || !p.description || !p.descriptionEn || !p.category) {
        return false;
      }
      if (!/^[a-zA-Z0-9_]+$/.test(p.personaCode)) {
        return false;
      }

      if (this.editMode === 'edit') {
        return JSON.stringify(this.editingPersona) !== JSON.stringify(this.originalPersona);
      }

      return true;
    }
  },

  methods: {
    async loadPersonas() {
      this.isLoading = true;
      try {
        const response = await aiChatOpsAdminService.getAllPersonasWithPrompts();
        if (response.success) {
          this.personas = (response.data || []).sort((a, b) => a.title.localeCompare(b.title));
        } else {
          this.showError('페르소나 로드 실패: ' + response.errorMessage);
        }
      } catch (error) {
        this.showError('페르소나 로드 중 오류 발생');
      } finally {
        this.isLoading = false;
      }
    },

    onPersonaSelect(personaCode) {
      if (this.editMode === 'edit' && JSON.stringify(this.editingPersona) !== JSON.stringify(this.originalPersona)) {
        if (!confirm('저장되지 않은 변경사항이 있습니다. 정말로 이동하시겠습니까?')) {
          return;
        }
      }
      this.selectedPersonaCode = personaCode;
      this.selectedPersona = this.personas.find(p => p.personaCode === personaCode);
      if (this.selectedPersona) {
        this.loadPersonaData(this.selectedPersona);
        this.editMode = 'edit';
      }
      this.lastResponse = null;
    },

    onPersonaChange() {
      if (this.selectedPersonaCode) {
        this.onPersonaSelect(this.selectedPersonaCode);
      } else {
        this.selectedPersona = null;
        this.editingPersona = {};
        this.editMode = 'view';
        this.lastResponse = null;
      }
    },

    loadPersonaData(persona) {
      this.editingPersona = JSON.parse(JSON.stringify(persona));
      this.originalPersona = JSON.parse(JSON.stringify(persona));
    },

    clearEditingData() {
      return {
        personaCode: '',
        title: '',
        description: '',
        descriptionEn: '',
        category: '',
        welcomeMsg: '',
        systemPrompt: this.getDefaultSystemPrompt(),
      };
    },

    createNewPersona() {
      if (this.editMode === 'edit' && JSON.stringify(this.editingPersona) !== JSON.stringify(this.originalPersona)) {
        if (!confirm('저장되지 않은 변경사항이 있습니다. 정말로 이동하시겠습니까?')) {
          return;
        }
      }
      this.selectedPersonaCode = '';
      this.selectedPersona = null;
      this.editingPersona = this.clearEditingData();
      this.originalPersona = null;
      this.editMode = 'create';
      this.lastResponse = null;
    },

    cancelEdit() {
      if (this.editMode === 'create') {
        this.selectedPersonaCode = '';
        this.selectedPersona = null;
        this.editingPersona = {};
        this.editMode = 'view';
      } else if (this.editMode === 'edit') {
        this.loadPersonaData(this.originalPersona);
      }
    },

    async testPrompt() {
      if (!this.canTest) return;

      this.isTesting = true;
      this.lastResponse = null;
      try {
        const response = await aiChatOpsAdminService.testSystemPrompt({
          promptContent: this.editingPersona.systemPrompt,
          testInput: this.userPrompt,
          personaCode: this.editingPersona.personaCode
        });

        const result = {
          timestamp: new Date(),
          success: response.success,
          content: response.data || response.message,
          formattedContent: ''
        };

        if (response.success && response.data) {
          result.formattedContent = await aiChatOpsAdminService.formatContentMarkdown(response.data);
        } else {
          result.formattedContent = this.escapeHtml(result.content);
        }
        this.lastResponse = result;

      } catch (error) {
        this.lastResponse = {
          timestamp: new Date(),
          success: false,
          content: '테스트 중 오류 발생: ' + error.message,
          formattedContent: this.escapeHtml('테스트 중 오류 발생: ' + error.message)
        };
      } finally {
        this.isTesting = false;
      }
    },

    async savePersona() {
      if (!this.canSave) return;

      this.isSaving = true;
      try {
        let response;
        if (this.editMode === 'create') {
          if (this.personas.some(p => p.personaCode === this.editingPersona.personaCode)) {
            this.showError('이미 존재하는 페르소나 코드입니다.');
            this.isSaving = false;
            return;
          }
          response = await aiChatOpsAdminService.createPersona(this.editingPersona);
          if (response.success) {
            await this.loadPersonas();
            this.onPersonaSelect(response.data.personaCode);
            this.showSuccess('페르소나가 생성되었습니다.');
          }
        } else if (this.editMode === 'edit') {
          response = await aiChatOpsAdminService.updatePersona(this.editingPersona);
          if (response.success) {
            const index = this.personas.findIndex(p => p.personaCode === this.editingPersona.personaCode);
            if (index !== -1) {
              this.personas.splice(index, 1, response.data);
            }
            this.loadPersonaData(response.data);
            this.showSuccess('페르소나가 수정되었습니다.');
          }
        }

        if (response && !response.success) {
          this.showError('저장 실패: ' + response.errorMessage);
        }
      } catch (error) {
        this.showError('저장 중 오류 발생: ' + error.message);
      } finally {
        this.isSaving = false;
      }
    },

    async deleteCurrentPersona() {
      if (!this.selectedPersona) return;

      if (!confirm(`정말로 '${this.selectedPersona.title}' 페르소나를 삭제하시겠습니까?`)) {
        return;
      }

      this.isDeleting = true;
      try {
        const response = await aiChatOpsAdminService.deletePersona(this.selectedPersona.personaCode);
        if (response.success) {
          this.selectedPersonaCode = '';
          this.selectedPersona = null;
          this.editingPersona = {};
          this.editMode = 'view';
          await this.loadPersonas();
          this.showSuccess('페르소나가 삭제되었습니다.');
        } else {
          this.showError('삭제 실패: ' + response.errorMessage);
        }
      } catch (error) {
        this.showError('삭제 중 오류 발생: ' + error.message);
      } finally {
        this.isDeleting = false;
      }
    },

    async refreshData() {
      await this.loadPersonas();
      if (this.selectedPersonaCode) {
        const selectedExists = this.personas.some(p => p.personaCode === this.selectedPersonaCode);
        if (selectedExists) {
          this.onPersonaSelect(this.selectedPersonaCode);
        } else {
          this.selectedPersonaCode = '';
          this.selectedPersona = null;
          this.editingPersona = {};
          this.editMode = 'view';
        }
      }
    },

    getDefaultSystemPrompt() {
      return `You are a helpful AI assistant. Please provide accurate, helpful, and informative responses to user questions.

Guidelines:
- Be concise and clear in your responses
- Provide examples when helpful
- Ask clarifying questions if needed
- Be honest about limitations
- Maintain a professional and friendly tone`;
    },

    formatTimestamp(timestamp) {
      const now = new Date();
      const diff = now - timestamp;
      const minutes = Math.floor(diff / 60000);

      if (minutes < 1) return '방금 전';
      if (minutes < 60) return `${minutes}분 전`;
      return `${Math.floor(minutes / 60)}시간 전`;
    },

    escapeHtml(text) {
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    },

    showSuccess(message) {
      alert('✅ ' + message);
    },

    showError(message) {
      alert('❌ ' + message);
    }
  },

  mounted() {
    this.loadPersonas();
  }
}
</script>

<style scoped>
:root {
  --border-color: #e2e8f0;
  --text-color: #333;
  --label-color: #666;
  --panel-bg: white;
  --header-bg: #f8fafc;
  --active-list-item-border: #3b82f6;
  --btn-default-bg: white;
  --btn-default-color: #374151;
  --btn-default-border: #d1d5db;
  --btn-primary-bg: #3b82f6;
  --btn-primary-color: white;
  --btn-success-bg: #10b981;
  --btn-success-color: white;
  --btn-danger-bg: #ef4444;
  --btn-danger-color: white;
}

.admin-persona-page {
  display: flex;
  flex-direction: column;
  height: 100vh;
  font-size: 12px;
  background-color: #f8f9fa;
  color: var(--text-color);
}

.admin-header {
  padding: 10px 16px;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: var(--panel-bg);
}

.admin-header h1 {
  font-size: 16px;
  margin: 0;
  font-weight: 600;
}

.admin-header p {
  font-size: 11px;
  color: #64748b;
  margin: 2px 0 0 0;
}

.persona-selector {
  padding: 12px 16px;
  border-bottom: 1px solid var(--border-color);
  background-color: var(--panel-bg);
}

.selector-row {
  display: flex;
  align-items: end;
  gap: 16px;
}

.selector-group {
  display: flex;
  flex-direction: column;
  flex: 1;
  max-width: 400px;
}

.selector-group label {
  font-size: 11px;
  font-weight: 500;
  color: var(--label-color);
  margin-bottom: 4px;
}

.selector-group select {
  padding: 6px 8px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  font-size: 12px;
  background-color: var(--panel-bg);
}

.admin-main {
  display: flex;
  flex: 1;
  overflow: hidden;
  gap: 1px;
  background: var(--border-color);
}

.editor-panel,
.result-panel {
  display: flex;
  flex-direction: column;
  background-color: var(--panel-bg);
}

.editor-panel {
  flex: 6;
  min-width: 400px;
}

.result-panel {
  flex: 4;
  min-width: 300px;
}

.editor-header,
.result-header {
  padding: 8px 12px;
  border-bottom: 1px solid var(--border-color);
  background-color: var(--header-bg);
  font-weight: 600;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0;
}

.editor-header h2,
.result-header h3 {
  margin: 0;
  font-size: 13px;
}

.editor-placeholder {
  text-align: center;
  padding: 30px 20px;
  color: #64748b;
  align-self: center;
  margin: auto;
  font-size: 11px;
}

.editor-content {
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow: hidden;
}

.form-scroll-area {
  overflow-y: auto;
  padding: 16px;
  flex: 1;
}

.form-section {
  margin-bottom: 16px;
}

.form-section h4 {
  margin: 0 0 10px 0;
  border-bottom: 1px solid var(--border-color);
  padding-bottom: 6px;
  font-size: 13px;
  font-weight: 600;
  color: var(--label-color);
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px 16px;
  max-width: 800px;
}

.form-group-full {
  grid-column: 1 / -1;
}

.form-group label {
  display: block;
  margin-bottom: 4px;
  font-weight: 500;
  color: var(--label-color);
  font-size: 11px;
}

input[type="text"],
select,
textarea {
  width: 100%;
  padding: 6px 8px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  font-size: 12px;
  font-family: inherit;
  box-sizing: border-box;
  background-color: var(--panel-bg);
  transition: border-color 0.15s, box-shadow 0.15s;
}

input[type="text"]:focus,
select:focus,
textarea:focus {
  outline: none;
  border-color: var(--active-list-item-border);
  box-shadow: 0 0 0 2px rgba(14, 165, 233, 0.1);
}

input[readonly] {
  background-color: #f5f5f5;
  cursor: not-allowed;
}

.prompt-editor {
  position: relative;
}

.prompt-textarea {
  resize: vertical;
  font-family: monospace;
}

.char-count {
  position: absolute;
  bottom: 6px;
  right: 8px;
  font-size: 10px;
  color: #64748b;
  background: var(--panel-bg);
  padding: 1px 4px;
  border-radius: 2px;
}

.test-area {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.result-content {
  flex: 1;
  overflow-y: auto;
}

.result-placeholder {
  text-align: center;
  padding: 30px 20px;
  color: #64748b;
  font-size: 11px;
}

.response-wrapper {
  padding: 12px;
}

.response-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  font-size: 10px;
  color: #64748b;
}

.status {
  font-weight: bold;
  padding: 2px 6px;
  border-radius: 3px;
}

.status.success {
  color: #52c41a;
  background: #f6ffed;
  border: 1px solid #b7eb8f;
}

.status.error {
  color: #f5222d;
  background: #fff1f0;
  border: 1px solid #ffa39e;
}

.response-body {
  font-size: 12px;
  line-height: 1.5;
  white-space: pre-wrap;
  word-break: break-all;
}

.response-body >>> :first-child {
  margin-top: 0;
}

button {
  padding: 4px 10px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 11px;
  font-weight: 500;
  transition: all 0.15s;
  border: 1px solid var(--btn-default-border);
  background-color: var(--btn-default-bg);
  color: var(--btn-default-color);
}

button:hover {
  opacity: 0.8;
}

button:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.editor-actions {
  display: flex;
  gap: 6px;
}

.btn-refresh {
  background-color: var(--btn-primary-bg);
  color: var(--btn-primary-color);
  border-color: var(--btn-primary-bg);
}

.btn-new {
  background-color: var(--btn-primary-bg);
  color: var(--btn-primary-color);
  border-color: var(--btn-primary-bg);
}

.btn-save {
  background-color: var(--btn-success-bg);
  color: var(--btn-success-color);
  border-color: var(--btn-success-bg);
}

.btn-delete {
  background-color: var(--btn-danger-bg);
  color: var(--btn-danger-color);
  border-color: var(--btn-danger-bg);
}

.btn-test {
  background-color: var(--btn-primary-bg);
  color: var(--btn-primary-color);
  border-color: var(--btn-primary-bg);
}

@media (max-width: 1200px) {
  .admin-main {
    flex-direction: column;
  }
}
</style>