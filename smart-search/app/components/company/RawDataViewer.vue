<script setup lang="ts">
const props = defineProps<{
  data: Record<string, any>
}>()

const expanded = ref(false)
</script>

<template>
  <div class="rounded-2xl border border-zinc-200 bg-white dark:border-white/[0.06] dark:bg-zinc-900/50">
    <button
      class="flex w-full items-center justify-between px-6 py-4 text-left transition-colors"
      @click="expanded = !expanded"
    >
      <h3 class="text-[11px] font-600 uppercase tracking-wider text-zinc-400 dark:text-zinc-500">Dati grezzi API</h3>
      <svg
        class="h-4 w-4 text-zinc-400 transition-transform duration-200 dark:text-zinc-500"
        :class="expanded ? 'rotate-180' : ''"
        fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"
      >
        <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
      </svg>
    </button>
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div v-if="expanded" class="border-t border-zinc-100 p-6 dark:border-white/[0.04]">
        <pre class="max-h-96 overflow-auto rounded-xl bg-zinc-50 p-4 font-mono text-xs leading-relaxed text-zinc-600 dark:bg-zinc-800/50 dark:text-zinc-300">{{ JSON.stringify(data, null, 2) }}</pre>
      </div>
    </Transition>
  </div>
</template>
