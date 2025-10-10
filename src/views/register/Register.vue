<!--
 * @Author: nll
 * @Date: 2025-09-27 21:40:00
 * @LastEditors: '艾琳爱' '2664840261@qq.com'
 * @LastEditTime: 2025-10-10 14:26:24
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
              <div v-if="customBaudSet.size > 0" class="mt-2 flex flex-wrap gap-2">
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
      <div v-if="!serialStore.isConnected" class="mt-2 p-1 bg-yellow-50 border border-yellow-200 rounded-md">
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
          <div class="text-center">32bit</div>
          <div class="text-center">说明</div>
          <div class="text-center">操作</div>
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
            <div class="flex items-center justify-center cursor-move select-none" title="拖动以排序">
              <span class="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                {{ index + 1 }}
              </span>
            </div>

            <!-- 地址 -->
            <div class="flex items-center">
              <n-input 
                v-model:value="row.address" 
                placeholder="0x00000000"
                class="text-center font-mono text-sm"
                @update:value="updateRow(row.id, 'address', $event)"
              />
            </div>

            <!-- 数据 -->
            <div class="flex items-center">
              <n-input 
                v-model:value="row.data" 
                placeholder="0x00000000"
                class="text-center font-mono text-sm"
                @update:value="updateRowData(row.id, $event)"
              />
            </div>

            <!-- 32位位编辑器 -->
            <div class="flex items-center justify-center">
              <BitEditor 
                :value="row.value32bit" 
                @update:value="updateRowData(row.id, $event)"
              />
            </div>

            <!-- 说明 -->
            <div class="flex items-center">
              <n-input 
                v-model:value="row.description" 
                placeholder="寄存器说明"
                class="text-sm"
                @update:value="updateRow(row.id, 'description', $event)"
              />
            </div>

            <!-- 操作合并 -->
            <div class="flex items-center justify-center gap-1">
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
                @click="duplicateRow(row)"
                title="复制"
              >
                <template #icon>
                  <n-icon>
                    <span>📋</span>
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

import { apiGetPortList, apiConnectSerial } from '@/api/register_api'
// 使用串口状态管理
const serialStore = useSerialStore()
const message = useMessage()
const toggleConnection = async () => {
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
  id: string
  address: string
  data: string
  value32bit: string
  description: string
}

// 寄存器行数据
const registerRows = ref<RegisterRow[]>([
  {
    id: '1',
    address: '0x2047C00',
    data: '0XFDB25233',
    value32bit: '0XFDB25233',
    description: 'GPIO配置寄存器'
  }
])

// 选择状态
const selectedIds = ref<Set<string>>(new Set())
const selectedCount = computed(() => selectedIds.value.size)
const isAllSelected = computed(() => registerRows.value.length > 0 && selectedIds.value.size === registerRows.value.length)
const isIndeterminate = computed(() => selectedIds.value.size > 0 && selectedIds.value.size < registerRows.value.length)

const getPortList = async () => {
  console.log('获取串口列表');
  const res = await apiGetPortList()
  console.log(res)
}

onMounted(() => {
  getPortList()
})


const isRowSelected = (id: string) => selectedIds.value.has(id)
const toggleSelectAll = (checked: boolean) => {
  if (checked) {
    const all = new Set(registerRows.value.map(r => r.id))
    selectedIds.value = all
  } else {
    selectedIds.value = new Set()
  }
}
const toggleRow = (id: string, checked: boolean) => {
  const next = new Set(selectedIds.value)
  if (checked) next.add(id)
  else next.delete(id)
  selectedIds.value = next
}

// 批量操作
const bulkRead = () => {
  if (selectedIds.value.size === 0) return
  if (!serialStore.isConnected) {
    message.error('串口未连接')
    return
  }
  registerRows.value.forEach(row => {
    if (selectedIds.value.has(row.id)) {
      readRegister(row)
    }
  })
}

const bulkWrite = () => {
  if (selectedIds.value.size === 0) return
  if (!serialStore.isConnected) {
    message.error('串口未连接')
    return
  }
  registerRows.value.forEach(row => {
    if (selectedIds.value.has(row.id)) {
      writeRegister(row)
    }
  })
}

const deleteSelected = () => {
  if (selectedIds.value.size === 0) return
  const toDelete = new Set(selectedIds.value)
  registerRows.value = registerRows.value.filter(row => !toDelete.has(row.id))
  selectedIds.value = new Set()
  message.success('已删除选中项')
}

// 更新行数据
const updateRow = (id: string, field: keyof RegisterRow, value: string) => {
  const row = registerRows.value.find(r => r.id === id)
  if (row) {
    row[field] = value
  }
}

// 更新行数据（同步 data 和 value32bit）
const updateRowData = (id: string, value: string) => {
  const row = registerRows.value.find(r => r.id === id)
  if (row) {
    const normalizedValue = value.toUpperCase()
    row.data = normalizedValue
    row.value32bit = normalizedValue
  }
}

// 添加行
const addRow = () => {
  const newRow: RegisterRow = {
    id: Date.now().toString(),
    address: '0x00000000',
    data: '0x00000000',
    value32bit: '0x00000000',
    description: ''
  }
  registerRows.value.push(newRow)
  message.success('已添加新行')
}

// 删除行
const deleteRow = (id: string) => {
  const index = registerRows.value.findIndex(r => r.id === id)
  if (index > -1) {
    registerRows.value.splice(index, 1)
    selectedIds.value.delete(id)
    message.success('已删除行')
  }
}

// 复制行
const duplicateRow = (row: RegisterRow) => {
  const newRow: RegisterRow = {
    id: Date.now().toString(),
    address: row.address,
    data: row.data,
    value32bit: row.value32bit,
    description: row.description + ' (副本)'
  }
  registerRows.value.push(newRow)
  message.success('已复制行')
}

// 读取寄存器
const readRegister = (row: RegisterRow) => {
  if (!serialStore.isConnected) {
    message.error('串口未连接')
    return
  }
  console.log(`读取寄存器: ${row.address}`)
  message.success(`读取寄存器 ${row.address}`)
}

// 写入寄存器
const writeRegister = (row: RegisterRow) => {
  if (!serialStore.isConnected) {
    message.error('串口未连接')
    return
  }
  console.log(`写入寄存器: ${row.address} = ${row.data}`)
  message.success(`写入寄存器 ${row.address}`)
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

// 生命周期钩子：自动启动串口监听
onMounted(() => {
  // 启动串口监听
  serialStore.startPortMonitoring()
  console.log('串口监听已启动')
})

onUnmounted(() => {
  // 停止串口监听
  serialStore.stopPortMonitoring()
  console.log('串口监听已停止')
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

.table-content {
}

.table-header-row,
.table-row {
  display: grid;
  grid-template-columns: 16px 36px 110px 110px  1fr 300px  160px;
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
    grid-template-columns: 14px 32px 100px 100px  1fr 260px 140px;
  }
}

@media (max-width: 768px) {
  .table-header-row,
  .table-row {
    grid-template-columns: 12px 28px 88px 88px 1fr 220px 110px;
    gap: 6px;
    padding: 6px 8px;
  }
}
</style>
