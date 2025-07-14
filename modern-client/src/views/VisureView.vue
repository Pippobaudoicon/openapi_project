<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h1 class="text-2xl font-bold text-gray-900 mb-4">Visure Management</h1>
      <p class="text-gray-600">Manage company visure, impresa data, and bilancio ottico requests</p>
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
        <!-- Impresa Data Tab -->
        <div v-if="activeTab === 'impresa'" class="space-y-6">
          <div class="flex gap-4">
            <input
              v-model="pivaInput"
              type="text"
              placeholder="Enter P.IVA for impresa data"
              class="input-field flex-1"
              @keyup.enter="fetchImpresaData"
            />
            <button
              @click="fetchImpresaData"
              :disabled="!pivaInput || companyStore.isLoading"
              class="btn-primary"
            >
              <svg v-if="companyStore.isLoading" class="spinner mr-2" />
              Get Impresa Data
            </button>
          </div>

          <div v-if="impresaData" class="bg-gray-50 rounded-lg p-4">
            <pre class="text-sm overflow-auto">{{ JSON.stringify(impresaData, null, 2) }}</pre>
          </div>
        </div>

        <!-- Impresa Search Tab -->
        <div v-if="activeTab === 'search'" class="space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <input
              v-model="searchParams.denominazione"
              type="text"
              placeholder="Company Name"
              class="input-field"
            />
            <input
              v-model="searchParams.provincia"
              type="text"
              placeholder="Province"
              class="input-field"
            />
            <input
              v-model="searchParams.codice_ateco"
              type="text"
              placeholder="ATECO Code"
              class="input-field"
            />
            <input
              v-model="searchParams.fatturato_min"
              type="number"
              placeholder="Min Revenue"
              class="input-field"
            />
            <input
              v-model="searchParams.fatturato_max"
              type="number"
              placeholder="Max Revenue"
              class="input-field"
            />
            <input
              v-model="searchParams.dipendenti_min"
              type="number"
              placeholder="Min Employees"
              class="input-field"
            />
          </div>

          <button
            @click="searchImpresa"
            :disabled="companyStore.isLoading"
            class="btn-primary"
          >
            <svg v-if="companyStore.isLoading" class="spinner mr-2" />
            Search Companies
          </button>

          <div v-if="searchResults" class="space-y-4">
            <h3 class="text-lg font-semibold">Search Results ({{ searchResults.length }})</h3>
            <div class="grid gap-4">
              <div
                v-for="company in searchResults.slice(0, 10)"
                :key="company.piva"
                class="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
              >
                <div class="flex justify-between items-start">
                  <div>
                    <h4 class="font-semibold text-gray-900">{{ company.denominazione }}</h4>
                    <p class="text-sm text-gray-600">P.IVA: {{ company.piva }}</p>
                    <p class="text-sm text-gray-600">{{ formatAddress(company.sede_legale) }}</p>
                  </div>
                  <button
                    @click="selectCompany(company)"
                    class="text-primary-600 hover:text-primary-800 text-sm font-medium"
                  >
                    View Details
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Bilancio Ottico Tab -->
        <div v-if="activeTab === 'bilancio'" class="space-y-6">
          <div class="space-y-4">
            <div class="flex gap-4">
              <input
                v-model="bilancioInput"
                type="text"
                placeholder="Enter P.IVA for bilancio ottico"
                class="input-field flex-1"
              />
              <button
                @click="requestBilancio"
                :disabled="!bilancioInput || companyStore.isLoading"
                class="btn-primary"
              >
                <svg v-if="companyStore.isLoading" class="spinner mr-2" />
                Request Bilancio
              </button>
              <button
                @click="checkBilancioStatus"
                :disabled="!bilancioInput || companyStore.isLoading"
                class="btn-secondary"
              >
                Check Status
              </button>
            </div>

            <div v-if="bilancioStatus" class="bg-gray-50 rounded-lg p-4">
              <h4 class="font-semibold mb-2">Bilancio Status</h4>
              <div class="space-y-2">
                <p><span class="font-medium">Status:</span> {{ bilancioStatus.stato_richiesta }}</p>
                <p><span class="font-medium">Request ID:</span> {{ bilancioStatus.id }}</p>
                <div v-if="bilancioStatus.stato_richiesta === 'Dati disponibili'">
                  <button
                    @click="downloadBilancioFiles(bilancioStatus.id)"
                    class="btn-primary mt-2"
                  >
                    Download Files
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- All Bilancio Requests -->
          <div class="border-t pt-6">
            <div class="flex justify-between items-center mb-4">
              <h3 class="text-lg font-semibold">All Bilancio Requests</h3>
              <button
                @click="loadAllBilancioRequests"
                :disabled="companyStore.isLoading"
                class="btn-secondary"
              >
                Refresh
              </button>
            </div>

            <div v-if="allBilancioRequests" class="space-y-2">
              <div
                v-for="request in allBilancioRequests"
                :key="request.id"
                class="border border-gray-200 rounded-lg p-3 flex justify-between items-center"
              >
                <div>
                  <p class="font-medium">ID: {{ request.id }}</p>
                  <p class="text-sm text-gray-600">Status: {{ request.stato_richiesta }}</p>
                </div>
                <button
                  v-if="request.stato_richiesta === 'Dati disponibili'"
                  @click="downloadBilancioFiles(request.id)"
                  class="text-primary-600 hover:text-primary-800 text-sm"
                >
                  Download
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- All Visure Tab -->
        <div v-if="activeTab === 'all'" class="space-y-6">
          <div class="flex justify-between items-center">
            <h3 class="text-lg font-semibold">All Cached Visure</h3>
            <button
              @click="loadAllVisure"
              :disabled="companyStore.isLoading"
              class="btn-secondary"
            >
              Refresh
            </button>
          </div>

          <div v-if="allVisure" class="space-y-4">
            <div
              v-for="visura in allVisure"
              :key="visura._id"
              class="border border-gray-200 rounded-lg p-4"
            >
              <div class="flex justify-between items-start">
                <div>
                  <p class="font-semibold">{{ visura.searchType.toUpperCase() }}</p>
                  <p class="text-sm text-gray-600">P.IVA: {{ visura.piva }}</p>
                  <p class="text-sm text-gray-600">Created: {{ formatDate(visura.createdAt) }}</p>
                </div>
                <span
                  :class="[
                    'px-2 py-1 text-xs rounded-full',
                    visura.status === 'complete' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  ]"
                >
                  {{ visura.status || 'completed' }}
                </span>
              </div>
            </div>
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
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useCompanyStore } from '@/stores/company'

