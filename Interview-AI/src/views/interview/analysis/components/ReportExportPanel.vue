<template>
    <div class="report-export-panel">
        <div class="panel-header">
            <h3 class="panel-title">面试报告导出</h3>
            <p class="panel-description">生成面试分析报告并选择导出格式</p>
        </div>

        <el-divider />

        <!-- 报告类型选择 -->
        <div class="report-section">
            <h4 class="section-title">报告类型</h4>
            <div class="report-types">
                <el-radio-group v-model="reportType" size="large">
                    <el-radio-button label="summary">
                        <el-tooltip content="包含关键摘要信息，适合快速查阅" placement="top">
                            <div class="radio-content">
                                <el-icon>
                                    <Document />
                                </el-icon>
                                <span>简要报告</span>
                            </div>
                        </el-tooltip>
                    </el-radio-button>
                    <el-radio-button label="standard">
                        <el-tooltip content="包含完整评估内容和图表分析" placement="top">
                            <div class="radio-content">
                                <el-icon>
                                    <DocumentCopy />
                                </el-icon>
                                <span>标准报告</span>
                            </div>
                        </el-tooltip>
                    </el-radio-button>
                    <el-radio-button label="detailed">
                        <el-tooltip content="包含所有面试内容和详细分析" placement="top">
                            <div class="radio-content">
                                <el-icon>
                                    <Tickets />
                                </el-icon>
                                <span>详细报告</span>
                            </div>
                        </el-tooltip>
                    </el-radio-button>
                </el-radio-group>
            </div>
        </div>

        <!-- 导出格式选择 -->
        <div class="report-section">
            <h4 class="section-title">导出格式</h4>
            <div class="export-formats">
                <el-radio-group v-model="exportFormat">
                    <el-radio label="pdf">
                        <div class="format-item">
                            <el-icon>
                                <Document />
                            </el-icon>
                            <span>PDF文档</span>
                        </div>
                    </el-radio>
                    <el-radio label="docx">
                        <div class="format-item">
                            <el-icon>
                                <Document />
                            </el-icon>
                            <span>Word文档</span>
                        </div>
                    </el-radio>
                    <el-radio label="html">
                        <div class="format-item">
                            <el-icon>
                                <Document />
                            </el-icon>
                            <span>HTML网页</span>
                        </div>
                    </el-radio>
                </el-radio-group>
            </div>
        </div>

        <!-- 报告内容选项 -->
        <div class="report-section">
            <h4 class="section-title">报告内容</h4>
            <div class="report-options">
                <el-checkbox-group v-model="reportOptions">
                    <el-checkbox label="basicInfo">基本信息</el-checkbox>
                    <el-checkbox label="evaluation">评估结果</el-checkbox>
                    <el-checkbox label="analysis">AI分析</el-checkbox>
                    <el-checkbox label="conversation">对话记录</el-checkbox>
                    <el-checkbox label="charts">数据图表</el-checkbox>
                    <el-checkbox label="notes">面试笔记</el-checkbox>
                </el-checkbox-group>
            </div>
        </div>

        <!-- 操作按钮 -->
        <div class="action-section">
            <el-button @click="previewReport" :disabled="generating">
                <el-icon>
                    <View />
                </el-icon>
                预览报告
            </el-button>
            <el-button type="primary" @click="exportReport" :loading="generating">
                <el-icon>
                    <Download />
                </el-icon>
                导出报告
            </el-button>
        </div>

        <!-- 预览对话框 -->
        <el-dialog v-model="previewVisible" title="报告预览" width="70%" fullscreen>
            <div v-if="previewLoading" class="preview-loading">
                <el-skeleton animated :rows="20" />
            </div>
            <div v-else class="report-preview">
                <div class="preview-header">
                    <h2>{{ interview?.title || '面试分析报告' }}</h2>
                    <div class="preview-meta">
                        <div class="meta-item">
                            <el-icon>
                                <User />
                            </el-icon>
                            <span>{{ interview?.candidateName || '未知候选人' }}</span>
                        </div>
                        <div class="meta-item">
                            <el-icon>
                                <Briefcase />
                            </el-icon>
                            <span>{{ interview?.position || '未知职位' }}</span>
                        </div>
                        <div class="meta-item">
                            <el-icon>
                                <Calendar />
                            </el-icon>
                            <span>{{ formatDate(interview?.date) }}</span>
                        </div>
                    </div>
                </div>

                <el-divider />

                <!-- 根据选项显示不同内容 -->
                <div v-if="reportOptions.includes('basicInfo')" class="preview-section">
                    <h3>基本信息</h3>
                    <div class="basic-info">
                        <div class="info-row">
                            <div class="info-label">面试类型：</div>
                            <div class="info-value">{{ getInterviewTypeText(interview?.type) }}</div>
                        </div>
                        <div class="info-row">
                            <div class="info-label">面试时长：</div>
                            <div class="info-value">{{ formatDuration(record?.duration) }}</div>
                        </div>
                        <div class="info-row">
                            <div class="info-label">面试官：</div>
                            <div class="info-value">{{ interview?.interviewer || '未知' }}</div>
                        </div>
                    </div>
                </div>

                <div v-if="reportOptions.includes('evaluation')" class="preview-section">
                    <h3>评估结果</h3>
                    <div class="evaluation-section">
                        <div class="overall-score">
                            <div class="score-label">综合评分</div>
                            <div class="score-value">{{ evaluation?.overallScore || 0 }}</div>
                        </div>
                        <div class="skill-scores">
                            <div v-for="(score, skill) in evaluation?.skillScores" :key="skill" class="skill-item">
                                <div class="skill-label">{{ getSkillName(skill) }}</div>
                                <el-progress :percentage="score * 20" :color="getScoreColor(score * 20)"
                                    :show-text="false" />
                                <div class="skill-value">{{ score }}/5</div>
                            </div>
                        </div>
                        <div class="recommendation">
                            <div class="recommendation-label">招聘建议：</div>
                            <el-tag :type="getRecommendationType(evaluation?.hiringRecommendation)">
                                {{ getRecommendationText(evaluation?.hiringRecommendation) }}
                            </el-tag>
                        </div>
                    </div>
                </div>

                <div v-if="reportOptions.includes('analysis')" class="preview-section">
                    <h3>AI分析</h3>
                    <div class="analysis-section">
                        <div class="analysis-strengths">
                            <h4>优势</h4>
                            <ul>
                                <li v-for="(item, index) in analysis?.strengths" :key="index">{{ item }}</li>
                            </ul>
                        </div>
                        <div class="analysis-weaknesses">
                            <h4>待提升方面</h4>
                            <ul>
                                <li v-for="(item, index) in analysis?.weaknesses" :key="index">{{ item }}</li>
                            </ul>
                        </div>
                        <div class="analysis-text">
                            <h4>技术能力分析</h4>
                            <p>{{ analysis?.technicalAnalysis }}</p>
                        </div>
                        <div class="analysis-text">
                            <h4>沟通能力分析</h4>
                            <p>{{ analysis?.communicationAnalysis }}</p>
                        </div>
                    </div>
                </div>

                <div v-if="reportOptions.includes('charts') && reportType !== 'summary'" class="preview-section">
                    <h3>数据图表</h3>
                    <div class="charts-section">
                        <div class="chart-container" style="height: 300px;">
                            <!-- 这里会在实际导出时渲染图表 -->
                            <div class="chart-placeholder">
                                <el-image src="https://via.placeholder.com/800x300?text=Skills+Radar+Chart"
                                    fit="contain" />
                            </div>
                        </div>
                    </div>
                </div>

                <div v-if="reportOptions.includes('conversation') && reportType === 'detailed'" class="preview-section">
                    <h3>对话记录</h3>
                    <div class="conversation-section">
                        <div v-for="(item, index) in record?.messages" :key="index" class="message-item"
                            :class="{ 'interviewer-message': item.role === 'interviewer', 'candidate-message': item.role === 'candidate' }">
                            <div class="message-sender">{{ item.role === 'interviewer' ? '面试官' : '候选人' }}</div>
                            <div class="message-content">{{ item.content }}</div>
                            <div class="message-time">{{ formatTime(item.timestamp) }}</div>
                        </div>
                    </div>
                </div>
            </div>

            <template #footer>
                <span class="dialog-footer">
                    <el-button @click="previewVisible = false">关闭</el-button>
                    <el-button type="primary" @click="exportReport">导出报告</el-button>
                </span>
            </template>
        </el-dialog>
    </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { Document, DocumentCopy, Tickets, Calendar, User, Briefcase, View, Download } from '@element-plus/icons-vue'
