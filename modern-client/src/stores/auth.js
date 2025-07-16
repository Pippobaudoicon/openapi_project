
import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import api from '@/services/api'

export const useAuthStore = defineStore('auth', () => {
  // Try to load user from localStorage on store init
  const storedUser = localStorage.getItem('user')
  const user = ref(storedUser ? JSON.parse(storedUser) : null)
  const isLoading = ref(false)
  const error = ref(null)

  const isAuthenticated = computed(() => !!user.value)

  const login = async (credentials) => {
    isLoading.value = true
    error.value = null
    try {
      const response = await api.post('/auth/login', credentials)
      user.value = response.data.user || { email: credentials.email }
      // Persist user to localStorage
      localStorage.setItem('user', JSON.stringify(user.value))
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Login failed'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const register = async (userData) => {
    isLoading.value = true
    error.value = null
    
    try {
      const response = await api.post('/auth/register', userData)
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Registration failed'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const logout = async () => {
    isLoading.value = true
    try {
      await api.post('/auth/logout')
    } catch (err) {
      console.error('Logout error:', err)
    } finally {
      user.value = null
      localStorage.removeItem('user')
      isLoading.value = false
    }
  }

  const forgotPassword = async (email) => {
    isLoading.value = true
    error.value = null
    
    try {
      const response = await api.post('/auth/forgot-password', { email })
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to send reset email'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const resetPassword = async (token, password) => {
    isLoading.value = true
    error.value = null
    
    try {
      const response = await api.post('/auth/reset-password', { token, password })
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Password reset failed'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const checkAuth = async () => {
    try {
      const response = await api.get('/auth/check')
      user.value = response.data.user
      // Persist user to localStorage
      localStorage.setItem('user', JSON.stringify(user.value))
    } catch (err) {
      user.value = null
      localStorage.removeItem('user')
    }
  }

  const clearError = () => {
    error.value = null
  }

  // Watch for user changes and persist/remove from localStorage
  watch(user, (newUser) => {
    if (newUser) {
      localStorage.setItem('user', JSON.stringify(newUser))
    } else {
      localStorage.removeItem('user')
    }
  })

  return {
    user,
    isLoading,
    error,
    isAuthenticated,
    login,
    register,
    logout,
    forgotPassword,
    resetPassword,
    checkAuth,
    clearError
  }
})
