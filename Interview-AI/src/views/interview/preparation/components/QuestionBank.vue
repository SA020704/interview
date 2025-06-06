<template>
    <div class="question-bank-container">
        <div class="question-bank-header">
            <div class="search-bar">
                <el-input v-model="searchQuery" placeholder="搜索问题" clearable prefix-icon="Search"
                    @input="handleSearch" />

                <el-select v-model="categoryFilter" placeholder="分类筛选" clearable @change="filterQuestions">
                    <el-option label="全部" value="" />
                    <el-option v-for="category in categories" :key="category.id"
                        :label="`${category.name} (${category.count})`" :value="category.name" />
                </el-select>

                <el-select v-model="difficultyFilter" placeholder="难度筛选" clearable @change="filterQuestions">
                    <el-option label="全部" value="" />
                    <el-option label="简单" value="easy" />
                    <el-option label="中等" value="medium" />
                    <el-option label="困难" value="hard" />
                </el-select>

                <el-select v-model="tagFilter" placeholder="标签筛选" clearable @change="filterQuestions">
                    <el-option label="全部" value="" />
                    <el-option v-for="tag in tags" :key="tag.id" :label="`${tag.name} (${tag.count})`"
                        :value="tag.name" />
                </el-select>
            </div>

            <div class="action-buttons">
                <el-button type="primary" @click="handleAddQuestion">新增问题</el-button>
                <el-button @click="handleBatchImport">批量导入</el-button>
            </div>
        </div>

        <!-- 分类和问题列表 -->
        <div class="question-bank-content">
            <!-- 左侧分类树 -->
            <div class="category-tree">
                <div class="tree-header">
                    <span>问题分类</span>
                    <el-button link type="primary" @click="handleManageCategories">
                        <el-icon>
                            <EditPen />
                        </el-icon>
                    </el-button>
                </div>
                <el-tree :data="categoryTreeData" :props="{ label: 'name', children: 'children' }"
                    @node-click="handleCategorySelect" highlight-current default-expand-all />
            </div>

            <!-- 右侧问题列表 -->
            <div class="question-list">
                <el-table :data="filteredQuestions" border stripe style="width: 100%" v-loading="loading"
                    @selection-change="handleSelectionChange">
                    <el-table-column type="selection" width="55" />

                    <el-table-column label="问题标题" prop="title" min-width="250" show-overflow-tooltip />

                    <el-table-column label="分类" prop="category" width="150" />

                    <el-table-column label="难度" prop="difficulty" width="100">
                        <template #default="{ row }">
                            <el-tag :type="getDifficultyType(row.difficulty)" size="small">
                                {{ getDifficultyText(row.difficulty) }}
                            </el-tag>
                        </template>
                    </el-table-column>

                    <el-table-column label="标签" min-width="180" show-overflow-tooltip>
                        <template #default="{ row }">
                            <el-tag v-for="tag in row.tags" :key="tag" class="tag-item" size="small">
                                {{ tag }}
                            </el-tag>
                        </template>
                    </el-table-column>

                    <el-table-column label="使用次数" prop="useCount" width="100" sortable />

                    <el-table-column label="创建时间" prop="createTime" width="130" sortable />

                    <el-table-column label="操作" width="200" fixed="right">
                        <template #default="{ row }">
                            <el-button link type="primary" @click="previewQuestion(row)">查看</el-button>
                            <el-button link type="primary" @click="editQuestion(row)">编辑</el-button>
                            <el-button link type="danger" @click="deleteQuestion(row)">删除</el-button>
                        </template>
                    </el-table-column>
                </el-table>

                <!-- 批量操作工具栏 -->
                <div class="batch-actions" v-if="selectedQuestions.length > 0">
                    <span>已选择 {{ selectedQuestions.length }} 项</span>
                    <el-button size="small" @click="batchChangeCategory">修改分类</el-button>
                    <el-button size="small" @click="batchAddTags">添加标签</el-button>
                    <el-button size="small" type="danger" @click="batchDelete">批量删除</el-button>
                </div>

                <!-- 分页 -->
                <div class="pagination-container">
                    <el-pagination v-model:current-page="currentPage" v-model:page-size="pageSize"
                        :page-sizes="[10, 20, 50]" layout="total, sizes, prev, pager, next, jumper" :total="total"
                        @size-change="handleSizeChange" @current-change="handleCurrentChange" />
                </div>
            </div>
        </div>

        <!-- 问题表单对话框 -->
        <el-dialog v-model="dialogVisible" :title="formType === 'add' ? '新增问题' : '编辑问题'" width="700px" destroy-on-close>
            <el-form :model="questionForm" :rules="rules" ref="questionFormRef" label-width="100px">
                <el-form-item label="问题标题" prop="title">
                    <el-input v-model="questionForm.title" placeholder="请输入问题标题" />
                </el-form-item>

                <el-form-item label="问题内容" prop="content">
                    <el-input v-model="questionForm.content" type="textarea" rows="5" placeholder="请输入问题详细内容" />
                </el-form-item>

                <el-form-item label="问题分类" prop="category">
                    <el-select v-model="questionForm.category" placeholder="请选择问题分类" style="width: 100%">
                        <el-option v-for="category in categories" :key="category.id" :label="category.name"
                            :value="category.name" />
                    </el-select>
                </el-form-item>

                <el-form-item label="难度" prop="difficulty">
                    <el-radio-group v-model="questionForm.difficulty">
                        <el-radio label="easy">简单</el-radio>
                        <el-radio label="medium">中等</el-radio>
                        <el-radio label="hard">困难</el-radio>
                    </el-radio-group>
                </el-form-item>

                <el-form-item label="标签" prop="tags">
                    <el-select v-model="questionForm.tags" multiple filterable allow-create default-first-option
                        placeholder="请选择或添加标签" style="width: 100%">
                        <el-option v-for="tag in tags" :key="tag.id" :label="tag.name" :value="tag.name" />
                    </el-select>
                </el-form-item>

                <el-form-item label="参考答案" prop="sampleAnswer">
                    <el-input v-model="questionForm.sampleAnswer" type="textarea" rows="4" placeholder="请输入参考答案" />
                </el-form-item>

                <el-form-item label="评分要点" prop="scorePoints">
                    <el-input v-model="questionForm.scorePoints" type="textarea" rows="3" placeholder="请输入评分要点" />
                </el-form-item>

                <el-form-item label="是否公开" prop="isPublic">
                    <el-switch v-model="questionForm.isPublic" />
                </el-form-item>
            </el-form>

            <template #footer>
                <span class="dialog-footer">
                    <el-button @click="dialogVisible = false">取消</el-button>
                    <el-button type="primary" :loading="submitLoading" @click="submitQuestionForm">
                        {{ formType === 'add' ? '添加' : '保存' }}
                    </el-button>
                </span>
            </template>
        </el-dialog>

        <!-- 问题预览对话框 -->
        <el-dialog v-model="previewVisible" title="问题详情" width="700px">
            <div v-if="currentQuestion" class="question-preview">
                <div class="question-header">
                    <div class="question-title">
                        <h2>{{ currentQuestion.title }}</h2>
                        <div class="question-info">
                            <el-tag size="small" class="mr-5">{{ currentQuestion.category }}</el-tag>
                            <el-tag :type="getDifficultyType(currentQuestion.difficulty)" size="small" class="mr-5">
                                {{ getDifficultyText(currentQuestion.difficulty) }}
                            </el-tag>
                            <span class="question-stat">使用次数: {{ currentQuestion.useCount }}</span>
                        </div>
                    </div>
                    <div class="question-tags">
                        <el-tag v-for="tag in currentQuestion.tags" :key="tag" size="small" class="tag-item">
                            {{ tag }}
                        </el-tag>
                    </div>
                </div>

                <el-divider />

                <el-tabs>
                    <el-tab-pane label="问题内容">
                        <div class="question-content">
                            <div class="content-section">
                                <h3>问题详情</h3>
                                <p>{{ currentQuestion.content }}</p>
                            </div>
                        </div>
                    </el-tab-pane>

                    <el-tab-pane label="参考答案">
                        <div class="content-section">
                            <h3>答案</h3>
                            <p>{{ currentQuestion.sampleAnswer }}</p>
                        </div>

                        <div class="content-section">
                            <h3>评分要点</h3>
                            <p>{{ currentQuestion.scorePoints }}</p>
                        </div>
                    </el-tab-pane>
                </el-tabs>

                <div class="question-meta">
                    <div>创建人: {{ currentQuestion.createdBy }}</div>
                    <div>创建时间: {{ currentQuestion.createTime }}</div>
                    <div>更新时间: {{ currentQuestion.updateTime }}</div>
                </div>
            </div>
        </el-dialog>

        <!-- 批量修改分类对话框 -->
        <el-dialog v-model="batchCategoryDialogVisible" title="批量修改分类" width="400px">
            <el-form :model="batchCategoryForm" label-width="80px">
                <el-form-item label="新分类">
                    <el-select v-model="batchCategoryForm.category" placeholder="请选择分类" style="width: 100%">
                        <el-option v-for="category in categories" :key="category.id" :label="category.name"
                            :value="category.name" />
                    </el-select>
                </el-form-item>
            </el-form>
            <template #footer>
                <span class="dialog-footer">
                    <el-button @click="batchCategoryDialogVisible = false">取消</el-button>
                    <el-button type="primary" @click="confirmBatchCategory">确定</el-button>
                </span>
            </template>
        </el-dialog>

        <!-- 批量添加标签对话框 -->
        <el-dialog v-model="batchTagDialogVisible" title="批量添加标签" width="400px">
            <el-form :model="batchTagForm" label-width="80px">
                <el-form-item label="添加标签">
                    <el-select v-model="batchTagForm.tags" multiple filterable allow-create default-first-option
                        placeholder="请选择或添加标签" style="width: 100%">
                        <el-option v-for="tag in tags" :key="tag.id" :label="tag.name" :value="tag.name" />
                    </el-select>
                </el-form-item>
            </el-form>
            <template #footer>
                <span class="dialog-footer">
                    <el-button @click="batchTagDialogVisible = false">取消</el-button>
                    <el-button type="primary" @click="confirmBatchTags">确定</el-button>
                </span>
            </template>
        </el-dialog>
    </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useQuestionStore } from '@/store/modules/question'
