import Mock from 'mockjs'

// 模拟用户数据
const users = [
    {
        id: 1,
        username: 'admin',
        password: '123456',
        name: '管理员',
        avatar: '',
        email: 'admin@example.com',
        role: 'admin',
        permissions: ['*']
    },
    {
        id: 2,
        username: 'user',
        password: '123456',
        name: '普通用户',
        avatar: '',
        email: 'user@example.com',
        role: 'user',
        permissions: ['view', 'create']
    }
]

// 登录接口
Mock.mock('/api/user/login', 'post', (options) => {
    const { username, password } = JSON.parse(options.body)

    const user = users.find(u => u.username === username && u.password === password)

    if (user) {
        return {
            code: 200,
            data: {
                token: `mock-token-${username}-${Date.now()}`,
                user: {
                    id: user.id,
                    username: user.username,
                    name: user.name,
                    avatar: user.avatar,
                    email: user.email,
                    role: user.role
                }
            },
            message: '登录成功'
        }
    } else {
        return {
            code: 401,
            data: null,
            message: '用户名或密码错误'
        }
    }
})

// 获取用户信息接口
Mock.mock('/api/user/info', 'get', (options) => {
    // 这里可以从headers中获取token并验证
    // 为了简化，返回管理员用户信息
    const user = users[0]

    return {
        code: 200,
        data: {
            id: user.id,
            username: user.username,
            name: user.name,
            avatar: user.avatar,
            email: user.email,
            role: user.role,
            permissions: user.permissions
        },
        message: '获取用户信息成功'
    }
})

// 登出接口
Mock.mock('/api/user/logout', 'post', () => {
    return {
        code: 200,
        data: null,
        message: '登出成功'
    }
})

// 获取用户列表
Mock.mock(/\/api\/user\/list/, 'get', (options) => {
    const { url } = options
    const params = new URLSearchParams(url.split('?')[1])
    const pageSize = parseInt(params.get('pageSize') || '10')
    const currentPage = parseInt(params.get('currentPage') || '1')

    // 移除敏感信息
    const userList = users.map(({ password, ...rest }) => rest)

    // 计算分页
    const start = (currentPage - 1) * pageSize
    const end = start + pageSize
    const list = userList.slice(start, end)

    return {
        code: 0,
        message: '获取用户列表成功',
        data: {
            list,
            total: userList.length,
            pageSize,
            currentPage
        }
    }
})

// 更新用户信息
Mock.mock(/\/api\/user\/info/, 'put', (options) => {
    const updateData = JSON.parse(options.body)

    return {
        code: 0,
        message: '更新用户信息成功',
        data: updateData
    }
})

// 修改密码
Mock.mock(/\/api\/user\/password/, 'put', () => {
    return {
        code: 0,
        message: '密码修改成功'
    }
})

// 获取用户偏好设置
Mock.mock(/\/api\/user\/preferences/, 'get', () => {
    return {
        code: 0,
        message: '获取用户偏好设置成功',
        data: {
            theme: 'light',
            language: 'zh-CN',
            dashboardLayout: 'default',
            notificationSettings: {
                email: true,
                browser: true
            },
            interviewSettings: {
                audioQuality: 'high',
                videoEnabled: true,
                analyticsLevel: 'detailed'
            }
        }
    }
})

// 更新用户偏好设置
Mock.mock(/\/api\/user\/preferences/, 'put', (options) => {
    const updateData = JSON.parse(options.body)

    return {
        code: 0,
        message: '更新用户偏好设置成功',
        data: updateData
    }
})

export default users 