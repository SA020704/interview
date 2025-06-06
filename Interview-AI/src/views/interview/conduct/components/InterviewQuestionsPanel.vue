<template>
    <div class="interview-questions-panel">
        <div class="panel-header">
            <h3 class="panel-title">面试问题库</h3>
            <div class="panel-actions">
                <el-button type="primary" size="small" @click="showAddQuestionDialog">
                    <el-icon>
                        <Plus />
                    </el-icon> 添加问题
                </el-button>
            </div>
        </div>

        <el-tabs v-model="activeTab" class="question-tabs">
            <!-- 待使用问题 -->
            <el-tab-pane label="待用问题" name="unused">
                <div v-if="unusedQuestions.length === 0" class="empty-questions">
                    <el-empty description="暂无待用问题" :image-size="60">
                        <template #extra>
                            <el-button type="primary" size="small" @click="showAddQuestionDialog">添加问题</el-button>
                        </template>
                    </el-empty>
                </div>

                <el-scrollbar height="300px">
                    <div v-for="question in unusedQuestions" :key="question.id" class="question-item"
                        :class="{ 'is-selected': selectedQuestion === question.id }">
                        <div class="question-content" @click="selectQuestion(question.id)">
                            <div class="question-text">{{ question.content }}</div>
                            <div class="question-meta">
                                <el-tag size="small" :type="getQuestionTypeColor(question.type)">
                                    {{ getQuestionTypeName(question.type) }}
                                </el-tag>
                            </div>
                        </div>
                        <div class="question-actions">
                            <el-button type="primary" size="small" @click="useQuestion(question.id)">
                                使用
                            </el-button>
                        </div>
                    </div>
                </el-scrollbar>
            </el-tab-pane>

            <!-- 已使用问题 -->
            <el-tab-pane label="已用问题" name="used">
                <div v-if="usedQuestions.length === 0" class="empty-questions">
                    <el-empty description="暂无已用问题" :image-size="60" />
                </div>

                <el-scrollbar height="300px">
                    <div v-for="question in usedQuestions" :key="question.id" class="question-item used-question">
                        <div class="question-content">
                            <div class="question-text">{{ question.content }}</div>
                            <div class="question-meta">
                                <el-tag size="small" :type="getQuestionTypeColor(question.type)">
                                    {{ getQuestionTypeName(question.type) }}
                                </el-tag>
                                <span class="use-time" v-if="question.usedAt">
                                    {{ formatTime(question.usedAt) }}
                                </span>
                            </div>
                        </div>
                    </div>
                </el-scrollbar>
            </el-tab-pane>
        </el-tabs>

        <!-- 添加问题对话框 -->
        <el-dialog v-model="addQuestionDialogVisible" title="添加面试问题" width="500px">
            <el-form ref="questionFormRef" :model="questionForm" :rules="questionRules" label-position="top">
                <el-form-item label="问题内容" prop="content">
                    <el-input v-model="questionForm.content" type="textarea" :rows="4" placeholder="请输入面试问题..." />
                </el-form-item>

                <el-form-item label="问题类型" prop="type">
                    <el-select v-model="questionForm.type" placeholder="选择问题类型" style="width: 100%">
                        <el-option label="技术问题" value="technical" />
                        <el-option label="行为问题" value="behavioral" />
                        <el-option label="情景问题" value="situational" />
                        <el-option label="基础问题" value="basic" />
                        <el-option label="开放问题" value="open" />
                        <el-option label="自定义" value="custom" />
                    </el-select>
                </el-form-item>
            </el-form>

            <template #footer>
                <span>
                    <el-button @click="addQuestionDialogVisible = false">取消</el-button>
                    <el-button type="primary" @click="handleAddQuestion(questionFormRef)">
                        添加
                    </el-button>
                </span>
            </template>
        </el-dialog>
    </div>
</template>

