/*
 * @Author: nll
 * @Date: 2025-09-24 11:10:08
 * @LastEditors: nll
 * @LastEditTime: 2025-09-28 14:17:11
 * @Description: 
 */
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from '@/router/index'
import '@/styles/twind.css'
// 导入全局自定义样式
import '@/styles/global.scss'
// 导入 Naive UI 主题样式

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)
app.mount('#app')
