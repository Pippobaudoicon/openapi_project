<script setup lang="ts">
import type { CompanySearchResult } from '~/stores/search'
import { getAtecoLabel } from '~/utils/ateco'

const props = defineProps<{
  company: CompanySearchResult
}>()

const vatCode = computed(() => props.company.vatCode || '')

const name = computed(() =>
  props.company.companyName || 'Azienda sconosciuta'
)

const location = computed(() => {
  const town = props.company.address?.registeredOffice?.town || props.company.address?.town || ''
  const province = props.company.address?.registeredOffice?.province || props.company.address?.province?.code || ''
  return [town, province].filter(Boolean).join(', ')
})

const sectorCode = computed(() =>
  props.company.atecoClassification?.ateco || ''
)

const sectorLabel = computed(() => {
  const code = typeof sectorCode.value === 'string' ? sectorCode.value : ''
  return getAtecoLabel(code) || ''
})

const employees = computed(() =>
  props.company.employees?.employee
)

const revenue = computed(() => {
  const turnover = props.company.ecofin?.turnover
  if (!turnover) return ''
  if (turnover >= 1_000_000) return `${(turnover / 1_000_000).toFixed(1)}M`
  if (turnover >= 1_000) return `${(turnover / 1_000).toFixed(0)}K`
  return String(turnover)
})

const status = computed(() => {
  const code = props.company.companyStatus?.activityStatus?.code || props.company.activityStatus
  if (!code) return null
  const lower = String(code).toLowerCase()
  if (lower === 'active' || lower === 'attiva') return { label: 'Attiva', color: 'bg-green-100 text-green-800' }
  if (lower === 'inactive' || lower === 'inattiva' || lower === 'cessata') return { label: 'Cessata', color: 'bg-red-100 text-red-800' }
  if (lower === 'suspended' || lower === 'sospesa') return { label: 'Sospesa', color: 'bg-yellow-100 text-yellow-800' }
  return { label: code, color: 'bg-gray-100 text-gray-800' }
})

const size = computed(() =>
  props.company.ecofin?.enterpriseSize || ''
)
</script>

<template>
  <NuxtLink
    :to="vatCode ? `/company/${vatCode}` : undefined"
    class="block rounded-lg border border-gray-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
    :class="vatCode ? 'cursor-pointer' : ''"
  >
    <div class="flex items-start justify-between gap-3">
      <div class="min-w-0 flex-1">
        <h3 class="truncate text-lg font-semibold text-gray-900">{{ name }}</h3>
        <p v-if="location" class="mt-1 text-sm text-gray-500">{{ location }}</p>
      </div>
      <span v-if="status" class="inline-flex shrink-0 items-center rounded-full px-2.5 py-0.5 text-xs font-medium" :class="status.color">
        {{ status.label }}
      </span>
    </div>

    <div class="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-sm text-gray-600">
      <span v-if="sectorCode" class="flex items-center gap-1">
        <svg class="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
        {{ sectorLabel || sectorCode }}
      </span>
      <span v-if="employees" class="flex items-center gap-1">
        <svg class="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
        {{ employees }} dipendenti
      </span>
      <span v-if="revenue" class="flex items-center gap-1">
        <svg class="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        &euro;{{ revenue }}
      </span>
      <span v-if="size" class="flex items-center gap-1 text-xs text-gray-400">
        {{ size }}
      </span>
    </div>
  </NuxtLink>
</template>
