// API基础配置
export const API_BASE_URL = process.env.NODE_ENV === 'production'
    ? 'https://api.interview-ai.com'
    : 'http://localhost:3000'

// 请求头配置
export const DEFAULT_HEADERS = {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
}

export const getSystemSettings = async () => {
    try {
        const { data } = await axios.get('/api/system/settings')
        return data
    } catch (error) {
        console.error('获取系统设置失败:', error)
        throw error
    }
}

export const updateSystemSettings = async (settingsData) => {
    try {
        const { data } = await axios.put('/api/system/settings', settingsData)
        return data
    } catch (error) {
        console.error('更新系统设置失败:', error)
        throw error
    }
}
export default {
    getSystemSettings,
    updateSystemSettings
}