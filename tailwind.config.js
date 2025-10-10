/*
 * @Author: nll
 * @Date: 2025-09-26 17:14:01
 * @LastEditors: nll
 * @LastEditTime: 2025-09-28 09:39:00
 */
/** @type {import('tailwindcss').Config} */
module.exports = {
  // Tailwind CSS v4 不需要 content 配置，会自动扫描
  theme: {
    extend: {
      // 可以在这里扩展自定义主题
      colors: {
        'primary': '#3B82F6',
        'secondary': '#10B981'
      }
    },
  },
  plugins: [
    require('@iconify/tailwind').default({
      // 选择需要的图标集
      collections: ['carbon', 'mdi', 'heroicons']
    })
  ],
}