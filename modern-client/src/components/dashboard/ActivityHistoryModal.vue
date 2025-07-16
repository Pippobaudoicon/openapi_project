<template>
  <div 
    v-if="isOpen" 
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    @click="closeModal"
  >
    <div 
      class="bg-white rounded-2xl p-6 max-w-4xl w-full mx-4 max-h-[80vh] overflow-hidden"
      @click.stop
    >
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-2xl font-bold text-gray-900">Activity History</h2>
        <button 
          @click="closeModal"
          class="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Filters -->
      <div class="flex flex-wrap gap-4 mb-6">
        <select 
          v-model="selectedType" 
          @change="fetchHistory"
          class="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        >
          <option value="">All Types</option>
          <option value="search">Search</option>
          <option value="company_advanced">Company Advanced</option>
          <option value="company_full">Company Full</option>
          <option value="company_status">Company Status</option>
          <option value="visure_request">Visure Request</option>
          <option value="bilancio_request">Bilancio Request</option>
          <option value="file_download">File Download</option>
        </select>

        <button 
          @click="fetchHistory"
          class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          Refresh
        </button>
      </div>

      <!-- Activity List -->
      <div class="overflow-y-auto max-h-96">
        <!-- Loading State -->
        <div v-if="activityStore.isLoading" class="space-y-4">
          <div v-for="n in 5" :key="n" class="animate-pulse flex items-start space-x-3 p-4 border border-gray-200 rounded-lg">
            <div class="w-10 h-10 bg-gray-200 rounded-lg"></div>
            <div class="flex-1 space-y-2">
              <div class="h-4 bg-gray-200 rounded w-3/4"></div>
              <div class="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        </div>

        <!-- Activities -->
        <div v-else-if="activities.length > 0" class="space-y-3">
          <div
            v-for="activity in formattedActivities"
            :key="activity._id"
            class="flex items-start space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div :class="[
              'w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0',
              getActivityColorClass(activity.color)
            ]">
              <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="activity.icon" />
              </svg>
            </div>
            
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-gray-900">
                {{ activity.description }}
              </p>
              <p class="text-xs text-gray-500 mt-1">
                {{ activity.action }} • {{ formatDateTime(activity.createdAt) }}
              </p>
              <div v-if="activity.metadata && Object.keys(activity.metadata).length > 0" class="mt-2">
                <details class="text-xs text-gray-600">
                  <summary class="cursor-pointer hover:text-gray-800">Details</summary>
                  <pre class="mt-1 text-xs bg-gray-100 p-2 rounded overflow-x-auto">{{ JSON.stringify(activity.metadata, null, 2) }}</pre>
                </details>
              </div>
            </div>
            
            <div class="flex-shrink-0 text-xs text-gray-400">
              {{ activity.timeAgo }}
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-else class="text-center py-12">
          <svg class="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <p class="text-gray-500">No activities found</p>
        </div>

        <!-- Load More Button -->
        <div v-if="!activityStore.isLoading && activities.length > 0 && hasMore" class="text-center mt-6">
          <button 
            @click="loadMore"
            class="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Load More
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useActivityStore } from '@/stores/activity'

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close'])

const activityStore = useActivityStore()

const activities = ref([])
const selectedType = ref('')
const currentPage = ref(1)
const hasMore = ref(true)

const formattedActivities = computed(() => {
  return activities.value.map(activity => activityStore.formatActivity(activity))
})

const getActivityColorClass = (color) => {
  const colorMap = {
    blue: 'bg-blue-600',
    green: 'bg-green-600',
    purple: 'bg-purple-600',
    yellow: 'bg-yellow-600',
    indigo: 'bg-indigo-600',
    pink: 'bg-pink-600',
    gray: 'bg-gray-600',
    emerald: 'bg-emerald-600',
    red: 'bg-red-600'
  }
  return colorMap[color] || 'bg-gray-600'
}

const formatDateTime = (timestamp) => {
  return new Date(timestamp).toLocaleString()
}

const fetchHistory = async () => {
  try {
    currentPage.value = 1
    hasMore.value = true
    const response = await activityStore.getActivityHistory(
      1, 
      20, 
      selectedType.value || null
    )
    activities.value = response.activities || []
    hasMore.value = response.hasMore || false
  } catch (error) {
    console.error('Failed to fetch activity history:', error)
    activities.value = []
  }
}

const loadMore = async () => {
  try {
    const nextPage = currentPage.value + 1
    const response = await activityStore.getActivityHistory(
      nextPage, 
      20, 
      selectedType.value || null
    )
    activities.value.push(...(response.activities || []))
    currentPage.value = nextPage
    hasMore.value = response.hasMore || false
  } catch (error) {
    console.error('Failed to load more activities:', error)
  }
}

const closeModal = () => {
  emit('close')
}

// Watch for modal open/close
watch(() => props.isOpen, (newVal) => {
  if (newVal) {
    fetchHistory()
  }
})
</script>
