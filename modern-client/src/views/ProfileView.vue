<template>
  <div class="max-w-4xl mx-auto space-y-6">
    <!-- Header -->
    <div class="text-center" v-motion-slide-visible-once-top>
      <h1 class="text-2xl font-bold text-gray-900">Profile Settings</h1>
      <p class="text-gray-600 mt-1">Manage your account preferences and security</p>
    </div>

    <!-- Profile Info -->
    <div class="card" v-motion-slide-visible-once-left>
      <div class="flex items-center space-x-6 mb-6">
        <div class="w-20 h-20 bg-primary-600 rounded-full flex items-center justify-center">
          <span class="text-2xl font-bold text-white">
            {{ userInitials }}
          </span>
        </div>
        <div>
          <h3 class="text-lg font-semibold text-gray-900">{{ userStore.user?.email }}</h3>
          <p class="text-gray-600">{{ userStore.user?.role || 'User' }}</p>
          <button class="text-sm text-primary-600 hover:text-primary-500 font-medium mt-1">
            Change Avatar
          </button>
        </div>
      </div>

      <form @submit.prevent="updateProfile" class="space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">First Name</label>
            <input
              v-model="profileForm.firstName"
              type="text"
              class="input-field"
              placeholder="Enter your first name"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
            <input
              v-model="profileForm.lastName"
              type="text"
              class="input-field"
              placeholder="Enter your last name"
            />
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Email</label>
          <input
            type="email"
            class="input-field"
            readonly
            :value="userStore.user?.email"
          />
          <p class="text-xs text-gray-500 mt-1">Email cannot be changed</p>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Company</label>
          <input
            v-model="profileForm.company"
            type="text"
            class="input-field"
            placeholder="Your company name"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Phone</label>
          <input
            v-model="profileForm.phone"
            type="tel"
            class="input-field"
            placeholder="Your phone number"
          />
        </div>

        <div class="pt-4 border-t border-gray-200">
          <button type="submit" class="btn-primary">
            Save Changes
          </button>
        </div>
      </form>
    </div>

    <!-- Password Change -->
    <div class="card" v-motion-slide-visible-once-right>
      <h3 class="text-lg font-semibold text-gray-900 mb-4">Change Password</h3>
      
      <!-- Status Message -->
      <div v-if="passwordState.message" 
           class="mb-4 p-3 rounded-lg text-sm font-medium"
           :class="{
             'bg-green-100 text-green-800 border border-green-200': passwordState.messageType === 'success',
             'bg-red-100 text-red-800 border border-red-200': passwordState.messageType === 'error',
             'bg-blue-100 text-blue-800 border border-blue-200': passwordState.messageType === 'info'
           }">
        <div class="flex items-center">
          <svg v-if="passwordState.messageType === 'success'" class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
          </svg>
          <svg v-if="passwordState.messageType === 'error'" class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
          </svg>
          <svg v-if="passwordState.messageType === 'info'" class="w-4 h-4 mr-2 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          {{ passwordState.message }}
        </div>
      </div>
      
      <form @submit.prevent="showPasswordConfirmation" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
          <input
            v-model="passwordForm.currentPassword"
            type="password"
            class="input-field"
            placeholder="Enter current password"
            :disabled="passwordState.isLoading"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">New Password</label>
          <input
            v-model="passwordForm.newPassword"
            type="password"
            class="input-field"
            placeholder="Enter new password"
            :disabled="passwordState.isLoading"
          />
          <div v-if="passwordForm.newPassword" class="mt-2 space-y-1">
            <div class="flex items-center text-xs"
                 :class="passwordForm.newPassword.length >= 8 ? 'text-green-600' : 'text-red-600'">
              <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path v-if="passwordForm.newPassword.length >= 8" fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                <path v-else fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
              </svg>
              At least 8 characters
            </div>
            <div class="flex items-center text-xs"
                 :class="/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(passwordForm.newPassword) ? 'text-green-600' : 'text-red-600'">
              <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path v-if="/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(passwordForm.newPassword)" fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                <path v-else fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
              </svg>
              Contains uppercase, lowercase, and number
            </div>
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
          <input
            v-model="passwordForm.confirmPassword"
            type="password"
            class="input-field"
            placeholder="Confirm new password"
            :disabled="passwordState.isLoading"
            :class="{
              'border-red-300 focus:border-red-500': passwordForm.confirmPassword && passwordForm.newPassword !== passwordForm.confirmPassword,
              'border-green-300 focus:border-green-500': passwordForm.confirmPassword && passwordForm.newPassword === passwordForm.confirmPassword
            }"
          />
          <p v-if="passwordForm.confirmPassword && passwordForm.newPassword !== passwordForm.confirmPassword" 
             class="text-xs text-red-600 mt-1">
            Passwords do not match
          </p>
        </div>

        <!-- Validation Errors -->
        <div v-if="passwordValidation.errors.length > 0" class="bg-red-50 border border-red-200 rounded-lg p-3">
          <p class="text-sm font-medium text-red-800 mb-2">Please fix the following errors:</p>
          <ul class="text-sm text-red-700 space-y-1">
            <li v-for="error in passwordValidation.errors" :key="error" class="flex items-start">
              <span class="text-red-500 mr-1">•</span>
              {{ error }}
            </li>
          </ul>
        </div>

        <div class="pt-4 border-t border-gray-200">
          <button 
            type="submit" 
            class="btn-primary"
            :disabled="!canSubmitPassword"
            :class="{ 'opacity-50 cursor-not-allowed': !canSubmitPassword }"
          >
            <svg v-if="passwordState.isLoading" class="w-4 h-4 mr-2 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {{ passwordState.isLoading ? 'Updating...' : 'Update Password' }}
          </button>
        </div>
      </form>
    </div>

    <!-- Confirmation Dialog -->
    <div v-if="passwordState.showConfirmDialog" 
         class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 max-w-md mx-4">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Confirm Password Change</h3>
        <p class="text-gray-600 mb-6">
          Are you sure you want to change your password? This action cannot be undone and you'll need to use your new password for future logins.
        </p>
        <div class="flex justify-end space-x-3">
          <button 
            @click="cancelPasswordChange"
            class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            :disabled="passwordState.isLoading"
          >
            Cancel
          </button>
          <button 
            @click="changePassword"
            class="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors"
            :disabled="passwordState.isLoading"
          >
            <svg v-if="passwordState.isLoading" class="w-4 h-4 mr-2 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {{ passwordState.isLoading ? 'Changing...' : 'Change Password' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Preferences -->
    <div class="card" v-motion-fade-visible-once>
      <h3 class="text-lg font-semibold text-gray-900 mb-4">Preferences</h3>
      
      <div class="space-y-4">
        <div class="flex items-center justify-between">
          <div>
            <h4 class="font-medium text-gray-900">Email Notifications</h4>
            <p class="text-sm text-gray-600">Receive email updates about your searches</p>
          </div>
          <label class="relative inline-flex items-center cursor-pointer">
            <input v-model="preferences.emailNotifications" type="checkbox" class="sr-only peer">
            <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
          </label>
        </div>

        <div class="flex items-center justify-between">
          <div>
            <h4 class="font-medium text-gray-900">Auto-save Search Results</h4>
            <p class="text-sm text-gray-600">Automatically save search results to your files</p>
          </div>
          <label class="relative inline-flex items-center cursor-pointer">
            <input v-model="preferences.autoSave" type="checkbox" class="sr-only peer">
            <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
          </label>
        </div>

        <div class="flex items-center justify-between">
          <div>
            <h4 class="font-medium text-gray-900">Dark Mode</h4>
            <p class="text-sm text-gray-600">Switch to dark theme</p>
          </div>
          <label class="relative inline-flex items-center cursor-pointer">
            <input v-model="preferences.darkMode" type="checkbox" class="sr-only peer">
            <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
          </label>
        </div>
      </div>
    </div>

    <!-- Danger Zone -->
    <div class="card border-red-200 bg-red-50" v-motion-slide-visible-once-bottom>
      <h3 class="text-lg font-semibold text-red-900 mb-4">Danger Zone</h3>
      
      <div class="space-y-4">
        <div class="flex items-center justify-between">
          <div>
            <h4 class="font-medium text-red-900">Delete Account</h4>
            <p class="text-sm text-red-700">Permanently delete your account and all data</p>
          </div>
          <button class="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors">
            Delete Account
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()