import { exportInterviewRecord, getInterviewEvaluation, getAIAnalysis } from '@/api/interview'

const props = defineProps({
    interviewId: {
        type: [String, Number],
        required: true
    },
    interview: {
        type: Object,
        default: null
    },
    record: {
        type: Object,
        default: null
    }
})

// 报告类型
const reportType = ref('standard')
// 导出格式
const exportFormat = ref('pdf')
// 报告选项
const reportOptions = ref(['basicInfo', 'evaluation', 'analysis', 'charts'])

// 状态变量
const generating = ref(false)
const previewVisible = ref(false)
const previewLoading = ref(false)

// 评估和分析数据
const evaluation = ref(null)
const analysis = ref(null)

// 格式化日期
const formatDate = (dateString) => {
    if (!dateString) return '未知日期'
    const date = new Date(dateString)
    return date.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })
}

// 格式化时间
const formatTime = (timestamp) => {
    if (!timestamp) return ''
    const date = new Date(timestamp)
    return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

// 格式化持续时间
const formatDuration = (seconds) => {
    if (!seconds) return '未知'
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    return `${hours}小时${minutes}分钟`
}

// 获取面试类型文本
const getInterviewTypeText = (type) => {
    const typeMap = {
        'screening': '初筛面试',
        'technical': '技术面试',
        'hr': 'HR面试',
        'final': '终面'
    }
    return typeMap[type] || type || '未知'
}

// 获取技能名称
const getSkillName = (skill) => {
    const skillMap = {
        'technical': '技术能力',
        'communication': '沟通表达',
        'problemSolving': '解决问题能力',
        'teamwork': '团队协作',
        'cultureFit': '文化匹配度',
        'learningAbility': '学习能力'
    }
    return skillMap[skill] || skill
}

// 获取分数颜色
const getScoreColor = (score) => {
    if (score >= 80) {
        return '#67c23a' // 好 - 绿色
    } else if (score >= 60) {
        return '#e6a23c' // 中 - 黄色
    } else {
        return '#f56c6c' // 差 - 红色
    }
}

// 获取推荐类型
const getRecommendationType = (type) => {
    const typeMap = {
        'hire': 'success',
        'consider': 'warning',
        'reject': 'danger'
    }
    return typeMap[type] || 'info'
}

// 获取推荐文本
const getRecommendationText = (type) => {
    const typeMap = {
        'hire': '建议录用',
        'consider': '需要考虑',
        'reject': '不建议录用'
    }
    return typeMap[type] || '未知'
}

// 加载评估数据
const loadEvaluationData = async () => {
    try {
        const { data } = await getInterviewEvaluation(props.interviewId)
        evaluation.value = data
    } catch (error) {
        console.error('获取评估数据失败:', error)
    }
}

// 加载AI分析数据
const loadAnalysisData = async () => {
    try {
        const { data } = await getAIAnalysis(props.interviewId)
        analysis.value = data
    } catch (error) {
        console.error('获取AI分析数据失败:', error)
    }
}

// 预览报告
const previewReport = async () => {
    if (!props.interviewId) {
        ElMessage.error('面试ID不存在')
        return
    }

    try {
        previewLoading.value = true
        previewVisible.value = true

        // 加载必要数据
        if (!evaluation.value) {
            await loadEvaluationData()
        }

        if (!analysis.value) {
            await loadAnalysisData()
        }
    } catch (error) {
        ElMessage.error('加载预览失败: ' + error.message)
    } finally {
        previewLoading.value = false
    }
}

// 导出报告
const exportReport = async () => {
    if (!props.interviewId) {
        ElMessage.error('面试ID不存在')
        return
    }

    try {
        generating.value = true

        // 准备导出参数
        const exportParams = {
            type: reportType.value,
            format: exportFormat.value,
            options: reportOptions.value
        }

        // 调用导出API
        const response = await exportInterviewRecord(props.interviewId, exportParams)

        // 创建下载链接
        const url = window.URL.createObjectURL(new Blob([response]))
        const link = document.createElement('a')
        link.href = url

        // 设置文件名
        const candidateName = props.interview?.candidateName || '未知候选人'
        const date = new Date().toISOString().slice(0, 10)
        const extension = exportFormat.value
        link.setAttribute('download', `面试分析报告_${candidateName}_${date}.${extension}`)

        // 触发下载
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)

        ElMessage.success('报告导出成功')
        previewVisible.value = false
    } catch (error) {
        ElMessage.error('导出失败: ' + error.message)
    } finally {
        generating.value = false
    }
}

