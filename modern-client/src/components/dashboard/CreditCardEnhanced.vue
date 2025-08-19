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

    <!-- Loading State -->
    <div v-if="loading" class="space-y-4">
      <div class="animate-pulse">
        <div class="h-8 bg-gray-200 rounded w-32 mb-4"></div>
        <div class="h-4 bg-gray-200 rounded w-full mb-2"></div>
        <div class="h-2 bg-gray-200 rounded w-full"></div>
      </div>
    </div>

    <!-- Credit Information -->
    <div v-else-if="creditInfo" class="space-y-4">
      <!-- Current Balance -->
      <div class="text-center">
        <div class="text-3xl font-bold text-gray-900 mb-1">
          {{ formatCredits(creditInfo.currentBalance) }}
        </div>
        <p class="text-sm text-gray-600">Available Credits</p>
      </div>

      <!-- Warning for low balance -->
      <div v-if="creditInfo.currentBalance < 10" 
           class="bg-red-50 border border-red-200 rounded-lg p-3">
        <div class="flex items-start">
          <svg class="w-4 h-4 text-red-500 mt-0.5 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/>
          </svg>
          <div>
            <p class="text-sm font-medium text-red-800">Low Credit Balance</p>
            <p class="text-xs text-red-700 mt-1">
              Please contact your administrator to add more credits
            </p>
          </div>
        </div>
      </div>

      <!-- Recent Activity Preview -->
      <div v-if="creditInfo.recentTransactions?.length" class="border-t border-gray-200 pt-4">
        <h4 class="text-sm font-medium text-gray-900 mb-3">Recent Activity</h4>
        <div class="space-y-2">
          <div v-for="transaction in creditInfo.recentTransactions.slice(0, 3)" 
               :key="transaction._id"
               class="flex items-center justify-between text-sm">
            <div class="flex items-center">
              <div class="w-2 h-2 rounded-full mr-2"
                   :class="transaction.transactionType === 'debit' ? 'bg-red-400' : 'bg-green-400'">
              </div>
              <span class="text-gray-600 truncate max-w-[120px]" :title="transaction.description">
                {{ truncateDescription(transaction.description) }}
              </span>
            </div>
            <span :class="transaction.transactionType === 'debit' ? 'text-red-600' : 'text-green-600'"
                  class="font-medium">
              {{ transaction.transactionType === 'debit' ? '-' : '+' }}{{ formatCredits(transaction.amount) }}
            </span>
          </div>
        </div>
        
        <button @click="$emit('view-details')" 
                class="text-xs text-primary-600 hover:text-primary-500 font-medium mt-2">
          View All Transactions →
        </button>
      </div>

      <!-- Actions -->
      <div class="pt-4 border-t border-gray-200">
        <button @click="$emit('refresh')" 
                class="w-full btn-secondary text-sm py-2 flex items-center justify-center">
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh Balance
        </button>
      </div>
    </div>

    <!-- Error State -->
    <div v-else class="text-center py-8">
      <svg class="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <p class="text-gray-500 text-sm">Unable to load credit information</p>
      <button @click="$emit('retry')" class="text-primary-600 hover:text-primary-500 text-sm font-medium mt-2">
        Try Again
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  creditInfo: {
    type: Object,
    default: null
  },
  loading: {
    type: Boolean,
    default: false
  }
})

defineEmits(['view-details', 'refresh', 'retry'])

const monthlyUsage = computed(() => {
  if (!props.creditInfo?.stats) return 0
  return props.creditInfo.stats.totalSpent || 0
})

const formatCredits = (credits) => {
  if (typeof credits !== 'number') return '0.00'
  return credits.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

const getServiceColor = (serviceType) => {
  const colors = {
    openapi: 'bg-blue-400',
    openai: 'bg-green-400',
    manual: 'bg-purple-400'
  }
  return colors[serviceType] || 'bg-gray-400'
}

const truncateDescription = (description) => {
  if (!description) return ''
  if (description.length <= 25) return description
  return description.substring(0, 25) + '...'
}

const getDailyUsagePercentage = () => {
  const dailyLimit = props.creditInfo?.creditSettings?.dailyLimit || 1
  const dailySpending = props.creditInfo?.dailySpending || 0
  return Math.min(Math.round((dailySpending / dailyLimit) * 100), 100)
}

const getMonthlyUsagePercentage = () => {
  const monthlyLimit = props.creditInfo?.creditSettings?.monthlyLimit || 1
  const monthlySpending = props.creditInfo?.monthlySpending || 0
  return Math.min(Math.round((monthlySpending / monthlyLimit) * 100), 100)
}
</script>
