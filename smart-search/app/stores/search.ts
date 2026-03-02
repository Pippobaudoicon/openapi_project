export interface CompanySearchResult {
  companyName?: string
  vatCode?: string
  address?: {
    registeredOffice?: {
      town?: string
      province?: string
    }
    town?: string
    province?: { code?: string }
  }
  atecoClassification?: {
    ateco?: string
  }
  ecofin?: {
    turnover?: number
    enterpriseSize?: string
  }
  employees?: {
    employee?: number
  }
  companyStatus?: {
    activityStatus?: { code?: string; description?: string }
  }
  activityStatus?: string
}

interface ParseResult {
  params: Record<string, string | number>
  interpretation: string
  results?: CompanySearchResult[]
  resultCount?: number
  cached?: boolean
  timestamp?: string
}

interface SearchResponse {
  source: string
  timestamp: string
  data: CompanySearchResult[]
}

export const useSearchStore = defineStore('search', {
  state: () => ({
    query: '',
    results: [] as CompanySearchResult[],
    interpretation: '',
    parsedParams: {} as Record<string, string | number>,
    loading: false,
    error: null as string | null,
    hasSearched: false,
    cachedResult: false,
  }),

  getters: {
    resultCount: (state) => state.results.length,
    hasResults: (state) => state.results.length > 0,
  },

  actions: {
    async search(query: string) {
      this.query = query
      this.loading = true
      this.error = null
      this.hasSearched = true
      this.cachedResult = false

      try {
        // Step 1: Parse natural language query via LLM (may return cached full results)
        const parsed = await $fetch<ParseResult>('/search/parse', {
          method: 'POST',
          body: { query },
        })

        this.interpretation = parsed.interpretation
        this.parsedParams = parsed.params || {}

        // If full cached results were returned, skip the IT-search call
        if (parsed.results) {
          this.results = parsed.results
          this.cachedResult = true
          return
        }

        // Step 2: No cache — execute search with parsed params
        const searchParams = new URLSearchParams()
        searchParams.set('dataEnrichment', 'advanced')
        for (const [key, value] of Object.entries(parsed.params)) {
          searchParams.set(key, String(value))
        }

        const response = await $fetch<SearchResponse>(
          `/search/results?${searchParams.toString()}`
        )

        this.results = response.data || []

        // Step 3: Save to search history for next time (fire-and-forget)
        $fetch('/search/save', {
          method: 'POST',
          body: {
            query,
            parsedParams: parsed.params,
            interpretation: parsed.interpretation,
            results: this.results,
          },
        }).catch(() => {})
      } catch (err: any) {
        this.error = err?.data?.error || err?.message || 'Search failed. Please try again.'
        this.results = []
      } finally {
        this.loading = false
      }
    },

    reset() {
      this.query = ''
      this.results = []
      this.interpretation = ''
      this.parsedParams = {}
      this.loading = false
      this.error = null
      this.hasSearched = false
      this.cachedResult = false
    },
  },
})
