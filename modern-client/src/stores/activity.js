import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '@/services/api'

export const useActivityStore = defineStore('activity', () => {
  const activities = ref([])
  const stats = ref({
    totalActivities: 0,
    recentActivities: 0,
    searchCount: 0,
    companyReportsCount: 0,
    visureCount: 0,
    averagePerDay: 0
  })
  const isLoading = ref(false)
  const error = ref(null)

  // Get recent activities
  const getRecentActivities = async (limit = 10) => {
    isLoading.value = true
    error.value = null
    
    try {
      const response = await api.get('/activities/recent', { 
        params: { limit } 
      })
      activities.value = response.data.data
      return response.data.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to fetch recent activities'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // Get activity statistics
  const getActivityStats = async () => {
    isLoading.value = true
    error.value = null
    
    try {
      const response = await api.get('/activities/stats')
      stats.value = response.data.data
      return response.data.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to fetch activity statistics'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // Get activity history with pagination
  const getActivityHistory = async (page = 1, limit = 20, type = null) => {
    isLoading.value = true
    error.value = null
    
    try {
      const params = { page, limit }
      if (type) params.type = type
      
      const response = await api.get('/activities/history', { params })
      return response.data.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to fetch activity history'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // Log a custom activity
  const logActivity = async (type, action, description, metadata = {}) => {
    try {
      const response = await api.post('/activities/log', {
        type,
        action,
        description,
        metadata
      })
      
      // Refresh recent activities if they're loaded
      if (activities.value.length > 0) {
        await getRecentActivities()
      }
      
      return response.data.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to log activity'
      throw err
    }
  }

  // Format activity for display
  const formatActivity = (activity) => {
    const icons = {
      search: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z',
      company_advanced: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4',
      company_full: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
      company_status: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
      visure_request: 'M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
      bilancio_request: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1',
      file_download: 'M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
      login: 'M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1',
      logout: 'M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1'
    }

    const colors = {
      search: 'blue',
      company_advanced: 'green',
      company_full: 'purple',
      company_status: 'yellow',
      visure_request: 'indigo',
      bilancio_request: 'pink',
      file_download: 'gray',
      login: 'emerald',
      logout: 'red'
    }

    return {
      ...activity,
      icon: icons[activity.type] || icons.search,
      color: colors[activity.type] || 'gray',
      timeAgo: formatTimeAgo(new Date(activity.createdAt))
    }
  }

  // Helper function to format time ago
  const formatTimeAgo = (date) => {
    const now = new Date()
    const diffInSeconds = Math.floor((now - date) / 1000)
    
    if (diffInSeconds < 60) return 'just now'
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`
    
    return date.toLocaleDateString()
  }

  const clearError = () => {
    error.value = null
  }

  return {
    activities,
    stats,
    isLoading,
    error,
    getRecentActivities,
    getActivityStats,
    getActivityHistory,
    logActivity,
    formatActivity,
    clearError
  }
})
