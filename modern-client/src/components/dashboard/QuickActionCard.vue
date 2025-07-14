<template>
  <div 
    class="card card-hover cursor-pointer group"
    @click="$emit('click')"
  >
    <div class="flex items-start space-x-4">
      <div :class="[
        'w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-200 group-hover:scale-110',
        colorClasses[action.color]
      ]">
        <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="action.icon" />
        </svg>
      </div>
      
      <div class="flex-1 min-w-0">
        <h3 class="text-lg font-semibold text-gray-900 group-hover:text-primary-600 transition-colors duration-200">
          {{ action.name }}
        </h3>
        <p class="text-sm text-gray-600 mt-1">
          {{ action.description }}
        </p>
      </div>
      
      <div class="text-gray-400 group-hover:text-primary-500 transition-colors duration-200">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  action: {
    type: Object,
    required: true
  }
})

defineEmits(['click'])

const colorClasses = {
  primary: 'bg-primary-600',
  success: 'bg-green-600',
  warning: 'bg-orange-600',
  error: 'bg-red-600',
  gray: 'bg-gray-600'
}
</script>
