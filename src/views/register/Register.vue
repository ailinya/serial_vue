<!--
 * @Author: nll
 * @Date: 2025-09-27 21:40:00
 * @LastEditors: '艾琳爱' '2664840261@qq.com'
 * @LastEditTime: 2025-10-14 10:46:46
 * @Description: 寄存器读写页面
-->
<template>
  <div class="register-container p-2">
    <!-- 标题 -->
    <h1 class="text-xl font-bold mb-2 text-gray-800">寄存器读写</h1>

    <!-- 串口控制区域 -->
    <div class="serial-control mb-2 bg-white p-4 rounded-lg shadow-sm border">
      <h3 class="text-lg font-semibold mb-2 text-gray-700">串口控制</h3>
      <div class="flex items-center gap-4">
        <n-select 
          v-model:value="serialStore.selectedPort" 
          :options="serialStore.portOptions" 
          placeholder="选择串口" 
          style="width: 200px;" 
          @update:value="serialStore.updatePort"
        />
        <n-select 
          v-model:value="serialStore.selectedBaudRate" 
          :options="serialStore.baudRateOptions" 
          placeholder="选择波特率"
          style="width: 220px;" 
          filterable
          @update:value="serialStore.updateBaudRate"
        >
          <template #action>
            <div class="p-2 border-t border-gray-100">
              <div class="flex items-center gap-2">
                <n-input-number 
                  v-model:value="customBaud"
                  size="small"
                  placeholder="自定义波特率"
                  :min="50"
                  :max="3000000"
                  :step="50"
                  style="width: 150px;"
                />
                <n-button size="tiny" type="primary" @click="applyCustomBaud">确定</n-button>
              </div>
              <div v-if="customBaudSet.size > 0" class="mt-4 flex flex-wrap gap-2">
                <n-tag v-for="val in Array.from(customBaudSet)" :key="val" size="small" type="default" closable @close="() => removeCustomBaud(val)">
                  {{ val }} bps
                </n-tag>
              </div>
            </div>
          </template>
        </n-select>
        <n-button 
          type="primary" 
        
          @click="toggleConnection" 
          class="flex items-center gap-2"
        >
          <template #icon>
            <n-icon>
              <span v-if="!serialStore.isConnected">▶️</span>
              <span v-else>⏹️</span>
            </n-icon>
          </template>
          {{ serialStore.isConnected ? '断开' : '连接' }}
        </n-button>
        <n-tag :type="serialStore.isConnected ? 'success' : 'default'" class="ml-2">
          {{ serialStore.isConnected ? '已连接' : '未连接' }}
        </n-tag>
      </div>
      
      <!-- 串口未连接提示 -->
      <div v-if="!serialStore.isConnected" class="mt-4 p-1 bg-yellow-50 border border-yellow-200 rounded-md">
        <div class="flex items-center">
          <span class="text-yellow-600 mr-2">①</span>
          <span class="text-yellow-800 text-sm">
            串口未连接。请在顶部工具栏连接串口后再进行寄存器操作。
          </span>
        </div>
      </div>
      
   
      
    </div>

    <!-- 寄存器读写表 -->
    <div class="register-table bg-white rounded-lg shadow-sm border">
      <!-- 表头工具栏 -->
      <div class="table-header p-4 border-b border-gray-200">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <h3 class="text-lg font-semibold text-gray-700">• 寄存器读写表</h3>
            <n-tag v-if="selectedCount > 0" size="small" type="info">已选择 {{ selectedCount }} 行</n-tag>
          </div>
          <div class="flex items-center gap-2">
            <!-- 当有选中项时显示批量操作按钮 -->
            <template v-if="selectedCount > 0">
              <n-button tertiary type="info" size="small" @click="bulkRead" class="flex items-center gap-1">
                <template #icon>
                  <n-icon><span>👁️</span></n-icon>
                </template>
                批量读取
              </n-button>
              <n-button tertiary type="success" size="small" @click="bulkWrite" class="flex items-center gap-1">
                <template #icon>
                  <n-icon><span>🚀</span></n-icon>
                </template>
                批量写入
              </n-button>
              <n-button tertiary type="error" size="small" @click="deleteSelected" class="flex items-center gap-1">
                <template #icon>
                  <n-icon><span>➖</span></n-icon>
                </template>
                删除选中
              </n-button>
            </template>
            <n-button type="info" size="small" @click="importConfig" class="flex items-center gap-1">
              <template #icon>
                <n-icon>
                  <span>📥</span>
                </n-icon>
              </template>
              导入配置
            </n-button>
            <n-button type="info" size="small" @click="exportConfig" class="flex items-center gap-1">
              <template #icon>
                <n-icon>
                  <span>📤</span>
                </n-icon>
              </template>
              导出配置
            </n-button>
            <n-button type="primary" size="small" @click="addRow" class="flex items-center gap-1">
              <template #icon>
                <n-icon>
                  <span>+</span>
                </n-icon>
              </template>
              添加行
            </n-button>
          </div>
        </div>
      </div>

      <!-- 表格内容 -->
      <div class="table-content">
        <!-- 表头 -->
        <div class="table-header-row gap-4 px-4 py-3 bg-gray-50 border-b border-gray-200 text-sm font-medium text-gray-600">
          <div class="flex items-center justify-center">
            <n-checkbox :checked="isAllSelected" :indeterminate="isIndeterminate" @update:checked="toggleSelectAll" />
          </div>
          <div class="text-center">序号</div>
          <div class="text-center">地址</div>
          <div class="text-center">数据</div>
          <div class="text-center">操作</div>
          <div class="text-center">32bit</div>
          <div class="text-center">说明</div>
       
        </div>

        <!-- 表格行 -->
        <div v-if="registerRows.length === 0" class="text-center py-12 text-gray-500">
          <div class="text-4xl mb-4">🔧</div>
          <p>暂无寄存器配置</p>
          <p class="text-sm">点击"添加行"按钮开始配置寄存器</p>
        </div>

        <div v-else>
          <div 
            v-for="(row, index) in registerRows" 
            :key="row.id"
            class="table-row gap-4 px-4 py-3 border-b border-gray-100 hover:bg-gray-50 transition-colors"
            :class="{ 'row-selected': isRowSelected(row.id) }"
            draggable="true"
            @dragstart="onDragStart(index)"
            @dragover.prevent
            @drop="onDrop(index)"
          >
            <!-- 选择 -->
            <div class="flex items-center justify-center">
              <n-checkbox :checked="isRowSelected(row.id)" @update:checked="(val) => toggleRow(row.id, val as boolean)" />
            </div>

            <!-- 序号（拖拽句柄） -->
            <div class="flex items-center justify-center cursor-move select-none" title="拖动以排序"  mt-4>
              <span class="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                {{ index + 1 }}
              </span>
            </div>

            <!-- 地址 -->
            <div class="flex items-center mt-4">
              <n-input 
                v-model:value="row.address" 
                placeholder="0x00000000"
                class="text-center font-mono text-sm"
                @update:value="updateRow(row.id, 'address', $event)"
              />
            </div>

            <!-- 数据 -->
            <div class="flex items-center mt-4">
              <n-input 
                v-model:value="row.data" 
                placeholder="0x00000000"
                class="text-center font-mono text-sm"
                @update:value="updateRowData(row.id, $event)"
              />
            </div>
       <!-- 操作合并 -->
       <div class="flex items-center justify-center gap-4 mt-4">
              <n-button 
                size="tiny" 
                type="info" 
                @click="readRegister(row)"
                :disabled="!serialStore.isConnected"
                title="读取"
              >
                <template #icon>
                  <n-icon>
                    <span>👁️</span>
                  </n-icon>
                </template>
              </n-button>
              <n-button 
                size="tiny" 
                type="success" 
                @click="writeRegister(row)"
                :disabled="!serialStore.isConnected"
                title="写入"
              >
                <template #icon>
                  <n-icon>
                    <span>✏️</span>
                  </n-icon>
                </template>
              </n-button>
              <n-button 
                size="tiny" 
                type="warning" 
                @click="saveRegister(row)"
                title="保存"
              >
                <template #icon>
                  <n-icon>
                    <span>💾</span>
                  </n-icon>
                </template>
              </n-button>
              <n-button 
                size="tiny" 
                type="error" 
                @click="deleteRow(row.id)"
                title="删除"
              >
                <template #icon>
                  <n-icon>
                    <span>🗑️</span>
                  </n-icon>
                </template>
              </n-button>
            </div>
            <!-- 32位位编辑器 -->
            <div class="flex items-center justify-center">
              <BitEditor 
                :value="row.value32bit || '0x00000000'" 
                @update:value="updateRowData(row.id, $event)"
              />
            </div>

            <!-- 说明 -->
            <div class="flex items-center mt-4">
              <n-input 
                v-model:value="row.description" 
                placeholder="寄存器说明"
                class="text-sm"
                @update:value="updateRow(row.id, 'description', $event)"
              />
            </div>

           
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { NSelect, NButton, NTag, NInput, NIcon, NCheckbox, NInputNumber, useMessage } from 'naive-ui'
import { useSerialStore } from '@/store/serial'
import BitEditor from './components/BitEditor.vue'

