<template>
  <div class="candidate-list-container">
    <div class="list-header">
      <div class="search-bar">
        <el-input
          v-model="searchQuery"
          placeholder="搜索候选人"
          clearable
          prefix-icon="Search"
          @input="handleSearch"
        />
        
        <el-select v-model="statusFilter" placeholder="状态筛选" clearable @change="filterList">
          <el-option label="全部" value="" />
          <el-option label="待处理" value="pending" />
          <el-option label="面试中" value="interviewing" />
          <el-option label="已通过" value="passed" />
          <el-option label="已拒绝" value="rejected" />
        </el-select>
        
        <el-select v-model="positionFilter" placeholder="职位筛选" clearable @change="filterList">
          <el-option label="全部" value="" />
          <el-option 
            v-for="position in positionOptions" 
            :key="position" 
            :label="position" 
            :value="position" 
          />
        </el-select>
      </div>
      
      <div class="action-buttons">
        <el-button type="primary" @click="handleAddCandidate">添加候选人</el-button>
        <el-upload
          action=""
          :auto-upload="false"
          :on-change="handleImportChange"
          :show-file-list="false"
        >
          <el-button>导入候选人</el-button>
        </el-upload>
      </div>
    </div>
    
    <!-- 候选人列表 -->
    <el-table
      :data="filteredCandidates"
      border
      stripe
      style="width: 100%"
      v-loading="loading"
    >
      <el-table-column prop="name" label="姓名" min-width="100">
        <template #default="{ row }">
          <div class="candidate-name">
            <el-avatar :size="32" :src="row.avatar" />
            <span>{{ row.name }}</span>
          </div>
        </template>
      </el-table-column>
      
      <el-table-column prop="position" label="应聘职位" min-width="150" />
      
      <el-table-column prop="experience" label="工作经验" min-width="100">
        <template #default="{ row }">
          {{ row.experience }} 年
        </template>
      </el-table-column>
      
      <el-table-column prop="education" label="学历" min-width="100" />
      
      <el-table-column prop="status" label="状态" min-width="120">
        <template #default="{ row }">
          <el-tag :type="getStatusType(row.status)">
            {{ getStatusText(row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      
      <el-table-column prop="interviewCount" label="面试次数" min-width="100" />
      
      <el-table-column prop="createTime" label="创建时间" min-width="150" />
      
      <el-table-column label="操作" fixed="right" min-width="150">
        <template #default="{ row }">
          <el-button link type="primary" @click="showDetail(row)">查看</el-button>
          <el-button link type="primary" @click="createInterview(row)">面试</el-button>
          <el-dropdown>
            <el-button link type="primary">
              更多<el-icon class="el-icon--right"><arrow-down /></el-icon>
            </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="editCandidate(row)">编辑</el-dropdown-item>
                <el-dropdown-item @click="deleteCandidate(row)">删除</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </template>
      </el-table-column>
    </el-table>
    
    <!-- 分页 -->
    <div class="pagination-container">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[10, 20, 50]"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
    
    <!-- 候选人表单对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="formType === 'add' ? '添加候选人' : '编辑候选人'"
      width="600px"
      destroy-on-close
    >
      <el-form :model="candidateForm" :rules="rules" ref="candidateFormRef" label-width="100px">
        <el-form-item label="姓名" prop="name">
          <el-input v-model="candidateForm.name" placeholder="请输入姓名" />
        </el-form-item>
        
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="candidateForm.email" placeholder="请输入邮箱" />
        </el-form-item>
        
        <el-form-item label="电话" prop="phone">
          <el-input v-model="candidateForm.phone" placeholder="请输入电话" />
        </el-form-item>
        
        <el-form-item label="应聘职位" prop="position">
          <el-input v-model="candidateForm.position" placeholder="请输入应聘职位" />
        </el-form-item>
        
        <el-form-item label="工作经验" prop="experience">
          <el-input-number v-model="candidateForm.experience" :min="0" :max="50" />
        </el-form-item>
        
        <el-form-item label="学历" prop="education">
          <el-select v-model="candidateForm.education" placeholder="请选择学历">
            <el-option label="大专" value="大专" />
            <el-option label="本科" value="本科" />
            <el-option label="硕士" value="硕士" />
            <el-option label="博士" value="博士" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="期望薪资" prop="expectedSalary">
          <el-input-number 
            v-model="candidateForm.expectedSalary" 
            :min="0" 
            :max="100" 
            :step="0.5"
          />
          <span class="salary-unit">k/月</span>
        </el-form-item>
        
        <el-form-item label="技能" prop="skills">
          <el-select
            v-model="candidateForm.skills"
            multiple
            filterable
            allow-create
            default-first-option
            placeholder="请输入技能（回车确认）"
          />
        </el-form-item>
        
        <el-form-item label="简历" prop="resumeUrl">
          <el-upload
            class="resume-uploader"
            action=""
            :auto-upload="false"
            :on-change="handleResumeChange"
          >
            <el-button type="primary">上传简历</el-button>
            <template #tip>
              <div class="el-upload__tip">
                支持 .pdf, .doc, .docx 格式，不超过 10MB
              </div>
            </template>
          </el-upload>
        </el-form-item>
      </el-form>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" :loading="submitLoading" @click="submitCandidateForm">
            {{ formType === 'add' ? '添加' : '保存' }}
          </el-button>
        </span>
      </template>
    </el-dialog>
    
    <!-- 候选人详情对话框 -->
    <el-dialog
      v-model="detailVisible"
      title="候选人详情"
      width="800px"
    >
      <div v-if="currentCandidate" class="candidate-detail">
        <div class="basic-info">
          <div class="avatar-container">
            <el-avatar :size="80" :src="currentCandidate.avatar" />
          </div>
          <div class="info-container">
            <h2>{{ currentCandidate.name }}</h2>
            <div class="info-item">
              <el-icon><Message /></el-icon>
              <span>{{ currentCandidate.email }}</span>
            </div>
            <div class="info-item">
              <el-icon><Phone /></el-icon>
              <span>{{ currentCandidate.phone }}</span>
            </div>
            <div class="info-item">
              <el-icon><Briefcase /></el-icon>
              <span>{{ currentCandidate.position }} | {{ currentCandidate.experience }}年经验</span>
            </div>
            <div class="info-item">
              <el-icon><School /></el-icon>
              <span>{{ currentCandidate.education }}</span>
            </div>
          </div>
        </div>
        
        <el-divider />
        
        <el-tabs>
          <el-tab-pane label="基本信息">
            <div class="detail-section">
              <h3>技能</h3>
              <div class="skills-container">
                <el-tag 
                  v-for="skill in currentCandidate.skills" 
                  :key="skill"
                  class="skill-tag"
                >
                  {{ skill }}
                </el-tag>
              </div>
            </div>
            
            <div class="detail-section">
              <h3>面试记录</h3>
              <el-table :data="interviewRecords" stripe style="width: 100%">
                <el-table-column prop="date" label="面试日期" width="150" />
                <el-table-column prop="type" label="面试类型" width="120" />
                <el-table-column prop="interviewer" label="面试官" width="120" />
                <el-table-column prop="result" label="结果" width="100">
                  <template #default="{ row }">
                    <el-tag :type="row.result === 'pass' ? 'success' : row.result === 'fail' ? 'danger' : 'info'">
                      {{ row.result === 'pass' ? '通过' : row.result === 'fail' ? '未通过' : '待定' }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column prop="score" label="评分" width="100" />
                <el-table-column label="操作" width="120">
                  <template #default="{ row }">
                    <el-button link type="primary" @click="viewInterviewDetail(row)">查看</el-button>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </el-tab-pane>
          
          <el-tab-pane label="简历信息">
            <div v-if="currentCandidate.resume" class="resume-info">
              <el-descriptions :column="2" border>
                <el-descriptions-item label="教育背景" :span="2">
                  <div v-for="edu in currentCandidate.resume.education" :key="edu.school" class="resume-item">
                    <div class="resume-item-header">
                      <strong>{{ edu.school }}</strong>
                      <span>{{ edu.startDate }} - {{ edu.endDate }}</span>
                    </div>
                    <div>{{ edu.degree }} · {{ edu.major }}</div>
                    <div v-if="edu.achievements" class="resume-item-achievements">{{ edu.achievements }}</div>
                  </div>
                </el-descriptions-item>
                
                <el-descriptions-item label="工作经历" :span="2">
                  <div v-for="work in currentCandidate.resume.workExperience" :key="work.company" class="resume-item">
                    <div class="resume-item-header">
                      <strong>{{ work.company }}</strong>
                      <span>{{ work.startDate }} - {{ work.endDate }}</span>
                    </div>
                    <div>{{ work.position }}</div>
                    <div class="resume-item-description">{{ work.description }}</div>
                  </div>
                </el-descriptions-item>
                
                <el-descriptions-item label="项目经历" :span="2">
                  <div v-for="project in currentCandidate.resume.projects" :key="project.name" class="resume-item">
                    <div class="resume-item-header">
                      <strong>{{ project.name }}</strong>
                      <span>{{ project.startDate }} - {{ project.endDate }}</span>
                    </div>
                    <div>{{ project.role }}</div>
                    <div class="resume-item-description">{{ project.description }}</div>
                    <div class="resume-item-technologies">
                      <el-tag v-for="tech in project.technologies" :key="tech" size="small">{{ tech }}</el-tag>
                    </div>
                  </div>
                </el-descriptions-item>
                
                <el-descriptions-item label="个人陈述" :span="2">
                  {{ currentCandidate.resume.personalStatement }}
                </el-descriptions-item>
              </el-descriptions>
            </div>
            <div v-else class="no-resume">
              <el-empty description="暂无简历信息"></el-empty>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useCandidateStore } from '@/store/modules/candidate'
import { ArrowDown, Message, Phone, Briefcase, School, Search } from '@element-plus/icons-vue'

// Store
const candidateStore = useCandidateStore()

// 状态
const loading = ref(false)
const submitLoading = ref(false)
const dialogVisible = ref(false)
const detailVisible = ref(false)
const formType = ref('add')
const searchQuery = ref('')
const statusFilter = ref('')
const positionFilter = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const currentCandidate = ref(null)

// 候选人表单
const candidateFormRef = ref(null)
const candidateForm = reactive({
  name: '',
  email: '',
  phone: '',
  position: '',
  experience: 0,
  education: '',
  expectedSalary: 0,
  skills: [],
  resumeUrl: ''
})

// 表单验证规则
const rules = {
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '请输入电话', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号格式', trigger: 'blur' }
  ],
  position: [{ required: true, message: '请输入应聘职位', trigger: 'blur' }],
  education: [{ required: true, message: '请选择学历', trigger: 'change' }]
}

// 职位选项
const positionOptions = computed(() => {
  const positions = new Set()
  candidateStore.candidateList.forEach(item => {
    if (item.position) positions.add(item.position)
  })
  return Array.from(positions)
})

// 过滤后的候选人列表
const filteredCandidates = computed(() => {
  let result = candidateStore.candidateList
  
  // 搜索过滤
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(item => 
      item.name.toLowerCase().includes(query) || 
      item.position.toLowerCase().includes(query) ||
      (item.email && item.email.toLowerCase().includes(query))
    )
  }
  
  // 状态过滤
  if (statusFilter.value) {
    result = result.filter(item => item.status === statusFilter.value)
  }
  
  // 职位过滤
  if (positionFilter.value) {
    result = result.filter(item => item.position === positionFilter.value)
  }
  
  return result.slice((currentPage.value - 1) * pageSize.value, currentPage.value * pageSize.value)
})

// 获取状态类型
const getStatusType = (status) => {
  const statusMap = {
    pending: 'info',
    interviewing: 'warning',
    passed: 'success',
    rejected: 'danger',
    onboarded: 'success'
  }
  return statusMap[status] || 'info'
}

// 获取状态文本
const getStatusText = (status) => {
  const statusMap = {
    pending: '待处理',
    interviewing: '面试中',
    passed: '已通过',
    rejected: '已拒绝',
    onboarded: '已入职'
  }
  return statusMap[status] || '未知'
}

// 搜索处理
const handleSearch = () => {
  currentPage.value = 1
}

// 筛选列表
const filterList = () => {
  currentPage.value = 1
}

// 分页大小变化
const handleSizeChange = (val) => {
  pageSize.value = val
  currentPage.value = 1
}

// 当前页变化
const handleCurrentChange = (val) => {
  currentPage.value = val
}

// 添加候选人
const handleAddCandidate = () => {
  formType.value = 'add'
  dialogVisible.value = true
  
  // 重置表单
  Object.keys(candidateForm).forEach(key => {
    candidateForm[key] = key === 'experience' || key === 'expectedSalary' ? 0 : key === 'skills' ? [] : ''
  })
}

// 编辑候选人
const editCandidate = (row) => {
  formType.value = 'edit'
  dialogVisible.value = true
  
  // 填充表单
  Object.keys(candidateForm).forEach(key => {
    if (key in row) {
      candidateForm[key] = row[key]
    }
  })
}

// 删除候选人
const deleteCandidate = (row) => {
  ElMessageBox.confirm(
    `确定要删除候选人 ${row.name} 吗？`,
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    try {
      await candidateStore.deleteCandidate(row.id)
      ElMessage.success('删除成功')
    } catch (error) {
      ElMessage.error('删除失败：' + error.message)
    }
  }).catch(() => {})
}

