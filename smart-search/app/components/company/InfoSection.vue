<script setup lang="ts">
defineProps<{
  title: string
}>()
</script>

<template>
  <div class="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
    <h3 class="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-500">{{ title }}</h3>
    <slot />
  </div>
</template>
