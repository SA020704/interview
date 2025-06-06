<template>
    <div class="prepare-container">
        <div class="prepare-card">
            <div class="card-header">
                <h2>AI面试助手</h2>
                <p class="subtitle">上传简历，开始智能面试</p>
            </div>

            <div class="prepare-content">
                <div class="step-container">
                    <div class="step-indicator">
                        <div class="step active">
                            <div class="step-number">1</div>
                            <div class="step-label">上传简历</div>
                        </div>
                        <div class="step-line"></div>
                        <div class="step" :class="{ active: resumeInfo }">
                            <div class="step-number">2</div>
                            <div class="step-label">确认信息</div>
                        </div>
                        <div class="step-line"></div>
                        <div class="step" :class="{ active: canStartInterview }">
                            <div class="step-number">3</div>
                            <div class="step-label">开始面试</div>
                        </div>
                    </div>
                </div>

                <div class="upload-section" v-if="!resumeInfo">
                    <div class="upload-area-container">
                        <el-upload
                            class="upload-area"
                            drag
                            action="#"
                            :auto-upload="false"
                            :on-change="handleResumeUpload"
                            :limit="1"
                            :disabled="isUploading"
                        >
                            <div class="upload-inner">
                                <div v-if="isUploading" class="loading-spinner">
                                    <svg class="circular" viewBox="25 25 50 50">
                                        <circle class="path" cx="50" cy="50" r="20" fill="none" />
                                    </svg>
                                    <p>正在解析简历...</p>
                                </div>
                                <template v-else>
                                    <i class="upload-icon"></i>
                                    <div class="upload-text">
                                        <h3>拖拽文件到此处或点击上传</h3>
                                        <p>支持 PDF、Word、TXT 等格式</p>
                                    </div>
                                </template>
                            </div>
                        </el-upload>
                    </div>
                </div>

                <div v-if="resumeInfo" class="resume-section">
                    <div class="section-title">
                        <h3>简历信息</h3>
                        <el-button type="text" @click="resetResume" :disabled="isStarting">
                            <i class="reset-icon"></i> 重新上传
                        </el-button>
                    </div>

                    <div class="resume-card">
                        <div class="resume-header">
                            <div class="avatar">{{ resumeInfo.name?.charAt(0) || "?" }}</div>
                            <div class="resume-basic">
                                <h4>{{ resumeInfo.name }}</h4>
                                <p>{{ resumeInfo.position }}</p>
                            </div>
                        </div>

                        <div class="resume-details">
                            <div class="detail-item">
                                <span class="label">工作经验</span>
                                <span class="value">{{ resumeInfo.experience }}</span>
                            </div>

                            <div class="detail-item skills">
                                <span class="label">技能标签</span>
                                <div class="value">
                                    <el-tag
                                        v-for="(skill, index) in resumeInfo.skills"
                                        :key="index"
                                        size="small"
                                        class="skill-tag"
                                        effect="dark"
                                    >
                                        {{ skill }}
                                    </el-tag>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="interview-settings">
                        <div class="section-title">
                            <h3>面试设置</h3>
                        </div>

                        <el-form :model="interviewSettings" label-position="top">
                            <el-form-item label="面试职位">
                                <el-input
                                    v-model="interviewSettings.position"
                                    placeholder="请输入面试职位"
                                    clearable
                                    :prefix-icon="BriefcaseIcon"
                                ></el-input>
                            </el-form-item>
                        </el-form>
                    </div>
                </div>

                <div class="action-buttons">
                    <el-button class="back-btn" @click="goBack" :disabled="isStarting" plain> 返回 </el-button>
                    <el-button
                        class="start-btn"
                        type="primary"
                        @click="startInterview"
                        :disabled="!canStartInterview || isStarting"
                        :loading="isStarting"
                        style="margin-left: 0"
                    >
                        {{ isStarting ? "准备中..." : "开始面试" }}
                    </el-button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import { ResumeAnalysisAPI, interviewInitAPI } from "@/api/api/api";

// 模拟图标组件
const BriefcaseIcon = "Briefcase";

const router = useRouter();

// 状态控制
const isUploading = ref(false);
const isStarting = ref(false);

// 简历信息
const resumeInfo = ref(null);
const handleResumeUpload = (file) => {
    isUploading.value = true;
    const formData = new FormData();
    formData.append("file", file.raw);

    ResumeAnalysisAPI(formData)
        .then((res) => {
            if (res.code === "200") {
                resumeInfo.value = {
                    name: res.data.username || "未知姓名",
                    position: res.data.jobInformation || "未指定职位",
                    experience: res.data.workExperience || "未知",
                    skills: res.data.skillTags?.split(",") || []
                };

                interviewSettings.value.position = res.data.jobInformation || "";
                ElMessage({
                    message: "简历解析成功",
                    type: "success",
                    offset: 80
                });
            }
        })
        .catch(() => {
            ElMessage({
                message: "简历解析失败，请重试",
                type: "error",
                offset: 80
            });
        })
        .finally(() => {
            isUploading.value = false;
        });
};

