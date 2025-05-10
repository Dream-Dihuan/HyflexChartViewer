

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

const app = createApp(App)

import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

import 'normalize.css'


app.use(ElementPlus)

app.use(createPinia())
app.use(router)

app.mount('#app')