import { Search, EditPen } from '@element-plus/icons-vue'

// Store
const questionStore = useQuestionStore()

// 状态
const loading = ref(false)
const submitLoading = ref(false)
const dialogVisible = ref(false)
const previewVisible = ref(false)
const batchCategoryDialogVisible = ref(false)
const batchTagDialogVisible = ref(false)
const formType = ref('add')
const searchQuery = ref('')
const categoryFilter = ref('')
const difficultyFilter = ref('')
const tagFilter = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const currentQuestion = ref(null)
const selectedQuestions = ref([])

// 批量操作表单
const batchCategoryForm = reactive({
    category: ''
})

const batchTagForm = reactive({
    tags: []
})

// 问题表单
const questionFormRef = ref(null)
const questionForm = reactive({
    title: '',
    content: '',
    category: '',
    difficulty: 'medium',
    tags: [],
    sampleAnswer: '',
    scorePoints: '',
    isPublic: true
})

// 表单验证规则
const rules = {
    title: [
        { required: true, message: '请输入问题标题', trigger: 'blur' },
        { min: 5, message: '标题长度不能少于5个字符', trigger: 'blur' }
    ],
    content: [
        { required: true, message: '请输入问题内容', trigger: 'blur' }
    ],
    category: [
        { required: true, message: '请选择问题分类', trigger: 'change' }
    ],
    difficulty: [
        { required: true, message: '请选择问题难度', trigger: 'change' }
    ]
}

