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
    class="inline-flex items-center gap-1.5 rounded-full font-500"
    :class="[
      isActive
        ? 'bg-emerald-400/10 text-emerald-600 dark:bg-emerald-400/10 dark:text-emerald-400'
        : 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400',
      size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm',
    ]"
  >
    <span
      class="inline-block rounded-full"
      :class="[
        isActive ? 'bg-emerald-500 dark:bg-emerald-400' : 'bg-zinc-400 dark:bg-zinc-500',
        size === 'sm' ? 'h-1.5 w-1.5' : 'h-2 w-2',
      ]"
    />
    {{ label }}
  </span>
</template>
