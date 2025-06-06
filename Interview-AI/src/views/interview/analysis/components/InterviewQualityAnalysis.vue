<template>
    <div class="interview-quality-analysis">
        <div v-if="loading" class="loading-container">
            <el-skeleton animated :rows="15" />
        </div>
        <template v-else>
            <div class="analysis-header">
                <h3 class="analysis-title">面试质量分析</h3>
                <el-button @click="generateAnalysis" :loading="generating" size="small">
                    <el-icon>
                        <RefreshRight />
                    </el-icon>
                    重新生成分析
                </el-button>
            </div>

            <el-divider />

            <el-tabs v-model="activeTab" class="quality-tabs">
                <!-- 面试覆盖度分析 -->
                <el-tab-pane label="覆盖度分析" name="coverage">
                    <div class="coverage-analysis">
                        <div class="analysis-section">
                            <div class="chart-title">评估维度覆盖度</div>
                            <div class="chart-container" style="height: 300px;">
                                <visualization-charts chart-type="radar" :chart-data="dimensionCoverageData"
                                    title="评估维度覆盖度" height="300px" :loading="!qualityData" />
                            </div>
                            <div class="explanation-card">
                                <h4>分析解读</h4>
                                <p>{{ qualityData?.coverage?.explanation ||
                                    '此面试评估维度覆盖较为全面，各主要能力维度均有涉及。技术能力和问题解决能力的覆盖度最高，而文化匹配和团队协作方面的覆盖度较低，建议在后续面试中多关注这些方面。' }}
                                </p>
                            </div>
                        </div>

                        <div class="analysis-section">
                            <div class="chart-title">问题类型分布</div>
                            <div class="chart-container" style="height: 300px;">
                                <visualization-charts chart-type="pie" :chart-data="questionTypeData" title="问题类型分布"
                                    height="300px" :loading="!qualityData" />
                            </div>
                        </div>

                        <div class="time-allocation-section">
                            <h3 class="section-title">时间分配分析</h3>
                            <div class="time-chart-container">
                                <div class="chart-wrapper" style="height: 300px;">
                                    <visualization-charts chart-type="bar" :chart-data="timeAllocationData"
                                        title="面试时间分配" height="300px" :loading="loading" />
                                </div>
                                <div class="time-analysis">
                                    <div class="analysis-card">
                                        <div class="card-header">
                                            <el-icon>
                                                <Timer />
                                            </el-icon>
                                            <span>时间利用率</span>
                                        </div>
                                        <div class="card-body">
                                            <div class="efficiency-meter">
                                                <el-progress type="dashboard"
                                                    :percentage="qualityAnalysis?.timeEfficiency"
                                                    :color="getEfficiencyColor(qualityAnalysis?.timeEfficiency)"
                                                    :width="100">
                                                    <template #default>
                                                        <div class="progress-value">
                                                            <div class="value">{{ qualityAnalysis?.timeEfficiency }}%
                                                            </div>
                                                            <div class="label">效率</div>
                                                        </div>
                                                    </template>
                                                </el-progress>
                                            </div>
                                            <div class="efficiency-insights">
                                                <div class="insight-item"
                                                    v-for="(insight, index) in qualityAnalysis.timeInsights"
                                                    :key="index">
                                                    <el-icon color="#409EFF">
                                                        <InfoFilled />
                                                    </el-icon>
                                                    <span>{{ insight }}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="coverage-analysis-section">
                            <h3 class="section-title">问题覆盖度分析</h3>
                            <div class="coverage-content">
                                <div class="radar-chart" style="height: 350px; width: 100%;">
                                    <visualization-charts chart-type="radar" :chart-data="coverageRadarData"
                                        title="技能评估覆盖度" height="350px" :loading="loading" />
                                </div>
                                <div class="coverage-stats">
                                    <div class="stat-item" v-for="(stat, key) in qualityAnalysis.coverage" :key="key">
                                        <div class="stat-label">{{ getCoverageLabel(key) }}</div>
                                        <el-progress :percentage="stat.percentage"
                                            :color="getCoverageColor(stat.percentage)"
                                            :format="() => `${stat.count}/${stat.total}`" />
                                        <div class="stat-description">{{ stat.description }}</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="improvement-section">
                            <h4>改进建议</h4>
                            <el-card class="improvement-card">
                                <template #header>
                                    <div class="card-header">
                                        <span>覆盖度提升建议</span>
                                    </div>
                                </template>
                                <div class="improvement-list">
                                    <div v-for="(item, index) in qualityData?.coverage?.suggestions" :key="index"
                                        class="improvement-item">
                                        <el-icon>
                                            <ArrowRight />
                                        </el-icon>
                                        <span>{{ item }}</span>
                                    </div>
                                </div>
                            </el-card>
                        </div>
                    </div>
                </el-tab-pane>

                <!-- 面试官表现评估 -->
                <el-tab-pane label="面试官表现" name="interviewer">
                    <div class="interviewer-analysis">
                        <div class="analysis-section">
                            <div class="chart-title">提问质量评估</div>
                            <div class="chart-container" style="height: 300px;">
                                <visualization-charts chart-type="radar" :chart-data="interviewerPerformanceData"
                                    title="面试官表现雷达图" height="300px" :loading="!qualityData" />
                            </div>
                            <div class="explanation-card">
                                <h4>分析解读</h4>
                                <p>{{ qualityData?.interviewer?.explanation ||
                                    '面试官在问题清晰度和深入挖掘能力方面表现出色，能够引导面试向深层次进行。在控制节奏和总结反馈方面有提升空间，可以通过更好地掌控面试流程和提供及时反馈来提高面试效果。'
                                    }}</p>
                            </div>
                        </div>

                        <div class="analysis-section">
                            <div class="chart-title">问题分布时间线</div>
                            <div class="chart-container" style="height: 300px;">
                                <visualization-charts chart-type="line" :chart-data="questionDistributionData"
                                    title="问题分布时间线" height="300px" :loading="!qualityData" />
                            </div>
                        </div>

                        <div class="interviewer-performance-section">
                            <h3 class="section-title">面试官表现</h3>
                            <div class="interviewer-metrics">
                                <div class="metric-card" v-for="(metric, key) in qualityAnalysis.interviewerPerformance"
                                    :key="key">
                                    <div class="metric-header">
                                        <div class="metric-title">{{ getPerformanceMetricLabel(key) }}</div>
                                        <div class="metric-score">
                                            <el-rate v-model="metric.score" disabled show-score text-color="#909399"
                                                score-template="{value}" />
                                        </div>
                                    </div>
                                    <div class="metric-insights">
                                        <div class="insight-item" v-for="(insight, index) in metric.insights"
                                            :key="index">
                                            <el-icon :color="getInsightColor(insight.type)">
                                                <component :is="getInsightIcon(insight.type)" />
                                            </el-icon>
                                            <span>{{ insight.content }}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="improvement-section">
                            <h4>改进建议</h4>
                            <el-card class="improvement-card">
                                <template #header>
                                    <div class="card-header">
                                        <span>面试技巧提升建议</span>
                                    </div>
                                </template>
                                <div class="improvement-list">
                                    <div v-for="(item, index) in qualityData?.interviewer?.suggestions" :key="index"
                                        class="improvement-item">
                                        <el-icon>
                                            <ArrowRight />
                                        </el-icon>
                                        <span>{{ item }}</span>
                                    </div>
                                </div>
                            </el-card>
                        </div>
                    </div>
                </el-tab-pane>

                <!-- 面试效率分析 -->
                <el-tab-pane label="效率分析" name="efficiency">
                    <div class="efficiency-analysis">
                        <div class="analysis-section">
                            <div class="metrics-title">面试效率指标</div>
                            <div class="metrics-container">
                                <el-row :gutter="20">
                                    <el-col :span="8">
                                        <el-card class="metric-card">
                                            <div class="metric-content">
                                                <div class="metric-value">{{ qualityData?.efficiency?.infoGatheringRate
                                                    || '85%' }}
                                                </div>
                                                <div class="metric-label">信息获取效率</div>
                                            </div>
                                        </el-card>
                                    </el-col>
                                    <el-col :span="8">
                                        <el-card class="metric-card">
                                            <div class="metric-content">
                                                <div class="metric-value">{{ qualityData?.efficiency?.focusRate || '92%'
                                                    }}</div>
                                                <div class="metric-label">面试专注度</div>
                                            </div>
                                        </el-card>
                                    </el-col>
                                    <el-col :span="8">
                                        <el-card class="metric-card">
                                            <div class="metric-content">
                                                <div class="metric-value">{{ qualityData?.efficiency?.timeUtilization ||
                                                    '78%' }}</div>
                                                <div class="metric-label">时间利用率</div>
                                            </div>
                                        </el-card>
                                    </el-col>
                                </el-row>
                            </div>
                        </div>

                        <div class="analysis-section">
                            <div class="chart-title">关键信息点覆盖率</div>
                            <div class="chart-container" style="height: 300px;">
                                <visualization-charts chart-type="bar" :chart-data="keyInfoCoverageData"
                                    title="关键信息点覆盖率" height="300px" :loading="!qualityData" />
                            </div>
                        </div>

                        <div class="analysis-section">
                            <h4>低效问题识别</h4>
                            <el-table :data="inefficientQuestions" style="width: 100%">
                                <el-table-column prop="questionType" label="问题类型" width="120"></el-table-column>
                                <el-table-column prop="question" label="问题内容" show-overflow-tooltip></el-table-column>
                                <el-table-column prop="reason" label="低效原因" show-overflow-tooltip></el-table-column>
                                <el-table-column prop="suggestion" label="改进建议" show-overflow-tooltip></el-table-column>
                            </el-table>
                        </div>

                        <div class="improvement-section">
                            <h4>效率提升建议</h4>
                            <el-card class="improvement-card">
                                <template #header>
                                    <div class="card-header">
                                        <span>效率优化建议</span>
                                    </div>
                                </template>
                                <div class="improvement-list">
                                    <div v-for="(item, index) in qualityData?.efficiency?.suggestions" :key="index"
                                        class="improvement-item">
                                        <el-icon>
                                            <ArrowRight />
                                        </el-icon>
                                        <span>{{ item }}</span>
                                    </div>
                                </div>
                            </el-card>
                        </div>
                    </div>
                </el-tab-pane>

                <!-- 数据趋势分析 -->
                <el-tab-pane label="趋势分析" name="trends">
                    <div class="trends-analysis">
                        <div class="analysis-section">
                            <div class="chart-title">面试质量历史趋势</div>
                            <div class="chart-container" style="height: 300px;">
                                <visualization-charts chart-type="line" :chart-data="qualityTrendData" title="面试质量历史趋势"
                                    height="300px" :loading="!qualityData" />
                            </div>
                        </div>

                        <div class="analysis-section">
                            <div class="chart-title">评估一致性分析</div>
                            <div class="chart-container" style="height: 300px;">
                                <visualization-charts chart-type="bar" :chart-data="consistencyData" title="评估一致性分析"
                                    height="300px" :loading="!qualityData" />
                            </div>
                            <div class="explanation-card">
                                <h4>分析解读</h4>
                                <p>{{ qualityData?.trends?.explanation ||
                                    '面试质量在过去几次面试中总体呈上升趋势，面试覆盖度和效率都有所提高。评估一致性分析显示，不同面试官对相似候选人的评估结果较为一致，表明团队内部的评估标准较为统一。'
                                    }}</p>
                            </div>
                        </div>

                        <div class="improvement-section">
                            <h4>持续改进建议</h4>
                            <el-card class="improvement-card">
                                <template #header>
                                    <div class="card-header">
                                        <span>持续优化建议</span>
                                    </div>
                                </template>
                                <div class="improvement-list">
                                    <div v-for="(item, index) in qualityData?.trends?.suggestions" :key="index"
                                        class="improvement-item">
                                        <el-icon>
                                            <ArrowRight />
                                        </el-icon>
                                        <span>{{ item }}</span>
                                    </div>
                                </div>
                            </el-card>
                        </div>
                    </div>
                </el-tab-pane>
            </el-tabs>

            <div class="improvement-section">
                <h3 class="section-title">改进建议</h3>
                <div class="improvements-container">
                    <el-timeline>
                        <el-timeline-item v-for="(suggestion, index) in qualityAnalysis.improvementSuggestions"
                            :key="index" :type="getSuggestionType(suggestion.priority)"
                            :color="getSuggestionColor(suggestion.priority)"
                            :size="suggestion.priority === 'high' ? 'large' : 'normal'">
                            <div class="suggestion-content">
                                <div class="suggestion-header">
                                    <span class="suggestion-title">{{ suggestion.title }}</span>
                                    <el-tag v-if="suggestion.priority" size="small"
                                        :type="getSuggestionTagType(suggestion.priority)">
                                        {{ getSuggestionPriorityLabel(suggestion.priority) }}
                                    </el-tag>
                                </div>
                                <div class="suggestion-body">{{ suggestion.content }}</div>
                                <div class="suggestion-examples"
                                    v-if="suggestion.examples && suggestion.examples.length">
                                    <div class="examples-title">示例：</div>
                                    <ul class="examples-list">
                                        <li v-for="(example, idx) in suggestion.examples" :key="idx">{{ example }}</li>
                                    </ul>
                                </div>
                            </div>
                        </el-timeline-item>
                    </el-timeline>
                </div>
            </div>
        </template>
    </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { RefreshRight, ArrowRight, Timer, InfoFilled } from '@element-plus/icons-vue'
