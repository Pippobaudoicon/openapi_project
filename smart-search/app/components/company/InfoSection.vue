<script setup lang="ts">
defineProps<{
  title: string
}>()
</script>

<template>
  <div class="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-white/[0.06] dark:bg-zinc-900/50">
    <h3 class="mb-5 text-[11px] font-600 uppercase tracking-wider text-zinc-400 dark:text-zinc-500">{{ title }}</h3>
    <slot />
  </div>
</template>
