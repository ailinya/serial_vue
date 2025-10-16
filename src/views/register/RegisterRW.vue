<template>
  <div class="flex flex-col h-full">
    <!-- 粘性工具栏 -->
    <div class="sticky top-0 z-20 bg-background/95 backdrop-blur-sm border-b border-border/50 pb-4 mb-4">
      <div class="border-2 border-primary/20 shadow-lg p-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-4">
            <h3 class="text-lg font-semibold text-foreground">寄存器读写表</h3>
          </div>
          <div class="flex items-center gap-2">
            <button @click="addRow" class="px-4 py-2 bg-primary text-primary-foreground rounded-md">添加行</button>
          </div>
        </div>
      </div>
    </div>

    <!-- 表格区域 -->
    <div class="flex-1 overflow-hidden">
      <div class="h-full">
        <!-- 表头 -->
        <div class="grid gap-2 px-4 py-2 bg-muted/60 border-b border-border sticky top-0 z-10" style="grid-template-columns: 80px 120px 1fr 180px 80px">
          <div class="text-xs font-medium text-muted-foreground text-center">地址</div>
          <div class="text-xs font-medium text-muted-foreground text-center">数据</div>
          <div class="text-xs font-medium text-muted-foreground text-center">32bit</div>
          <div class="text-xs font-medium text-muted-foreground text-center">说明</div>
          <div class="text-xs font-medium text-muted-foreground text-center">操作</div>
        </div>

        <!-- 表格内容 -->
        <div class="h-full overflow-auto">
          <div v-if="isLoading" class="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <p>正在加载寄存器定义...</p>
          </div>
          <div v-else-if="registerRows.length === 0" class="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <p>暂无寄存器配置</p>
          </div>
          <div v-else>
            <div v-for="(row, index) in registerRows" :key="row.id" class="grid gap-2 px-4 py-2 items-center border-b border-border/30" style="grid-template-columns: 80px 120px 1fr 180px 80px">
              <!-- 地址输入 -->
              <input type="text" v-model="row.address" class="h-7 text-sm w-full text-center font-mono bg-background border rounded-md" />
              <!-- 数据输入 -->
              <input type="text" v-model="row.data" @input="syncData(row.id, ($event.target as HTMLInputElement).value)" class="h-7 text-sm w-full text-center font-mono bg-background border rounded-md" />
              <!-- 32位编辑器 -->
              <BitEditor :value="row.value32bit" :bitfields="row.bitfields" @update:value="newValue => syncData(row.id, newValue)" />
              <!-- 说明输入 -->
              <input type="text" v-model="row.description" class="h-7 text-sm w-full bg-background border rounded-md" />
              <!-- 操作按钮 -->
              <button @click="deleteRow(row.id)" class="h-7 w-full bg-red-500 text-white rounded-md">删除</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import BitEditor from './components/BitEditor.vue';
import { apiGetRegisterDefinitions } from '@/api/register_api';

interface Bitfield {
  name: string;
  range: [number, number];
  type: 'RO' | 'RW' | 'Reserved';
}

interface RegisterRow {
  id: string;
  address: string;
  data: string;
  value32bit: string;
  description: string;
  bitfields?: Bitfield[];
}

const registerRows = ref<RegisterRow[]>([]);
const isLoading = ref(true);

onMounted(async () => {
  try {
    const response = await apiGetRegisterDefinitions();
    const definitions = response.data;
    const newRows: RegisterRow[] = [];

    const bleSystemRegisters = definitions['BLE_System'];
    if (bleSystemRegisters) {
      for (const regName in bleSystemRegisters) {
        const regData = bleSystemRegisters[regName];
        const bitfields = regData.bit_fields.map((bf: any) => ({
          name: bf.name,
          range: [bf.start_bit, bf.end_bit],
          type: bf.type
        }));

        newRows.push({
          id: regData.offset,
          address: regData.offset,
          data: regData.init_value,
          value32bit: regData.init_value,
          description: regName,
          bitfields: bitfields
        });
      }
    }
    
    registerRows.value = newRows;

  } catch (error) {
    console.error("Failed to fetch register definitions:", error);
  } finally {
    isLoading.value = false;
  }
});

const addRow = () => {
  registerRows.value.push({
    id: Date.now().toString(),
    address: '0x00000000',
    data: '0x00000000',
    value32bit: '0x00000000',
    description: '',
  });
};

const deleteRow = (id: string) => {
  const index = registerRows.value.findIndex(row => row.id === id);
  if (index !== -1) {
    registerRows.value.splice(index, 1);
  }
};

const syncData = (id: string, value: string) => {
  const row = registerRows.value.find(row => row.id === id);
  if (row) {
    const normalizedValue = value.toUpperCase();
    row.data = normalizedValue;
    row.value32bit = normalizedValue;
  }
};
</script>
