export default defineEventHandler(async (event) => {
  const cookie = getRequestHeader(event, 'cookie')
  const query = getQuery(event)

  const searchParams = new URLSearchParams()
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== null) {
      searchParams.set(key, String(value))
    }
  }

  try {
    const { apiBaseUrl } = useRuntimeConfig()
    const data = await $fetch(
      `${apiBaseUrl}/api/v1/IT-search?${searchParams.toString()}`,
      { headers: cookie ? { cookie } : {} }
    )
    return data
  } catch (err: any) {
    throw createError({
      statusCode: err?.statusCode || 500,
      statusMessage: err?.statusMessage || 'Search failed',
    })
  }
})
