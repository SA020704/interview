<template>
    <div class="settings-container">
        <h1>系统设置</h1>

        <el-card class="settings-card">
            <template #header>
                <div class="card-header">
                    <h2>用户设置</h2>
                </div>
            </template>

            <el-form label-position="top">
                <el-form-item label="显示名称">
                    <el-input v-model="settings.displayName" placeholder="请输入显示名称"></el-input>
                </el-form-item>

                <el-form-item label="电子邮箱">
                    <el-input v-model="settings.email" placeholder="请输入电子邮箱"></el-input>
                </el-form-item>

                <el-form-item>
                    <el-button type="primary">保存更改</el-button>
                </el-form-item>
            </el-form>
        </el-card>

        <el-card class="settings-card">
            <template #header>
                <div class="card-header">
                    <h2>系统偏好</h2>
                </div>
            </template>

            <el-form label-position="top">
                <el-form-item label="界面语言">
                    <el-select v-model="settings.language" style="width: 100%">
                        <el-option label="简体中文" value="zh-CN"></el-option>
                        <el-option label="English" value="en-US"></el-option>
                    </el-select>
                </el-form-item>

                <el-form-item label="主题">
                    <el-radio-group v-model="settings.theme">
                        <el-radio label="light">浅色</el-radio>
                        <el-radio label="dark">深色</el-radio>
                        <el-radio label="system">跟随系统</el-radio>
                    </el-radio-group>
                </el-form-item>

                <el-form-item>
                    <el-button type="primary" @click="applySettings">应用设置</el-button>
                </el-form-item>
            </el-form>
        </el-card>

        <el-card class="settings-card">
            <template #header>
                <div class="card-header">
                    <h2>主题个性化</h2>
                </div>
            </template>

            <el-form label-position="top">
                <el-form-item label="主色调">
                    <el-color-picker v-model="settings.primaryColor" show-alpha></el-color-picker>
                    <span class="color-value">{{ settings.primaryColor }}</span>
                </el-form-item>

                <el-form-item label="侧边栏宽度">
                    <div class="slider-container">
                        <el-slider v-model="settings.sidebarWidth" :min="180" :max="300" :step="10">
                            <template #button>
                                <div class="slider-tooltip">{{ settings.sidebarWidth }}px</div>
                            </template>
                        </el-slider>
                    </div>
                </el-form-item>

                <el-form-item label="字体大小">
                    <el-select v-model="settings.fontSize" style="width: 100%">
                        <el-option label="小" value="small"></el-option>
                        <el-option label="中等" value="medium"></el-option>
                        <el-option label="大" value="large"></el-option>
                    </el-select>
                </el-form-item>

                <el-divider></el-divider>

                <el-form-item label="预览">
                    <div class="theme-preview" :style="previewStyle">
                        <div class="preview-header">页面标题</div>
                        <div class="preview-content">
                            <div class="preview-sidebar">
                                <div class="preview-menu-item active">首页</div>
                                <div class="preview-menu-item">面试</div>
                                <div class="preview-menu-item">分析</div>
                            </div>
                            <div class="preview-main">
                                <div class="preview-card">内容区域</div>
                            </div>
                        </div>
                    </div>
                </el-form-item>

                <el-form-item>
                    <el-button type="primary" @click="applyTheme">应用主题</el-button>
                    <el-button @click="resetTheme">重置默认</el-button>
                </el-form-item>
            </el-form>
        </el-card>

        <el-card class="settings-card">
            <template #header>
                <div class="card-header">
                    <h2>个人偏好</h2>
                </div>
            </template>

            <el-form label-position="top">
                <el-form-item label="数据展示密度">
                    <el-radio-group v-model="settings.density">
                        <el-radio label="comfortable">舒适</el-radio>
                        <el-radio label="compact">紧凑</el-radio>
                    </el-radio-group>
                </el-form-item>

                <el-form-item label="自动保存">
                    <el-switch v-model="settings.autoSave" active-text="开启" inactive-text="关闭"></el-switch>
                </el-form-item>

                <el-form-item label="通知提醒">
                    <div class="settings-grid">
                        <el-checkbox v-model="settings.notifications.email">邮件通知</el-checkbox>
                        <el-checkbox v-model="settings.notifications.browser">浏览器通知</el-checkbox>
                        <el-checkbox v-model="settings.notifications.sound">声音提醒</el-checkbox>
                    </div>
                </el-form-item>

                <el-form-item>
                    <el-button type="primary" @click="savePreferences">保存偏好</el-button>
                </el-form-item>
            </el-form>
        </el-card>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { useSettingsStore } from '@/store/modules/settings'

