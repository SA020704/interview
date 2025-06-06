import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import './mock' // 引入Mock数据

// 导入样式
import './styles/variables.css'
import './styles/responsive.css'
import './styles/index.css'

// 创建应用实例
const app = createApp(App)

// 注册所有Element Plus图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component)
}

// 应用插件
app.use(createPinia())
app.use(router)
app.use(ElementPlus, { size: 'default', zIndex: 3000 })

// 挂载应用
app.mount('#app')
