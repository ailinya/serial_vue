/*
 * @Author: nll
 * @Date: 2025-09-24 14:17:36
 * @LastEditors: nll
 * @LastEditTime: 2025-09-24 14:18:41
 * @Description: 
 */
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useMapStore = defineStore('main-map', () => {
  const popFlag = ref(false)

  const mapShow = ref(false)

  // 当前识别选中的位置点
  const popData = ref()
  const mapPopup = ref()
  const mapStyle = ref({
    top: '0px',
    left: '0px'
  })
  return { popFlag, popData, mapPopup, mapStyle, mapShow }
})