import VisualizationCharts from '@/components/VisualizationCharts.vue'
import { getInterviewQualityAnalysis } from '@/api/interview'

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
const activeTab = ref('coverage')
const qualityData = ref(null)

// 获取面试质量分析
const fetchQualityAnalysis = async () => {
    if (!props.interviewId) return

    try {
        loading.value = true

        // 模拟API调用，实际项目中应该使用真实API
        // const { data } = await getInterviewQualityAnalysis(props.interviewId)

        // 模拟数据
        setTimeout(() => {
            qualityData.value = {
                coverage: {
                    dimensions: {
                        technical: 0.85,
                        communication: 0.75,
                        problemSolving: 0.8,
                        teamwork: 0.6,
                        cultureFit: 0.65,
                        learningAbility: 0.7
                    },
                    questionTypes: {
                        technical: 45,
                        behavioral: 25,
                        situational: 15,
                        experience: 10,
                        cultural: 5
                    },
                    timeAllocation: {
                        technical: 35,
                        experience: 25,
                        behavioral: 20,
                        problemSolving: 15,
                        cultural: 5
                    },
                    explanation: '此面试评估维度覆盖较为全面，各主要能力维度均有涉及。技术能力和问题解决能力的覆盖度最高，而文化匹配和团队协作方面的覆盖度较低，建议在后续面试中多关注这些方面。',
                    suggestions: [
                        '增加团队协作相关的情景问题，了解候选人的协作能力',
                        '加入更多文化匹配度的讨论，确保候选人能融入团队',
                        '技术问题可以适当精简，为软技能评估留出更多时间',
                        '确保每个评估维度至少有2-3个深入问题'
                    ]
                },
                interviewer: {
                    performance: {
                        questionClarity: 0.9,
                        probing: 0.85,
                        listening: 0.8,
                        pacing: 0.7,
                        feedback: 0.65,
                        adaptability: 0.75
                    },
                    questionDistribution: {
                        time: ['0-10分钟', '10-20分钟', '20-30分钟', '30-40分钟', '40-50分钟', '50-60分钟'],
                        technical: [3, 5, 2, 1, 0, 0],
                        behavioral: [0, 1, 2, 3, 2, 0],
                        situational: [0, 0, 1, 2, 2, 1]
                    },
                    explanation: '面试官在问题清晰度和深入挖掘能力方面表现出色，能够引导面试向深层次进行。在控制节奏和总结反馈方面有提升空间，可以通过更好地掌控面试流程和提供及时反馈来提高面试效果。',
                    suggestions: [
                        '在问题之间提供更多的过渡和引导，帮助候选人理解问题的连贯性',
                        '给予候选人更多即时反馈，特别是在答题表现良好时',
                        '控制单个问题的讨论时间，确保能够覆盖所有关键评估点',
                        '可以使用更多的开放性问题，让候选人充分展示能力'
                    ]
                },
                efficiency: {
                    infoGatheringRate: '85%',
                    focusRate: '92%',
                    timeUtilization: '78%',
                    keyInfoCoverage: {
                        categories: ['技术背景', '项目经验', '问题解决', '团队协作', '学习能力', '职业规划'],
                        coverage: [90, 85, 80, 65, 70, 60]
                    },
                    inefficientQuestions: [
                        {
                            questionType: '技术问题',
                            question: '你熟悉哪些编程语言？',
                            reason: '过于宽泛，未获取深度信息',
                            suggestion: '询问特定语言的深度使用经验和解决的复杂问题'
                        },
                        {
                            questionType: '经验问题',
                            question: '讲讲你的项目经历',
                            reason: '没有具体方向，花费时间过多',
                            suggestion: '引导候选人讨论最相关的1-2个项目，深入技术细节'
                        },
                        {
                            questionType: '行为问题',
                            question: '你的优点和缺点是什么？',
                            reason: '标准化问题，获取信息有限',
                            suggestion: '询问特定情境下的行为表现，如"描述一次你克服技术挑战的经历"'
                        }
                    ],
                    suggestions: [
                        '使用更多结构化和有针对性的问题，减少开放性过大的问题',
                        '优化面试流程，将相关话题集中讨论，减少上下文切换',
                        '提前准备关键信息点检查表，确保重要信息都已获取',
                        '针对候选人简历中的关键项目和技能设计有深度的问题'
                    ]
                },
                trends: {
                    qualityTrend: {
                        date: ['2023-01', '2023-02', '2023-03', '2023-04', '2023-05'],
                        coverage: [65, 70, 75, 80, 85],
                        efficiency: [60, 65, 70, 75, 80],
                        consistency: [70, 75, 80, 85, 90]
                    },
                    consistencyData: {
                        interviewers: ['张三', '李四', '王五', '赵六', '团队平均'],
                        scores: [85, 80, 90, 75, 82.5]
                    },
                    explanation: '面试质量在过去几次面试中总体呈上升趋势，面试覆盖度和效率都有所提高。评估一致性分析显示，不同面试官对相似候选人的评估结果较为一致，表明团队内部的评估标准较为统一。',
                    suggestions: [
                        '定期组织面试官校准会议，确保评估标准统一',
                        '建立面试问题库，持续优化问题质量',
                        '分析高效面试案例，总结最佳实践并在团队分享',
                        '面试后进行自我反思和同行评估，持续改进面试技巧'
                    ]
                }
            }
            loading.value = false
        }, 1500)
    } catch (error) {
        ElMessage.error('获取面试质量分析失败: ' + error.message)
        loading.value = false
    }
}

