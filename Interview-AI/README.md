# AI 面试助手系统 - 前端项目

## 项目简介
这是 AI 面试助手系统的前端部分，基于 Vue 3 + Vite 开发，提供了简历分析、面试问答、语音录制等功能。

## 技术栈
- 框架：Vue 3
- 构建工具：Vite
- 语言：JavaScript
- UI 组件库：Element Plus
- 状态管理：Pinia
- 路由：Vue Router 4
- 网络请求：Axios
- 音频处理：Web Audio API
- CSS 预处理器：SCSS

## 项目结构
```
interview-ai/
├── src/
│   ├── api/              # API 接口定义
│   ├── assets/           # 静态资源
│   ├── components/       # 公共组件
│   ├── composables/      # 组合式函数
│   ├── views/           # 页面组件
│   ├── stores/          # Pinia 状态管理
│   ├── types/           # TypeScript 类型定义
│   ├── utils/           # 工具函数
│   ├── router/          # 路由配置
│   ├── App.vue          # 根组件
│   └── main.ts          # 入口文件
├── public/              # 公共资源
├── index.html           # HTML 模板
├── package.json         # 项目依赖
├── tsconfig.json        # TypeScript 配置
├── vite.config.ts       # Vite 配置
└── convert-sass-to-css.js # SASS 转换脚本
```

## 开发环境要求
- Node.js >= 16.0.0
- npm >= 7.0.0 或 yarn >= 1.22.0

## 安装步骤

1. 克隆项目
```bash
git clone https://github.com/SA020704/interview.git
cd interview-ai
```

2. 安装依赖
```bash
# 使用 npm
npm install

# 或使用 yarn
yarn install
```

3. 配置环境变量
创建 `.env` 文件并配置以下参数：
```
# API 基础路径
VITE_API_BASE_URL=http://localhost:5000

# 其他环境变量
VITE_APP_TITLE=AI面试助手
```

4. 启动开发服务器
```bash
# 使用 npm
npm run dev

# 或使用 yarn
yarn dev
```

## 主要功能模块

### 1. 简历分析
- 支持 PDF 格式简历上传
- 实时显示简历解析结果
- 生成面试问题列表

### 2. 面试问答
- 语音录制功能
- 实时语音转文字
- 面试问题展示
- 回答时间控制

### 3. 面试评估
- 面试结果展示
- 技能评估报告
- 改进建议

## 开发指南

### 1. 组件开发规范
- 使用 Vue 3 组合式 API (Composition API)
- 使用 TypeScript 类型定义
- 使用 `<script setup>` 语法
- 使用 Element Plus 组件库

### 2. 状态管理
- 使用 Pinia 管理全局状态
- 使用 `ref` 和 `reactive` 管理组件状态
- 使用组合式函数封装业务逻辑

### 3. API 调用
- 使用 Axios 进行 HTTP 请求
- 统一错误处理
- 请求拦截器处理认证

### 4. 路由配置
- 使用 Vue Router 4
- 配置路由守卫
- 实现路由懒加载

### 5. 样式开发
- 使用 SCSS 预处理器
- 遵循 BEM 命名规范
- 使用 CSS 变量管理主题

## 构建部署

1. 构建生产版本
```bash
# 使用 npm
npm run build

# 或使用 yarn
yarn build
```

2. 预览生产版本
```bash
# 使用 npm
npm run preview

# 或使用 yarn
yarn preview
```

## 常见问题

1. 依赖安装失败
   - 检查 Node.js 版本
   - 清除 npm 缓存：`npm cache clean --force`
   - 删除 node_modules 后重新安装

2. 开发服务器启动失败
   - 检查端口占用
   - 检查环境变量配置
   - 检查依赖安装是否完整

3. 跨域问题
   - 检查后端 CORS 配置
   - 检查 API 基础路径配置
   - 检查网络请求配置

4. SCSS 编译问题
   - 确保已安装 sass 依赖
   - 检查 SCSS 语法是否正确
   - 运行 `node convert-sass-to-css.js` 转换 SCSS 文件

## 开发团队
[团队信息]

## 许可证
[许可证信息]
