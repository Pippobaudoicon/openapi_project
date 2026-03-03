export default defineEventHandler(async (event) => {
  const cookie = getRequestHeader(event, 'cookie')

  try {
    const { apiBaseUrl } = useRuntimeConfig()
    const data = await $fetch(`${apiBaseUrl}/api/v1/auth/check`, {
      headers: cookie ? { cookie } : {},
    })

    return data
  } catch {
    return { isAuthenticated: false, user: null }
  }
})
