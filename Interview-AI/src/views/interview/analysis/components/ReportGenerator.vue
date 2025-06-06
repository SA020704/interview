<template>
    <div class="report-generator">
        <div class="generator-header">
            <h3 class="section-title">面试报告生成</h3>
            <el-button type="primary" @click="generateReport" :loading="generating" :disabled="!selectedTemplate">
                <el-icon>
                    <Document />
                </el-icon> 生成报告
            </el-button>
        </div>

        <el-divider />

        <div class="report-options">
            <div class="templates-section">
                <h4>报告模板</h4>
                <div class="template-cards">
                    <div v-for="template in reportTemplates" :key="template.id" class="template-card"
                        :class="{ 'is-selected': selectedTemplate === template.id }"
                        @click="selectTemplate(template.id)">
                        <div class="template-icon">
                            <el-icon>
                                <component :is="template.icon" />
                            </el-icon>
                        </div>
                        <div class="template-info">
                            <div class="template-name">{{ template.name }}</div>
                            <div class="template-description">{{ template.description }}</div>
                        </div>
                        <div class="template-selected" v-if="selectedTemplate === template.id">
                            <el-icon>
                                <Check />
                            </el-icon>
                        </div>
                    </div>
                </div>
            </div>

            <div class="report-settings">
                <h4>报告选项</h4>
                <el-form :model="reportSettings" label-position="top">
                    <el-form-item label="报告标题">
                        <el-input v-model="reportSettings.title" placeholder="输入报告标题" />
                    </el-form-item>

                    <el-form-item label="包含内容">
                        <el-checkbox-group v-model="reportSettings.sections">
                            <el-checkbox label="basic_info">基本信息</el-checkbox>
                            <el-checkbox label="summary">面试摘要</el-checkbox>
                            <el-checkbox label="evaluation">评分评估</el-checkbox>
                            <el-checkbox label="analysis">AI分析</el-checkbox>
                            <el-checkbox label="qa_records">问答记录</el-checkbox>
                            <el-checkbox label="recommendations">录用建议</el-checkbox>
                        </el-checkbox-group>
                    </el-form-item>

                    <el-form-item label="导出格式">
                        <el-radio-group v-model="reportSettings.format">
                            <el-radio-button label="pdf">PDF</el-radio-button>
                            <el-radio-button label="docx">Word</el-radio-button>
                            <el-radio-button label="html">HTML</el-radio-button>
                        </el-radio-group>
                    </el-form-item>
                </el-form>
            </div>
        </div>

        <div class="preview-section" v-if="reportUrl">
            <h4>报告预览</h4>
            <div class="preview-container">
                <div class="preview-loading" v-if="previewLoading">
                    <el-skeleton animated :rows="10" />
                </div>
                <div v-else class="preview-frame">
                    <div class="preview-actions">
                        <el-button type="primary" size="small" @click="downloadReport">
                            <el-icon>
                                <Download />
                            </el-icon> 下载报告
                        </el-button>
                        <el-button type="info" size="small" @click="shareReport">
                            <el-icon>
                                <Share />
                            </el-icon> 分享
                        </el-button>
                    </div>
                    <iframe v-if="reportSettings.format === 'html'" :src="reportUrl" class="preview-iframe"></iframe>
                    <div v-else class="preview-placeholder">
                        <el-image v-if="reportThumbnail" :src="reportThumbnail" fit="contain"></el-image>
                        <div v-else class="placeholder-text">
                            <el-icon :size="48">
                                <Document />
                            </el-icon>
                            <p>点击下载按钮获取{{ reportSettings.format.toUpperCase() }}报告</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- 分享报告对话框 -->
        <el-dialog v-model="shareDialogVisible" title="分享面试报告" width="500px">
            <div class="share-options">
                <h4>分享方式</h4>
                <el-radio-group v-model="shareOption">
                    <el-radio label="email">通过邮件</el-radio>
                    <el-radio label="link">分享链接</el-radio>
                </el-radio-group>

                <div v-if="shareOption === 'email'" class="email-form">
                    <el-form :model="emailForm">
                        <el-form-item label="收件人邮箱">
                            <el-input v-model="emailForm.recipients" placeholder="多个邮箱使用分号分隔"></el-input>
                        </el-form-item>
                        <el-form-item label="主题">
                            <el-input v-model="emailForm.subject"></el-input>
                        </el-form-item>
                        <el-form-item label="附加信息">
                            <el-input type="textarea" v-model="emailForm.message" rows="3"></el-input>
                        </el-form-item>
                    </el-form>
                </div>

                <div v-else-if="shareOption === 'link'" class="link-sharing">
                    <div class="share-link-container">
                        <el-input v-model="shareLink" readonly>
                            <template #append>
                                <el-button @click="copyShareLink">复制</el-button>
                            </template>
                        </el-input>
                    </div>
                    <div class="link-expiry">
                        <span class="expiry-label">链接有效期：</span>
                        <el-select v-model="linkExpiry" placeholder="请选择">
                            <el-option label="24小时" value="24h"></el-option>
                            <el-option label="7天" value="7d"></el-option>
                            <el-option label="30天" value="30d"></el-option>
                            <el-option label="永久" value="permanent"></el-option>
                        </el-select>
                    </div>
                </div>
            </div>
            <template #footer>
                <span class="dialog-footer">
                    <el-button @click="shareDialogVisible = false">取消</el-button>
                    <el-button type="primary" @click="confirmShare" :loading="sharing">
                        {{ shareOption === 'email' ? '发送' : '生成链接' }}
                    </el-button>
                </span>
            </template>
        </el-dialog>
    </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElLoading } from 'element-plus'
