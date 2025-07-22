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
            <!-- Company Overview -->
            <CompanyOverview 
              :data="advancedData" 
              data-type="advanced" 
            />

            <!-- Financial Information -->
            <CompanyFinancials 
              :data="advancedData" 
              data-type="advanced" 
            />

            <!-- Key People & Management -->
            <CompanyPeople 
              :data="advancedData" 
              data-type="advanced" 
            />

            <!-- Contact Information -->
            <CompanyContacts 
              :data="advancedData" 
              data-type="advanced" 
            />

            <!-- Corporate Structure -->
            <CompanyStructure 
              :data="advancedData" 
              data-type="advanced" 
            />

            <!-- Raw Data -->
            <CompanyRawData 
              :data="advancedData" 
              data-type="advanced" 
            />
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
            <!-- Company Overview -->
            <CompanyOverview 
              :data="fullData" 
              data-type="full" 
            />

            <!-- Enhanced Financial Information for Full Data -->
            <CompanyFinancialsEnhanced 
              :data="fullData" 
              data-type="full" 
            />

            <!-- Key People & Management -->
            <CompanyPeople 
              :data="fullData" 
              data-type="full" 
            />

            <!-- Contact Information -->
            <CompanyContacts 
              :data="fullData" 
              data-type="full" 
            />

            <!-- Corporate Structure -->
            <CompanyStructure 
              :data="fullData" 
              data-type="full" 
            />

            <!-- Additional Data (Legal, Certifications, etc.) -->
            <CompanyAdditionalData 
              :data="fullData" 
              data-type="full" 
            />

            <!-- Raw Data -->
            <CompanyRawData 
              :data="fullData" 
              data-type="full" 
            />
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
import { onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useCompanyStore } from '@/stores/company';
import {
  CompanyOverview,
  CompanyFinancials,
  CompanyPeople,
  CompanyContacts,
  CompanyStructure,
  CompanyRawData,
  CompanyFinancialsEnhanced,
  CompanyAdditionalData
} from '@/components/company'

const route = useRoute();
const companyStore = useCompanyStore();
const pivaInput = ref(route.query.search || '');
const reportType = ref(route.query.type || 'advanced');
const activeTab = ref(reportType.value);
const reportData = ref(null);

// Reactive data
const batchPivas = ref('')
const batchLoading = ref(false)

// Data storage
const advancedData = ref(null)
const fullData = ref(null)
const statusData = ref(null)

// UI state
const batchResults = ref([])

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

const fetchReportData = async () => {
  try {
    if (reportType.value === 'advanced') {
      reportData.value = await companyStore.getCompanyAdvanced(pivaInput.value);
    } else if (reportType.value === 'full') {
      reportData.value = await companyStore.getCompanyFull(pivaInput.value);
    }
  } catch (error) {
    console.error(`Failed to fetch ${reportType.value} data:`, error);
  }
};

// Watch for changes in the route query and update the active tab and data accordingly
watch(
  () => [route.query.search, route.query.type],
  ([newSearch, newType]) => {
    if (newSearch && newType) {
      pivaInput.value = newSearch;
      reportType.value = newType;
      activeTab.value = newType;
      fetchReportData();
    }
  },
  { immediate: true }
);

const run = ref(route.query.run === 'true');

onMounted(() => {
  if (run.value) {
    if (reportType.value === 'advanced') {
      fetchAdvancedData();
    } else if (reportType.value === 'full') {
      fetchFullData();
    }
  }
});

// Utility functions for status display
const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  try {
    return new Date(dateString).toLocaleDateString()
  } catch {
    return dateString
  }
}
</script>
