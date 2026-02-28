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
  <div v-if="visible && history.length" class="absolute left-0 right-0 top-full z-10 mt-1 rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
    <div class="flex items-center justify-between px-3 py-1.5">
      <span class="text-xs font-medium text-gray-400">Ricerche recenti</span>
    </div>
    <button
      v-for="(q, i) in history"
      :key="i"
      class="flex w-full items-center justify-between px-3 py-2 text-left text-sm text-gray-700 transition-colors hover:bg-gray-50"
      @mousedown.prevent="select(q)"
    >
      <span class="flex items-center gap-2 truncate">
        <svg class="h-3.5 w-3.5 shrink-0 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        {{ q }}
      </span>
      <svg
        class="h-3.5 w-3.5 shrink-0 text-gray-300 hover:text-gray-500"
        fill="none" viewBox="0 0 24 24" stroke="currentColor"
        @mousedown.prevent.stop="remove(i)"
      >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
  </div>
</template>
