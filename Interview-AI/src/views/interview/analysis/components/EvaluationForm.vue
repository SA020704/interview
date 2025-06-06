<template>
    <div class="evaluation-form-container">
        <div v-if="loading" class="loading-container">
            <el-skeleton :rows="15" animated />
        </div>

        <template v-else>
            <div v-if="submitted" class="submitted-container">
                <div class="success-message">
                    <el-result icon="success" title="评估提交成功" sub-title="您已完成对此次面试的评估，可以在AI分析页面查看完整分析结果">
                        <template #extra>
                            <el-button type="primary" @click="resetForm">修改评估</el-button>
                        </template>
                    </el-result>
                </div>
            </div>

            <el-form v-else ref="formRef" :model="formData" :rules="rules" label-position="top" class="evaluation-form">
                <!-- 基本评估 -->
                <div class="form-section">
                    <h3 class="section-title">基本评估</h3>

                    <el-form-item label="综合评分" prop="overallScore">
                        <div class="score-slider">
                            <el-slider v-model="formData.overallScore" :step="1" :min="0" :max="100"
                                :format-tooltip="formatScoreTooltip" :marks="scoreMarks" show-stops />
                            <div class="score-labels">
                                <span>不合格</span>
                                <span>合格</span>
                                <span>良好</span>
                                <span>优秀</span>
                                <span>卓越</span>
                            </div>
                        </div>
                    </el-form-item>

                    <!-- 能力评估 -->
                    <el-form-item v-for="(item, field) in skillFields" :key="field" :label="item.label"
                        :prop="`skillScores.${field}`">
                        <el-rate v-model="formData.skillScores[field]" :max="5" :colors="skillRateColors"
                            :texts="skillRateTexts" show-text :allow-half="false" />
                    </el-form-item>

                    <!-- 招聘建议 -->
                    <el-form-item label="招聘建议" prop="hiringRecommendation">
                        <el-radio-group v-model="formData.hiringRecommendation">
                            <el-radio label="hire">
                                <el-tag type="success" effect="plain">建议录用</el-tag>
                            </el-radio>
                            <el-radio label="consider">
                                <el-tag type="warning" effect="plain">需要考虑</el-tag>
                            </el-radio>
                            <el-radio label="reject">
                                <el-tag type="danger" effect="plain">不建议录用</el-tag>
                            </el-radio>
                        </el-radio-group>
                    </el-form-item>
                </div>

                <!-- 详细评价 -->
                <div class="form-section">
                    <h3 class="section-title">详细评价</h3>

                    <el-form-item label="优势" prop="strengths">
                        <el-input v-model="formData.strengths" type="textarea" :rows="4"
                            placeholder="请输入候选人的优势和突出表现..."></el-input>
                    </el-form-item>

                    <el-form-item label="待提升方面" prop="weaknesses">
                        <el-input v-model="formData.weaknesses" type="textarea" :rows="4"
                            placeholder="请输入候选人需要提升的方面..."></el-input>
                    </el-form-item>

                    <el-form-item label="建议跟进事项" prop="followUpActions">
                        <el-input v-model="formData.followUpActions" type="textarea" :rows="3"
                            placeholder="请输入后续跟进事项或建议..."></el-input>
                    </el-form-item>
                </div>

                <!-- 评估备注 -->
                <div class="form-section">
                    <h3 class="section-title">评估备注</h3>

                    <el-form-item label="其他备注" prop="additionalNotes">
                        <el-input v-model="formData.additionalNotes" type="textarea" :rows="4"
                            placeholder="请输入其他相关备注..."></el-input>
                    </el-form-item>
                </div>

                <!-- 提交按钮 -->
                <div class="form-actions">
                    <el-button @click="resetForm">重置</el-button>
                    <el-button type="primary" @click="submitForm(formRef)" :loading="submitting">提交评估</el-button>
                </div>
            </el-form>
        </template>
    </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { submitInterviewEvaluation, getInterviewEvaluation } from '@/api/interview'

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

const emit = defineEmits(['submit-success'])

// 表单引用
const formRef = ref(null)

// 状态
const loading = ref(false)
const submitting = ref(false)
const submitted = ref(false)

// 评分区间标记
const scoreMarks = {
    0: '0',
    25: '25',
    50: '50',
    75: '75',
    100: '100'
}

// 技能评分颜色
const skillRateColors = ['#f56c6c', '#e6a23c', '#e6a23c', '#67c23a', '#67c23a']

// 技能评分文本
const skillRateTexts = ['不合格', '较差', '一般', '良好', '优秀']

// 技能字段配置
const skillFields = {
    technical: { label: '技术能力' },
    communication: { label: '沟通表达' },
    problemSolving: { label: '解决问题能力' },
    teamwork: { label: '团队协作' },
    cultureFit: { label: '文化匹配度' },
    learningAbility: { label: '学习能力' }
}

// 表单数据
const formData = reactive({
    overallScore: 75,
    skillScores: {
        technical: 3,
        communication: 3,
        problemSolving: 3,
        teamwork: 3,
        cultureFit: 3,
        learningAbility: 3
    },
    hiringRecommendation: 'consider',
    strengths: '',
    weaknesses: '',
    followUpActions: '',
    additionalNotes: ''
})

