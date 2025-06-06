<template>
    <div class="analysis-panel">
        <div v-if="loading" class="analysis-loading">
            <div class="loading-animation">
                <el-icon class="loading-icon">
                    <Loading />
                </el-icon>
                <span>AI正在分析面试对话...</span>
            </div>
            <div class="thinking-indicators">
                <div class="thinking-bubble" v-for="(item, index) in 3" :key="index">
                    <span v-for="(dot, dotIndex) in 3" :key="dotIndex" class="dot"></span>
                </div>
            </div>
        </div>

        <div v-else class="analysis-content">
            <!-- 核心评估指标 -->
            <div class="analysis-metrics">
                <div class="metric-header">
                    <h4>实时评估指标</h4>
                    <el-tooltip content="基于当前面试对话的实时评估，评分将随着面试进行动态变化">
                        <el-icon>
                            <InfoFilled />
                        </el-icon>
                    </el-tooltip>
                </div>

                <div class="metrics-grid">
                    <div v-for="(metric, index) in displayMetrics" :key="index" class="metric-item">
                        <div class="metric-label">{{ metric.label }}</div>
                        <el-progress :percentage="metric.value" :color="getMetricColor(metric.value, metric.type)"
                            :status="getMetricStatus(metric.value, metric.type)" :stroke-width="8" :show-text="false" />
                        <div class="metric-value">{{ metric.value }}%</div>
                    </div>
                </div>
            </div>

            <!-- 对话分析 -->
            <div class="dialogue-analysis">
                <div class="section-header">
                    <h4>对话分析</h4>
                    <el-tag size="small" effect="plain" type="warning"
                        v-if="analysis.insights && analysis.insights.length">
                        {{ analysis.insights.length }}个关键洞察
                    </el-tag>
                </div>

                <div class="analysis-insights" v-if="analysis.insights && analysis.insights.length">
                    <div v-for="(insight, index) in analysis.insights" :key="index" class="insight-item">
                        <div class="insight-icon">
                            <el-icon :color="getInsightColor(insight.type)">
                                <component :is="getInsightIcon(insight.type)" />
                            </el-icon>
                        </div>
                        <div class="insight-content">
                            <div class="insight-title">{{ insight.title }}</div>
                            <div class="insight-description">{{ insight.description }}</div>
                        </div>
                    </div>
                </div>
                <el-empty v-else description="随着面试的进行，分析将会出现在这里" />
            </div>

            <!-- 关键词分析 -->
            <div class="keyword-analysis">
                <div class="section-header">
                    <h4>关键词分析</h4>
                </div>

                <div class="keyword-cloud" v-if="analysis.keywords && analysis.keywords.length">
                    <div v-for="(keyword, index) in analysis.keywords" :key="index" class="keyword-item" :style="{
                        fontSize: `${Math.max(12, Math.min(20, 12 + keyword.weight * 8))}px`,
                        opacity: 0.6 + keyword.weight * 0.4
                    }">
                        {{ keyword.text }}
                    </div>
                </div>
                <el-empty v-else description="关键词将随面试进行出现" />
            </div>

            <!-- 建议 -->
            <div class="suggestions-section">
                <div class="section-header">
                    <h4>面试官指导</h4>
                </div>

                <div class="suggestions-list" v-if="analysis.suggestions && analysis.suggestions.length">
                    <div v-for="(suggestion, index) in analysis.suggestions" :key="index" class="suggestion-item">
                        <el-icon>
                            <ArrowRight />
                        </el-icon>
                        <span>{{ suggestion }}</span>
                    </div>
                </div>
                <el-empty v-else description="建议将随面试进行提供" />
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import {
    InfoFilled,
    Loading,
    WarningFilled,
    SuccessFilled,
    ArrowRight,
    Star,
    ChatLineSquare,
    Bell,
    CircleCheck,

} from '@element-plus/icons-vue'

// 定义属性
const props = defineProps({
    analysis: {
        type: Object,
        default: () => ({
            metrics: [],
            insights: [],
            keywords: [],
            suggestions: []
        })
    },
    loading: {
        type: Boolean,
        default: false
    }
})

// 内部状态
const simulatedLoading = ref(true)

// 计算属性 - 展示指标
const displayMetrics = computed(() => {
    if (!props.analysis.metrics || props.analysis.metrics.length === 0) {
        // 没有真实数据时显示模拟数据
        return [
            { label: '问题覆盖率', value: 65, type: 'coverage' },
            { label: '答案深度', value: 78, type: 'depth' },
            { label: '问答质量', value: 82, type: 'quality' },
            { label: '问题技巧', value: 70, type: 'technique' }
        ]
    }
    return props.analysis.metrics
})

// 获取指标颜色
const getMetricColor = (value, type) => {
    // 某些指标类型可能有不同的颜色范围
    if (type === 'coverage' || type === 'technique') {
        if (value < 50) return '#F56C6C' // 红色
        if (value < 75) return '#E6A23C' // 黄色
        return '#67C23A' // 绿色
    }

    // 默认颜色范围
    if (value < 40) return '#F56C6C' // 红色
    if (value < 70) return '#E6A23C' // 黄色
    return '#67C23A' // 绿色
}

