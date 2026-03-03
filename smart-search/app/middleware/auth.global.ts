export default defineNuxtRouteMiddleware(async (_to, _from) => {
  const { isAuthenticated, check } = useAuth()
  const { public: { clientUrl } } = useRuntimeConfig()

  await check()

  if (!isAuthenticated.value) {
    return navigateTo(`${clientUrl}/auth/login`, { external: true })
  }
})
