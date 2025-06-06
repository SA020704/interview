import { createRouter, createWebHistory } from 'vue-router'

// 路由配置
const routes = [
    {
        path: '/',
        redirect: '/Home'
    },
    {
        path: '/Home',
        name: 'home',
        component: () => import('@/lob/Home.vue'),
        meta: { title: '设置', requiresAuth: true }
    },
    {
        path: '/prepare',
        name: 'InterviewPrepare',
        component: () => import('@/lob/InterviewPrepare.vue'),
        meta: { title: '设置', requiresAuth: true }
    },
    {
        path: '/InterviewProcess',
        name: 'InterviewProcess',
        component: () => import('@/lob/InterviewProcess.vue'),
        meta: { title: '设置', requiresAuth: true }
    },
  

    // {
    //     path: '/:pathMatch(.*)*',
    //     redirect: '/404'
    // }
]

// 创建路由实例
const router = createRouter({
    history: createWebHistory(),
    routes
})

// 全局前置守卫
router.beforeEach((to, from, next) => {
    // 设置页面标题
    document.title = to.meta.title ? `${to.meta.title} - AI面试助手` : 'AI面试助手'

    // 暂时禁用身份验证逻辑方便测试
    next()

    /* 身份验证逻辑（暂时禁用）
    const token = localStorage.getItem('token')

    if (to.meta.requiresAuth && !token) {
        // 需要认证但未登录，重定向到登录页
        next({ name: 'login', query: { redirect: to.fullPath } })
    } else if (to.name === 'login' && token) {
        // 已登录用户尝试访问登录页，重定向到首页
        next({ name: 'dashboard' })
    } else {
        // 其他情况正常导航
        next()
    }
    */
})

export default router 