// 分类和标签
const categories = computed(() => questionStore.categories)
const tags = computed(() => questionStore.tags)

// 分类树数据
const categoryTreeData = computed(() => {
    return [
        {
            id: 0,
            name: '全部问题',
            children: categories.value.map(cat => ({
                id: cat.id,
                name: `${cat.name} (${cat.count})`,
                rawName: cat.name
            }))
        }
    ]
})

// 过滤后的问题列表
const filteredQuestions = computed(() => {
    return questionStore.questionList.slice(0, pageSize.value)
})

// 获取难度类型
const getDifficultyType = (difficulty) => {
    const difficultyMap = {
        easy: 'success',
        medium: 'warning',
        hard: 'danger'
    }
    return difficultyMap[difficulty] || 'info'
}

// 获取难度文本
const getDifficultyText = (difficulty) => {
    const difficultyMap = {
        easy: '简单',
        medium: '中等',
        hard: '困难'
    }
    return difficultyMap[difficulty] || '未知'
}

// 搜索处理
const handleSearch = () => {
    currentPage.value = 1
    fetchQuestionList()
}

// 筛选问题
const filterQuestions = () => {
    currentPage.value = 1
    fetchQuestionList()
}

// 分页大小变化
const handleSizeChange = (val) => {
    pageSize.value = val
    currentPage.value = 1
    fetchQuestionList()
}

