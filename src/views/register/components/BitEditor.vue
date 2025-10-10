<!--
 * @Author: nll
 * @Date: 2025-09-28 18:00:00
 * @LastEditors: nll
 * @LastEditTime: 2025-09-29 14:53:39
 * @Description: 32位位编辑器组件
-->
<template>
  <div class="bit-editor">
    <!-- 32位位编辑器 - 紧凑型布局 -->
    <div class="flex gap-1 items-center justify-center py-1">
      <!-- 32位，每8位一组，从高位到低位 -->
      <div v-for="(byteGroup, byteIndex) in byteGroups" :key="byteIndex" class="flex flex-col gap-1">
        <!-- 每一位的序号标注 -->
        <div class="flex gap-[10px]">
          <div 
            v-for="(bitIndex) in 8" 
            :key="bitIndex"
            class="w-4 text-center text-[12px] text-gray-500 font-mono"
          >
            {{ getActualBitIndex(byteIndex, bitIndex) }}
          </div>
        </div>
        
        <!-- 位值按钮组 -->
        <div class="flex gap-[10px]">
          <button
            v-for="(bitIndex) in 8" 
            :key="bitIndex"
            type="button"
            :class="getBitButtonClass(byteIndex, bitIndex)"
            @click="toggleBit(byteIndex, bitIndex)"
            :title="`Bit ${getActualBitIndex(byteIndex, bitIndex)}: ${getBitValue(byteIndex, bitIndex) ? '1' : '0'} (点击切换)`"
          >
            {{ getBitValue(byteIndex, bitIndex) ? '1' : '0' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

// Props
interface Props {
  value: string
}

const props = defineProps<Props>()

// Emits
const emit = defineEmits<{
  'update:value': [value: string]
}>()

// 计算属性
const numValue = computed(() => {
  return parseInt(props.value.replace('0x', ''), 16) || 0
})

const byteGroups = computed(() => {
  return Array.from({ length: 4 }, (_, index) => index)
})

// 方法
const getActualBitIndex = (byteIndex: number, bitIndex: number) => {
  return (3 - byteIndex) * 8 + (8 - bitIndex)
}

const getBitValue = (byteIndex: number, bitIndex: number) => {
  const actualBitIndex = getActualBitIndex(byteIndex, bitIndex)
  return (numValue.value & (1 << actualBitIndex)) !== 0
}

const getBitButtonClass = (byteIndex: number, bitIndex: number) => {
  const isSet = getBitValue(byteIndex, bitIndex)
  const baseClass = 'w-4 h-4 text-[10px] font-mono font-bold cursor-pointer transition-all duration-150 hover:scale-105 active:scale-95 flex items-center justify-center leading-none'
  
  if (isSet) {
    return `${baseClass} bg-blue-500 text-white shadow-sm border border-blue-600`
  } else {
    return `${baseClass} bg-gray-200 hover:bg-gray-300 text-gray-600 hover:text-gray-800 border border-gray-300`
  }
}

const toggleBit = (byteIndex: number, bitIndex: number) => {
  const actualBitIndex = getActualBitIndex(byteIndex, bitIndex)
  const newValue = numValue.value ^ (1 << actualBitIndex)
  const hexValue = `0x${(newValue >>> 0).toString(16).toUpperCase().padStart(8, '0')}`
  emit('update:value', hexValue)
}
</script>

<style scoped lang="scss">
.bit-editor {
  min-width: 200px;
  
  button {
    border-radius: 2px;
    
    &:first-child {
      border-top-left-radius: 4px;
      border-bottom-left-radius: 4px;
    }
    
    &:last-child {
      border-top-right-radius: 4px;
      border-bottom-right-radius: 4px;
    }
  }
}
</style>