// 重新生成分析
const generateAnalysis = async () => {
    if (!props.interviewId) {
        ElMessage.error('面试ID不存在')
        return
    }

    try {
        generating.value = true
        await fetchQualityAnalysis()
        ElMessage.success('分析生成成功')
    } catch (error) {
        ElMessage.error('生成分析失败: ' + error.message)
    } finally {
        generating.value = false
    }
}

// 维度覆盖度雷达图数据
const dimensionCoverageData = computed(() => {
    if (!qualityData.value) return { indicator: [], data: [] }

    const dimensions = qualityData.value.coverage.dimensions
    return {
        indicator: [
            { name: '技术能力', max: 1 },
            { name: '沟通表达', max: 1 },
            { name: '解决问题', max: 1 },
            { name: '团队协作', max: 1 },
            { name: '文化匹配', max: 1 },
            { name: '学习能力', max: 1 }
        ],
        data: [
            {
                name: '能力维度覆盖度',
                value: [
                    dimensions.technical,
                    dimensions.communication,
                    dimensions.problemSolving,
                    dimensions.teamwork,
                    dimensions.cultureFit,
                    dimensions.learningAbility
                ]
            }
        ]
    }
})

// 问题类型分布饼图数据
const questionTypeData = computed(() => {
    if (!qualityData.value) return { data: [] }

    const types = qualityData.value.coverage.questionTypes
    return {
        data: [
            { name: '技术问题', value: types.technical },
            { name: '行为问题', value: types.behavioral },
            { name: '情景问题', value: types.situational },
            { name: '经验问题', value: types.experience },
            { name: '文化问题', value: types.cultural }
        ]
    }
})

