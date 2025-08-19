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
        <div class="text-2xl font-bold text-gray-900 mb-1">{{ stats.searchCount || 0 }}</div>
        <div class="text-sm text-gray-600">Total Searches</div>
        <div class="flex items-center justify-center mt-2">
          <svg class="w-4 h-4 text-green-500 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <span class="text-xs text-gray-500">All time</span>
        </div>
      </div>

      <div class="text-center">
        <div class="text-2xl font-bold text-gray-900 mb-1">{{ stats.companyReportsCount || 0 }}</div>
        <div class="text-sm text-gray-600">Company Reports</div>
        <div class="flex items-center justify-center mt-2">
          <svg class="w-4 h-4 text-blue-500 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span class="text-xs text-gray-500">Generated</span>
        </div>
      </div>

      <div class="text-center">
        <div class="text-2xl font-bold text-gray-900 mb-1">{{ stats.visureCount || 0 }}</div>
        <div class="text-sm text-gray-600">Visure Requests</div>
        <div class="flex items-center justify-center mt-2">
          <svg class="w-4 h-4 text-purple-500 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span class="text-xs text-gray-500">All time</span>
        </div>
      </div>

      <div class="text-center">
        <div class="text-2xl font-bold text-gray-900 mb-1">{{ stats.averagePerDay || 0 }}</div>
        <div class="text-sm text-gray-600">Daily Average</div>
        <div class="flex items-center justify-center mt-2">
          <svg class="w-4 h-4 text-orange-500 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span class="text-xs text-gray-500">Last 30 days</span>
        </div>
      </div>
    </div>

    <!-- Mini Chart Area -->
    <div class="mt-6 pt-6 border-t border-gray-200">
      <div class="flex items-center justify-between text-sm mb-4">
        <span class="text-gray-600">Daily activity (Last 30 days)</span>
        <button @click="$emit('view-activity-details')" class="text-primary-600 hover:text-primary-500 font-medium transition-colors">
          View details →
        </button>
      </div>
      <div class="w-full">
        <div class="flex items-end space-x-0.5 h-24 justify-between">
          <div
            v-for="(item, index) in chartData"
            :key="index"
            class="flex flex-col items-center flex-1"
            :class="['transition-all duration-1000 delay-' + (index * 50)]"
          >
            <!-- Bar -->
            <div
              class="rounded-t transition-all duration-1000 mb-2 mx-auto cursor-help"
              :class="[
                item.value === 0 ? 'bg-gray-200 opacity-40' : 'bg-primary-500 opacity-100'
              ]"
              :style="{ 
                height: (item.value === 0 ? 2 : Math.max(2, item.height)) + 'px', 
                width: 'calc(100% - 1px)',
                maxWidth: '20px'
              }"
              :title="`${item.value} activities on day ${item.day}`"
            ></div>
            <!-- Day label -->
            <span class="text-xs text-gray-500 font-mono text-center">
              {{ String(item.day).padStart(2, '0') }}
            </span>
          </div>
        </div>
      </div>
      <div class="flex justify-between items-center mt-2 text-xs text-gray-400">
        <span>{{ getStartDate() }}</span>
        <span>Today</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useActivityStore } from '@/stores/activity'

const props = defineProps({
  stats: {
    type: Object,
    required: true
  },
  loading: {
    type: Boolean,
    default: false
  }
})

defineEmits(['view-activity-details'])

const activityStore = useActivityStore()
const chartData = ref([])

const generateChartData = async () => {
  try {
    // Get actual activity history for the last 30 days
    const response = await activityStore.getActivityHistory(1, 1000) // Get enough data to cover 30 days
    const activities = response.activities || []
    
    // Create a map to count activities by day
    const today = new Date()
    const activityCountByDay = new Map()
    
    // Initialize all days in the last 30 days with 0 activities
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      const dayKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
      activityCountByDay.set(dayKey, 0)
    }
    
    // Count actual activities by day
    activities.forEach(activity => {
      const activityDate = new Date(activity.createdAt)
      const dayKey = `${activityDate.getFullYear()}-${String(activityDate.getMonth() + 1).padStart(2, '0')}-${String(activityDate.getDate()).padStart(2, '0')}`
      
      // Only count activities from the last 30 days
      if (activityCountByDay.has(dayKey)) {
        activityCountByDay.set(dayKey, activityCountByDay.get(dayKey) + 1)
      }
    })
    
    // Convert to chart data
    const data = []
    let maxValue = 0
    const rawData = []
    
    // Generate data for each of the last 30 days
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      const dayKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
      
      const value = activityCountByDay.get(dayKey) || 0
      const isWeekend = date.getDay() === 0 || date.getDay() === 6
      
      rawData.push({
        day: date.getDate(),
        value: value,
        isToday: i === 0,
        isWeekend: isWeekend
      })
      
      maxValue = Math.max(maxValue, value)
    }
    
    // Calculate heights based on actual data
    const maxHeight = 60
    const minHeight = 2
    
    rawData.forEach(item => {
      let height
      if (item.value === 0) {
        height = 0 // Zero activity = no visible bar
      } else if (maxValue === 0) {
        height = minHeight // If all values are 0, show minimum height
      } else {
        // Calculate proportional height, ensuring minimum visibility for any activity > 0
        height = Math.max(minHeight, (item.value / maxValue) * maxHeight)
      }
      
      data.push({
        ...item,
        height: height
      })
    })
    
    chartData.value = data
    
  } catch (error) {
    console.error('Failed to load activity data for chart:', error)
    // Fallback to empty chart if API fails
    generateFallbackChart()
  }
}

const generateFallbackChart = () => {
  // Fallback chart with empty data if API fails
  const today = new Date()
  const data = []
  
  for (let i = 29; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    
    data.push({
      day: date.getDate(),
      value: 0,
      height: 0,
      isToday: i === 0,
      isWeekend: date.getDay() === 0 || date.getDay() === 6
    })
  }
  
  chartData.value = data
}

const getCurrentMonth = () => {
  return new Date().getMonth() + 1
}

const getStartDate = () => {
  const today = new Date()
  const startDate = new Date(today)
  startDate.setDate(startDate.getDate() - 29)
  return startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

watch(() => props.stats, () => {
  if (props.stats && !props.loading) {
    generateChartData()
  }
}, { immediate: true })

onMounted(() => {
  generateChartData()
})
</script>
