<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h1 class="text-2xl font-bold text-gray-900 mb-4">Company Details</h1>
      <p class="text-gray-600">Get advanced data, full report, and status information for any company</p>
    </div>

    <!-- Action Tabs -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-200">
      <div class="border-b border-gray-200">
        <nav class="-mb-px flex space-x-8 px-6">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            @click="activeTab = tab.id"
            :class="[
              'py-4 px-1 border-b-2 font-medium text-sm transition-colors',
              activeTab === tab.id
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            ]"
          >
            {{ tab.label }}
          </button>
        </nav>
      </div>

      <div class="p-6">
        <!-- Advanced Data Tab -->
        <div v-if="activeTab === 'advanced'" class="space-y-6">
          <div class="flex gap-4">
            <input
              v-model="pivaInput"
              type="text"
              placeholder="Enter P.IVA for advanced data"
              class="input-field flex-1"
              @keyup.enter="fetchAdvancedData"
            />
            <button
              @click="fetchAdvancedData"
              :disabled="!pivaInput || companyStore.isLoading"
              class="btn-primary"
            >
              <svg v-if="companyStore.isLoading" class="spinner mr-2" />
              Get Advanced Data
            </button>
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

          <!-- Advanced Data Display -->
          <div v-if="advancedData" class="space-y-6">
            <!-- Basic Company Information -->
            <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div class="flex items-center justify-between mb-6">
                <h2 class="text-xl font-semibold text-gray-900">Company Information</h2>
                <span class="bg-green-100 text-green-800 text-sm font-medium px-3 py-1 rounded-full">
                  Advanced Data
                </span>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div v-for="(value, key) in flattenedAdvancedData" :key="key" class="space-y-1">
                  <dt class="text-sm font-medium text-gray-500 capitalize">{{ formatKey(key) }}</dt>
                  <dd class="text-sm text-gray-900">{{ formatValue(value) }}</dd>
                </div>
              </div>
            </div>

            <!-- Balance Sheets Section -->
            <div v-if="hasBalanceSheets(advancedData)" class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div class="flex items-center justify-between mb-6">
                <h2 class="text-xl font-semibold text-gray-900">Financial Data</h2>
                <span class="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">
                  Balance Sheets
                </span>
              </div>

              <!-- Latest Balance Sheet -->
              <div v-if="advancedData.balanceSheets.last" class="mb-8">
                <h3 class="text-lg font-medium text-gray-900 mb-4">Latest Balance Sheet ({{ advancedData.balanceSheets.last.year }})</h3>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div class="bg-gray-50 p-4 rounded-lg">
                    <dt class="text-sm font-medium text-gray-500">Turnover</dt>
                    <dd class="text-lg font-semibold text-gray-900">{{ formatCurrency(advancedData.balanceSheets.last.turnover) }}</dd>
                  </div>
                  <div class="bg-gray-50 p-4 rounded-lg">
                    <dt class="text-sm font-medium text-gray-500">Net Worth</dt>
                    <dd class="text-lg font-semibold text-gray-900">{{ formatCurrency(advancedData.balanceSheets.last.netWorth) }}</dd>
                  </div>
                  <div class="bg-gray-50 p-4 rounded-lg">
                    <dt class="text-sm font-medium text-gray-500">Employees</dt>
                    <dd class="text-lg font-semibold text-gray-900">{{ advancedData.balanceSheets.last.employees || 'N/A' }}</dd>
                  </div>
                  <div class="bg-gray-50 p-4 rounded-lg">
                    <dt class="text-sm font-medium text-gray-500">Total Assets</dt>
                    <dd class="text-lg font-semibold text-gray-900">{{ formatCurrency(advancedData.balanceSheets.last.totalAssets) }}</dd>
                  </div>
                </div>
              </div>

              <!-- Historical Balance Sheets -->
              <div v-if="advancedData.balanceSheets.all && advancedData.balanceSheets.all.length > 0">
                <h3 class="text-lg font-medium text-gray-900 mb-4">Historical Balance Sheets</h3>
                <div class="overflow-x-auto">
                  <table class="min-w-full divide-y divide-gray-200">
                    <thead class="bg-gray-50">
                      <tr>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Year</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Turnover</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Net Worth</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employees</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Share Capital</th>
                      </tr>
                    </thead>
                    <tbody class="bg-white divide-y divide-gray-200">
                      <tr v-for="sheet in advancedData.balanceSheets.all" :key="sheet.year" class="hover:bg-gray-50">
                        <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{{ sheet.year }}</td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ formatCurrency(sheet.turnover) }}</td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ formatCurrency(sheet.netWorth) }}</td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ sheet.employees || 'N/A' }}</td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ formatCurrency(sheet.shareCapital) }}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <!-- Shareholders Section -->
            <div v-if="hasShareHolders(advancedData)" class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div class="flex items-center justify-between mb-6">
                <h2 class="text-xl font-semibold text-gray-900">Ownership Structure</h2>
                <span class="bg-purple-100 text-purple-800 text-sm font-medium px-3 py-1 rounded-full">
                  Shareholders
                </span>
              </div>

              <div class="space-y-4">
                <div v-for="(holder, index) in advancedData.shareHolders" :key="index" class="border border-gray-200 rounded-lg p-4">
                  <div class="flex items-center justify-between">
                    <div class="flex-1">
                      <h4 class="font-medium text-gray-900">
                        {{ holder.companyName || `${holder.name} ${holder.surname}`.trim() }}
                      </h4>
                      <p class="text-sm text-gray-500">Tax Code: {{ holder.taxCode }}</p>
                    </div>
                    <div class="text-right">
                      <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                        {{ formatPercentage(holder.percentShare) }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Raw Data Toggle -->
            <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <button
                @click="showAdvancedRawData = !showAdvancedRawData"
                class="text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                {{ showAdvancedRawData ? 'Hide' : 'Show' }} Raw Data
              </button>
              
              <pre v-if="showAdvancedRawData" class="mt-4 bg-gray-50 rounded-lg p-4 text-xs overflow-auto">{{ JSON.stringify(advancedData, null, 2) }}</pre>
            </div>
          </div>
        </div>

        <!-- Full Report Tab -->
        <div v-if="activeTab === 'full'" class="space-y-6">
          <div class="flex gap-4">
            <input
              v-model="pivaInput"
              type="text"
              placeholder="Enter P.IVA for full report"
              class="input-field flex-1"
              @keyup.enter="fetchFullData"
            />
            <button
              @click="fetchFullData"
              :disabled="!pivaInput || companyStore.isLoading"
              class="btn-primary"
            >
              <svg v-if="companyStore.isLoading" class="spinner mr-2" />
              Get Full Report
            </button>
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

          <!-- Full Data Display -->
          <div v-if="fullData" class="space-y-6">
            <!-- Basic Company Information -->
            <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div class="flex items-center justify-between mb-6">
                <h2 class="text-xl font-semibold text-gray-900">Full Company Report</h2>
                <span class="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">
                  Full Report
                </span>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div v-for="(value, key) in flattenedFullData" :key="key" class="space-y-1">
                  <dt class="text-sm font-medium text-gray-500 capitalize">{{ formatKey(key) }}</dt>
                  <dd class="text-sm text-gray-900">{{ formatValue(value) }}</dd>
                </div>
              </div>
            </div>

            <!-- Balance Sheets Section -->
            <div v-if="hasBalanceSheets(fullData)" class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div class="flex items-center justify-between mb-6">
                <h2 class="text-xl font-semibold text-gray-900">Financial Data</h2>
                <span class="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">
                  Balance Sheets
                </span>
              </div>

              <!-- Latest Balance Sheet -->
              <div v-if="fullData.balanceSheets.last" class="mb-8">
                <h3 class="text-lg font-medium text-gray-900 mb-4">Latest Balance Sheet ({{ fullData.balanceSheets.last.year }})</h3>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div class="bg-gray-50 p-4 rounded-lg">
                    <dt class="text-sm font-medium text-gray-500">Turnover</dt>
                    <dd class="text-lg font-semibold text-gray-900">{{ formatCurrency(fullData.balanceSheets.last.turnover) }}</dd>
                  </div>
                  <div class="bg-gray-50 p-4 rounded-lg">
                    <dt class="text-sm font-medium text-gray-500">Net Worth</dt>
                    <dd class="text-lg font-semibold text-gray-900">{{ formatCurrency(fullData.balanceSheets.last.netWorth) }}</dd>
                  </div>
                  <div class="bg-gray-50 p-4 rounded-lg">
                    <dt class="text-sm font-medium text-gray-500">Employees</dt>
                    <dd class="text-lg font-semibold text-gray-900">{{ fullData.balanceSheets.last.employees || 'N/A' }}</dd>
                  </div>
                  <div class="bg-gray-50 p-4 rounded-lg">
                    <dt class="text-sm font-medium text-gray-500">Total Assets</dt>
                    <dd class="text-lg font-semibold text-gray-900">{{ formatCurrency(fullData.balanceSheets.last.totalAssets) }}</dd>
                  </div>
                </div>
              </div>

              <!-- Historical Balance Sheets -->
              <div v-if="fullData.balanceSheets.all && fullData.balanceSheets.all.length > 0">
                <h3 class="text-lg font-medium text-gray-900 mb-4">Historical Balance Sheets</h3>
                <div class="overflow-x-auto">
                  <table class="min-w-full divide-y divide-gray-200">
                    <thead class="bg-gray-50">
                      <tr>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Year</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Turnover</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Net Worth</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employees</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Share Capital</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Assets</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Staff Cost</th>
                      </tr>
                    </thead>
                    <tbody class="bg-white divide-y divide-gray-200">
                      <tr v-for="sheet in fullData.balanceSheets.all" :key="sheet.year" class="hover:bg-gray-50">
                        <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{{ sheet.year }}</td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ formatCurrency(sheet.turnover) }}</td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ formatCurrency(sheet.netWorth) }}</td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ sheet.employees || 'N/A' }}</td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ formatCurrency(sheet.shareCapital) }}</td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ formatCurrency(sheet.totalAssets) }}</td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ formatCurrency(sheet.totalStaffCost) }}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <!-- Shareholders Section -->
            <div v-if="hasShareHolders(fullData)" class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div class="flex items-center justify-between mb-6">
                <h2 class="text-xl font-semibold text-gray-900">Ownership Structure</h2>
                <span class="bg-purple-100 text-purple-800 text-sm font-medium px-3 py-1 rounded-full">
                  Shareholders
                </span>
              </div>

              <div class="space-y-4">
                <div v-for="(holder, index) in fullData.shareHolders" :key="index" class="border border-gray-200 rounded-lg p-4">
                  <div class="flex items-center justify-between">
                    <div class="flex-1">
                      <h4 class="font-medium text-gray-900">
                        {{ holder.companyName || `${holder.name} ${holder.surname}`.trim() }}
                      </h4>
                      <p class="text-sm text-gray-500">Tax Code: {{ holder.taxCode }}</p>
                    </div>
                    <div class="text-right">
                      <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                        {{ formatPercentage(holder.percentShare) }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Raw Data Toggle -->
            <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <button
                @click="showFullRawData = !showFullRawData"
                class="text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                {{ showFullRawData ? 'Hide' : 'Show' }} Raw Data
              </button>
              
              <pre v-if="showFullRawData" class="mt-4 bg-gray-50 rounded-lg p-4 text-xs overflow-auto">{{ JSON.stringify(fullData, null, 2) }}</pre>
            </div>
          </div>
        </div>

        <!-- Status Check Tab -->
        <div v-if="activeTab === 'status'" class="space-y-6">
          <div class="space-y-4">
            <div class="flex gap-4">
              <input
                v-model="pivaInput"
                type="text"
                placeholder="Enter P.IVA to check status"
                class="input-field flex-1"
                @keyup.enter="checkCompanyStatus"
              />
              <button
                @click="checkCompanyStatus"
                :disabled="!pivaInput || companyStore.isLoading"
                class="btn-primary"
              >
                <svg v-if="companyStore.isLoading" class="spinner mr-2" />
                Check Status
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
                  :disabled="!batchPivas.trim() || batchLoading"
                  class="btn-secondary"
                >
                  <svg v-if="batchLoading" class="spinner mr-2" />
                  Check Multiple
                </button>
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

          <!-- Single Status Result -->
          <div v-if="statusData" class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div class="flex items-center justify-between mb-4">
              <h2 class="text-xl font-semibold text-gray-900">Company Status</h2>
              <span :class="[
                'text-sm font-medium px-3 py-1 rounded-full',
                statusData.closed ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
              ]">
                {{ statusData.closed ? 'Closed' : 'Active' }}
              </span>
            </div>

            <div class="space-y-3">
              <div>
                <dt class="text-sm font-medium text-gray-500">P.IVA</dt>
                <dd class="text-sm text-gray-900">{{ pivaInput }}</dd>
              </div>
              <div>
                <dt class="text-sm font-medium text-gray-500">Status</dt>
                <dd class="text-sm text-gray-900">{{ statusData.closed ? 'Company is closed' : 'Company is active' }}</dd>
              </div>
              <div v-if="statusData.closed_date">
                <dt class="text-sm font-medium text-gray-500">Closed Date</dt>
                <dd class="text-sm text-gray-900">{{ formatDate(statusData.closed_date) }}</dd>
              </div>
            </div>
          </div>

          <!-- Batch Results -->
          <div v-if="batchResults.length > 0" class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 class="text-xl font-semibold text-gray-900 mb-6">Batch Status Results</h2>
            
            <div class="space-y-4">
              <div v-for="result in batchResults" :key="result.piva" class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p class="font-medium text-gray-900">{{ result.piva }}</p>
                  <p v-if="result.error" class="text-sm text-red-600">{{ result.error }}</p>
                </div>
                <span v-if="!result.error" :class="[
                  'text-sm font-medium px-3 py-1 rounded-full',
                  result.data?.closed ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                ]">
                  {{ result.data?.closed ? 'Closed' : 'Active' }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useCompanyStore } from '@/stores/company'

