type HttpMethod = 'GET' | 'POST' | 'PATCH' | 'DELETE'
type AdminFetchOptions = {
  method?: HttpMethod
  headers?: HeadersInit
  body?: BodyInit | Record<string, unknown> | null
}

export function useAdminApi() {
  const config = useRuntimeConfig()
  const auth = useAdminAuth()

  async function request<T>(path: string, options: AdminFetchOptions = {}): Promise<T> {
    auth.restore()
    try {
      const headers = new Headers(options.headers)
      headers.set('Authorization', `Bearer ${auth.token.value ?? ''}`)
      return await $fetch<T>(`${config.public.apiBaseUrl}${path}`, {
        ...options,
        headers,
      })
    } catch (error: unknown) {
      const status = (error as { statusCode?: number; response?: { status?: number } }).statusCode
        ?? (error as { response?: { status?: number } }).response?.status
      if (status === 401) {
        auth.logout()
        await navigateTo('/admin/login')
      }
      throw error
    }
  }

  return { request }
}
