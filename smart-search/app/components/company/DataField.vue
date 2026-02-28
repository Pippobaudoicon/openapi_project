<script setup lang="ts">
defineProps<{
  label: string
  value?: string | number | null
  span?: boolean
}>()
</script>

<template>
  <div :class="span ? 'col-span-2' : ''">
    <dt class="text-xs font-medium text-gray-400">{{ label }}</dt>
    <dd class="mt-0.5 text-sm text-gray-900">
      <slot>{{ value ?? 'N/D' }}</slot>
    </dd>
  </div>
</template>
