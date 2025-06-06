<template>
    <div class="ai-analysis-panel">
        <div class="loading-container" v-if="loading">
            <el-skeleton :rows="10" animated />
        </div>

        <div v-else-if="!analysis" class="empty-analysis">
            <el-empty description="暂无AI分析数据">
                <template #extra>
                    <el-button type="primary" @click="generateAnalysis">生成分析</el-button>
                </template>
            </el-empty>
        </div>

        <div v-else class="analysis-content">
            <!-- 综合评分 -->
            <div class="overall-score-section">
                <h3 class="section-title">综合评分</h3>
                <div class="score-container">
                    <div class="score-circle">
                        <el-progress type="circle" :percentage="analysis.overallScore"
                            :color="getScoreColor(analysis.overallScore)" :width="120" :stroke-width="10">
                            <template #default>
                                <div class="progress-content">
                                    <span class="progress-value">{{ analysis.overallScore }}</span>
                                    <span class="progress-label">综合得分</span>
                                </div>
                            </template>
                        </el-progress>
                    </div>

                    <div class="score-breakdown">
                        <div v-for="(score, category) in analysis.categoryScores" :key="category" class="score-item">
                            <span class="score-label">{{ getCategoryName(category) }}</span>
                            <el-progress :percentage="score" :color="getScoreColor(score)" :stroke-width="14"
                                :show-text="false" />
                            <span class="score-value">{{ score }}分</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 候选人特点 -->
            <div class="candidate-traits-section">
                <h3 class="section-title">候选人特点</h3>
                <div class="traits-container">
                    <div class="strengths">
                        <h4>优势</h4>
                        <ul class="trait-list">
                            <li v-for="(strength, index) in analysis.strengths" :key="index">
                                {{ strength }}
                            </li>
                        </ul>
                    </div>

                    <div class="weaknesses">
                        <h4>待提升方面</h4>
                        <ul class="trait-list">
                            <li v-for="(weakness, index) in analysis.weaknesses" :key="index">
                                {{ weakness }}
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            <!-- 关键词分析 -->
            <div class="keyword-analysis-section">
                <h3 class="section-title">关键词分析</h3>
                <div class="keyword-cloud">
                    <el-tag v-for="keyword in analysis.keywords" :key="keyword.word"
                        :type="getKeywordType(keyword.weight)" :effect="keyword.weight > 0.7 ? 'dark' : 'light'"
                        :size="getKeywordSize(keyword.weight)" class="keyword-tag">
                        {{ keyword.word }}
                    </el-tag>
                </div>
            </div>

            <!-- 详细分析 -->
            <div class="detailed-analysis-section">
                <h3 class="section-title">详细分析</h3>
                <el-collapse>
                    <el-collapse-item title="技术能力评估" name="technical">
                        <div class="analysis-detail" v-html="analysis.technicalAnalysis"></div>
                    </el-collapse-item>

                    <el-collapse-item title="沟通能力评估" name="communication">
                        <div class="analysis-detail" v-html="analysis.communicationAnalysis"></div>
                    </el-collapse-item>

                    <el-collapse-item title="个人素质评估" name="personality">
                        <div class="analysis-detail" v-html="analysis.personalityAnalysis"></div>
                    </el-collapse-item>

                    <el-collapse-item title="文化匹配度评估" name="culture">
                        <div class="analysis-detail" v-html="analysis.cultureFitAnalysis"></div>
                    </el-collapse-item>
                </el-collapse>
            </div>

            <!-- 建议 -->
            <div class="recommendations-section">
                <h3 class="section-title">招聘建议</h3>
                <div class="recommendation-box" :class="getRecommendationClass(analysis.finalRecommendation.type)">
                    <div class="recommendation-header">
                        <el-tag :type="getRecommendationType(analysis.finalRecommendation.type)" effect="dark">
                            {{ getRecommendationText(analysis.finalRecommendation.type) }}
                        </el-tag>
                    </div>
                    <div class="recommendation-content">
                        {{ analysis.finalRecommendation.content }}
                    </div>
                </div>

                <div class="next-steps">
                    <h4>后续步骤建议</h4>
                    <ul>
                        <li v-for="(step, index) in analysis.nextSteps" :key="index">
                            {{ step }}
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getAIAnalysis } from '@/api/interview'

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