// 查看候选人详情
const showDetail = async (row) => {
  try {
    loading.value = true
    const candidate = await candidateStore.fetchCandidateDetail(row.id)
    currentCandidate.value = candidate
    detailVisible.value = true
  } catch (error) {
    ElMessage.error('获取候选人详情失败：' + error.message)
  } finally {
    loading.value = false
  }
}

// 创建面试
const createInterview = (row) => {
  // 向父组件发送事件
  ElMessage.info('功能开发中：为候选人 ' + row.name + ' 创建面试')
}

// 简历上传变化
const handleResumeChange = (file) => {
  if (file.raw.size > 10 * 1024 * 1024) {
    ElMessage.warning('文件大小不能超过 10MB')
    return
  }
  
  const allowedTypes = ['.pdf', '.doc', '.docx']
  const extension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase()
  if (!allowedTypes.includes(extension)) {
    ElMessage.warning('仅支持 PDF、Word 格式的文件')
    return
  }
  
  // 这里可以处理简历上传逻辑，例如设置表单字段
  candidateForm.resumeUrl = file.name
}

// 导入候选人
const handleImportChange = (file) => {
  if (file.raw.size > 5 * 1024 * 1024) {
    ElMessage.warning('文件大小不能超过 5MB')
    return
  }
  
  const allowedTypes = ['.xlsx', '.xls', '.csv']
  const extension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase()
  if (!allowedTypes.includes(extension)) {
    ElMessage.warning('仅支持 Excel、CSV 格式的文件')
    return
  }
  
  ElMessage.info('功能开发中：导入候选人')
}

