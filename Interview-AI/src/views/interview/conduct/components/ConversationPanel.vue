<template>
    <div class="conversation-panel">
        <div class="panel-header">
            <h3 class="panel-title">对话记录</h3>
            <span class="record-status" :class="status">
                <el-tag v-if="status === 'recording'" type="success" size="small" effect="dark">录制中</el-tag>
                <el-tag v-else-if="status === 'paused'" type="warning" size="small" effect="dark">已暂停</el-tag>
                <el-tag v-else type="info" size="small" effect="dark">未开始</el-tag>
            </span>
        </div>

        <div class="conversation-container">
            <div v-if="records.length === 0" class="empty-conversation">
                <el-empty description="暂无对话记录" :image-size="60" />
            </div>

            <el-scrollbar v-else ref="scrollbarRef" height="400px" class="conversation-scrollbar">
                <div class="conversation-messages">
                    <div v-for="(record, index) in records" :key="index" class="message-item" :class="{
                        'interviewer-message': record.speaker === 'interviewer',
                        'candidate-message': record.speaker === 'candidate'
                    }">
                        <div class="message-avatar">
                            <el-avatar :size="36" :icon="record.speaker === 'interviewer' ? User : Avatar"
                                :class="record.speaker" />
                        </div>
                        <div class="message-content">
                            <div class="message-header">
                                <span class="speaker-name">{{ getSpeakerName(record.speaker) }}</span>
                                <span class="message-time">{{ formatTime(record.timestamp) }}</span>
                            </div>
                            <div class="message-text">{{ record.content }}</div>
                            <div v-if="record.keywords?.length" class="message-keywords">
                                <span v-for="keyword in record.keywords" :key="keyword" class="keyword">
                                    <el-tag size="small" effect="plain">{{ keyword }}</el-tag>
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </el-scrollbar>
        </div>

        <div class="input-container">
            <el-form @submit.prevent="sendMessage">
                <el-form-item>
                    <div class="input-controls">
                        <div class="speaker-selector">
                            <el-radio-group v-model="currentSpeaker" size="small">
                                <el-radio-button label="interviewer">面试官</el-radio-button>
                                <el-radio-button label="candidate">候选人</el-radio-button>
                            </el-radio-group>
                        </div>

                        <div class="record-controls">
                            <el-button v-if="isAudioSupported" :type="isRecording ? 'danger' : 'default'"
                                :icon="isRecording ? Microphone : MicrophoneSlash" size="small"
                                @click="toggleAudioRecording" :disabled="status !== 'recording'">
                                {{ isRecording ? '停止录音' : '开始录音' }}
                            </el-button>
                        </div>
                    </div>

                    <div class="message-input">
                        <el-input v-model="messageText" type="textarea" :rows="3" placeholder="输入对话内容..."
                            :disabled="status !== 'recording'" @keydown.ctrl.enter="sendMessage" />
                    </div>

                    <div class="send-controls">
                        <span class="hint-text">按 Ctrl+Enter 发送</span>
                        <el-button type="primary" @click="sendMessage"
                            :disabled="!messageText.trim() || status !== 'recording'">
                            发送
                        </el-button>
                    </div>
                </el-form-item>
            </el-form>
        </div>
    </div>
</template>

<script setup>
import { ref, watch, nextTick, defineProps, defineEmits, onMounted, onBeforeUnmount } from 'vue'
import { User, Avatar, Microphone, MicrophoneSlash } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const props = defineProps({
    records: {
        type: Array,
        default: () => []
    },
    interviewId: {
        type: [String, Number],
        required: true
    },
    status: {
        type: String,
        default: 'stopped'
    }
})

const emit = defineEmits(['add-record'])

// 状态
const scrollbarRef = ref(null)
const messageText = ref('')
const currentSpeaker = ref('interviewer')
const isRecording = ref(false)
const audioRecorder = ref(null)
const isAudioSupported = ref(false)

// 获取说话者名称
const getSpeakerName = (speaker) => {
    return speaker === 'interviewer' ? '面试官' : '候选人'
}

// 格式化时间
const formatTime = (timestamp) => {
    if (!timestamp) return ''

    const date = new Date(timestamp)
    const hours = date.getHours().toString().padStart(2, '0')
    const minutes = date.getMinutes().toString().padStart(2, '0')
    const seconds = date.getSeconds().toString().padStart(2, '0')

    return `${hours}:${minutes}:${seconds}`
}

// 发送消息
const sendMessage = () => {
    if (!messageText.value.trim() || props.status !== 'recording') return

    // 创建消息对象
    const message = {
        speaker: currentSpeaker.value,
        content: messageText.value,
        timestamp: new Date().toISOString()
    }

    // 发送消息
    emit('add-record', message)

    // 清空输入
    messageText.value = ''

    // 滚动到底部
    scrollToBottom()
}

// 滚动到底部
const scrollToBottom = async () => {
    await nextTick()
    if (scrollbarRef.value) {
        scrollbarRef.value.setScrollTop(9999)
    }
}

// 切换录音状态
const toggleAudioRecording = async () => {
    if (isRecording.value) {
        stopRecording()
    } else {
        startRecording()
    }
}

