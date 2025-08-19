<template>
  <div class="space-y-8">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Credit Management</h1>
        <p class="text-gray-600 mt-1">Monitor your credit usage and transaction history</p>
      </div>
      <button 
        @click="refreshData"
        :disabled="loading"
        class="btn-primary flex items-center"
      >
        <svg 
          class="w-4 h-4 mr-2" 
          :class="{ 'animate-spin': loading }"
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        Refresh
      </button>
    </div>

    <!-- Credit Overview Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" v-if="creditInfo">
      <!-- Current Balance -->
      <div class="card">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <div class="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
              <svg class="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-500">Current Balance</p>
            <p class="text-2xl font-semibold text-gray-900">
              {{ formatCredits(creditInfo.currentBalance) }}
            </p>
          </div>
        </div>
      </div>

      <!-- Credit Limit -->
      <div class="card">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <div class="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-500">Credit Limit</p>
            <p class="text-2xl font-semibold text-gray-900">
              {{ formatCredits(creditInfo.creditLimit) }}
            </p>
          </div>
        </div>
      </div>

      <!-- Daily Spending -->
      <div class="card">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <div class="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
              <svg class="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707" />
              </svg>
            </div>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-500">Today's Usage</p>
            <p class="text-2xl font-semibold text-gray-900">
              {{ formatCredits(creditInfo.dailySpending) }}
            </p>
            <p class="text-xs text-gray-500" v-if="creditInfo.creditSettings?.dailyLimit">
              of {{ formatCredits(creditInfo.creditSettings.dailyLimit) }} limit
            </p>
          </div>
        </div>
      </div>

      <!-- Monthly Spending -->
      <div class="card">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <div class="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
              <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-500">This Month</p>
            <p class="text-2xl font-semibold text-gray-900">
              {{ formatCredits(creditInfo.monthlySpending) }}
            </p>
            <p class="text-xs text-gray-500" v-if="creditInfo.creditSettings?.monthlyLimit">
              of {{ formatCredits(creditInfo.creditSettings.monthlyLimit) }} limit
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-else-if="loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div v-for="n in 4" :key="n" class="card animate-pulse">
        <div class="flex items-center">
          <div class="w-8 h-8 bg-gray-200 rounded-lg"></div>
          <div class="ml-4 space-y-2">
            <div class="h-4 bg-gray-200 rounded w-24"></div>
            <div class="h-6 bg-gray-200 rounded w-16"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Transaction History -->
    <div class="card">
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-lg font-semibold text-gray-900">Transaction History</h2>
        <div class="flex items-center space-x-4">
          <!-- Filter Dropdown -->
          <select 
            v-model="filterType" 
            @change="loadTransactions"
            class="input-field text-sm"
          >
            <option value="">All Types</option>
            <option value="debit">Debits</option>
            <option value="credit">Credits</option>
            <option value="refund">Refunds</option>
          </select>
        </div>
      </div>

      <!-- Transactions Table -->
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Description
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Service
              </th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Amount
              </th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Balance After
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="transaction in transactions" :key="transaction._id" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ formatDate(transaction.createdAt) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span 
                  class="inline-flex px-2 py-1 text-xs font-semibold rounded-full"
                  :class="getTransactionTypeClass(transaction.transactionType)"
                >
                  {{ transaction.transactionType }}
                </span>
              </td>
              <td class="px-6 py-4 text-sm text-gray-900 max-w-xs truncate" :title="transaction.description">
                {{ transaction.description }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                {{ transaction.serviceType }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium"
                  :class="transaction.transactionType === 'debit' ? 'text-red-600' : 'text-green-600'">
                {{ transaction.transactionType === 'debit' ? '-' : '+' }}{{ formatCredits(transaction.amount) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                {{ formatCredits(transaction.balanceAfter) }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div class="flex items-center justify-between mt-6" v-if="pagination.totalPages > 1">
        <div class="text-sm text-gray-700">
          Showing {{ ((pagination.currentPage - 1) * 20) + 1 }} to {{ Math.min(pagination.currentPage * 20, pagination.totalItems) }} of {{ pagination.totalItems }} results
        </div>
        <div class="flex items-center space-x-2">
          <button 
            @click="loadPage(pagination.currentPage - 1)"
            :disabled="!pagination.hasPrevPage"
            class="btn-secondary text-sm"
            :class="{ 'opacity-50 cursor-not-allowed': !pagination.hasPrevPage }"
          >
            Previous
          </button>
          <span class="text-sm text-gray-700">
            Page {{ pagination.currentPage }} of {{ pagination.totalPages }}
          </span>
          <button 
            @click="loadPage(pagination.currentPage + 1)"
            :disabled="!pagination.hasNextPage"
            class="btn-secondary text-sm"
            :class="{ 'opacity-50 cursor-not-allowed': !pagination.hasNextPage }"
          >
            Next
          </button>
        </div>
      </div>

      <!-- No Transactions State -->
      <div v-if="!loading && transactions.length === 0" class="text-center py-8">
        <svg class="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
        <p class="text-gray-500">No transactions found</p>
      </div>

      <!-- Loading State for Transactions -->
      <div v-if="loading && !creditInfo" class="space-y-4">
        <div v-for="n in 5" :key="n" class="animate-pulse flex space-x-4 py-4">
          <div class="h-4 bg-gray-200 rounded w-20"></div>
          <div class="h-4 bg-gray-200 rounded w-16"></div>
          <div class="flex-1 h-4 bg-gray-200 rounded"></div>
          <div class="h-4 bg-gray-200 rounded w-16"></div>
          <div class="h-4 bg-gray-200 rounded w-20"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useCompanyStore } from '@/stores/company'

const companyStore = useCompanyStore()

const loading = ref(true)
const creditInfo = ref(null)
const transactions = ref([])
const filterType = ref('')
const pagination = ref({
  currentPage: 1,
  totalPages: 1,
  totalItems: 0,
  hasNextPage: false,
  hasPrevPage: false
})

const formatCredits = (credits) => {
  if (typeof credits !== 'number') return '0.00'
  return credits.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

const formatDate = (date) => {
  return new Date(date).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getTransactionTypeClass = (type) => {
  const classes = {
    'debit': 'bg-red-100 text-red-800',
    'credit': 'bg-green-100 text-green-800',
    'refund': 'bg-blue-100 text-blue-800'
  }
  return classes[type] || 'bg-gray-100 text-gray-800'
}

const loadTransactions = async (page = 1) => {
  try {
    const params = { page, limit: 20 }
    if (filterType.value) {
      params.type = filterType.value
    }
    
    const response = await companyStore.getCreditTransactions(page, 20, filterType.value)
    transactions.value = response.transactions || []
    pagination.value = response.pagination || {}
  } catch (error) {
    console.error('Failed to load transactions:', error)
  }
}

const loadPage = (page) => {
  if (page >= 1 && page <= pagination.value.totalPages) {
    loadTransactions(page)
  }
}

const refreshData = async () => {
  loading.value = true
  try {
    await Promise.all([
      loadCreditInfo(),
      loadTransactions(1)
    ])
  } catch (error) {
    console.error('Failed to refresh data:', error)
  } finally {
    loading.value = false
  }
}

const loadCreditInfo = async () => {
  try {
    creditInfo.value = await companyStore.getCredit()
  } catch (error) {
    console.error('Failed to load credit info:', error)
  }
}

onMounted(async () => {
  try {
    await Promise.all([
      loadCreditInfo(),
      loadTransactions(1)
    ])
  } catch (error) {
    console.error('Failed to load credit data:', error)
  } finally {
    loading.value = false
  }
})
</script>
