<template>
    <div class="interview-conduct-container">
        <div v-if="loading" class="loading-container">
            <el-skeleton animated :rows="15" />
        </div>

        <template v-else>
            <!-- 面试头部信息 -->
            <div class="interview-header">
                <div class="interview-info">
                    <h2 class="interview-title">{{ currentInterview?.title || "面试执行" }}</h2>
                    <div class="interview-meta">
                        <el-tag v-if="currentInterview?.type">{{ getInterviewTypeText(currentInterview.type) }}</el-tag>
                        <span>
                            <el-icon>
                                <User />
                            </el-icon>
                            {{ currentInterview?.candidateName || "未知候选人" }}
                        </span>
                        <span>
                            <el-icon>
                                <Briefcase />
                            </el-icon>
                            {{ currentInterview?.position || "未知职位" }}
                        </span>
                    </div>
                </div>

                <div class="interview-controls">
                    <div class="timer-display">
                        <span class="timer-label">用时</span>
                        <span class="timer-value">{{ formatTime(duration) }}</span>
                    </div>

                    <el-button-group>
                        <el-button
                            v-if="interviewStatus === 'pending'"
                            type="primary"
                            @click="startInterview"
                            :disabled="loading"
                        >
                            <el-icon>
                                <VideoPlay />
                            </el-icon>
                            开始面试
                        </el-button>

                        <template v-else>
                            <el-button v-if="recordStatus === 'recording'" type="warning" @click="pauseInterview">
                                <el-icon>
                                    <VideoPause />
                                </el-icon>
                                暂停
                            </el-button>

                            <el-button v-else-if="recordStatus === 'paused'" type="primary" @click="resumeInterview">
                                <el-icon>
                                    <VideoPlay />
                                </el-icon>
                                继续
                            </el-button>

                            <el-button v-if="interviewStatus === 'active'" type="danger" @click="confirmEndInterview">
                                <el-icon>
                                    <CircleClose />
                                </el-icon>
                                结束面试
                            </el-button>
                        </template>
                    </el-button-group>
                </div>
            </div>

            <!-- 面试主体部分 -->
            <div class="interview-main">
                <el-row :gutter="20">
                    <!-- 左侧：问题列表和AI建议 -->
                    <el-col :span="8">
                        <interview-questions-panel
                            :questions="questionList"
                            :used-questions="usedQuestions"
                            :unused-questions="unusedQuestions"
                            @use-question="handleUseQuestion"
                            @add-question="handleAddQuestion"
                        />

                        <ai-suggestion-panel
                            :interview-id="interviewId"
                            :record="interviewRecordList"
                            :disabled="interviewStatus !== 'active'"
                            @use-suggestion="handleUseSuggestion"
                        />
                    </el-col>

                    <!-- 右侧：对话记录和笔记输入 -->
                    <el-col :span="16">
                        <conversation-panel
                            :records="interviewRecordList"
                            :interview-id="interviewId"
                            :status="recordStatus"
                            @add-record="handleAddRecord"
                        />

                        <notes-panel
                            :interview-id="interviewId"
                            :disabled="interviewStatus !== 'active'"
                            @add-note="handleAddNote"
                        />
                    </el-col>
                </el-row>
            </div>

            <!-- 结束面试弹窗 -->
            <el-dialog v-model="endDialogVisible" title="结束面试" width="500px">
                <div class="end-dialog-content">
                    <p>确定要结束本次面试吗？结束后将无法继续添加对话记录，但可以进行评估和分析。</p>

                    <div class="next-actions">
                        <el-checkbox v-model="redirectToAnalysis">完成后跳转到分析页面</el-checkbox>
                    </div>
                </div>
                <template #footer>
                    <span>
                        <el-button @click="endDialogVisible = false">取消</el-button>
                        <el-button type="primary" @click="endInterview" :loading="submitting"> 确认结束 </el-button>
                    </span>
                </template>
            </el-dialog>
        </template>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ElMessage, ElMessageBox } from "element-plus";
