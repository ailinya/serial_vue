<!--
 * @Author: nll
 * @Date: 2025-09-28 18:00:00
 * @LastEditors: '艾琳爱' '2664840261@qq.com'
 * @LastEditTime: 2025-10-14 11:12:06
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
      
      <!-- 全部设置按钮 - 上下排列 -->
      <div class="flex flex-col gap-1 ml-2">
        <button
          @click="setAllTo0"
          @touchstart="setAllTo0"
          class="px-2 py-1 bg-gray-500 text-white text-xs rounded hover:bg-gray-600 active:bg-gray-700 active:scale-95 transition-all duration-150 w-8 h-6 flex items-center justify-center cursor-pointer select-none"
          title="全0"
        >
          <div class="flex flex-row items-center gap-0.5">
            <span>全</span>
            <span>0</span>
          </div>
        </button>
        <button
          @click="setAllTo1"
          @touchstart="setAllTo1"
          class="px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-500 active:bg-blue-500 active:scale-95 transition-all duration-150 w-8 h-6 flex items-center justify-center cursor-pointer select-none"
          title="全1"
        >
          <div class="flex flex-row items-center gap-0.5">
            <span>全</span>
            <span>1</span>
          </div>
        </button>
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

// 全部设置方法
const setAllTo0 = () => {
  const hexValue = '0x00000000'
  emit('update:value', hexValue)
}

const setAllTo1 = () => {
  const hexValue = '0xFFFFFFFF'
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
  
  .writing-mode-horizontal {
    writing-mode: horizontal-tb;
    text-orientation: mixed;
  }
  
  .flex-row {
    display: flex;
    flex-direction: row;
    align-items: center;
  }
  
  // 手势点击反馈
  button {
    -webkit-tap-highlight-color: transparent;
    -webkit-touch-callout: none;
    -webkit-user-select: none;
    -khtml-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
    
    &:active {
      transform: scale(0.95);
    }
  }
}
</style>
