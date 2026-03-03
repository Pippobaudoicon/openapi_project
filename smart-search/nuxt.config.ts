// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  modules: [
    '@nuxtjs/tailwindcss',
    '@pinia/nuxt',
  ],

  css: ['~/assets/css/main.css'],

  runtimeConfig: {
    apiBaseUrl: process.env.API_BASE_URL || 'http://localhost:3000',
    public: {
      clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
    },
  },

  app: {
    head: {
      htmlAttrs: { class: 'dark' },
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400&family=Syne:wght@600;700;800&display=swap',
        },
      ],
      script: [
        {
          // Prevent FOUC: apply theme before render
          innerHTML: `(function(){try{var t=localStorage.getItem('smart-search-theme');document.documentElement.classList.toggle('dark',t!=='light');document.documentElement.style.colorScheme=t==='light'?'light':'dark'}catch(e){}})()`,
          type: 'text/javascript',
        },
      ],
    },
  },

  devServer: {
    port: 3001,
  },

  vite: {
    server: {
      allowedHosts: true,
      http2: false,
    },
  },

  nitro: {
    devProxy: {
      '/api': {
        target: `${process.env.API_BASE_URL || 'http://localhost:3000'}/api`,
        changeOrigin: true,
      },
    },
  },
})
