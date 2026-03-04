<script setup lang="ts">
const { init } = useTheme()

onMounted(() => {
  init()
})
</script>

<template>
  <div class="min-h-screen bg-zinc-50 font-sans antialiased transition-colors dark:bg-zinc-950">
    <AppHeader />
    <NuxtRouteAnnouncer />
    <NuxtPage />
  </div>
</template>
