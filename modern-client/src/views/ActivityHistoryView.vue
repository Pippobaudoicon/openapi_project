<template>
  <div class="max-w-6xl mx-auto space-y-6">
    <!-- Header -->
    <div class="text-center" v-motion-slide-visible-once-top>
      <h1 class="text-2xl font-bold text-gray-900">Activity History</h1>
      <p class="text-gray-600 mt-1">Track your account activity and usage statistics</p>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6" v-motion-slide-visible-once-left>
      <div class="card">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">Total Activities</p>
            <p class="text-2xl font-bold text-gray-900">{{ stats.totalActivities || 0 }}</p>
          </div>
          <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
            <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">Searches</p>
            <p class="text-2xl font-bold text-gray-900">{{ stats.searchCount || 0 }}</p>
          </div>
          <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
            <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">Company Reports</p>
            <p class="text-2xl font-bold text-gray-900">{{ stats.companyReportsCount || 0 }}</p>
          </div>
          <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
            <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">Daily Average</p>
            <p class="text-2xl font-bold text-gray-900">{{ stats.averagePerDay || 0 }}</p>
          </div>
          <div class="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
            <svg class="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
      </div>
    </div>

    <!-- Filters -->
    <div class="card" v-motion-fade-visible-once>
      <h3 class="text-lg font-semibold text-gray-900 mb-4">Filter Activities</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Activity Type</label>
          <select v-model="filters.type" class="input-field">
            <option value="">All Types</option>
            <option value="search">Search</option>
            <option value="company_advanced">Company Advanced</option>
            <option value="company_full">Company Full</option>
            <option value="company_status">Company Status</option>
            <option value="llm_overview">LLM Financial Overview</option>
            <option value="visure_request">Visure Request</option>
            <option value="bilancio_request">Bilancio Request</option>
            <option value="file_download">File Download</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
          <input 
            v-model="filters.startDate" 
            type="date" 
            class="input-field"
            :max="filters.endDate || getCurrentDate()"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">End Date</label>
          <input 
            v-model="filters.endDate" 
            type="date" 
            class="input-field"
            :min="filters.startDate"
            :max="getCurrentDate()"
          />
        </div>
        <div class="flex items-end space-x-3">
          <button @click="applyFilters" class="btn-primary flex-1">Apply Filters</button>
          <button @click="clearFilters" class="btn-secondary flex-1">Clear</button>
        </div>
      </div>
      
      <!-- Quick Date Filters -->
      <div class="mt-4 pt-4 border-t border-gray-200">
        <p class="text-sm font-medium text-gray-700 mb-2">Quick Date Filters</p>
        <div class="flex flex-wrap gap-2">
          <button @click="setQuickDateFilter('today')" class="btn-outline-sm">Today</button>
          <button @click="setQuickDateFilter('yesterday')" class="btn-outline-sm">Yesterday</button>
          <button @click="setQuickDateFilter('last7days')" class="btn-outline-sm">Last 7 days</button>
          <button @click="setQuickDateFilter('last30days')" class="btn-outline-sm">Last 30 days</button>
          <button @click="setQuickDateFilter('thismonth')" class="btn-outline-sm">This month</button>
          <button @click="setQuickDateFilter('lastmonth')" class="btn-outline-sm">Last month</button>
        </div>
      </div>
    </div>

    <!-- Activities List -->
    <div class="card" v-motion-slide-visible-once-bottom>
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-semibold text-gray-900">Activity History</h3>
        <button @click="refreshActivities" class="text-sm text-primary-600 hover:text-primary-500 font-medium">
          Refresh
        </button>
      </div>

      <!-- Loading State -->
      <div v-if="isLoading" class="space-y-3">
        <div v-for="i in 10" :key="i" class="animate-pulse">
          <div class="h-16 bg-gray-200 rounded"></div>
        </div>
      </div>

      <!-- Activities -->
      <div v-else-if="activities.length" class="space-y-3">
        <div v-for="activity in activities" :key="activity._id" 
             class="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
          <div class="flex items-center space-x-4">
            <div :class="['w-10 h-10 rounded-lg flex items-center justify-center', getActivityColorClass(activity.type)]">
              <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="getActivityIcon(activity.type)" />
              </svg>
            </div>
            <div>
              <p class="font-medium text-gray-900">{{ activity.description }}</p>
              <div class="flex items-center space-x-4 text-sm text-gray-600">
                <span class="capitalize">{{ formatActivityType(activity.type) }}</span>
                <span>{{ formatDate(activity.createdAt) }}</span>
              </div>
            </div>
          </div>
          <div class="text-right">
            <span class="px-2 py-1 text-xs font-medium rounded-full" 
                  :class="getActivityBadgeClass(activity.type)">
              {{ activity.action }}
            </span>
          </div>
        </div>

        <!-- Pagination -->
        <div v-if="pagination.totalPages > 1" class="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
          <div class="text-sm text-gray-600">
            Showing {{ (pagination.page - 1) * pagination.limit + 1 }} to 
            {{ Math.min(pagination.page * pagination.limit, pagination.total) }} of 
            {{ pagination.total }} activities
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
        <p class="text-gray-500">No activities found</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useActivityStore } from '@/stores/activity'

