<template>
  <div class="max-w-6xl mx-auto space-y-6">
    <!-- Header -->
    <div class="text-center" v-motion-slide-visible-once-top>
      <h1 class="text-2xl font-bold text-gray-900">Credit Usage History</h1>
      <p class="text-gray-600 mt-1">Track your API usage and credit spending</p>
    </div>

    <!-- Credit Summary Cards -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6" v-motion-slide-visible-once-left>
      <div class="card">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">Current Balance</p>
            <p class="text-2xl font-bold text-gray-900">{{ formatCredits(creditInfo?.currentBalance || 0) }}</p>
          </div>
          <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
            <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
            </svg>
          </div>
        </div>
      </div>
      
      <div class="card">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">Credit Limit</p>
            <p class="text-2xl font-bold text-gray-900">{{ formatCredits(creditInfo?.creditLimit || 0) }}</p>
          </div>
          <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
            <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
        </div>
      </div>
      
      <div class="card">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">Total Spent</p>
            <p class="text-2xl font-bold text-gray-900">{{ formatCredits(creditInfo?.stats?.totalSpent || 0) }}</p>
          </div>
          <div class="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
            <svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
            </svg>
          </div>
        </div>
      </div>
    </div>

    <!-- Credit Limits & Settings -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6" v-motion-slide-visible-once-right>
      <!-- Daily & Monthly Limits -->
      <div class="card">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Spending Limits</h3>
        <div class="space-y-4">
          <div>
            <div class="flex items-center justify-between mb-2">
              <span class="text-sm font-medium text-gray-700">Daily Limit</span>
              <span class="text-sm text-gray-600">{{ formatCredits(creditInfo?.dailySpending || 0) }} / {{ formatCredits(creditInfo?.creditSettings?.dailyLimit || 0) }}</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-2">
              <div class="h-2 rounded-full transition-all duration-500 bg-blue-500" 
                   :style="{ width: getDailyUsagePercentage() + '%' }"></div>
            </div>
          </div>
          <div>
            <div class="flex items-center justify-between mb-2">
              <span class="text-sm font-medium text-gray-700">Monthly Limit</span>
              <span class="text-sm text-gray-600">{{ formatCredits(creditInfo?.monthlySpending || 0) }} / {{ formatCredits(creditInfo?.creditSettings?.monthlyLimit || 0) }}</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-2">
              <div class="h-2 rounded-full transition-all duration-500 bg-green-500" 
                   :style="{ width: getMonthlyUsagePercentage() + '%' }"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Auto-Recharge Settings -->
      <div class="card">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Auto-Recharge Settings</h3>
        <div class="space-y-3">
          <div class="flex items-center justify-between">
            <span class="text-sm font-medium text-gray-700">Status</span>
            <span class="px-2 py-1 text-xs font-medium rounded-full" 
                  :class="creditInfo?.creditSettings?.autoRecharge?.enabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'">
              {{ creditInfo?.creditSettings?.autoRecharge?.enabled ? 'Enabled' : 'Disabled' }}
            </span>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-sm font-medium text-gray-700">Threshold</span>
            <span class="text-sm text-gray-600">{{ formatCredits(creditInfo?.creditSettings?.autoRecharge?.threshold || 0) }}</span>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-sm font-medium text-gray-700">Recharge Amount</span>
            <span class="text-sm text-gray-600">{{ formatCredits(creditInfo?.creditSettings?.autoRecharge?.amount || 0) }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Service Breakdown Chart -->
    <div v-if="creditInfo?.stats?.serviceBreakdown?.length" class="card" v-motion-slide-visible-once-right>
      <h3 class="text-lg font-semibold text-gray-900 mb-4">Usage by Service</h3>
      <div class="space-y-4">
        <div v-for="service in creditInfo.stats.serviceBreakdown" :key="service.serviceType" class="flex items-center">
          <div class="flex-1">
            <div class="flex items-center justify-between mb-2">
              <div class="flex items-center">
                <div class="w-3 h-3 rounded-full mr-3" :class="getServiceColor(service.serviceType)"></div>
                <span class="text-sm font-medium text-gray-900 capitalize">{{ service.serviceType }}</span>
              </div>
              <div class="text-sm text-gray-600">
                {{ formatCredits(service.spent) }} credits ({{ service.transactions }} transactions)
              </div>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-2">
              <div class="h-2 rounded-full transition-all duration-500" 
                   :class="getServiceBgColor(service.serviceType)"
                   :style="{ width: getServicePercentage(service.spent) + '%' }"></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Filters -->
    <div class="card" v-motion-fade-visible-once>
      <h3 class="text-lg font-semibold text-gray-900 mb-4">Filter Transactions</h3>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Transaction Type</label>
          <select v-model="filters.transactionType" class="input-field">
            <option value="">All Types</option>
            <option value="debit">Debit</option>
            <option value="credit">Credit</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Date From</label>
          <input v-model="filters.dateFrom" type="date" class="input-field">
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Date To</label>
          <input v-model="filters.dateTo" type="date" class="input-field">
        </div>
      </div>
      <div class="flex gap-3 mt-4">
        <button @click="applyFilters" class="btn-primary">Apply Filters</button>
        <button @click="clearFilters" class="btn-secondary">Clear Filters</button>
        <button @click="exportTransactions" class="btn-secondary">Export CSV</button>
      </div>
    </div>

    <!-- Transactions Table -->
    <div class="card" v-motion-slide-visible-once-bottom>
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-semibold text-gray-900">Recent Transactions</h3>
        <button @click="refreshTransactions" class="text-sm text-primary-600 hover:text-primary-500 font-medium">
          Refresh
        </button>
      </div>

      <!-- Loading State -->
      <div v-if="isLoading" class="space-y-3">
        <div v-for="i in 5" :key="i" class="animate-pulse">
          <div class="h-12 bg-gray-200 rounded"></div>
        </div>
      </div>

      <!-- Transactions -->
      <div v-else-if="transactions.length" class="space-y-3">
        <div v-for="transaction in transactions" :key="transaction._id" 
             class="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
          <div class="flex items-center space-x-4">
            <div class="w-8 h-8 rounded-full flex items-center justify-center"
                 :class="transaction.transactionType === 'debit' ? 'bg-red-100' : 'bg-green-100'">
              <svg class="w-4 h-4" :class="transaction.transactionType === 'debit' ? 'text-red-600' : 'text-green-600'" 
                   fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path v-if="transaction.transactionType === 'debit'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
            </div>
            <div>
              <p class="font-medium text-gray-900">{{ transaction.description }}</p>
              <div class="flex items-center space-x-4 text-sm text-gray-600">
                <span class="capitalize">{{ transaction.serviceType }}</span>
                <span>{{ transaction.actionType }}</span>
                <span>{{ formatDate(transaction.createdAt) }}</span>
              </div>
            </div>
          </div>
          <div class="text-right">
            <p class="font-semibold" :class="transaction.transactionType === 'debit' ? 'text-red-600' : 'text-green-600'">
              {{ transaction.transactionType === 'debit' ? '-' : '+' }}{{ formatCredits(transaction.amount) }}
            </p>
            <p class="text-sm text-gray-500">
              Balance: {{ formatCredits(transaction.balanceAfter) }}
            </p>
          </div>
        </div>

        <!-- Pagination -->
        <div v-if="pagination.totalPages > 1" class="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
          <div class="text-sm text-gray-600">
            Showing {{ (pagination.page - 1) * pagination.limit + 1 }} to 
            {{ Math.min(pagination.page * pagination.limit, pagination.totalTransactions) }} of 
            {{ pagination.totalTransactions }} transactions
          </div>
          <div class="flex items-center space-x-2">
            <button @click="changePage(pagination.page - 1)" 
                    :disabled="pagination.page <= 1"
                    class="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
              Previous
            </button>
            <span class="px-3 py-1 text-sm">
              Page {{ pagination.page }} of {{ pagination.totalPages }}
            </span>
            <button @click="changePage(pagination.page + 1)" 
                    :disabled="pagination.page >= pagination.totalPages"
                    class="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
              Next
            </button>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="text-center py-8">
        <svg class="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <p class="text-gray-500">No transactions found</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useCompanyStore } from '@/stores/company'

const companyStore = useCompanyStore()

const creditInfo = ref(null)
const transactions = ref([])
const isLoading = ref(false)
const pagination = ref({
  page: 1,
  limit: 20,
  totalPages: 1,
  totalTransactions: 0
})

const filters = ref({
  transactionType: '',
  dateFrom: '',
  dateTo: ''
})

const loadCreditInfo = async () => {
  try {
    const info = await companyStore.getCredit()
    creditInfo.value = info
  } catch (error) {
    console.error('Failed to load credit info:', error)
  }
}

const loadTransactions = async (page = 1) => {
  isLoading.value = true
  try {
    const response = await companyStore.getCreditTransactions(
      page, 
      pagination.value.limit,
      filters.value.transactionType || null,
      filters.value.dateFrom || null,
      filters.value.dateTo || null
    )
    transactions.value = response.transactions
    pagination.value = response.pagination
  } catch (error) {
    console.error('Failed to load transactions:', error)
  } finally {
    isLoading.value = false
  }
}

const refreshTransactions = async () => {
  await Promise.all([loadCreditInfo(), loadTransactions(pagination.value.page)])
}

const changePage = (page) => {
  pagination.value.page = page
  loadTransactions(page)
}

const applyFilters = () => {
  pagination.value.page = 1
  loadTransactions(1)
}

const clearFilters = () => {
  filters.value = {
    transactionType: '',
    dateFrom: '',
    dateTo: ''
  }
  loadTransactions(1)
}

const exportTransactions = () => {
  // Implementation for CSV export
  const csvContent = [
    ['Date', 'Type', 'Service', 'Action', 'Amount', 'Balance', 'Description'].join(','),
    ...transactions.value.map(t => [
      formatDate(t.createdAt),
      t.transactionType,
      t.serviceType,
      t.actionType,
      t.amount,
      t.balanceAfter,
      `"${t.description}"`
    ].join(','))
  ].join('\n')
  
  const blob = new Blob([csvContent], { type: 'text/csv' })
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `credit-transactions-${new Date().toISOString().split('T')[0]}.csv`
  a.click()
  window.URL.revokeObjectURL(url)
}

const formatCredits = (credits) => {
  return Number(credits).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getServiceColor = (serviceType) => {
  const colors = {
    openapi: 'bg-blue-400',
    openai: 'bg-green-400', 
    manual: 'bg-purple-400'
  }
  return colors[serviceType] || 'bg-gray-400'
}

const getServiceBgColor = (serviceType) => {
  const colors = {
    openapi: 'bg-blue-500',
    openai: 'bg-green-500',
    manual: 'bg-purple-500'
  }
  return colors[serviceType] || 'bg-gray-500'
}

const getServicePercentage = (amount) => {
  const total = creditInfo.value?.stats?.totalSpent || 1
  return Math.round((amount / total) * 100)
}

const getDailyUsagePercentage = () => {
  const dailyLimit = creditInfo.value?.creditSettings?.dailyLimit || 1
  const dailySpending = creditInfo.value?.dailySpending || 0
  return Math.min(Math.round((dailySpending / dailyLimit) * 100), 100)
}

const getMonthlyUsagePercentage = () => {
  const monthlyLimit = creditInfo.value?.creditSettings?.monthlyLimit || 1
  const monthlySpending = creditInfo.value?.monthlySpending || 0
  return Math.min(Math.round((monthlySpending / monthlyLimit) * 100), 100)
}

onMounted(() => {
  refreshTransactions()
})
</script>