// 获取指标状态
const getMetricStatus = (value, type) => {
    if (type === 'coverage' || type === 'technique') {
        if (value < 50) return 'exception'
        if (value < 75) return 'warning'
        return 'success'
    }

    if (value < 40) return 'exception'
    if (value < 70) return 'warning'
    return 'success'
}

// 获取洞察图标
const getInsightIcon = (type) => {
    const iconMap = {
        'warning': 'WarningFilled',
        'success': 'SuccessFilled',
        'info': 'InfoFilled',
        'suggestion': 'Light',
        'highlight': 'Star',
        'conversation': 'ChatLineSquare'
    }
    return iconMap[type] || 'InfoFilled'
}

// 获取洞察颜色
const getInsightColor = (type) => {
    const colorMap = {
        'warning': '#F56C6C',
        'success': '#67C23A',
        'info': '#909399',
        'suggestion': '#E6A23C',
        'highlight': '#409EFF',
        'conversation': '#909399'
    }
    return colorMap[type] || '#909399'
}

// 模拟加载完成
onMounted(() => {
    setTimeout(() => {
        simulatedLoading.value = false
    }, 2000)
})
</script>

<style lang="scss" scoped>
.analysis-panel {
    height: 100%;
    overflow-y: auto;
    padding: 16px;

    .analysis-loading {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 300px;

        .loading-animation {
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 24px;

            .loading-icon {
                font-size: 24px;
                color: #409EFF;
                animation: rotate 2s linear infinite;
            }

            span {
                font-size: 16px;
                color: #606266;
            }
        }

        .thinking-indicators {
            display: flex;
            gap: 16px;

            .thinking-bubble {
                display: flex;
                gap: 3px;

                .dot {
                    width: 8px;
                    height: 8px;
                    border-radius: 50%;
                    background-color: #DCDFE6;
                    animation: pulse 1.5s infinite;

                    &:nth-child(2) {
                        animation-delay: 0.5s;
                    }

                    &:nth-child(3) {
                        animation-delay: 1s;
                    }
                }
            }
        }
    }

    .analysis-content {

        .analysis-metrics,
        .dialogue-analysis,
        .keyword-analysis,
        .suggestions-section {
            margin-bottom: 24px;
            background-color: #fff;
            border-radius: 8px;
            padding: 16px;
            box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
        }

        .metric-header,
        .section-header {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-bottom: 16px;

            h4 {
                margin: 0;
                font-size: 16px;
                font-weight: 500;
                color: #303133;
            }
        }

        .metrics-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 16px;

            .metric-item {
                .metric-label {
                    font-size: 14px;
                    margin-bottom: 4px;
                    color: #606266;
                }

                .metric-value {
                    font-size: 14px;
                    text-align: right;
                    color: #606266;
                    margin-top: 4px;
                }
            }
        }

        .analysis-insights {
            .insight-item {
                display: flex;
                gap: 12px;
                margin-bottom: 16px;
                padding-bottom: 16px;
                border-bottom: 1px solid #EBEEF5;

                &:last-child {
                    margin-bottom: 0;
                    padding-bottom: 0;
                    border-bottom: none;
                }

                .insight-icon {
                    font-size: 18px;
                    margin-top: 2px;
                }

                .insight-content {
                    flex: 1;

                    .insight-title {
                        font-weight: 500;
                        margin-bottom: 4px;
                        color: #303133;
                    }

                    .insight-description {
                        font-size: 14px;
                        color: #606266;
                        line-height: 1.5;
                    }
                }
            }
        }

        .keyword-cloud {
            display: flex;
            flex-wrap: wrap;
            gap: 12px;
            padding: 8px;

            .keyword-item {
                padding: 4px 8px;
                background-color: #f5f7fa;
                border-radius: 4px;
                color: #303133;
            }
        }

        .suggestions-list {
            .suggestion-item {
                display: flex;
                align-items: flex-start;
                gap: 8px;
                margin-bottom: 12px;
                padding-bottom: 12px;
                border-bottom: 1px solid #EBEEF5;

                &:last-child {
                    margin-bottom: 0;
                    padding-bottom: 0;
                    border-bottom: none;
                }

                .el-icon {
                    margin-top: 3px;
                    color: #409EFF;
                }

                span {
                    flex: 1;
                    font-size: 14px;
                    line-height: 1.5;
                    color: #606266;
                }
            }
        }
    }
}

@keyframes rotate {
    from {
        transform: rotate(0deg);
    }

    to {
        transform: rotate(360deg);
    }
}

@keyframes pulse {
    0% {
        transform: scale(1);
        opacity: 0.3;
    }

    50% {
        transform: scale(1.2);
        opacity: 0.9;
    }

    100% {
        transform: scale(1);
        opacity: 0.3;
    }
}
</style>