import {
    Document, Download, Share, Check,
    DocumentCopy, Tickets, Postcard, Notebook
} from '@element-plus/icons-vue'
import {
    getReportTemplates,
    generateInterviewReport,
    shareInterviewReport
} from '@/api/interview'

const props = defineProps({
    interviewId: {
        type: [String, Number],
        required: true
    },
    interviewData: {
        type: Object,
        default: () => ({})
    }
})

// 状态
const generating = ref(false)
const previewLoading = ref(false)
const reportTemplates = ref([])
const selectedTemplate = ref(null)
const reportUrl = ref(null)
const reportThumbnail = ref(null)
const shareDialogVisible = ref(false)
const shareOption = ref('email')
const emailForm = reactive({
    recipients: '',
    subject: '',
    message: ''
})
const shareLink = ref('')
const linkExpiry = ref('7d')
const sharing = ref(false)

// 报告设置
const reportSettings = reactive({
    title: '',
    sections: ['basic_info', 'summary', 'evaluation', 'analysis', 'recommendations'],
    format: 'pdf'
})

// 初始化
onMounted(async () => {
    try {
        const { data } = await getReportTemplates()
        reportTemplates.value = data
        // 默认选择第一个模板
        if (data && data.length > 0) {
            selectedTemplate.value = data[0].id
        }

        // 设置默认标题
        if (props.interviewData && props.interviewData.title) {
            reportSettings.title = `${props.interviewData.title} - 面试报告`
        } else {
            reportSettings.title = `面试报告 - ${new Date().toLocaleDateString()}`
        }
    } catch (error) {
        ElMessage.error('获取报告模板失败')
        console.error(error)

        // 使用默认模板
        reportTemplates.value = [
            {
                id: 'standard',
                name: '标准报告',
                description: '包含面试基本信息、评分和录用建议',
                icon: 'Document'
            },
            {
                id: 'detailed',
                name: '详细报告',
                description: '包含完整分析和问答记录',
                icon: 'DocumentCopy'
            },
            {
                id: 'summary',
                name: '摘要报告',
                description: '简短的面试总结和关键点',
                icon: 'Tickets'
            },
            {
                id: 'technical',
                name: '技术评估报告',
                description: '侧重于技术能力分析',
                icon: 'Notebook'
            }
        ]
        selectedTemplate.value = 'standard'
    }
})

// 选择模板
const selectTemplate = (templateId) => {
    selectedTemplate.value = templateId
}

// 生成报告
const generateReport = async () => {
    if (!selectedTemplate.value) {
        ElMessage.warning('请选择报告模板')
        return
    }

    generating.value = true
    previewLoading.value = true

    try {
        const loadingInstance = ElLoading.service({
            target: '.preview-container',
            text: '报告生成中...',
            background: 'rgba(255, 255, 255, 0.7)'
        })

        const { data } = await generateInterviewReport(props.interviewId, {
            templateId: selectedTemplate.value,
            title: reportSettings.title,
            sections: reportSettings.sections,
            format: reportSettings.format
        })

        setTimeout(() => {
            loadingInstance.close()
            reportUrl.value = data.reportUrl
            reportThumbnail.value = data.thumbnailUrl || null
            previewLoading.value = false
            ElMessage.success('报告生成成功')
        }, 1500) // 模拟报告生成延迟
    } catch (error) {
        ElMessage.error('报告生成失败')
        console.error(error)

        // 模拟成功（实际开发中移除）
        setTimeout(() => {
            reportUrl.value = '#'
            previewLoading.value = false
            ElMessage.success('报告生成成功（模拟数据）')
        }, 1500)
    } finally {
        generating.value = false
    }
}

