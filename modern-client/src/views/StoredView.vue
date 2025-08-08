<template>
  <div class="max-w-7xl mx-auto p-4">
    <h1 class="text-2xl font-bold mb-4">Stored Companies</h1>

    <!-- Loading state -->
    <div v-if="isLoading" class="text-center py-12">Loading...</div>

    <!-- Error state -->
    <div v-else-if="error" class="text-center py-12 text-red-600">{{ error }}</div>

  <!-- Companies grid -->
    <div v-else class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
      <router-link
        v-for="rec in validCompanies"
        :key="rec.piva"
        :to="{ name: 'CompanyDetail', params: { piva: rec.piva } }"
        class="card p-4 block hover:bg-gray-50 transition"
      >
        <h2 class="text-lg font-semibold mb-2">
        {{ getCompanyName(rec) }}
        </h2>
        <p class="text-sm text-gray-600 mb-1">
            Type:
            {{ rec.searchType.toUpperCase() }}
        </p>
        <p class="text-sm text-gray-600 mb-1">VAT: {{ rec.piva }}</p>
        <p
            v-if="rec.data?.address?.registeredOffice?.town || rec.data?.address?.town"
            class="text-sm text-gray-600 mb-1"
        >
            Town:
            {{ rec.data?.address?.registeredOffice?.town ?? rec.data?.address?.town }}
        </p>
        <p
            v-if="rec.data?.address?.registeredOffice?.province || rec.data?.address?.province?.code"
            class="text-sm text-gray-600 mb-1"
        >
            Province:
            {{ rec.data?.address?.registeredOffice?.province ?? rec.data?.address?.province?.code }}
        </p>
        <p
            v-if="rec.data?.companyStatus?.activityStatus?.code || rec.data?.activityStatus"
            class="text-sm text-gray-600 mb-1"
        >
            Status:
            {{ rec.data?.companyStatus?.activityStatus?.code || rec.data?.activityStatus }}
        </p>
        <p
            v-if="rec.data?.registrationDate || rec.data?.companyDates?.registrationDate"
            class="text-sm text-gray-600 mb-1"
        >
            Registered:
            {{ (rec.data?.registrationDate ?? rec.data?.companyDates?.registrationDate)?.split('T')[0] }}
        </p>
        <p
            v-if="rec.data?.taxCodeCeased"
            class="text-sm text-gray-600 mb-1"
        >
            CLOSED
        </p>
  </router-link>
    </div>
  </div>
</template>

<script setup>
import { onMounted, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useCompanyStore } from '@/stores/company'

const store = useCompanyStore()
const { storedCompanies, isLoading, error } = storeToRefs(store)

// Only show records that have a valid piva
const validCompanies = computed(() =>
    storedCompanies.value.filter(rec =>
        rec.piva &&
        !(rec.searchType === 'closed' && rec.data?.taxCodeCeased === false)
    )
)

const getCompanyName = (rec) => {
    const name = rec.data?.companyName ?? rec.data?.companyDetails?.companyName ?? rec.piva
    return name.length > 30 ? name.slice(0, 30) + '...' : name
}

onMounted(async () => {
    await store.fetchStoredCompanies()
})
</script>