import { User, Briefcase, VideoPlay, VideoPause, CircleClose } from "@element-plus/icons-vue";
import { useInterviewStore } from "@/store/modules/interview";
import {
    startInterview as apiStartInterview,
    pauseInterview as apiPauseInterview,
    resumeInterview as apiResumeInterview,
    completeInterview as apiCompleteInterview
} from "@/api/interview";

// 引入子组件
import InterviewQuestionsPanel from "./components/InterviewQuestionsPanel.vue";
import AISuggestionPanel from "./components/AISuggestionPanel.vue";
import ConversationPanel from "./components/ConversationPanel.vue";
import NotesPanel from "./components/NotesPanel.vue";

// 路由
const route = useRoute();
const router = useRouter();

// Store
const interviewStore = useInterviewStore();

// 状态
const interviewId = ref(route.params.id);
const loading = ref(false);
const submitting = ref(false);
const duration = ref(0);
const timerInterval = ref(null);
const endDialogVisible = ref(false);
const redirectToAnalysis = ref(true);

// 计算属性
const currentInterview = computed(() => interviewStore.currentInterview);
const interviewStatus = computed(() => interviewStore.status);
const recordStatus = computed(() => interviewStore.recordStatus);
const questionList = computed(() => interviewStore.questionList);
const interviewRecordList = computed(() => interviewStore.interviewRecord);
const usedQuestions = computed(() => interviewStore.usedQuestions);
const unusedQuestions = computed(() => interviewStore.unusedQuestions);

// 获取面试类型文本
const getInterviewTypeText = (type) => {
    const typeMap = {
        screening: "初筛面试",
        technical: "技术面试",
        hr: "HR面试",
        final: "终面"
    };
    return typeMap[type] || type;
};

// 格式化时间
const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
};

// 开始计时器
const startTimer = () => {
    if (timerInterval.value) {
        clearInterval(timerInterval.value);
    }

    timerInterval.value = setInterval(() => {
        if (recordStatus.value === "recording") {
            duration.value++;
            interviewStore.updateDuration(duration.value);
        }
    }, 1000);
};

// 停止计时器
const stopTimer = () => {
    if (timerInterval.value) {
        clearInterval(timerInterval.value);
        timerInterval.value = null;
    }
};

// 提示离开页面
const promptBeforeLeavingIfActive = (e) => {
    if (interviewStatus.value === "active") {
        e.preventDefault();
        e.returnValue = "";
        return "面试正在进行中，确定要离开吗？";
    }
};

// 开始面试
const startInterview = async () => {
    try {
        loading.value = true;
        await apiStartInterview(interviewId.value);

        interviewStore.startInterview();
        startTimer();

        ElMessage.success("面试已开始");
    } catch (error) {
        ElMessage.error("开始面试失败: " + error.message);
    } finally {
        loading.value = false;
    }
};

// 暂停面试
const pauseInterview = async () => {
    try {
        loading.value = true;
        await apiPauseInterview(interviewId.value);

        interviewStore.pauseInterview();

        ElMessage.info("面试已暂停");
    } catch (error) {
        ElMessage.error("暂停面试失败: " + error.message);
    } finally {
        loading.value = false;
    }
};

// 恢复面试
const resumeInterview = async () => {
    try {
        loading.value = true;
        await apiResumeInterview(interviewId.value);

        interviewStore.resumeInterview();

        ElMessage.success("面试已恢复");
    } catch (error) {
        ElMessage.error("恢复面试失败: " + error.message);
    } finally {
        loading.value = false;
    }
};

// 确认结束面试
const confirmEndInterview = () => {
    endDialogVisible.value = true;
};

