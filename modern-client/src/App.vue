<template>
  <router-view />
</template>

<script setup>
import { onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()

onMounted(() => {
  // Check if user is already authenticated on app load
  authStore.checkAuth()
})
</script>

<style>
#app {
  min-height: 100vh;
}
</style>
