interface AdminIdentity {
  sub: string
  email: string
  displayName: string
}

interface LoginResponse {
  accessToken: string
  tokenType: 'Bearer'
  expiresInSeconds: number
  admin: AdminIdentity
}

const TOKEN_KEY = 'longzhen-admin-token'
const ADMIN_KEY = 'longzhen-admin-identity'

export function useAdminAuth() {
  const token = useState<string | null>('admin-token', () => null)
  const admin = useState<AdminIdentity | null>('admin-identity', () => null)
  const restored = useState<boolean>('admin-restored', () => false)
  const config = useRuntimeConfig()

  function restore(): void {
    if (!import.meta.client || restored.value) return
    token.value = sessionStorage.getItem(TOKEN_KEY)
    const rawAdmin = sessionStorage.getItem(ADMIN_KEY)
    if (rawAdmin) {
      try {
        admin.value = JSON.parse(rawAdmin) as AdminIdentity
      } catch {
        sessionStorage.removeItem(ADMIN_KEY)
      }
    }
    restored.value = true
  }

  async function login(email: string, password: string): Promise<void> {
    const response = await $fetch<LoginResponse>(`${config.public.apiBaseUrl}/auth/login`, {
      method: 'POST',
      body: { email, password },
    })
    token.value = response.accessToken
    admin.value = response.admin
    if (import.meta.client) {
      sessionStorage.setItem(TOKEN_KEY, response.accessToken)
      sessionStorage.setItem(ADMIN_KEY, JSON.stringify(response.admin))
    }
  }

  function logout(): void {
    token.value = null
    admin.value = null
    if (import.meta.client) {
      sessionStorage.removeItem(TOKEN_KEY)
      sessionStorage.removeItem(ADMIN_KEY)
    }
  }

  return { token, admin, restore, login, logout }
}
