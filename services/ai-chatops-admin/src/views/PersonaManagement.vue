<template>
  <div class="persona-management">
    <!-- Header with actions -->
    <div class="page-header">
      <div class="header-content">
        <h2>Persona Management</h2>
        <p>Manage AI personas and their system prompts</p>
      </div>
      <div class="header-actions">
        <button @click="showCreateModal = true" class="btn btn-primary">
          <LucideIcon name="plus" :width="16" :height="16" />
          Create Persona
        </button>
      </div>
    </div>

    <!-- Filters -->
    <div class="filters">
      <div class="filter-group">
        <label>Category:</label>
        <select v-model="selectedCategory" @change="filterPersonas">
          <option value="">All Categories</option>
          <option value="personal">Personal</option>
          <option value="general">General</option>
          <option value="operation">Operation</option>
        </select>
      </div>

      <div class="filter-group">
        <label>Status:</label>
        <select v-model="selectedStatus" @change="filterPersonas">
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      <div class="filter-group">
        <label>Search:</label>
        <div class="search-input">
          <LucideIcon name="search" :width="16" :height="16" />
          <input 
            type="text" 
            v-model="searchTerm" 
            @input="filterPersonas"
            placeholder="Search personas..."
          >
        </div>
      </div>
    </div>

    <!-- Personas Table -->
    <div class="table-container">
      <table class="personas-table">
        <thead>
          <tr>
            <th>Persona</th>
            <th>Category</th>
            <th>Status</th>
            <th>Last Updated</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading">
            <td colspan="5" class="loading-row">
              <div class="loading-spinner"></div>
              Loading personas...
            </td>
          </tr>
          <tr v-else-if="filteredPersonas.length === 0">
            <td colspan="5" class="empty-row">
              No personas found
            </td>
          </tr>
          <tr v-for="persona in filteredPersonas" :key="persona.personaCode" class="persona-row">
            <td>
              <div class="persona-info">
                <div class="persona-avatar" :class="`category-${persona.category}`">
                  {{ getPersonaInitials(persona.title) }}
                </div>
                <div class="persona-details">
                  <div class="persona-title">{{ persona.title }}</div>
                  <div class="persona-description">{{ persona.description }}</div>
                  <div class="persona-code">{{ persona.personaCode }}</div>
                </div>
              </div>
            </td>
            <td>
              <span class="category-badge" :class="`category-${persona.category}`">
                {{ getCategoryLabel(persona.category) }}
              </span>
            </td>
            <td>
              <span class="status-badge" :class="persona.isActive ? 'status-active' : 'status-inactive'">
                {{ persona.isActive ? 'Active' : 'Inactive' }}
              </span>
            </td>
            <td>
              <div class="date-info">
                {{ formatDate(persona.updatedAt) }}
              </div>
            </td>
            <td>
              <div class="action-buttons">
                <button 
                  @click="editPersona(persona)" 
                  class="btn btn-sm btn-ghost"
                  title="Edit persona"
                >
                  <LucideIcon name="edit" :width="14" :height="14" />
                </button>
                <button 
                  @click="testPersona(persona)" 
                  class="btn btn-sm btn-ghost"
                  title="Test prompt"
                >
                  <LucideIcon name="eye" :width="14" :height="14" />
                </button>
                <button 
                  @click="deletePersona(persona)" 
                  class="btn btn-sm btn-ghost btn-danger"
                  title="Delete persona"
                >
                  <LucideIcon name="trash" :width="14" :height="14" />
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Create/Edit Modal -->
    <div v-if="showCreateModal || showEditModal" class="modal-overlay" @click="closeModals">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>{{ showCreateModal ? 'Create New Persona' : 'Edit Persona' }}</h3>
          <button @click="closeModals" class="modal-close">
            <LucideIcon name="x" :width="20" :height="20" />
          </button>
        </div>

        <div class="modal-body">
          <form @submit.prevent="savePersona">
            <div class="form-row">
              <div class="form-group">
                <label>Persona Code *</label>
                <input 
                  type="text" 
                  v-model="formData.personaCode" 
                  :disabled="showEditModal"
                  required
                  placeholder="e.g., general-assistant"
                >
              </div>
              <div class="form-group">
                <label>Title *</label>
                <input 
                  type="text" 
                  v-model="formData.title" 
                  required
                  placeholder="e.g., General Assistant"
                >
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Category *</label>
                <select v-model="formData.category" required>
                  <option value="">Select Category</option>
                  <option value="personal">Personal</option>
                  <option value="general">General</option>
                  <option value="operation">Operation</option>
                </select>
              </div>
              <div class="form-group">
                <label>Status</label>
                <select v-model="formData.isActive">
                  <option :value="true">Active</option>
                  <option :value="false">Inactive</option>
                </select>
              </div>
            </div>

            <div class="form-group">
              <label>Description</label>
              <textarea 
                v-model="formData.description" 
                rows="3"
                placeholder="Brief description of the persona's purpose..."
              ></textarea>
            </div>

            <div class="form-group">
              <label>System Prompt *</label>
              <textarea 
                v-model="formData.personaPrompt" 
                rows="8"
                required
                placeholder="System prompt that defines the persona's behavior..."
              ></textarea>
            </div>

            <div class="form-actions">
              <button type="button" @click="closeModals" class="btn btn-ghost">
                Cancel
              </button>
              <button type="button" @click="testPrompt" class="btn btn-secondary" :disabled="!formData.personaPrompt">
                Test Prompt
              </button>
              <button type="submit" class="btn btn-primary" :disabled="saving">
                {{ saving ? 'Saving...' : (showCreateModal ? 'Create' : 'Save') }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Test Modal -->
    <div v-if="showTestModal" class="modal-overlay" @click="showTestModal = false">
      <div class="modal-content modal-large" @click.stop>
        <div class="modal-header">
          <h3>Test System Prompt</h3>
          <button @click="showTestModal = false" class="modal-close">
            <LucideIcon name="x" :width="20" :height="20" />
          </button>
        </div>

        <div class="modal-body">
          <div class="test-form">
            <div class="form-group">
              <label>Test Input</label>
              <textarea 
                v-model="testInput" 
                rows="3"
                placeholder="Enter a test message to see how the persona responds..."
              ></textarea>
            </div>
            <button @click="runTest" class="btn btn-primary" :disabled="testing || !testInput">
              {{ testing ? 'Testing...' : 'Run Test' }}
            </button>
          </div>

          <div v-if="testResult" class="test-result">
            <h4>Test Result:</h4>
            <div class="result-content">{{ testResult }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import LucideIcon from '@/components/LucideIcon.vue'
import adminService from '@/services/adminService.js'

export default {
  name: 'PersonaManagement',
  components: {
    LucideIcon
  },

  setup() {
    const loading = ref(false)
    const saving = ref(false)
    const testing = ref(false)
    const personas = ref([])
    const selectedCategory = ref('')
    const selectedStatus = ref('')
    const searchTerm = ref('')

    const showCreateModal = ref(false)
    const showEditModal = ref(false)
    const showTestModal = ref(false)

    const formData = ref({
      personaCode: '',
      title: '',
      description: '',
      category: '',
      personaPrompt: '',
      isActive: true
    })

    const testInput = ref('')
    const testResult = ref('')

    const filteredPersonas = computed(() => {
      let filtered = personas.value

      if (selectedCategory.value) {
        filtered = filtered.filter(p => p.category === selectedCategory.value)
      }

      if (selectedStatus.value) {
        const isActive = selectedStatus.value === 'active'
        filtered = filtered.filter(p => p.isActive === isActive)
      }

      if (searchTerm.value) {
        const term = searchTerm.value.toLowerCase()
        filtered = filtered.filter(p => 
          p.title.toLowerCase().includes(term) ||
          p.description.toLowerCase().includes(term) ||
          p.personaCode.toLowerCase().includes(term)
        )
      }

      return filtered
    })

    const loadPersonas = async () => {
      loading.value = true
      try {
        const response = await adminService.getPersonas()
        if (response.success) {
          personas.value = response.data
        } else {
          console.error('Failed to load personas:', response.errorMessage)
        }
      } catch (error) {
        console.error('Error loading personas:', error)
      } finally {
        loading.value = false
      }
    }

    const filterPersonas = () => {
      // Filtering is handled by computed property
    }

    const editPersona = (persona) => {
      formData.value = { ...persona }
      showEditModal.value = true
    }

    const deletePersona = async (persona) => {
      if (!confirm(`Are you sure you want to delete "${persona.title}"?`)) {
        return
      }

      try {
        const response = await adminService.deletePersona(persona.personaCode)
        if (response.success) {
          personas.value = personas.value.filter(p => p.personaCode !== persona.personaCode)
        } else {
          alert('Failed to delete persona: ' + response.errorMessage)
        }
      } catch (error) {
        alert('Error deleting persona: ' + error.message)
      }
    }

    const testPersona = (persona) => {
      formData.value = { ...persona }
      testInput.value = ''
      testResult.value = ''
      showTestModal.value = true
    }

    const savePersona = async () => {
      saving.value = true
      try {
        let response
        if (showCreateModal.value) {
          response = await adminService.createPersona(formData.value)
        } else {
          response = await adminService.updatePersona(formData.value.personaCode, formData.value)
        }

        if (response.success) {
          await loadPersonas()
          closeModals()
        } else {
          alert('Failed to save persona: ' + response.errorMessage)
        }
      } catch (error) {
        alert('Error saving persona: ' + error.message)
      } finally {
        saving.value = false
      }
    }

    const testPrompt = async () => {
      if (!formData.value.personaPrompt) return
      
      showTestModal.value = true
      testInput.value = 'Hello, how can you help me?'
      testResult.value = ''
    }

    const runTest = async () => {
      if (!testInput.value) return

      testing.value = true
      try {
        const response = await adminService.testSystemPrompt({
          personaPrompt: formData.value.personaPrompt,
          userQuery: testInput.value
        })

        if (response.success) {
          testResult.value = response.data
        } else {
          testResult.value = 'Test failed: ' + response.errorMessage
        }
      } catch (error) {
        testResult.value = 'Error running test: ' + error.message
      } finally {
        testing.value = false
      }
    }

    const closeModals = () => {
      showCreateModal.value = false
      showEditModal.value = false
      showTestModal.value = false
      formData.value = {
        personaCode: '',
        title: '',
        description: '',
        category: '',
        personaPrompt: '',
        isActive: true
      }
    }

    const getPersonaInitials = (title) => {
      return title.split(' ').map(word => word[0]).join('').substring(0, 2).toUpperCase()
    }

    const getCategoryLabel = (category) => {
      const labels = {
        'personal': 'Personal',
        'general': 'General',
        'operation': 'Operation'
      }
      return labels[category] || category
    }

    const formatDate = (dateString) => {
      if (!dateString) return 'N/A'
      const date = new Date(dateString)
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }

    onMounted(() => {
      loadPersonas()
    })

    return {
      loading,
      saving,
      testing,
      personas,
      filteredPersonas,
      selectedCategory,
      selectedStatus,
      searchTerm,
      showCreateModal,
      showEditModal,
      showTestModal,
      formData,
      testInput,
      testResult,
      loadPersonas,
      filterPersonas,
      editPersona,
      deletePersona,
      testPersona,
      savePersona,
      testPrompt,
      runTest,
      closeModals,
      getPersonaInitials,
      getCategoryLabel,
      formatDate
    }
  }
}
</script>

<style scoped>
.persona-management {
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e2e8f0;
}

.header-content h2 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 0.25rem 0;
}

.header-content p {
  color: #6b7280;
  margin: 0;
}

.filters {
  display: flex;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: white;
  border-radius: 0.5rem;
  border: 1px solid #e2e8f0;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.filter-group label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
}

.filter-group select,
.search-input {
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.875rem;
}

.search-input {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  min-width: 200px;
}

.search-input input {
  border: none;
  outline: none;
  flex: 1;
  font-size: 0.875rem;
}

.table-container {
  background: white;
  border-radius: 0.5rem;
  border: 1px solid #e2e8f0;
  overflow: hidden;
}

.personas-table {
  width: 100%;
  border-collapse: collapse;
}

.personas-table th {
  background: #f8fafc;
  padding: 1rem;
  text-align: left;
  font-weight: 600;
  color: #374151;
  border-bottom: 1px solid #e2e8f0;
}

.personas-table td {
  padding: 1rem;
  border-bottom: 1px solid #f1f5f9;
}

.persona-row:hover {
  background: #f8fafc;
}

.loading-row,
.empty-row {
  text-align: center;
  color: #6b7280;
  font-style: italic;
  padding: 2rem !important;
}

.loading-spinner {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid #e2e8f0;
  border-top: 2px solid #2563eb;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-right: 0.5rem;
}

.persona-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.persona-avatar {
  width: 40px;
  height: 40px;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.875rem;
  color: white;
}

.persona-avatar.category-personal {
  background: #2563eb;
}

.persona-avatar.category-general {
  background: #059669;
}

.persona-avatar.category-operation {
  background: #dc2626;
}

.persona-details {
  flex: 1;
}

.persona-title {
  font-weight: 500;
  color: #1f2937;
  margin-bottom: 0.25rem;
}

.persona-description {
  font-size: 0.875rem;
  color: #6b7280;
  margin-bottom: 0.25rem;
}

.persona-code {
  font-size: 0.75rem;
  color: #9ca3af;
  font-family: monospace;
}

.category-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
  color: white;
}