// 时间分配分析柱状图数据
const timeAllocationData = computed(() => {
    if (!qualityData.value) return { xAxis: [], series: [] }

    const timeData = qualityData.value.coverage.timeAllocation
    return {
        xAxis: Object.keys(timeData).map(key => {
            const nameMap = {
                technical: '技术问题',
                behavioral: '行为问题',
                experience: '经验问题',
                problemSolving: '解决问题',
                cultural: '文化问题'
            }
            return nameMap[key] || key
        }),
        series: [
            {
                name: '时间占比(%)',
                data: Object.values(timeData)
            }
        ]
    }
})

// 面试官表现雷达图数据
const interviewerPerformanceData = computed(() => {
    if (!qualityData.value) return { indicator: [], data: [] }

    const performance = qualityData.value.interviewer.performance
    return {
        indicator: [
            { name: '问题清晰度', max: 1 },
            { name: '深入挖掘', max: 1 },
            { name: '倾听能力', max: 1 },
            { name: '节奏控制', max: 1 },
            { name: '反馈能力', max: 1 },
            { name: '适应性', max: 1 }
        ],
        data: [
            {
                name: '面试官表现',
                value: [
                    performance.questionClarity,
                    performance.probing,
                    performance.listening,
                    performance.pacing,
                    performance.feedback,
                    performance.adaptability
                ]
            }
        ]
    }
})

