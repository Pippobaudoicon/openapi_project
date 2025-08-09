<template>
  <div class="max-w-7xl mx-auto p-4">
    <h1 class="text-2xl font-bold mb-4">Stored Companies</h1>

        <!-- Filter controls -->
        <div class="flex flex-wrap gap-4 mb-4">
            <input
                v-model="filterText"
                type="text"
                placeholder="Filter by name or VAT"
                class="input-field flex-1 min-w-[200px]"
            />
            <select v-model="filterType" class="input-field w-48">
                <option value="all">All Types</option>
                <option v-for="type in types" :key="type" :value="type">{{ type }}</option>
            </select>
        </div>
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
            v-if="rec.data?.town"
            class="text-sm text-gray-600 mb-1"
        >
            Town:
            {{ rec.data?.town }}
        </p>
        <p
            v-if="rec.data?.province"
            class="text-sm text-gray-600 mb-1"
        >
            Province:
            {{ rec.data?.province }}
        </p>
        <p
            v-if="rec.data?.activityStatus"
            class="text-sm text-gray-600 mb-1"
        >
            Status:
            {{ rec.data?.activityStatus }}
        </p>
        <p
            v-if="rec.data?.registrationDate"
            class="text-sm text-gray-600 mb-1"
        >
            Registered:
            {{ (rec.data?.registrationDate)?.split('T')[0] }}
        </p>
        <!-- <p
            v-if="rec.data?.taxCodeCeased"
            class="text-sm text-gray-600 mb-1"
        >
            CLOSED
        </p> -->
  </router-link>
    </div>
  </div>
</template>

<script setup>
import { onMounted, computed, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useCompanyStore } from '@/stores/company'
import { useRoute } from 'vue-router'

const store = useCompanyStore()
const { storedCompanies, isLoading, error } = storeToRefs(store)

const route = useRoute()

// Filtered and valid companies list
const filterText = ref(
  Array.isArray(route.query.q)
    ? route.query.q[0]
    : route.query.q || ''
)
const filterType = ref('all')
// Possible searchType filters (excluding 'all')
const types = ['advanced', 'full', 'closed']
const validCompanies = computed(() =>
    storedCompanies.value
        // filter out invalid piva and closed status
        .filter(rec => rec.piva && !(rec.searchType === 'closed' && rec.data?.taxCodeCeased === false))
        // filter by text
        .filter(rec => {
            const term = filterText.value.toLowerCase()
            const name = (rec.data?.companyName || rec.data?.companyDetails?.companyName || '').toLowerCase()
            return !term || name.includes(term) || rec.piva.includes(term)
        })
        // filter by type
        .filter(rec => filterType.value === 'all' || rec.searchType === filterType.value)
)

const getCompanyName = (rec) => {
    const name = rec.data?.companyName ?? rec.data?.companyDetails?.companyName ?? rec.piva
    return name.length > 30 ? name.slice(0, 30) + '...' : name
}

onMounted(async () => {
    await store.fetchStoredCompanies('slim')
})
</script>
