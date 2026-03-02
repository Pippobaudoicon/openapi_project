export default defineEventHandler(async (event) => {
  const piva = getRouterParam(event, 'piva')
  const cookie = getRequestHeader(event, 'cookie')

  try {
    const data = await $fetch(`http://localhost:3000/api/v1/company/llm-overview/${piva}`, {
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
