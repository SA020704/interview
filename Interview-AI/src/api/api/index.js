import axios from "axios"
//这里是axios进行最基本的封装，如果后续需要添加详细的可以根据需求自行添加
//这里是基础地址 直接替换就行baseURL
//nuxt前端处理跨域怎么都不生效，如果要调用服务器上的接口，让后端处理一下跨域
// import { useUserStore } from "@/store/user"
// 环境的切换   根据不同的环境  切换不同的IP
let BaseUrl = "https://api.worldtest.ai"
if (process.env.NODE_ENV == "development") {
    // BaseUrl = "http://172.16.1.39:8880/v3"
    BaseUrl = "http://172.16.1.171:8840/"
    // BaseUrl = "https://4874-171-212-158-254.ngrok-free.app/"
    // BaseUrl = "http://43.161.243.139:8080/v3";
} else if (process.env.NODE_ENV == "debug") {
    // BaseUrl = "http://172.16.1.171:8840/"
    // BaseUrl = "https://4874-171-212-158-254.ngrok-free.app/"
} else if (process.env.NODE_ENV == "production") {
    BaseUrl = "https://api.worldtest.ai"
    // BaseUrl = "http://172.16.1.171:8840/"
    // BaseUrl = "https://4874-171-212-158-254.ngrok-free.app/"
}
const api = axios.create({
    baseURL: BaseUrl, // 替换成你的API的基本URL
    timeout: 30000, // 设置超时时间为 3000 毫秒（3 秒）
    responseType: "json" //响应数据类型，默认json
    // headers: {
    //     "Content-Type": "application/json"
    // }
})

// 这个方法是避免重复请求，根据自己需要打开或者关闭    存储每个请求的取消函数
const cacelRequest = () => {
    const cancelTokens = new Map()
    const cancelToken = axios.CancelToken.source()
    config.cancelToken = cancelToken.token

    // 如果存在相同的请求，则取消之前的请求
    if (cancelTokens.has(config.url)) {
        const cancel = cancelTokens.get(config.url)
        cancel("Request canceled due to repeated action")
    }
    // 存储新请求的取消函数
    cancelTokens.set(config.url, cancelToken.cancel)
}
//拦截器，请求前需要做些什么。所有请求头相关的信息都可以在这里写
api.interceptors.request.use((config) => {
    // const basicStore = useUserStore()
    const token = localStorage.getItem("token") || ""
    // cacelRequest();   //这个方法是避免重复请求，根据自己需要打开或者关闭    存储每个请求的取消函数
    // 这里可以设置请求头部
    config.headers["x-access-token"] = token // 这里设置获取token
    // console.log("token", token)
    return config
})
//响应拦截器
api.interceptors.response.use(
    (response) => {
        // 在响应之前做些什么
        return response
    },
    (error) => {
        if (error.response?.status) {
            //这里判断错误状态码对应不同的逻辑
            switch (error.response.status) {
                // 401: 没权限
                case '8401':
                    // const basicStore = useUserStore()
                    // basicStore.resetStateAndToLogin()
                    break
                // 403 token过期
                case 403:
                    console.log(403)
                    break

                // 404请求不存在
                case 404:
                    console.log(404)
                    break
                // 其他错误，直接抛出错误提示
                default:
                    console.log("其他错误")
            }
            // 处理响应错误
            return Promise.reject(error)
        }
    }
)
//取消拦截器   取消请求的时候调用
api.interceptors.request.eject(() => { })
// GET请求
export const get = async (url, params) => {
    try {
        const response = await api.get(url, { params })
        return response.data
    } catch (error) {
        throw error
    }
}

// POST请求
export const post = async (url, data) => {
    try {
        const response = await api.post(url, data)
        return response?.data
    } catch (error) {
        throw error
    }
}

// PUT请求
export const put = async (url, data) => {
    try {
        const response = await api.put(url, data)
        return response.data
    } catch (error) {
        throw error
    }
}

// DELETE请求
export const Delete = async (url) => {
    try {
        const response = await api.delete(url)
        return response.data
    } catch (error) {
        throw error
    }
}
