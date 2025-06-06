<template>
    <div class="basic-info-container">
        <el-descriptions :column="2" border>
            <el-descriptions-item label="面试标题">
                {{ interview?.title || '暂无' }}
            </el-descriptions-item>

            <el-descriptions-item label="面试状态">
                <el-tag :type="getStatusType(interview?.status)">
                    {{ getStatusText(interview?.status) }}
                </el-tag>
            </el-descriptions-item>

            <el-descriptions-item label="候选人">
                {{ interview?.candidateName || '暂无' }}
            </el-descriptions-item>

            <el-descriptions-item label="应聘职位">
                {{ interview?.position || '暂无' }}
            </el-descriptions-item>

            <el-descriptions-item label="面试类型">
                {{ getInterviewTypeText(interview?.type) }}
            </el-descriptions-item>

            <el-descriptions-item label="面试时间">
                {{ interview?.date }} {{ interview?.time }}
            </el-descriptions-item>

            <el-descriptions-item label="面试地点">
                {{ interview?.location || '暂无' }}
            </el-descriptions-item>

            <el-descriptions-item label="面试时长">
                {{ formatDuration(record?.duration || 0) }}
            </el-descriptions-item>

            <el-descriptions-item label="面试官" :span="2">
                <el-tag v-for="interviewer in interviewers" :key="interviewer" class="interviewer-tag">
                    {{ interviewer }}
                </el-tag>
            </el-descriptions-item>

            <el-descriptions-item label="面试描述" :span="2">
                {{ interview?.description || '暂无描述' }}
            </el-descriptions-item>
        </el-descriptions>

        <div class="interview-statistics">
            <h3>面试统计</h3>
            <div class="statistics-cards">
                <el-card shadow="hover" class="stat-card">
                    <template #header>
                        <div class="card-header">
                            <span>对话记录</span>
                        </div>
                    </template>
                    <div class="card-content">
                        <div class="stat-value">{{ recordStats.total }}</div>
                        <div class="stat-detail">
                            <div class="stat-item">
                                <span class="label">面试官:</span>
                                <span class="value">{{ recordStats.interviewer }}</span>
                            </div>
                            <div class="stat-item">
                                <span class="label">候选人:</span>
                                <span class="value">{{ recordStats.candidate }}</span>
                            </div>
                        </div>
                    </div>
                </el-card>

                <el-card shadow="hover" class="stat-card">
                    <template #header>
                        <div class="card-header">
                            <span>问题数量</span>
                        </div>
                    </template>
                    <div class="card-content">
                        <div class="stat-value">{{ questionCount }}</div>
                    </div>
                </el-card>

                <el-card shadow="hover" class="stat-card">
                    <template #header>
                        <div class="card-header">
                            <span>笔记数量</span>
                        </div>
                    </template>
                    <div class="card-content">
                        <div class="stat-value">{{ record?.notes?.length || 0 }}</div>
                    </div>
                </el-card>
            </div>
        </div>
    </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
    interview: {
        type: Object,
        default: null
    },
    record: {
        type: Object,
        default: null
    }
})

// 获取面试状态文本
const getStatusText = (status) => {
    const statusMap = {
        'pending': '待进行',
        'completed': '已完成',
        'cancelled': '已取消'
    }
    return statusMap[status] || '未知'
}

// 获取面试状态类型
const getStatusType = (status) => {
    const statusMap = {
        'pending': 'warning',
        'completed': 'success',
        'cancelled': 'danger'
    }
    return statusMap[status] || 'info'
}

// 获取面试类型文本
const getInterviewTypeText = (type) => {
    const typeMap = {
        'screening': '初筛面试',
        'technical': '技术面试',
        'hr': 'HR面试',
        'final': '终面'
    }
    return typeMap[type] || '未知'
}

// 格式化持续时间
const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)

    return `${hours}小时${minutes}分钟`
}

// 获取面试官列表
const interviewers = computed(() => {
    if (!props.interview?.interviewer) return []

    if (Array.isArray(props.interview.interviewer)) {
        return props.interview.interviewer
    }

    return [props.interview.interviewer]
})

// 对话记录统计
const recordStats = computed(() => {
    const records = props.record?.records || []
    const interviewer = records.filter(r => r.speaker === 'interviewer').length
    const candidate = records.filter(r => r.speaker === 'candidate').length

    return {
        total: records.length,
        interviewer,
        candidate
    }
})

// 问题数量（通过记录中面试官的发言数量估计）
const questionCount = computed(() => {
    return recordStats.value.interviewer
})
</script>

<style scoped>
.basic-info-container {
    .interviewer-tag {
        margin-right: 8px;
    }

    .interview-statistics {
        margin-top: 24px;

        h3 {
            margin: 0 0 16px 0;
            font-size: 16px;
            font-weight: 500;
        }

        .statistics-cards {
            display: flex;
            gap: 16px;

            .stat-card {
                flex: 1;

                .card-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .card-content {
                    padding: 8px 0;

                    .stat-value {
                        font-size: 28px;
                        font-weight: 500;
                        color: #409eff;
                        text-align: center;
                        margin-bottom: 12px;
                    }

                    .stat-detail {
                        .stat-item {
                            display: flex;
                            justify-content: space-between;
                            margin-bottom: 4px;

                            .label {
                                color: #606266;
                            }

                            .value {
                                font-weight: 500;
                            }
                        }
                    }
                }
            }
        }
    }
}
</style>