const companyStore = useCompanyStore()

// Reactive data
const activeTab = ref('advanced')
const pivaInput = ref('')
const batchPivas = ref('')
const batchLoading = ref(false)

// Data storage
const advancedData = ref(null)
const fullData = ref(null)
const statusData = ref(null)
const batchResults = ref([])

// UI state
const showAdvancedRawData = ref(false)
const showFullRawData = ref(false)

// Tab configuration
const tabs = [
  { id: 'advanced', label: 'Advanced Data' },
  { id: 'full', label: 'Full Report' },
  { id: 'status', label: 'Status Check' }
]

// Methods
const fetchAdvancedData = async () => {
  if (!pivaInput.value) return
  
  try {
    companyStore.clearError()
    const response = await companyStore.getCompanyAdvanced(pivaInput.value)
    advancedData.value = response.data
  } catch (error) {
    console.error('Error fetching advanced data:', error)
  }
}

const fetchFullData = async () => {
  if (!pivaInput.value) return
  
  try {
    companyStore.clearError()
    const response = await companyStore.getCompanyFull(pivaInput.value)
    fullData.value = response.data
  } catch (error) {
    console.error('Error fetching full data:', error)
  }
}

const checkCompanyStatus = async () => {
  if (!pivaInput.value) return
  
  try {
    companyStore.clearError()
    const response = await companyStore.getCompanyClosed(pivaInput.value)
    statusData.value = response.data
  } catch (error) {
    console.error('Error checking company status:', error)
  }
}