// 问题分布时间线数据
const questionDistributionData = computed(() => {
    if (!qualityData.value) return { xAxis: [], series: [] }

    const distribution = qualityData.value.interviewer.questionDistribution
    return {
        xAxis: distribution.time,
        series: [
            {
                name: '技术问题',
                data: distribution.technical
            },
            {
                name: '行为问题',
                data: distribution.behavioral
            },
            {
                name: '情景问题',
                data: distribution.situational
            }
        ]
    }
})

// 关键信息点覆盖率数据
const keyInfoCoverageData = computed(() => {
    if (!qualityData.value) return { xAxis: [], series: [] }

    const coverage = qualityData.value.efficiency.keyInfoCoverage
    return {
        xAxis: coverage.categories,
        series: [
            {
                name: '覆盖率(%)',
                data: coverage.coverage
            }
        ]
    }
})

// 低效问题数据
const inefficientQuestions = computed(() => {
    if (!qualityData.value) return []
    return qualityData.value.efficiency.inefficientQuestions
})

// 面试质量历史趋势数据
const qualityTrendData = computed(() => {
    if (!qualityData.value) return { xAxis: [], series: [] }

    const trend = qualityData.value.trends.qualityTrend
    return {
        xAxis: trend.date,
        series: [
            {
                name: '覆盖度',
                data: trend.coverage
            },
            {
                name: '效率',
                data: trend.efficiency
            },
            {
                name: '一致性',
                data: trend.consistency
            }
        ]
    }
})

