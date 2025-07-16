<template>
  <div class="card">
    <div class="flex items-center justify-between mb-6">
      <h3 class="text-lg font-semibold text-gray-900">Recent Activity</h3>
      <button 
        @click="$emit('view-all')"
        class="text-sm text-primary-600 hover:text-primary-500 font-medium transition-colors"
      >
        View all →
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="space-y-4">
      <div v-for="n in 3" :key="n" class="animate-pulse flex items-start space-x-3 p-3">
        <div class="w-8 h-8 bg-gray-200 rounded-lg"></div>
        <div class="flex-1 space-y-2">
          <div class="h-4 bg-gray-200 rounded w-3/4"></div>
          <div class="h-3 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    </div>

    <!-- Activities List -->
    <div v-else-if="formattedActivities.length > 0" class="space-y-4">
      <div
        v-for="activity in formattedActivities"
        :key="activity._id"
        class="flex items-start space-x-3 p-3 rounded-xl hover:bg-gray-50 transition-colors duration-200"
      >
        <div :class="[
          'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0',
          getActivityColorClass(activity.color)
        ]">
          <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="activity.icon" />
          </svg>
        </div>
        
        <div class="flex-1 min-w-0">
          <p class="text-sm font-medium text-gray-900">
            {{ activity.description }}
          </p>
          <p class="text-xs text-gray-500 mt-1">
            {{ activity.timeAgo }}
          </p>
        </div>
        
        <div class="flex-shrink-0">
          <div :class="[
            'w-2 h-2 rounded-full',
            isRecent(activity.createdAt) ? 'bg-green-500' : 'bg-gray-300'
          ]"></div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="text-center py-8">
      <svg class="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
      <p class="text-gray-500 text-sm">No recent activity</p>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useActivityStore } from '@/stores/activity'

const props = defineProps({
  activities: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['view-all'])

const activityStore = useActivityStore()

// Format activities using the store's formatActivity method
const formattedActivities = computed(() => {
  return props.activities.map(activity => activityStore.formatActivity(activity))
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

const isRecent = (timestamp) => {
  const now = new Date()
  const activityTime = new Date(timestamp)
  const diffInMinutes = (now - activityTime) / (1000 * 60)
  return diffInMinutes < 30 // Consider as recent if within 30 minutes
}
</script>
