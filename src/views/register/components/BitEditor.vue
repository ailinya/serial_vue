<!--
 * @Author: nll
 * @Date: 2025-09-28 18:00:00
 * @LastEditors: '艾琳爱' '2664840261@qq.com'
 * @LastEditTime: 2025-10-14 10:41:03
 * @Description: 32位位编辑器组件
-->
<template>
  <div class="bit-editor">
    <!-- 32位位编辑器 - 4位一组布局 -->
    <div class="flex gap-6 items-center justify-center">
      <!-- 32位，每4位一组，从高位到低位 -->
      <div v-for="(_, groupIndex) in bitGroups" :key="groupIndex" class="flex flex-col gap-[2px]">
        <!-- 每一位的序号标注 -->
        <div class="flex gap-[10px]">
          <div 
            v-for="(bitIndex) in 4" 
            :key="bitIndex"
            class="w-4 text-center text-[16px] text-gray-500 font-mono"
          >
            {{ getActualBitIndex(groupIndex, bitIndex) }}
          </div>
        </div>
        
        <!-- 位值按钮组 -->
        <div class="flex gap-[5px]">
          <button
            v-for="(bitIndex) in 4" 
            :key="bitIndex"
            type="button"
            :class="getBitButtonClass(groupIndex, bitIndex)"
            @click="toggleBit(groupIndex, bitIndex)"
            :title="`Bit ${getActualBitIndex(groupIndex, bitIndex)}: ${getBitValue(groupIndex, bitIndex) ? '1' : '0'} (点击切换)`"
          >
            {{ getBitValue(groupIndex, bitIndex) ? '1' : '0' }}
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
  if (!props.value) return 0
  const cleanValue = props.value.replace('0x', '').replace('0X', '')
  return parseInt(cleanValue, 16) || 0
})

const bitGroups = computed(() => {
  return Array.from({ length: 8 }, (_, index) => index)
})

// 方法
const getActualBitIndex = (groupIndex: number, bitIndex: number) => {
  return (7 - groupIndex) * 4 + (4 - bitIndex)
}

const getBitValue = (groupIndex: number, bitIndex: number) => {
  const actualBitIndex = getActualBitIndex(groupIndex, bitIndex)
  return (numValue.value & (1 << actualBitIndex)) !== 0
}

const getBitButtonClass = (groupIndex: number, bitIndex: number) => {
  const isSet = getBitValue(groupIndex, bitIndex)
  const baseClass = 'w-5 h-5 text-[16px] font-mono font-bold cursor-pointer transition-all duration-150 hover:scale-105 active:scale-95 flex items-center justify-center leading-none'
  
  if (isSet) {
    return `${baseClass} bg-blue-500 text-white shadow-sm border border-blue-600`
  } else {
    return `${baseClass} bg-gray-200 hover:bg-gray-300 text-gray-600 hover:text-gray-800 border border-gray-300`
  }
}

const toggleBit = (groupIndex: number, bitIndex: number) => {
  const actualBitIndex = getActualBitIndex(groupIndex, bitIndex)
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