const loading = ref(false)
const analysis = ref(null)

// 获取分类名称
const getCategoryName = (category) => {
    const categoryMap = {
        'technical': '技术能力',
        'communication': '沟通能力',
        'problem_solving': '解决问题能力',
        'team_work': '团队协作',
        'culture_fit': '文化匹配',
        'learning_ability': '学习能力'
    }
    return categoryMap[category] || category
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

// 获取关键词大小
const getKeywordSize = (weight) => {
    if (weight > 0.8) {
        return 'large'
    } else if (weight > 0.5) {
        return 'default'
    } else {
        return 'small'
    }
}

// 获取关键词类型
const getKeywordType = (weight) => {
    if (weight > 0.8) {
        return 'success'
    } else if (weight > 0.6) {
        return 'primary'
    } else if (weight > 0.4) {
        return 'warning'
    } else {
        return 'info'
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

// 获取推荐样式类
const getRecommendationClass = (type) => {
    return `recommendation-${type}`
}

// 生成分析（获取AI分析）
const generateAnalysis = async () => {
    if (!props.interviewId) {
        ElMessage.error('面试ID不存在')
        return
    }

    try {
        loading.value = true
        const { data } = await getAIAnalysis(props.interviewId)

        // 模拟数据处理和增强（在实际项目中，这部分应该由后端返回）
        analysis.value = {
            ...data,
            overallScore: Math.round(data.overallScore || 75),
            categoryScores: data.categoryScores || {
                technical: 80,
                communication: 70,
                problem_solving: 65,
                team_work: 85,
                culture_fit: 75,
                learning_ability: 80
            },
            strengths: data.strengths || [
                '技术基础扎实，对核心概念理解透彻',
                '沟通表达清晰流畅，能够准确表达想法',
                '有较强的学习能力，对新技术持开放态度',
                '团队合作经验丰富，善于协作解决问题'
            ],
            weaknesses: data.weaknesses || [
                '在系统设计方面的经验有限',
                '对某些业务场景的理解不够深入',
                '处理压力的经验需要进一步提升',
                '技术深度还有提升空间'
            ],
            keywords: data.keywords || [
                { word: 'JavaScript', weight: 0.95 },
                { word: 'React', weight: 0.9 },
                { word: '团队协作', weight: 0.85 },
                { word: '沟通能力', weight: 0.8 },
                { word: '问题解决', weight: 0.75 },
                { word: 'Vue', weight: 0.7 },
                { word: '学习能力', weight: 0.65 },
                { word: 'Node.js', weight: 0.6 },
                { word: '系统设计', weight: 0.55 },
                { word: '前端优化', weight: 0.5 },
                { word: '数据结构', weight: 0.45 },
                { word: '算法', weight: 0.4 }
            ],
            technicalAnalysis: data.technicalAnalysis || '候选人在技术方面表现良好，对JavaScript、React等核心技术有深入理解。在讨论技术问题时能够清晰地表达思路，并提供合理的解决方案。在算法和数据结构方面展示了基本的理解，但在复杂系统设计上经验较少。',
            communicationAnalysis: data.communicationAnalysis || '候选人沟通能力较强，能够清晰表达自己的想法，理解问题并给出相应的回答。语言表达流畅，逻辑清晰，能够根据面试官的问题调整回答的深度和广度。',
            personalityAnalysis: data.personalityAnalysis || '候选人展现出积极的工作态度和学习热情。在面对挑战性问题时保持冷静，善于思考。表现出一定的抗压能力和解决问题的韧性。性格开朗，易于沟通，应该能够很好地融入团队。',
            cultureFitAnalysis: data.cultureFitAnalysis || '候选人的价值观和工作理念与公司文化较为契合。重视团队协作，注重代码质量，关注用户体验，这些都与公司的核心价值观相符。在讨论过去项目经历时，展示了对产品负责的态度。',
            finalRecommendation: data.finalRecommendation || {
                type: 'hire',
                content: '建议录用该候选人。候选人在技术和沟通方面表现出色，能够胜任岗位要求，且与团队文化匹配度高。'
            },
            nextSteps: data.nextSteps || [
                '安排技术负责人进行最终面试',
                '提供具体的入职计划和成长路径',
                '与候选人讨论薪资期望和入职时间',
                '准备入职培训和技术栈熟悉的计划'
            ]
        }

        ElMessage.success('分析生成成功')
    } catch (error) {
        ElMessage.error('获取分析失败：' + error.message)
    } finally {
        loading.value = false
    }
}

onMounted(() => {
    if (props.record?.status === 'completed') {
        generateAnalysis()
    }
})
</script>

<style scoped>
.ai-analysis-panel {
    .loading-container {
        padding: 20px;
    }

    .empty-analysis {
        height: 300px;
        display: flex;
        justify-content: center;
        align-items: center;
    }

    .analysis-content {
        .section-title {
            font-size: 18px;
            font-weight: 500;
            margin-bottom: 16px;
            padding-bottom: 8px;
            border-bottom: 1px solid #ebeef5;
        }

        .overall-score-section {
            margin-bottom: 30px;

            .score-container {
                display: flex;
                gap: 36px;

                .score-circle {
                    .progress-content {
                        display: flex;
                        flex-direction: column;
                        align-items: center;

                        .progress-value {
                            font-size: 28px;
                            font-weight: bold;
                        }

                        .progress-label {
                            font-size: 14px;
                            color: #909399;
                        }
                    }
                }

                .score-breakdown {
                    flex: 1;

                    .score-item {
                        margin-bottom: 16px;
                        display: flex;
                        align-items: center;

                        .score-label {
                            width: 120px;
                            flex-shrink: 0;
                        }

                        .el-progress {
                            flex: 1;
                            margin: 0 12px;
                        }

                        .score-value {
                            width: 40px;
                            text-align: right;
                            font-weight: 500;
                        }
                    }
                }
            }
        }

        .candidate-traits-section {
            margin-bottom: 30px;

            .traits-container {
                display: flex;
                gap: 36px;

                .strengths,
                .weaknesses {
                    flex: 1;
                    background-color: #f5f7fa;
                    border-radius: 8px;
                    padding: 16px;

                    h4 {
                        margin-top: 0;
                        margin-bottom: 16px;
                        font-size: 16px;
                    }

                    .trait-list {
                        padding-left: 20px;
                        margin: 0;

                        li {
                            margin-bottom: 8px;
                        }
                    }
                }

                .strengths {
                    h4 {
                        color: #67c23a;
                    }
                }

                .weaknesses {
                    h4 {
                        color: #e6a23c;
                    }
                }
            }
        }

        .keyword-analysis-section {
            margin-bottom: 30px;

            .keyword-cloud {
                margin-top: 16px;

                .keyword-tag {
                    margin-right: 10px;
                    margin-bottom: 10px;
                }
            }
        }

        .detailed-analysis-section {
            margin-bottom: 30px;

            .analysis-detail {
                line-height: 1.6;
                white-space: pre-line;
                color: #606266;
            }
        }

        .recommendations-section {
            margin-bottom: 30px;

            .recommendation-box {
                padding: 20px;
                border-radius: 8px;
                margin-bottom: 20px;

                &.recommendation-hire {
                    background-color: #f0f9eb;
                    border-left: 4px solid #67c23a;
                }

                &.recommendation-consider {
                    background-color: #fdf6ec;
                    border-left: 4px solid #e6a23c;
                }

                &.recommendation-reject {
                    background-color: #fef0f0;
                    border-left: 4px solid #f56c6c;
                }

                .recommendation-header {
                    margin-bottom: 12px;
                }

                .recommendation-content {
                    line-height: 1.6;
                }
            }

            .next-steps {
                h4 {
                    font-size: 16px;
                    margin-top: 0;
                    margin-bottom: 12px;
                }

                ul {
                    padding-left: 20px;

                    li {
                        margin-bottom: 8px;
                    }
                }
            }
        }
    }
}
</style>