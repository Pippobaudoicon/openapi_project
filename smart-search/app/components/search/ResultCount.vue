<script setup lang="ts">
defineProps<{
  count: number
  interpretation?: string
}>()
</script>

<template>
  <div class="text-sm text-gray-600">
    <span class="font-medium text-gray-900">{{ count }}</span>
    {{ count === 1 ? 'risultato trovato' : 'risultati trovati' }}
    <span v-if="interpretation" class="ml-2 text-gray-400">&mdash; {{ interpretation }}</span>
  </div>
</template>
