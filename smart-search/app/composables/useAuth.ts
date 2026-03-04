interface User {
  _id: string
  email: string
  firstName?: string
  lastName?: string
  company?: string
  phone?: string
  role: string
  isActive: boolean
  creditBalance?: number
  creditLimit?: number
}

interface AuthResponse {
  isAuthenticated: boolean
  user: User | null
}

export function useAuth() {
  const user = useState<User | null>('auth-user', () => null)
  const isAuthenticated = useState<boolean>('auth-status', () => false)
  const checkedAt = useState<number>('auth-checked-at', () => 0)

  const displayName = computed(() => {
    if (!user.value) return ''
    if (user.value.firstName || user.value.lastName) {
      return [user.value.firstName, user.value.lastName].filter(Boolean).join(' ')
    }
    return user.value.email
  })

  const initials = computed(() => {
    if (!user.value) return ''
    if (user.value.firstName && user.value.lastName) {
      return (user.value.firstName[0] + user.value.lastName[0]).toUpperCase()
    }
    return user.value.email[0].toUpperCase()
  })

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

  async function logout() {
    try {
      await $fetch('/auth/logout', { method: 'POST' })
    } catch {
      // Proceed with redirect even if logout call fails
    }
    isAuthenticated.value = false
    user.value = null
    checkedAt.value = 0
    const { public: { clientUrl } } = useRuntimeConfig()
    navigateTo(`${clientUrl}/auth/login`, { external: true })
  }

  async function fetchProfile() {
    const data = await $fetch<User>('/api/v1/users/profile')
    user.value = data
    return data
  }

  async function updateProfile(updates: { firstName?: string; lastName?: string; company?: string; phone?: string }) {
    const data = await $fetch<User>('/api/v1/users/profile', {
      method: 'PUT',
      body: updates,
    })
    user.value = data
    return data
  }

  async function changePassword(currentPassword: string, newPassword: string) {
    await $fetch('/auth/change-password', {
      method: 'POST',
      body: { currentPassword, newPassword },
    })
  }

  return {
    user: readonly(user),
    isAuthenticated: readonly(isAuthenticated),
    displayName,
    initials,
    check,
    logout,
    fetchProfile,
    updateProfile,
    changePassword,
  }
}
