import { computed } from 'vue'
import { useCompanyStore } from '@/stores/company'

export function useCredits() {
  const companyStore = useCompanyStore()

  const formatCredits = (credits) => {
    return Number(credits || 0).toLocaleString(undefined, { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    })
  }

  const creditInfo = computed(() => companyStore.creditInfo)
  const creditLoading = computed(() => companyStore.creditLoading)

  const refreshCredit = async () => {
    await companyStore.refreshCredit()
  }

  return {
    creditInfo,
    creditLoading,
    formatCredits,
    refreshCredit
  }
}
