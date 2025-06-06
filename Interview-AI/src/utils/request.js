import axios from 'axios'
import { ElMessage } from 'element-plus'

// 创建axios实例
const service = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || '',
    timeout: 10000, // 请求超时时间
    headers: {
        'Content-Type': 'application/json;charset=utf-8'
    }
})

// 请求拦截器
service.interceptors.request.use(
    config => {
        // 在请求发送前做一些处理
        const token = localStorage.getItem('token')
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`
        }
        return config
    },
    error => {
        // 处理请求错误
        console.error('请求错误：', error)
        return Promise.reject(error)
    }
)

// 响应拦截器
service.interceptors.response.use(
    response => {
        const res = response.data

        // 如果响应不成功
        if (res.code !== 200) {
            ElMessage({
                message: res.message || '服务器响应错误',
                type: 'error',
                duration: 5 * 1000
            })

            // 处理特定错误码
            if (res.code === 401) {
                // 未授权，清除token并重定向到登录页
                localStorage.removeItem('token')
                window.location.href = '/login'
            }

            return Promise.reject(new Error(res.message || '服务器响应错误'))
        } else {
            return res
        }
    },
    error => {
        // 处理HTTP错误
        console.error('响应错误：', error)
        let message = error.message || '请求失败'

        if (error.response) {
            switch (error.response.status) {
                case 400:
                    message = '请求错误'
                    break
                case 401:
                    message = '未授权，请登录'
                    // 清除token并重定向到登录页
                    localStorage.removeItem('token')
                    window.location.href = '/login'
                    break
                case 403:
                    message = '拒绝访问'
                    break
                case 404:
                    message = '请求地址出错'
                    break
                case 408:
                    message = '请求超时'
                    break
                case 500:
                    message = '服务器内部错误'
                    break
                case 501:
                    message = '服务未实现'
                    break
                case 502:
                    message = '网关错误'
                    break
                case 503:
                    message = '服务不可用'
                    break
                case 504:
                    message = '网关超时'
                    break
                default:
                    message = `连接错误${error.response.status}`
            }
        }

        ElMessage({
            message: message,
            type: 'error',
            duration: 5 * 1000
        })

        return Promise.reject(error)
    }
)

export default service 