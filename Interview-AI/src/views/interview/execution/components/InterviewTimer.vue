<template>
    <div class="interview-timer" :class="statusClass">
        <div class="timer-display">
            <el-icon class="timer-icon">
                <Timer />
            </el-icon>
            <span class="timer-text">{{ formattedTime }}</span>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { Timer } from '@element-plus/icons-vue'

const props = defineProps({
    status: {
        type: String,
        default: 'stopped', // stopped, recording, paused
        required: true
    },
    duration: {
        type: Number,
        default: 0,
        required: true
    }
})

const emit = defineEmits(['update:duration'])

// 计时器标识
let timerInterval = null

// 状态CSS类
const statusClass = computed(() => ({
    'is-recording': props.status === 'recording',
    'is-paused': props.status === 'paused',
    'is-stopped': props.status === 'stopped'
}))

// 格式化时间
const formattedTime = computed(() => {
    const totalSeconds = props.duration
    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const seconds = totalSeconds % 60

    const formattedHours = hours.toString().padStart(2, '0')
    const formattedMinutes = minutes.toString().padStart(2, '0')
    const formattedSeconds = seconds.toString().padStart(2, '0')

    return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`
})

// 监听状态变化
watch(() => props.status, (newStatus, oldStatus) => {
    if (newStatus === 'recording' && oldStatus !== 'recording') {
        startTimer()
    } else if (newStatus !== 'recording') {
        // stopTimer()
    }
}, { immediate: true })

// 开始计时
const startTimer = () => {
    stopTimer() // 防止多个计时器同时运行

    timerInterval = setInterval(() => {
        emit('update:duration', props.duration + 1)
    }, 1000)
}

// 停止计时
const stopTimer = () => {
    if (timerInterval) {
        clearInterval(timerInterval)
        timerInterval = null
    }
}

// 组件卸载前清除计时器
onBeforeUnmount(() => {
    stopTimer()
})

// 组件挂载时，如果状态是recording，就开始计时
onMounted(() => {
    if (props.status === 'recording') {
        startTimer()
    }
})
</script>

<style scoped>
.interview-timer {
    display: flex;
    align-items: center;
    padding: 8px 12px;
    border-radius: 4px;
    background-color: #f5f7fa;

    &.is-recording {
        background-color: #ecf5ff;

        .timer-icon {
            color: #409eff;
        }

        .timer-text {
            color: #409eff;
        }
    }

    &.is-paused {
        background-color: #fdf6ec;

        .timer-icon {
            color: #e6a23c;
        }

        .timer-text {
            color: #e6a23c;
        }
    }

    &.is-stopped {
        background-color: #f5f7fa;

        .timer-icon {
            color: #909399;
        }

        .timer-text {
            color: #909399;
        }
    }

    .timer-display {
        display: flex;
        align-items: center;

        .timer-icon {
            margin-right: 8px;
            font-size: 18px;
        }

        .timer-text {
            font-family: monospace;
            font-size: 18px;
            font-weight: 500;
        }
    }
}
</style>