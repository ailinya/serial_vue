/*
 * @Author: nll
 * @Date: 2025-09-24 14:11:55
 * @LastEditors: '艾琳爱' '2664840261@qq.com'
 * @LastEditTime: 2025-10-13 10:59:21
 * @Description: 
 */
import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/home'
  },
  {
    path: '/home',
    component: () => import('@/views/Home.vue'),
    redirect: '/home/register',
    children: [
    
      {
        path: 'serial',
        component: () => import('@/views/serial/Serial.vue')
      },
      {
        path: 'log',
        component: () => import('@/views/log/Log.vue')
      },
      {
        path: 'register',
        component: () => import('@/views/register/Register.vue')
      },
      {
        path: 'ble',
        component: () => import('@/views/ble/Ble.vue')
      },
      {
        path: 'iq/capture',
        children: [
          {
            path: '',
            redirect: '/home/iq/capture/realtime'
          },
          {
            path: 'realtime',
            component: () => import('@/views/IqCapture/Realtime.vue')
          },
          {
            path: 'file',
            component: () => import('@/views/IqCapture/File.vue')
          }
        ]
      },
      {
        path: 'iq/analyze',
        children: [
          {
            path: '',
            redirect: '/home/iq/analyze/spectrum'
          },
          {
            path: 'spectrum',
            component: () => import('@/views/IqAnalyze/Spectrum.vue')
          },
          {
            path: 'constellation',
            component: () => import('@/views/IqAnalyze/Constellation.vue')
          }
        ]
      },
      {
        path: 'data/analyze',
        component: () => import('@/views/dataAnalyze/DataAnalyze.vue')
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(), // 使用HTML5 History模式
  routes
})

export default router