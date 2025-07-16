<template>
  <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-xl font-semibold text-gray-900">Company Overview</h2>
      <span 
        class="text-sm font-medium px-3 py-1 rounded-full"
        :class="dataTypeClasses"
      >
        {{ dataTypeLabel }}
      </span>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div class="space-y-4">
        <div v-if="companyName">
          <dt class="text-sm font-medium text-gray-500">Company Name</dt>
          <dd class="text-lg font-semibold text-gray-900">{{ companyName }}</dd>
        </div>
        
        <div v-if="taxCode">
          <dt class="text-sm font-medium text-gray-500">Tax Code / P.IVA</dt>
          <dd class="text-sm text-gray-900">{{ taxCode }}</dd>
        </div>
        
        <div v-if="rea">
          <dt class="text-sm font-medium text-gray-500">REA</dt>
          <dd class="text-sm text-gray-900">{{ rea }}</dd>
        </div>

        <div v-if="registrationDate">
          <dt class="text-sm font-medium text-gray-500">Registration Date</dt>
          <dd class="text-sm text-gray-900">{{ formatDate(registrationDate) }}</dd>
        </div>
      </div>

      <div class="space-y-4">
        <div v-if="address">
          <dt class="text-sm font-medium text-gray-500">Legal Address</dt>
          <dd class="text-sm text-gray-900">{{ address }}</dd>
        </div>
        
        <div v-if="legalForm">
          <dt class="text-sm font-medium text-gray-500">Legal Form</dt>
          <dd class="text-sm text-gray-900">{{ legalForm }}</dd>
        </div>

        <div v-if="activityStatus">
          <dt class="text-sm font-medium text-gray-500">Activity Status</dt>
          <dd class="text-sm text-gray-900">{{ activityStatus }}</dd>
        </div>

        <div v-if="ateco">
          <dt class="text-sm font-medium text-gray-500">ATECO Classification</dt>
          <dd class="text-sm text-gray-900">{{ ateco }}</dd>
        </div>
      </div>
    </div>

    <!-- Additional info for full data -->
    <div v-if="isFullData && (employees || shareCapital)" class="mt-6 pt-6 border-t border-gray-200">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div v-if="employees" class="space-y-2">
          <dt class="text-sm font-medium text-gray-500">Employees</dt>
          <dd class="text-sm text-gray-900">{{ employees }}</dd>
        </div>
        
        <div v-if="shareCapital" class="space-y-2">
          <dt class="text-sm font-medium text-gray-500">Share Capital</dt>
          <dd class="text-sm text-gray-900">{{ formatCurrency(shareCapital) }}</dd>
        </div>
      </div>
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
    default: 'advanced' // 'advanced' or 'full'
  }
})

const isFullData = computed(() => props.dataType === 'full')

const dataTypeClasses = computed(() => ({
  'bg-blue-100 text-blue-800': props.dataType === 'advanced',
  'bg-green-100 text-green-800': props.dataType === 'full'
}))

const dataTypeLabel = computed(() => ({
  'advanced': 'Advanced Report',
  'full': 'Full Report'
}[props.dataType] || 'Report'))

// Company name extraction
const companyName = computed(() => {
  return props.data?.denominazione || 
         props.data?.companyName || 
         props.data?.companyDetails?.companyName ||
         null
})

// Tax code extraction
const taxCode = computed(() => {
  const piva = props.data?.piva || props.data?.taxCode
  const codFisc = props.data?.codice_fiscale
  
  if (piva && codFisc && piva !== codFisc) {
    return `${piva} / ${codFisc}`
  }
  return piva || codFisc || null
})

// REA extraction
const rea = computed(() => {
  return props.data?.rea || 
         props.data?.registrationNumber ||
         null
})

// Registration date extraction
const registrationDate = computed(() => {
  return props.data?.registrationDate ||
         props.data?.companyDates?.registrationDate ||
         props.data?.data_iscrizione ||
         null
})

// Address extraction
const address = computed(() => {
  // For full data
  if (props.data?.sede_legale) {
    return formatAddressObject(props.data.sede_legale)
  }
  
  // For advanced data
  if (props.data?.address?.registeredOffice) {
    const addr = props.data.address.registeredOffice
    return `${addr.streetName || ''} ${addr.streetNumber || ''}, ${addr.town || ''} ${addr.zipCode || ''} (${addr.province || ''})`
  }
  
  return null
})

// Legal form extraction
const legalForm = computed(() => {
  return props.data?.forma_giuridica ||
         props.data?.detailedLegalForm?.description ||
         props.data?.legalForm?.detailedLegalForm?.description ||
         null
})

// Activity status extraction
const activityStatus = computed(() => {
  return props.data?.stato_attivita ||
         props.data?.activityStatus ||
         props.data?.companyStatus?.activityStatus?.description ||
         null
})

// ATECO extraction
const ateco = computed(() => {
  if (props.data?.atecoClassification?.ateco) {
    const ateco = props.data.atecoClassification.ateco
    return `${ateco.code} - ${ateco.description}`
  }
  
  if (props.data?.classificazione_ateco) {
    return props.data.classificazione_ateco
  }
  
  return null
})

// Employees extraction
const employees = computed(() => {
  return props.data?.dipendenti ||
         props.data?.employees?.employee ||
         props.data?.employeesStatistic?.permanentContract ||
         null
})

// Share capital extraction
const shareCapital = computed(() => {
  return props.data?.capitale_sociale ||
         props.data?.balanceSheets?.last?.shareCapital ||
         null
})

// Utility functions
const formatAddressObject = (address) => {
  if (typeof address === 'string') return address
  
  const parts = []
  if (address.via) parts.push(address.via)
  if (address.civico) parts.push(address.civico)
  if (address.cap) parts.push(address.cap)
  if (address.comune) parts.push(address.comune)
  if (address.provincia) parts.push(`(${address.provincia})`)
  
  return parts.join(' ')
}

const formatDate = (dateStr) => {
  if (!dateStr) return null
  try {
    return new Date(dateStr).toLocaleDateString('it-IT')
  } catch {
    return dateStr
  }
}

const formatCurrency = (amount) => {
  if (!amount) return null
  return new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency: 'EUR'
  }).format(amount)
}
</script>
