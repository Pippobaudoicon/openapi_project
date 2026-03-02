<script setup lang="ts">
// TODO: re-enable after auth testing
// definePageMeta({
//   middleware: ['auth'],
// })

const route = useRoute()
const router = useRouter()
const store = useSearchStore()

const queryFromUrl = computed(() => (route.query.q as string) || '')

async function handleSearch(query: string) {
  await router.push({ query: { q: query } })
  store.search(query)
}

function handleRetry() {
  if (store.query) {
    store.search(store.query)
  }
}

// Auto-search if URL has query param on load
onMounted(() => {
  if (queryFromUrl.value && !store.hasSearched) {
    store.search(queryFromUrl.value)
  }
})

// Watch for browser back/forward
watch(queryFromUrl, (newQ, oldQ) => {
  if (newQ && newQ !== oldQ && newQ !== store.query) {
    store.search(newQ)
  }
  if (!newQ && oldQ) {
    store.reset()
  }
})
</script>

<template>
  <!-- Hero State -->
  <div
    v-if="!store.hasSearched"
    class="hero-bg flex min-h-screen flex-col items-center justify-center px-4"
  >
    <div class="relative z-10 flex flex-col items-center">
      <!-- Logo icon -->
      <div class="mb-4 flex items-center gap-3 animate-fade-in">
        <div class="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-500/10 ring-1 ring-indigo-500/20 dark:bg-indigo-400/10 dark:ring-indigo-400/20">
          <svg class="h-5 w-5 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
        </div>
      </div>

      <!-- Title -->
      <h1
        class="mb-3 font-display text-5xl font-800 tracking-tight sm:text-6xl animate-fade-in"
        style="animation-delay: 50ms"
      >
        <span class="gradient-text">Smart Search</span>
      </h1>

      <!-- Subtitle -->
      <p
        class="mb-10 max-w-md text-center text-base text-zinc-500 dark:text-zinc-400 animate-fade-in"
        style="animation-delay: 100ms"
      >
        Cerca aziende italiane con linguaggio naturale.
        <br class="hidden sm:block" />
        Alimentato da intelligenza artificiale.
      </p>

      <!-- Search Bar -->
      <div class="relative z-10 w-full max-w-xl animate-slide-up opacity-0" style="animation-delay: 200ms">
        <SearchBar @submit="handleSearch" />
      </div>

      <!-- Suggestions -->
      <div
        class="mt-8 flex flex-wrap items-center justify-center gap-2 animate-fade-in opacity-0"
        style="animation-delay: 400ms"
      >
        <span class="text-xs text-zinc-400 dark:text-zinc-500">Prova:</span>
        <button
          v-for="suggestion in [
            'software companies in Milan',
            'aziende con fatturato sopra 1M',
            'costruzioni a Roma',
          ]"
          :key="suggestion"
          @click="handleSearch(suggestion)"
          class="rounded-lg border border-zinc-200 px-3 py-1.5 text-xs text-zinc-500 transition-all hover:border-zinc-300 hover:text-zinc-700 dark:border-white/[0.06] dark:text-zinc-500 dark:hover:border-white/[0.12] dark:hover:text-zinc-300"
        >
          {{ suggestion }}
        </button>
      </div>
    </div>
  </div>

  <!-- Results State -->
  <div v-else class="min-h-screen px-4 pb-12 pt-6">
    <div class="mx-auto max-w-3xl">
      <!-- Top bar -->
      <div class="mb-8 flex items-center gap-4 animate-fade-in">
        <NuxtLink
          to="/"
          @click.prevent="store.reset(); router.push('/')"
          class="shrink-0"
        >
          <span class="font-display text-lg font-700 tracking-tight">
            <span class="gradient-text">Smart Search</span>
          </span>
        </NuxtLink>
        <SearchBar
          :model-value="store.query"
          compact
          @submit="handleSearch"
        />
      </div>

      <!-- Loading skeletons -->
      <div v-if="store.loading" class="space-y-3 animate-fade-in">
        <div class="mb-4 h-4 w-40 rounded-md bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
        <SearchCompanyCardSkeleton v-for="i in 5" :key="i" :style="{ animationDelay: `${i * 60}ms` }" />
      </div>

      <!-- Error state -->
      <SearchErrorState
        v-else-if="store.error"
        :message="store.error"
        @retry="handleRetry"
      />

      <!-- Empty state -->
      <SearchEmptyState
        v-else-if="!store.hasResults"
        :query="store.query"
      />

      <!-- Results -->
      <div v-else>
        <div class="mb-4 animate-fade-in">
          <SearchResultCount
            :count="store.resultCount"
            :interpretation="store.interpretation"
          />
          <SearchInterpretationChips
            v-if="Object.keys(store.parsedParams).length"
            :params="store.parsedParams"
            :interpretation="store.interpretation"
            class="mt-3"
          />
        </div>

        <div class="space-y-3">
          <SearchCompanyCard
            v-for="(company, idx) in store.results"
            :key="idx"
            :company="company"
            class="animate-slide-up opacity-0"
            :style="{ animationDelay: `${idx * 60}ms` }"
          />
        </div>
      </div>
    </div>
  </div>
</template>