// 提交候选人表单
const submitCandidateForm = () => {
  candidateFormRef.value.validate(async (valid) => {
    if (!valid) return
    
    submitLoading.value = true
    
    try {
      if (formType.value === 'add') {
        await candidateStore.createCandidate(candidateForm)
        ElMessage.success('添加候选人成功')
      } else {
        const candidateId = currentCandidate.value?.id
        if (candidateId) {
          await candidateStore.updateCandidate(candidateId, candidateForm)
          ElMessage.success('更新候选人成功')
        }
      }
      
      dialogVisible.value = false
    } catch (error) {
      ElMessage.error(formType.value === 'add' ? '添加候选人失败' : '更新候选人失败')
    } finally {
      submitLoading.value = false
    }
  })
}

// 模拟面试记录数据
const interviewRecords = ref([
  {
    id: 1,
    date: '2023-05-10',
    type: '技术面试',
    interviewer: '张三',
    result: 'pass',
    score: 4.5
  },
  {
    id: 2,
    date: '2023-05-15',
    type: 'HR面试',
    interviewer: '李四',
    result: 'pending',
    score: '-'
  }
])

// 查看面试详情
const viewInterviewDetail = (row) => {
  ElMessage.info('功能开发中：查看面试ID ' + row.id + ' 的详情')
}

