<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h1 class="text-2xl font-bold text-gray-900 mb-4">Company Status Check</h1>
      <p class="text-gray-600">Check if a company is closed or active</p>
    </div>

    <!-- Search Section -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div class="space-y-4">
        <div class="flex gap-4">
          <div class="flex-1">
            <input
              v-model="piva"
              type="text"
              placeholder="Enter P.IVA (e.g., 12345678901)"
              class="input-field"
              @keyup.enter="checkCompanyStatus"
            />
          </div>
          <button
            @click="checkCompanyStatus"
            :disabled="!piva || companyStore.isLoading"
            class="btn-primary"
          >
            <svg v-if="companyStore.isLoading" class="spinner mr-2" />
            {{ companyStore.isLoading ? 'Checking...' : 'Check Status' }}
          </button>
        </div>

        <!-- Batch Check -->
        <div class="border-t pt-4">
          <h3 class="text-lg font-semibold text-gray-900 mb-3">Batch Check</h3>
          <div class="space-y-3">
            <textarea
              v-model="batchPivas"
              placeholder="Enter multiple P.IVAs, one per line"
              rows="4"
              class="input-field resize-none"
            ></textarea>
            <button
              @click="checkBatchStatus"
              :disabled="!batchPivas.trim() || companyStore.isLoading"
              class="btn-secondary"
            >
              <svg v-if="batchLoading" class="spinner mr-2" />
              Check Multiple
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Error Message -->
    <div v-if="companyStore.error" class="bg-red-50 border border-red-200 rounded-xl p-4">
      <div class="flex items-center">
        <svg class="w-5 h-5 text-red-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p class="text-red-700">{{ companyStore.error }}</p>
      </div>
    </div>

    <!-- Single Result -->
    <div v-if="currentResult" class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-xl font-semibold text-gray-900">Company Status</h2>
        <span
          :class="[
            'px-3 py-1 rounded-full text-sm font-medium',
            getStatusBadgeClass(currentResult.data)
          ]"
        >
          {{ getStatusText(currentResult.data) }}
        </span>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <dt class="text-sm font-medium text-gray-500 mb-1">P.IVA</dt>
          <dd class="text-lg font-semibold text-gray-900">{{ piva }}</dd>
        </div>
        
        <div>
          <dt class="text-sm font-medium text-gray-500 mb-1">Status Check Date</dt>
          <dd class="text-sm text-gray-900">{{ formatDate(currentResult.timestamp) }}</dd>
        </div>

        <div v-if="currentResult.data.denominazione">
          <dt class="text-sm font-medium text-gray-500 mb-1">Company Name</dt>
          <dd class="text-sm text-gray-900">{{ currentResult.data.denominazione }}</dd>
        </div>

        <div v-if="currentResult.data.stato">
          <dt class="text-sm font-medium text-gray-500 mb-1">Official Status</dt>
          <dd class="text-sm text-gray-900">{{ currentResult.data.stato }}</dd>
        </div>
      </div>

      <!-- Raw Data -->
      <div class="mt-6 pt-6 border-t border-gray-200">
        <button
          @click="showRawData = !showRawData"
          class="text-sm text-gray-600 hover:text-gray-900 transition-colors"
        >
          {{ showRawData ? 'Hide' : 'Show' }} Raw Data
        </button>
        
        <pre v-if="showRawData" class="mt-4 bg-gray-50 rounded-lg p-4 text-xs overflow-auto">{{ JSON.stringify(currentResult, null, 2) }}</pre>
      </div>
    </div>

    <!-- Batch Results -->
    <div v-if="batchResults.length > 0" class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-xl font-semibold text-gray-900">Batch Results</h2>
        <div class="flex gap-2">
          <button
            @click="exportResults"
            class="btn-secondary"
          >
            Export CSV
          </button>
          <button
            @click="clearResults"
            class="btn-secondary"
          >
            Clear Results
          </button>
        </div>
      </div>

      <!-- Statistics -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div class="bg-gray-50 rounded-lg p-4 text-center">
          <div class="text-2xl font-bold text-gray-900">{{ batchResults.length }}</div>
          <div class="text-sm text-gray-600">Total Checked</div>
        </div>
        <div class="bg-green-50 rounded-lg p-4 text-center">
          <div class="text-2xl font-bold text-green-600">{{ activeCount }}</div>
          <div class="text-sm text-gray-600">Active</div>
        </div>
        <div class="bg-red-50 rounded-lg p-4 text-center">
          <div class="text-2xl font-bold text-red-600">{{ closedCount }}</div>
          <div class="text-sm text-gray-600">Closed</div>
        </div>
        <div class="bg-yellow-50 rounded-lg p-4 text-center">
          <div class="text-2xl font-bold text-yellow-600">{{ unknownCount }}</div>
          <div class="text-sm text-gray-600">Unknown</div>
        </div>
      </div>

      <!-- Results Table -->
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">P.IVA</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company Name</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Check Date</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="result in batchResults" :key="result.piva">
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{{ result.piva }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ result.data?.denominazione || 'N/A' }}</td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span
                  :class="[
                    'px-2 py-1 text-xs rounded-full',
                    getStatusBadgeClass(result.data)
                  ]"
                >
                  {{ getStatusText(result.data) }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ formatDate(result.timestamp) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useCompanyStore } from '@/stores/company'

