<script setup lang="ts">
defineProps<{
  count: number
  interpretation?: string
}>()
</script>

<template>
  <div class="text-sm text-zinc-500 dark:text-zinc-400">
    <span class="font-600 text-zinc-900 dark:text-zinc-100">{{ count }}</span>
    {{ count === 1 ? 'risultato trovato' : 'risultati trovati' }}
    <span v-if="interpretation" class="ml-1 text-zinc-400 dark:text-zinc-500">&mdash; {{ interpretation }}</span>
  </div>
</template>
