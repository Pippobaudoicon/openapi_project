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

  async function check() {
    try {
      const headers = import.meta.server ? useRequestHeaders(['cookie']) : {}
      const data = await $fetch<AuthResponse>('/auth/check', { headers })
      isAuthenticated.value = data.isAuthenticated
      user.value = data.user
    } catch {
      isAuthenticated.value = false
      user.value = null
    }
  }

  return {
    user: readonly(user),
    isAuthenticated: readonly(isAuthenticated),
    check,
  }
}