<script setup>
import { ref, defineProps, defineEmits } from 'vue'
import { Plus } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const props = defineProps({
    questions: {
        type: Array,
        default: () => []
    },
    usedQuestions: {
        type: Array,
        default: () => []
    },
    unusedQuestions: {
        type: Array,
        default: () => []
    }
})

const emit = defineEmits(['use-question', 'add-question'])

// 状态
const activeTab = ref('unused')
const selectedQuestion = ref(null)
const addQuestionDialogVisible = ref(false)
const questionFormRef = ref(null)
const questionForm = ref({
    content: '',
    type: 'technical'
})

// 表单验证规则
const questionRules = {
    content: [
        { required: true, message: '请输入问题内容', trigger: 'blur' },
        { min: 2, max: 500, message: '问题长度在2到500个字符之间', trigger: 'blur' }
    ],
    type: [
        { required: true, message: '请选择问题类型', trigger: 'change' }
    ]
}

// 获取问题类型名称
const getQuestionTypeName = (type) => {
    const typeMap = {
        'technical': '技术问题',
        'behavioral': '行为问题',
        'situational': '情景问题',
        'basic': '基础问题',
        'open': '开放问题',
        'custom': '自定义',
        'ai-suggestion': 'AI建议'
    }
    return typeMap[type] || '其他'
}

// 获取问题类型颜色
const getQuestionTypeColor = (type) => {
    const typeMap = {
        'technical': 'primary',
        'behavioral': 'success',
        'situational': 'warning',
        'basic': 'info',
        'open': '',
        'custom': '',
        'ai-suggestion': 'danger'
    }
    return typeMap[type] || ''
}

// 格式化时间
const formatTime = (dateString) => {
    const date = new Date(dateString)
    const hours = date.getHours().toString().padStart(2, '0')
    const minutes = date.getMinutes().toString().padStart(2, '0')

    return `${hours}:${minutes}`
}

// 选择问题
const selectQuestion = (questionId) => {
    selectedQuestion.value = questionId
}

// 使用问题
const useQuestion = (questionId) => {
    emit('use-question', questionId)

    // 找到对应的问题，添加使用时间
    const question = props.questions.find(q => q.id === questionId)
    if (question) {
        question.usedAt = new Date().toISOString()
    }

    // 自动切换到已用问题标签
    activeTab.value = 'used'
}

// 显示添加问题对话框
const showAddQuestionDialog = () => {
    // 重置表单
    questionForm.value = {
        content: '',
        type: 'technical'
    }

    addQuestionDialogVisible.value = true
}

// 添加问题
const handleAddQuestion = async (formEl) => {
    if (!formEl) return

    await formEl.validate((valid, fields) => {
        if (valid) {
            // 触发添加问题事件
            emit('add-question', {
                content: questionForm.value.content,
                type: questionForm.value.type
            })

            // 关闭对话框
            addQuestionDialogVisible.value = false

            ElMessage.success('问题添加成功')
        } else {
            console.log('表单验证失败:', fields)
        }
    })
}
</script>

<style scoped>
.interview-questions-panel {
    margin-bottom: 20px;
    background-color: #fff;
    border-radius: 4px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
    padding: 16px;

    .panel-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 16px;

        .panel-title {
            margin: 0;
            font-size: 16px;
            font-weight: 500;
        }
    }

    .question-tabs {
        .empty-questions {
            height: 200px;
            display: flex;
            justify-content: center;
            align-items: center;
        }

        .question-item {
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
            padding: 12px 16px;
            border-bottom: 1px solid #ebeef5;
            transition: background-color 0.3s;

            &:hover {
                background-color: #f5f7fa;
            }

            &.is-selected {
                background-color: #ecf5ff;
            }

            &.used-question {
                opacity: 0.7;
            }

            .question-content {
                flex: 1;

                .question-text {
                    margin-bottom: 8px;
                    line-height: 1.5;
                }

                .question-meta {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 12px;
                    color: #909399;

                    .use-time {
                        font-style: italic;
                    }
                }
            }

            .question-actions {
                margin-left: 16px;
            }
        }
    }
}
</style>