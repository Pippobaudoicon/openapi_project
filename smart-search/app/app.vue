<script setup lang="ts">
const { init, isDark, toggle } = useTheme()

onMounted(() => {
  init()
})
</script>

<template>
  <div class="min-h-screen bg-zinc-50 font-sans antialiased transition-colors dark:bg-zinc-950">
    <!-- Theme Toggle (fixed) -->
    <button
      @click="toggle"
      class="fixed right-5 top-5 z-50 flex h-9 w-9 items-center justify-center rounded-xl border border-zinc-200 bg-white/80 text-zinc-500 backdrop-blur-sm transition-all hover:border-zinc-300 hover:text-zinc-700 dark:border-white/[0.08] dark:bg-zinc-900/80 dark:text-zinc-400 dark:hover:border-white/[0.15] dark:hover:text-zinc-200"
      :title="isDark ? 'Passa al tema chiaro' : 'Passa al tema scuro'"
    >
      <!-- Sun icon (shown in dark mode) -->
      <svg v-if="isDark" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
        <path stroke-linecap="round" stroke-linejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
      </svg>
      <!-- Moon icon (shown in light mode) -->
      <svg v-else class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
        <path stroke-linecap="round" stroke-linejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
      </svg>
    </button>

    <NuxtRouteAnnouncer />
    <NuxtPage />
  </div>
</template>
