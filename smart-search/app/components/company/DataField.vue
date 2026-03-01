<script setup lang="ts">
defineProps<{
  label: string
  value?: string | number | null
  span?: boolean
}>()
</script>

<template>
  <div :class="span ? 'sm:col-span-2' : ''">
    <dt class="text-[11px] font-500 uppercase tracking-wider text-zinc-400 dark:text-zinc-500">{{ label }}</dt>
    <dd class="mt-1 text-sm font-500 text-zinc-900 dark:text-zinc-100">
      <slot>{{ value ?? 'N/D' }}</slot>
    </dd>
  </div>
</template>
