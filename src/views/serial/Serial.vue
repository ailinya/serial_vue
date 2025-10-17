<!--
 * @Author: nll
 * @Date: 2025-09-27 21:40:00
 * @LastEditors: nll
 * @LastEditTime: 2025-09-28 17:45:50
 * @Description: 串口设置页面
-->
<template>
  <div class="serial-container p-2">


    <!-- 串口控制区域 -->
    <div class="serial-control mb-6">
      <h3 class="text-lg font-semibold mb-4">串口连接</h3>
      <div class="flex items-center gap-4">
        <n-select v-model:value="serialStore.selectedPort" :options="serialStore.portOptions" placeholder="选择串口" style="width: 200px;" @update:value="serialStore.updatePort" />
        <n-select v-model:value="serialStore.selectedBaudRate" :options="serialStore.baudRateOptions" placeholder="选择波特率"
          @update:value="serialStore.updateBaudRate" style="width: 200px;" />
        <n-button type="primary" :loading="serialStore.isConnecting" @click="serialStore.toggleConnection" class="flex items-center gap-2">
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
        <n-button type="primary" @click="saveConnection" class="flex items-center gap-2">
          <template #icon>
            <n-icon>
              <span>💾</span>
            </n-icon>
          </template>
          保存配置
        </n-button>

      </div>
    </div>
    <div class="test-area w-full">

      <h3 class="text-lg font-semibold mb-4">测试区域</h3>
      <div class="test-area-content flex w-full gap-4">
        <div class="test-area-content-left flex flex-1 flex-col">
          <label class="text-sm font-medium mb-2">发送内容</label>
          <div class="flex items-center gap-2">
            <n-input placeholder="请输入发送内容" type="textarea" :rows="5" class="flex-1" />
            <n-button type="primary">发送</n-button>
          </div>
        </div>

        <div class="test-area-content-right flex flex-1 flex-col">
          <label class="text-sm font-medium mb-2">接受内容</label>
          <n-input type="textarea" :rows="5" placeholder="接受内容" class="w-full" />
        </div>
      </div>
    </div>
    <!-- 串口设置区域 -->
    <div class="serial-settings">
      <h3 class="text-lg font-semibold mb-4">串口设置</h3>
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- 基本设置 -->
        <div class="basic-settings">
          <h4 class="text-md font-medium mb-4">基本设置</h4>
          <div class="space-y-4">
            <!-- 波特率 -->
            <div>
              <label class="block text-sm font-medium mb-2">波特率 (bps)</label>
              <n-select v-model:value="settings.baudRate" :options="serialStore.baudRateOptions" placeholder="选择波特率"
                @update:value="serialStore.updateBaudRate" />
              <p class="text-xs text-gray-500 mt-1">
                选择常用波特率或点击'自定义'输入特殊值
              </p>
            </div>

            <!-- 数据位 -->
            <div>
              <label class="block text-sm font-medium mb-2">数据位</label>
              <n-select v-model:value="settings.dataBits" :options="dataBitsOptions" placeholder="选择数据位" />
            </div>

            <!-- 停止位 -->
            <div>
              <label class="block text-sm font-medium mb-2">停止位</label>
              <n-select v-model:value="settings.stopBits" :options="stopBitsOptions" placeholder="选择停止位" />
            </div>

            <!-- 校验位 -->
            <div>
              <label class="block text-sm font-medium mb-2">校验位</label>
              <n-select v-model:value="settings.parity" :options="parityOptions" placeholder="选择校验位" />
            </div>
          </div>
        </div>

        <!-- 高级设置 -->
        <div class="advanced-settings">
          <h4 class="text-md font-medium mb-4">高级设置</h4>
          <div class="space-y-4">
            <!-- 读取超时 -->
            <div>
              <label class="block text-sm font-medium mb-2">读取超时 (ms)</label>
              <n-input-number v-model:value="settings.readTimeout" :min="100" :max="10000" :step="100"
                placeholder="读取超时" class="w-full" />
            </div>

            <!-- 写入超时 -->
            <div>
              <label class="block text-sm font-medium mb-2">写入超时 (ms)</label>
              <n-input-number v-model:value="settings.writeTimeout" :min="100" :max="10000" :step="100"
                placeholder="写入超时" class="w-full" />
            </div>

            <!-- 流控制 -->
            <div>
              <h5 class="text-sm font-medium mb-3">流控制</h5>
              <div class="space-y-3">
                <!-- DTR控制 -->
                <div class="flex items-center justify-between">
                  <label class="text-sm">DTR控制</label>
                  <n-switch v-model:value="settings.dtrControl" @update:value="handleDtrChange" />
                </div>

                <!-- RTS控制 -->
                <div class="flex items-center justify-between">
                  <label class="text-sm">RTS控制</label>
                  <n-switch v-model:value="settings.rtsControl" @update:value="handleRtsChange" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
 
    
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import { NSelect, NButton, NTag, NInputNumber, NSwitch, NIcon } from 'naive-ui'
import { useSerialStore } from '@/store/serial'

// 使用串口状态管理
const serialStore = useSerialStore()


// 串口设置
const settings = reactive({
  baudRate: '2400',
  dataBits: '8',
  stopBits: '1',
  parity: 'none',
  readTimeout: 1000,
  writeTimeout: 1000,
  dtrControl: false,
  rtsControl: true
})

const dataBitsOptions = [
  { label: '5 位', value: '5' },
  { label: '6 位', value: '6' },
  { label: '7 位', value: '7' },
  { label: '8 位', value: '8' }
]

const stopBitsOptions = [
  { label: '1 位', value: '1' },
  { label: '1.5 位', value: '1.5' },
  { label: '2 位', value: '2' }
]

const parityOptions = [
  { label: '无', value: 'none' },
  { label: '奇校验', value: 'odd' },
  { label: '偶校验', value: 'even' },
  { label: '标记', value: 'mark' },
  { label: '空格', value: 'space' }
]

// 方法
const saveConnection = () => {
  console.log('保存配置')
}

const handleDtrChange = (value: boolean) => {
  console.log('DTR控制:', value)
}

const handleRtsChange = (value: boolean) => {
  console.log('RTS控制:', value)
}

</script>

<style scoped lang="scss">
// .serial-container {
//   height: 100%;
//   overflow-y: auto;
//   background: white;
// }

// .serial-control {
//   background: #f8f9fa;
//   padding: 1rem;
//   border-radius: 8px;
//   border: 1px solid #e9ecef;
// }

// .serial-settings {
//   background: white;
//   padding: 1rem;
//   border-radius: 8px;
//   border: 1px solid #e9ecef;
// }

// .basic-settings,
// .advanced-settings {
//   background: #f8f9fa;
//   padding: 1rem;
//   border-radius: 6px;
//   border: 1px solid #e9ecef;
// }

// 连接状态区域样式
.connection-status {
  .status-card {
    transition: all 0.3s ease;
    border: 1px solid #e5e7eb;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }
  }
}
</style>

<style lang="scss">
/* 专门为串口页面设置 Naive UI 组件样式 */
</style>
