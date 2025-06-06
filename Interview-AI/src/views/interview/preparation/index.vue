<template>
    <div class="preparation-container">
        <div class="preparation-header">
            <h1>面试准备</h1>
            <el-button type="primary" @click="createNewInterview">
                <el-icon>
                    <Plus />
                </el-icon> 创建面试
            </el-button>
        </div>

        <el-tabs v-model="activeTab" class="preparation-tabs">
            <el-tab-pane label="面试计划" name="interviews">
                <div class="tab-content">
                    <!-- 面试计划列表 -->
                    <div v-if="interviewList.length > 0">
                        <div class="tool-bar">
                            <el-input v-model="searchKeyword" placeholder="搜索面试计划" prefix-icon="Search" clearable
                                class="search-input" />
                            <div class="filter-group">
                                <el-select v-model="filterStatus" placeholder="状态筛选" clearable>
                                    <el-option label="全部" value="" />
                                    <el-option label="待执行" value="pending" />
                                    <el-option label="已完成" value="completed" />
                                    <el-option label="已取消" value="canceled" />
                                </el-select>
                                <el-date-picker v-model="dateRange" type="daterange" range-separator="至"
                                    start-placeholder="开始日期" end-placeholder="结束日期" format="YYYY/MM/DD"
                                    value-format="YYYY-MM-DD" />
                            </div>
                        </div>

                        <el-table :data="filteredInterviews" style="width: 100%" v-loading="loading">
                            <el-table-column prop="id" label="ID" width="80" />
                            <el-table-column prop="candidateName" label="候选人" width="120">
                                <template #default="{ row }">
                                    <el-tooltip :content="row.candidateInfo || '未填写候选人信息'" placement="top"
                                        :show-after="500">
                                        <span>{{ row.candidateName }}</span>
                                    </el-tooltip>
                                </template>
                            </el-table-column>
                            <el-table-column prop="position" label="应聘职位" width="150" />
                            <el-table-column prop="interviewType" label="面试类型" width="120">
                                <template #default="{ row }">
                                    <el-tag :type="getInterviewTypeTagType(row.interviewType)" effect="plain">
                                        {{ getInterviewTypeText(row.interviewType) }}
                                    </el-tag>
                                </template>
                            </el-table-column>
                            <el-table-column prop="date" label="面试日期" width="180" sortable />
                            <el-table-column prop="status" label="状态" width="100">
                                <template #default="{ row }">
                                    <el-tag :type="getStatusTagType(row.status)">
                                        {{ getStatusText(row.status) }}
                                    </el-tag>
                                </template>
                            </el-table-column>
                            <el-table-column prop="interviewers" label="面试官" width="150">
                                <template #default="{ row }">
                                    <el-tooltip :content="row.interviewers.join('、')" placement="top" :show-after="500">
                                        <div class="interviewer-list">
                                            <template v-for="(name, index) in row.interviewers.slice(0, 2)"
                                                :key="index">
                                                <el-avatar :size="24" class="interviewer-avatar">{{ name.charAt(0)
                                                }}</el-avatar>
                                            </template>
                                            <span v-if="row.interviewers.length > 2" class="more-interviewers">
                                                +{{ row.interviewers.length - 2 }}
                                            </span>
                                        </div>
                                    </el-tooltip>
                                </template>
                            </el-table-column>
                            <el-table-column label="操作" fixed="right" width="220">
                                <template #default="{ row }">
                                    <el-button v-if="row.status === 'pending'" type="primary" size="small"
                                        @click="startInterview(row)">
                                        开始面试
                                    </el-button>
                                    <el-button v-if="row.status === 'completed'" type="success" size="small"
                                        @click="viewResult(row)">
                                        查看结果
                                    </el-button>
                                    <el-button type="info" size="small" @click="editInterview(row)">
                                        编辑
                                    </el-button>
                                    <el-button type="danger" size="small" @click="deleteInterview(row)">
                                        删除
                                    </el-button>
                                </template>
                            </el-table-column>
                        </el-table>

                        <div class="pagination-container">
                            <el-pagination v-model:current-page="currentPage" v-model:page-size="pageSize"
                                :page-sizes="[10, 20, 50, 100]" layout="total, sizes, prev, pager, next, jumper"
                                :total="totalCount" @size-change="handleSizeChange"
                                @current-change="handleCurrentChange" />
                        </div>
                    </div>

                    <!-- 空状态展示 -->
                    <div class="empty-placeholder" v-else>
                        <el-empty description="暂无面试计划" :image-size="120">
                            <el-button type="primary" @click="createNewInterview">创建面试</el-button>
                        </el-empty>
                    </div>
                </div>
            </el-tab-pane>

            <el-tab-pane label="候选人管理" name="candidates">
                <div class="tab-content">
                    <!-- 候选人管理将在这里实现 -->
                    <div class="empty-placeholder" v-if="candidateList.length === 0">
                        <el-empty description="暂无候选人信息" :image-size="120">
                            <el-button type="primary" @click="importCandidates">导入候选人</el-button>
                        </el-empty>
                    </div>
                </div>
            </el-tab-pane>

            <el-tab-pane label="问题库" name="questions">
                <div class="tab-content">
                    <!-- 问题库管理将在这里实现 -->
                    <div class="empty-placeholder" v-if="questionList.length === 0">
                        <el-empty description="暂无问题" :image-size="120">
                            <el-button type="primary" @click="createQuestion">创建问题</el-button>
                        </el-empty>
                    </div>
                </div>
            </el-tab-pane>
        </el-tabs>

        <!-- 创建面试对话框 -->
        <el-dialog v-model="createInterviewDialogVisible" title="创建面试" width="600px" destroy-on-close>
            <el-form :model="interviewForm" :rules="formRules" ref="interviewFormRef" label-width="100px">
                <el-form-item label="候选人" prop="candidateName">
                    <el-select v-model="interviewForm.candidateName" filterable placeholder="选择候选人" class="full-width">
                        <el-option v-for="item in candidateOptions" :key="item.value" :label="item.label"
                            :value="item.value" />
                    </el-select>
                </el-form-item>

                <el-form-item label="应聘职位" prop="position">
                    <el-input v-model="interviewForm.position" placeholder="请输入应聘职位" />
                </el-form-item>

                <el-form-item label="面试类型" prop="interviewType">
                    <el-select v-model="interviewForm.interviewType" placeholder="选择面试类型" class="full-width">
                        <el-option label="技术面试" value="technical" />
                        <el-option label="HR面试" value="hr" />
                        <el-option label="初筛面试" value="screening" />
                        <el-option label="终面" value="final" />
                    </el-select>
                </el-form-item>

                <el-form-item label="面试日期" prop="date">
                    <el-date-picker v-model="interviewForm.date" type="datetime" placeholder="选择面试日期时间"
                        format="YYYY-MM-DD HH:mm" value-format="YYYY-MM-DD HH:mm" class="full-width" />
                </el-form-item>

                <el-form-item label="面试官" prop="interviewers">
                    <el-select v-model="interviewForm.interviewers" multiple filterable allow-create
                        default-first-option placeholder="请选择面试官" class="full-width">
                        <el-option v-for="item in interviewerOptions" :key="item.value" :label="item.label"
                            :value="item.value" />
                    </el-select>
                </el-form-item>

                <el-form-item label="备注">
                    <el-input v-model="interviewForm.note" type="textarea" :rows="3" placeholder="请输入备注信息" />
                </el-form-item>
            </el-form>
            <template #footer>
                <span class="dialog-footer">
                    <el-button @click="createInterviewDialogVisible = false">取消</el-button>
                    <el-button type="primary" @click="submitInterviewForm" :loading="submitting">确认</el-button>
                </span>
            </template>
        </el-dialog>

        <!-- 导入候选人对话框 -->
        <el-dialog v-model="importCandidateDialogVisible" title="导入候选人" width="600px" destroy-on-close>
            <p>候选人导入表单将在这里实现</p>
            <template #footer>
                <span class="dialog-footer">
                    <el-button @click="importCandidateDialogVisible = false">取消</el-button>
                    <el-button type="primary" @click="submitCandidateImport">确认</el-button>
                </span>
            </template>
        </el-dialog>

        <!-- 创建问题对话框 -->
        <el-dialog v-model="createQuestionDialogVisible" title="创建问题" width="600px" destroy-on-close>
            <p>问题创建表单将在这里实现</p>
            <template #footer>
                <span class="dialog-footer">
                    <el-button @click="createQuestionDialogVisible = false">取消</el-button>
                    <el-button type="primary" @click="submitQuestionForm">确认</el-button>
                </span>
            </template>
        </el-dialog>
    </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { Plus, Search } from '@element-plus/icons-vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { useInterviewStore } from '@/store/modules/interview';

