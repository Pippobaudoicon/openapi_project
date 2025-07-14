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
    q: '',
    provincia: '',
    codice_ateco: '',
    fatturato_min: '',
    fatturato_max: '',
    dipendenti_min: '',
    dipendenti_max: '',
    from: 0,
    size: 10
  })

  const hasResults = computed(() => searchResults.value.length > 0)
  const totalResults = computed(() => searchResults.value.length)

  const searchCompanies = async (params = {}) => {
    isLoading.value = true
    error.value = null
    
    try {
      const searchQuery = { ...searchParams.value, ...params }
      const response = await api.get('/search', { params: searchQuery })
      searchResults.value = response.data.hits || response.data.companies || []
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Search failed'
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
      q: '',
      provincia: '',
      codice_ateco: '',
      fatturato_min: '',
      fatturato_max: '',
      dipendenti_min: '',
      dipendenti_max: '',
      from: 0,
      size: 10
    }
  }

  const clearError = () => {
    error.value = null
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
    clearError
  }
})
