<template>
  <div class="card">
    <div class="flex items-center justify-between mb-6">
      <h3 class="text-lg font-semibold text-gray-900">Analytics Overview</h3>
      <div class="flex items-center space-x-2 text-sm text-gray-500">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>Last 30 days</span>
      </div>
    </div>

    <div v-if="loading" class="grid grid-cols-2 gap-6">
      <div v-for="n in 4" :key="n" class="animate-pulse">
        <div class="h-4 bg-gray-200 rounded mb-2"></div>
        <div class="h-8 bg-gray-200 rounded"></div>
      </div>
    </div>

    <div v-else class="grid grid-cols-2 gap-6">
      <div class="text-center">
        <div class="text-2xl font-bold text-gray-900 mb-1">{{ stats.totalSearches }}</div>
        <div class="text-sm text-gray-600">Total Searches</div>
        <div class="flex items-center justify-center mt-2">
          <svg class="w-4 h-4 text-green-500 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
          <span class="text-xs text-green-600">+12%</span>
        </div>
      </div>

      <div class="text-center">
        <div class="text-2xl font-bold text-gray-900 mb-1">{{ stats.companiesFound }}</div>
        <div class="text-sm text-gray-600">Companies Found</div>
        <div class="flex items-center justify-center mt-2">
          <svg class="w-4 h-4 text-green-500 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
          <span class="text-xs text-green-600">+8%</span>
        </div>
      </div>

      <div class="text-center">
        <div class="text-2xl font-bold text-gray-900 mb-1">{{ stats.reportsGenerated }}</div>
        <div class="text-sm text-gray-600">Reports Generated</div>
        <div class="flex items-center justify-center mt-2">
          <svg class="w-4 h-4 text-blue-500 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
          <span class="text-xs text-blue-600">+5%</span>
        </div>
      </div>

      <div class="text-center">
        <div class="text-2xl font-bold text-gray-900 mb-1">{{ stats.averageSearchTime }}</div>
        <div class="text-sm text-gray-600">Avg Search Time</div>
        <div class="flex items-center justify-center mt-2">
          <svg class="w-4 h-4 text-orange-500 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
          </svg>
          <span class="text-xs text-orange-600">-15%</span>
        </div>
      </div>
    </div>

    <!-- Mini Chart Area -->
    <div class="mt-6 pt-6 border-t border-gray-200">
      <div class="flex items-center justify-between text-sm">
        <span class="text-gray-600">Search activity</span>
        <span class="text-primary-600 font-medium">View details →</span>
      </div>
      <div class="mt-3 h-16 flex items-end space-x-1">
        <div
          v-for="(height, index) in chartData"
          :key="index"
          :class="['bg-primary-500 rounded-t transition-all duration-1000 delay-' + (index * 100)]"
          :style="{ height: height + '%', width: '8px' }"
        ></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

defineProps({
  stats: {
    type: Object,
    required: true
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const chartData = ref([])

onMounted(() => {
  // Generate sample chart data
  chartData.value = Array.from({ length: 20 }, () => Math.floor(Math.random() * 100) + 20)
})
</script>
