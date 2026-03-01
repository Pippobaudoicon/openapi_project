<script setup lang="ts">
const emit = defineEmits<{
  select: [query: string]
}>()

const STORAGE_KEY = 'smart-search-history'
const MAX_ITEMS = 8

const history = ref<string[]>([])
const visible = ref(false)

onMounted(() => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) history.value = JSON.parse(stored)
  } catch { /* ignore */ }
})

function show() {
  if (history.value.length) visible.value = true
}

function hide() {
  setTimeout(() => { visible.value = false }, 150)
}

function select(query: string) {
  visible.value = false
  emit('select', query)
}

function remove(index: number) {
  history.value.splice(index, 1)
  save()
  if (!history.value.length) visible.value = false
}

function save() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history.value))
  } catch { /* ignore */ }
}

function addQuery(query: string) {
  const q = query.trim()
  if (!q) return
  history.value = [q, ...history.value.filter(h => h !== q)].slice(0, MAX_ITEMS)
  save()
}

defineExpose({ addQuery, show, hide })
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
      v-if="visible && history.length"
      class="absolute left-0 right-0 top-full z-20 mt-2 overflow-hidden rounded-xl border border-zinc-200 bg-white/95 py-1 shadow-xl backdrop-blur-xl dark:border-white/[0.08] dark:bg-zinc-900/95"
    >
      <div class="flex items-center justify-between px-3 py-2">
        <span class="text-[11px] font-600 uppercase tracking-wider text-zinc-400 dark:text-zinc-500">Recenti</span>
      </div>
      <button
        v-for="(q, i) in history"
        :key="i"
        class="group flex w-full items-center justify-between px-3 py-2 text-left text-sm transition-colors hover:bg-zinc-100 dark:hover:bg-white/[0.04]"
        @mousedown.prevent="select(q)"
      >
        <span class="flex items-center gap-2.5 truncate text-zinc-600 dark:text-zinc-300">
          <svg class="h-3.5 w-3.5 shrink-0 text-zinc-300 dark:text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {{ q }}
        </span>
        <svg
          class="h-3.5 w-3.5 shrink-0 text-zinc-300 opacity-0 transition-all hover:text-zinc-500 group-hover:opacity-100 dark:text-zinc-600 dark:hover:text-zinc-400"
          fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"
          @mousedown.prevent.stop="remove(i)"
        >
          <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  </Transition>
</template>
