/*
 * @Author: nll
 * @Date: 2025-09-28 18:00:00
 * @LastEditors: '艾琳爱' '2664840261@qq.com'
 * @LastEditTime: 2025-10-10 14:08:57
 * @Description: 串口状态管理
 */
import { defineStore } from 'pinia'
import { ref, reactive } from 'vue'

export const useSerialStore = defineStore('serial', () => {
  // 串口连接状态
  const isConnected = ref(false)
  const isConnecting = ref(false)
  const selectedPort = ref('')
  const selectedBaudRate = ref('115200')

  // 串口设置
  const settings = reactive({
    baudRate: '115200',
    dataBits: '8',
    stopBits: '1',
    parity: 'none',
    readTimeout: 1000,
    writeTimeout: 1000,
    dtrControl: false,
    rtsControl: true
  })

  // 串口选项
  const portOptions = ref([
   
  ])

  const baudRateOptions = [
    { label: '1200', value: '1200' },
    { label: '2400', value: '2400' },
    { label: '4800', value: '4800' },
    { label: '9600', value: '9600' },
    { label: '19200', value: '19200' },
    { label: '38400', value: '38400' },
    { label: '57600', value: '57600' },
    { label: '115200', value: '115200' }
  ]

  // WebSocket 连接状态
  let ws: WebSocket | null = null
  let reconnectTimer: NodeJS.Timeout | null = null
  const isMonitoring = ref(false)

  // 启动串口监听
  const startPortMonitoring = () => {
    if (isMonitoring.value) return
    
    isMonitoring.value = true
    connectWebSocket()
  }

  // 停止串口监听
  const stopPortMonitoring = () => {
    isMonitoring.value = false
    if (ws) {
      ws.close()
      ws = null
    }
    if (reconnectTimer) {
      clearTimeout(reconnectTimer)
      reconnectTimer = null
    }
  }

  // 连接 WebSocket
  const connectWebSocket = () => {
    try {
      // 使用相对路径，会被 Vite 代理处理
      ws = new WebSocket('ws://localhost:9993/ws/serial-ports')
      
      ws.onopen = () => {
        console.log('串口监听 WebSocket 已连接')
        // 请求当前可用串口列表
        ws?.send(JSON.stringify({ type: 'get_ports' }))
      }

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          if (data.type === 'ports_update') {
            // 更新串口列表
            const newOptions = data.ports.map((port: string) => ({
              label: port,
              value: port
            }))
            portOptions.value = newOptions
            
            // 自动选择第一个串口
            if (data.ports.length > 0) {
              selectedPort.value = data.ports[0]
              console.log('自动选择第一个串口:', data.ports[0])
            }

            else{
              selectedPort.value =''
            }
            
            console.log('串口列表已更新:', data.ports)
            console.log('下拉框选项已更新:', newOptions)
          }
        } catch (e) {
          console.error('解析 WebSocket 消息失败:', e)
        }
      }

      ws.onclose = () => {
        console.log('串口监听 WebSocket 已断开')
        ws = null
        // 自动重连
        if (isMonitoring.value) {
          reconnectTimer = setTimeout(() => {
            connectWebSocket()
          }, 3000)
        }
      }

      ws.onerror = (error) => {
        console.error('串口监听 WebSocket 错误:', error)
      }
    } catch (error) {
      console.error('创建 WebSocket 连接失败:', error)
    }
  }



  const updatePort = (port: string) => {
    selectedPort.value = port
  }

  const updateBaudRate = (baudRate: string) => {
    selectedBaudRate.value = baudRate
    settings.baudRate = baudRate
  }

  return {
    // 状态
    isConnected,
    isConnecting,
    selectedPort,
    selectedBaudRate,
    settings,
    portOptions,
    baudRateOptions,
    isMonitoring,
    
    // 方法

    updatePort,
    updateBaudRate,
    startPortMonitoring,
    stopPortMonitoring
  }
})