import { apiGetPortList, apiConnectSerial, apiDisconnectSerial, apiReadRegister, apiWriteRegister, apiBatchRead, apiBatchWrite, apiSaveRegister, apiListRegisters, apiDeleteRegister, apiBatchDeleteRegisters } from '@/api/register_api'
// 使用串口状态管理
const serialStore = useSerialStore()
const message = useMessage()
const toggleConnection = async () => {
  // 如果已连接，执行断开操作
  if (serialStore.isConnected) {
    try {
      const res = await apiDisconnectSerial()
      console.log('断开连接:', res)
      if (res.status === 200) {
        serialStore.isConnected = false
        message.success(res.message)
      } else {
        message.error(res.message)
      }
    } catch (error) {
      serialStore.isConnected = false
      message.error('断开连接失败')
      console.error('断开错误:', error)
    }
    return
  }

  // 如果未连接，执行连接操作
  console.log('测试连接');

  // 检查串口号是否存在
  if (!serialStore.selectedPort) {
    message.error('请打开设备并选择串口')
    return
  }

  let data = {
    com_num: serialStore.selectedPort,
    baud: Number(serialStore.selectedBaudRate)
  }

  try {
    const res = await apiConnectSerial(data)
    console.log(res)
    if (res.status === 200) {
      serialStore.isConnected = true
      message.success(res.message)
    } else {
      serialStore.isConnected = false
      message.error(res.message)
    }
  } catch (error) {
    serialStore.isConnected = false
    message.error('连接失败，请检查串口是否可用')
    console.error('连接错误:', error)
  }
}
// 拖拽排序
const draggingIndex = ref<number | null>(null)
const onDragStart = (index: number) => {
  draggingIndex.value = index
}
const onDrop = (targetIndex: number) => {
  if (draggingIndex.value === null || draggingIndex.value === targetIndex) return
  const list = [...registerRows.value]
  const [moved] = list.splice(draggingIndex.value, 1)
  list.splice(targetIndex, 0, moved)
  registerRows.value = list
  draggingIndex.value = null
}

