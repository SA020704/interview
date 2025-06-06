import { defineStore } from 'pinia'
import { getSystemSettings, updateSystemSettings } from '@/api/settings'

export const useSettingsStore = defineStore('settings', {
    state: () => ({
        // 系统设置
        settings: {
            // 主题设置
            theme: localStorage.getItem('theme') || 'light',
            // 语言设置
            language: localStorage.getItem('language') || 'zh-CN',
            // 评分模板
            scoreTemplates: [],
            // 部门结构
            departments: [],
            // 职位类型
            positionTypes: [],
            // 面试类型
            interviewTypes: [],
            // 通知设置
            notifications: {
                email: true,
                sms: false,
                browser: true
            },
            // AI模型参数
            aiSettings: {
                responseSpeed: 'medium',
                analyticsLevel: 'detailed',
                voiceRecognitionSensitivity: 'medium'
            }
        },
        // 加载状态
        loading: false
    }),

    getters: {
        isDarkMode: (state) => state.settings.theme === 'dark',
        currentLanguage: (state) => state.settings.language,
        getScoreTemplateById: (state) => (id) => state.settings.scoreTemplates.find(template => template.id === id),
        getDepartmentById: (state) => (id) => state.settings.departments.find(dept => dept.id === id)
    },

    actions: {
        // 获取系统设置
        async fetchSettings() {
            this.loading = true
            try {
                const { data } = await getSystemSettings()
                this.settings = { ...this.settings, ...data }
                return Promise.resolve(data)
            } catch (error) {
                return Promise.reject(error)
            } finally {
                this.loading = false
            }
        },

        // 更新系统设置
        async updateSettings(settingsData) {
            try {
                const { data } = await updateSystemSettings(settingsData)
                this.settings = { ...this.settings, ...data }

                // 保存主题和语言到本地存储
                if (data.theme) localStorage.setItem('theme', data.theme)
                if (data.language) localStorage.setItem('language', data.language)

                return Promise.resolve(data)
            } catch (error) {
                return Promise.reject(error)
            }
        },

        // 切换主题
        toggleTheme() {
            const newTheme = this.settings.theme === 'light' ? 'dark' : 'light'
            this.settings.theme = newTheme
            localStorage.setItem('theme', newTheme)

            // 应用主题到文档根元素
            document.documentElement.setAttribute('data-theme', newTheme)
        },

        // 设置语言
        setLanguage(language) {
            this.settings.language = language
            localStorage.setItem('language', language)
        },

        // 添加评分模板
        addScoreTemplate(template) {
            this.settings.scoreTemplates.push(template)
        },

        // 更新评分模板
        updateScoreTemplate(id, templateData) {
            const index = this.settings.scoreTemplates.findIndex(t => t.id === id)
            if (index !== -1) {
                this.settings.scoreTemplates[index] = { ...this.settings.scoreTemplates[index], ...templateData }
            }
        },

        // 删除评分模板
        deleteScoreTemplate(id) {
            const index = this.settings.scoreTemplates.findIndex(t => t.id === id)
            if (index !== -1) {
                this.settings.scoreTemplates.splice(index, 1)
            }
        },

        // 添加部门
        addDepartment(department) {
            this.settings.departments.push(department)
        },

        // 更新部门
        updateDepartment(id, departmentData) {
            const index = this.settings.departments.findIndex(d => d.id === id)
            if (index !== -1) {
                this.settings.departments[index] = { ...this.settings.departments[index], ...departmentData }
            }
        },

        // 删除部门
        deleteDepartment(id) {
            const index = this.settings.departments.findIndex(d => d.id === id)
            if (index !== -1) {
                this.settings.departments.splice(index, 1)
            }
        },

        // 设置AI模型参数
        setAISettings(aiSettings) {
            this.settings.aiSettings = { ...this.settings.aiSettings, ...aiSettings }
        }
    }
}) 