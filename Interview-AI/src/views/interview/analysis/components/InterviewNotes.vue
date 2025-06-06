<template>
    <div class="interview-notes-container">
        <div v-if="notes.length === 0" class="empty-notes">
            <el-empty description="暂无面试笔记" />
        </div>

        <div v-else class="notes-list">
            <el-timeline>
                <el-timeline-item v-for="note in notes" :key="note.id" :timestamp="formatTime(note.timestamp)"
                    :type="note.type === 'important' ? 'danger' : 'primary'" :hollow="note.type !== 'important'">
                    <div class="note-card" :class="{ 'is-important': note.type === 'important' }">
                        <div class="note-header">
                            <h4 class="note-title">
                                <el-tag v-if="note.type === 'important'" type="danger" size="small">重要</el-tag>
                                <el-tag v-else-if="note.type === 'observation'" type="info" size="small">观察</el-tag>
                                <el-tag v-else-if="note.type === 'question'" type="warning" size="small">问题</el-tag>
                                <el-tag v-else-if="note.type === 'answer'" type="success" size="small">回答</el-tag>
                                {{ note.title || getDefaultTitle(note) }}
                            </h4>
                            <span class="note-author" v-if="note.author">{{ note.author }}</span>
                        </div>

                        <div class="note-content">
                            <p>{{ note.content }}</p>
                        </div>

                        <div v-if="note.tags && note.tags.length > 0" class="note-tags">
                            <span class="tags-label">标签:</span>
                            <el-tag v-for="tag in note.tags" :key="tag" size="small" effect="plain" class="note-tag">
                                {{ tag }}
                            </el-tag>
                        </div>
                    </div>
                </el-timeline-item>
            </el-timeline>
        </div>
    </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
    notes: {
        type: Array,
        default: () => [],
        required: true
    }
})

// 获取默认标题
const getDefaultTitle = (note) => {
    const typeTextMap = {
        'important': '重要笔记',
        'observation': '观察记录',
        'question': '面试问题',
        'answer': '候选人回答',
        'general': '一般笔记'
    }

    return typeTextMap[note.type] || '面试笔记'
}

// 格式化时间
const formatTime = (timestamp) => {
    if (!timestamp) return ''

    const date = new Date(timestamp)
    const year = date.getFullYear()
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const day = date.getDate().toString().padStart(2, '0')
    const hours = date.getHours().toString().padStart(2, '0')
    const minutes = date.getMinutes().toString().padStart(2, '0')

    return `${year}-${month}-${day} ${hours}:${minutes}`
}
</script>

<style scoped>
.interview-notes-container {
    height: 100%;

    .empty-notes {
        height: 300px;
        display: flex;
        justify-content: center;
        align-items: center;
    }

    .notes-list {
        .note-card {
            padding: 16px;
            background-color: #f5f7fa;
            border-radius: 8px;
            margin-bottom: 8px;
            border-left: 4px solid #909399;

            &.is-important {
                background-color: #fef0f0;
                border-left-color: #f56c6c;
            }

            .note-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 12px;

                .note-title {
                    margin: 0;
                    font-size: 16px;
                    font-weight: 500;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .note-author {
                    font-size: 13px;
                    color: #909399;
                }
            }

            .note-content {
                p {
                    margin: 0 0 12px 0;
                    line-height: 1.6;
                    color: #606266;
                    white-space: pre-line;
                }
            }

            .note-tags {
                display: flex;
                align-items: center;
                flex-wrap: wrap;

                .tags-label {
                    font-size: 13px;
                    color: #909399;
                    margin-right: 8px;
                }

                .note-tag {
                    margin-right: 8px;
                    margin-bottom: 4px;
                }
            }
        }
    }
}
</style>