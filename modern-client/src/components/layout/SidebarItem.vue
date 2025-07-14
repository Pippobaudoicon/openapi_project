<template>
  <router-link
    :to="item.to"
    :class="[
      'group flex items-center px-3 py-2 text-sm font-medium rounded-xl transition-all duration-200',
      isActive 
        ? 'bg-primary-100 text-primary-700 border border-primary-200' 
        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
    ]"
  >
    <svg 
      :class="[
        'flex-shrink-0 w-5 h-5 transition-colors duration-200',
        isActive ? 'text-primary-600' : 'text-gray-400 group-hover:text-gray-600',
        !isOpen && 'mx-auto'
      ]"
      fill="none" 
      stroke="currentColor" 
      viewBox="0 0 24 24"
    >
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="item.icon" />
    </svg>
    
    <span v-if="isOpen" class="ml-3 transition-opacity duration-200">
      {{ item.name }}
    </span>
    
    <!-- Active indicator for collapsed state -->
    <div v-if="!isOpen && isActive" class="absolute left-0 w-1 h-6 bg-primary-600 rounded-r-full"></div>
  </router-link>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const props = defineProps({
  item: {
    type: Object,
    required: true
  },
  isOpen: {
    type: Boolean,
    default: true
  }
})

const route = useRoute()

const isActive = computed(() => {
  return route.path === props.item.to || route.path.startsWith(props.item.to + '/')
})
</script>
