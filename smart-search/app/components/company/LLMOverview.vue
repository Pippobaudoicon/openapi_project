<script setup lang="ts">
import { marked } from 'marked'

const props = defineProps<{
  piva: string
  overview: string | null
  loading: boolean
  error: string | null
}>()

const emit = defineEmits<{
  load: [force?: boolean]
}>()

const renderedHtml = computed(() => {
  if (!props.overview) return ''
  return marked.parse(props.overview, { breaks: true }) as string
})
</script>

<template>
  <div class="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-white/[0.06] dark:bg-zinc-900/50">
    <div class="mb-5 flex items-center justify-between">
      <div class="flex items-center gap-2">
        <svg class="h-4 w-4 text-indigo-500 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
        </svg>
        <h3 class="text-[11px] font-600 uppercase tracking-wider text-zinc-400 dark:text-zinc-500">Panoramica Aziendale</h3>
      </div>
      <div class="flex items-center gap-2">
        <button
          v-if="overview && !loading"
          class="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-500 text-zinc-400 transition-all hover:bg-zinc-100 hover:text-zinc-600 dark:text-zinc-500 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
          title="Rigenera panoramica"
          @click="emit('load', true)"
        >
          <svg class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.992 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
          </svg>
          Rigenera
        </button>
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
    </div>

    <!-- Loading -->
    <div v-if="loading" class="space-y-2.5 animate-pulse">
      <div v-for="i in 8" :key="i" class="h-3 rounded-md bg-zinc-200 dark:bg-zinc-700" :class="i % 3 === 0 ? 'w-2/3' : i % 5 === 0 ? 'w-1/2' : 'w-full'" />
    </div>

    <!-- Error -->
    <p v-else-if="error" class="text-sm text-red-500 dark:text-red-400">{{ error }}</p>

    <!-- Content -->
    <div
      v-else-if="overview"
      class="llm-overview-content max-w-none text-sm leading-relaxed text-zinc-600 dark:text-zinc-300"
      v-html="renderedHtml"
    />

    <!-- Empty state -->
    <p v-else class="text-sm text-zinc-400 dark:text-zinc-500">
      Clicca "Genera con AI" per ottenere una panoramica aziendale generata dall'intelligenza artificiale.
    </p>
  </div>
</template>

<style scoped>
.llm-overview-content :deep(h2) {
  font-size: 0.9375rem;
  font-weight: 700;
  color: var(--color-zinc-900);
  margin-top: 1.5rem;
  margin-bottom: 0.5rem;
  padding-bottom: 0.25rem;
  border-bottom: 1px solid var(--color-zinc-100);
}

.llm-overview-content :deep(h2:first-child) {
  margin-top: 0;
}

.llm-overview-content :deep(h3) {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-zinc-800);
  margin-top: 1.25rem;
  margin-bottom: 0.375rem;
}

.llm-overview-content :deep(p) {
  margin-bottom: 0.625rem;
  line-height: 1.7;
}

.llm-overview-content :deep(strong) {
  font-weight: 600;
  color: var(--color-zinc-800);
}

.llm-overview-content :deep(ul) {
  list-style-type: disc;
  padding-left: 1.25rem;
  margin-bottom: 0.75rem;
}

.llm-overview-content :deep(ol) {
  list-style-type: decimal;
  padding-left: 1.25rem;
  margin-bottom: 0.75rem;
}

.llm-overview-content :deep(li) {
  margin-bottom: 0.25rem;
  line-height: 1.6;
}

.llm-overview-content :deep(hr) {
  border: none;
  border-top: 1px solid var(--color-zinc-200);
  margin: 1rem 0;
}

/* Dark mode overrides */
:root.dark .llm-overview-content :deep(h2) {
  color: var(--color-zinc-100);
  border-bottom-color: var(--color-zinc-800);
}

:root.dark .llm-overview-content :deep(h3) {
  color: var(--color-zinc-200);
}

:root.dark .llm-overview-content :deep(strong) {
  color: var(--color-zinc-200);
}

:root.dark .llm-overview-content :deep(hr) {
  border-top-color: var(--color-zinc-700);
}
</style>
