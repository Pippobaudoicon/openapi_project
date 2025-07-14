<template>
  <div class="card">
    <div class="flex items-center justify-between mb-6">
      <h3 class="text-lg font-semibold text-gray-900">Recent Activity</h3>
      <button class="text-sm text-primary-600 hover:text-primary-500 font-medium">
        View all →
      </button>
    </div>

    <div class="space-y-4">
      <div
        v-for="activity in activities"
        :key="activity.id"
        class="flex items-start space-x-3 p-3 rounded-xl hover:bg-gray-50 transition-colors duration-200"
      >
        <div :class="[
          'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0',
          getActivityColor(activity.type)
        ]">
          <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="getActivityIcon(activity.type)" />
          </svg>
        </div>
        
        <div class="flex-1 min-w-0">
          <p class="text-sm font-medium text-gray-900">
            {{ activity.description }}
          </p>
          <p class="text-xs text-gray-500 mt-1">
            {{ formatTime(activity.timestamp) }}
          </p>
        </div>
        
        <div class="flex-shrink-0">
          <div :class="[
            'w-2 h-2 rounded-full',
            isRecent(activity.timestamp) ? 'bg-green-500' : 'bg-gray-300'
          ]"></div>
        </div>
      </div>
    </div>

    <div v-if="activities.length === 0" class="text-center py-8">
      <svg class="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
      <p class="text-gray-500 text-sm">No recent activity</p>
    </div>
  </div>
</template>

<script setup>
import { formatDistanceToNow } from 'date-fns'

defineProps({
  activities: {
    type: Array,
    default: () => []
  }
})

const getActivityIcon = (type) => {
  switch (type) {
    case 'search':
      return 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'
    case 'report':
      return 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
    case 'download':
      return 'M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4'
    default:
      return 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
  }
}

const getActivityColor = (type) => {
  switch (type) {
    case 'search':
      return 'bg-primary-600'
    case 'report':
      return 'bg-green-600'
    case 'download':
      return 'bg-orange-600'
    default:
      return 'bg-gray-600'
  }
}

const formatTime = (timestamp) => {
  return formatDistanceToNow(new Date(timestamp), { addSuffix: true })
}

const isRecent = (timestamp) => {
  const now = new Date()
  const activityTime = new Date(timestamp)
  const diffInMinutes = (now - activityTime) / (1000 * 60)
  return diffInMinutes < 30 // Consider as recent if within 30 minutes
}
</script>