// 当前页变化
const handleCurrentChange = (val) => {
    currentPage.value = val
    fetchQuestionList()
}

// 选择表格行变化
const handleSelectionChange = (selection) => {
    selectedQuestions.value = selection
}

// 添加问题
const handleAddQuestion = () => {
    formType.value = 'add'
    dialogVisible.value = true

    // 重置表单
    Object.keys(questionForm).forEach(key => {
        questionForm[key] = key === 'difficulty' ? 'medium' : key === 'tags' ? [] : key === 'isPublic' ? true : ''
    })
}

// 编辑问题
const editQuestion = (row) => {
    formType.value = 'edit'
    dialogVisible.value = true
    currentQuestion.value = row

    // 填充表单
    Object.keys(questionForm).forEach(key => {
        if (key in row) {
            questionForm[key] = row[key]
        }
    })
}

// 删除问题
const deleteQuestion = (row) => {
    ElMessageBox.confirm(
        `确定要删除问题 "${row.title}" 吗？`,
        '提示',
        {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
        }
    ).then(async () => {
        try {
            await questionStore.deleteQuestion(row.id)
            ElMessage.success('删除成功')
            fetchQuestionList()
        } catch (error) {
            ElMessage.error('删除失败：' + error.message)
        }
    }).catch(() => { })
}

// 查看问题详情
const previewQuestion = (row) => {
    currentQuestion.value = row
    previewVisible.value = true
}

// 批量导入
const handleBatchImport = () => {
    ElMessage.info('功能开发中：批量导入问题')
}

// 批量修改分类
const batchChangeCategory = () => {
    if (selectedQuestions.value.length === 0) {
        ElMessage.warning('请选择要修改的问题')
        return
    }

    batchCategoryForm.category = ''
    batchCategoryDialogVisible.value = true
}

// 确认批量修改分类
const confirmBatchCategory = async () => {
    if (!batchCategoryForm.category) {
        ElMessage.warning('请选择分类')
        return
    }

    const questionIds = selectedQuestions.value.map(q => q.id)

    try {
        loading.value = true

        // 逐个更新问题分类
        for (const id of questionIds) {
            await questionStore.updateQuestion(id, { category: batchCategoryForm.category })
        }

        ElMessage.success('批量修改分类成功')
        batchCategoryDialogVisible.value = false
        fetchQuestionList()
    } catch (error) {
        ElMessage.error('批量修改失败：' + error.message)
    } finally {
        loading.value = false
    }
}

// 批量添加标签
const batchAddTags = () => {
    if (selectedQuestions.value.length === 0) {
        ElMessage.warning('请选择要添加标签的问题')
        return
    }

    batchTagForm.tags = []
    batchTagDialogVisible.value = true
}

// 确认批量添加标签
const confirmBatchTags = async () => {
    if (batchTagForm.tags.length === 0) {
        ElMessage.warning('请选择要添加的标签')
        return
    }

    try {
        loading.value = true

        // 逐个更新问题标签
        for (const question of selectedQuestions.value) {
            // 合并标签并去重
            const updatedTags = [...new Set([...question.tags, ...batchTagForm.tags])]
            await questionStore.updateQuestion(question.id, { tags: updatedTags })
        }

        ElMessage.success('批量添加标签成功')
        batchTagDialogVisible.value = false
        fetchQuestionList()
    } catch (error) {
        ElMessage.error('批量添加标签失败：' + error.message)
    } finally {
        loading.value = false
    }
}

// 批量删除
const batchDelete = () => {
    if (selectedQuestions.value.length === 0) {
        ElMessage.warning('请选择要删除的问题')
        return
    }

    ElMessageBox.confirm(
        `确定要删除选中的 ${selectedQuestions.value.length} 个问题吗？`,
        '提示',
        {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
        }
    ).then(async () => {
        try {
            loading.value = true

            // 逐个删除问题
            for (const question of selectedQuestions.value) {
                await questionStore.deleteQuestion(question.id)
            }

            ElMessage.success('批量删除成功')
            fetchQuestionList()
        } catch (error) {
            ElMessage.error('批量删除失败：' + error.message)
        } finally {
            loading.value = false
        }
    }).catch(() => { })
}

