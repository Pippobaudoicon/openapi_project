<template>
  <div v-motion-fade-visible-once>
    <div class="text-center mb-6">
      <h2 class="text-2xl font-bold text-gray-900">Create your account</h2>
      <p class="text-gray-600 mt-2">Join us and start exploring business intelligence</p>
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

    <form @submit.prevent="handleRegister" class="space-y-5">
      <div>
        <label for="email" class="block text-sm font-medium text-gray-700 mb-2">Email</label>
        <input
          id="email"
          v-model="form.email"
          type="email"
          required
          class="input-field"
          placeholder="Enter your email"
          :disabled="authStore.isLoading"
        />
      </div>

      <div>
        <label for="password" class="block text-sm font-medium text-gray-700 mb-2">Password</label>
        <div class="relative">
          <input
            id="password"
            v-model="form.password"
            :type="showPassword ? 'text' : 'password'"
            required
            class="input-field pr-12"
            placeholder="Create a strong password"
            :disabled="authStore.isLoading"
          />
          <button
            type="button"
            @click="showPassword = !showPassword"
            class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            :disabled="authStore.isLoading"
          >
            <svg v-if="showPassword" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
            </svg>
          </button>
        </div>
        
        <!-- Password strength indicator -->
        <div class="mt-2">
          <div class="flex space-x-1">
            <div
              v-for="n in 4"
              :key="n"
              :class="[
                'h-1 w-1/4 rounded-full transition-colors duration-200',
                passwordStrength >= n ? strengthColors[Math.min(passwordStrength, 4) - 1] : 'bg-gray-200'
              ]"
            ></div>
          </div>
          <p class="text-xs text-gray-500 mt-1">
            {{ strengthTexts[Math.min(passwordStrength, 4)] }}
          </p>
        </div>
      </div>

      <div>
        <label for="confirmPassword" class="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
        <input
          id="confirmPassword"
          v-model="form.confirmPassword"
          type="password"
          required
          class="input-field"
          placeholder="Confirm your password"
          :disabled="authStore.isLoading"
        />
        <p v-if="form.confirmPassword && form.password !== form.confirmPassword" class="text-xs text-red-500 mt-1">
          Passwords do not match
        </p>
      </div>

      <div class="flex items-center">
        <input
          id="terms"
          v-model="form.acceptTerms"
          type="checkbox"
          required
          class="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500 focus:ring-2"
          :disabled="authStore.isLoading"
        />
        <label for="terms" class="ml-2 text-sm text-gray-600">
          I agree to the
          <a href="#" class="text-primary-600 hover:text-primary-500 font-medium">Terms of Service</a>
          and
          <a href="#" class="text-primary-600 hover:text-primary-500 font-medium">Privacy Policy</a>
        </label>
      </div>

      <button
        type="submit"
        :disabled="authStore.isLoading || !isFormValid"
        class="w-full btn-primary flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <svg v-if="authStore.isLoading" class="spinner mr-3" />
        {{ authStore.isLoading ? 'Creating account...' : 'Create account' }}
      </button>
    </form>

    <div class="mt-6 text-center">
      <p class="text-sm text-gray-600">
        Already have an account?
        <router-link
          to="/auth/login"
          class="text-primary-600 hover:text-primary-500 font-medium transition-colors"
        >
          Sign in
        </router-link>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const form = ref({
  email: '',
  password: '',
  confirmPassword: '',
  acceptTerms: false
})

const showPassword = ref(false)
const successMessage = ref('')

const strengthColors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-500']
const strengthTexts = [
  'Too weak',
  'Weak password',
  'Fair password',
  'Good password',
  'Strong password'
]

const passwordStrength = computed(() => {
  const password = form.value.password
  let score = 0
  
  if (password.length >= 8) score++
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++
  if (/\d/.test(password)) score++
  if (/[^a-zA-Z\d]/.test(password)) score++
  
  return score
})

const isFormValid = computed(() => {
  return form.value.email &&
         form.value.password &&
         form.value.confirmPassword &&
         form.value.password === form.value.confirmPassword &&
         form.value.acceptTerms &&
         passwordStrength.value >= 2
})

const handleRegister = async () => {
  try {
    const response = await authStore.register({
      email: form.value.email,
      password: form.value.password
    })
    
    successMessage.value = response.message || 'Registration successful! Please check your email.'
    
    // Optionally redirect to login after a delay
    setTimeout(() => {
      router.push('/auth/login')
    }, 3000)
  } catch (error) {
    // Error is handled by the store
  }
}

onMounted(() => {
  authStore.clearError()
})
</script>