// 开始录音
const startRecording = async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        ElMessage.error('您的浏览器不支持录音功能')
        return
    }

    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })

        // 创建MediaRecorder实例
        audioRecorder.value = new MediaRecorder(stream)

        // 收集音频数据
        const audioChunks = []

        audioRecorder.value.addEventListener('dataavailable', event => {
            audioChunks.push(event.data)
        })

        // 录音结束后的处理
        audioRecorder.value.addEventListener('stop', () => {
            // 这里可以处理音频数据，例如发送到后端进行语音识别
            // 以下代码仅作为示例，实际应用中可能需要调用专门的语音识别API

            ElMessage.success('录音已结束')

            // 模拟语音识别（实际应用中应当调用真实API）
            setTimeout(() => {
                // 假设识别成功，将结果放入输入框
                if (audioChunks.length > 0) {
                    ElMessage.info('正在识别音频...')

                    // 模拟识别延迟
                    setTimeout(() => {
                        // 模拟识别结果
                        const recognizedText = '这是语音识别的示例文本，实际项目中应当接入真实的语音识别服务。'

                        // 将识别结果放入输入框
                        messageText.value = recognizedText

                        ElMessage.success('语音识别完成')
                    }, 1500)
                }
            }, 500)
        })

        // 开始录音
        audioRecorder.value.start()
        isRecording.value = true
        ElMessage.success('开始录音')
    } catch (error) {
        ElMessage.error('无法访问麦克风: ' + error.message)
        console.error('录音失败:', error)
    }
}

// 停止录音
const stopRecording = () => {
    if (!audioRecorder.value) return

    audioRecorder.value.stop()

    // 停止所有轨道
    audioRecorder.value.stream?.getTracks().forEach(track => track.stop())

    isRecording.value = false
}

// 检查音频支持
const checkAudioSupport = () => {
    isAudioSupported.value = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)
}

// 观察记录变化，自动滚动到底部
watch(() => props.records.length, () => {
    scrollToBottom()
})

// 观察状态变化，如果暂停或停止，则停止录音
watch(() => props.status, (newStatus) => {
    if (newStatus !== 'recording' && isRecording.value) {
        stopRecording()
    }
})

// 挂载时
onMounted(() => {
    // 检查浏览器是否支持音频API
    checkAudioSupport()

    // 初始滚动到底部
    scrollToBottom()
})

// 卸载前
onBeforeUnmount(() => {
    // 停止录音（如果正在录音）
    if (isRecording.value) {
        stopRecording()
    }
})
</script>

<style scoped>
.conversation-panel {
    background-color: #fff;
    border-radius: 4px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
    margin-bottom: 20px;
    display: flex;
    flex-direction: column;
    height: 550px;

    .panel-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 16px;
        border-bottom: 1px solid #ebeef5;

        .panel-title {
            margin: 0;
            font-size: 16px;
            font-weight: 500;
        }

        .record-status {
            &.recording {
                animation: pulse 1.5s infinite;
            }
        }
    }

    .conversation-container {
        flex: 1;
        overflow: hidden;

        .empty-conversation {
            height: 100%;
            display: flex;
            justify-content: center;
            align-items: center;
        }

        .conversation-messages {
            padding: 16px;

            .message-item {
                display: flex;
                margin-bottom: 16px;

                &.interviewer-message {
                    .message-content {
                        background-color: #f2f6fc;

                        &:before {
                            border-right-color: #f2f6fc;
                        }
                    }

                    .speaker-name {
                        color: #409EFF;
                    }

                    .interviewer {
                        background-color: #409EFF;
                    }
                }

                &.candidate-message {
                    .message-content {
                        background-color: #f0f9eb;

                        &:before {
                            border-right-color: #f0f9eb;
                        }
                    }

                    .speaker-name {
                        color: #67c23a;
                    }

                    .candidate {
                        background-color: #67c23a;
                    }
                }

                .message-avatar {
                    margin-right: 12px;
                }

                .message-content {
                    flex: 1;
                    border-radius: 8px;
                    padding: 12px;
                    position: relative;

                    &:before {
                        content: '';
                        position: absolute;
                        left: -8px;
                        top: 15px;
                        border: 4px solid transparent;
                    }

                    .message-header {
                        display: flex;
                        justify-content: space-between;
                        margin-bottom: 8px;

                        .speaker-name {
                            font-weight: 500;
                        }

                        .message-time {
                            font-size: 12px;
                            color: #909399;
                        }
                    }

                    .message-text {
                        line-height: 1.6;
                        white-space: pre-line;
                    }

                    .message-keywords {
                        margin-top: 8px;
                        display: flex;
                        flex-wrap: wrap;
                        gap: 4px;
                    }
                }
            }
        }
    }

    .input-container {
        padding: 16px;
        border-top: 1px solid #ebeef5;

        .input-controls {
            display: flex;
            justify-content: space-between;
            margin-bottom: 12px;
        }

        .message-input {
            margin-bottom: 8px;
        }

        .send-controls {
            display: flex;
            justify-content: space-between;
            align-items: center;

            .hint-text {
                font-size: 12px;
                color: #909399;
            }
        }
    }
}

@keyframes pulse {
    0% {
        opacity: 1;
    }

    50% {
        opacity: 0.5;
    }

    100% {
        opacity: 1;
    }
}
</style>