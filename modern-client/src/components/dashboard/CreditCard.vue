<template>
  <div class="card">
    <div class="flex items-center justify-between mb-6">
      <h3 class="text-lg font-semibold text-gray-900">Credit Balance</h3>
      <div class="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
        <svg class="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
        </svg>
      </div>
    </div>

    <div v-if="loading" class="animate-pulse">
      <div class="h-8 bg-gray-200 rounded mb-4"></div>
      <div class="h-4 bg-gray-200 rounded mb-2"></div>
      <div class="h-16 bg-gray-200 rounded"></div>
    </div>

    <div v-else-if="credit">
      <div class="text-center mb-6">
        <div class="text-3xl font-bold text-gray-900 mb-2">
          {{ credit.remaining || 0 }}
        </div>
        <div class="text-sm text-gray-600">Credits remaining</div>
      </div>

      <!-- Credit Usage Progress -->
      <div class="mb-6">
        <div class="flex justify-between text-sm text-gray-600 mb-2">
          <span>Usage this month</span>
          <span>{{ used }}/{{ total }}</span>
        </div>
        <div class="w-full bg-gray-200 rounded-full h-2">
          <div 
            class="bg-primary-600 h-2 rounded-full transition-all duration-1000 ease-out"
            :style="{ width: usagePercentage + '%' }"
          ></div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="space-y-3">
        <button class="w-full btn-primary text-sm py-2">
          Purchase Credits
        </button>
        <button class="w-full btn-secondary text-sm py-2">
          View Usage History
        </button>
      </div>

      <!-- Usage Tips -->
      <div class="mt-6 p-4 bg-primary-50 rounded-xl border border-primary-200">
        <div class="flex items-start space-x-3">
          <svg class="w-5 h-5 text-primary-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <p class="text-sm font-medium text-primary-900 mb-1">Pro Tip</p>
            <p class="text-xs text-primary-700">
              Use cached results when available to save credits. Data is cached for 24 hours.
            </p>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="text-center py-8">
      <svg class="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <p class="text-gray-500 text-sm">Unable to load credit information</p>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  credit: {
    type: Object,
    default: null
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const used = computed(() => {
  if (!props.credit) return 0
  return props.credit.used || (500 - (props.credit.remaining || 0))
})

const total = computed(() => {
  if (!props.credit) return 0
  return props.credit.total || 500
})

const usagePercentage = computed(() => {
  if (total.value === 0) return 0
  return Math.min((used.value / total.value) * 100, 100)
})
</script>
