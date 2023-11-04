import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'

import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap-icons/font/bootstrap-icons.min.css'

import * as bootstrap from 'bootstrap'
window.bootstrap = bootstrap

import '@/assets/main.css'

const pinia = createPinia()
const app = createApp(App)
app.use(pinia)

app.mount('#app')
