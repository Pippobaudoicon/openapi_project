<template>
  <div class="card card-hover group cursor-pointer" @click="$emit('view-details', company)">
    <div class="flex items-start space-x-4">
      <!-- Company Icon -->
      <div class="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-primary-200 transition-colors duration-200">
        <svg class="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      </div>

      <!-- Company Info -->
      <div class="flex-1 min-w-0">
        <div class="flex items-start justify-between">
          <div class="flex-1 min-w-0">
            <h3 class="text-lg font-semibold text-gray-900 group-hover:text-primary-600 transition-colors duration-200 truncate">
              {{ company.companyName || company.company_name }}
            </h3>
            
            <div class="mt-1 space-y-1">
              <p v-if="company.vatCode || company.taxCode" class="text-sm text-gray-600">
                <span class="font-medium">VAT:</span> {{ company.vatCode || company.taxCode }}
              </p>
              
              <p v-if="company.address?.registeredOffice?.town" class="text-sm text-gray-600">
                <span class="font-medium">City:</span> {{ company.address.registeredOffice.town }}
              </p>
            </div>
          </div>

          <!-- Status & Actions -->
          <div class="flex items-center space-x-2 ml-4">
            <div :class="[
              'px-2 py-1 text-xs font-medium rounded-full',
              getStatusColor(company.stato || company.status)
            ]">
              {{ formatStatus(company.stato || company.status) }}
            </div>
            
            <div class="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </div>

        <!-- Additional Info -->
        <div class="mt-3 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div v-if="company.fatturato || company.revenue" class="flex items-center space-x-2">
            <svg class="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
            </svg>
            <span class="text-gray-600">{{ formatCurrency(company.fatturato || company.revenue) }}</span>
          </div>

          <div v-if="company.dipendenti || company.employees" class="flex items-center space-x-2">
            <svg class="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span class="text-gray-600">{{ company.dipendenti || company.employees }} employees</span>
          </div>

          <div v-if="company.codice_ateco || company.ateco_code" class="flex items-center space-x-2">
            <svg class="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <span class="text-gray-600">{{ company.codice_ateco || company.ateco_code }}</span>
          </div>

          <div v-if="company.data_iscrizione || company.founded_date" class="flex items-center space-x-2">
            <svg class="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span class="text-gray-600">{{ formatDate(company.data_iscrizione || company.founded_date) }}</span>
          </div>
        </div>

        <!-- Tags -->
        <div v-if="company.tags || company.industry" class="mt-3 flex flex-wrap gap-1">
          <span
            v-for="tag in getTags(company)"
            :key="tag"
            class="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full"
          >
            {{ tag }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { format } from 'date-fns'

defineProps({
  company: {
    type: Object,
    required: true
  }
})

defineEmits(['view-details'])

const getStatusColor = (status) => {
  switch (status?.toLowerCase()) {
    case 'active':
    case 'attiva':
      return 'bg-green-100 text-green-700'
    case 'inactive':
    case 'inattiva':
      return 'bg-red-100 text-red-700'
    case 'suspended':
    case 'sospesa':
      return 'bg-yellow-100 text-yellow-700'
    default:
      return 'bg-gray-100 text-gray-700'
  }
}

const formatStatus = (status) => {
  if (!status) return 'Unknown'
  return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()
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

const formatDate = (date) => {
  if (!date) return 'N/A'
  try {
    return format(new Date(date), 'MMM yyyy')
  } catch {
    return date
  }
}

const getTags = (company) => {
  const tags = []
  
  if (company.tags) {
    tags.push(...company.tags)
  }
  
  if (company.industry) {
    tags.push(company.industry)
  }
  
  if (company.codice_ateco || company.ateco_code) {
    const ateco = company.codice_ateco || company.ateco_code
    if (ateco.startsWith('62')) tags.push('Technology')
    else if (ateco.startsWith('47')) tags.push('Retail')
    else if (ateco.startsWith('56')) tags.push('Food & Beverage')
    else if (ateco.startsWith('41')) tags.push('Construction')
  }
  
  // Size category
  const employees = company.dipendenti || company.employees
  if (employees) {
    if (employees < 10) tags.push('Micro')
    else if (employees < 50) tags.push('Small')
    else if (employees < 250) tags.push('Medium')
    else tags.push('Large')
  }
  
  return tags.slice(0, 3) // Limit to 3 tags
}
</script>
