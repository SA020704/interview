<template>
    <div class="question-list-container">
        <!-- 搜索和筛选区域 -->
        <div class="filters">
            <el-input v-model="searchQuery" placeholder="搜索问题..." class="search-input" clearable @input="handleSearch">
                <template #prefix>
                    <el-icon>
                        <Search />
                    </el-icon>
                </template>
            </el-input>

            <el-select v-model="selectedCategory" placeholder="选择分类" clearable @change="handleCategoryChange">
                <el-option v-for="item in categories" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>

            <el-select v-model="difficulty" placeholder="难度" clearable @change="handleSearch">
                <el-option label="简单" value="easy" />
                <el-option label="中等" value="medium" />
                <el-option label="困难" value="hard" />
            </el-select>
        </div>

        <!-- 问题列表 -->
        <div class="questions-wrapper" v-loading="loading">
            <el-empty v-if="filteredQuestions.length === 0" description="暂无问题" />

            <div v-else class="question-list">
                <el-card v-for="(question, index) in filteredQuestions" :key="question.id" class="question-card"
                    :class="{ 'active': selectedQuestionId === question.id }" @click="selectQuestion(question)">
                    <div class="question-header">
                        <div class="question-info">
                            <span class="question-index">{{ index + 1 }}</span>
                            <span class="question-title">{{ question.title }}</span>
                        </div>
                        <div class="question-tags">
                            <el-tag size="small" :type="getDifficultyType(question.difficulty)">
                                {{ getDifficultyLabel(question.difficulty) }}
                            </el-tag>
                            <el-tag size="small" type="info" v-if="question.category">
                                {{ question.category }}
                            </el-tag>
                        </div>
                    </div>

                    <div class="question-content">
                        <p>{{ question.description }}</p>
                    </div>

                    <div class="question-actions">
                        <el-button type="primary" size="small" @click.stop="viewDetail(question)">
                            查看详情
                        </el-button>
                        <el-button type="success" size="small" @click.stop="addToInterview(question)">
                            添加到面试
                        </el-button>
                    </div>
                </el-card>
            </div>
        </div>

        <!-- 分页 -->
        <div class="pagination-container">
            <el-pagination v-model:current-page="currentPage" v-model:page-size="pageSize"
                :page-sizes="[10, 20, 30, 50]" layout="total, sizes, prev, pager, next, jumper" :total="totalQuestions"
                @size-change="handleSizeChange" @current-change="handleCurrentChange" />
        </div>

        <!-- 问题详情对话框 -->
        <el-dialog v-model="dialogVisible" title="问题详情" width="50%" :destroy-on-close="true">
            <div v-if="selectedQuestion" class="question-detail">
                <h2>{{ selectedQuestion.title }}</h2>

                <div class="question-meta">
                    <el-tag size="small" :type="getDifficultyType(selectedQuestion.difficulty)">
                        {{ getDifficultyLabel(selectedQuestion.difficulty) }}
                    </el-tag>
                    <el-tag size="small" type="info" v-if="selectedQuestion.category">
                        {{ selectedQuestion.category }}
                    </el-tag>
                </div>

                <div class="detail-section">
                    <h3>问题描述</h3>
                    <p>{{ selectedQuestion.description }}</p>
                </div>

                <div class="detail-section"
                    v-if="selectedQuestion.followUpQuestions && selectedQuestion.followUpQuestions.length > 0">
                    <h3>跟进问题</h3>
                    <ul>
                        <li v-for="(followUp, index) in selectedQuestion.followUpQuestions" :key="index">
                            {{ followUp.text }}
                        </li>
                    </ul>
                </div>

                <div class="detail-section" v-if="selectedQuestion.expectedAnswers">
                    <h3>预期答案</h3>
                    <div v-html="selectedQuestion.expectedAnswers"></div>
                </div>

                <div class="detail-section" v-if="selectedQuestion.tips && selectedQuestion.tips.length > 0">
                    <h3>评分要点</h3>
                    <ul>
                        <li v-for="(tip, index) in selectedQuestion.tips" :key="index">
                            {{ tip }}
                        </li>
                    </ul>
                </div>
            </div>

            <template #footer>
                <span class="dialog-footer">
                    <el-button @click="dialogVisible = false">关闭</el-button>
                    <el-button type="primary" @click="addToInterview(selectedQuestion)">
                        添加到面试
                    </el-button>
                </span>
            </template>
        </el-dialog>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { Search } from '@element-plus/icons-vue'
import { getQuestionList } from '@/api/interview'
import { ElMessage } from 'element-plus'

// 状态变量
const loading = ref(false)
const searchQuery = ref('')
const selectedCategory = ref('')
const difficulty = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const totalQuestions = ref(0)
const questions = ref([])
const selectedQuestionId = ref(null)
const selectedQuestion = ref(null)
const dialogVisible = ref(false)

