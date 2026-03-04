<script setup lang="ts">
const props = defineProps<{
  message: string
  errorType?: 'credit' | 'generic' | null
}>()

const emit = defineEmits<{
  retry: []
}>()

const isCredit = computed(() => props.errorType === 'credit')
</script>

<template>
  <div class="py-16 text-center animate-fade-in">
    <!-- Credit error icon -->
    <div v-if="isCredit" class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50 dark:bg-amber-400/10">
      <svg class="h-7 w-7 text-amber-500 dark:text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
        <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
      </svg>
    </div>
    <!-- Generic error icon -->
    <div v-else class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 dark:bg-red-400/10">
      <svg class="h-7 w-7 text-red-400 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
        <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
      </svg>
    </div>

    <h3 class="text-base font-600 text-zinc-900 dark:text-zinc-100">
      {{ isCredit ? 'Crediti insufficienti' : 'Errore nella ricerca' }}
    </h3>
    <p class="mx-auto mt-2 max-w-sm text-sm text-zinc-500 dark:text-zinc-400">{{ message }}</p>

    <button
      v-if="!isCredit"
      @click="emit('retry')"
      class="mt-5 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-500 text-white transition-all hover:bg-indigo-500 active:scale-[0.98] dark:bg-indigo-500 dark:hover:bg-indigo-400"
    >
      <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
      </svg>
      Riprova
    </button>

    <p v-if="isCredit" class="mt-4 text-xs text-zinc-400 dark:text-zinc-500">
      Controlla il tuo saldo crediti nel menu in alto a destra.
    </p>
  </div>
</template>