// 管理分类
const handleManageCategories = () => {
    ElMessage.info('功能开发中：管理问题分类')
}

// 选择分类
const handleCategorySelect = (data) => {
    if (data.id === 0) {
        // 全部问题
        categoryFilter.value = ''
    } else {
        // 特定分类
        categoryFilter.value = data.rawName
    }

    fetchQuestionList()
}

// 提交问题表单
const submitQuestionForm = () => {
    questionFormRef.value.validate(async (valid) => {
        if (!valid) return

        submitLoading.value = true

        try {
            if (formType.value === 'add') {
                await questionStore.createQuestion(questionForm)
                ElMessage.success('添加问题成功')
            } else {
                const questionId = currentQuestion.value?.id
                if (questionId) {
                    await questionStore.updateQuestion(questionId, questionForm)
                    ElMessage.success('更新问题成功')
                }
            }

            dialogVisible.value = false
            fetchQuestionList()
        } catch (error) {
            ElMessage.error(formType.value === 'add' ? '添加问题失败' : '更新问题失败')
        } finally {
            submitLoading.value = false
        }
    })
}

// 获取问题列表
const fetchQuestionList = async () => {
    loading.value = true
    try {
        const params = {
            pageSize: pageSize.value,
            currentPage: currentPage.value,
            keyword: searchQuery.value,
            category: categoryFilter.value,
            difficulty: difficultyFilter.value,
            tag: tagFilter.value
        }

        await questionStore.fetchQuestionList(params)
        total.value = questionStore.total
    } catch (error) {
        ElMessage.error('获取问题列表失败')
    } finally {
        loading.value = false
    }
}

// 获取问题分类和标签
const fetchCategoriesAndTags = async () => {
    try {
        await Promise.all([
            questionStore.fetchCategories(),
            questionStore.fetchTags()
        ])
    } catch (error) {
        ElMessage.error('获取分类和标签失败')
    }
}

onMounted(() => {
    fetchQuestionList()
    fetchCategoriesAndTags()
})
</script>

<style scoped>
.question-bank-container {
    .question-bank-header {
        display: flex;
        justify-content: space-between;
        margin-bottom: 20px;

        .search-bar {
            display: flex;
            gap: 10px;
            flex: 1;
            max-width: 800px;
        }

        .action-buttons {
            display: flex;
            gap: 10px;
        }
    }

    .question-bank-content {
        display: flex;
        background-color: #fff;
        border-radius: 4px;
        box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);

        .category-tree {
            width: 250px;
            border-right: 1px solid #EBEEF5;
            padding: 15px;

            .tree-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding-bottom: 10px;
                margin-bottom: 10px;
                border-bottom: 1px solid #EBEEF5;
                font-weight: bold;
            }
        }

        .question-list {
            flex: 1;
            padding: 15px;
            overflow: hidden;

            .tag-item {
                margin-right: 5px;
                margin-bottom: 5px;
            }

            .batch-actions {
                margin: 15px 0;
                padding: 10px;
                background-color: #f5f7fa;
                border-radius: 4px;
                display: flex;
                align-items: center;
                gap: 10px;
            }

            .pagination-container {
                margin-top: 20px;
                display: flex;
                justify-content: flex-end;
            }
        }
    }

    .question-preview {
        .question-header {
            margin-bottom: 15px;

            .question-title {
                h2 {
                    margin: 0 0 10px 0;
                }

                .question-info {
                    display: flex;
                    align-items: center;

                    .mr-5 {
                        margin-right: 10px;
                    }

                    .question-stat {
                        color: #909399;
                        font-size: 14px;
                    }
                }
            }

            .question-tags {
                margin-top: 10px;

                .tag-item {
                    margin-right: 5px;
                }
            }
        }

        .content-section {
            margin-bottom: 20px;

            h3 {
                font-size: 16px;
                margin-top: 0;
                margin-bottom: 10px;
                color: #303133;
            }

            p {
                color: #606266;
                line-height: 1.6;
                margin: 0;
                white-space: pre-line;
            }
        }

        .question-meta {
            margin-top: 20px;
            color: #909399;
            font-size: 13px;
            display: flex;
            flex-wrap: wrap;
            gap: 15px;
        }
    }
}

:deep(.el-tree-node__content) {
    height: 36px;
}

:deep(.el-tabs__content) {
    padding: 15px 0;
}
</style>