// 分类列表
const categories = ref([
    { label: '技术能力', value: 'technical' },
    { label: '工作经验', value: 'experience' },
    { label: '算法', value: 'algorithm' },
    { label: '软技能', value: 'soft-skills' },
    { label: '专业知识', value: 'knowledge' }
])

// 获取问题列表
const fetchQuestions = async () => {
    loading.value = true
    try {
        const params = {
            page: currentPage.value,
            limit: pageSize.value,
            search: searchQuery.value,
            category: selectedCategory.value,
            difficulty: difficulty.value
        }

        const response = await getQuestionList(params)
        questions.value = response.data.items || []
        totalQuestions.value = response.data.total || 0
    } catch (error) {
        console.error('获取问题列表失败:', error)
        ElMessage.error('获取问题列表失败')
    } finally {
        loading.value = false
    }
}

// 筛选后的问题列表
const filteredQuestions = computed(() => {
    return questions.value
})

// 处理搜索
const handleSearch = () => {
    currentPage.value = 1
    fetchQuestions()
}

// 处理分类变化
const handleCategoryChange = () => {
    currentPage.value = 1
    fetchQuestions()
}

// 分页处理
const handleSizeChange = (val) => {
    pageSize.value = val
    fetchQuestions()
}

const handleCurrentChange = (val) => {
    currentPage.value = val
    fetchQuestions()
}

// 选择问题
const selectQuestion = (question) => {
    selectedQuestionId.value = question.id
    selectedQuestion.value = question
}

// 查看问题详情
const viewDetail = (question) => {
    selectedQuestion.value = question
    dialogVisible.value = true
}

// 添加问题到面试
const addToInterview = (question) => {
    ElMessage.success(`已添加问题: ${question.title}`)
    // 这里可以发出事件通知父组件添加问题到面试列表
    // emit('add-question', question)
    dialogVisible.value = false
}

// 获取难度标签样式
const getDifficultyType = (difficulty) => {
    const types = {
        easy: 'success',
        medium: 'warning',
        hard: 'danger'
    }
    return types[difficulty] || 'info'
}

// 获取难度标签文本
const getDifficultyLabel = (difficulty) => {
    const labels = {
        easy: '简单',
        medium: '中等',
        hard: '困难'
    }
    return labels[difficulty] || difficulty
}

// 监听筛选条件变化
watch([searchQuery, selectedCategory, difficulty], () => {
    // 防抖处理...
}, { deep: true })

// 初始化加载数据
onMounted(() => {
    fetchQuestions()
})
</script>

<style scoped>
.question-list-container {
    height: 100%;
    display: flex;
    flex-direction: column;
}

.filters {
    display: flex;
    gap: 10px;
    margin-bottom: 20px;

    .search-input {
        flex: 1;
    }

    .el-select {
        width: 150px;
    }
}

.questions-wrapper {
    flex: 1;
    overflow-y: auto;
    margin-bottom: 20px;
}

.question-list {
    display: flex;
    flex-direction: column;
    gap: 15px;
}

.question-card {
    cursor: pointer;
    transition: all 0.3s;

    &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }

    &.active {
        border-left: 3px solid var(--el-color-primary);
    }

    .question-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 10px;

        .question-info {
            display: flex;
            align-items: center;
            gap: 10px;

            .question-index {
                background-color: var(--el-color-primary-light-8);
                color: var(--el-color-primary);
                width: 24px;
                height: 24px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-weight: bold;
                font-size: 14px;
            }

            .question-title {
                font-weight: bold;
                font-size: 16px;
            }
        }

        .question-tags {
            display: flex;
            gap: 5px;
        }
    }

    .question-content {
        color: #606266;
        font-size: 14px;
        margin-bottom: 15px;
        line-height: 1.5;

        p {
            margin: 0;
            overflow: hidden;
            text-overflow: ellipsis;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
        }
    }

    .question-actions {
        display: flex;
        justify-content: flex-end;
        gap: 10px;
    }
}

.pagination-container {
    display: flex;
    justify-content: center;
    margin-top: 10px;
}

.question-detail {
    h2 {
        margin-top: 0;
        margin-bottom: 15px;
    }

    .question-meta {
        display: flex;
        gap: 10px;
        margin-bottom: 20px;
    }

    .detail-section {
        margin-bottom: 20px;

        h3 {
            font-size: 16px;
            margin-bottom: 10px;
            color: #303133;
        }

        ul {
            margin: 0;
            padding-left: 20px;

            li {
                margin-bottom: 5px;
            }
        }
    }
}

@media (max-width: 768px) {
    .filters {
        flex-direction: column;

        .search-input,
        .el-select {
            width: 100%;
        }
    }
}
</style>