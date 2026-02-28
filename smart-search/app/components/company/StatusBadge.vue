<script setup lang="ts">
const props = defineProps<{
  status?: string | null
  size?: 'sm' | 'md'
}>()

const isActive = computed(() => {
  const s = props.status?.toUpperCase()
  return s === 'ATTIVA' || s === 'A' || s === 'ACTIVE'
})

const label = computed(() => (isActive.value ? 'Attiva' : 'Cessata'))
</script>

<template>
  <span
    class="inline-flex items-center gap-1 rounded-full font-medium"
    :class="[
      isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600',
      size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-sm',
    ]"
  >
    <span
      class="inline-block rounded-full"
      :class="[
        isActive ? 'bg-green-500' : 'bg-gray-400',
        size === 'sm' ? 'h-1.5 w-1.5' : 'h-2 w-2',
      ]"
    />
    {{ label }}
  </span>
</template>