// 结束面试
const endInterview = async () => {
    try {
        submitting.value = true;

        const data = {
            duration: duration.value,
            endTime: new Date().toISOString()
        };

        await apiCompleteInterview(interviewId.value, data);

        stopTimer();
        interviewStore.endInterview();
        endDialogVisible.value = false;

        ElMessage.success("面试已结束");

        // 如果选择了跳转到分析页面
        if (redirectToAnalysis.value) {
            router.push(`/interview/analysis/${interviewId.value}`);
        }
    } catch (error) {
        ElMessage.error("结束面试失败: " + error.message);
    } finally {
        submitting.value = false;
    }
};

// 使用问题
const handleUseQuestion = (questionId) => {
    interviewStore.useQuestion(questionId);
};

// 添加问题
const handleAddQuestion = (question) => {
    // 这里添加问题到列表中
    const newQuestion = {
        id: Date.now().toString(),
        content: question.content,
        type: question.type || "custom",
        used: false,
        createdAt: new Date().toISOString()
    };

    interviewStore.questionList.push(newQuestion);
};

// 使用AI建议
const handleUseSuggestion = (suggestion) => {
    // 将AI建议作为问题添加到列表中
    handleAddQuestion({
        content: suggestion,
        type: "ai-suggestion"
    });
};

// 添加对话记录
const handleAddRecord = (record) => {
    interviewStore.addRecord(record);
};

// 添加笔记
const handleAddNote = (note) => {
    // 添加笔记到面试记录中
    if (!interviewStore.currentInterview.notes) {
        interviewStore.currentInterview.notes = [];
    }

    interviewStore.currentInterview.notes.push({
        ...note,
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        author: localStorage.getItem("username") || "面试官"
    });
};

// 获取面试详情
const fetchInterviewDetail = async () => {
    loading.value = true;

    try {
        await interviewStore.fetchInterviewDetail(interviewId.value);

        // 如果已经有持续时间，恢复计时器状态
        if (interviewStore.duration > 0) {
            duration.value = interviewStore.duration;

            // 如果面试状态为进行中且记录状态为录制中，启动计时器
            if (interviewStatus.value === "active" && recordStatus.value === "recording") {
                startTimer();
            }
        }
    } catch (error) {
        ElMessage.error("获取面试详情失败: " + error.message);
    } finally {
        loading.value = false;
    }
};

// 生命周期钩子
onMounted(() => {
    // 如果没有面试ID，跳转回列表页
    if (!interviewId.value) {
        ElMessage.error("缺少面试ID");
        router.push("/interview/list");
        return;
    }

    // 获取面试详情
    fetchInterviewDetail();

    // 添加离开页面前的提示
    window.addEventListener("beforeunload", promptBeforeLeavingIfActive);
});

onBeforeUnmount(() => {
    // 清除计时器
    stopTimer();

    // 移除事件监听
    window.removeEventListener("beforeunload", promptBeforeLeavingIfActive);
});
</script>

<style lang="scss" scoped>
.interview-conduct-container {
    height: 100%;
    display: flex;
    flex-direction: column;

    .loading-container {
        padding: 20px;
    }

    .interview-header {
        background-color: #fff;
        padding: 16px 20px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-radius: 4px;
        margin-bottom: 16px;

        .interview-info {
            .interview-title {
                margin: 0 0 8px 0;
                font-size: 18px;
            }

            .interview-meta {
                display: flex;
                align-items: center;
                gap: 16px;
                color: #606266;
                font-size: 14px;

                span {
                    display: flex;
                    align-items: center;
                    gap: 4px;
                }
            }
        }

        .interview-controls {
            display: flex;
            align-items: center;
            gap: 20px;

            .timer-display {
                text-align: center;

                .timer-label {
                    display: block;
                    font-size: 12px;
                    color: #909399;
                }

                .timer-value {
                    font-size: 20px;
                    font-weight: 500;
                    font-family: monospace;
                }
            }
        }
    }

    .interview-main {
        flex: 1;
        overflow: hidden;
        padding: 0 0 16px 0;
    }

    .end-dialog-content {
        margin-bottom: 20px;

        .next-actions {
            margin-top: 16px;
        }
    }
}
</style>