// 加载候选人列表
const loadCandidates = async () => {
  loading.value = true
  try {
    await candidateStore.fetchCandidateList()
    total.value = candidateStore.total
  } catch (error) {
    ElMessage.error('获取候选人列表失败')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadCandidates()
})
</script>

<style scoped>
.candidate-list-container {
  .list-header {
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
  
  .candidate-name {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  
  .pagination-container {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
  }
  
  .salary-unit {
    margin-left: 8px;
    color: #606266;
  }
  
  .candidate-detail {
    .basic-info {
      display: flex;
      margin-bottom: 20px;
      
      .avatar-container {
        margin-right: 20px;
      }
      
      .info-container {
        h2 {
          margin-top: 0;
          margin-bottom: 15px;
        }
        
        .info-item {
          display: flex;
          align-items: center;
          margin-bottom: 8px;
          
          .el-icon {
            margin-right: 8px;
            color: #909399;
          }
        }
      }
    }
    
    .detail-section {
      margin-bottom: 20px;
      
      h3 {
        margin-top: 0;
        margin-bottom: 15px;
        font-size: 16px;
        color: #303133;
      }
      
      .skills-container {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
      }
    }
    
    .resume-info {
      .resume-item {
        margin-bottom: 15px;
        
        .resume-item-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 5px;
        }
        
        .resume-item-description {
          margin-top: 5px;
          color: #606266;
        }
        
        .resume-item-achievements {
          margin-top: 5px;
          font-style: italic;
          color: #606266;
        }
        
        .resume-item-technologies {
          margin-top: 8px;
          display: flex;
          flex-wrap: wrap;
          gap: 5px;
        }
      }
    }
    
    .no-resume {
      padding: 40px 0;
    }
  }
}
</style> 