// 重置简历
const resetResume = () => {
    resumeInfo.value = null;
    interviewSettings.value.position = "";
};

// 面试设置
const interviewSettings = ref({
    position: "",
    type: "technical",
    duration: 45,
    aiLevel: 2
});

// 判断是否可以开始面试
const canStartInterview = computed(() => {
    return resumeInfo.value && interviewSettings.value.position.trim() !== "";
});

const goBack = () => {
    router.push("/");
};

const startInterview = () => {
    if (!canStartInterview.value) {
        ElMessage({
            message: "请上传简历并填写面试职位",
            type: "warning",
            offset: 80
        });
        return;
    }

    isStarting.value = true;

    // 准备面试数据
    const interviewData = {
        resumeInfo: resumeInfo.value,
        settings: interviewSettings.value
    };

    const data = {
        biographicalNotesResponse: {
            jobInformation: resumeInfo.value.position,
            skillTags: resumeInfo.value.skills.join(","),
            username: resumeInfo.value.name,
            workExperience: resumeInfo.value.experience
        },
        job: resumeInfo.value.position
    };

    interviewInitAPI(data)
        .then((res) => {
            if (res.code === "200") {
                localStorage.setItem("infoid", JSON.stringify(res.data));
                localStorage.setItem("currentInterview", JSON.stringify(interviewData));
                router.push("/InterviewProcess");
            } else {
                ElMessage({
                    message: "初始化面试失败，请重试",
                    type: "error",
                    offset: 80
                });
                isStarting.value = false;
            }
        })
        .catch(() => {
            ElMessage({
                message: "网络错误，请重试",
                type: "error",
                offset: 80
            });
            isStarting.value = false;
        });
};
</script>

