<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h1 class="text-2xl font-bold text-gray-900 mb-4">Full Company Report</h1>
      
      <!-- Search Input -->
      <div class="flex gap-4">
        <div class="flex-1">
          <input
            v-model="piva"
            type="text"
            placeholder="Enter P.IVA (e.g., 12345678901)"
            class="input-field"
            @keyup.enter="fetchFullData"
          />
        </div>
        <button
          @click="fetchFullData"
          :disabled="!piva || companyStore.isLoading"
          class="btn-primary"
        >
          <svg v-if="companyStore.isLoading" class="spinner mr-2" />
          {{ companyStore.isLoading ? 'Loading...' : 'Get Full Report' }}
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

    <!-- Full Company Data -->
    <div v-if="fullData" class="space-y-6">
      <!-- Company Overview -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-xl font-semibold text-gray-900">Company Overview</h2>
          <span class="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">
            Full Report
          </span>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="space-y-4">
            <div v-if="fullData.denominazione">
              <dt class="text-sm font-medium text-gray-500">Company Name</dt>
              <dd class="text-lg font-semibold text-gray-900">{{ fullData.denominazione }}</dd>
            </div>
            
            <div v-if="fullData.piva">
              <dt class="text-sm font-medium text-gray-500">P.IVA</dt>
              <dd class="text-sm text-gray-900">{{ fullData.piva }}</dd>
            </div>
            
            <div v-if="fullData.codice_fiscale">
              <dt class="text-sm font-medium text-gray-500">Codice Fiscale</dt>
              <dd class="text-sm text-gray-900">{{ fullData.codice_fiscale }}</dd>
            </div>
          </div>

          <div class="space-y-4">
            <div v-if="fullData.sede_legale">
              <dt class="text-sm font-medium text-gray-500">Legal Address</dt>
              <dd class="text-sm text-gray-900">{{ formatAddress(fullData.sede_legale) }}</dd>
            </div>
            
            <div v-if="fullData.forma_giuridica">
              <dt class="text-sm font-medium text-gray-500">Legal Form</dt>
              <dd class="text-sm text-gray-900">{{ fullData.forma_giuridica }}</dd>
            </div>
          </div>
        </div>
      </div>

      <!-- Financial Data -->
      <div v-if="fullData.bilanci" class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Financial Data</h3>
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Year</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employees</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="bilancio in fullData.bilanci.slice(0, 5)" :key="bilancio.anno">
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{{ bilancio.anno }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ formatCurrency(bilancio.fatturato) }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ bilancio.dipendenti || 'N/A' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Raw Data -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <button
          @click="showRawData = !showRawData"
          class="text-sm text-gray-600 hover:text-gray-900 transition-colors mb-4"
        >
          {{ showRawData ? 'Hide' : 'Show' }} Raw Data
        </button>
        
        <pre v-if="showRawData" class="bg-gray-50 rounded-lg p-4 text-xs overflow-auto">{{ JSON.stringify(fullData, null, 2) }}</pre>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useCompanyStore } from '@/stores/company'

const companyStore = useCompanyStore()
const piva = ref('')
const fullData = ref(null)
const showRawData = ref(false)

const fetchFullData = async () => {
  if (!piva.value) return
  
  try {
    const response = await companyStore.getCompanyFull(piva.value)
    fullData.value = response.data
  } catch (error) {
    console.error('Error fetching full data:', error)
  }
}

const formatAddress = (address) => {
  if (!address) return 'N/A'
  if (typeof address === 'string') return address
  
  const parts = []
  if (address.via) parts.push(address.via)
  if (address.civico) parts.push(address.civico)
  if (address.cap) parts.push(address.cap)
  if (address.comune) parts.push(address.comune)
  if (address.provincia) parts.push(`(${address.provincia})`)
  
  return parts.join(' ')
}

const formatCurrency = (amount) => {
  if (!amount) return 'N/A'
  return new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency: 'EUR'
  }).format(amount)
}
</script>
