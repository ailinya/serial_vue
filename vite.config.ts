/*
 * @Author: nll
 * @Date: 2025-09-24 11:10:08
 * @LastEditors: nll
 * @LastEditTime: 2025-10-09 14:07:26
 * @Description: 
 */
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import tailwindcss from '@tailwindcss/vite'
import { NaiveUiResolver } from 'unplugin-vue-components/resolvers' // Naive UI 解析器
// @ts-ignore
import postCssPxToRem from 'postcss-pxtorem' // 引入插件

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    tailwindcss(),
    AutoImport({
      


      imports: ['vue', 'vue-router',{
        'naive-ui':[
          'NSelect'

        ]

      }], // 自动导入 Vue 和 Vue Router 的 API
   
    }),
    Components({
      resolvers: [NaiveUiResolver()], // 自动导入 NaiveUiResolver 组件

    }),


  ],
 
  resolve: {
    alias: {
      "@": path.resolve(__dirname, 'src') // @ 表示 src:cite[1]
    }
  },
  
  server: {
    proxy: {
      // 代理所有以 /api 开头的请求
      '/api': {
        target: 'http://localhost:9993', // 后端服务器地址
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '/api') // 移除 /api 前缀
      },
   
    }
  }
  
})
