interface CompanyData {
  source: string
  timestamp: string
  data: Record<string, any>
  piva: string
  searchType: string
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
      return $fetch<CompanyData>(`/company/${pivaRef.value}`, { headers })
    },
  )

  const overview = ref<string | null>(null)
  const overviewLoading = ref(false)
  const overviewError = ref<string | null>(null)

  async function fetchOverview() {
    if (overview.value) return
    overviewLoading.value = true
    overviewError.value = null
    try {
      const headers = import.meta.server ? useRequestHeaders(['cookie']) : {}
      const res = await $fetch<LLMOverviewResponse>(`/company/${pivaRef.value}/overview`, {
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
