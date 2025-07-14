<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between" v-motion-slide-visible-once-top>
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Company Search</h1>
        <p class="text-gray-600 mt-1">Find detailed business information and reports</p>
      </div>
    </div>

    <!-- Search Form -->
    <div class="card" v-motion-slide-visible-once-bottom>
      <SearchForm @search="handleSearch" :loading="companyStore.isLoading" />
    </div>

    <!-- Results -->
    <div v-if="companyStore.hasResults" class="space-y-4" v-motion-fade-visible-once>
      <div class="flex items-center justify-between">
        <h2 class="text-lg font-semibold text-gray-900">
          Search Results ({{ companyStore.totalResults }})
        </h2>
        <div class="flex items-center space-x-2">
          <button class="btn-secondary text-sm py-2">
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-4-4m4 4l4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Export Results
          </button>
        </div>
      </div>

      <div class="grid grid-cols-1 gap-4">
        <CompanyCard
          v-for="company in companyStore.searchResults"
          :key="company.piva || company.id"
          :company="company"
          @view-details="viewCompanyDetails"
        />
      </div>
    </div>

    <!-- Empty State -->
    <div v-else-if="!companyStore.isLoading" class="text-center py-12" v-motion-fade-visible-once>
      <svg class="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
      <h3 class="text-lg font-medium text-gray-900 mb-2">Start your search</h3>
      <p class="text-gray-600">Enter search criteria above to find companies</p>
    </div>

    <!-- Loading State -->
    <div v-if="companyStore.isLoading" class="space-y-4">
      <div v-for="n in 3" :key="n" class="card animate-pulse">
        <div class="flex space-x-4">
          <div class="w-12 h-12 bg-gray-200 rounded-lg"></div>
          <div class="flex-1 space-y-2">
            <div class="h-4 bg-gray-200 rounded w-3/4"></div>
            <div class="h-3 bg-gray-200 rounded w-1/2"></div>
            <div class="h-3 bg-gray-200 rounded w-2/3"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCompanyStore } from '@/stores/company'
import SearchForm from '@/components/search/SearchForm.vue'
import CompanyCard from '@/components/search/CompanyCard.vue'

const route = useRoute()
const router = useRouter()
const companyStore = useCompanyStore()

const handleSearch = async (searchParams) => {
  try {
    await companyStore.searchCompanies(searchParams)
  } catch (error) {
    console.error('Search failed:', error)
  }
}

const viewCompanyDetails = (company) => {
  router.push({
    name: 'CompanyDetail',
    params: { piva: company.piva || company.vat_number }
  })
}

onMounted(() => {
  // Check if there's a query parameter and perform search
  if (route.query.q) {
    handleSearch({ q: route.query.q })
  }
})
</script>
