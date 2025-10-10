<!--
 * @Author: nll
 * @Date: 2025-09-24 11:10:08
 * @LastEditors: nll
 * @LastEditTime: 2025-09-28 14:17:19
 * @Description: 
-->
<script setup lang="ts">
import { zhCN } from 'naive-ui'
import { customTheme } from '@/styles/theme'
</script>

<template>
<n-config-provider :theme-overrides="customTheme" :locale="zhCN" class="w-full h-full">
  <n-message-provider>
    <div class="app-contaner">
      <router-view></router-view>
    </div>
  </n-message-provider>
</n-config-provider>
</template>

<style scoped lang="scss">
.app-contaner{
  width: 100%;
  height: 100%;
  // background-color:rgba(5, 19, 78, 0.507)
}
</style>

<style lang="scss">
/* 全局样式 - 设置 Naive UI 组件为蓝色背景 */

/* 强制覆盖输入框和下拉框样式 */
.n-base-selection {
  background-color: #EBF4FF !important;
  border-color: #93C5FD !important;
}

.n-base-selection:hover {
  background-color: #DBEAFE !important;
  border-color: #60A5FA !important;
}

.n-base-selection--focused {
  background-color: #DBEAFE !important;
  border-color: #3B82F6 !important;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2) !important;
}

.n-input__input-el {
  background-color: #EBF4FF !important;
  border-color: #93C5FD !important;
  color: #1E40AF !important;
}

.n-input__input-el:hover {
  background-color: #DBEAFE !important;
  border-color: #60A5FA !important;
}

.n-input__input-el:focus {
  background-color: #DBEAFE !important;
  border-color: #3B82F6 !important;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2) !important;
}

/* 数字输入框 */
.n-input-number .n-input__input-el {
  background-color: #EBF4FF !important;
  border-color: #93C5FD !important;
  color: #1E40AF !important;
}

.n-input-number .n-input__input-el:hover {
  background-color: #DBEAFE !important;
  border-color: #60A5FA !important;
}

.n-input-number .n-input__input-el:focus {
  background-color: #DBEAFE !important;
  border-color: #3B82F6 !important;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2) !important;
}
</style>
