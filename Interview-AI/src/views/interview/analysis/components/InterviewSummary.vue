<template>
    <div class="interview-summary">
        <div v-if="loading" class="loading-container">
            <el-skeleton animated :rows="15" />
        </div>
        <template v-else>
            <div class="summary-controls">
                <div class="summary-type-selector">
                    <span class="selector-label">摘要类型:</span>
                    <el-radio-group v-model="summaryType" size="small" @change="fetchSummary">
                        <el-radio-button label="executive">执行摘要</el-radio-button>
                        <el-radio-button label="detailed">详细摘要</el-radio-button>
                        <el-radio-button label="full">完整问答</el-radio-button>
                    </el-radio-group>
                </div>
                <el-button type="primary" size="small" @click="generateSummary" :loading="generating">
                    <el-icon>
                        <RefreshRight />
                    </el-icon>
                    重新生成
                </el-button>
            </div>

            <el-divider />

            <div v-if="!summary" class="empty-summary">
                <el-empty description="暂无面试摘要" :image-size="100">
                    <template #extra>
                        <el-button type="primary" @click="generateSummary" :loading="generating">生成摘要</el-button>
                    </template>
                </el-empty>
            </div>
            <div v-else class="summary-content">
                <!-- 摘要导航 -->
                <div class="summary-navigator">
                    <div class="nav-list">
                        <div class="nav-item active">
                            <el-icon>
                                <Document />
                            </el-icon>
                            <span>摘要</span>
                        </div>
                        <div class="nav-item">
                            <el-icon>
                                <PieChart />
                            </el-icon>
                            <span>话题分布</span>
                        </div>
                        <div class="nav-item">
                            <el-icon>
                                <Star />
                            </el-icon>
                            <span>亮点</span>
                        </div>
                        <div class="nav-item">
                            <el-icon>
                                <Warning />
                            </el-icon>
                            <span>关注点</span>
                        </div>
                        <div class="nav-item">
                            <el-icon>
                                <Compass />
                            </el-icon>
                            <span>建议</span>
                        </div>
                    </div>
                </div>

                <!-- 执行摘要 -->
                <div class="executive-summary">
                    <div class="summary-section">
                        <h3 class="section-title">执行摘要</h3>
                        <div class="summary-card">
                            <p>{{ summary.executiveSummary }}</p>
                        </div>
                    </div>
                </div>

                <!-- 详细摘要 -->
                <div v-if="summaryType !== 'executive'" class="detailed-summary">
                    <div class="summary-section">
                        <h3 class="section-title">详细摘要</h3>
                        <el-collapse>
                            <el-collapse-item title="面试概述" name="overview">
                                <p>{{ summary.detailedSummary.overview }}</p>
                            </el-collapse-item>
                            <el-collapse-item title="技术能力评估" name="technical">
                                <p>{{ summary.detailedSummary.technical }}</p>
                            </el-collapse-item>
                            <el-collapse-item title="项目经验评估" name="experience">
                                <p>{{ summary.detailedSummary.experience }}</p>
                            </el-collapse-item>
                            <el-collapse-item title="软技能评估" name="softSkills">
                                <p>{{ summary.detailedSummary.softSkills }}</p>
                            </el-collapse-item>
                            <el-collapse-item title="文化匹配度" name="cultureFit">
                                <p>{{ summary.detailedSummary.cultureFit }}</p>
                            </el-collapse-item>
                        </el-collapse>
                    </div>
                </div>

                <!-- 话题分布 -->
                <div class="summary-section">
                    <h3 class="section-title">话题分布</h3>
                    <div class="chart-container" style="height: 300px;">
                        <visualization-charts chart-type="pie" :chart-data="topicDistributionData" title="面试话题分布"
                            height="300px" :loading="!summary" />
                    </div>
                </div>

                <!-- 亮点与关注点 -->
                <div class="highlights-concerns">
                    <el-row :gutter="20">
                        <el-col :span="12">
                            <div class="summary-section">
                                <h3 class="section-title">亮点</h3>
                                <div class="highlights-list">
                                    <div v-for="(highlight, index) in summary.keyHighlights" :key="index"
                                        class="highlight-item">
                                        <el-icon>
                                            <StarFilled />
                                        </el-icon>
                                        <span>{{ highlight }}</span>
                                    </div>
                                </div>
                            </div>
                        </el-col>
                        <el-col :span="12">
                            <div class="summary-section">
                                <h3 class="section-title">关注点</h3>
                                <div class="concerns-list">
                                    <div v-for="(concern, index) in summary.concerns" :key="index" class="concern-item">
                                        <el-icon>
                                            <WarningFilled />
                                        </el-icon>
                                        <span>{{ concern }}</span>
                                    </div>
                                </div>
                            </div>
                        </el-col>
                    </el-row>
                </div>

                <!-- 录用建议 -->
                <div class="recommendations-section">
                    <div class="summary-section">
                        <h3 class="section-title">录用建议</h3>
                        <div class="recommendation-box"
                            :class="getRecommendationClass(summary.recommendations.hiring.decision)">
                            <div class="recommendation-level">
                                <el-tag :type="getRecommendationType(summary.recommendations.hiring.decision)"
                                    effect="dark">
                                    {{ getRecommendationText(summary.recommendations.hiring.decision) }}
                                </el-tag>
                            </div>
                            <div class="recommendation-reason">
                                {{ summary.recommendations.hiring.reason }}
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 后续步骤 -->
                <div class="summary-section">
                    <h3 class="section-title">后续步骤</h3>
                    <div class="next-steps">
                        <div v-for="(step, index) in summary.recommendations.nextSteps" :key="index" class="step-item">
                            <div class="step-number">{{ index + 1 }}</div>
                            <div class="step-content">{{ step }}</div>
                        </div>
                    </div>
                </div>

                <!-- 完整问答 -->
                <div v-if="summaryType === 'full'" class="full-qa-section">
                    <div class="summary-section">
                        <h3 class="section-title">完整问答记录</h3>
                        <div v-if="record?.messages" class="qa-list">
                            <div v-for="(message, index) in record.messages" :key="index" class="qa-item"
                                :class="{ 'interviewer-message': message.role === 'interviewer', 'candidate-message': message.role === 'candidate' }">
                                <div class="message-sender">{{ message.role === 'interviewer' ? '面试官' : '候选人' }}</div>
                                <div class="message-content">{{ message.content }}</div>
                                <div class="message-time">{{ formatTime(message.timestamp) }}</div>
                            </div>
                        </div>
                        <el-empty v-else description="暂无完整问答记录" />
                    </div>
                </div>
            </div>
        </template>
    </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { RefreshRight, Document, PieChart, Star, Warning, Compass, StarFilled, WarningFilled } from '@element-plus/icons-vue'