// 自定义波特率
const customBaud = ref<number | null>(null)
const customBaudSet = ref<Set<string>>(new Set())
const applyCustomBaud = () => {
  if (customBaud.value === null || customBaud.value === undefined) return
  const valStr = String(customBaud.value)
  const exists = (serialStore.baudRateOptions as any[]).some((o: any) => String(o.value) === valStr)
  if (!exists) {
    (serialStore.baudRateOptions as any[]).push({ label: `${valStr} bps`, value: valStr })
    const next = new Set(customBaudSet.value); next.add(valStr); customBaudSet.value = next
  }
  serialStore.updateBaudRate(valStr)
  customBaud.value = null
}
const removeCustomBaud = (valStr: string) => {
  // 从选项中移除
  const arr = (serialStore.baudRateOptions as any[])
  const idx = arr.findIndex((o: any) => String(o.value) === valStr)
  if (idx > -1) arr.splice(idx, 1)
  // 从集合中移除
  const next = new Set(customBaudSet.value); next.delete(valStr); customBaudSet.value = next
  // 若当前选中正好被删除，清空选中
  if (String(serialStore.selectedBaudRate) === valStr) {
    serialStore.updateBaudRate('')
  }
}

// 寄存器行数据类型
interface RegisterRow {
  id: number
  address: string
  data: string
  value32bit: string
  description: string
}

