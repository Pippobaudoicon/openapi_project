interface CompanyData {
  source: string
  timestamp: string
  data: Record<string, any>
  piva: string
  searchType: string
  llmOverview?: string
}

interface LLMOverviewResponse {
  overview: string
}

export function useCompany(piva: Ref<string> | string) {
  const pivaRef = toRef(piva)

  const { data: company, status, error, refresh } = useAsyncData(
    `company-${pivaRef.value}`,
    () => {
      const headers = import.meta.server ? useRequestHeaders(['cookie']) : {}
      return $fetch<CompanyData>(`/_api/company/${pivaRef.value}`, { headers })
    },
  )

  const overview = ref<string | null>(company.value?.llmOverview ?? null)
  const overviewLoading = ref(false)
  const overviewError = ref<string | null>(null)

  // Sync cached overview from company data when it loads
  watch(company, (val) => {
    if (val?.llmOverview && !overview.value) {
      overview.value = val.llmOverview
    }
  })

  async function fetchOverview(force = false) {
    if (overview.value && !force) return
    overviewLoading.value = true
    overviewError.value = null
    try {
      const headers = import.meta.server ? useRequestHeaders(['cookie']) : {}
      const query = force ? '?force=true' : ''
      const res = await $fetch<LLMOverviewResponse>(`/_api/company/${pivaRef.value}/overview${query}`, {
        headers,
      })
      overview.value = res.overview
    } catch (err: any) {
      overviewError.value = err?.data?.message || 'Failed to load financial overview'
    } finally {
      overviewLoading.value = false
    }
  }

  return {
    company,
    status,
    error,
    refresh,
    overview,
    overviewLoading,
    overviewError,
    fetchOverview,
  }
}
