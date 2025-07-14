<template>
  <div class="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-100">
    <!-- Background Pattern -->
    <div class="absolute inset-0 overflow-hidden">
      <div class="absolute -top-40 -right-40 w-80 h-80 bg-primary-200 rounded-full opacity-20 animate-float"></div>
      <div class="absolute -bottom-40 -left-40 w-96 h-96 bg-primary-300 rounded-full opacity-10 animate-float" style="animation-delay: 1s;"></div>
    </div>
    
    <div class="relative z-10 min-h-screen flex items-center justify-center p-4">
      <div class="w-full max-w-md">
        <!-- Logo/Brand -->
        <div class="text-center mb-8" v-motion-slide-visible-once-top>
          <div class="inline-flex items-center justify-center w-16 h-16 bg-primary-600 rounded-2xl mb-4 shadow-lg">
            <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h1 class="text-3xl font-display font-bold text-gray-900">OpenAPI Client</h1>
          <p class="text-gray-600 mt-2">Modern Business Intelligence Platform</p>
        </div>

        <!-- Auth Card -->
        <div class="card card-hover" v-motion-slide-visible-once-bottom>
          <router-view />
        </div>

        <!-- Footer -->
        <div class="text-center mt-8 text-sm text-gray-500" v-motion-fade-visible-once>
          <p>&copy; {{ new Date().getFullYear() }} OpenAPI Client. All rights reserved.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// This layout is used for authentication pages
</script>
