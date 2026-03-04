interface CreditTransaction {
  _id: string
  transactionType: 'debit' | 'credit' | 'refund'
  serviceType: string
  actionType: string
  amount: number
  balanceAfter: number
  description: string
  createdAt: string
}

interface BalanceResponse {
  success: boolean
  currentBalance: number
  creditLimit: number
  creditSettings: {
    dailyLimit: number
    monthlyLimit: number
  }
  dailySpending: number
  monthlySpending: number
  recentTransactions: CreditTransaction[]
}

interface TransactionsResponse {
  transactions: CreditTransaction[]
  pagination: {
    currentPage: number
    totalPages: number
    totalItems: number
    hasNextPage: boolean
    hasPrevPage: boolean
  }
}

export function useCredits() {
  const balance = useState<number>('credit-balance', () => 0)
  const creditLimit = useState<number>('credit-limit', () => 0)
  const dailySpending = useState<number>('credit-daily-spending', () => 0)
  const monthlySpending = useState<number>('credit-monthly-spending', () => 0)
  const dailyLimit = useState<number>('credit-daily-limit', () => 0)
  const monthlyLimit = useState<number>('credit-monthly-limit', () => 0)
  const recentTransactions = useState<CreditTransaction[]>('credit-recent-transactions', () => [])
  const loading = useState<boolean>('credit-loading', () => false)

  async function fetch() {
    loading.value = true
    try {
      const data = await $fetch<BalanceResponse>('/credits/balance')
      balance.value = data.currentBalance
      creditLimit.value = data.creditLimit
      dailySpending.value = data.dailySpending
      monthlySpending.value = data.monthlySpending
      dailyLimit.value = data.creditSettings.dailyLimit
      monthlyLimit.value = data.creditSettings.monthlyLimit
      recentTransactions.value = data.recentTransactions
    } catch {
      // Silently fail — credit display will show 0
    } finally {
      loading.value = false
    }
  }

  async function fetchTransactions(page = 1, limit = 10) {
    const data = await $fetch<TransactionsResponse>(
      `/credits/transactions?page=${page}&limit=${limit}`
    )
    return data
  }

  return {
    balance: readonly(balance),
    creditLimit: readonly(creditLimit),
    dailySpending: readonly(dailySpending),
    monthlySpending: readonly(monthlySpending),
    dailyLimit: readonly(dailyLimit),
    monthlyLimit: readonly(monthlyLimit),
    recentTransactions: readonly(recentTransactions),
    loading: readonly(loading),
    fetch,
    fetchTransactions,
  }
}
