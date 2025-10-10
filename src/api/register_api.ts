/*
 * @Author: nll
 * @Date: 2025-10-09 14:27:24
 * @LastEditors: '艾琳爱' '2664840261@qq.com'
 * @LastEditTime: 2025-10-10 14:23:15
 * @Description: 
 */
/*
 * @Description: 寄存器相关 API 封装
 */
import { get, post } from '@/http'

// 类型定义
export interface RegisterReadReq {
  address: string // 十六进制地址，如 0x2047C00
}

export interface RegisterReadResp {
  address: string
  data: string // 十六进制数据，如 0xFFFFFFFF
}

export interface RegisterWriteReq {
  address: string
  data: string
}

export interface RegisterWriteResp {
  success: boolean
}

export interface RegisterItem {
  address: string
  data: string
  description?: string
}


// 测试接口
export function apiTesrt() {
  return get('/register/test')
}
// 获取串口列表
export function apiGetPortList() {
  return get('/serial/ports')
}

// 串口连接接口
export interface SerialConnectReq {
  com_num: string  // 串口号，如 "COM1"
  baud: number     // 波特率，如 115200
}

export interface SerialConnectResp {
  status: number        // 200表示成功
  message: string      // 连接结果消息
  port: string         // 连接的串口号
  baudrate: number     // 连接的波特率
}

export function apiConnectSerial(payload: SerialConnectReq) {
  return post<SerialConnectResp>('/register/connect', payload)
}
// 单次读取寄存器
export function apiReadRegister(payload: RegisterReadReq) {
  return post<RegisterReadResp>('/register/read', payload)
}

// 单次写入寄存器
export function apiWriteRegister(payload: RegisterWriteReq) {
  return post<RegisterWriteResp>('/register/write', payload)
}

// 批量读取
export function apiBulkRead(addresses: string[]) {
  return post<RegisterReadResp[]>('/register/bulk-read', { addresses })
}

// 批量写入
export function apiBulkWrite(items: RegisterItem[]) {
  return post<RegisterWriteResp>('/register/bulk-write', { items })
}

// 列表查询（可选）
export function apiListRegisters() {
  return get<RegisterItem[]>('/register/list')
}

// 导入（保存一组寄存器配置到后端，可选）
export function apiImportRegisters(items: RegisterItem[]) {
  return post<{ success: boolean }>('/register/import', { items })
}

// 导出（从后端获取一组寄存器配置，可选）
export function apiExportRegisters() {
  return get<RegisterItem[]>('/register/export')
}
