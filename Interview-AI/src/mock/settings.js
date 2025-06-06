import Mock from 'mockjs'

// 模拟系统设置数据
const systemSettings = {
    'theme': 'light',
    'language': 'zh-CN',
    'notifications': true,
    'autoRecord': true,
    'aiAssistant': true,
    'speechRecognition': true,
    'dataRetentionDays': 90
}

// 模拟用户偏好设置
const userPreferences = {
    'showTips': true,
    'dashboardLayout': 'standard',
    'defaultInterviewDuration': 60,
    'autoPause': true,
    'autoSave': true
}

// 模拟API接口
Mock.mock(/\/api\/settings\/system/, 'get', () => {
    return {
        code: 200,
        data: systemSettings,
        message: '获取系统设置成功'
    }
})

Mock.mock(/\/api\/settings\/user/, 'get', () => {
    return {
        code: 200,
        data: userPreferences,
        message: '获取用户偏好设置成功'
    }
})

Mock.mock(/\/api\/settings\/system/, 'put', (options) => {
    const body = JSON.parse(options.body)
    Object.assign(systemSettings, body)
    return {
        code: 200,
        data: systemSettings,
        message: '系统设置更新成功'
    }
})

Mock.mock(/\/api\/settings\/user/, 'put', (options) => {
    const body = JSON.parse(options.body)
    Object.assign(userPreferences, body)
    return {
        code: 200,
        data: userPreferences,
        message: '用户偏好设置更新成功'
    }
})

export default {
    systemSettings,
    userPreferences
} 