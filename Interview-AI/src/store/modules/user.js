import { defineStore } from 'pinia'
import { login, getUserInfo, logout } from '@/api/user'

export const useUserStore = defineStore('user', {
    state: () => ({
        token: localStorage.getItem('token') || '',
        userInfo: null,
        roles: [],
        permissions: []
    }),

    getters: {
        isLoggedIn: (state) => !!state.token,
        username: (state) => state.userInfo?.username || '',
        name: (state) => state.userInfo?.name || '',
        avatar: (state) => state.userInfo?.avatar || ''
    },

    actions: {
        // 登录
        async login(loginData) {
            try {
                const response = await login(loginData)
                const { token, user } = response.data

                this.token = token
                this.userInfo = user

                // 存储token到本地存储
                localStorage.setItem('token', token)

                return Promise.resolve(response)
            } catch (error) {
                return Promise.reject(error)
            }
        },

        // 获取用户信息
        async getUserInfo() {
            try {
                const response = await getUserInfo()
                const data = response.data

                this.userInfo = data
                this.roles = [data.role]
                this.permissions = data.permissions

                return Promise.resolve(data)
            } catch (error) {
                return Promise.reject(error)
            }
        },

        // 登出
        async logout() {
            try {
                await logout()
                this.resetState()
                return Promise.resolve()
            } catch (error) {
                return Promise.reject(error)
            }
        },

        // 重置状态
        resetState() {
            this.token = ''
            this.userInfo = null
            this.roles = []
            this.permissions = []
            localStorage.removeItem('token')
        }
    }
}) 