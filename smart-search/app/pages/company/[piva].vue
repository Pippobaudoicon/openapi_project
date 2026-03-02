<script setup lang="ts">
import { formatCurrency, formatNumber, formatDate } from '~/utils/format'
import { formatAteco, getAtecoLabel } from '~/utils/ateco'

const route = useRoute()
const piva = computed(() => route.params.piva as string)

const { company, status, error, overview, overviewLoading, overviewError, fetchOverview } = useCompany(piva)

const data = computed(() => company.value?.data)

const companyName = computed(() =>
  data.value?.companyName || data.value?.companyDetails?.companyName || piva.value,
)

const address = computed(() => {
  const addr = data.value?.address
  if (!addr) return null
  const street = addr.streetName || addr.registeredOffice?.streetName || ''
  const town = addr.town || addr.registeredOffice?.town || ''
  const zip = addr.zipCode || addr.registeredOffice?.zipCode || ''
  const prov = addr.province?.code || addr.registeredOffice?.province || ''
  return [street, `${town} ${zip}`.trim(), prov ? `(${prov})` : ''].filter(Boolean).join(', ')
})

const atecoCode = computed(() => data.value?.atecoClassification?.ateco?.code || data.value?.atecoClassification?.ateco)
const turnover = computed(() => data.value?.ecofin?.turnover)
const employees = computed(() => data.value?.employees?.employee)
const enterpriseSize = computed(() => data.value?.ecofin?.enterpriseSize)
const activityStatus = computed(() =>
  data.value?.companyStatus?.activityStatus?.description
  || data.value?.companyStatus?.activityStatus?.code
  || data.value?.activityStatus,
)
const registrationDate = computed(() => data.value?.registrationDate || data.value?.companyDates?.registrationDate)
const legalForm = computed(() => data.value?.legalForm?.description)
const pec = computed(() => data.value?.digitalAddress?.digitalAddress)

// Auto-fetch LLM overview once company data loads
watch(data, (val) => {
  if (val && !overview.value) fetchOverview()
}, { immediate: true })

const metrics = computed(() => [
  {
    value: formatCurrency(turnover.value),
    label: 'Fatturato',
    icon: 'M14.25 7.756a4.5 4.5 0 100 8.488M7.5 10.5h5.25m-5.25 3h5.25M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
    accent: 'text-emerald-500 dark:text-emerald-400',
    ring: 'ring-emerald-500/20 dark:ring-emerald-400/20',
    bg: 'bg-emerald-500/5 dark:bg-emerald-400/5',
  },
  {
    value: formatNumber(employees.value),
    label: 'Dipendenti',
    icon: 'M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z',
    accent: 'text-blue-500 dark:text-blue-400',
    ring: 'ring-blue-500/20 dark:ring-blue-400/20',
    bg: 'bg-blue-500/5 dark:bg-blue-400/5',
  },
  {
    value: enterpriseSize.value || 'N/D',
    label: 'Dimensione',
    icon: 'M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5M9 11.25v1.5M12 9v3.75m3-6v6',
    accent: 'text-violet-500 dark:text-violet-400',
    ring: 'ring-violet-500/20 dark:ring-violet-400/20',
    bg: 'bg-violet-500/5 dark:bg-violet-400/5',
  },
  {
    value: getAtecoLabel(atecoCode.value) || 'N/D',
    label: 'Settore',
    icon: 'M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21',
    accent: 'text-amber-500 dark:text-amber-400',
    ring: 'ring-amber-500/20 dark:ring-amber-400/20',
    bg: 'bg-amber-500/5 dark:bg-amber-400/5',
  },
])
</script>