const activityStore = useActivityStore()

const stats = ref({})
const activities = ref([])
const isLoading = ref(false)
const pagination = ref({
  page: 1,
  limit: 20,
  total: 0,
  totalPages: 1
})

const filters = ref({
  type: '',
  startDate: '',
  endDate: ''
})

const loadStats = async () => {
  try {
    stats.value = await activityStore.getActivityStats()
  } catch (error) {
    console.error('Failed to load activity stats:', error)
  }
}

const loadActivities = async (page = 1) => {
  isLoading.value = true
  try {
    const response = await activityStore.getActivityHistory(
      page, 
      pagination.value.limit,
      filters.value.type || null,
      filters.value.startDate || null,
      filters.value.endDate || null
    )
    activities.value = response.activities
    pagination.value = response.pagination
  } catch (error) {
    console.error('Failed to load activities:', error)
  } finally {
    isLoading.value = false
  }
}

const refreshActivities = async () => {
  await Promise.all([loadStats(), loadActivities(pagination.value.page)])
}

const changePage = (page) => {
  pagination.value.page = page
  loadActivities(page)
}

const applyFilters = () => {
  pagination.value.page = 1
  loadActivities(1)
}

const clearFilters = () => {
  filters.value = { 
    type: '',
    startDate: '',
    endDate: ''
  }
  loadActivities(1)
}

const getCurrentDate = () => {
  return new Date().toISOString().split('T')[0]
}

const setQuickDateFilter = (period) => {
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  
  switch (period) {
    case 'today':
      filters.value.startDate = today.toISOString().split('T')[0]
      filters.value.endDate = today.toISOString().split('T')[0]
      break
    case 'yesterday':
      filters.value.startDate = yesterday.toISOString().split('T')[0]
      filters.value.endDate = yesterday.toISOString().split('T')[0]
      break
    case 'last7days':
      const last7Days = new Date(today)
      last7Days.setDate(last7Days.getDate() - 7)
      filters.value.startDate = last7Days.toISOString().split('T')[0]
      filters.value.endDate = today.toISOString().split('T')[0]
      break
    case 'last30days':
      const last30Days = new Date(today)
      last30Days.setDate(last30Days.getDate() - 30)
      filters.value.startDate = last30Days.toISOString().split('T')[0]
      filters.value.endDate = today.toISOString().split('T')[0]
      break
    case 'thismonth':
      const firstDayThisMonth = new Date(today.getFullYear(), today.getMonth(), 1)
      filters.value.startDate = firstDayThisMonth.toISOString().split('T')[0]
      filters.value.endDate = today.toISOString().split('T')[0]
      break
    case 'lastmonth':
      const firstDayLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1)
      const lastDayLastMonth = new Date(today.getFullYear(), today.getMonth(), 0)
      filters.value.startDate = firstDayLastMonth.toISOString().split('T')[0]
      filters.value.endDate = lastDayLastMonth.toISOString().split('T')[0]
      break
  }
  
  // Automatically apply the filter when using quick filters
  applyFilters()
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

const formatActivityType = (type) => {
  return type.replace(/_/g, ' ')
}

const getActivityColorClass = (type) => {
  const colors = {
    search: 'bg-blue-500',
    company_advanced: 'bg-green-500',
    company_full: 'bg-purple-500',
    company_status: 'bg-yellow-500',
    llm_overview: 'bg-indigo-500',
    visure_request: 'bg-indigo-500',
    bilancio_request: 'bg-pink-500',
    file_download: 'bg-gray-500',
    login: 'bg-emerald-500',
    logout: 'bg-red-500'
  }
  return colors[type] || 'bg-gray-500'
}

const getActivityBadgeClass = (type) => {
  const colors = {
    search: 'bg-blue-100 text-blue-800',
    company_advanced: 'bg-green-100 text-green-800',
    company_full: 'bg-purple-100 text-purple-800',
    company_status: 'bg-yellow-100 text-yellow-800',
    llm_overview: 'bg-indigo-100 text-indigo-800',
    visure_request: 'bg-indigo-100 text-indigo-800',
    bilancio_request: 'bg-pink-100 text-pink-800',
    file_download: 'bg-gray-100 text-gray-800',
    login: 'bg-emerald-100 text-emerald-800',
    logout: 'bg-red-100 text-red-800'
  }
  return colors[type] || 'bg-gray-100 text-gray-800'
}

const getActivityIcon = (type) => {
  const icons = {
    search: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z',
    company_advanced: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4',
    company_full: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
    company_status: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
    llm_overview: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z',
    visure_request: 'M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
    bilancio_request: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1',
    file_download: 'M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
    login: 'M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1',
    logout: 'M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1'
  }
  return icons[type] || icons.search
}

onMounted(() => {
  refreshActivities()
})
</script>
