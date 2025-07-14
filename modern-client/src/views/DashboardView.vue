<template>
  <div class="space-y-8">
    <!-- Welcome Section -->
    <div class="bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl p-8 text-white" v-motion-slide-visible-once-top>
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold mb-2">
            Welcome back, {{ authStore.user?.email?.split('@')[0] || 'User' }}!
          </h1>
          <p class="text-primary-100 text-lg">
            Your business intelligence dashboard is ready
          </p>
        </div>
        <div class="hidden md:block">
          <div class="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center">
            <svg class="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
        </div>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" v-motion-slide-visible-once-bottom>
      <QuickActionCard
        v-for="action in quickActions"
        :key="action.name"
        :action="action"
        @click="handleQuickAction(action)"
      />
    </div>

    <!-- Stats Overview -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6" v-motion-slide-visible-once-left>
      <div class="lg:col-span-2">
        <StatsCard :stats="stats" :loading="isLoading" />
      </div>
      <div>
        <CreditCard :credit="creditInfo" :loading="isLoading" />
      </div>
    </div>

    <!-- Recent Activity & Quick Search -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6" v-motion-fade-visible-once>
      <RecentActivityCard :activities="recentActivities" />
      <QuickSearchCard @search="handleQuickSearch" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useCompanyStore } from '@/stores/company'
import QuickActionCard from '@/components/dashboard/QuickActionCard.vue'
import StatsCard from '@/components/dashboard/StatsCard.vue'
import CreditCard from '@/components/dashboard/CreditCard.vue'
import RecentActivityCard from '@/components/dashboard/RecentActivityCard.vue'
import QuickSearchCard from '@/components/dashboard/QuickSearchCard.vue'

const router = useRouter()
const authStore = useAuthStore()
const companyStore = useCompanyStore()

const isLoading = ref(true)
const creditInfo = ref(null)
const stats = ref({
  totalSearches: 0,
  companiesFound: 0,
  reportsGenerated: 0,
  averageSearchTime: '0.5s'
})

const recentActivities = ref([
  {
    id: 1,
    type: 'search',
    description: 'Searched for companies in Milano',
    timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
    icon: 'search'
  },
  {
    id: 2,
    type: 'report',
    description: 'Generated full report for company 12345678901',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    icon: 'document'
  }
])

const quickActions = [
  {
    name: 'Company Search',
    description: 'Search for companies by various criteria',
    icon: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z',
    action: 'search',
    color: 'primary'
  },
  {
    name: 'VAT Lookup',
    description: 'Quick lookup by VAT number',
    icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
    action: 'vat-lookup',
    color: 'success'
  },
  {
    name: 'File Manager',
    description: 'Manage your downloaded reports',
    icon: 'M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z',
    action: 'files',
    color: 'warning'
  },
  {
    name: 'Profile Settings',
    description: 'Update your account settings',
    icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
    action: 'profile',
    color: 'gray'
  }
]

const handleQuickAction = (action) => {
  switch (action.action) {
    case 'search':
      router.push('/search')
      break
    case 'vat-lookup':
      router.push('/search?type=vat')
      break
    case 'files':
      router.push('/files')
      break
    case 'profile':
      router.push('/profile')
      break
  }
}

const handleQuickSearch = (query) => {
  router.push({
    name: 'Search',
    query: { q: query }
  })
}

onMounted(async () => {
  try {
    // Fetch credit info
    creditInfo.value = await companyStore.getCredit()
    
    // Simulate loading stats (replace with real API calls)
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    stats.value = {
      totalSearches: 127,
      companiesFound: 1543,
      reportsGenerated: 89,
      averageSearchTime: '0.8s'
    }
  } catch (error) {
    console.error('Failed to load dashboard data:', error)
  } finally {
    isLoading.value = false
  }
})
</script>
