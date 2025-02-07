import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import { router } from "./routes/routes.js";

import './assets/main.css'
import './assets/app.css'

const pinia = createPinia()

createApp(App)
.use(router)
.use(pinia)
.mount('#app')