const router = useRouter();
const interviewStore = useInterviewStore();

// 激活的标签页
const activeTab = ref('interviews');

// 对话框可见性
const createInterviewDialogVisible = ref(false);
const importCandidateDialogVisible = ref(false);
const createQuestionDialogVisible = ref(false);

// 分页相关
const currentPage = ref(1);
const pageSize = ref(10);
const totalCount = ref(100);

// 搜索和筛选
const searchKeyword = ref('');
const filterStatus = ref('');
const dateRange = ref(null);
const loading = ref(false);
const submitting = ref(false);

// 模拟数据
const interviewList = ref([
    {
        id: 1,
        candidateName: '张三',
        candidateInfo: '3年经验，前端开发工程师',
        position: '前端开发工程师',
        interviewType: 'technical',
        date: '2023-07-15 14:30',
        status: 'completed',
        interviewers: ['李四', '王五', '赵六'],
        note: '候选人熟悉Vue和React技术栈'
    },
    {
        id: 2,
        candidateName: '李四',
        candidateInfo: '5年经验，资深后端开发',
        position: '后端开发工程师',
        interviewType: 'technical',
        date: '2023-07-16 10:00',
        status: 'pending',
        interviewers: ['张三', '王五'],
        note: '重点考察系统设计能力'
    },
    {
        id: 3,
        candidateName: '王五',
        candidateInfo: '2年经验，产品经理',
        position: '产品经理',
        interviewType: 'hr',
        date: '2023-07-16 15:30',
        status: 'canceled',
        interviewers: ['张三', '赵六'],
        note: ''
    },
    {
        id: 4,
        candidateName: '赵六',
        candidateInfo: '8年经验，技术专家',
        position: '技术负责人',
        interviewType: 'final',
        date: '2023-07-18 09:30',
        status: 'pending',
        interviewers: ['张三', '李四', '王五', '钱七'],
        note: '终面，重点考察领导力和技术深度'
    }
]);
const candidateList = ref([]);
const questionList = ref([]);

