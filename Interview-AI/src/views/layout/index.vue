<template>
    <div class="app-layout">
        <div class="sidebar" :class="{ collapsed: isSidebarCollapsed }">
            <div class="logo-container">
                <div class="logo">
                    <span class="logo-text">AI面试助手</span>
                </div>
                <el-icon class="toggle-icon" @click="toggleSidebar">
                    <Fold v-if="isSidebarCollapsed" />
                    <Expand v-else />
                </el-icon>
            </div>
            <el-menu
                :collapse="isSidebarCollapsed"
                :default-active="activeMenu"
                class="sidebar-menu"
                background-color="#1e293b"
                text-color="#94a3b8"
                active-text-color="#ffffff"
                router
            >
                <el-menu-item index="/dashboard">
                    <el-icon>
                        <HomeFilled />
                    </el-icon>
                    <template #title>仪表盘</template>
                </el-menu-item>
                <el-sub-menu index="/interview">
                    <template #title>
                        <el-icon>
                            <UserFilled />
                        </el-icon>
                        <span>面试管理</span>
                    </template>
                    <el-menu-item index="/interview/preparation">面试准备</el-menu-item>
                    <el-menu-item index="/interview/execution/1">面试执行</el-menu-item>
                    <el-menu-item index="/interview/analysis/1">面试分析</el-menu-item>
                </el-sub-menu>
                <el-menu-item index="/settings">
                    <el-icon>
                        <Setting />
                    </el-icon>
                    <template #title>系统设置</template>
                </el-menu-item>
                <el-menu-item index="/home">
                    <template #title>home</template>
                </el-menu-item>
                <el-menu-item index="/prepare">
                    <template #title>prepare</template>
                </el-menu-item>
                <el-menu-item index="/InterviewProcess">
                    <template #title>interview</template>
                </el-menu-item>
            </el-menu>
        </div>

        <div class="main-content">
            <header class="app-header">
                <div class="header-left">
                    <el-button type="text" @click="toggleSidebar">
                        <el-icon>
                            <component :is="isSidebarCollapsed ? 'Expand' : 'Fold'" />
                        </el-icon>
                    </el-button>
                </div>
                <div class="header-right">
                    <el-dropdown>
                        <span class="user-dropdown">
                            <el-avatar :size="32" :src="userAvatar" />
                            <span class="username hidden-sm-and-down">{{ username }}</span>
                            <el-icon>
                                <ArrowDown />
                            </el-icon>
                        </span>
                        <template #dropdown>
                            <el-dropdown-menu>
                                <el-dropdown-item @click="goToProfile">个人资料</el-dropdown-item>
                                <el-dropdown-item divided @click="logout">退出登录</el-dropdown-item>
                            </el-dropdown-menu>
                        </template>
                    </el-dropdown>
                </div>
            </header>

            <main class="app-main">
                <router-view v-slot="{ Component }">
                    <transition name="fade" mode="out-in">
                        <component :is="Component" />
                    </transition>
                </router-view>
            </main>
        </div>
    </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { useRouter, useRoute } from "vue-router";
import { HomeFilled, UserFilled, Setting, Expand, Fold, ArrowDown } from "@element-plus/icons-vue";

// 侧边栏状态
const isSidebarCollapsed = ref(false);
const toggleSidebar = () => {
    isSidebarCollapsed.value = !isSidebarCollapsed.value;
};

// 用户信息
const username = ref("管理员");
const userAvatar = ref("");

// 路由
const router = useRouter();
const route = useRoute();

// 当前活跃菜单
const activeMenu = computed(() => {
    return route.meta.activeMenu || route.path;
});

// 导航方法
const goToProfile = () => {
    router.push("/profile");
};

const logout = () => {
    localStorage.removeItem("token");
    router.push("/login");
};
</script>

<style lang="scss" scoped>
.app-layout {
    display: flex;
    height: 100vh;
    overflow: hidden;
}

.sidebar {
    width: 250px;
    height: 100%;
    background-color: #1e293b;
    transition: width 0.3s;
    overflow-y: auto;
    overflow-x: hidden;

    &.collapsed {
        width: 64px;
    }

    .logo-container {
        height: 60px;
        display: flex;
        align-items: center;
        padding: 0 20px;

        .logo {
            width: 32px;
            height: 32px;
        }

        .logo-text {
            margin-left: 10px;
            color: white;
            font-size: 18px;
            white-space: nowrap;
        }
    }

    .sidebar-menu {
        border-right: none;
    }
}

.main-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
}

.app-header {
    height: 60px;
    background-color: white;
    border-bottom: 1px solid #e5e7eb;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 20px;

    .header-left,
    .header-right {
        display: flex;
        align-items: center;
    }

    .user-dropdown {
        display: flex;
        align-items: center;
        cursor: pointer;

        .username {
            margin: 0 8px;
        }
    }
}

.app-main {
    flex: 1;
    padding: 20px;
    overflow-y: auto;
    background-color: #f3f4f6;
}

/* 响应式调整 */
@media (max-width: 768px) {
    .sidebar {
        position: fixed;
        z-index: 1000;
        transform: translateX(-100%);

        &.collapsed {
            transform: translateX(0);
            width: 250px;
        }
    }

    .main-content {
        margin-left: 0;
    }

    .app-header {
        padding: 0 10px;
    }
}

/* 过渡动画 */
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}
</style>
