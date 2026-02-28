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
</script>

<template>
  <div class="mx-auto min-h-screen max-w-4xl bg-gray-50 px-4 py-6">
    <!-- Back + Header -->
    <div class="mb-6 flex items-center gap-3">
      <NuxtLink
        to="/"
        class="flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm text-gray-600 transition-colors hover:bg-gray-200"
      >
        <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
        Ricerca
      </NuxtLink>
    </div>

    <!-- Loading -->
    <div v-if="status === 'pending'" class="space-y-4">
      <div class="h-8 w-64 animate-pulse rounded bg-gray-200" />
      <div class="h-4 w-40 animate-pulse rounded bg-gray-200" />
      <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div v-for="i in 4" :key="i" class="h-32 animate-pulse rounded-xl bg-gray-200" />
      </div>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="py-12 text-center">
      <svg class="mx-auto h-12 w-12 text-red-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
      <h3 class="mt-4 text-lg font-medium text-gray-900">Azienda non trovata</h3>
      <p class="mt-2 text-sm text-gray-500">Impossibile caricare i dati per P.IVA {{ piva }}.</p>
    </div>

    <!-- Company Detail -->
    <template v-else-if="data">
      <!-- Title row -->
      <div class="mb-6">
        <div class="flex items-center gap-3">
          <h1 class="text-2xl font-bold text-gray-900">{{ companyName }}</h1>
          <CompanyStatusBadge :status="activityStatus" />
        </div>
        <p class="mt-1 text-sm text-gray-500">P.IVA {{ piva }}</p>
      </div>

      <!-- Key metrics row -->
      <div class="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div class="rounded-xl bg-white p-4 text-center shadow-sm">
          <div class="text-lg font-bold text-green-600">{{ formatCurrency(turnover) }}</div>
          <div class="text-xs text-gray-500">Fatturato</div>
        </div>
        <div class="rounded-xl bg-white p-4 text-center shadow-sm">
          <div class="text-lg font-bold text-blue-600">{{ formatNumber(employees) }}</div>
          <div class="text-xs text-gray-500">Dipendenti</div>
        </div>
        <div class="rounded-xl bg-white p-4 text-center shadow-sm">
          <div class="text-lg font-bold text-purple-600">{{ enterpriseSize || 'N/D' }}</div>
          <div class="text-xs text-gray-500">Dimensione</div>
        </div>
        <div class="rounded-xl bg-white p-4 text-center shadow-sm">
          <div class="text-sm font-bold text-gray-700">{{ getAtecoLabel(atecoCode) || 'N/D' }}</div>
          <div class="text-xs text-gray-500">Settore</div>
        </div>
      </div>

      <!-- Detail sections -->
      <div class="space-y-4">
        <!-- Company Info -->
        <CompanyInfoSection title="Informazioni Azienda">
          <dl class="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <CompanyDataField label="Ragione sociale" :value="companyName" />
            <CompanyDataField label="P.IVA" :value="piva" />
            <CompanyDataField label="Indirizzo" :value="address" span />
            <CompanyDataField label="Codice ATECO" :value="formatAteco(atecoCode)" />
            <CompanyDataField label="Forma giuridica" :value="legalForm" />
            <CompanyDataField label="Data registrazione" :value="formatDate(registrationDate)" />
            <CompanyDataField label="PEC" :value="pec" />
          </dl>
        </CompanyInfoSection>

        <!-- LLM Overview -->
        <CompanyLLMOverview
          :piva="piva"
          :overview="overview"
          :loading="overviewLoading"
          :error="overviewError"
          @load="fetchOverview"
        />

        <!-- Raw data toggle -->
        <CompanyRawDataViewer :data="data" />
      </div>
    </template>
  </div>
</template>
