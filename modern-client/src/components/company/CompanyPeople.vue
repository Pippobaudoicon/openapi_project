<template>
  <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
    <h3 class="text-lg font-semibold text-gray-900 mb-6">Key People & Management</h3>
    
    <!-- Managers Section -->
    <div v-if="managers.length > 0" class="mb-6">
      <h4 class="text-md font-medium text-gray-700 mb-4">Managers & Directors</h4>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div v-for="manager in managers" :key="manager.id || manager.name" 
             class="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <div class="flex items-start space-x-3">
            <div class="flex-shrink-0">
              <div class="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                </svg>
              </div>
            </div>
            <div class="flex-1 min-w-0">
              <h5 class="text-sm font-medium text-gray-900 truncate">{{ manager.name }}</h5>
              <p v-if="manager.role" class="text-sm text-gray-600">{{ manager.role }}</p>
              <p v-if="manager.birthDate" class="text-xs text-gray-500">Born: {{ formatDate(manager.birthDate) }}</p>
              <p v-if="manager.taxCode" class="text-xs text-gray-500">Tax Code: {{ manager.taxCode }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Shareholders Section -->
    <div v-if="shareholders.length > 0" class="mb-6">
      <h4 class="text-md font-medium text-gray-700 mb-4">Shareholders</h4>
      <div class="space-y-3">
        <div v-for="shareholder in shareholders" :key="shareholder.companyName || shareholder.name" 
             class="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200">
          <div class="flex items-center justify-between">
            <div class="flex-1">
              <h5 class="text-sm font-medium text-gray-900">{{ shareholder.name || shareholder.companyName }}</h5>
              <p v-if="shareholder.type" class="text-sm text-gray-600">{{ shareholder.type }}</p>
              <p v-if="shareholder.taxCode" class="text-xs text-gray-500">{{ shareholder.taxCode }}</p>
            </div>
            <div v-if="shareholder.percentShare" class="text-right">
              <span class="text-lg font-semibold text-green-700">{{ shareholder.percentShare }}%</span>
              <p class="text-xs text-gray-500">Share</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Legal Representatives -->
    <div v-if="legalReps.length > 0" class="mb-6">
      <h4 class="text-md font-medium text-gray-700 mb-4">Legal Representatives</h4>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div v-for="rep in legalReps" :key="rep.id || rep.name" 
             class="bg-purple-50 rounded-lg p-4 border border-purple-200">
          <div class="flex items-start space-x-3">
            <div class="flex-shrink-0">
              <div class="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <svg class="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
            </div>
            <div class="flex-1">
              <h5 class="text-sm font-medium text-gray-900">{{ rep.name }}</h5>
              <p v-if="rep.role" class="text-sm text-gray-600">{{ rep.role }}</p>
              <p v-if="rep.powers" class="text-xs text-gray-500">{{ rep.powers }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- No Data Available -->
    <div v-if="!hasAnyData" class="text-center py-8 text-gray-500">
      <svg class="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
      </svg>
      <p>No management or shareholder information available</p>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  data: {
    type: Object,
    required: true
  },
  dataType: {
    type: String,
    default: 'advanced'
  }
})

// Extract managers data
const managers = computed(() => {
  const managersData = []
  
  // For full data (dirigenti/managers array)
  if (props.data?.dirigenti && Array.isArray(props.data.dirigenti)) {
    props.data.dirigenti.forEach(dirigente => {
      managersData.push({
        name: dirigente.nome_cognome || dirigente.nome || 'N/A',
        role: dirigente.qualifica || dirigente.ruolo || 'Manager',
        birthDate: dirigente.data_nascita,
        taxCode: dirigente.codice_fiscale,
        id: dirigente.id
      })
    })
  }
  
  // For advanced data (managers array)
  if (props.data?.managers && Array.isArray(props.data.managers)) {
    props.data.managers.forEach(manager => {
      managersData.push({
        name: manager.name || manager.fullName || 'N/A',
        role: manager.role || manager.position || 'Manager',
        birthDate: manager.birthDate,
        taxCode: manager.taxCode || manager.fiscalCode,
        id: manager.id
      })
    })
  }
  
  return managersData
})

// Extract shareholders data
const shareholders = computed(() => {
  const shareholdersData = []
  
  // For full data (azionisti/shareholders array)
  if (props.data?.azionisti && Array.isArray(props.data.azionisti)) {
    props.data.azionisti.forEach(azionista => {
      shareholdersData.push({
        name: azionista.denominazione || azionista.nome || 'N/A',
        percentage: azionista.percentuale || azionista.quota,
        type: azionista.tipo || 'Shareholder',
        taxCode: azionista.codice_fiscale || azionista.partita_iva,
        id: azionista.id
      })
    })
  }
  
  // For advanced data (shareholders array)
  if (props.data?.shareholders && Array.isArray(props.data.shareholders)) {
    props.data.shareholders.forEach(shareholder => {
      if (shareholder.shareholdersInformation && Array.isArray(shareholder.shareholdersInformation)) {
        shareholder.shareholdersInformation.forEach(info => {
          shareholdersData.push({
            name: info.companyName || info.name || 'N/A',
            percentage: info.percentage || info.sharePercentage,
            type: info.type || 'Shareholder',
            taxCode: info.taxCode || info.vatNumber,
            id: info.id || `${shareholder.id}-${info.companyName}`
          })
        })
      }
    })
  }
  
  return shareholdersData
})

// Extract legal representatives
const legalReps = computed(() => {
  const repsData = []
  
  // For full data (rappresentanti_legali array)
  if (props.data?.rappresentanti_legali && Array.isArray(props.data.rappresentanti_legali)) {
    props.data.rappresentanti_legali.forEach(rep => {
      repsData.push({
        name: rep.nome_cognome || rep.nome || 'N/A',
        role: rep.qualifica || 'Legal Representative',
        powers: rep.poteri || rep.descrizione_poteri,
        id: rep.id
      })
    })
  }
  
  // For advanced data, check if managers have legal powers
  if (props.data?.managers && Array.isArray(props.data.managers)) {
    props.data.managers.forEach(manager => {
      if (manager.isLegalRepresentative || manager.legalPowers) {
        repsData.push({
          name: `${manager.name || 'N/A'} ${manager.surname || 'N/A'}`,
          role: 'Legal Representative',
          powers: manager.legalPowers || 'Legal representation',
          id: `legal-${manager.id}`
        })
      }
    })
  }
  
  return repsData
})

// Check if any data is available
const hasAnyData = computed(() => 
  managers.value.length > 0 || 
  shareholders.value.length > 0 || 
  legalReps.value.length > 0
)

// Utility functions
const formatDate = (dateStr) => {
  if (!dateStr) return null
  try {
    return new Date(dateStr).toLocaleDateString('it-IT')
  } catch {
    return dateStr
  }
}
</script>
