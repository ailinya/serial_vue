/*
 * @Author: nll
 * @Date: 2025-10-09 14:27:24
 * @LastEditors: '艾琳爱' '2664840261@qq.com'
 * @LastEditTime: 2025-10-11 15:26:27
 * @Description: 
 */
/*
 * @Description: 寄存器相关 API 封装
 */
import { get, post, del } from '@/http'

// 类型定义
export interface RegisterReadReq {
  address: string // 十六进制地址，如 0x2047C00
}

export interface RegisterReadResp {
  access_type: string    // "READ"
  address: string       // 寄存器地址，如 "0x20470C04"
  message: string       // 操作消息，如 "寄存器读取成功,读取4字节"
  success: boolean      // 操作是否成功
  timestamp: string     // 时间戳，如 "2025-10-10T16:56:16.634822"
  value: string         // 十六进制数据，如 "0x20470004"
}

export interface RegisterWriteReq {
  address: string
  value: string
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

// 串口断开接口
export interface SerialDisconnectResp {
  status: number        // 200表示成功
  message: string      // 断开结果消息
}

export function apiDisconnectSerial() {
  return post<SerialDisconnectResp>('/register/disconnect', {})
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
export interface BatchReadReq {
  addresses: string[]
  size: number
}

export interface BatchReadResp {
  success: boolean
  message: string
  total_operations: number
  successful_operations: number
  failed_operations: number
  results: Array<{
    address: string
    value: string
    success: boolean
    message?: string
    timestamp?: string
  }>
  timestamp: string
}

export function apiBatchRead(payload: BatchReadReq) {
  return post<BatchReadResp>('/register/batch-read', payload)
}

// 批量写入
export interface BatchWriteReq {
  operations: Array<{
    address: string
    value: string
  }>
}

export interface BatchWriteResp {
  success: boolean
  message: string
  total_operations: number
  successful_operations: number
  failed_operations: number
  results: Array<{
    address: string
    value: string
    success: boolean
    message?: string
    timestamp?: string
  }>
  timestamp: string
}

export function apiBatchWrite(payload: BatchWriteReq) {
  return post<BatchWriteResp>('/register/batch-write', payload)
}

// 列表查询（可选）
export interface RegisterListResp {
  success: boolean
  message: string
  data: {
    items: Array<{
      id: number
      address: string
      data: string
      value32bit: string
      description: string
      created_at: string
      updated_at: string
    }>
  }
  total: number
}

export function apiListRegisters() {
  return get<RegisterListResp>('/register/saved/list')
}

// 导入（保存一组寄存器配置到后端，可选）
export function apiImportRegisters(items: RegisterItem[]) {
  return post<{ success: boolean }>('/register/import', { items })
}

// 导出（从后端获取一组寄存器配置，可选）
export function apiExportRegisters() {
  return get<RegisterItem[]>('/register/export')
}

// 保存寄存器
export interface SaveRegisterReq {
  address: string
  data: string
  value32bit: string
  description: string
}

export interface SaveRegisterResp {
  success: boolean
  message: string
}

export function apiSaveRegister(payload: SaveRegisterReq) {
  return post<SaveRegisterResp>('/register/saved/save', payload)
}

// 删除寄存器
export interface DeleteRegisterResp {
  success: boolean
  message: string
}

export function apiDeleteRegister(registerId: number) {
  return del<DeleteRegisterResp>(`/register/saved/${registerId}`)
}

// 批量删除寄存器
export interface BatchDeleteReq {
  register_ids: number[]
}

export interface BatchDeleteResp {
  success: boolean
  message: string
  deleted_count: number
}

export function apiBatchDeleteRegisters(payload: BatchDeleteReq) {
  return post<BatchDeleteResp>('/register/saved/batch-delete', payload)
}

// 发送串口命令
export interface SendCommandReq {
  command: string
}

export interface SendCommandResp {
  success: boolean
  message: string
}

export function apiSendCommand(payload: SendCommandReq) {
  return post<SendCommandResp>('/register/send-command', payload)
}

// 上传Excel文件
export interface ExcelUploadResp {
  success: boolean
  message: string
  data: Array<{
    name: string
    rows: Array<{
      address: string
      data: string
      description: string
    }>
  }>
  debug?: string[]
}

export function apiUploadExcelAsBase64(base64Content: string) {
  return post<ExcelUploadResp>('/register/upload-excel', {
    file_content: base64Content
  })
}
