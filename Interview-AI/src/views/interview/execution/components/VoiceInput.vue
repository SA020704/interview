<template>
    <div class="voice-input-container">
        <div class="voice-status">
            <div class="status-indicator">
                <span class="recording-dot" :class="{ 'is-recording': isRecording }"></span>
                <span class="status-text">{{ statusText }}</span>
            </div>
            <div class="volume-visualizer">
                <div v-for="(bar, index) in volumeBars" :key="index" class="volume-bar" :style="{ height: `${bar}%` }">
                </div>
            </div>
        </div>

        <div class="transcription-area">
            <div class="transcription-text" v-if="currentTranscription">
                <div class="speaker-indicator" :class="currentSpeaker">
                    {{ getSpeakerLabel(currentSpeaker) }}:
                </div>
                <div class="transcription-content">{{ currentTranscription }}</div>
            </div>
            <div class="transcription-placeholder" v-else>
                正在聆听...说话将自动转写
            </div>
        </div>

        <div class="voice-controls">
            <el-button size="small" type="success" :disabled="!canSendTranscription" @click="sendTranscription">
                添加到对话
            </el-button>
            <el-radio-group v-model="currentSpeaker" size="small">
                <el-radio label="interviewer">面试官</el-radio>
                <el-radio label="candidate">候选人</el-radio>
            </el-radio-group>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { ElMessage } from 'element-plus'

// 录音状态
const isRecording = ref(true)
const currentTranscription = ref('')
const currentSpeaker = ref('interviewer')
const volumeBars = ref(Array(15).fill(0))
const recordingInterval = ref(null)
const speakerDetectionActive = ref(true)
const transcriptionTimeout = ref(null)

// 计算属性
const statusText = computed(() => {
    return isRecording.value ? '正在录音' : '录音已暂停'
})

const canSendTranscription = computed(() => {
    return currentTranscription.value && currentTranscription.value.trim().length > 0
})

// 获取发言者标签
const getSpeakerLabel = (speaker) => {
    return speaker === 'interviewer' ? '面试官' : '候选人'
}

// 音量可视化模拟
const updateVolumeVisualization = () => {
    // 模拟音量波动
    volumeBars.value = volumeBars.value.map(() => {
        return isRecording.value ? Math.floor(Math.random() * 60 + 20) : 0
    })
}

// 模拟语音识别
const simulateSpeechRecognition = () => {
    // 清除之前的超时
    if (transcriptionTimeout.value) {
        clearTimeout(transcriptionTimeout.value)
    }

    // 随机选择一个发言者(如果启用了自动检测)
    if (speakerDetectionActive.value && Math.random() > 0.5) {
        currentSpeaker.value = Math.random() > 0.5 ? 'interviewer' : 'candidate'
    }

    // 定义一些模拟的对话
    const interviewerPhrases = [
        "请介绍一下你在上一个项目中的角色和责任。",
        "你能描述一下你解决过的最具挑战性的技术问题吗？",
        "你如何确保你的代码质量？",
        "你对敏捷开发的理解是什么？",
        "你如何处理与团队成员的意见分歧？"
    ]

    const candidatePhrases = [
        "在上一个项目中，我负责前端架构设计和实现，主要使用React和TypeScript。",
        "我曾经解决过一个复杂的性能问题，通过优化算法和实现缓存机制，使页面加载速度提升了60%。",
        "我通过编写单元测试和集成测试，以及定期代码审查来确保代码质量。",
        "敏捷开发强调迭代、灵活性和团队协作，我在过去三年里一直在敏捷团队中工作。",
        "当出现意见分歧时，我会先理解对方的观点，然后基于数据和最佳实践进行讨论。"
    ]

    // 根据当前发言者选择短语
    const phrases = currentSpeaker.value === 'interviewer' ? interviewerPhrases : candidatePhrases
    const selectedPhrase = phrases[Math.floor(Math.random() * phrases.length)]

    // 模拟渐进式转写(字符一个个出现)
    currentTranscription.value = ''
    let currentIndex = 0

    const typeText = () => {
        if (currentIndex < selectedPhrase.length) {
            currentTranscription.value += selectedPhrase[currentIndex]
            currentIndex++
            transcriptionTimeout.value = setTimeout(typeText, 50)
        }
    }

    typeText()
}

// 发送转写内容
const sendTranscription = () => {
    if (!canSendTranscription.value) return

    const transcription = {
        text: currentTranscription.value,
        speaker: currentSpeaker.value,
        timestamp: new Date().toISOString()
    }

    // 发出事件，供父组件处理
    emit('transcription-update', currentTranscription.value)

    // 清空当前转写
    currentTranscription.value = ''

    // 重新开始模拟
    simulateSpeechRecognition()
}

// 定义事件
const emit = defineEmits(['transcription-update'])

// 组件挂载时启动模拟
onMounted(() => {
    // 启动音量可视化更新
    recordingInterval.value = setInterval(() => {
        updateVolumeVisualization()
    }, 100)

    // 启动语音识别模拟
    simulateSpeechRecognition()

    // 每隔一段随机时间自动发送转写(真实模拟)
    setInterval(() => {
        if (isRecording.value && canSendTranscription.value) {
            sendTranscription()
        }
    }, Math.random() * 5000 + 5000) // 5-10秒随机间隔
})

// 组件卸载前清理资源
onBeforeUnmount(() => {
    if (recordingInterval.value) {
        clearInterval(recordingInterval.value)
    }

    if (transcriptionTimeout.value) {
        clearTimeout(transcriptionTimeout.value)
    }
})
</script>

<style scoped>
.voice-input-container {
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: 16px;
    background-color: #f9f9f9;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.voice-status {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 8px;

    .status-indicator {
        display: flex;
        align-items: center;
        gap: 8px;

        .recording-dot {
            width: 12px;
            height: 12px;
            border-radius: 50%;
            background-color: #ddd;

            &.is-recording {
                background-color: #f56c6c;
                animation: pulse 1.5s infinite;
            }
        }

        .status-text {
            font-size: 14px;
            color: #606266;
        }
    }

    .volume-visualizer {
        display: flex;
        align-items: flex-end;
        gap: 2px;
        height: 30px;

        .volume-bar {
            width: 4px;
            background-color: #409eff;
            border-radius: 2px;
            transition: height 0.1s ease;
        }
    }
}

.transcription-area {
    min-height: 100px;
    padding: 12px;
    background-color: #fff;
    border-radius: 4px;
    border: 1px solid #e4e7ed;

    .transcription-text {
        .speaker-indicator {
            font-weight: bold;
            margin-bottom: 4px;

            &.interviewer {
                color: #409eff;
            }

            &.candidate {
                color: #67c23a;
            }
        }

        .transcription-content {
            font-size: 15px;
            line-height: 1.5;
            white-space: pre-wrap;
        }
    }

    .transcription-placeholder {
        color: #909399;
        font-style: italic;
        text-align: center;
        margin-top: 30px;
    }
}

.voice-controls {
    display: flex;
    align-items: center;
    justify-content: space-between;
}

@keyframes pulse {
    0% {
        transform: scale(1);
        opacity: 1;
    }

    50% {
        transform: scale(1.2);
        opacity: 0.8;
    }

    100% {
        transform: scale(1);
        opacity: 1;
    }
}
</style>