const profileForm = ref({
  firstName: '',
  lastName: '',
  email: '',
  company: '',
  phone: ''
})

const passwordForm = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const preferences = ref({
  emailNotifications: true,
  autoSave: false,
  darkMode: false
})

// Password change state management
const passwordState = ref({
  isLoading: false,
  message: '',
  messageType: '', // 'success', 'error', 'info'
  showConfirmDialog: false
})

const passwordValidation = computed(() => {
  const errors = []
  const form = passwordForm.value
  
  if (form.newPassword && form.newPassword.length < 8) {
    errors.push('Password must be at least 8 characters long')
  }
  
  if (form.newPassword && form.confirmPassword && form.newPassword !== form.confirmPassword) {
    errors.push('Passwords do not match')
  }
  
  if (form.newPassword && !/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(form.newPassword)) {
    errors.push('Password must contain at least one uppercase letter, one lowercase letter, and one number')
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
})

const canSubmitPassword = computed(() => {
  const form = passwordForm.value
  return form.currentPassword && 
         form.newPassword && 
         form.confirmPassword && 
         passwordValidation.value.isValid &&
         !passwordState.value.isLoading
})

const userInitials = computed(() => {
  const email = userStore.user?.email || ''
  return email.charAt(0).toUpperCase()
})

const fetchUserData = () => {
  return userStore.fetchUser()
}

const updateProfile = () => {
  userStore.updateUser({
    firstName: profileForm.value.firstName,
    lastName: profileForm.value.lastName,
    company: profileForm.value.company,
    phone: profileForm.value.phone
  })
}

const showPasswordConfirmation = () => {
  if (!canSubmitPassword.value) return
  passwordState.value.showConfirmDialog = true
}

const changePassword = async () => {
  passwordState.value.isLoading = true
  passwordState.value.message = 'Updating password...'
  passwordState.value.messageType = 'info'
  
  try {
    await userStore.changePassword({
      currentPassword: passwordForm.value.currentPassword,
      newPassword: passwordForm.value.newPassword,
      confirmPassword: passwordForm.value.confirmPassword
    })
    
    // Success
    passwordState.value.message = 'Password updated successfully!'
    passwordState.value.messageType = 'success'
    
    // Clear the form
    passwordForm.value = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    }
    
    // Clear success message after 5 seconds
    setTimeout(() => {
      passwordState.value.message = ''
    }, 5000)
    
  } catch (error) {
    passwordState.value.message = error.message || 'Failed to update password. Please try again.'
    passwordState.value.messageType = 'error'
  } finally {
    passwordState.value.isLoading = false
    passwordState.value.showConfirmDialog = false
  }
}

const cancelPasswordChange = () => {
  passwordState.value.showConfirmDialog = false
}
onMounted(() => {
  fetchUserData().then(() => {
    profileForm.value.firstName = userStore.user?.firstName || ''
    profileForm.value.lastName = userStore.user?.lastName || ''
    profileForm.value.company = userStore.user?.company || ''
    profileForm.value.phone = userStore.user?.phone || ''
  })
})
</script>
