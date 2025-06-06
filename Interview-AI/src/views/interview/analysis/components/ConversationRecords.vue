<template>
    <div class="conversation-records-container">
        <div class="filter-bar">
            <el-input v-model="searchKeyword" placeholder="搜索对话内容或关键词" prefix-icon="Search" clearable
                @input="filterRecords" />

            <el-select v-model="speakerFilter" placeholder="说话者" clearable @change="filterRecords">
                <el-option label="全部" value="" />
                <el-option label="面试官" value="interviewer" />
                <el-option label="候选人" value="candidate" />
            </el-select>

            <el-button type="primary" @click="exportRecords">
                <el-icon>
                    <Download />
                </el-icon>
                导出对话记录
            </el-button>
        </div>

        <div class="records-container">
            <div v-if="filteredRecords.length === 0" class="empty-records">
                <el-empty description="暂无对话记录" />
            </div>

            <div v-else>
                <el-timeline>
                    <el-timeline-item v-for="record in filteredRecords" :key="record.id"
                        :timestamp="formatTime(record.timestamp)" :type="getTimelineItemType(record.speaker)"
                        :hollow="record.speaker === 'interviewer'">
                        <div class="record-item"
                            :class="record.speaker === 'interviewer' ? 'interviewer-record' : 'candidate-record'">
                            <div class="record-header">
                                <div class="speaker">
                                    <el-avatar :size="28" :icon="record.speaker === 'interviewer' ? User : Avatar"
                                        :class="record.speaker === 'interviewer' ? 'interviewer-avatar' : 'candidate-avatar'" />
                                    <span class="speaker-name">{{ getSpeakerName(record.speaker) }}</span>
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
                    </el-timeline-item>
                </el-timeline>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { User, Avatar, Download, Search } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const props = defineProps({
    records: {
        type: Array,
        default: () => [],
        required: true
    }
})

// 过滤条件
const searchKeyword = ref('')
const speakerFilter = ref('')

// 过滤后的记录
const filteredRecords = computed(() => {
    let result = [...props.records]

    if (speakerFilter.value) {
        result = result.filter(r => r.speaker === speakerFilter.value)
    }

    if (searchKeyword.value) {
        const keyword = searchKeyword.value.toLowerCase()
        result = result.filter(r => {
            // 匹配内容
            if (r.content.toLowerCase().includes(keyword)) {
                return true
            }

            // 匹配关键词
            if (r.keywords && r.keywords.some(k => k.toLowerCase().includes(keyword))) {
                return true
            }

            return false
        })
    }

    return result
})

// 过滤记录
const filterRecords = () => {
    // 由于使用了计算属性，这里不需要额外的逻辑
}

// 获取说话者名称
const getSpeakerName = (speaker) => {
    return speaker === 'interviewer' ? '面试官' : '候选人'
}

// 获取时间线项类型
const getTimelineItemType = (speaker) => {
    return speaker === 'interviewer' ? 'primary' : 'success'
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

// 导出对话记录
const exportRecords = () => {
    try {
        // 准备CSV内容
        let csvContent = "时间,说话者,内容,关键词\n"

        filteredRecords.value.forEach(record => {
            const time = formatTime(record.timestamp)
            const speaker = getSpeakerName(record.speaker)
            const content = `"${record.content.replace(/"/g, '""')}"`
            const keywords = record.keywords ? record.keywords.join(', ') : ''

            csvContent += `${time},${speaker},${content},${keywords}\n`
        })

        // 创建下载链接
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')

        link.setAttribute('href', url)
        link.setAttribute('download', `对话记录_${new Date().toISOString().split('T')[0]}.csv`)
        link.style.visibility = 'hidden'

        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)

        ElMessage.success('对话记录导出成功')
    } catch (error) {
        ElMessage.error('导出失败: ' + error.message)
    }
}
</script>

<style scoped>
.conversation-records-container {
    height: 100%;
    display: flex;
    flex-direction: column;

    .filter-bar {
        margin-bottom: 20px;
        display: flex;
        gap: 16px;
        align-items: center;

        .el-input {
            max-width: 300px;
        }
    }

    .records-container {
        flex: 1;
        overflow: auto;

        .empty-records {
            height: 300px;
            display: flex;
            justify-content: center;
            align-items: center;
        }

        .record-item {
            padding: 12px 16px;
            border-radius: 8px;
            margin-bottom: 8px;

            &.interviewer-record {
                background-color: #f2f6fc;

                .interviewer-avatar {
                    background-color: #409eff;
                }
            }

            &.candidate-record {
                background-color: #f0f9eb;

                .candidate-avatar {
                    background-color: #67c23a;
                }
            }

            .record-header {
                margin-bottom: 8px;

                .speaker {
                    display: flex;
                    align-items: center;

                    .speaker-name {
                        margin-left: 8px;
                        font-weight: 500;
                    }
                }
            }

            .record-content {
                p {
                    margin: 0 0 8px 0;
                    line-height: 1.6;
                    white-space: pre-line;
                }

                .record-keywords {
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
</style>