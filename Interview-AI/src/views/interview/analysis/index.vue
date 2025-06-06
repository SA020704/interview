<template>
    <div class="interview-analysis-container">
        <div class="interview-header">
            <div class="interview-info">
                <h2 class="interview-title">{{ currentInterview?.title || '面试分析' }}</h2>
                <div class="interview-meta">
                    <el-tag v-if="currentInterview?.type">{{ getInterviewTypeText(currentInterview.type) }}</el-tag>
                    <span v-if="currentInterview?.candidateName">
                        <el-icon>
                            <User />
                        </el-icon> {{ currentInterview.candidateName }}
                    </span>
                    <span v-if="currentInterview?.position">
                        <el-icon>
                            <Briefcase />
                        </el-icon> {{ currentInterview.position }}
                    </span>
                    <span v-if="interviewRecord?.duration">
                        <el-icon>
                            <Timer />
                        </el-icon> {{ formatDuration(interviewRecord.duration) }}
                    </span>
                </div>
            </div>

            <div class="action-buttons">
                <el-button type="primary" @click="showExportPanel">
                    <el-icon>
                        <Download />
                    </el-icon>
                    <span class="button-text">导出分析报告</span>
                </el-button>
            </div>
        </div>

        <div class="interview-main">
            <el-tabs v-model="activeTab" type="border-card">
                <!-- 基本信息 -->
                <el-tab-pane label="基本信息" name="info">
                    <basic-info :interview="currentInterview" :record="interviewRecord" />
                </el-tab-pane>

                <!-- 对话记录 -->
                <el-tab-pane label="对话记录" name="conversation">
                    <conversation-records :interview-id="interviewId" :record="interviewRecord" />
                </el-tab-pane>

                <!-- 评估表单 -->
                <el-tab-pane label="评估表单" name="evaluation">
                    <evaluation-form :interview-id="interviewId" :interview="currentInterview" :record="interviewRecord"
                        @submit-success="handleEvaluationSubmitted" />
                </el-tab-pane>

                <!-- AI分析 -->
                <el-tab-pane label="AI分析" name="analysis">
                    <ai-analysis-panel :interview-id="interviewId" :record="interviewRecord" />
                </el-tab-pane>

                <!-- 面试笔记 -->
                <el-tab-pane label="面试笔记" name="notes">
                    <interview-notes :interview-id="interviewId" />
                </el-tab-pane>

                <!-- 质量分析 -->
                <!-- <el-tab-pane label="质量分析" name="quality">
                    <interview-quality-analysis :interview-id="interviewId" :record="interviewRecord" />
                </el-tab-pane> -->
            </el-tabs>
        </div>

        <!-- 导出面板对话框 -->
        <el-dialog v-model="exportPanelVisible" title="导出面试报告" width="800px" destroy-on-close class="export-dialog">
            <report-export-panel :interview-id="interviewId" :interview="currentInterview" :record="interviewRecord" />
        </el-dialog>
    </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { User, Briefcase, Timer, Download } from '@element-plus/icons-vue'
import { useInterviewStore } from '@/store/modules/interview'
import { getInterviewRecords, exportInterviewRecord } from '@/api/interview'
import BasicInfo from './components/BasicInfo.vue'
import ConversationRecords from './components/ConversationRecords.vue'
import AIAnalysisPanel from './components/AIAnalysisPanel.vue'
import EvaluationForm from './components/EvaluationForm.vue'
import InterviewNotes from './components/InterviewNotes.vue'
import InterviewQualityAnalysis from './components/InterviewQualityAnalysis.vue'
import ReportExportPanel from './components/ReportExportPanel.vue'

// 路由
const route = useRoute()
const router = useRouter()

// Store
const interviewStore = useInterviewStore()

// 状态
const interviewId = ref(route.params.id)
const currentInterview = ref(null)
const interviewRecord = ref(null)
const activeTab = ref('info')
const loading = ref(false)
const exportPanelVisible = ref(false)

// 获取面试类型文本
const getInterviewTypeText = (type) => {
    const typeMap = {
        'screening': '初筛面试',
        'technical': '技术面试',
        'hr': 'HR面试',
        'final': '终面'
    }
    return typeMap[type] || type
}

// 格式化持续时间
const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)

    return `${hours}小时${minutes}分钟`
}

// 显示导出面板
const showExportPanel = () => {
    exportPanelVisible.value = true
}

// 评估提交成功处理
const handleEvaluationSubmitted = () => {
    ElMessage.success('评估提交成功')
    activeTab.value = 'analysis' // 切换到分析面板
}

// 获取面试详情和记录
const fetchData = async () => {
    loading.value = true
    try {
        // 获取面试详情
        if (interviewId.value) {
            await interviewStore.fetchInterviewDetail(interviewId.value)
            currentInterview.value = interviewStore.currentInterview
        } else {
            // 如果没有ID，显示错误
            ElMessage.error('面试ID不存在')
            router.push('/interview/preparation')
            return
        }

        // 获取面试记录
        const { data } = await getInterviewRecords(interviewId.value)
        interviewRecord.value = data

        // 如果状态不是完成状态，提示用户
        if (currentInterview.value.status !== 'completed') {
            ElMessage.warning('此面试尚未完成，部分功能可能不可用')
        }
    } catch (error) {
        ElMessage.error('获取数据失败：' + error.message)
    } finally {
        loading.value = false
    }
}

// 初始化
onMounted(() => {
    fetchData()
})
</script>

<style scoped>
.interview-analysis-container {
    height: 100%;
    display: flex;
    flex-direction: column;
}

.interview-header {
    background-color: #fff;
    padding: 16px 20px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-radius: 4px;
    margin-bottom: 16px;
}

.interview-info .interview-title {
    margin: 0 0 8px 0;
    font-size: 18px;
}

.interview-info .interview-meta {
    display: flex;
    align-items: center;
    gap: 16px;
    color: #606266;
    font-size: 14px;
}

.interview-meta span {
    display: flex;
    align-items: center;
    gap: 4px;
}

.interview-meta span .el-icon {
    font-size: 16px;
}

.interview-main {
    flex: 1;
    overflow: hidden;
}

:deep(.el-tabs) {
    height: 100%;
}

:deep(.el-tabs__content) {
    padding: 20px;
    height: calc(100% - 39px);
    overflow: auto;
}

/* 移动端适配样式 */
@media (max-width: 768px) {
    .interview-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 12px;
    }

    .interview-info .interview-meta {
        flex-wrap: wrap;
        gap: 8px;
    }

    .action-buttons {
        width: 100%;
    }

    .action-buttons .el-button {
        width: 100%;
    }

    :deep(.el-tabs__nav) {
        width: 100%;
        display: flex;
    }

    :deep(.el-tabs__item) {
        flex: 1;
        text-align: center;
        padding: 0 5px;
    }
}

/* 小屏幕手机进一步优化 */
@media (max-width: 480px) {
    .interview-header {
        padding: 12px;
    }

    .interview-info .interview-title {
        font-size: 16px;
    }

    .interview-info .interview-meta {
        font-size: 12px;
    }

    :deep(.el-tabs__nav) {
        transform: scale(0.9);
    }

    :deep(.el-tabs__content) {
        padding: 12px;
    }

    .button-text {
        display: none;
    }

    .action-buttons .el-button .el-icon {
        margin-right: 0;
    }

    /* 对话框适配 */
    :deep(.export-dialog .el-dialog) {
        width: 95% !important;
        margin: 0 auto;
    }
}
</style>