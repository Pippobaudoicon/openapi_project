export default defineEventHandler(async (event) => {
  const cookie = getRequestHeader(event, 'cookie')

  try {
    const data = await $fetch('http://localhost:3000/api/v1/auth/check', {
      headers: cookie ? { cookie } : {},
    })

    return data
  } catch {
    return { isAuthenticated: false, user: null }
  }
})