.category-badge.category-personal {
  background: #2563eb;
}

.category-badge.category-general {
  background: #059669;
}

.category-badge.category-operation {
  background: #dc2626;
}

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
}

.status-badge.status-active {
  background: #dcfce7;
  color: #166534;
}

.status-badge.status-inactive {
  background: #fee2e2;
  color: #991b1b;
}

.date-info {
  font-size: 0.875rem;
  color: #6b7280;
}

.action-buttons {
  display: flex;
  gap: 0.25rem;
}

.btn {
  padding: 0.5rem 1rem;
  border: 1px solid transparent;
  border-radius: 0.375rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  text-decoration: none;
}

.btn-sm {
  padding: 0.375rem 0.75rem;
  font-size: 0.875rem;
}

.btn-primary {
  background: #2563eb;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #1d4ed8;
}

.btn-secondary {
  background: #6b7280;
  color: white;
}

.btn-secondary:hover:not(:disabled) {
  background: #4b5563;
}

.btn-ghost {
  background: transparent;
  color: #6b7280;
  border-color: #e2e8f0;
}

.btn-ghost:hover:not(:disabled) {
  background: #f3f4f6;
  color: #374151;
}

.btn-danger:hover:not(:disabled) {
  color: #dc2626;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 0.75rem;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  max-width: 600px;
  width: 90vw;
  max-height: 90vh;
  overflow: auto;
}

.modal-large {
  max-width: 800px;
}

.modal-header {
  padding: 1.5rem;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.modal-header h3 {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.modal-close {
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 0.25rem;
}

.modal-close:hover {
  background: #f3f4f6;
  color: #374151;
}

.modal-body {
  padding: 1.5rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  font-weight: 500;
  color: #374151;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.875rem;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.form-group textarea {
  resize: vertical;
}

.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid #e2e8f0;
}

.test-form {
  margin-bottom: 1.5rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid #e2e8f0;
}

.test-result {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
  padding: 1rem;
}

.test-result h4 {
  margin: 0 0 0.75rem 0;
  color: #374151;
  font-size: 0.875rem;
  font-weight: 600;
}

.result-content {
  font-size: 0.875rem;
  line-height: 1.5;
  color: #1f2937;
  white-space: pre-wrap;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Responsive */
@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .filters {
    flex-direction: column;
    gap: 1rem;
  }
  
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .personas-table {
    font-size: 0.875rem;
  }
  
  .personas-table th,
  .personas-table td {
    padding: 0.75rem 0.5rem;
  }
}
</style>