<template>
    <div class="conversation-panel">
        <el-scrollbar ref="scrollbarRef" class="conversation-scrollbar">
            <div class="conversation-container">
                <div v-if="records.length === 0" class="empty-conversation">
                    <el-empty description="暂无对话记录，开始面试后将在此显示对话内容" />
                </div>

                <div v-else class="conversation-records">
                    <div v-for="record in records" :key="record.id" class="conversation-record" :class="[
                        record.speaker === 'interviewer' ? 'interviewer-record' : 'candidate-record',
                        { 'is-current': currentRecord && currentRecord.id === record.id }
                    ]">
                        <div class="record-header">
                            <div class="speaker">
                                <el-avatar :size="32" :icon="record.speaker === 'interviewer' ? User : Avatar"
                                    :class="record.speaker === 'interviewer' ? 'interviewer-avatar' : 'candidate-avatar'" />
                                <span class="speaker-name">{{ getSpeakerName(record.speaker) }}</span>
                            </div>
                            <div class="record-actions">
                                <span class="record-time">{{ formatTime(record.timestamp) }}</span>
                                <el-button v-if="record.speaker === 'candidate'" type="primary" size="small" plain link
                                    @click="handleAddNote(record)">
                                    <el-icon>
                                        <DocumentAdd />
                                    </el-icon>
                                    添加到笔记
                                </el-button>
                            </div>
                        </div>
                        <div class="record-content">
                            <p>{{ record.content }}</p>

                            <div v-if="record.keywords && record.keywords.length > 0" class="record-keywords">
                                <span class="keyword-label">关键词:</span>
                                <el-tag v-for="keyword in record.keywords" :key="keyword" size="small"
                                    class="keyword-tag">
                                    {{ keyword }}
                                </el-tag>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </el-scrollbar>
    </div>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue'
import { User, Avatar, DocumentAdd } from '@element-plus/icons-vue'
import { ElMessageBox } from 'element-plus'

const props = defineProps({
    records: {
        type: Array,
        default: () => [],
        required: true
    },
    currentRecord: {
        type: Object,
        default: null
    },
    status: {
        type: String,
        default: 'stopped'
    }
})

const emit = defineEmits(['add-note'])

const scrollbarRef = ref(null)

// 监听记录变化，自动滚动到底部
watch(() => props.records.length, async () => {
    // 等待DOM更新后滚动
    await nextTick()
    if (scrollbarRef.value) {
        scrollbarRef.value.setScrollTop(10000)
    }
})

// 监听当前记录变化，自动滚动到当前记录
watch(() => props.currentRecord, async (newVal) => {
    if (newVal) {
        await nextTick()
        if (scrollbarRef.value) {
            scrollbarRef.value.setScrollTop(10000)
        }
    }
})

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

// 处理添加笔记
const handleAddNote = (record) => {
    ElMessageBox.prompt(
        '将回答添加到笔记，您可以编辑内容：',
        '添加笔记',
        {
            inputValue: record.content,
            inputType: 'textarea',
            confirmButtonText: '添加',
            cancelButtonText: '取消',
        }
    )
        .then(({ value }) => {
            if (value.trim()) {
                emit('add-note', value.trim())
            }
        })
        .catch(() => { })
}
</script>

<style scoped>
.conversation-panel {
    flex: 1;
    height: 100%;
    overflow: hidden;

    .conversation-scrollbar {
        height: 100%;

        .conversation-container {
            padding: 20px;

            .empty-conversation {
                height: 300px;
                display: flex;
                justify-content: center;
                align-items: center;
            }

            .conversation-records {
                .conversation-record {
                    margin-bottom: 24px;
                    padding: 16px;
                    border-radius: 8px;

                    &.interviewer-record {
                        background-color: #f2f6fc;
                        margin-right: 10%;

                        .interviewer-avatar {
                            background-color: #409eff;
                        }
                    }

                    &.candidate-record {
                        background-color: #f0f9eb;
                        margin-left: 10%;

                        .candidate-avatar {
                            background-color: #67c23a;
                        }
                    }

                    &.is-current {
                        border: 1px dashed #409eff;
                    }

                    .record-header {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        margin-bottom: 8px;

                        .speaker {
                            display: flex;
                            align-items: center;

                            .speaker-name {
                                margin-left: 8px;
                                font-weight: 500;
                            }
                        }

                        .record-actions {
                            display: flex;
                            align-items: center;
                            gap: 10px;

                            .record-time {
                                color: #909399;
                                font-size: 13px;
                            }
                        }
                    }

                    .record-content {
                        p {
                            margin: 0;
                            line-height: 1.6;
                            white-space: pre-line;
                        }

                        .record-keywords {
                            margin-top: 8px;
                            display: flex;
                            align-items: center;
                            flex-wrap: wrap;

                            .keyword-label {
                                margin-right: 8px;
                                color: #606266;
                                font-size: 13px;
                            }

                            .keyword-tag {
                                margin-right: 5px;
                                margin-bottom: 5px;
                            }
                        }
                    }
                }
            }
        }
    }
}
</style>