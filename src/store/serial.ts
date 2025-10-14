/*
 * @Author: nll
 * @Date: 2025-09-28 18:00:00
 * @LastEditors: '艾琳爱' '2664840261@qq.com'
 * @LastEditTime: 2025-10-13 13:16:17
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
  let reconnectTimer: number | null = null
  const isMonitoring = ref(false)
  
  // 串口状态监控
  const portStatus = ref<'connected' | 'disconnected' | 'unknown'>('unknown')
  const lastKnownPorts = ref<string[]>([])

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
    console.log('🚀 开始连接 WebSocket...');
    
    try {
      // 先尝试通过Vite代理连接
      const wsUrl = '/ws/serial-ports'
      console.log('📍 WebSocket URL (通过代理):', wsUrl)
      console.log('🌐 当前页面URL:', window.location.href)
      
      ws = new WebSocket(wsUrl)
      
      // 设置连接超时，如果代理失败则尝试直接连接
      const proxyTimeout = setTimeout(() => {
        if (ws && ws.readyState === WebSocket.CONNECTING) {
          console.log('⚠️ 代理连接超时，尝试直接连接后端...')
          ws.close()
          tryDirectConnection()
        }
      }, 5000)
      
      // 立即检查连接状态
      console.log('📊 WebSocket创建后状态:', ws.readyState)
      console.log('📋 状态说明: 0=CONNECTING, 1=OPEN, 2=CLOSING, 3=CLOSED')
      
      // 添加连接状态监听
      ws.onopen = () => {
        clearTimeout(proxyTimeout)
        console.log('✅ 串口监听 WebSocket 已连接')
        console.log('📊 WebSocket readyState:', ws?.readyState)
        console.log('🔗 WebSocket URL:', ws?.url)
        console.log('📤 发送获取串口列表请求...')
        // 请求当前可用串口列表
        ws?.send(JSON.stringify({ type: 'get_ports' }))
      }

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          if (data.type === 'ports_update') {
            // 检查串口状态变化
            checkPortStatus(data.ports)
            
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
            } else {
              selectedPort.value = ''
            }
            
            console.log('串口列表已更新:', data.ports)
            console.log('下拉框选项已更新:', newOptions)
          }
        } catch (e) {
          console.error('解析 WebSocket 消息失败:', e)
        }
      }

      ws.onclose = (event) => {
        console.log('❌ 串口监听 WebSocket 已断开')
        console.log('🔢 关闭代码:', event.code)
        console.log('📝 关闭原因:', event.reason)
        console.log('🧹 是否正常关闭:', event.wasClean)
        console.log('📊 当前状态:', ws?.readyState)
        ws = null
        // 自动重连
        if (isMonitoring.value) {
          console.log('⏰ 3秒后尝试重连...')
          reconnectTimer = setTimeout(() => {
            connectWebSocket()
          }, 3000)
        }
      }

      ws.onerror = (error) => {
        console.error('💥 串口监听 WebSocket 错误:', error)
        console.error('📊 WebSocket 状态:', ws?.readyState)
        console.error('🔗 WebSocket URL:', ws?.url)
        console.error('📋 错误详情:', error)
        
        // 尝试直接连接后端（绕过代理）
        console.log('🔄 尝试直接连接后端WebSocket...')
        setTimeout(() => {
          tryDirectConnection()
        }, 2000)
      }
      
      // 添加连接过程监控
      const connectionMonitor = setInterval(() => {
        if (ws) {
          const state = ws.readyState
          console.log(`🔄 连接状态监控: ${state} (${getStateName(state)})`)
          
          if (state === WebSocket.OPEN) {
            console.log('✅ 连接成功，停止监控')
            clearInterval(connectionMonitor)
          } else if (state === WebSocket.CLOSED) {
            console.log('❌ 连接已关闭，停止监控')
            clearInterval(connectionMonitor)
          }
        } else {
          console.log('⚠️ WebSocket对象不存在')
          clearInterval(connectionMonitor)
        }
      }, 500)
      
      // 10秒后停止监控
      setTimeout(() => {
        clearInterval(connectionMonitor)
        console.log('⏹️ 连接监控已停止')
      }, 10000)
      
    } catch (error) {
      console.error('💥 创建 WebSocket 连接失败:', error)
    }
  }

  // 获取WebSocket状态名称
  const getStateName = (state: number) => {
    switch (state) {
      case WebSocket.CONNECTING: return 'CONNECTING'
      case WebSocket.OPEN: return 'OPEN'
      case WebSocket.CLOSING: return 'CLOSING'
      case WebSocket.CLOSED: return 'CLOSED'
      default: return 'UNKNOWN'
    }
  }

  // 检查串口状态变化
  const checkPortStatus = (currentPorts: string[]) => {
    console.log('🔍 检查串口状态变化...')
    console.log('📋 当前串口列表:', currentPorts)
    console.log('📋 之前串口列表:', lastKnownPorts.value)
    console.log('📋 当前选中串口:', selectedPort.value)
    
    const previousPorts = lastKnownPorts.value
    const currentSelectedPort = selectedPort.value
    
    // 检查当前选中的串口是否还存在
    if (currentSelectedPort && !currentPorts.includes(currentSelectedPort)) {
      portStatus.value = 'disconnected'
      console.warn(`串口 ${currentSelectedPort} 已断开或不存在`)
      
      // 如果当前选中的串口不存在，清空选择
      selectedPort.value = ''
      
      // 触发自定义事件，让组件监听并显示message
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('serial-port-disconnected', {
          detail: { port: currentSelectedPort }
        }))
      }
    }
    
    // 检查是否有新串口插入
    const newPorts = currentPorts.filter(port => !previousPorts.includes(port))
    if (newPorts.length > 0) {
      console.log(`检测到新串口: ${newPorts.join(', ')}`)
      
      // 触发自定义事件，让组件监听并显示message
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('serial-port-added', {
          detail: { ports: newPorts }
        }))
      }
    }
    
    // 检查是否有串口被移除
    const removedPorts = previousPorts.filter(port => !currentPorts.includes(port))
    if (removedPorts.length > 0) {
      console.log(`串口已断开: ${removedPorts.join(', ')}`)
      
      // 触发自定义事件，让组件监听并显示message
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('serial-port-removed', {
          detail: { ports: removedPorts }
        }))
      }
    }
    
    // 更新状态
    if (currentPorts.length === 0) {
      portStatus.value = 'disconnected'
      console.log('未检测到任何串口设备')
      
      // 触发自定义事件，让组件监听并显示message
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('serial-no-ports', {
          detail: {}
        }))
      }
    } else {
      portStatus.value = 'connected'
      if (newPorts.length === 0 && removedPorts.length === 0) {
        console.log(`检测到 ${currentPorts.length} 个串口设备`)
        // 只在首次检测到串口时显示message
        if (previousPorts.length === 0) {
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('serial-ports-detected', {
              detail: { count: currentPorts.length }
            }))
          }
        }
      }
    }
    
    // 更新已知串口列表
    lastKnownPorts.value = currentPorts
  }

  // 直接连接后端WebSocket（绕过Vite代理）
  const tryDirectConnection = () => {
    console.log('🔄 尝试直接连接后端WebSocket...')
    
    try {
      // 直接连接后端，绕过Vite代理
      const directWsUrl = 'ws://localhost:9993/ws/serial-ports'
      console.log('📍 直接WebSocket URL:', directWsUrl)
      
      ws = new WebSocket(directWsUrl)
      
      ws.onopen = () => {
        console.log('✅ 直接连接后端WebSocket成功')
        console.log('📊 WebSocket readyState:', ws?.readyState)
        console.log('🔗 WebSocket URL:', ws?.url)
        console.log('📤 发送获取串口列表请求...')
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
              console.log('✅ 自动选择第一个串口:', data.ports[0])
            } else {
              selectedPort.value = ''
            }
            
            console.log('✅ 串口列表已更新:', data.ports)
          }
        } catch (e) {
          console.error('解析 WebSocket 消息失败:', e)
        }
      }

      ws.onclose = (event) => {
        console.log('❌ 直接连接WebSocket已断开')
        console.log('🔢 关闭代码:', event.code)
        console.log('📝 关闭原因:', event.reason)
        ws = null
        // 自动重连
        if (isMonitoring.value) {
          console.log('⏰ 3秒后尝试重连...')
          reconnectTimer = setTimeout(() => {
            connectWebSocket()
          }, 3000)
        }
      }

      ws.onerror = (error) => {
        console.error('💥 直接连接WebSocket错误:', error)
        console.error('📊 WebSocket 状态:', ws?.readyState)
        console.error('🔗 WebSocket URL:', ws?.url)
        console.log('💡 建议: 检查后端WebSocket服务是否正在运行')
      }
      
    } catch (error) {
      console.error('💥 创建直接WebSocket连接失败:', error)
    }
  }



  const updatePort = (port: string) => {
    selectedPort.value = port
  }

  const updateBaudRate = (baudRate: string) => {
    selectedBaudRate.value = baudRate
    settings.baudRate = baudRate
  }

  // 检查WebSocket连接状态
  const checkWebSocketStatus = () => {
    if (ws) {
      console.log('WebSocket 状态:', ws.readyState)
      console.log('WebSocket URL:', ws.url)
      switch (ws.readyState) {
        case WebSocket.CONNECTING:
          console.log('WebSocket 状态: 连接中...')
          break
        case WebSocket.OPEN:
          console.log('WebSocket 状态: 已连接')
          break
        case WebSocket.CLOSING:
          console.log('WebSocket 状态: 关闭中...')
          break
        case WebSocket.CLOSED:
          console.log('WebSocket 状态: 已关闭')
          break
        default:
          console.log('WebSocket 状态: 未知')
      }
    } else {
      console.log('WebSocket 未初始化')
    }
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
    
    // 串口状态监控
    portStatus,
    
    // 方法
    updatePort,
    updateBaudRate,
    startPortMonitoring,
    stopPortMonitoring,
    checkWebSocketStatus
  }
})