// 组件挂载时加载数据
onMounted(async () => {
    if (props.interviewId) {
        await Promise.all([
            loadEvaluationData(),
            loadAnalysisData()
        ])
    }
})
</script>

<style scoped>
.report-export-panel {
    background-color: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
    padding: 20px;

    .panel-header {
        margin-bottom: 16px;

        .panel-title {
            margin: 0 0 8px 0;
            font-size: 18px;
            font-weight: 500;
        }

        .panel-description {
            margin: 0;
            color: #909399;
            font-size: 14px;
        }
    }

    .report-section {
        margin-bottom: 24px;

        .section-title {
            margin: 0 0 16px 0;
            font-size: 16px;
            font-weight: 500;
            color: #303133;
        }
    }

    .report-types {
        .radio-content {
            display: flex;
            align-items: center;
            gap: 5px;
        }
    }

    .export-formats {
        .format-item {
            display: flex;
            align-items: center;
            gap: 5px;
        }

        .el-radio {
            margin-right: 30px;
        }
    }

    .report-options {
        .el-checkbox {
            margin-right: 20px;
            margin-bottom: 10px;
        }
    }

    .action-section {
        display: flex;
        justify-content: flex-end;
        gap: 16px;
        margin-top: 24px;
    }
}

.report-preview {
    .preview-header {
        text-align: center;
        margin-bottom: 24px;

        h2 {
            margin: 0 0 12px 0;
        }

        .preview-meta {
            display: flex;
            justify-content: center;
            gap: 24px;

            .meta-item {
                display: flex;
                align-items: center;
                gap: 5px;
                color: #606266;
                font-size: 14px;
            }
        }
    }

    .preview-section {
        margin-bottom: 30px;

        h3 {
            font-size: 18px;
            font-weight: 500;
            margin: 0 0 16px 0;
            padding-bottom: 8px;
            border-bottom: 1px solid #ebeef5;
        }

        h4 {
            font-size: 16px;
            font-weight: 500;
            margin: 16px 0 8px 0;
        }
    }

    .basic-info {
        .info-row {
            display: flex;
            margin-bottom: 8px;

            .info-label {
                width: 100px;
                color: #606266;
            }
        }
    }

    .evaluation-section {
        .overall-score {
            text-align: center;
            margin-bottom: 24px;

            .score-label {
                font-size: 16px;
                margin-bottom: 8px;
            }

            .score-value {
                font-size: 48px;
                font-weight: bold;
            }
        }

        .skill-scores {
            margin-bottom: 24px;

            .skill-item {
                display: flex;
                align-items: center;
                margin-bottom: 12px;

                .skill-label {
                    width: 120px;
                }

                .el-progress {
                    flex: 1;
                    margin: 0 12px;
                }

                .skill-value {
                    width: 40px;
                    text-align: right;
                }
            }
        }

        .recommendation {
            display: flex;
            align-items: center;
            gap: 12px;
            justify-content: center;
        }
    }

    .analysis-section {

        .analysis-strengths,
        .analysis-weaknesses {
            margin-bottom: 16px;

            ul {
                margin: 0;
                padding-left: 20px;

                li {
                    margin-bottom: 8px;
                }
            }
        }

        .analysis-text {
            margin-bottom: 16px;

            p {
                margin: 0;
                line-height: 1.6;
                color: #606266;
            }
        }
    }

    .charts-section {
        .chart-container {
            margin-bottom: 24px;
        }
    }

    .conversation-section {
        .message-item {
            margin-bottom: 16px;
            padding: 12px;
            border-radius: 8px;

            .message-sender {
                font-weight: bold;
                margin-bottom: 6px;
            }

            .message-content {
                line-height: 1.6;
            }

            .message-time {
                font-size: 12px;
                color: #909399;
                margin-top: 6px;
                text-align: right;
            }

            &.interviewer-message {
                background-color: #f0f9eb;
                border-left: 3px solid #67c23a;
            }

            &.candidate-message {
                background-color: #f2f6fc;
                border-left: 3px solid #409eff;
            }
        }
    }

    .chart-placeholder {
        background-color: #f5f7fa;
        border-radius: 4px;
        height: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
    }
}

.preview-loading {
    padding: 20px;
}
</style>