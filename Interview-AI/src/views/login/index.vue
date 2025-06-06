<template>
    <div class="login-container">
        <div class="login-content">
            <div class="login-header">
                <h1 class="title">AI面试助手</h1>
                <p class="subtitle">智能面试工具，助力高效招聘</p>
            </div>

            <el-form :model="loginForm" :rules="loginRules" ref="loginFormRef" class="login-form">
                <el-form-item prop="username">
                    <el-input v-model="loginForm.username" placeholder="用户名" prefix-icon="User" />
                </el-form-item>

                <el-form-item prop="password">
                    <el-input v-model="loginForm.password" placeholder="密码" prefix-icon="Lock" show-password
                        type="password" />
                </el-form-item>

                <div class="login-options">
                    <el-checkbox v-model="loginForm.remember">记住我</el-checkbox>
                    <el-link type="primary">忘记密码?</el-link>
                </div>

                <el-form-item>
                    <el-button type="primary" class="login-button" :loading="loading" @click="handleLogin">
                        登录
                    </el-button>
                </el-form-item>
            </el-form>
        </div>
    </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/store/modules/user'
import { ElMessage } from 'element-plus'
import { User, Lock } from '@element-plus/icons-vue'

// 路由实例
const router = useRouter()

// 用户store
const userStore = useUserStore()

// 表单引用
const loginFormRef = ref(null)

// 加载状态
const loading = ref(false)

// 登录表单数据
const loginForm = reactive({
    username: '',
    password: '',
    remember: false
})

// 表单验证规则
const loginRules = {
    username: [
        { required: true, message: '请输入用户名', trigger: 'blur' }
    ],
    password: [
        { required: true, message: '请输入密码', trigger: 'blur' },
        { min: 6, message: '密码长度不能少于6个字符', trigger: 'blur' }
    ]
}

// 登录处理
const handleLogin = () => {
    loginFormRef.value.validate(async (valid) => {
        if (!valid) return

        loading.value = true

        try {
            // 调用登录接口
            await userStore.login(loginForm)

            // 记住密码处理
            if (loginForm.remember) {
                // 这里可以存储在localStorage或cookie中
            }

            // 登录成功消息
            ElMessage.success('登录成功')

            // 重定向到仪表盘
            router.push({ path: '/dashboard' })
        } catch (error) {
            console.error('登录失败:', error)
            ElMessage.error(error.message || '登录失败，请检查用户名和密码')
        } finally {
            loading.value = false
        }
    })
}
</script>

<style scoped>
.login-container {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.login-content {
    width: 380px;
    padding: 40px;
    background-color: #fff;
    border-radius: 8px;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}

.login-header {
    text-align: center;
    margin-bottom: 30px;
}

.login-header .title {
    font-size: 28px;
    font-weight: 600;
    color: #303133;
    margin: 0 0 10px;
}

.login-header .subtitle {
    font-size: 16px;
    color: #606266;
    margin: 0;
}

.login-form .login-options {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
}

.login-form .login-button {
    width: 100%;
    padding: 12px 0;
    font-size: 16px;
}

@media (max-width: 480px) {
    .login-content {
        width: 90%;
        padding: 30px 20px;
    }
}
</style>