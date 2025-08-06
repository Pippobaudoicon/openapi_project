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
          <h3 class="text-lg font-semibold text-gray-900">{{ authStore.user?.email }}</h3>
          <p class="text-gray-600">{{ authStore.user?.role || 'User' }}</p>
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
            :value="authStore.user?.email"
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
      
      <form @submit.prevent="changePassword" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
          <input
            v-model="passwordForm.currentPassword"
            type="password"
            class="input-field"
            placeholder="Enter current password"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">New Password</label>
          <input
            v-model="passwordForm.newPassword"
            type="password"
            class="input-field"
            placeholder="Enter new password"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
          <input
            v-model="passwordForm.confirmPassword"
            type="password"
            class="input-field"
            placeholder="Confirm new password"
          />
        </div>

        <div class="pt-4 border-t border-gray-200">
          <button type="submit" class="btn-primary">
            Update Password
          </button>
        </div>
      </form>
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
import { ref, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()

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

const userInitials = computed(() => {
  const email = authStore.user?.email || ''
  return email.charAt(0).toUpperCase()
})

const updateProfile = () => {
  // Handle profile update
  console.log('Updating profile:', profileForm.value)
}

const changePassword = () => {
  // Handle password change
  console.log('Changing password')
}
</script>
