<script setup lang="ts">
const props = defineProps<{
  piva: string
  overview: string | null
  loading: boolean
  error: string | null
}>()

const emit = defineEmits<{
  load: []
}>()

const renderedHtml = computed(() => {
  if (!props.overview) return ''
  // Simple markdown-to-HTML for bold, headers, lists
  return props.overview
    .replace(/### (.+)/g, '<h4 class="font-semibold text-gray-900 mt-3 mb-1">$1</h4>')
    .replace(/## (.+)/g, '<h3 class="font-bold text-gray-900 mt-4 mb-2 text-lg">$1</h3>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/^- (.+)$/gm, '<li class="ml-4 list-disc text-sm text-gray-700">$1</li>')
    .replace(/\n\n/g, '<br/>')
})
</script>

<template>
  <div class="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
    <div class="mb-4 flex items-center justify-between">
      <h3 class="text-sm font-semibold uppercase tracking-wide text-gray-500">Panoramica Finanziaria</h3>
      <button
        v-if="!overview && !loading"
        class="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-blue-700"
        @click="emit('load')"
      >
        Genera con AI
      </button>
    </div>

    <!-- Loading skeleton -->
    <div v-if="loading" class="space-y-2">
      <div v-for="i in 6" :key="i" class="h-3 animate-pulse rounded bg-gray-200" :class="i % 3 === 0 ? 'w-2/3' : 'w-full'" />
    </div>

    <!-- Error -->
    <p v-else-if="error" class="text-sm text-red-500">{{ error }}</p>

    <!-- Content -->
    <div v-else-if="overview" class="prose prose-sm max-w-none text-gray-700" v-html="renderedHtml" />

    <!-- Empty state -->
    <p v-else class="text-sm text-gray-400">
      Clicca "Genera con AI" per ottenere un'analisi finanziaria generata dall'intelligenza artificiale.
    </p>
  </div>
</template>
