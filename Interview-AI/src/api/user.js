import request from '@/utils/request'

/**
 * 用户登录
 * @param {Object} data - 登录数据：{ username, password, remember }
 */
export function login(data) {
    return request({
        url: '/api/user/login',
        method: 'post',
        data
    })
}

/**
 * 用户登出
 */
export function logout() {
    return request({
        url: '/api/user/logout',
        method: 'post'
    })
}

/**
 * 获取用户信息
 */
export function getUserInfo() {
    return request({
        url: '/api/user/info',
        method: 'get'
    })
}

/**
 * 更新用户信息
 * @param {Object} data - 用户信息数据
 */
export function updateUserInfo(data) {
    return request({
        url: '/api/user/info',
        method: 'put',
        data
    })
}

/**
 * 修改密码
 * @param {Object} data - 密码数据：{ oldPassword, newPassword }
 */
export function changePassword(data) {
    return request({
        url: '/api/user/password',
        method: 'put',
        data
    })
}

/**
 * 获取用户列表（管理员）
 * @param {Object} params - 查询参数
 */
export function getUserList(params) {
    return request({
        url: '/api/user/list',
        method: 'get',
        params
    })
}

/**
 * 创建用户（管理员）
 * @param {Object} data - 用户数据
 */
export function createUser(data) {
    return request({
        url: '/api/user',
        method: 'post',
        data
    })
}

/**
 * 更新用户（管理员）
 * @param {String} id - 用户ID
 * @param {Object} data - 用户数据
 */
export function updateUser(id, data) {
    return request({
        url: `/api/user/${id}`,
        method: 'put',
        data
    })
}

/**
 * 删除用户（管理员）
 * @param {String} id - 用户ID
 */
export function deleteUser(id) {
    return request({
        url: `/api/user/${id}`,
        method: 'delete'
    })
}

/**
 * 获取用户偏好设置
 */
export function getUserPreferences() {
    return request({
        url: '/api/user/preferences',
        method: 'get'
    })
}

/**
 * 更新用户偏好设置
 * @param {Object} data - 偏好设置数据
 */
export function updateUserPreferences(data) {
    return request({
        url: '/api/user/preferences',
        method: 'put',
        data
    })
} 