const companyStore = useCompanyStore()

const piva = ref('')
const batchPivas = ref('')
const currentResult = ref(null)
const batchResults = ref([])
const showRawData = ref(false)
const batchLoading = ref(false)

const checkCompanyStatus = async () => {
  if (!piva.value) return
  
  try {
    const response = await companyStore.getCompanyClosed(piva.value)
    currentResult.value = response
  } catch (error) {
    console.error('Error checking company status:', error)
  }
}

const checkBatchStatus = async () => {
  const pivaList = batchPivas.value
    .split('\n')
    .map(p => p.trim())
    .filter(p => p)
  
  if (pivaList.length === 0) return
  
  batchLoading.value = true
  const results = []
  
  for (const pivaItem of pivaList) {
    try {
      const response = await companyStore.getCompanyClosed(pivaItem)
      results.push({
        piva: pivaItem,
        ...response
      })
    } catch (error) {
      results.push({
        piva: pivaItem,
        error: error.message,
        timestamp: new Date()
      })
    }
    
    // Small delay to avoid overwhelming the API
    await new Promise(resolve => setTimeout(resolve, 500))
  }
  
  batchResults.value = results
  batchLoading.value = false
}

const getStatusText = (data) => {
  if (!data) return 'Unknown'
  if (data.error) return 'Error'
  if (data.chiusa === true || data.stato === 'CHIUSA') return 'Closed'
  if (data.chiusa === false || data.stato === 'ATTIVA') return 'Active'
  return 'Unknown'
}

const getStatusBadgeClass = (data) => {
  const status = getStatusText(data)
  switch (status) {
    case 'Active':
      return 'bg-green-100 text-green-800'
    case 'Closed':
      return 'bg-red-100 text-red-800'
    case 'Error':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-yellow-100 text-yellow-800'
  }
}

const activeCount = computed(() => {
  return batchResults.value.filter(r => getStatusText(r.data) === 'Active').length
})

const closedCount = computed(() => {
  return batchResults.value.filter(r => getStatusText(r.data) === 'Closed').length
})

const unknownCount = computed(() => {
  return batchResults.value.filter(r => !['Active', 'Closed'].includes(getStatusText(r.data))).length
})

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('it-IT', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const exportResults = () => {
  const headers = ['P.IVA', 'Company Name', 'Status', 'Check Date']
  const rows = batchResults.value.map(result => [
    result.piva,
    result.data?.denominazione || 'N/A',
    getStatusText(result.data),
    formatDate(result.timestamp)
  ])
  
  const csvContent = [headers, ...rows]
    .map(row => row.map(field => `"${field}"`).join(','))
    .join('\n')
  
  const blob = new Blob([csvContent], { type: 'text/csv' })
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `company-status-${new Date().toISOString().split('T')[0]}.csv`
  document.body.appendChild(a)
  a.click()
  window.URL.revokeObjectURL(url)
  document.body.removeChild(a)
}

const clearResults = () => {
  batchResults.value = []
  currentResult.value = null
  batchPivas.value = ''
}
</script>
