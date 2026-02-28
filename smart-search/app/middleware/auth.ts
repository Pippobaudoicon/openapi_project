export default defineNuxtRouteMiddleware(async (_to, _from) => {
  const { isAuthenticated, check } = useAuth()

  await check()

  if (!isAuthenticated.value) {
    return navigateTo('http://localhost:5173/auth/login', { external: true })
  }
})
