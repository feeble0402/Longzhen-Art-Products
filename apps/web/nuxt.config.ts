import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  css: ['~/assets/css/main.css'],
  vite: { plugins: [tailwindcss()] },
  app: {
    head: {
      htmlAttrs: { lang: 'zh-Hant' },
      title: '\u9f8d\u632f\u85dd\u54c1',
      meta: [
        { name: 'description', content: '\u9f8d\u632f\u85dd\u54c1\u54c1\u724c\u5f62\u8c61\u8207\u5546\u54c1\u5c55\u793a\u7db2\u7ad9' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      ],
    },
  },
})
