export default defineEventHandler(async (event) => {
  const piva = getRouterParam(event, 'piva')
  const cookie = getRequestHeader(event, 'cookie')

    try {
      const { apiBaseUrl } = useRuntimeConfig()
      const data = await $fetch(`${apiBaseUrl}/api/v1/IT-advanced/${piva}`, {
        headers: cookie ? { cookie } : {},
      })
      return data
    } catch (err: any) {
      throw createError({
        statusCode: err?.statusCode || 500,
        statusMessage: err?.statusMessage || 'Failed to fetch company data',
      })
    }
})
