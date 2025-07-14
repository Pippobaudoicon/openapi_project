<template>
  <div class="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-100 flex items-center justify-center p-4">
    <div class="text-center max-w-md" v-motion-fade-visible-once>
      <!-- 404 Illustration -->
      <div class="mb-8">
        <div class="inline-flex items-center justify-center w-32 h-32 bg-primary-100 rounded-full mb-6">
          <svg class="w-16 h-16 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-3-8h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h1 class="text-6xl font-bold text-gray-900 mb-4">404</h1>
        <h2 class="text-2xl font-semibold text-gray-700 mb-4">Page not found</h2>
        <p class="text-gray-600 mb-8">
          Sorry, we couldn't find the page you're looking for. It might have been moved or doesn't exist.
        </p>
      </div>

      <!-- Action Buttons -->
      <div class="space-y-4">
        <router-link to="/dashboard" class="btn-primary inline-flex items-center">
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
          </svg>
          Go to Dashboard
        </router-link>
        
        <div class="flex items-center justify-center space-x-4">
          <button @click="$router.go(-1)" class="btn-secondary">
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Go Back
          </button>
          
          <router-link to="/search" class="btn-secondary">
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            Search Companies
          </router-link>
        </div>
      </div>

      <!-- Help Text -->
      <div class="mt-12 p-6 bg-white rounded-xl shadow-sm border border-gray-200">
        <h3 class="font-semibold text-gray-900 mb-2">Need help?</h3>
        <p class="text-sm text-gray-600 mb-4">
          If you believe this is an error, please contact our support team.
        </p>
        <a href="mailto:support@example.com" class="text-primary-600 hover:text-primary-500 text-sm font-medium">
          Contact Support →
        </a>
      </div>
    </div>
  </div>
</template>

<script setup>
// 404 Not Found page
</script>
