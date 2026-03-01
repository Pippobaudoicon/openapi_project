<script setup lang="ts">
import type { CompanySearchResult } from '~/stores/search'
import { getAtecoLabel } from '~/utils/ateco'

const props = defineProps<{
  company: CompanySearchResult
}>()

const vatCode = computed(() => props.company.vatCode || '')

const name = computed(() =>
  props.company.companyName || 'Azienda sconosciuta',
)

const location = computed(() => {
  const town = props.company.address?.registeredOffice?.town || props.company.address?.town || ''
  const province = props.company.address?.registeredOffice?.province || props.company.address?.province?.code || ''
  return [town, province].filter(Boolean).join(', ')
})

const sectorCode = computed(() =>
  props.company.atecoClassification?.ateco || '',
)

const sectorLabel = computed(() => {
  const code = typeof sectorCode.value === 'string' ? sectorCode.value : ''
  return getAtecoLabel(code) || ''
})

const employees = computed(() =>
  props.company.employees?.employee,
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
  if (lower === 'active' || lower === 'attiva') return { label: 'Attiva', dot: 'bg-emerald-400', bg: 'bg-emerald-400/10 text-emerald-600 dark:bg-emerald-400/10 dark:text-emerald-400' }
  if (lower === 'inactive' || lower === 'inattiva' || lower === 'cessata') return { label: 'Cessata', dot: 'bg-red-400', bg: 'bg-red-400/10 text-red-600 dark:bg-red-400/10 dark:text-red-400' }
  if (lower === 'suspended' || lower === 'sospesa') return { label: 'Sospesa', dot: 'bg-amber-400', bg: 'bg-amber-400/10 text-amber-600 dark:bg-amber-400/10 dark:text-amber-400' }
  return { label: code, dot: 'bg-zinc-400', bg: 'bg-zinc-400/10 text-zinc-600 dark:bg-zinc-400/10 dark:text-zinc-400' }
})

const size = computed(() =>
  props.company.ecofin?.enterpriseSize || '',
)
</script>

<template>
  <NuxtLink
    :to="vatCode ? `/company/${vatCode}` : undefined"
    class="group block rounded-xl border border-zinc-200 bg-white p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-zinc-300 hover:shadow-lg hover:shadow-zinc-200/50 dark:border-white/[0.06] dark:bg-zinc-900/50 dark:hover:border-white/[0.12] dark:hover:shadow-none"
    :class="vatCode ? 'cursor-pointer' : ''"
  >
    <div class="flex items-start justify-between gap-3">
      <div class="min-w-0 flex-1">
        <h3 class="truncate text-[15px] font-600 text-zinc-900 transition-colors group-hover:text-indigo-600 dark:text-zinc-100 dark:group-hover:text-indigo-400">
          {{ name }}
        </h3>
        <p v-if="location" class="mt-1 flex items-center gap-1 text-sm text-zinc-400 dark:text-zinc-500">
          <svg class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
            <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
          </svg>
          {{ location }}
        </p>
      </div>
      <span
        v-if="status"
        class="inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-500"
        :class="status.bg"
      >
        <span class="h-1.5 w-1.5 rounded-full" :class="status.dot" />
        {{ status.label }}
      </span>
    </div>

    <!-- Metrics -->
    <div class="mt-4 flex flex-wrap items-center gap-2">
      <span v-if="sectorCode" class="inline-flex items-center gap-1.5 rounded-lg border border-zinc-100 bg-zinc-50 px-2.5 py-1 text-xs text-zinc-600 dark:border-white/[0.04] dark:bg-white/[0.03] dark:text-zinc-400">
        <svg class="h-3 w-3 text-zinc-400 dark:text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" /></svg>
        {{ sectorLabel || sectorCode }}
      </span>
      <span v-if="employees" class="inline-flex items-center gap-1.5 rounded-lg border border-zinc-100 bg-zinc-50 px-2.5 py-1 text-xs text-zinc-600 dark:border-white/[0.04] dark:bg-white/[0.03] dark:text-zinc-400">
        <svg class="h-3 w-3 text-zinc-400 dark:text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /></svg>
        {{ employees }} dipendenti
      </span>
      <span v-if="revenue" class="inline-flex items-center gap-1.5 rounded-lg border border-zinc-100 bg-zinc-50 px-2.5 py-1 text-xs text-zinc-600 dark:border-white/[0.04] dark:bg-white/[0.03] dark:text-zinc-400">
        <svg class="h-3 w-3 text-zinc-400 dark:text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M14.25 7.756a4.5 4.5 0 100 8.488M7.5 10.5h5.25m-5.25 3h5.25M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        &euro;{{ revenue }}
      </span>
      <span v-if="size" class="text-[11px] text-zinc-400 dark:text-zinc-600">
        {{ size }}
      </span>
    </div>
  </NuxtLink>
</template>
