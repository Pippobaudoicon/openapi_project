<template>
  <div class="space-y-6">
    <form @submit.prevent="performSearch" class="space-y-4">
      <!-- Main Search -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div class="lg:col-span-2">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Company name or keywords
          </label>
          <input
            v-model="searchForm.companyName"
            type="text"
            placeholder="Enter company name or keywords..."
            class="input-field"
            :disabled="loading"
          />
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Province
          </label>
          <select v-model="searchForm.province" class="input-field" :disabled="loading">
            <option value="">All provinces</option>
            <option v-for="province in provinces" :key="province" :value="province">
              {{ province }}
            </option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Data Enrichment
          </label>
          <select v-model="searchForm.dataEnrichment" class="input-field" :disabled="loading">
            <option v-for="(label, key) in enrichmentOptions" :key="key" :value="key">
              {{ label }}
            </option>
          </select>
        </div>
      </div>

      <!-- Advanced Filters -->
      <div class="border border-gray-200 rounded-xl p-4">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-sm font-medium text-gray-900">Advanced Filters</h3>
          <button
            type="button"
            @click="showAdvanced = !showAdvanced"
            class="text-sm text-primary-600 hover:text-primary-500 font-medium"
          >
            {{ showAdvanced ? 'Hide' : 'Show' }} filters
          </button>
        </div>

        <div v-if="showAdvanced" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              ATECO Code
            </label>
            <input
              v-model="searchForm.atecoCode"
              type="text"
              placeholder="e.g., 62.01"
              class="input-field"
              :disabled="loading"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Revenue Range (€)
            </label>
            <div class="grid grid-cols-2 gap-2">
              <input
                v-model="searchForm.minTurnover"
                type="number"
                placeholder="Min"
                class="input-field"
                :disabled="loading"
              />
              <input
                v-model="searchForm.maxTurnover"
                type="number"
                placeholder="Max"
                class="input-field"
                :disabled="loading"
              />
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Employee Range
            </label>
            <div class="grid grid-cols-2 gap-2">
              <input
                v-model="searchForm.minEmployees"
                type="number"
                placeholder="Min"
                class="input-field"
                :disabled="loading"
              />
              <input
                v-model="searchForm.maxEmployees"
                type="number"
                placeholder="Max"
                class="input-field"
                :disabled="loading"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Filters -->
      <div class="flex flex-wrap gap-2">
        <button
          v-for="filter in quickFilters"
          :key="filter.label"
          type="button"
          @click="applyQuickFilter(filter)"
          :class="[
            'px-4 py-2 text-sm font-medium rounded-xl border transition-all duration-200',
            isFilterActive(filter) 
              ? 'bg-primary-600 text-white border-primary-600' 
              : 'bg-white text-gray-700 border-gray-200 hover:border-primary-300 hover:bg-primary-50'
          ]"
          :disabled="loading"
        >
          {{ filter.label }}
        </button>
      </div>

      <!-- Search Button -->
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-4">
          <button
            type="submit"
            :disabled="loading || !searchForm.companyName.trim()"
            class="btn-primary flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg v-if="loading" class="spinner mr-3" />
            <svg v-else class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            {{ loading ? 'Searching...' : 'Search Companies' }}
          </button>

          <button
            type="button"
            @click="clearForm"
            class="btn-secondary"
            :disabled="loading"
          >
            Clear
          </button>
        </div>

        <div class="text-sm text-gray-500">
          Press Enter to search
        </div>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, reactive, watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const props = defineProps({
  loading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['search'])

const showAdvanced = ref(false)

const searchForm = reactive({
  companyName: '',
  province: '',
  dataEnrichment: 'name',
  atecoCode: '',
  minTurnover: '',
  maxTurnover: '',
  minEmployees: '',
  maxEmployees: ''
})

const provinces = [
  'Milano', 'Roma', 'Napoli', 'Torino', 'Bologna', 'Firenze', 'Bari', 'Genova',
  'Palermo', 'Catania', 'Verona', 'Venezia', 'Trieste', 'Brescia', 'Padova'
]

const enrichmentOptions = {
  start: 'Basic informations',
  advanced: 'Comprehensive Data',
  pec: 'Certified E-mail',
  address: 'Address Info',
  shareholders: 'Shareholders',
  name: 'Name Only'
}

const quickFilters = [
  {
    label: 'Tech Companies',
    params: { companyName: 'technology software', atecoCode: '62' }
  },
  {
    label: 'Large Companies',
    params: { minEmployees: 100 }
  },
  {
    label: 'High Revenue',
    params: { minTurnover: 1000000 }
  },
  {
    label: 'Milano Area',
    params: { provincia: 'Milano' }
  },
  {
    label: 'SMEs',
    params: { minEmployees: 10, maxEmployees: 249 }
  }
]

const performSearch = () => {
  if (!searchForm.companyName.trim()) return
  
  const searchParams = { ...searchForm }
  
  // Clean up empty values
  Object.keys(searchParams).forEach(key => {
    if (!searchParams[key]) {
      delete searchParams[key]
    }
  })
  
  emit('search', searchParams)
}

const applyQuickFilter = (filter) => {
  Object.assign(searchForm, filter.params)
  if (!searchForm.companyName && filter.params.companyName) {
    performSearch()
  }
}

const isFilterActive = (filter) => {
  return Object.keys(filter.params).every(key => {
    return searchForm[key] == filter.params[key]
  })
}

const clearForm = () => {
  Object.keys(searchForm).forEach(key => {
    searchForm[key] = ''
  })
}

// Watch for form changes to enable real-time filtering
watch(searchForm, () => {
  // Could implement debounced search here
}, { deep: true })

onMounted(() => {
  const q = Array.isArray(route.query.q)
    ? route.query.q[0]
    : route.query.q
  if (q) {
    searchForm.companyName = q
  }
})
</script>
