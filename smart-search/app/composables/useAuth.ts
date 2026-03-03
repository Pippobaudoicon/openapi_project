interface User {
  _id: string
  email: string
  role: string
  isActive: boolean
}

interface AuthResponse {
  isAuthenticated: boolean
  user: User | null
}

export function useAuth() {
  const user = useState<User | null>('auth-user', () => null)
  const isAuthenticated = useState<boolean>('auth-status', () => false)
  const checkedAt = useState<number>('auth-checked-at', () => 0)

  async function check() {
    // Skip re-checking if verified within last 60 seconds (avoids duplicate calls on query-param navigations)
    if (import.meta.client && checkedAt.value && Date.now() - checkedAt.value < 60_000) {
      return
    }
    try {
      const headers = import.meta.server ? useRequestHeaders(['cookie']) : {}
      const data = await $fetch<AuthResponse>('/auth/check', { headers })
      isAuthenticated.value = data.isAuthenticated
      user.value = data.user
      checkedAt.value = Date.now()
    } catch {
      isAuthenticated.value = false
      user.value = null
      checkedAt.value = 0
    }
  }

  return {
    user: readonly(user),
    isAuthenticated: readonly(isAuthenticated),
    check,
  }
}