import VisualizationCharts from '@/components/VisualizationCharts.vue'
import { getInterviewSummary } from '@/api/interview'

const props = defineProps({
    interviewId: {
        type: [String, Number],
        required: true
    },
    record: {
        type: Object,
        default: null
    }
})

// 状态
const loading = ref(false)
const generating = ref(false)
const summaryType = ref('detailed')
const summary = ref(null)

// 格式化时间
const formatTime = (timestamp) => {
    if (!timestamp) return ''
    const date = new Date(timestamp)
    return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

// 获取录用建议类型
const getRecommendationType = (decision) => {
    const typeMap = {
        'strong_hire': 'success',
        'hire': 'success',
        'consider': 'warning',
        'reject': 'danger',
        'strong_reject': 'danger'
    }
    return typeMap[decision] || 'info'
}

// 获取录用建议文本
const getRecommendationText = (decision) => {
    const textMap = {
        'strong_hire': '强烈推荐录用',
        'hire': '推荐录用',
        'consider': '考虑录用',
        'reject': '不推荐录用',
        'strong_reject': '强烈不推荐录用'
    }
    return textMap[decision] || '未知'
}

// 获取录用建议样式类
const getRecommendationClass = (decision) => {
    const classMap = {
        'strong_hire': 'recommendation-strong-hire',
        'hire': 'recommendation-hire',
        'consider': 'recommendation-consider',
        'reject': 'recommendation-reject',
        'strong_reject': 'recommendation-strong-reject'
    }
    return classMap[decision] || ''
}

// 话题分布数据
const topicDistributionData = computed(() => {
    if (!summary.value) return { data: [] }

    const { topics, percentage } = summary.value.topicDistribution
    return {
        data: topics.map((topic, index) => ({
            name: topic,
            value: percentage[index]
        }))
    }
})

// 获取面试摘要
const fetchSummary = async () => {
    if (!props.interviewId) return

    try {
        loading.value = true
        const { data } = await getInterviewSummary(props.interviewId, { type: summaryType.value })
        summary.value = data
    } catch (error) {
        ElMessage.error('获取面试摘要失败: ' + error.message)
    } finally {
        loading.value = false
    }
}

// 生成摘要
const generateSummary = async () => {
    if (!props.interviewId) {
        ElMessage.error('面试ID不存在')
        return
    }

    try {
        generating.value = true
        await fetchSummary()
        ElMessage.success('摘要生成成功')
    } catch (error) {
        ElMessage.error('生成摘要失败: ' + error.message)
    } finally {
        generating.value = false
    }
}

// 组件挂载时获取数据
onMounted(() => {
    fetchSummary()
})
</script>

<style scoped>
.interview-summary {
    background-color: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
    padding: 20px;

    .loading-container {
        padding: 20px;
    }

    .summary-controls {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;

        .summary-type-selector {
            display: flex;
            align-items: center;
            gap: 10px;

            .selector-label {
                color: #606266;
            }
        }
    }

    .empty-summary {
        padding: 40px 0;
    }

    .summary-content {
        .summary-navigator {
            margin-bottom: 20px;

            .nav-list {
                display: flex;
                gap: 12px;
                border-bottom: 1px solid #ebeef5;
                padding-bottom: 12px;

                .nav-item {
                    display: flex;
                    align-items: center;
                    gap: 5px;
                    padding: 8px 12px;
                    border-radius: 4px;
                    cursor: pointer;
                    color: #606266;

                    &:hover {
                        background-color: #f5f7fa;
                    }

                    &.active {
                        color: #409eff;
                        background-color: #ecf5ff;
                    }
                }
            }
        }

        .summary-section {
            margin-bottom: 30px;

            .section-title {
                font-size: 18px;
                font-weight: 500;
                margin-bottom: 16px;
                padding-bottom: 8px;
                border-bottom: 1px solid #ebeef5;
            }

            .summary-card {
                background-color: #f5f7fa;
                padding: 16px;
                border-radius: 8px;
                line-height: 1.6;
            }
        }

        .executive-summary {
            .summary-card {
                font-size: 16px;
                font-weight: 500;
            }
        }

        .detailed-summary {
            p {
                line-height: 1.6;
                margin: 0;
            }
        }

        .highlights-list,
        .concerns-list {

            .highlight-item,
            .concern-item {
                display: flex;
                align-items: flex-start;
                margin-bottom: 12px;
                background-color: #f5f7fa;
                padding: 12px;
                border-radius: 8px;

                .el-icon {
                    margin-right: 8px;
                    margin-top: 3px;
                    flex-shrink: 0;
                }

                span {
                    flex: 1;
                    line-height: 1.5;
                }
            }

            .highlight-item {
                border-left: 3px solid #67c23a;

                .el-icon {
                    color: #67c23a;
                }
            }

            .concern-item {
                border-left: 3px solid #e6a23c;

                .el-icon {
                    color: #e6a23c;
                }
            }
        }

        .recommendation-box {
            padding: 16px;
            border-radius: 8px;
            margin-bottom: 16px;

            &.recommendation-strong-hire,
            &.recommendation-hire {
                background-color: #f0f9eb;
                border-left: 3px solid #67c23a;
            }

            &.recommendation-consider {
                background-color: #fdf6ec;
                border-left: 3px solid #e6a23c;
            }

            &.recommendation-reject,
            &.recommendation-strong-reject {
                background-color: #fef0f0;
                border-left: 3px solid #f56c6c;
            }

            .recommendation-level {
                margin-bottom: 12px;
            }

            .recommendation-reason {
                line-height: 1.6;
            }
        }

        .next-steps {
            .step-item {
                display: flex;
                margin-bottom: 16px;

                .step-number {
                    width: 24px;
                    height: 24px;
                    border-radius: 50%;
                    background-color: #409eff;
                    color: white;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    margin-right: 12px;
                    flex-shrink: 0;
                }

                .step-content {
                    flex: 1;
                    padding-top: 3px;
                }
            }
        }

        .qa-list {
            .qa-item {
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
    }
}
</style>