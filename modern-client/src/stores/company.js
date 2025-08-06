import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/services/api'

export const useCompanyStore = defineStore('company', () => {
  const companies = ref([])
  const currentCompany = ref(null)
  const searchResults = ref([])
  const isLoading = ref(false)
  const error = ref(null)
  const searchParams = ref({
    dryRun: 0,
    dataEnrichment: 'name',
    lat: '',
    long: '',
    radius: '',
    companyName: '',
    autocomplete: '',
    province: '',
    townCode: '',
    atecoCode: '',
    cciaa: '',
    reaCode: '',
    minTurnover: '',
    maxTurnover: '',
    minEmployees: '',
    maxEmployees: '',
    sdiCode: '',
    legalFormCode: '',
    shareHolderTaxCode: '',
    activityStatus: '',
    pec: '',
    creationTimestamp: '',
    lastUpdateTimestamp: '',
    skip: 0,
    limit: 10
  })
  const llmOverview = ref({})

  const hasResults = computed(() => searchResults.value.length > 0)
  const totalResults = computed(() => searchResults.value.length)

  // Helper function to log activities manually
  const logActivity = async (type, action, description, metadata = {}) => {
    try {
      await api.post('/activities/log', {
        type,
        action,
        description,
        metadata
      })
    } catch (error) {
      console.warn('Failed to log activity:', error)
      // Don't throw error - activity logging shouldn't break main functionality
    }
  }

  const searchCompanies = async (params = {}) => {
    isLoading.value = true
    error.value = null
    
    try {
      const searchQuery = { ...searchParams.value, ...params }
      // remove empty or null values
      const filteredQuery = Object.fromEntries(
        Object.entries(searchQuery).filter(([_, v]) => v !== '' && v != null)
      )
      const response = await api.get('/IT-search', { params: filteredQuery })
      searchResults.value = response.data.data || []
      
      // Log the search activity with metadata
      const searchMetadata = {
        searchQuery: Object.fromEntries(
          Object.entries(searchQuery).filter(([_, value]) => value !== '' && value !== null)
        ),
        resultsCount: searchResults.value.length
      }
      
      // await logActivity(
      //   'search',
      //   'company_search',
      //   `Searched for companies${searchQuery.q ? ` with query: "${searchQuery.q}"` : ''}`,
      //   searchMetadata
      // )
      
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Search failed'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const getCompanyDetails = async (piva) => {
    isLoading.value = true
    error.value = null
    try {
      const response = await api.get(`/company/${piva}`)

      currentCompany.value = response.data.data
      currentCompany.value.llmOverview = response.data.llmOverview || {}
      currentCompany.value.piva = piva

      currentCompany.value.isClosed = false
      if (response.data.searchType === 'full' && response.data.data.companyStatus.activityStatus.code != 'A') {
        currentCompany.value.isClosed = true
      }
      if (response.data.searchType === 'advanced' && response.data.data.activityStatus != 'ATTIVA') {
        currentCompany.value.isClosed = true
      }

      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to fetch company details'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const getCompanyAdvanced = async (piva) => {
    isLoading.value = true
    error.value = null
    
    try {
      const response = await api.get(`/IT-advanced/${piva}`)
      currentCompany.value = response.data.data
      
      // // Log the activity
      // await logActivity(
      //   'view',
      //   'company_advanced_view',
      //   `Viewed advanced data for company with PIVA: ${piva}`,
      //   { piva }
      // )
      
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to fetch company data'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const getCompanyFull = async (piva) => {
    isLoading.value = true
    error.value = null
    
    try {
      const response = await api.get(`/IT-full/${piva}`)
      currentCompany.value = response.data.data
      
      // // Log the activity
      // await logActivity(
      //   'view',
      //   'company_full_view',
      //   `Viewed full data for company with PIVA: ${piva}`,
      //   { piva }
      // )
      
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to fetch full company data'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const getCompanyClosed = async (piva) => {
    isLoading.value = true
    error.value = null
    
    try {
      const response = await api.get(`/IT-closed/${piva}`)
      
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to check company status'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const getImpresaData = async (piva) => {
    isLoading.value = true
    error.value = null
    
    try {
      const response = await api.get(`/impresa/${piva}`)
      
      // Log the activity
      // await logActivity(
      //   'view',
      //   'impresa_data_view',
      //   `Viewed impresa data for PIVA: ${piva}`,
      //   { piva }
      // )
      
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to fetch impresa data'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const searchImpresa = async (params = {}) => {
    isLoading.value = true
    error.value = null
    
    try {
      const response = await api.get('/impresa', { params })
      
      // Log the activity
      // await logActivity(
      //   'search',
      //   'impresa_search',
      //   `Searched for imprese`,
      //   params
      // )
      
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Impresa search failed'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const requestBilancioOttico = async (piva) => {
    isLoading.value = true
    error.value = null
    
    try {
      const response = await api.post('/bilancio-ottico', { piva })
      
      // Log the activity
      // await logActivity(
      //   'request',
      //   'bilancio_ottico_request',
      //   `Requested bilancio ottico for PIVA: ${piva}`,
      //   { piva }
      // )
      
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to request bilancio ottico'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const getBilancioOtticoStatus = async (piva) => {
    isLoading.value = true
    error.value = null
    
    try {
      const response = await api.get(`/bilancio-ottico/${piva}`)
      
      // Log the activity
      // await logActivity(
      //   'check',
      //   'bilancio_ottico_status_check',
      //   `Checked bilancio ottico status for PIVA: ${piva}`,
      //   { piva }
      // )
      
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to get bilancio ottico status'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const downloadBilancioOtticoFiles = async (id) => {
    try {
      const response = await api.get(`/bilancio-ottico/${id}/allegati`, {
        responseType: 'blob'
      })
      
      // Log the activity
      // await logActivity(
      //   'download',
      //   'bilancio_ottico_files_download',
      //   `Downloaded bilancio ottico files for request ID: ${id}`,
      //   { id }
      // )
      
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to download files'
      throw err
    }
  }

  const getAllVisure = async () => {
    isLoading.value = true
    error.value = null
    
    try {
      const response = await api.get('/visure')
      
      // Log the activity
      // await logActivity(
      //   'view',
      //   'all_visure_view',
      //   `Viewed all visure data`,
      //   {}
      // )
      
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to fetch visure data'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const getAllBilancioOtticoRequests = async () => {
    isLoading.value = true
    error.value = null
    
    try {
      const response = await api.get('/bilancio-ottico')
      
      // Log the activity
      // await logActivity(
      //   'view',
      //   'all_bilancio_ottico_requests_view',
      //   `Viewed all bilancio ottico requests`,
      //   {}
      // )
      
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to fetch bilancio ottico requests'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const getCredit = async () => {
    try {
      const response = await api.get('/credit')
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to fetch credit info'
      throw err
    }
  }

  const updateSearchParams = (params) => {
    searchParams.value = { ...searchParams.value, ...params }
  }

  const clearSearch = () => {
    searchResults.value = []
    searchParams.value = {
      dryRun: 0,
      dataEnrichment: 'name',
      lat: '',
      long: '',
      radius: '',
      companyName: '',
      autocomplete: '',
      province: '',
      townCode: '',
      atecoCode: '',
      cciaa: '',
      reaCode: '',
      minTurnover: '',
      maxTurnover: '',
      minEmployees: '',
      maxEmployees: '',
      sdiCode: '',
      legalFormCode: '',
      shareHolderTaxCode: '',
      activityStatus: '',
      pec: '',
      creationTimestamp: '',
      lastUpdateTimestamp: '',
      skip: 0,
      limit: 10
    }
  }

  const clearError = () => {
    error.value = null
  }

  const getLLMOverview = async (piva) => {
    if (llmOverview.value[piva]) {
      return llmOverview.value[piva] // Return cached data
    }

    isLoading.value = true
    error.value = null
    try {
      const response = await api.get(`/company/llm-overview/${piva}?type=full`)
      llmOverview.value[piva] = response.data.overview // Cache the data
      currentCompany.value.llmOverview = response.data.overview // Update current company overview
      return response.data.overview
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to fetch LLM overview'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  return {
    companies,
    currentCompany,
    searchResults,
    searchParams,
    isLoading,
    error,
    hasResults,
    totalResults,
    searchCompanies,
    getCompanyDetails,
    getCompanyAdvanced,
    getCompanyFull,
    getCompanyClosed,
    getImpresaData,
    searchImpresa,
    requestBilancioOttico,
    getBilancioOtticoStatus,
    downloadBilancioOtticoFiles,
    getAllVisure,
    getAllBilancioOtticoRequests,
    getCredit,
    updateSearchParams,
    clearSearch,
    clearError,
    getLLMOverview
  }
})
