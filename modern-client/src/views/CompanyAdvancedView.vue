<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h1 class="text-2xl font-bold text-gray-900 mb-4">Advanced Company Data</h1>
      
      <!-- Search Input -->
      <div class="flex gap-4">
        <div class="flex-1">
          <input
            v-model="piva"
            type="text"
            placeholder="Enter P.IVA (e.g., 12345678901)"
            class="input-field"
            @keyup.enter="fetchAdvancedData"
          />
        </div>
        <button
          @click="fetchAdvancedData"
          :disabled="!piva || companyStore.isLoading"
          class="btn-primary"
        >
          <svg v-if="companyStore.isLoading" class="spinner mr-2" />
          {{ companyStore.isLoading ? 'Loading...' : 'Get Advanced Data' }}
        </button>
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

    <!-- Advanced Company Data -->
    <div v-if="advancedData" class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-xl font-semibold text-gray-900">Company Information</h2>
        <span class="bg-green-100 text-green-800 text-sm font-medium px-3 py-1 rounded-full">
          Advanced Data
        </span>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div v-for="(value, key) in flattenedData" :key="key" class="space-y-1">
          <dt class="text-sm font-medium text-gray-500 capitalize">{{ formatKey(key) }}</dt>
          <dd class="text-sm text-gray-900">{{ formatValue(value) }}</dd>
        </div>
      </div>

      <!-- Raw Data Toggle -->
      <div class="mt-6 pt-6 border-t border-gray-200">
        <button
          @click="showRawData = !showRawData"
          class="text-sm text-gray-600 hover:text-gray-900 transition-colors"
        >
          {{ showRawData ? 'Hide' : 'Show' }} Raw Data
        </button>
        
        <pre v-if="showRawData" class="mt-4 bg-gray-50 rounded-lg p-4 text-xs overflow-auto">{{ JSON.stringify(advancedData, null, 2) }}</pre>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useCompanyStore } from '@/stores/company'

const companyStore = useCompanyStore()
const piva = ref('')
const advancedData = ref(null)
const showRawData = ref(false)

const fetchAdvancedData = async () => {
  if (!piva.value) return
  
  try {
    const response = await companyStore.getCompanyAdvanced(piva.value)
    advancedData.value = response.data
  } catch (error) {
    console.error('Error fetching advanced data:', error)
  }
}

const flattenedData = computed(() => {
  if (!advancedData.value) return {}
  
  const flatten = (obj, prefix = '') => {
    let result = {}
    for (const key in obj) {
      if (obj[key] !== null && typeof obj[key] === 'object' && !Array.isArray(obj[key])) {
        result = { ...result, ...flatten(obj[key], prefix + key + '.') }
      } else {
        result[prefix + key] = obj[key]
      }
    }
    return result
  }
  
  return flatten(advancedData.value)
})

const formatKey = (key) => {
  return key.replace(/[._]/g, ' ').replace(/([A-Z])/g, ' $1').trim()
}

const formatValue = (value) => {
  if (value === null || value === undefined) return 'N/A'
  if (typeof value === 'boolean') return value ? 'Yes' : 'No'
  if (Array.isArray(value)) return value.join(', ')
  return String(value)
}
</script>
