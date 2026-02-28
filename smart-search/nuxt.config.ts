// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  modules: [
    '@nuxtjs/tailwindcss',
    '@pinia/nuxt',
  ],

  devServer: {
    port: 3001,
  },

  nitro: {
    devProxy: {
      '/api': {
        target: 'http://localhost:3000/api',
        changeOrigin: true,
      },
    },
  },
})
