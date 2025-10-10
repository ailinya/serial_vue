<!--
 * @Author: nll
 * @Date: 2025-09-24 14:53:18
 * @LastEditors: nll
 * @LastEditTime: 2025-09-28 14:11:30
 * @Description: 
-->
<template>
  <div class="home-container h-full flex flex-col">
    <div class="home-top text-center h-10 flex justify-center items-center" >
      {{ title }}
    </div>
    <div class="home-content flex flex-1">

      <div class="home-content-left w-40" >
        <SideMenu />
      </div>
      <div class="home-content-right flex-1 p-2 rounded-lg bg-white shadow-lg border-4 border-gray-200">
       
        <router-view></router-view>
      </div>
    </div>
  </div>
  
</template>

<script setup lang="ts">
// 获取应用标题（从环境变量）
const title = import.meta.env.VITE_TITLE

</script>

<style scoped lang="scss">

.home-container{
.home-top{
background-color: #8f9fc5;
border-bottom: 1px solid rgb(150, 135, 135);
}


}


</style>