const checkBatchStatus = async () => {
  if (!batchPivas.value.trim()) return
  
  batchLoading.value = true
  batchResults.value = []
  
  const pivas = batchPivas.value
    .split('\n')
    .map(p => p.trim())
    .filter(p => p.length > 0)
  
  for (const piva of pivas) {
    try {
      const response = await companyStore.getCompanyClosed(piva)
      batchResults.value.push({
        piva,
        data: response.data,
        error: null
      })
    } catch (error) {
      batchResults.value.push({
        piva,
        data: null,
        error: error.response?.data?.message || 'Failed to check status'
      })
    }
  }
  
  batchLoading.value = false
}

// Computed properties
const flattenedAdvancedData = computed(() => {
  if (!advancedData.value) return {}
  return flattenObject(advancedData.value)
})

const flattenedFullData = computed(() => {
  if (!fullData.value) return {}
  return flattenObject(fullData.value)
})

// Utility functions
const flattenObject = (obj, prefix = '') => {
  let result = {}
  for (const key in obj) {
    // Skip complex structures that need special handling
    if (key === 'balanceSheets' || key === 'shareHolders') {
      continue
    }
    
    if (obj[key] !== null && typeof obj[key] === 'object' && !Array.isArray(obj[key])) {
      result = { ...result, ...flattenObject(obj[key], prefix + key + '.') }
    } else {
      result[prefix + key] = obj[key]
    }
  }
  return result
}

const hasBalanceSheets = (data) => {
  return data && data.balanceSheets && (data.balanceSheets.last || (data.balanceSheets.all && data.balanceSheets.all.length > 0))
}

const hasShareHolders = (data) => {
  return data && data.shareHolders && data.shareHolders.length > 0
}

const formatCurrency = (value) => {
  if (value === null || value === undefined) return 'N/A'
  return new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency: 'EUR'
  }).format(value)
}

const formatPercentage = (value) => {
  if (value === null || value === undefined) return 'N/A'
  return `${value}%`
}

const formatKey = (key) => {
  return key.replace(/[._]/g, ' ').replace(/([A-Z])/g, ' $1').trim()
}

const formatValue = (value) => {
  if (value === null || value === undefined) return 'N/A'
  if (typeof value === 'boolean') return value ? 'Yes' : 'No'
  if (typeof value === 'number') return value.toLocaleString()
  if (Array.isArray(value)) return value.map(formatValue).join(', ')
  return String(value)
}

const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  try {
    return new Date(dateString).toLocaleDateString()
  } catch {
    return dateString
  }
}
</script>
