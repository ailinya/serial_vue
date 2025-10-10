<!--
 * @Author: nll
 * @Date: 2025-09-26 16:27:34
 * @LastEditors: nll
 * @LastEditTime: 2025-09-29 14:29:43
 * @Description: 
-->
<template> 
  <n-config-provider>
    <n-menu
      class="side-menu w-40"
      :options="menuOptions"
      :value="activeKey"
      :collapsed="collapsed"
      :root-indent="16"
      :indent="40"
      @update:value="handleSelect"
    />
  </n-config-provider>
</template>
<script setup lang="ts">
import { h, ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { NMenu, NConfigProvider, type MenuOption } from 'naive-ui'

const collapsed = ref(false)

const route = useRoute()
const router = useRouter()

const menuOptions = ref<MenuOption[]>([
  { label: '串口设置', key: '/home/serial', icon: () => h('span', { class: 'text-lg' }, '🔧') },
  { label: '日志发送', key: '/home/log', icon: () => h('span', { class: 'text-lg' }, '📄') },
  { label: '寄存器读写', key: '/home/register', icon: () => h('span', { class: 'text-lg' }, '⚙️') },
  { label: 'BLE测试', key: '/home/ble', icon: () => h('span', { class: 'text-lg' }, '📶') },
  {
    label: 'IQ数据采集',
    key: '/home/iq/capture',
    icon: () => h('span', { class: 'text-lg' }, '⚡'),
    children: [
      { label: '实时采集', key: '/home/iq/capture/realtime' },
      { label: '文件采集', key: '/home/iq/capture/file' }
    ]
  },
  {
    label: 'IQ分析',
    key: '/home/iq/analyze',
    icon: () => h('span', { class: 'text-lg' }, '📊'),
    children: [
      { label: '频谱', key: '/home/iq/analyze/spectrum' },
      { label: '星座', key: '/home/iq/analyze/constellation' }
    ]
  },
  { label: '数据分析', key: '/home/data/analyze', icon: () => h('span', { class: 'text-lg' }, '📈') }
])

const activeKey = computed(() => route.path)

function handleSelect(key: string) {
  if (key && key !== route.path) {
    router.push(key)
  }
}
</script>
<style scoped lang="scss">
:deep(.side-menu) {
  .n-menu-item-content {
    &.n-menu-item-content--selected {
      color: #1890ff !important;
      background-color: rgba(24, 144, 255, 0.1) !important;
    }
    
    &:hover {
      color: #1890ff !important;
      background-color: rgba(24, 144, 255, 0.05) !important;
    }
  }
}
</style>