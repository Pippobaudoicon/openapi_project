export default defineEventHandler(async (event) => {
  const cookie = getRequestHeader(event, 'cookie')
  const body = await readBody(event)

  try {
    const { apiBaseUrl } = useRuntimeConfig()
    const data = await $fetch(`${apiBaseUrl}/api/v1/auth/change-password`, {
      method: 'POST',
      headers: cookie ? { cookie } : {},
      body,
    })
    return data
  } catch (err: any) {
    throw createError({
      statusCode: err?.statusCode || 500,
      statusMessage: err?.data?.error || err?.statusMessage || 'Password change failed',
    })
  }
})
