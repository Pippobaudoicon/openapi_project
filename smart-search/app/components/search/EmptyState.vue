<script setup lang="ts">
defineProps<{
  query: string
}>()
</script>

<template>
  <div class="py-12 text-center">
    <svg class="mx-auto h-12 w-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
    <h3 class="mt-4 text-lg font-medium text-gray-900">Nessun risultato</h3>
    <p class="mt-2 text-sm text-gray-500">
      Nessuna azienda trovata per "<span class="font-medium">{{ query }}</span>".
    </p>
    <p class="mt-1 text-sm text-gray-400">
      Prova con termini diversi, ad esempio: "aziende software a Milano" o "costruzioni Roma".
    </p>
  </div>
</template>