const companyStore = useCompanyStore()

const activeTab = ref('impresa')
const tabs = [
  { id: 'impresa', label: 'Impresa Data' },
  { id: 'search', label: 'Search Companies' },
  { id: 'bilancio', label: 'Bilancio Ottico' },
  { id: 'all', label: 'All Visure' }
]

// Impresa data
const pivaInput = ref('')
const impresaData = ref(null)

// Search
const searchParams = ref({
  denominazione: '',
  provincia: '',
  codice_ateco: '',
  fatturato_min: '',
  fatturato_max: '',
  dipendenti_min: '',
  dipendenti_max: ''
})
const searchResults = ref(null)

// Bilancio
const bilancioInput = ref('')
const bilancioStatus = ref(null)
const allBilancioRequests = ref(null)

// All visure
const allVisure = ref(null)

const fetchImpresaData = async () => {
  try {
    const response = await companyStore.getImpresaData(pivaInput.value)
    impresaData.value = response.data
  } catch (error) {
    console.error('Error fetching impresa data:', error)
  }
}

const searchImpresa = async () => {
  try {
    const cleanParams = Object.fromEntries(
      Object.entries(searchParams.value).filter(([_, v]) => v !== '')
    )
    const response = await companyStore.searchImpresa(cleanParams)
    searchResults.value = response.data
  } catch (error) {
    console.error('Error searching impresa:', error)
  }
}

const requestBilancio = async () => {
  try {
    const response = await companyStore.requestBilancioOttico(bilancioInput.value)
    bilancioStatus.value = response.data
  } catch (error) {
    console.error('Error requesting bilancio:', error)
  }
}

const checkBilancioStatus = async () => {
  try {
    const response = await companyStore.getBilancioOtticoStatus(bilancioInput.value)
    bilancioStatus.value = response.data
  } catch (error) {
    console.error('Error checking bilancio status:', error)
  }
}

const downloadBilancioFiles = async (id) => {
  try {
    const blob = await companyStore.downloadBilancioOtticoFiles(id)
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `bilancio-${id}.zip`
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)
  } catch (error) {
    console.error('Error downloading files:', error)
  }
}

const loadAllBilancioRequests = async () => {
  try {
    const response = await companyStore.getAllBilancioOtticoRequests()
    allBilancioRequests.value = response.data
  } catch (error) {
    console.error('Error loading bilancio requests:', error)
  }
}

const loadAllVisure = async () => {
  try {
    const response = await companyStore.getAllVisure()
    allVisure.value = response.data
  } catch (error) {
    console.error('Error loading visure:', error)
  }
}

const selectCompany = (company) => {
  // You can navigate to company detail or do something with the selected company
  console.log('Selected company:', company)
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

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('it-IT')
}

onMounted(() => {
  loadAllVisure()
  loadAllBilancioRequests()
})
</script>
