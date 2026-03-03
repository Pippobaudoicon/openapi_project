export default defineEventHandler(async (event) => {
  const piva = getRouterParam(event, 'piva')
  const cookie = getRequestHeader(event, 'cookie')
  const query = getQuery(event)
  const queryString = query.force === 'true' ? '?force=true' : ''

  try {
    const { apiBaseUrl } = useRuntimeConfig()
    const data = await $fetch(`${apiBaseUrl}/api/v1/company/llm-overview/${piva}${queryString}`, {
      headers: cookie ? { cookie } : {},
    })
    return data
  } catch (err: any) {
    throw createError({
      statusCode: err?.statusCode || 500,
      statusMessage: err?.statusMessage || 'Failed to fetch LLM overview',
    })
  }
})
