<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center space-x-4" v-motion-slide-visible-once-top>
      <button @click="$router.go(-1)" class="btn-secondary">
        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Back
      </button>
      
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Details</h1>
        <p class="text-gray-600 mt-1">VAT: {{ piva }}</p>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="companyStore.isLoading" class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div class="lg:col-span-2 space-y-6">
        <div v-for="n in 3" :key="n" class="card animate-pulse">
          <div class="h-6 bg-gray-200 rounded mb-4"></div>
          <div class="space-y-2">
            <div class="h-4 bg-gray-200 rounded"></div>
            <div class="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        </div>
      </div>
      <div class="space-y-6">
        <div class="card animate-pulse">
          <div class="h-6 bg-gray-200 rounded mb-4"></div>
          <div class="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    </div>

    <!-- Company Data -->
    <div v-else-if="companyStore.currentCompany" class="grid grid-cols-1 lg:grid-cols-3 gap-6" v-motion-fade-visible-once>
      <!-- Main Content -->
      <div class="lg:col-span-2 space-y-6">
        <!-- Basic Information -->
        <div class="card">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Company Information</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="text-sm font-medium text-gray-500">Company Name</label>
              <p class="text-gray-900">{{ companyStore.currentCompany.denominazione || 'N/A' }}</p>
            </div>
            <div>
              <label class="text-sm font-medium text-gray-500">VAT Number</label>
              <p class="text-gray-900">{{ companyStore.currentCompany.piva || 'N/A' }}</p>
            </div>
            <div>
              <label class="text-sm font-medium text-gray-500">Province</label>
              <p class="text-gray-900">{{ companyStore.currentCompany.provincia || 'N/A' }}</p>
            </div>
            <div>
              <label class="text-sm font-medium text-gray-500">City</label>
              <p class="text-gray-900">{{ companyStore.currentCompany.comune || 'N/A' }}</p>
            </div>
          </div>
        </div>

        <!-- Financial Information -->
        <div class="card">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Financial Data</h3>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="text-center p-4 bg-green-50 rounded-xl">
              <div class="text-2xl font-bold text-green-600">
                {{ formatCurrency(companyStore.currentCompany.fatturato) }}
              </div>
              <div class="text-sm text-green-700">Revenue</div>
            </div>
            <div class="text-center p-4 bg-blue-50 rounded-xl">
              <div class="text-2xl font-bold text-blue-600">
                {{ companyStore.currentCompany.dipendenti || 'N/A' }}
              </div>
              <div class="text-sm text-blue-700">Employees</div>
            </div>
            <div class="text-center p-4 bg-purple-50 rounded-xl">
              <div class="text-2xl font-bold text-purple-600">
                {{ companyStore.currentCompany.codice_ateco || 'N/A' }}
              </div>
              <div class="text-sm text-purple-700">ATECO Code</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Sidebar -->
      <div class="space-y-6">
        <!-- Actions -->
        <div class="card">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Actions</h3>
          <div class="space-y-3">
            <button @click="getAdvancedReport" :disabled="companyStore.isLoading" class="w-full btn-primary">
              Get Advanced Report
            </button>
            <button @click="getFullReport" :disabled="companyStore.isLoading" class="w-full btn-secondary">
              Get Full Report
            </button>
            <button @click="getVisureReport" :disabled="companyStore.isLoading" class="w-full btn-secondary">
              Get Visure Report
            </button>
          </div>
        </div>

        <!-- Status -->
        <div class="card">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Status</h3>
          <div class="flex items-center space-x-3">
            <div :class="[
              'w-3 h-3 rounded-full',
              getStatusColor(companyStore.currentCompany.stato)
            ]"></div>
            <span class="text-gray-900">{{ formatStatus(companyStore.currentCompany.stato) }}</span>
          </div>
        </div>
      </div>

      
      <!-- LLM Overview Section -->
      <div class="lg:col-span-3 space-y-6">
        <div class="card">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">LLM Overview</h3>
          <div v-if="companyStore.currentCompany.llmOverview">
            <div class="space-y-2">
              <div class="text-sm font-medium text-gray-500">Description</div>
              <div v-if="formattedLLMOverview" v-html="formattedLLMOverview" class="prose max-w-full overflow-auto"></div>
            </div>
          </div>
          <div v-else>
            <button @click="fetchLLMOverview" :disabled="companyStore.isLoading" class="btn-primary">
              Fetch LLM Overview
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Error State -->
    <div v-else class="text-center py-12" v-motion-fade-visible-once>
      <svg class="w-16 h-16 text-red-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <h3 class="text-lg font-medium text-gray-900 mb-2">Company not found</h3>
      <p class="text-gray-600">The requested company could not be found.</p>
    </div>
  </div>
</template>

<script setup>
import { onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useCompanyStore } from '@/stores/company'
import { marked } from 'marked';

const props = defineProps({
  piva: {
    type: String,
    required: true
  }
})

const route = useRoute()
const companyStore = useCompanyStore()

const llmOverview = computed(() => companyStore.currentCompany?.llmOverview) || llmOverview.value[props.piva]

const formattedLLMOverview = computed(() => {
  if (companyStore.currentCompany?.llmOverview) {
    return marked(companyStore.currentCompany.llmOverview);
  }
  return null;
});

const fetchLLMOverview = async () => {
  try {
    if (!llmOverview.value) {
      await companyStore.getLLMOverview(props.piva)
    }
  } catch (error) {
    console.error('Failed to fetch LLM overview:', error)
  }
}

const getCompanyDetails = async () => {
  try {
    await companyStore.getCompanyDetails(props.piva)
    if (!companyStore.currentCompany) {
      console.error('Company not found')
      return
    }
  } catch (error) {
    console.error('Failed to load company details:', error)
  }
}

const getAdvancedReport = async () => {
  try {
    await companyStore.getCompanyAdvanced(props.piva)
  } catch (error) {
    console.error('Failed to get advanced report:', error)
  }
}

const getFullReport = async () => {
  try {
    await companyStore.getCompanyFull(props.piva)
  } catch (error) {
    console.error('Failed to get full report:', error)
  }
}

const getVisureReport = async () => {
  try {
    await companyStore.getVisureReport(props.piva)
  } catch (error) {
    console.error('Failed to get visure report:', error)
  }
}

const formatCurrency = (amount) => {
  if (!amount) return 'N/A'
  return new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount)
}

const getStatusColor = (status) => {
  if (!status) return 'bg-gray-300'
  if (status === 'closed'){
    return 'bg-green-500'
  }
}

const formatStatus = (status) => {
  if (!status) return 'Unknown'
  return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()
}

onMounted(async () => {
  await getCompanyDetails()
  console.log('Company details loaded:', companyStore.currentCompany.llmOverview)
})
</script>
