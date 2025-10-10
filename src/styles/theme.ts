/*
 * @Author: nll
 * @Date: 2025-09-28 14:15:00
 * @Description: Naive UI 主题配置文件
 */

// 自定义主题配置 - 蓝色背景
export const customTheme = {
  common: {
    primaryColor: '#3B82F6',
    primaryColorHover: '#2563EB',
    primaryColorPressed: '#1D4ED8',
    primaryColorSuppl: '#3B82F6',
  },
  Select: {
    peers: {
      InternalSelection: {
        color: '#EBF4FF', // 浅蓝色背景
        colorHover: '#DBEAFE', // 悬停时的蓝色
        colorActive: '#BFDBFE', // 激活时的蓝色
        borderColor: '#93C5FD', // 边框颜色
        borderColorHover: '#60A5FA', // 悬停边框颜色
        borderColorFocus: '#3B82F6', // 聚焦边框颜色
      },
      InternalSelectMenu: {
        color: '#F0F9FF', // 下拉菜单背景
      }
    }
  },
  Input: {
    peers: {
      InternalInput: {
        color: '#EBF4FF', // 输入框背景色
        colorFocus: '#DBEAFE', // 聚焦时的背景色
        colorHover: '#DBEAFE', // 悬停时的背景色
        textColor: '#1E40AF', // 文字颜色（深蓝色）
        caretColor: '#1E40AF', // 光标颜色
        borderColor: '#93C5FD', // 边框颜色
        borderColorHover: '#60A5FA', // 悬停边框颜色
        borderColorFocus: '#3B82F6', // 聚焦边框颜色
      }
    }
  },
  InputNumber: {
    peers: {
      InternalInput: {
        color: '#EBF4FF', // 数字输入框背景色
        colorFocus: '#DBEAFE', // 聚焦时的背景色
        colorHover: '#DBEAFE', // 悬停时的背景色
        textColor: '#1E40AF', // 文字颜色（深蓝色）
        caretColor: '#1E40AF', // 光标颜色
        borderColor: '#93C5FD', // 边框颜色
        borderColorHover: '#60A5FA', // 悬停边框颜色
        borderColorFocus: '#3B82F6', // 聚焦边框颜色
      }
    }
  }
}

// 主题颜色变量（可选，用于 CSS 变量）
export const themeColors = {
  input: {
    background: '#EBF4FF',
    backgroundHover: '#DBEAFE',
    backgroundFocus: '#BFDBFE',
    border: '#93C5FD',
    borderHover: '#60A5FA',
    borderFocus: '#3B82F6',
    text: '#1E40AF'
  },
  selection: {
    background: '#EBF4FF',
    backgroundHover: '#DBEAFE',
    backgroundActive: '#BFDBFE',
    border: '#93C5FD',
    borderHover: '#60A5FA',
    borderFocus: '#3B82F6'
  }
}
