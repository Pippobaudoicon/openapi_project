<template>
  <header class="bg-white border-b border-gray-200 shadow-sm">
    <div class="flex items-center justify-between px-6 py-4">
      <!-- Left side -->
      <div class="flex items-center space-x-4">
        <!-- Sidebar toggle -->
        <button
          @click="$emit('toggle-sidebar')"
          class="p-2 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors duration-200"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <!-- Breadcrumb -->
        <nav class="flex" aria-label="Breadcrumb">
          <ol class="flex items-center space-x-2">
            <li v-for="(crumb, index) in breadcrumbs" :key="index" class="flex items-center">
              <svg v-if="index > 0" class="w-4 h-4 text-gray-400 mx-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
              <router-link
                v-if="crumb.to"
                :to="crumb.to"
                :class="[
                  'text-sm font-medium transition-colors duration-200',
                  index === breadcrumbs.length - 1 
                    ? 'text-gray-900' 
                    : 'text-gray-500 hover:text-gray-700'
                ]"
              >
                {{ crumb.name }}
              </router-link>
              <span v-else class="text-sm font-medium text-gray-900">
                {{ crumb.name }}
              </span>
            </li>
          </ol>
        </nav>
      </div>

      <!-- Right side -->
      <div class="flex items-center space-x-4">
        <!-- Search -->
        <div class="relative">
          <input
            v-model="quickSearch"
            type="text"
            placeholder="Quick search..."
            class="w-64 pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all duration-200"
            @keyup.enter="handleQuickSearch"
          >
          <svg class="absolute left-3 top-2.5 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        <!-- Notifications -->
        <button class="relative p-2 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors duration-200">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-5 5v-5zm-4-3.5a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
          </svg>
          <!-- Notification badge -->
          <span class="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>

        <!-- User Menu -->
        <div class="relative" ref="userMenuRef">
          <button
            @click="showUserMenu = !showUserMenu"
            class="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
          >
            <div class="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
              <span class="text-sm font-medium text-white">
                {{ userInitials }}
              </span>
            </div>
            <div class="hidden md:block text-left">
              <p class="text-sm font-medium text-gray-900">{{ authStore.user?.email }}</p>
              <p class="text-xs text-gray-500">{{ authStore.user?.role }}</p>
            </div>
            <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          <!-- User Menu Dropdown -->
          <transition
            enter-active-class="transition ease-out duration-200"
            enter-from-class="transform opacity-0 scale-95"
            enter-to-class="transform opacity-100 scale-100"
            leave-active-class="transition ease-in duration-75"
            leave-from-class="transform opacity-100 scale-100"
            leave-to-class="transform opacity-0 scale-95"
          >
            <div
              v-if="showUserMenu"
              class="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50"
            >
              <router-link
                to="/profile"
                class="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                @click="showUserMenu = false"
              >
                <svg class="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Profile
              </router-link>
              <hr class="my-2 border-gray-200">
              <button
                @click="handleLogout"
                class="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors duration-200"
              >
                <svg class="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Sign out
              </button>
            </div>
          </transition>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

defineEmits(['toggle-sidebar'])

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const quickSearch = ref('')
const showUserMenu = ref(false)
const userMenuRef = ref(null)

const userInitials = computed(() => {
  const email = authStore.user?.email || ''
  return email.charAt(0).toUpperCase()
})

const breadcrumbs = computed(() => {
  const crumbs = []
  
  if (route.name === 'Dashboard') {
    crumbs.push({ name: 'Dashboard' })
  } else if (route.name === 'Search') {
    crumbs.push({ name: 'Search', to: '/search' })
  } else if (route.name === 'CompanyDetail') {
    crumbs.push({ name: 'Search', to: '/search' })
    crumbs.push({ name: `Company ${route.params.piva}` })
  } else if (route.name === 'Files') {
    crumbs.push({ name: 'Files' })
  } else if (route.name === 'Profile') {
    crumbs.push({ name: 'Profile' })
  }
  
  return crumbs
})

const handleQuickSearch = () => {
  if (quickSearch.value.trim()) {
    router.push({
      name: 'Search',
      query: { q: quickSearch.value.trim() }
    })
  }
}

const handleLogout = async () => {
  try {
    await authStore.logout()
    router.push('/auth/login')
  } catch (error) {
    console.error('Logout failed:', error)
  }
}

// Close user menu when clicking outside
const handleClickOutside = (event) => {
  if (userMenuRef.value && !userMenuRef.value.contains(event.target)) {
    showUserMenu.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>
