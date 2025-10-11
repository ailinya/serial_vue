# Vue3 寄存器读写应用

一个基于 Vue 3 + TypeScript + Naive UI 的寄存器读写管理应用，支持串口通信、寄存器操作和数据持久化。

## 🚀 功能特性

### 串口通信
- **实时串口监听**：WebSocket 自动检测串口插拔
- **串口连接管理**：支持连接/断开操作
- **波特率配置**：支持标准波特率和自定义波特率
- **连接状态显示**：实时显示连接状态

### 寄存器操作
- **单次读写**：支持单个寄存器的读取和写入
- **批量操作**：支持批量读取、写入和删除
- **32位位编辑器**：可视化位操作界面
- **拖拽排序**：支持表格行拖拽重排序

### 数据管理
- **数据持久化**：寄存器配置保存到后端数据库
- **导入导出**：支持配置文件的导入导出
- **列表管理**：自动加载已保存的寄存器配置

## 🛠️ 技术栈

- **前端框架**：Vue 3 + Composition API
- **UI 组件库**：Naive UI
- **样式框架**：Tailwind CSS
- **状态管理**：Pinia
- **HTTP 客户端**：Axios
- **构建工具**：Vite
- **类型检查**：TypeScript

## 📁 项目结构

```
src/
├── api/                    # API 接口封装
│   └── register_api.ts    # 寄存器相关 API
├── components/             # 公共组件
├── http/                   # HTTP 请求封装
│   └── index.ts           # Axios 配置
├── router/                 # 路由配置
├── store/                  # 状态管理
│   ├── index.ts           # Store 入口
│   └── serial.ts          # 串口状态管理
├── styles/                 # 样式文件
├── views/                  # 页面组件
│   └── register/          # 寄存器页面
│       ├── Register.vue   # 主页面
│       └── components/     # 子组件
│           └── BitEditor.vue  # 32位位编辑器
└── main.ts                # 应用入口
```

## 🔧 安装和运行

### 环境要求
- Node.js >= 16.0.0
- npm >= 8.0.0

### 安装依赖
```bash
npm install
```

### 开发环境
```bash
npm run dev
```

### 生产构建
```bash
npm run build
```

## 📡 API 接口

### 串口相关
- `GET /serial/ports` - 获取串口列表
- `POST /register/connect` - 连接串口
- `POST /register/disconnect` - 断开串口

### 寄存器操作
- `POST /register/read` - 读取寄存器
- `POST /register/write` - 写入寄存器
- `POST /register/batch-read` - 批量读取
- `POST /register/batch-write` - 批量写入

### 数据管理
- `GET /register/saved/list` - 获取寄存器列表
- `POST /register/saved/save` - 保存寄存器
- `DELETE /register/saved/{id}` - 删除寄存器
- `POST /register/saved/batch-delete` - 批量删除

## 🎯 核心功能

### 1. 串口监听
```typescript
// 启动串口监听
serialStore.startPortMonitoring()

// WebSocket 连接
ws = new WebSocket('ws://localhost:9993/ws/serial-ports')
```

### 2. 寄存器操作
```typescript
// 读取寄存器
const readRegister = async (row: RegisterRow) => {
  const res = await apiReadRegister({ address: row.address })
  row.data = res.value
  row.value32bit = res.value
}

// 写入寄存器
const writeRegister = async (row: RegisterRow) => {
  const res = await apiWriteRegister({ 
    address: row.address, 
    value: row.data 
  })
}
```

### 3. 批量操作
```typescript
// 批量读取
const bulkRead = async () => {
  const res = await apiBatchRead({
    addresses: selectedAddresses,
    size: 4
  })
}

// 批量删除
const deleteSelected = async () => {
  const res = await apiBatchDeleteRegisters({
    register_ids: selectedIds
  })
}
```

## 🎨 界面特性

### 表格功能
- **全选/取消全选**：支持批量选择
- **拖拽排序**：支持行拖拽重排序
- **行高亮**：悬浮和选中状态高亮
- **响应式布局**：适配不同屏幕尺寸

### 位编辑器
- **32位可视化**：直观的位操作界面
- **位值切换**：点击切换位值
- **实时同步**：与数据字段实时同步

### 状态管理
- **连接状态**：实时显示串口连接状态
- **选择状态**：显示已选择行数
- **操作反馈**：成功/失败消息提示

## 🔄 数据流

### 1. 初始化流程
```
页面加载 → 启动串口监听 → 获取串口列表 → 加载寄存器列表
```

### 2. 寄存器操作流程
```
选择寄存器 → 连接串口 → 执行操作 → 更新数据 → 保存配置
```

### 3. 批量操作流程
```
选择多行 → 批量操作 → 更新所有选中行 → 刷新列表
```

## 🛡️ 错误处理

### 网络错误
- 自动重连机制
- 详细错误信息显示
- 用户友好的错误提示

### 数据验证
- 地址格式验证
- 数据范围检查
- 必填字段验证

## 📱 响应式设计

### 断点设置
- **桌面端**：> 1200px
- **平板端**：768px - 1200px
- **移动端**：< 768px

### 布局适配
- 表格列宽自适应
- 按钮大小调整
- 字体大小优化

## 🚀 部署说明

### 开发环境
```bash
# 启动开发服务器
npm run dev

# 访问地址
http://localhost:5173
```

### 生产环境
```bash
# 构建生产版本
npm run build

# 预览构建结果
npm run preview
```

## 🔧 配置说明

### Vite 配置
```typescript
// vite.config.ts
export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:9993',
        changeOrigin: true,
        rewrite: (path) => path
      }
    }
  }
})
```

### 环境变量
```bash
# .env.development
VITE_API_BASE_URL=http://localhost:9993
VITE_WS_URL=ws://localhost:9993
```

## 📝 开发指南

### 添加新功能
1. 在 `src/api/` 中定义 API 接口
2. 在 `src/views/register/` 中实现页面逻辑
3. 更新类型定义
4. 添加错误处理

### 代码规范
- 使用 TypeScript 严格模式
- 遵循 Vue 3 Composition API 规范
- 使用 ESLint + Prettier 格式化代码

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支
3. 提交更改
4. 推送到分支
5. 创建 Pull Request