// 面试表单
const interviewFormRef = ref(null);
const interviewForm = reactive({
    candidateName: '',
    position: '',
    interviewType: 'technical',
    date: '',
    interviewers: [],
    note: ''
});

// 表单验证规则
const formRules = {
    candidateName: [
        { required: true, message: '请选择候选人', trigger: 'change' }
    ],
    position: [
        { required: true, message: '请输入应聘职位', trigger: 'blur' }
    ],
    interviewType: [
        { required: true, message: '请选择面试类型', trigger: 'change' }
    ],
    date: [
        { required: true, message: '请选择面试日期', trigger: 'change' }
    ],
    interviewers: [
        { required: true, message: '请至少选择一位面试官', trigger: 'change' },
        { type: 'array', min: 1, message: '请至少选择一位面试官', trigger: 'change' }
    ]
};

// 候选人选项
const candidateOptions = [
    { value: '张三', label: '张三 - 前端开发工程师' },
    { value: '李四', label: '李四 - 后端开发工程师' },
    { value: '王五', label: '王五 - 产品经理' },
    { value: '赵六', label: '赵六 - 技术负责人' },
];

// 面试官选项
const interviewerOptions = [
    { value: '张三', label: '张三' },
    { value: '李四', label: '李四' },
    { value: '王五', label: '王五' },
    { value: '赵六', label: '赵六' },
    { value: '钱七', label: '钱七' },
];

// 过滤后的面试列表
const filteredInterviews = computed(() => {
    let result = [...interviewList.value];

    // 关键词搜索
    if (searchKeyword.value) {
        const keyword = searchKeyword.value.toLowerCase();
        result = result.filter(item =>
            item.candidateName.toLowerCase().includes(keyword) ||
            item.position.toLowerCase().includes(keyword) ||
            (item.note && item.note.toLowerCase().includes(keyword))
        );
    }

    // 状态筛选
    if (filterStatus.value) {
        result = result.filter(item => item.status === filterStatus.value);
    }

    // 日期范围筛选
    if (dateRange.value && dateRange.value.length === 2) {
        const [start, end] = dateRange.value;
        result = result.filter(item => {
            const itemDate = item.date.split(' ')[0]; // 只比较日期部分
            return itemDate >= start && itemDate <= end;
        });
    }

    return result;
});

// 获取面试类型标签样式
const getInterviewTypeTagType = (type) => {
    const typeMap = {
        'technical': 'primary',
        'hr': 'success',
        'screening': 'info',
        'final': 'warning'
    };
    return typeMap[type] || 'info';
};

// 获取状态标签样式
const getStatusTagType = (status) => {
    const statusMap = {
        'pending': 'warning',
        'completed': 'success',
        'canceled': 'info'
    };
    return statusMap[status] || 'info';
};

// 获取面试类型文字
const getInterviewTypeText = (type) => {
    const typeMap = {
        'technical': '技术面试',
        'hr': 'HR面试',
        'screening': '初筛面试',
        'final': '终面'
    };
    return typeMap[type] || type;
};

// 获取状态文字
const getStatusText = (status) => {
    const statusMap = {
        'pending': '待执行',
        'completed': '已完成',
        'canceled': '已取消'
    };
    return statusMap[status] || status;
};

// 创建面试
const createNewInterview = () => {
    createInterviewDialogVisible.value = true;
};

