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
  // Update URL first
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
  console.log('Mounted with query:', queryFromUrl.value)
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
  <div class="min-h-screen bg-gray-50">
    <!-- Initial centered state -->
    <div
      v-if="!store.hasSearched"
      class="flex min-h-screen flex-col items-center justify-center px-4"
    >
      <h1 class="mb-2 text-4xl font-bold text-gray-900">Smart Search</h1>
      <p class="mb-8 text-gray-500">Cerca aziende italiane con linguaggio naturale</p>
      <SearchBar @submit="handleSearch" />
      <div class="mt-6 text-xs text-gray-400">
        Prova: "software companies in Milan" &bull; "aziende con fatturato sopra 1 milione" &bull; "costruzioni a Roma"
      </div>
    </div>

    <!-- Results state -->
    <div v-else class="mx-auto max-w-3xl px-4 py-6">
      <!-- Top search bar -->
      <div class="mb-6 flex items-center gap-4">
        <h2 class="shrink-0 text-xl font-bold text-gray-900">Smart Search</h2>
        <SearchBar
          :model-value="store.query"
          compact
          @submit="handleSearch"
        />
      </div>

      <!-- Loading skeletons -->
      <div v-if="store.loading" class="space-y-3">
        <div class="h-4 w-32 animate-pulse rounded bg-gray-200" />
        <SearchCompanyCardSkeleton v-for="i in 5" :key="i" />
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
      <div v-else class="space-y-3">
        <SearchResultCount
          :count="store.resultCount"
          :interpretation="store.interpretation"
        />
        <SearchInterpretationChips
          v-if="Object.keys(store.parsedParams).length"
          :params="store.parsedParams"
          :interpretation="store.interpretation"
          class="mb-2"
        />
        <SearchCompanyCard
          v-for="(company, idx) in store.results"
          :key="idx"
          :company="company"
        />
      </div>
    </div>
  </div>
</template>