<template>
  <div class="min-h-screen px-4 pb-12 pt-6">
    <div class="mx-auto max-w-4xl">
      <!-- Back button -->
      <div class="mb-8 animate-fade-in">
        <NuxtLink
          to="/"
          class="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm text-zinc-500 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
        >
          <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          Ricerca
        </NuxtLink>
      </div>

      <!-- Loading -->
      <div v-if="status === 'pending'" class="space-y-6 animate-fade-in">
        <div class="h-8 w-72 rounded-lg bg-zinc-200 dark:bg-zinc-800 skeleton-shimmer" />
        <div class="h-4 w-40 rounded-md bg-zinc-200 dark:bg-zinc-800 skeleton-shimmer" />
        <div class="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div v-for="i in 4" :key="i" class="h-28 rounded-2xl bg-zinc-200 dark:bg-zinc-800 skeleton-shimmer" />
        </div>
      </div>

      <!-- Error -->
      <div v-else-if="error" class="py-16 text-center animate-fade-in">
        <div class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 dark:bg-red-400/10">
          <svg class="h-7 w-7 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
        </div>
        <h3 class="text-base font-600 text-zinc-900 dark:text-zinc-100">Azienda non trovata</h3>
        <p class="mt-2 text-sm text-zinc-500 dark:text-zinc-400">Impossibile caricare i dati per P.IVA {{ piva }}.</p>
      </div>

      <!-- Company Detail -->
      <template v-else-if="data">
        <!-- Header -->
        <div class="mb-8 animate-slide-up opacity-0">
          <div class="flex items-start gap-3">
            <div class="min-w-0 flex-1">
              <h1 class="text-2xl font-700 tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-3xl">
                {{ companyName }}
              </h1>
              <p class="mt-1.5 flex items-center gap-2 text-sm text-zinc-400 dark:text-zinc-500">
                <span class="font-mono text-xs">P.IVA {{ piva }}</span>
              </p>
            </div>
            <CompanyStatusBadge :status="activityStatus" />
          </div>
        </div>

        <!-- Key metrics -->
        <div
          class="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4 animate-slide-up opacity-0"
          style="animation-delay: 80ms"
        >
          <div
            v-for="(metric, i) in metrics"
            :key="i"
            class="group relative overflow-hidden rounded-2xl border border-zinc-200 p-4 transition-all hover:border-zinc-300 dark:border-white/[0.06] dark:hover:border-white/[0.1]"
            :class="metric.bg"
          >
            <div class="mb-2 flex items-center justify-between">
              <svg
                class="h-4 w-4"
                :class="metric.accent"
                fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"
              >
                <path stroke-linecap="round" stroke-linejoin="round" :d="metric.icon" />
              </svg>
            </div>
            <div class="text-lg font-700 text-zinc-900 dark:text-zinc-50">
              {{ metric.value }}
            </div>
            <div class="mt-0.5 text-xs text-zinc-400 dark:text-zinc-500">
              {{ metric.label }}
            </div>
          </div>
        </div>

        <!-- Detail sections -->
        <div class="space-y-4">
          <!-- Company Info -->
          <div class="animate-slide-up opacity-0" style="animation-delay: 160ms">
            <CompanyInfoSection title="Informazioni Azienda">
              <dl class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <CompanyDataField label="Ragione sociale" :value="companyName" />
                <CompanyDataField label="P.IVA" :value="piva" />
                <CompanyDataField label="Indirizzo" :value="address" span />
                <CompanyDataField label="Codice ATECO" :value="formatAteco(atecoCode)" />
                <CompanyDataField label="Forma giuridica" :value="legalForm" />
                <CompanyDataField label="Data registrazione" :value="formatDate(registrationDate)" />
                <CompanyDataField label="PEC" :value="pec" />
              </dl>
            </CompanyInfoSection>
          </div>

          <!-- LLM Overview -->
          <div class="animate-slide-up opacity-0" style="animation-delay: 240ms">
            <CompanyLLMOverview
              :piva="piva"
              :overview="overview"
              :loading="overviewLoading"
              :error="overviewError"
              @load="(force?: boolean) => fetchOverview(force)"
            />
          </div>

          <!-- Raw data toggle -->
          <div class="animate-slide-up opacity-0" style="animation-delay: 320ms">
            <CompanyRawDataViewer :data="data" />
          </div>
        </div>
      </template>
    </div>
  </div>
</template>
