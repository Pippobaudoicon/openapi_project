<script setup lang="ts">
const props = defineProps<{
  data: Record<string, any>
}>()

const expanded = ref(false)
</script>

<template>
  <div class="rounded-xl border border-gray-200 bg-white shadow-sm">
    <button
      class="flex w-full items-center justify-between px-5 py-4 text-left"
      @click="expanded = !expanded"
    >
      <h3 class="text-sm font-semibold uppercase tracking-wide text-gray-500">Dati grezzi API</h3>
      <svg
        class="h-5 w-5 text-gray-400 transition-transform"
        :class="expanded ? 'rotate-180' : ''"
        fill="none" viewBox="0 0 24 24" stroke="currentColor"
      >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
      </svg>
    </button>
    <div v-if="expanded" class="border-t border-gray-100 p-5">
      <pre class="max-h-96 overflow-auto rounded-lg bg-gray-50 p-4 text-xs text-gray-700">{{ JSON.stringify(data, null, 2) }}</pre>
    </div>
  </div>
</template>