// 寄存器行数据
const registerRows = ref<RegisterRow[]>([])

// 选择状态
const selectedIds = ref<Set<number>>(new Set())
const selectedCount = computed(() => selectedIds.value.size)
const isAllSelected = computed(() => registerRows.value.length > 0 && selectedIds.value.size === registerRows.value.length)
const isIndeterminate = computed(() => selectedIds.value.size > 0 && selectedIds.value.size < registerRows.value.length)

const getPortList = async () => {
  console.log('获取串口列表');
  const res = await apiGetPortList()
  console.log(res)
}

const getRegisterList = async () => {
  try {
    console.log('获取寄存器列表');
    const res = await apiListRegisters()
    console.log('寄存器列表:', res)
    
    if (res.success) {
      if (res.data.items.length > 0) {
        // 将获取到的寄存器列表转换为表格行数据
        const registerRowsData = res.data.items.map((item, index) => ({
          id: item.id || (Date.now() + index),
          address: item.address,
          data: item.data || '0x00000000',
          value32bit: item.value32bit || item.data || '0x00000000',
          description: item.description || ''
        }))
        
        registerRows.value = registerRowsData
        message.success(`已加载 ${registerRowsData.length} 个寄存器配置`)
      } else {
        // 清空表格数据
        registerRows.value = []
        message.info('暂无已保存的寄存器配置')
      }
    } else {
      message.error(`加载失败: ${res.message}`)
    }
  } catch (error) {
    console.error('获取寄存器列表失败:', error)
    message.error('加载寄存器列表失败')
  }
}

onMounted(() => {
  getPortList()
  getRegisterList()
})


const isRowSelected = (id: number) => selectedIds.value.has(id)
const toggleSelectAll = (checked: boolean) => {
  if (checked) {
    const all = new Set(registerRows.value.map(r => r.id))
    selectedIds.value = all
  } else {
    selectedIds.value = new Set()
  }
}
const toggleRow = (id: number, checked: boolean) => {
  const next = new Set(selectedIds.value)
  if (checked) next.add(id)
  else next.delete(id)
  selectedIds.value = next
}

// 批量操作
const bulkRead = async () => {
  if (selectedIds.value.size === 0) return
  if (!serialStore.isConnected) {
    message.error('串口未连接')
    return
  }
  
  try {
    const selectedRows = registerRows.value.filter(row => selectedIds.value.has(row.id))
    const addresses = selectedRows.map(row => row.address)
    
    const res = await apiBatchRead({
      addresses: addresses,
      size: 4
    })
    
    console.log('批量读取结果:', res)
    
    if (res.success) {
      // 更新选中行的数据
      res.results.forEach(result => {
        const row = registerRows.value.find(r => r.address === result.address)
        if (row && result.success) {
          row.data = result.value
          row.value32bit = result.value
        }
      })
      
      message.success(`批量读取成功，共处理 ${res.results.length} 个寄存器`)
    } else {
      message.error(`批量读取失败: ${res.message}`)
    }
  } catch (error) {
    console.error('批量读取失败:', error)
    message.error('批量读取失败')
  }
}

const bulkWrite = async () => {
  if (selectedIds.value.size === 0) return
  if (!serialStore.isConnected) {
    message.error('串口未连接')
    return
  }
  
  try {
    const selectedRows = registerRows.value.filter(row => selectedIds.value.has(row.id))
    const operations = selectedRows.map(row => ({
      address: row.address,
      value: row.data
    }))
    
    const res = await apiBatchWrite({
      operations: operations
    })
    
    console.log('批量写入结果:', res)
    
    if (res.success) {
      message.success(`批量写入成功，共处理 ${res.results.length} 个寄存器`)
    } else {
      message.error(`批量写入失败: ${res.message}`)
    }
  } catch (error) {
    console.error('批量写入失败:', error)
    message.error('批量写入失败')
  }
}