// 评估一致性分析数据
const consistencyData = computed(() => {
    if (!qualityData.value) return { xAxis: [], series: [] }

    const consistency = qualityData.value.trends.consistencyData
    return {
        xAxis: consistency.interviewers,
        series: [
            {
                name: '评分',
                data: consistency.scores
            }
        ]
    }
})

// 组件挂载时获取数据
onMounted(() => {
    fetchQualityAnalysis()
})
</script>

<style scoped>
.interview-quality-analysis {
    background-color: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
    padding: 20px;

    .loading-container {
        padding: 20px;
    }

    .analysis-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 16px;

        .analysis-title {
            margin: 0;
            font-size: 18px;
            font-weight: 500;
        }
    }

    .quality-tabs {
        :deep(.el-tabs__content) {
            padding: 20px 0;
        }
    }

    .analysis-section {
        margin-bottom: 30px;

        .chart-title,
        .metrics-title {
            font-size: 16px;
            font-weight: 500;
            margin-bottom: 16px;
            color: #303133;
        }

        .chart-container {
            margin-bottom: 16px;
        }

        .explanation-card {
            background-color: #f5f7fa;
            padding: 16px;
            border-radius: 4px;

            h4 {
                margin: 0 0 8px 0;
                font-size: 15px;
            }

            p {
                margin: 0;
                line-height: 1.6;
                color: #606266;
            }
        }

        .metrics-container {
            .metric-card {
                height: 120px;

                .metric-content {
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    align-items: center;
                    height: 100%;

                    .metric-value {
                        font-size: 32px;
                        font-weight: bold;
                        margin-bottom: 8px;
                    }

                    .metric-label {
                        color: #909399;
                        font-size: 14px;
                    }
                }
            }
        }
    }

    .improvement-section {
        h4 {
            font-size: 16px;
            font-weight: 500;
            margin-bottom: 16px;
            color: #303133;
        }

        .improvement-card {
            .card-header {
                font-size: 15px;
                font-weight: 500;
            }

            .improvement-list {
                .improvement-item {
                    display: flex;
                    align-items: flex-start;
                    margin-bottom: 12px;

                    .el-icon {
                        margin-right: 8px;
                        margin-top: 4px;
                        color: #409eff;
                    }

                    span {
                        flex: 1;
                        line-height: 1.6;
                    }
                }
            }
        }
    }

    .time-allocation-section {
        margin-bottom: 30px;

        .section-title {
            font-size: 16px;
            font-weight: 500;
            margin-bottom: 16px;
            color: #303133;
        }

        .time-chart-container {
            display: flex;
            justify-content: space-between;

            .chart-wrapper {
                flex: 1;
            }

            .time-analysis {
                flex: 1;
                margin-left: 20px;

                .analysis-card {
                    background-color: #f5f7fa;
                    padding: 16px;
                    border-radius: 4px;

                    .card-header {
                        display: flex;
                        align-items: center;
                        margin-bottom: 16px;

                        .el-icon {
                            margin-right: 8px;
                            color: #409EFF;
                        }

                        span {
                            font-size: 15px;
                            font-weight: 500;
                        }
                    }

                    .card-body {
                        .efficiency-meter {
                            margin-bottom: 16px;
                        }

                        .efficiency-insights {
                            .insight-item {
                                display: flex;
                                align-items: center;
                                margin-bottom: 8px;

                                .el-icon {
                                    margin-right: 8px;
                                    color: #409EFF;
                                }

                                span {
                                    flex: 1;
                                    line-height: 1.6;
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    .coverage-analysis-section {
        margin-bottom: 30px;

        .section-title {
            font-size: 16px;
            font-weight: 500;
            margin-bottom: 16px;
            color: #303133;
        }

        .coverage-content {
            display: flex;
            justify-content: space-between;

            .radar-chart {
                flex: 1;
            }

            .coverage-stats {
                flex: 1;
                margin-left: 20px;

                .stat-item {
                    margin-bottom: 16px;

                    .stat-label {
                        font-size: 14px;
                        font-weight: 500;
                        margin-bottom: 8px;
                    }

                    .el-progress {
                        margin-bottom: 8px;
                    }

                    .stat-description {
                        color: #606266;
                        font-size: 12px;
                    }
                }
            }
        }
    }

    .interviewer-performance-section {
        margin-bottom: 30px;

        .section-title {
            font-size: 16px;
            font-weight: 500;
            margin-bottom: 16px;
            color: #303133;
        }

        .interviewer-metrics {
            .metric-card {
                background-color: #f5f7fa;
                padding: 16px;
                border-radius: 4px;
                margin-bottom: 16px;

                .metric-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 16px;

                    .metric-title {
                        font-size: 15px;
                        font-weight: 500;
                    }

                    .metric-score {
                        .el-rate {
                            margin-left: 16px;
                        }
                    }
                }

                .metric-insights {
                    .insight-item {
                        display: flex;
                        align-items: center;
                        margin-bottom: 8px;

                        .el-icon {
                            margin-right: 8px;
                            color: #409EFF;
                        }

                        span {
                            flex: 1;
                            line-height: 1.6;
                        }
                    }
                }
            }
        }
    }

    .improvements-container {
        .el-timeline {
            .el-timeline-item {
                .suggestion-content {
                    .suggestion-header {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        margin-bottom: 8px;

                        .suggestion-title {
                            font-size: 15px;
                            font-weight: 500;
                        }

                        .el-tag {
                            margin-left: 8px;
                        }
                    }

                    .suggestion-body {
                        margin-bottom: 8px;
                    }

                    .suggestion-examples {
                        .examples-title {
                            font-size: 14px;
                            font-weight: 500;
                            margin-bottom: 8px;
                        }

                        .examples-list {
                            list-style: none;
                            padding-left: 0;

                            li {
                                margin-bottom: 4px;
                            }
                        }
                    }
                }
            }
        }
    }
}
</style>