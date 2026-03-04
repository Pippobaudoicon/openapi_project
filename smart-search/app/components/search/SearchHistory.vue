<script setup lang="ts">
const props = defineProps<{
  inline?: boolean
}>()

const emit = defineEmits<{
  select: [query: string]
}>()

interface HistoryEntry {
  _id: string
  rawQuery: string
  interpretation: string
  resultCount: number
  createdAt: string
}

const history = ref<HistoryEntry[]>([])
const visible = ref(false)
const loaded = ref(false)

// In inline mode, auto-show whenever history is available
const isVisible = computed(() => {
  if (props.inline) return history.value.length > 0
  return visible.value && history.value.length > 0
})

async function fetchHistory() {
  if (loaded.value) return
  try {
    const data = await $fetch<HistoryEntry[]>('/search/history')
    history.value = data
    loaded.value = true
  } catch { /* ignore */ }
}

onMounted(fetchHistory)

function show() {
  if (history.value.length) visible.value = true
}

function hide() {
  if (props.inline) return
  setTimeout(() => { visible.value = false }, 150)
}

function select(query: string) {
  visible.value = false
  emit('select', query)
}

function addQuery(query: string) {
  const q = query.trim()
  if (!q) return
  // Optimistically add/move to top of local list
  history.value = [
    { _id: '', rawQuery: q, interpretation: '', resultCount: 0, createdAt: new Date().toISOString() },
    ...history.value.filter(h => h.rawQuery !== q),
  ].slice(0, 10)
}

function refreshHistory() {
  loaded.value = false
  fetchHistory()
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return 'ora'
  if (minutes < 60) return `${minutes}m fa`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h fa`
  const days = Math.floor(hours / 24)
  return `${days}g fa`
}

defineExpose({ addQuery, show, hide, refreshHistory })
</script>

<template>
  <Transition
    enter-active-class="transition duration-200 ease-out"
    enter-from-class="opacity-0 -translate-y-1"
    enter-to-class="opacity-100 translate-y-0"
    leave-active-class="transition duration-150 ease-in"
    leave-from-class="opacity-100 translate-y-0"
    leave-to-class="opacity-0 -translate-y-1"
  >
    <div
      v-if="isVisible"
      :class="inline
        ? 'py-1'
        : 'absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-xl border border-zinc-200 bg-white/95 py-1 shadow-xl backdrop-blur-xl dark:border-white/[0.08] dark:bg-zinc-900/95'"
    >
      <div class="flex items-center justify-between px-3 py-2">
        <span class="text-[11px] font-600 uppercase tracking-wider text-zinc-400 dark:text-zinc-500">Recenti</span>
      </div>
      <button
        v-for="entry in history"
        :key="entry._id || entry.rawQuery"
        class="group flex w-full items-center justify-between px-3 py-2 text-left text-sm transition-colors hover:bg-zinc-100 dark:hover:bg-white/[0.04]"
        @mousedown.prevent="select(entry.rawQuery)"
      >
        <span class="flex items-center gap-2.5 truncate text-zinc-600 dark:text-zinc-300">
          <svg class="h-3.5 w-3.5 shrink-0 text-zinc-300 dark:text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span class="truncate">{{ entry.rawQuery }}</span>
        </span>
        <span class="flex shrink-0 items-center gap-2 ml-3">
          <span v-if="entry.resultCount" class="text-[11px] text-zinc-400 dark:text-zinc-500">
            {{ entry.resultCount }} risultati
          </span>
          <span class="text-[11px] text-zinc-300 dark:text-zinc-600">
            {{ timeAgo(entry.createdAt) }}
          </span>
        </span>
      </button>
    </div>
  </Transition>
</template>