const deleteSelected = async () => {
  if (selectedIds.value.size === 0) return
  
  try {
    const registerIds = Array.from(selectedIds.value)
    const res = await apiBatchDeleteRegisters({
      register_ids: registerIds
    })
    
    console.log('批量删除结果:', res)
    
    if (res.success) {
      message.success(`批量删除成功，共删除 ${res.deleted_count} 个寄存器`)
      // 重新加载寄存器列表
      await getRegisterList()
    } else {
      message.error(`批量删除失败: ${res.message}`)
    }
  } catch (error: any) {
    console.error('批量删除失败:', error)
    
    // 处理详细错误信息
    if (error.response?.data?.detail) {
      const detail = error.response.data.detail
      message.error(`${detail.message} (错误代码: ${detail.error})`)
    } else if (error.response?.data?.message) {
      message.error(`批量删除失败: ${error.response.data.message}`)
    } else {
      message.error('批量删除失败')
    }
  }
}

// 更新行数据
const updateRow = (id: number, field: keyof RegisterRow, value: string) => {
  const row = registerRows.value.find(r => r.id === id)
  if (row) {
    // 如果是地址字段，确保使用小写的 0x 前缀
    if (field === 'address' && value) {
      let normalizedValue = value
      if (normalizedValue.startsWith('0X')) {
        normalizedValue = normalizedValue.replace('0X', '0x')
      }
      // 将十六进制数字部分转换为大写，但保持 0x 前缀为小写
      if (normalizedValue.startsWith('0x')) {
        const hexPart = normalizedValue.substring(2).toUpperCase()
        normalizedValue = `0x${hexPart}`
      }
      row.address = normalizedValue
    } else {
      (row as any)[field] = value
    }
  }
}

// 更新行数据（同步 data 和 value32bit）
const updateRowData = (id: number, value: string) => {
  const row = registerRows.value.find(r => r.id === id)
  if (row && value) {
    // 确保使用小写的 0x 前缀
    let normalizedValue = value
    if (normalizedValue.startsWith('0X')) {
      normalizedValue = normalizedValue.replace('0X', '0x')
    }
    // 将十六进制数字部分转换为大写，但保持 0x 前缀为小写
    if (normalizedValue.startsWith('0x')) {
      const hexPart = normalizedValue.substring(2).toUpperCase()
      normalizedValue = `0x${hexPart}`
    }
    row.data = normalizedValue
    row.value32bit = normalizedValue
  }
}

// 添加行
const addRow = () => {
  const newRow: RegisterRow = {
    id: Date.now(),
    address: '0x00000000',
    data: '0x00000000',
    value32bit: '0x00000000',
    description: ''
  }
  
  // 使用展开运算符创建新数组，确保响应式更新
  registerRows.value = [...registerRows.value, newRow]
  console.log('添加新行:', newRow)
  console.log('当前行数:', registerRows.value.length)
  // message.success('已添加新行')
}

// 删除行
const deleteRow = async (id: number) => {
  try {
    const res = await apiDeleteRegister(id)
    console.log('删除寄存器结果:', res)
    
    if (res.success) {
      message.success(`寄存器 ${id} 删除成功`)
      // 重新加载寄存器列表
      await getRegisterList()
    } else {
      message.error(`删除失败: ${res.message}`)
    }
  } catch (error: any) {
    console.error('删除寄存器失败:', error)
    
    // 处理详细错误信息
    if (error.response?.data?.detail) {
      const detail = error.response.data.detail
      message.error(`${detail.message} (错误代码: ${detail.error})`)
    } else if (error.response?.data?.message) {
      message.error(`删除失败: ${error.response.data.message}`)
    } else {
      message.error(`删除寄存器 ${id} 失败`)
    }
  }
}

// 保存寄存器
const saveRegister = async (row: RegisterRow) => {
  try {
    const res = await apiSaveRegister({
      address: row.address,
      data: row.data,
      value32bit: row.value32bit,
      description: row.description
    })
    
    console.log('保存寄存器结果:', res)
    
    if (res.success) {
      message.success(`寄存器 ${row.address} 保存成功`)
    } else {
      message.error(`保存失败: ${res.message}`)
    }
  } catch (error: any) {
    console.error('保存寄存器失败:', error)
    
    // 处理详细错误信息
    if (error.response?.data?.detail) {
      const detail = error.response.data.detail
      message.error(`${detail.message} (错误代码: ${detail.error})`)
    } else if (error.response?.data?.message) {
      message.error(`保存失败: ${error.response.data.message}`)
    } else {
      message.error(`保存寄存器 ${row.address} 失败`)
    }
  }
}

