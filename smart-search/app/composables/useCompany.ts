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

  // User-triggered override (regenerate); falls back to cached company data
  const overviewOverride = useState<string | null>(`company-overview-${pivaRef.value}`, () => null)
  const overview = computed(() => overviewOverride.value ?? company.value?.llmOverview ?? null)
  const overviewLoading = ref(false)
  const overviewError = ref<string | null>(null)

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
      overviewOverride.value = res.overview
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