// 提交面试表单
const submitInterviewForm = () => {
    if (!interviewFormRef.value) return;

    interviewFormRef.value.validate(async (valid) => {
        if (valid) {
            submitting.value = true;

            try {
                // 模拟API请求
                await new Promise(resolve => setTimeout(resolve, 1000));

                // 生成新的面试数据
                const newInterview = {
                    id: interviewList.value.length + 1,
                    candidateName: interviewForm.candidateName,
                    position: interviewForm.position,
                    interviewType: interviewForm.interviewType,
                    date: interviewForm.date,
                    status: 'pending',
                    interviewers: interviewForm.interviewers,
                    note: interviewForm.note,
                    candidateInfo: candidateOptions.find(item => item.value === interviewForm.candidateName)?.label || ''
                };

                // 添加到列表
                interviewList.value.unshift(newInterview);

                ElMessage.success('面试创建成功');
                createInterviewDialogVisible.value = false;
            } catch (error) {
                ElMessage.error('创建失败: ' + error.message);
            } finally {
                submitting.value = false;
            }
        }
    });
};

// 开始面试
const startInterview = (row) => {
    router.push(`/interview/execution/${row.id}`);
};

// 查看结果
const viewResult = (row) => {
    router.push(`/interview/analysis/${row.id}`);
};

// 编辑面试
const editInterview = (row) => {
    // 这里应该打开编辑对话框，填充已有数据
    ElMessage.info('编辑功能开发中');
};

// 删除面试
const deleteInterview = (row) => {
    ElMessageBox.confirm(
        '确定要删除此面试计划吗？此操作不可恢复。',
        '删除确认',
        {
            confirmButtonText: '确认删除',
            cancelButtonText: '取消',
            type: 'warning'
        }
    )
        .then(() => {
            // 模拟删除操作
            interviewList.value = interviewList.value.filter(item => item.id !== row.id);
            ElMessage.success('删除成功');
        })
        .catch(() => {
            // 用户取消删除
        });
};

// 分页大小变化
const handleSizeChange = (size) => {
    pageSize.value = size;
    // 实际应用中这里需要重新加载数据
};

// 页码变化
const handleCurrentChange = (page) => {
    currentPage.value = page;
    // 实际应用中这里需要重新加载数据
};

// 导入候选人
const importCandidates = () => {
    importCandidateDialogVisible.value = true;
};

// 提交候选人导入
const submitCandidateImport = () => {
    ElMessage.success('候选人导入成功');
    importCandidateDialogVisible.value = false;
    // 这里添加候选人导入逻辑
};

// 创建问题
const createQuestion = () => {
    createQuestionDialogVisible.value = true;
};

// 提交问题表单
const submitQuestionForm = () => {
    ElMessage.success('问题创建成功');
    createQuestionDialogVisible.value = false;
    // 这里添加问题创建逻辑
};

// 生命周期钩子
onMounted(() => {
    // 初始化数据，实际应用中应该从API获取
    loading.value = true;
    setTimeout(() => {
        loading.value = false;
    }, 800);
});
</script>

<style scoped>
.preparation-container {
    padding: 20px;
}

.preparation-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
}

.preparation-header h1 {
    margin: 0;
    font-size: 24px;
    font-weight: 500;
    color: #303133;
}

.preparation-tabs {
    background-color: white;
    border-radius: 4px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.tab-content {
    min-height: 400px;
    padding: 20px;
}

.empty-placeholder {
    height: 300px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
}

.tool-bar {
    display: flex;
    justify-content: space-between;
    margin-bottom: 20px;
    flex-wrap: wrap;
    gap: 16px;
}

.search-input {
    width: 240px;
}

.filter-group {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
}

.pagination-container {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
}

.full-width {
    width: 100%;
}

.interviewer-list {
    display: flex;
    align-items: center;
    gap: 4px;
}

.more-interviewers {
    font-size: 12px;
    color: #909399;
    margin-left: 4px;
}

.interviewer-avatar {
    background-color: #409EFF;
    color: white;
    font-size: 12px;
}

/* 移动端适配 */
@media (max-width: 768px) {
    .preparation-container {
        padding: 12px;
    }

    .preparation-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 12px;
    }

    .preparation-header h1 {
        font-size: 20px;
    }

    .preparation-header .el-button {
        width: 100%;
    }

    .tab-content {
        padding: 12px;
        min-height: 300px;
    }

    .tool-bar {
        flex-direction: column;
        gap: 12px;
    }

    .search-input {
        width: 100%;
    }

    .filter-group {
        width: 100%;
        flex-direction: column;
    }

    .pagination-container {
        justify-content: center;
    }
}

/* 小屏幕手机进一步优化 */
@media (max-width: 480px) {
    :deep(.el-tabs__header) {
        margin-bottom: 12px;
    }

    :deep(.el-tabs__item) {
        padding: 0 10px !important;
    }

    :deep(.el-table .cell) {
        padding-left: 5px;
        padding-right: 5px;
    }
}
</style>