// 读取寄存器
const readRegister = async (row: RegisterRow) => {
  if (!serialStore.isConnected) {
    message.error('串口未连接')
    return
  }
  
  try {
    console.log('🔍 开始读取寄存器:', {
      address: row.address,
      currentData: row.data,
      currentValue32bit: row.value32bit
    })
    
    const res = await apiReadRegister({ address: row.address })
    console.log('📊 读取寄存器API响应:', res)
    console.log('📊 响应类型:', typeof res)
    console.log('📊 响应值:', res.value)
    console.log('📊 响应值类型:', typeof res.value)
    console.log('📊 响应成功状态:', res.success)
    
    if (res.success && res.value !== null && res.value !== undefined) {
      // 更新行数据
      row.data = res.value
      row.value32bit = res.value
      
      console.log('✅ 更新后的行数据:', {
        address: row.address,
        data: row.data,
        value32bit: row.value32bit
      })
      
      message.success(`读取寄存器 ${row.address} 成功: ${res.value}`)
    } else {
      console.warn('⚠️ 读取失败或返回值为空:', {
        success: res.success,
        value: res.value,
        message: res.message
      })
      message.warning(`读取寄存器 ${row.address} 返回空值`)
    }
  } catch (error) {
    console.error('❌ 读取寄存器失败:', error)
    console.error('❌ 错误详情:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    })
    message.error(`读取寄存器 ${row.address} 失败`)
  }
}

// 写入寄存器
const writeRegister = async (row: RegisterRow) => {
  if (!serialStore.isConnected) {
    message.error('串口未连接')
    return
  }
  
  try {
    console.log('🔍 开始写入寄存器:', {
      address: row.address,
      value: row.data,
      valueType: typeof row.data
    })
    
    const res = await apiWriteRegister({ 
      address: row.address, 
      value: row.data 
    })
    
    console.log('📊 写入寄存器API响应:', res)
    console.log('📊 写入成功状态:', res.success)
    
    if (res.success) {
      message.success(`写入寄存器 ${row.address} 成功`)
      
      // 写入成功后，自动读取验证
      console.log('🔄 写入成功，开始验证读取...')
      setTimeout(async () => {
        try {
          const readRes = await apiReadRegister({ address: row.address })
          console.log('🔍 验证读取结果:', readRes)
          
          if (readRes.success && readRes.value) {
            console.log('✅ 验证成功，读取到的值:', readRes.value)
            message.success(`验证读取成功: ${readRes.value}`)
          } else {
            console.warn('⚠️ 验证读取失败或返回空值')
            message.warning('验证读取返回空值')
          }
        } catch (verifyError) {
          console.error('❌ 验证读取失败:', verifyError)
          message.error('验证读取失败')
        }
      }, 1000) // 延迟1秒后验证
    } else {
      message.error(`写入寄存器 ${row.address} 失败`)
    }
  } catch (error) {
    console.error('❌ 写入寄存器失败:', error)
    console.error('❌ 错误详情:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    })
    message.error(`写入寄存器 ${row.address} 失败`)
  }
}

// 导出配置
const exportConfig = () => {
  const config = registerRows.value.map(row => ({
    address: row.address,
    data: row.data,
    value32bit: row.value32bit,
    description: row.description
  }))
  
  const dataStr = JSON.stringify(config, null, 2)
  const dataBlob = new Blob([dataStr], { type: 'application/json' })
  const url = URL.createObjectURL(dataBlob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'register_config.json'
  link.click()
  URL.revokeObjectURL(url)
  message.success('配置已导出')
}

// 导入配置
const importConfig = () => {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = '.json'
  
  input.onchange = (e) => {
    const file = (e.target as HTMLInputElement).files?.[0]
    if (!file) return
    
    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const jsonData = JSON.parse(event.target?.result as string)
        
        if (!Array.isArray(jsonData)) {
          throw new Error('配置文件格式错误：应该是数组格式')
        }
        
        const validatedData = jsonData.map((item, index) => {
          if (typeof item !== 'object' || !item) {
            throw new Error(`配置项 ${index + 1} 格式错误`)
          }
          
          return {
            id: Date.now().toString() + index,
            address: item.address || '0x00000000',
            data: item.data || '0x00000000',
            value32bit: item.value32bit || '0x00000000',
            description: item.description || ''
          }
        })
        
        registerRows.value = validatedData
        message.success(`成功导入 ${validatedData.length} 条寄存器配置`)
        
      } catch (error) {
        console.error('导入配置失败:', error)
        message.error(`导入失败: ${error instanceof Error ? error.message : '配置文件格式错误'}`)
      }
    }
    
    reader.readAsText(file)
  }
  
  input.click()
}

// 测试串口状态提示
const testPortStatus = () => {
  console.log('🧪 测试串口状态提示...')
  console.log('📊 当前状态:', serialStore.portStatus)
  
  // 使用message显示测试提示
  message.warning('测试：串口 COM3 已断开或不存在')
  console.log('📊 显示测试消息')
}

// 串口状态事件监听器
const handleSerialPortDisconnected = (event: CustomEvent) => {
  message.warning(`串口 ${event.detail.port} 已断开或不存在`)
}

const handleSerialPortAdded = (event: CustomEvent) => {
  message.success(`检测到新串口: ${event.detail.ports.join(', ')}`)
}

const handleSerialPortRemoved = (event: CustomEvent) => {
  message.error(`串口已断开: ${event.detail.ports.join(', ')}`)
}

const handleSerialNoPorts = () => {
  message.error('未检测到任何串口设备')
}

const handleSerialPortsDetected = (event: CustomEvent) => {
  message.success(`检测到 ${event.detail.count} 个串口设备`)
}

// 生命周期钩子：自动启动串口监听
onMounted(() => {
  // 启动串口监听
  serialStore.startPortMonitoring()
  console.log('串口监听已启动')
  
  // 添加事件监听器
  window.addEventListener('serial-port-disconnected', handleSerialPortDisconnected as EventListener)
  window.addEventListener('serial-port-added', handleSerialPortAdded as EventListener)
  window.addEventListener('serial-port-removed', handleSerialPortRemoved as EventListener)
  window.addEventListener('serial-no-ports', handleSerialNoPorts as EventListener)
  window.addEventListener('serial-ports-detected', handleSerialPortsDetected as EventListener)
})

onUnmounted(() => {
  // 停止串口监听
  serialStore.stopPortMonitoring()
  console.log('串口监听已停止')
  
  // 移除事件监听器
  window.removeEventListener('serial-port-disconnected', handleSerialPortDisconnected as EventListener)
  window.removeEventListener('serial-port-added', handleSerialPortAdded as EventListener)
  window.removeEventListener('serial-port-removed', handleSerialPortRemoved as EventListener)
  window.removeEventListener('serial-no-ports', handleSerialNoPorts as EventListener)
  window.removeEventListener('serial-ports-detected', handleSerialPortsDetected as EventListener)
})
</script>

<style scoped lang="scss">
.register-container {
  height: 100%;
  overflow-y: auto;
  background-color: #f5f5f5;
}

.serial-control {
  border: 1px solid #e5e7eb;
}

.register-table {
  border: 1px solid #e5e7eb;
}


.table-header-row,
.table-row {
  display: grid;
  grid-template-columns: 16px 36px 100px 100px 150px 1fr 250px;
}

/* 悬浮与选中行高亮 */
.table-row:hover {
  background-color: #b1c6e2; /* tailwind: bg-blue-50 */
}
.row-selected {
  background-color: #a1b9db; /* tailwind: bg-blue-100 */
}

/* 缩小单元内边距与列间距 */
.table-header-row { padding: 8px 12px; gap: 8px; }
.table-row { padding: 6px 12px; gap: 8px; }

// 响应式设计
@media (max-width: 1200px) {
  .table-header-row,
  .table-row {
    grid-template-columns: 14px 32px 100px 100px 100px 260px 140px;
  }
}

@media (max-width: 768px) {
  .table-header-row,
  .table-row {
    grid-template-columns: 12px 28px 88px 88px 80px 220px 110px;
    gap: 6px;
    padding: 6px 8px;
  }
}
</style>
