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
  return props.overview
    .replace(/### (.+)/g, '<h4 class="font-600 text-zinc-900 dark:text-zinc-100 mt-4 mb-1.5 text-sm">$1</h4>')
    .replace(/## (.+)/g, '<h3 class="font-700 text-zinc-900 dark:text-zinc-100 mt-5 mb-2 text-base">$1</h3>')
    .replace(/\*\*(.+?)\*\*/g, '<strong class="font-600 text-zinc-800 dark:text-zinc-200">$1</strong>')
    .replace(/^- (.+)$/gm, '<li class="ml-4 list-disc text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">$1</li>')
    .replace(/\n\n/g, '<br/>')
})
</script>

<template>
  <div class="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-white/[0.06] dark:bg-zinc-900/50">
    <div class="mb-5 flex items-center justify-between">
      <div class="flex items-center gap-2">
        <svg class="h-4 w-4 text-indigo-500 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
        </svg>
        <h3 class="text-[11px] font-600 uppercase tracking-wider text-zinc-400 dark:text-zinc-500">Panoramica Finanziaria</h3>
      </div>
      <button
        v-if="!overview && !loading"
        class="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3 py-1.5 text-xs font-500 text-white transition-all hover:bg-indigo-500 active:scale-[0.98] dark:bg-indigo-500 dark:hover:bg-indigo-400"
        @click="emit('load')"
      >
        <svg class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
        </svg>
        Genera con AI
      </button>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="space-y-2.5">
      <div v-for="i in 6" :key="i" class="h-3 rounded-md bg-zinc-100 dark:bg-zinc-800 skeleton-shimmer" :class="i % 3 === 0 ? 'w-2/3' : 'w-full'" />
    </div>

    <!-- Error -->
    <p v-else-if="error" class="text-sm text-red-500 dark:text-red-400">{{ error }}</p>

    <!-- Content -->
    <div v-else-if="overview" class="max-w-none text-sm leading-relaxed text-zinc-600 dark:text-zinc-300" v-html="renderedHtml" />

    <!-- Empty state -->
    <p v-else class="text-sm text-zinc-400 dark:text-zinc-500">
      Clicca "Genera con AI" per ottenere un'analisi finanziaria generata dall'intelligenza artificiale.
    </p>
  </div>
</template>