// 获取设置Store
const settingsStore = useSettingsStore()

// 设置数据
const settings = ref({
    displayName: '用户名',
    email: 'user@example.com',
    language: 'zh-CN',
    theme: 'light',
    primaryColor: '#409EFF',
    sidebarWidth: 220,
    fontSize: 'medium',
    density: 'comfortable',
    autoSave: true,
    notifications: {
        email: true,
        browser: true,
        sound: false
    }
})

// 计算预览样式
const previewStyle = computed(() => {
    return {
        '--primary-color': settings.value.primaryColor,
        '--sidebar-width': `${settings.value.sidebarWidth / 3}px`,
        '--font-size': settings.value.fontSize === 'small' ? '12px' : settings.value.fontSize === 'medium' ? '14px' : '16px'
    }
})

// 应用系统设置
const applySettings = () => {
    settingsStore.setLanguage(settings.value.language)
    settingsStore.setTheme(settings.value.theme)
    ElMessage.success('系统设置已应用')
}

// 应用主题
const applyTheme = () => {
    settingsStore.setCustomTheme({
        primaryColor: settings.value.primaryColor,
        sidebarWidth: settings.value.sidebarWidth,
        fontSize: settings.value.fontSize
    })
    ElMessage.success('主题设置已应用')
}

// 重置主题
const resetTheme = () => {
    settings.value.primaryColor = '#409EFF'
    settings.value.sidebarWidth = 220
    settings.value.fontSize = 'medium'
    ElMessage.info('主题已重置为默认设置')
}

// 保存个人偏好
const savePreferences = () => {
    settingsStore.setUserPreferences({
        density: settings.value.density,
        autoSave: settings.value.autoSave,
        notifications: settings.value.notifications
    })
    ElMessage.success('个人偏好设置已保存')
}
</script>

<style scoped>
.settings-container {
    padding: 20px;
}

.settings-container h1 {
    margin-bottom: 20px;
    font-weight: 500;
}

.settings-card {
    margin-bottom: 20px;
}

.settings-card .card-header h2 {
    margin: 0;
    font-size: 18px;
    font-weight: 500;
}

.color-value {
    margin-left: 12px;
    color: #606266;
}

.slider-container {
    padding: 0 10px;
}

.settings-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
}

.theme-preview {
    border: 1px solid #dcdfe6;
    border-radius: 4px;
    overflow: hidden;
    height: 180px;
    font-size: var(--font-size);
}

.theme-preview .preview-header {
    background-color: var(--primary-color);
    color: white;
    padding: 10px;
    text-align: center;
}

.theme-preview .preview-content {
    display: flex;
    height: calc(100% - 38px);
}

.theme-preview .preview-sidebar {
    width: var(--sidebar-width);
    background-color: #f5f7fa;
    border-right: 1px solid #e6e6e6;
    padding: 10px 0;
}

.theme-preview .preview-menu-item {
    padding: 6px 12px;
    cursor: pointer;
}

.theme-preview .preview-menu-item.active {
    background-color: rgba(var(--primary-color), 0.1);
    color: var(--primary-color);
    border-left: 2px solid var(--primary-color);
}

.theme-preview .preview-main {
    flex: 1;
    padding: 10px;
}

.theme-preview .preview-card {
    background-color: white;
    border: 1px solid #e6e6e6;
    border-radius: 4px;
    padding: 10px;
    height: 80px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #606266;
}

/* 移动端适配 */
@media (max-width: 768px) {
    .settings-container {
        padding: 12px;
    }

    .settings-card .card-header h2 {
        font-size: 16px;
    }

    .settings-grid {
        grid-template-columns: 1fr;
    }

    .theme-preview {
        height: 150px;
    }
}

/* 小屏幕手机进一步优化 */
@media (max-width: 480px) {
    .settings-container h1 {
        font-size: 20px;
    }

    :deep(.el-radio-group) {
        display: flex;
        flex-direction: column;
        gap: 10px;
    }

    :deep(.el-form-item__label) {
        padding-bottom: 4px;
    }

    .color-value {
        display: block;
        margin-left: 0;
        margin-top: 5px;
    }

    .theme-preview {
        height: 120px;
    }
}
</style>