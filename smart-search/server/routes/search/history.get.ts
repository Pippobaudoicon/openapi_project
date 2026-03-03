export default defineEventHandler(async (event) => {
  const cookie = getRequestHeader(event, 'cookie')

  try {
    const { apiBaseUrl } = useRuntimeConfig()
    const data = await $fetch(`${apiBaseUrl}/api/v1/ai/search-history`, {
      headers: cookie ? { cookie } : {},
    })
    return data
  } catch (err: any) {
    throw createError({
      statusCode: err?.statusCode || 500,
      statusMessage: err?.statusMessage || 'Failed to fetch search history',
    })
  }
})
