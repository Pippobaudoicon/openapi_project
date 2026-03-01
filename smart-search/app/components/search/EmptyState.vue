<script setup lang="ts">
defineProps<{
  query: string
}>()
</script>

<template>
  <div class="py-16 text-center animate-fade-in">
    <div class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-100 dark:bg-zinc-800/50">
      <svg class="h-7 w-7 text-zinc-300 dark:text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
        <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
      </svg>
    </div>
    <h3 class="text-base font-600 text-zinc-900 dark:text-zinc-100">Nessun risultato</h3>
    <p class="mx-auto mt-2 max-w-sm text-sm text-zinc-500 dark:text-zinc-400">
      Nessuna azienda trovata per "<span class="font-500 text-zinc-700 dark:text-zinc-300">{{ query }}</span>".
    </p>
    <p class="mt-3 text-xs text-zinc-400 dark:text-zinc-500">
      Prova con termini diversi, ad esempio: "aziende software a Milano" o "costruzioni Roma".
    </p>
  </div>
</template>
