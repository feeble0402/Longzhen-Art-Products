export default defineNuxtRouteMiddleware((to) => {
  const auth = useAdminAuth()
  auth.restore()
  if (!auth.token.value && to.path !== '/admin/login') {
    return navigateTo('/admin/login')
  }
  if (auth.token.value && to.path === '/admin/login') {
    return navigateTo('/admin/products')
  }
})
