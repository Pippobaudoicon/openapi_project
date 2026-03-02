export default defineEventHandler(async (event) => {
  const piva = getRouterParam(event, 'piva')
  const cookie = getRequestHeader(event, 'cookie')

  try {
    // Try cached data first (from /:piva route)
    const data = await $fetch(`http://localhost:3000/api/v1/company/${piva}`, {
      headers: cookie ? { cookie } : {},
    })
    return data
  } catch {
    // If not cached, fetch advanced data from OpenAPI
    try {
      const data = await $fetch(`http://localhost:3000/api/v1/IT-advanced/${piva}`, {
        headers: cookie ? { cookie } : {},
      })
      return data
    } catch (err: any) {
      throw createError({
        statusCode: err?.statusCode || 500,
        statusMessage: err?.statusMessage || 'Failed to fetch company data',
      })
    }
  }
})