// 表单验证规则
const rules = {
    overallScore: [
        { required: true, message: '请选择综合评分', trigger: 'change' }
    ],
    hiringRecommendation: [
        { required: true, message: '请选择招聘建议', trigger: 'change' }
    ],
    strengths: [
        { required: true, message: '请输入候选人的优势', trigger: 'blur' }
    ],
    weaknesses: [
        { required: true, message: '请输入候选人待提升方面', trigger: 'blur' }
    ]
}

// 格式化评分提示
const formatScoreTooltip = (val) => {
    return `${val}分`
}

// 获取当前评估
const fetchEvaluation = async () => {
    if (!props.interviewId) return

    try {
        loading.value = true
        const { data } = await getInterviewEvaluation(props.interviewId)

        if (data) {
            // 已有评估数据，填充表单
            formData.overallScore = data.overallScore || 75

            if (data.skillScores) {
                Object.keys(data.skillScores).forEach(key => {
                    if (formData.skillScores.hasOwnProperty(key)) {
                        formData.skillScores[key] = data.skillScores[key]
                    }
                })
            }

            formData.hiringRecommendation = data.hiringRecommendation || 'consider'
            formData.strengths = data.strengths || ''
            formData.weaknesses = data.weaknesses || ''
            formData.followUpActions = data.followUpActions || ''
            formData.additionalNotes = data.additionalNotes || ''

            // 标记为已提交
            submitted.value = true
        }
    } catch (error) {
        console.error('获取评估数据失败:', error)
    } finally {
        loading.value = false
    }
}

// 重置表单
const resetForm = () => {
    if (submitted.value) {
        submitted.value = false
        return
    }

    if (formRef.value) {
        formRef.value.resetFields()
    }
}

// 提交表单
const submitForm = async (formEl) => {
    if (!formEl) return

    await formEl.validate(async (valid, fields) => {
        if (valid) {
            try {
                submitting.value = true

                // 构造提交数据
                const submitData = {
                    overallScore: formData.overallScore,
                    skillScores: formData.skillScores,
                    hiringRecommendation: formData.hiringRecommendation,
                    strengths: formData.strengths,
                    weaknesses: formData.weaknesses,
                    followUpActions: formData.followUpActions,
                    additionalNotes: formData.additionalNotes,
                    interviewId: props.interviewId,
                    evaluator: localStorage.getItem('username') || '未知评估人',
                    evaluationTime: new Date().toISOString()
                }

                // 确认提交
                await ElMessageBox.confirm(
                    '提交后将生成面试分析报告，确认提交评估吗？',
                    '提交确认',
                    {
                        confirmButtonText: '确认提交',
                        cancelButtonText: '取消',
                        type: 'info'
                    }
                )

                await submitInterviewEvaluation(props.interviewId, submitData)

                ElMessage.success('评估提交成功')
                submitted.value = true
                emit('submit-success')
            } catch (error) {
                if (error === 'cancel') return

                ElMessage.error('提交失败: ' + error.message)
            } finally {
                submitting.value = false
            }
        } else {
            ElMessage.error('请完善表单信息')
            console.log('验证失败字段:', fields)
        }
    })
}

// 初始化获取评估
onMounted(() => {
    fetchEvaluation()
})
</script>

<style scoped>
.evaluation-form-container {
    .loading-container {
        padding: 20px;
    }

    .evaluation-form {
        .form-section {
            margin-bottom: 30px;
            padding: 24px;
            background-color: #fff;
            border-radius: 8px;
            box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);

            .section-title {
                margin-top: 0;
                margin-bottom: 24px;
                font-size: 18px;
                font-weight: 500;
                color: #303133;
                border-bottom: 1px solid #ebeef5;
                padding-bottom: 12px;
            }

            .score-slider {
                margin: 10px 0;

                .score-labels {
                    display: flex;
                    justify-content: space-between;
                    margin-top: 10px;
                    color: #909399;
                    font-size: 13px;
                }
            }
        }

        .form-actions {
            display: flex;
            justify-content: flex-end;
            gap: 16px;
            margin-top: 24px;
        }
    }

    .submitted-container {
        padding: 40px 0;
    }
}

/* 移动端适配 */
@media (max-width: 768px) {
    .evaluation-form-container {
        .evaluation-form {
            .form-section {
                padding: 16px;
                margin-bottom: 20px;

                .section-title {
                    font-size: 16px;
                    margin-bottom: 16px;
                }

                .score-slider {
                    .score-labels {
                        font-size: 12px;
                    }
                }
            }

            :deep(.el-form-item) {
                margin-bottom: 18px;
            }

            .form-actions {
                flex-direction: column;
                gap: 10px;

                .el-button {
                    width: 100%;
                }
            }
        }
    }
}

/* 小屏幕手机进一步优化 */
@media (max-width: 480px) {
    .evaluation-form-container {
        .evaluation-form {
            .form-section {
                padding: 12px;

                .section-title {
                    font-size: 15px;
                    padding-bottom: 8px;
                    margin-bottom: 12px;
                }

                .score-slider {
                    .score-labels {
                        display: none;
                        /* 在极小屏幕上隐藏文字标签 */
                    }
                }

                :deep(.el-radio-group) {
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                }
            }
        }

        .submitted-container {
            padding: 20px 0;

            :deep(.el-result__icon) {
                transform: scale(0.8);
            }

            :deep(.el-result__title) {
                font-size: 18px;
            }

            :deep(.el-result__subtitle) {
                font-size: 14px;
            }
        }
    }
}
</style>