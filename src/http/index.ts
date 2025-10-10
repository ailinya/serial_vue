/*
 * @Author: nll
 * @Date: 2025-10-09 14:17:22
 * @LastEditors: nll
 * @LastEditTime: 2025-10-09 14:47:29
 * @Description: 
 */
/*
/*
 * @Description: Axios 公共请求封装
 */
import axios, { AxiosHeaders } from 'axios'
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'

// 基础配置：与 Vite 代理匹配，统一走 /api
const BASE_URL = '/api'
const TIMEOUT = 15000

// 创建实例
const http: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: TIMEOUT
})

// 请求拦截器
http.interceptors.request.use((config) => {
  // 统一设置 JSON 头
  if (!config.headers) config.headers = new AxiosHeaders()
  const headers = config.headers as AxiosHeaders
  const method = (config.method || 'get').toLowerCase()
  if (!headers.has('Content-Type') && method !== 'get') {
    headers.set('Content-Type', 'application/json')
  }
  // 可在此注入 Token
  // const token = localStorage.getItem('token')
  // if (token) headers.set('Authorization', `Bearer ${token}`)
  return config
})

// 响应拦截器
http.interceptors.response.use(
  (response: AxiosResponse) => {
    return response.data
  },
  (error) => {
    // 统一错误处理；直接抛出保持调用方灵活性
    return Promise.reject(error)
  }
)

// 通用请求
export function request<T = any>(config: AxiosRequestConfig): Promise<T> {
  return http.request<any, T>(config)
}

// 便捷方法
export function get<T = any>(url: string, params?: any, config?: AxiosRequestConfig): Promise<T> {
  return http.get<any, T>(url, { params, ...(config || {}) })
}

export function post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
  return http.post<any, T>(url, data, config)
}

export function put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
  return http.put<any, T>(url, data, config)
}

export function del<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
  return http.delete<any, T>(url, config)
}

// 文件上传（multipart/form-data）
export function upload<T = any>(url: string, formData: FormData, config?: AxiosRequestConfig): Promise<T> {
  const headers = { 'Content-Type': 'multipart/form-data', ...(config?.headers || {}) }
  return http.post<any, T>(url, formData, { ...(config || {}), headers })
}

// 文件下载（blob）
export function download(url: string, params?: any, filename?: string): Promise<void> {
  return http
    .get<Blob>(url, { params, responseType: 'blob' })
    .then((blob: any) => {
      const data = blob instanceof Blob ? blob : new Blob([blob])
      const link = document.createElement('a')
      const href = window.URL.createObjectURL(data)
      link.href = href
      link.download = filename || 'download'
      document.body.appendChild(link)
      link.click()
      link.remove()
      URL.revokeObjectURL(href)
    })
}

// 导出实例以便必要时自定义
export { http }
