<template>
  <div class="card">
    <div class="flex items-center justify-between mb-6">
      <h3 class="text-lg font-semibold text-gray-900">Quick Search</h3>
      <svg class="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    </div>

    <form @submit.prevent="handleSearch" class="space-y-4">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          Search companies
        </label>
        <div class="relative">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Company name, VAT number, or keywords..."
            class="input-field pr-12"
            :disabled="isLoading"
          />
          <button
            type="submit"
            :disabled="isLoading || !searchQuery.trim()"
            class="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded-lg text-primary-600 hover:bg-primary-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg v-if="isLoading" class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Quick Filters -->
      <div class="flex flex-wrap gap-2">
        <button
          v-for="filter in quickFilters"
          :key="filter.label"
          type="button"
          @click="applyQuickFilter(filter)"
          class="px-3 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full hover:bg-primary-100 hover:text-primary-700 transition-colors duration-200"
        >
          {{ filter.label }}
        </button>
      </div>
    </form>

    <!-- Recent Searches -->
    <div v-if="recentSearches.length > 0" class="mt-6 pt-6 border-t border-gray-200">
      <h4 class="text-sm font-medium text-gray-700 mb-3">Recent searches</h4>
      <div class="space-y-2">
        <button
          v-for="search in recentSearches"
          :key="search"
          @click="searchQuery = search; handleSearch()"
          class="block w-full text-left text-sm text-gray-600 hover:text-primary-600 hover:bg-primary-50 px-3 py-2 rounded-lg transition-colors duration-200"
        >
          {{ search }}
        </button>
      </div>
    </div>

    <!-- Tips -->
    <div class="mt-6 p-4 bg-gray-50 rounded-xl">
      <div class="flex items-start space-x-3">
        <svg class="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <div>
          <p class="text-sm font-medium text-gray-700 mb-1">Search Tips</p>
          <p class="text-xs text-gray-600">
            Try searching by company name, VAT number, or industry keywords for best results.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const searchQuery = ref('')
const isLoading = ref(false)

const quickFilters = [
  { label: 'Milano', query: 'provincia:Milano' },
  { label: 'Large Companies', query: 'dipendenti_min:100' },
  { label: 'High Revenue', query: 'fatturato_min:1000000' }
]

const recentSearches = ref([])

// navigate to your Search page with `q`
const handleSearch = () => {
  if (!searchQuery.value.trim()) return

  // add to recent searches
  if (!recentSearches.value.includes(searchQuery.value)) {
    recentSearches.value.unshift(searchQuery.value)
    recentSearches.value = recentSearches.value.slice(0, 5)
  }

  handleQuickSearch()
}

const applyQuickFilter = (filter) => {
  searchQuery.value = filter.query
  handleSearch()                         // fixed typo & triggers navigation
}
const handleQuickSearch = () => {
  if (searchQuery.value.trim()) {
    router.push({
      name: 'Search',
      query: { q: searchQuery.value.trim() }
    })
  }
}
</script>
