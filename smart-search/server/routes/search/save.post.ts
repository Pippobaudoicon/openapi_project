export default defineEventHandler(async (event) => {
  const cookie = getRequestHeader(event, 'cookie')
  const body = await readBody(event)

  try {
    const { apiBaseUrl } = useRuntimeConfig()
    const data = await $fetch(`${apiBaseUrl}/api/v1/ai/save-search`, {
      method: 'POST',
      body,
      headers: cookie ? { cookie } : {},
    })
    return data
  } catch (err: any) {
    throw createError({
      statusCode: err?.statusCode || 500,
      statusMessage: err?.statusMessage || 'Failed to save search',
    })
  }
})