<style lang="scss" scoped>
.prepare-container {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    background: linear-gradient(135deg, #f5f7fa 0%, #e4e8f0 100%);
}

.prepare-card {
    width: 100%;
    max-width: 800px;
    background-color: #ffffff;
    border-radius: 16px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
    overflow: hidden;
}

.card-header {
    background: linear-gradient(135deg, #4a90e2 0%, #2c6ed1 100%);
    color: white;
    padding: 30px;
    text-align: center;
}

.card-header h2 {
    margin: 0;
    font-size: 28px;
    font-weight: 600;
}

.subtitle {
    margin: 10px 0 0;
    opacity: 0.8;
    font-weight: 300;
}

.prepare-content {
    padding: 30px;
}

/* Step indicator */
.step-container {
    margin-bottom: 40px;
}

.step-indicator {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 40px;
}

.step {
    display: flex;
    flex-direction: column;
    align-items: center;
    z-index: 1;
}

.step-number {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background-color: #f0f2f5;
    color: #909399;
    display: flex;
    justify-content: center;
    align-items: center;
    font-weight: bold;
    margin-bottom: 8px;
    transition: all 0.3s ease;
}

.step.active .step-number {
    background-color: #4a90e2;
    color: white;
    box-shadow: 0 4px 10px rgba(74, 144, 226, 0.3);
}

.step-label {
    font-size: 14px;
    color: #909399;
    transition: all 0.3s ease;
}

.step.active .step-label {
    color: #4a90e2;
    font-weight: 500;
}

.step-line {
    flex-grow: 1;
    height: 2px;
    background-color: #f0f2f5;
    margin: 0 15px;
    position: relative;
    top: -18px;
}

/* Upload area */
.upload-section {
    margin-bottom: 30px;
}

.upload-area-container {
    padding: 20px;
}

.upload-area {
    width: 100%;
}

:deep(.el-upload-dragger) {
    width: 100%;
    height: 200px;
    border: 2px dashed #dcdfe6;
    border-radius: 12px;
    transition: all 0.3s;
}

:deep(.el-upload-dragger:hover) {
    border-color: #4a90e2;
}

.upload-inner {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    height: 100%;
}

.upload-icon {
    display: block;
    width: 64px;
    height: 64px;
    margin-bottom: 16px;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%234a90e2'%3E%3Cpath d='M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM14 13v4h-4v-4H7l5-5 5 5h-3z'/%3E%3C/svg%3E");
    background-size: contain;
    background-repeat: no-repeat;
    background-position: center;
}

.upload-text h3 {
    font-size: 18px;
    color: #606266;
    margin: 0 0 8px;
    font-weight: 500;
}

.upload-text p {
    font-size: 14px;
    color: #909399;
    margin: 0;
}

/* Loading spinner */
.loading-spinner {
    display: flex;
    flex-direction: column;
    align-items: center;
}

.loading-spinner p {
    margin-top: 16px;
    color: #606266;
}

.circular {
    width: 50px;
    height: 50px;
    animation: loading-rotate 2s linear infinite;
}

.path {
    animation: loading-dash 1.5s ease-in-out infinite;
    stroke-dasharray: 90, 150;
    stroke-dashoffset: 0;
    stroke-width: 2;
    stroke: #4a90e2;
    stroke-linecap: round;
}

@keyframes loading-rotate {
    100% {
        transform: rotate(360deg);
    }
}

@keyframes loading-dash {
    0% {
        stroke-dasharray: 1, 200;
        stroke-dashoffset: 0;
    }
    50% {
        stroke-dasharray: 90, 150;
        stroke-dashoffset: -40px;
    }
    100% {
        stroke-dasharray: 90, 150;
        stroke-dashoffset: -120px;
    }
}

/* Resume section */
.resume-section {
    margin-bottom: 30px;
}

.section-title {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
}

.section-title h3 {
    font-size: 18px;
    color: #303133;
    margin: 0;
    font-weight: 500;
}

.reset-icon {
    display: inline-block;
    width: 14px;
    height: 14px;
    margin-right: 4px;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%234a90e2'%3E%3Cpath d='M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z'/%3E%3C/svg%3E");
    background-size: contain;
    background-repeat: no-repeat;
    background-position: center;
    vertical-align: middle;
}

/* Resume card */
.resume-card {
    background-color: #f9fafc;
    border-radius: 12px;
    padding: 20px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
}

.resume-header {
    display: flex;
    align-items: center;
    margin-bottom: 20px;
}

.avatar {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    background: linear-gradient(135deg, #4a90e2 0%, #2c6ed1 100%);
    color: white;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 24px;
    font-weight: bold;
    margin-right: 16px;
}

.resume-basic h4 {
    margin: 0 0 4px;
    font-size: 20px;
    color: #303133;
}

.resume-basic p {
    margin: 0;
    color: #606266;
    font-size: 14px;
}

.resume-details {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.detail-item {
    display: flex;
    flex-direction: column;
}

.label {
    font-size: 14px;
    color: #909399;
    margin-bottom: 8px;
}

.value {
    font-size: 16px;
    color: #303133;
}

.skills .value {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
}

.skill-tag {
    background-color: #4a90e2 !important;
    border-color: #4a90e2 !important;
    border-radius: 16px;
    padding: 0 12px;
}

/* Interview settings */
.interview-settings {
    margin-top: 30px;
}

/* Action buttons */
.action-buttons {
    display: flex;
    justify-content: center;
    gap: 20px;
    margin-top: 40px;
}

.back-btn,
.start-btn {
    min-width: 120px;
    height: 44px;
    font-size: 16px;
    border-radius: 22px;
}

.start-btn {
    background: linear-gradient(135deg, #4a90e2 0%, #2c6ed1 100%);
    border: none;
    box-shadow: 0 4px 10px rgba(74, 144, 226, 0.3);
    transition: all 0.3s ease;
}

.start-btn:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 15px rgba(74, 144, 226, 0.4);
}

.start-btn:active:not(:disabled) {
    transform: translateY(0);
    box-shadow: 0 2px 8px rgba(74, 144, 226, 0.3);
}

/* Mobile Responsive */
@media (max-width: 768px) {
    .prepare-container {
        padding: 10px;
    }

    .prepare-card {
        border-radius: 12px;
    }

    .card-header {
        padding: 20px;
    }

    .card-header h2 {
        font-size: 24px;
    }

    .prepare-content {
        padding: 20px;
    }

    .step-indicator {
        padding: 0;
    }

    .step-number {
        width: 30px;
        height: 30px;
        font-size: 14px;
    }

    .step-label {
        font-size: 12px;
    }

    .resume-header {
        flex-direction: column;
        align-items: center;
        text-align: center;
    }

    .avatar {
        margin-right: 0;
        margin-bottom: 12px;
    }

    .action-buttons {
        flex-direction: column-reverse;
        gap: 12px;
    }

    .back-btn,
    .start-btn {
        width: 100%;
    }
}

/* Element Plus overrides */
:deep(.el-input__inner) {
    height: 44px;
}

:deep(.el-form-item__label) {
    font-weight: 500;
}
</style>
