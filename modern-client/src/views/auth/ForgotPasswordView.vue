<template>
  <div v-motion-fade-visible-once>
    <div class="text-center mb-6">
      <h2 class="text-2xl font-bold text-gray-900">Forgot your password?</h2>
      <p class="text-gray-600 mt-2">No worries, we'll send you reset instructions</p>
    </div>

    <!-- Success Alert -->
    <div v-if="successMessage" class="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl">
      <div class="flex items-center">
        <svg class="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p class="text-green-700 text-sm">{{ successMessage }}</p>
      </div>
    </div>

    <!-- Error Alert -->
    <div v-if="authStore.error" class="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
      <div class="flex items-center">
        <svg class="w-5 h-5 text-red-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p class="text-red-700 text-sm">{{ authStore.error }}</p>
      </div>
    </div>

    <form v-if="!successMessage" @submit.prevent="handleForgotPassword" class="space-y-5">
      <div>
        <label for="email" class="block text-sm font-medium text-gray-700 mb-2">Email</label>
        <input
          id="email"
          v-model="email"
          type="email"
          required
          class="input-field"
          placeholder="Enter your email address"
          :disabled="authStore.isLoading"
        />
        <p class="text-xs text-gray-500 mt-1">
          We'll send a password reset link to this email
        </p>
      </div>

      <button
        type="submit"
        :disabled="authStore.isLoading || !email"
        class="w-full btn-primary flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <svg v-if="authStore.isLoading" class="spinner mr-3" />
        {{ authStore.isLoading ? 'Sending...' : 'Send reset link' }}
      </button>
    </form>

    <div class="mt-6 text-center">
      <router-link
        to="/auth/login"
        class="text-sm text-primary-600 hover:text-primary-500 font-medium transition-colors flex items-center justify-center"
      >
        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Back to sign in
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()

const email = ref('')
const successMessage = ref('')

const handleForgotPassword = async () => {
  try {
    const response = await authStore.forgotPassword(email.value)
    successMessage.value = response.message || 'Password reset link sent to your email!'
  } catch (error) {
    // Error is handled by the store
  }
}

onMounted(() => {
  authStore.clearError()
})
</script>
