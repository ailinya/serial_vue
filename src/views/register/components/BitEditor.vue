<!--
 * @Author: nll
 * @Date: 2025-09-28 18:00:00
 * @LastEditors: Cline
 * @LastEditTime: 2025-10-17 01:55:00
 * @Description: 32位位编辑器组件，支持逻辑位域分组和悬浮提示
-->
<template>
  <div class="bit-editor">
    <div class="flex items-start justify-center">
      <!-- 8个4位物理块的容器 -->
      <div 
        v-for="blockIndex in 8" 
        :key="blockIndex"
        class="flex items-center justify-center gap-1 p-1 bg-gray-100"
        :class="{ 'ml-2': blockIndex > 1 }"
      >
        <!-- 每个块内的4个位 -->
        <div
          v-for="bitInBlockIndex in 4"
          :key="bitInBlockIndex"
          class="flex flex-col items-center gap-1 p-1"
          :class="[bitColorMap.get(getBitIndex(blockIndex, bitInBlockIndex)) || 'bg-transparent']"
          :title="getBitTooltip(getBitIndex(blockIndex, bitInBlockIndex))"
        >
          <div class="w-5 text-center text-xs text-gray-500 font-mono">
            {{ getBitIndex(blockIndex, bitInBlockIndex) }}
          </div>
          <button
            type="button"
            :class="getBitButtonClass(getBitIndex(blockIndex, bitInBlockIndex))"
            @click="toggleBit(getBitIndex(blockIndex, bitInBlockIndex))"
            :disabled="isBitReadOnly(getBitIndex(blockIndex, bitInBlockIndex))"
          >
            {{ getBitValue(getBitIndex(blockIndex, bitInBlockIndex)) ? '1' : '0' }}
          </button>
        </div>
      </div>
      
      <!-- 全设置按钮 -->
      <div class="flex flex-col gap-1 ml-4">
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

// --- PROPS & EMITS ---
interface Bitfield {
  name: string;
  start_bit: number;
  end_bit: number;
  type: 'RO' | 'RW' | 'Reserved';
  description: string;
}

interface Props {
  value: string;
  bitfields?: Bitfield[];
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:value': [value: string]
}>()

// --- COMPUTED ---

const numValue = computed(() => {
  if (!props.value) return 0
  const cleanValue = props.value.replace('0x', '').replace('0X', '')
  return parseInt(cleanValue, 16) || 0
})

const fieldMap = computed(() => {
  const map = new Map<number, Bitfield>();
  if (props.bitfields && props.bitfields.length > 0) {
    props.bitfields.forEach(field => {
      for (let i = field.start_bit; i >= field.end_bit; i--) {
        map.set(i, field);
      }
    });
  }
  return map;
});

const bitColorMap = computed(() => {
  const map = new Map<number, string>();
  const colors = [
    'bg-teal-200',    // 蓝绿色
    'bg-amber-200',   // 琥珀色
    'bg-sky-200',     // 天蓝色
    'bg-rose-200',    // 玫瑰色
    'bg-lime-200',    // 酸橙色
    'bg-violet-200',  // 紫罗兰色
    'bg-fuchsia-200', // 紫红色
    'bg-cyan-200',    // 青色
  ];
  let colorIndex = 0;

  if (props.bitfields && props.bitfields.length > 0) {
    const sortedFields = [...props.bitfields].sort((a, b) => b.start_bit - a.start_bit);
    
    sortedFields.forEach(field => {
      const isReserved = field.name.toUpperCase().includes('RESERVED');
      const fieldColor = isReserved ? 'bg-gray-300' : colors[colorIndex % colors.length];
      
      for (let i = field.start_bit; i >= field.end_bit; i--) {
        if (fieldColor) {
          map.set(i, fieldColor);
        }
      }

      if (!isReserved) {
        colorIndex++;
      }
    });
  }
  return map;
});

// --- METHODS ---

const getBitIndex = (blockIndex: number, bitInBlockIndex: number): number => {
  // blockIndex from 1 to 8
  // bitInBlockIndex from 1 to 4
  return 31 - ((blockIndex - 1) * 4 + (bitInBlockIndex - 1));
}

const getBitTooltip = (bitIndex: number): string => {
  const field = fieldMap.value.get(bitIndex);
  return field
    ? `${field.name} [${field.start_bit}:${field.end_bit}] - ${field.description}`
    : `Bit ${bitIndex}`;
}

const getBitFieldInfo = (bitIndex: number): Bitfield | undefined => {
  if (!props.bitfields) return undefined;
  return props.bitfields.find(f => bitIndex >= f.end_bit && bitIndex <= f.start_bit);
};

const isBitReadOnly = (bitIndex: number): boolean => {
  const field = getBitFieldInfo(bitIndex);
  if (!field) return false;
  const isReadOnlyType = field.type === 'RO' || field.type === 'Reserved';
  const isReservedName = field.name.toUpperCase().includes('RESERVED');
  return isReadOnlyType || isReservedName;
};

const getBitValue = (bitIndex: number) => {
  return (numValue.value & (1 << bitIndex)) !== 0
}

const getBitButtonClass = (bitIndex: number) => {
  const isSet = getBitValue(bitIndex);
  const baseClass = 'w-5 h-5 text-[16px] font-mono font-bold transition-all duration-150 flex items-center justify-center leading-none';

  if (isBitReadOnly(bitIndex)) {
    return `${baseClass} bg-gray-400 text-white cursor-not-allowed`;
  }

  if (isSet) {
    return `${baseClass} bg-blue-500 text-white shadow-sm border border-blue-600 cursor-pointer hover:scale-105 active:scale-95`;
  } else {
    return `${baseClass} bg-gray-200 hover:bg-gray-300 text-gray-600 hover:text-gray-800 border border-gray-300 cursor-pointer`;
  }
}

const toggleBit = (bitIndex: number) => {
  if (isBitReadOnly(bitIndex)) return;
  const newValue = numValue.value ^ (1 << bitIndex)
  const hexValue = `0x${(newValue >>> 0).toString(16).toUpperCase().padStart(8, '0')}`
  emit('update:value', hexValue)
}

const setAllTo0 = () => {
  let newValue = numValue.value;
  for (let i = 0; i < 32; i++) {
    if (!isBitReadOnly(i)) {
      newValue &= ~(1 << i);
    }
  }
  const hexValue = `0x${(newValue >>> 0).toString(16).toUpperCase().padStart(8, '0')}`
  emit('update:value', hexValue)
}

const setAllTo1 = () => {
  let newValue = numValue.value;
  for (let i = 0; i < 32; i++) {
    if (!isBitReadOnly(i)) {
      newValue |= (1 << i);
    }
  }
  const hexValue = `0x${(newValue >>> 0).toString(16).toUpperCase().padStart(8, '0')}`
  emit('update:value', hexValue)
}
</script>

<style scoped lang="scss">
.bit-editor {
  min-width: 200px;

button {
    border-radius: 2px;
  }
  
  // 移动端触摸反馈
  button {
    -webkit-tap-highlight-color: transparent;
    -webkit-touch-callout: none;
    -webkit-user-select: none;
    user-select: none;
    
    &:active {
      transform: scale(0.95);
    }
  }
}
</style>
