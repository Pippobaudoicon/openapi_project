<script setup lang="ts">
const emit = defineEmits<{ close: [] }>()
const {
  balance, creditLimit,
  dailySpending, monthlySpending,
  dailyLimit, monthlyLimit,
  recentTransactions, loading,
  fetch: fetchCredits,
} = useCredits()

onMounted(() => {
  fetchCredits()
})

function handleBackdropClick(e: Event) {
  if (e.target === e.currentTarget) {
    emit('close')
  }
}

function formatCredit(n: number) {
  return n.toFixed(2)
}

function formatTransactionDate(dateStr: string) {
  try {
    return new Date(dateStr).toLocaleDateString('it-IT', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return dateStr
  }
}

function usagePercent(spent: number, limit: number) {
  if (limit <= 0) return 0
  return Math.min((spent / limit) * 100, 100)
}

function usageColor(spent: number, limit: number) {
  const pct = usagePercent(spent, limit)
  if (pct >= 90) return 'bg-red-500 dark:bg-red-400'
  if (pct >= 70) return 'bg-amber-500 dark:bg-amber-400'
  return 'bg-emerald-500 dark:bg-emerald-400'
}
</script>

<template>
  <Teleport to="body">
    <div
      class="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in"
      @click="handleBackdropClick"
    >
      <div class="relative w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-6 shadow-2xl dark:border-white/[0.08] dark:bg-zinc-900 animate-scale-in">
        <!-- Close button -->
        <button
          @click="emit('close')"
          class="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600 dark:text-zinc-500 dark:hover:bg-white/[0.06] dark:hover:text-zinc-300"
        >
          <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <h2 class="mb-6 text-lg font-600 text-zinc-900 dark:text-zinc-100">Crediti</h2>

        <!-- Loading state -->
        <div v-if="loading" class="space-y-4">
          <div class="h-20 rounded-xl bg-zinc-100 dark:bg-zinc-800 animate-pulse" />
          <div class="h-12 rounded-xl bg-zinc-100 dark:bg-zinc-800 animate-pulse" />
          <div class="h-12 rounded-xl bg-zinc-100 dark:bg-zinc-800 animate-pulse" />
        </div>

        <div v-else class="space-y-5">
          <!-- Balance card -->
          <div class="rounded-xl border border-zinc-100 bg-zinc-50 p-4 dark:border-white/[0.06] dark:bg-zinc-800/50">
            <p class="text-xs font-500 uppercase tracking-wider text-zinc-400 dark:text-zinc-500">Saldo disponibile</p>
            <p class="mt-1 text-3xl font-700 tabular-nums text-zinc-900 dark:text-zinc-100">
              {{ formatCredit(balance) }}
            </p>
            <p class="mt-0.5 text-xs text-zinc-400 dark:text-zinc-500">
              su {{ formatCredit(creditLimit) }} limite totale
            </p>
          </div>

          <!-- Usage bars -->
          <div class="space-y-3">
            <!-- Daily -->
            <div>
              <div class="mb-1 flex items-center justify-between text-xs">
                <span class="text-zinc-500 dark:text-zinc-400">Spesa giornaliera</span>
                <span class="font-500 tabular-nums text-zinc-600 dark:text-zinc-300">
                  {{ formatCredit(dailySpending) }} / {{ formatCredit(dailyLimit) }}
                </span>
              </div>
              <div class="h-1.5 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-700">
                <div
                  class="h-full rounded-full transition-all duration-500"
                  :class="usageColor(dailySpending, dailyLimit)"
                  :style="{ width: `${usagePercent(dailySpending, dailyLimit)}%` }"
                />
              </div>
            </div>

            <!-- Monthly -->
            <div>
              <div class="mb-1 flex items-center justify-between text-xs">
                <span class="text-zinc-500 dark:text-zinc-400">Spesa mensile</span>
                <span class="font-500 tabular-nums text-zinc-600 dark:text-zinc-300">
                  {{ formatCredit(monthlySpending) }} / {{ formatCredit(monthlyLimit) }}
                </span>
              </div>
              <div class="h-1.5 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-700">
                <div
                  class="h-full rounded-full transition-all duration-500"
                  :class="usageColor(monthlySpending, monthlyLimit)"
                  :style="{ width: `${usagePercent(monthlySpending, monthlyLimit)}%` }"
                />
              </div>
            </div>
          </div>

          <!-- Recent transactions -->
          <div v-if="recentTransactions.length > 0">
            <h3 class="mb-2 text-xs font-500 uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
              Transazioni recenti
            </h3>
            <div class="max-h-48 space-y-1 overflow-y-auto">
              <div
                v-for="tx in recentTransactions"
                :key="tx._id"
                class="flex items-center justify-between rounded-lg px-2.5 py-1.5 text-sm transition-colors hover:bg-zinc-50 dark:hover:bg-white/[0.03]"
              >
                <div class="min-w-0 flex-1">
                  <p class="truncate text-zinc-700 dark:text-zinc-300">
                    {{ tx.description || tx.actionType }}
                  </p>
                  <p class="text-xs text-zinc-400 dark:text-zinc-500">
                    {{ formatTransactionDate(tx.createdAt) }}
                  </p>
                </div>
                <span
                  class="ml-3 shrink-0 text-sm font-500 tabular-nums"
                  :class="tx.transactionType === 'debit'
                    ? 'text-red-500 dark:text-red-400'
                    : 'text-emerald-500 dark:text-emerald-400'"
                >
                  {{ tx.transactionType === 'debit' ? '-' : '+' }}{{ formatCredit(tx.amount) }}
                </span>
              </div>
            </div>
          </div>

          <p v-else class="text-center text-sm text-zinc-400 dark:text-zinc-500">
            Nessuna transazione recente
          </p>
        </div>
      </div>
    </div>
  </Teleport>
</template>