// 下载报告
const downloadReport = () => {
    if (reportUrl.value) {
        const a = document.createElement('a')
        a.href = reportUrl.value
        a.download = `${reportSettings.title}.${reportSettings.format}`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        ElMessage.success('报告下载已开始')
    }
}

// 分享报告
const shareReport = () => {
    shareDialogVisible.value = true
    // 设置默认值
    emailForm.subject = `面试报告: ${reportSettings.title}`
    emailForm.message = '您好，请查看附件中的面试报告。'

    // 模拟分享链接
    shareLink.value = `https://interview-assistant.example.com/share/${props.interviewId}?token=sample-token-${Date.now()}`
}

// 复制分享链接
const copyShareLink = () => {
    navigator.clipboard.writeText(shareLink.value)
        .then(() => ElMessage.success('链接已复制到剪贴板'))
        .catch(() => ElMessage.error('复制失败，请手动复制'))
}

// 确认分享
const confirmShare = async () => {
    sharing.value = true

    try {
        const shareData = {
            method: shareOption.value,
            interviewId: props.interviewId,
            reportId: selectedTemplate.value
        }

        if (shareOption.value === 'email') {
            shareData.email = {
                recipients: emailForm.recipients.split(';').map(e => e.trim()),
                subject: emailForm.subject,
                message: emailForm.message
            }
        } else {
            shareData.link = {
                expiry: linkExpiry.value
            }
        }

        await shareInterviewReport(props.interviewId, shareData)
        ElMessage.success(shareOption.value === 'email' ? '邮件已发送' : '分享链接已生成')
        shareDialogVisible.value = false
    } catch (error) {
        ElMessage.error('分享失败')
        console.error(error)

        // 模拟成功（实际开发中移除）
        setTimeout(() => {
            ElMessage.success(shareOption.value === 'email' ? '邮件已发送（模拟）' : '分享链接已生成（模拟）')
            shareDialogVisible.value = false
        }, 1000)
    } finally {
        sharing.value = false
    }
}
</script>

<style scoped>
.report-generator {
    padding: 20px;

    .generator-header {
        display: flex;
        justify-content: space-between;
        align-items: center;

        .section-title {
            margin: 0;
            font-size: 18px;
            font-weight: 500;
            color: #303133;
        }
    }

    h4 {
        margin-top: 0;
        margin-bottom: 16px;
        font-size: 16px;
        font-weight: 500;
        color: #606266;
    }

    .report-options {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 20px;
        margin-bottom: 20px;

        @media (max-width: 768px) {
            grid-template-columns: 1fr;
        }

        .templates-section {
            .template-cards {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 10px;

                .template-card {
                    position: relative;
                    border: 1px solid #DCDFE6;
                    border-radius: 4px;
                    padding: 15px;
                    cursor: pointer;
                    transition: all 0.3s;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    height: 120px;

                    &:hover {
                        border-color: #409EFF;
                        box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
                    }

                    &.is-selected {
                        border-color: #409EFF;
                        background-color: #ecf5ff;
                    }

                    .template-icon {
                        font-size: 24px;
                        color: #409EFF;
                        margin-bottom: 10px;
                    }

                    .template-info {
                        text-align: center;

                        .template-name {
                            font-weight: 500;
                            margin-bottom: 5px;
                        }

                        .template-description {
                            font-size: 12px;
                            color: #909399;
                            line-height: 1.4;
                        }
                    }

                    .template-selected {
                        position: absolute;
                        top: 8px;
                        right: 8px;
                        color: #409EFF;
                    }
                }
            }
        }
    }

    .preview-section {
        margin-top: 20px;

        .preview-container {
            position: relative;
            border: 1px solid #DCDFE6;
            border-radius: 4px;
            height: 500px;
            overflow: hidden;

            .preview-actions {
                position: absolute;
                top: 10px;
                right: 10px;
                z-index: 10;
                display: flex;
                gap: 10px;
            }

            .preview-iframe {
                width: 100%;
                height: 100%;
                border: none;
            }

            .preview-placeholder {
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                height: 100%;
                color: #909399;

                .el-image {
                    max-width: 90%;
                    max-height: 90%;
                }

                .placeholder-text {
                    display: flex;
                    flex-direction: column;
                    align-items: center;

                    p {
                        margin-top: 10px;
                    }
                }
            }
        }
    }

    .share-options {

        .email-form,
        .link-sharing {
            margin-top: 15px;
        }

        .link-sharing {
            .link-expiry {
                margin-top: 10px;
                display: flex;
                align-items: center;

                .expiry-label {
                    margin-right: 10px;
                }
            }
        }
    }
}
</style>