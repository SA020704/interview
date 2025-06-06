<template>
    <div class="interview-execution">
        <div class="interview-header">
            <div class="interview-info">
                <h1>{{ currentInterview.candidateName }} - {{ currentInterview.position }}</h1>
                <div class="interview-meta">
                    <span><el-icon>
                            <Calendar />
                        </el-icon> {{ formatDate(currentInterview.date) }}</span>
                    <span><el-icon>
                            <Timer />
                        </el-icon>
                        <InterviewTimer :startTime="interviewStartTime" />
                    </span>
                </div>
            </div>
            <div class="control-buttons">
                <el-button type="primary" size="small" @click="toggleRecording">
                    <el-icon>
                        <Microphone />
                    </el-icon> {{ isRecording ? '暂停录音' : '开始录音' }}
                </el-button>
                <el-button type="success" size="small" @click="finishInterview">
                    <el-icon>
                        <Check />
                    </el-icon> 结束面试
                </el-button>
            </div>
        </div>

        <div class="interview-body">
            <!-- 移动端导航 -->
            <div class="mobile-nav">
                <el-tabs v-model="activeTab" @tab-click="handleTabClick">
                    <el-tab-pane label="问题列表" name="questions"></el-tab-pane>
                    <el-tab-pane label="对话记录" name="conversation"></el-tab-pane>
                    <el-tab-pane label="AI分析" name="analysis"></el-tab-pane>
                    <el-tab-pane label="笔记" name="notes"></el-tab-pane>
                </el-tabs>
            </div>

            <!-- 三栏布局 -->
            <div class="interview-columns">
                <!-- 左侧问题列表 -->
                <div class="left-column" :class="{ 'mobile-hidden': activeTab !== 'questions' }">
                    <QuestionList :questions="interviewQuestions" :currentQuestion="currentQuestion"
                        @select-question="handleSelectQuestion" />
                </div>

                <!-- 中间对话区域 -->
                <div class="center-column" :class="{ 'mobile-hidden': activeTab !== 'conversation' }">
                    <ConversationPanel :conversations="conversations" :isRecording="isRecording" />
                    <VoiceInput :isRecording="isRecording" @transcription-update="handleTranscriptionUpdate" />
                </div>

                <!-- 右侧AI分析与笔记区域 -->
                <div class="right-column">
                    <div :class="{ 'mobile-hidden': activeTab !== 'analysis' }">
                        <AnalysisPanel :currentAnalysis="currentAnalysis" :keywordHighlights="keywordHighlights" />
                        <div class="recommendations-container">
                            <h3>AI推荐问题</h3>
                            <div class="recommendation-list">
                                <RecommendationCard v-for="(rec, index) in recommendations" :key="index"
                                    :recommendation="rec" @use-question="useRecommendedQuestion" />
                            </div>
                        </div>
                    </div>

                    <div :class="{ 'mobile-hidden': activeTab !== 'notes' }">
                        <NotePanel :interviewId="interviewId" @save-note="handleSaveNote" />
                    </div>
                </div>
            </div>
        </div>

        <!-- 结束面试确认对话框 -->
        <el-dialog v-model="finishDialogVisible" title="确认结束面试" width="30%" :before-close="handleCloseDialog">
            <span>确定要结束当前面试吗？面试结束后将进入评估阶段。</span>
            <template #footer>
                <span class="dialog-footer">
                    <el-button @click="finishDialogVisible = false">取消</el-button>
                    <el-button type="primary" @click="confirmFinishInterview">
                        确认结束
                    </el-button>
                </span>
            </template>
        </el-dialog>
    </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onBeforeUnmount } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useInterviewStore } from '@/store/modules/interview';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Calendar, Timer, Microphone, Check } from '@element-plus/icons-vue';

// 导入组件
import QuestionList from './components/QuestionList.vue';
import ConversationPanel from './components/ConversationPanel.vue';
import AnalysisPanel from './components/AnalysisPanel.vue';
import VoiceInput from './components/VoiceInput.vue';
import RecommendationCard from './components/RecommendationCard.vue';
import NotePanel from './components/NotePanel.vue';
import InterviewTimer from './components/InterviewTimer.vue';

// 获取路由参数
const route = useRoute();
const router = useRouter();
const interviewId = route.params.id;

// 使用访问store
const interviewStore = useInterviewStore();

// 响应式状态
const isRecording = ref(false);
const interviewStartTime = ref(new Date());
const finishDialogVisible = ref(false);
const activeTab = ref('conversation'); // 移动端默认显示对话区域

// 模拟数据和状态
const currentInterview = reactive({
    id: interviewId,
    candidateName: '张三',
    position: '前端开发工程师',
    date: new Date(),
    status: 'in-progress'
});

const interviewQuestions = ref([
    { id: 1, content: '请简单介绍一下你自己和你的工作经历', category: '自我介绍', isAsked: false },
    { id: 2, content: '你对Vue3的新特性有哪些了解？', category: '技术能力', isAsked: false },
    { id: 3, content: '请描述一下你在之前项目中遇到的最大挑战以及你是如何解决的', category: '项目经验', isAsked: false },
    { id: 4, content: '你如何看待团队协作？有哪些成功的团队协作经验可以分享', category: '软技能', isAsked: false },
    { id: 5, content: '你对前端性能优化有哪些了解和实践经验？', category: '技术能力', isAsked: false },
]);

const currentQuestion = ref(null);
const conversations = ref([]);
const keywordHighlights = ref([]);
const currentAnalysis = ref({
    strengths: ['沟通表达清晰', '技术知识全面', '解决问题思路清晰'],
    weaknesses: ['项目经验较少', '有些概念理解不够深入'],
    coverage: 65, // 评估维度覆盖率
});

const recommendations = ref([
    {
        question: '能否详细讲解一下你在项目中使用Vue3 Composition API的具体实践？',
        reason: '候选人提到了Vue3经验，但未详细说明具体应用',
        confidence: 85
    },
    {
        question: '你认为前端开发中最重要的三个性能指标是什么？为什么？',
        reason: '基于候选人提到的性能优化经验做进一步深入',
        confidence: 78
    }
]);

// 方法
const formatDate = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
};

const toggleRecording = () => {
    isRecording.value = !isRecording.value;

    if (isRecording.value) {
        ElMessage.success('录音已开始');
    } else {
        ElMessage.info('录音已暂停');
    }
};

const handleSelectQuestion = (question) => {
    currentQuestion.value = question;

    // 标记问题为已问
    const index = interviewQuestions.value.findIndex(q => q.id === question.id);
    if (index !== -1) {
        interviewQuestions.value[index].isAsked = true;
    }

    // 添加到对话记录
    conversations.value.push({
        id: conversations.value.length + 1,
        content: question.content,
        speaker: 'interviewer',
        timestamp: new Date()
    });
};

const handleTranscriptionUpdate = (text) => {
    if (!text.trim()) return;

    // 添加候选人回答到对话记录
    conversations.value.push({
        id: conversations.value.length + 1,
        content: text,
        speaker: 'candidate',
        timestamp: new Date()
    });

    // 模拟分析处理
    simulateAnalysis(text);
};

const simulateAnalysis = (text) => {
    // 模拟关键词提取
    setTimeout(() => {
        // 随机添加一些关键词高亮
        const keywords = ['Vue3', '组件化', '性能优化', 'Composition API', '响应式', '团队协作'];
        const randomKeywords = keywords.filter(() => Math.random() > 0.5);

        keywordHighlights.value = randomKeywords.map(keyword => ({
            text: keyword,
            score: Math.floor(Math.random() * 40) + 60
        }));

        // 随机更新推荐问题
        if (Math.random() > 0.7) {
            const newRecommendation = {
                question: `关于${randomKeywords[0] || '技术'}，你有哪些实际项目中的应用案例？`,
                reason: `候选人提到了${randomKeywords[0] || '相关技术'}，可以深入了解实际应用情况`,
                confidence: Math.floor(Math.random() * 20) + 70
            };

            recommendations.value = [newRecommendation, ...recommendations.value.slice(0, 1)];
        }
    }, 1000);
};

const useRecommendedQuestion = (question) => {
    // 使用AI推荐的问题
    conversations.value.push({
        id: conversations.value.length + 1,
        content: question,
        speaker: 'interviewer',
        timestamp: new Date()
    });

    ElMessage.success('已添加推荐问题到对话');
};

const handleSaveNote = (note) => {
    ElMessage.success('笔记已保存');
    // 实际应用中这里会保存到store或发送到后端
};

const finishInterview = () => {
    finishDialogVisible.value = true;
};

const handleCloseDialog = () => {
    finishDialogVisible.value = false;
};

const confirmFinishInterview = () => {
    finishDialogVisible.value = false;

    // 保存面试数据
    ElMessage.success('面试已结束，正在生成分析报告...');

    // 跳转到面试分析页面
    router.push(`/interview/analysis/${interviewId}`);
};

const handleTabClick = (tab) => {
    // 移动端视图切换处理
    activeTab.value = tab.props.name;
};

// 生命周期钩子
onMounted(() => {
    // 实际应用中这里会加载面试数据
    console.log('面试执行页面加载，ID:', interviewId);

    // 监听窗口关闭事件，提醒用户保存
    window.addEventListener('beforeunload', beforeUnloadHandler);
});

onBeforeUnmount(() => {
    window.removeEventListener('beforeunload', beforeUnloadHandler);
});

const beforeUnloadHandler = (e) => {
    // 如果面试正在进行中，显示提示
    if (currentInterview.status === 'in-progress') {
        e.preventDefault();
        e.returnValue = '面试尚未结束，确定要离开吗？';
    }
};
</script>

<style scoped>
.interview-execution {
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow: hidden;
}

.interview-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 20px;
    background-color: #fff;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    z-index: 10;
}

.interview-info h1 {
    font-size: 20px;
    margin: 0 0 8px 0;
}

.interview-meta {
    display: flex;
    gap: 16px;
    color: #606266;
    font-size: 14px;
}

.interview-meta span {
    display: flex;
    align-items: center;
    gap: 4px;
}

.interview-body {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
}

.interview-columns {
    display: flex;
    height: 100%;
    overflow: hidden;
}

.left-column {
    width: 25%;
    min-width: 250px;
    border-right: 1px solid #ebeef5;
    overflow: auto;
}

.center-column {
    flex: 1;
    display: flex;
    flex-direction: column;
    border-right: 1px solid #ebeef5;
    overflow: hidden;
}

.right-column {
    width: 30%;
    min-width: 300px;
    overflow: auto;
}

.recommendations-container {
    padding: 16px;
    border-top: 1px solid #ebeef5;
}

.recommendations-container h3 {
    margin-top: 0;
    margin-bottom: 16px;
    font-size: 16px;
    color: #303133;
}

.recommendation-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.mobile-nav {
    display: none;
}

.mobile-hidden {
    display: block;
}

/* 移动端响应式设计 */
@media (max-width: 992px) {
    .interview-columns {
        flex-direction: column;
    }

    .left-column,
    .center-column,
    .right-column {
        width: 100%;
        border-right: none;
    }

    .mobile-nav {
        display: block;
        padding: 0 16px;
        background-color: #fff;
        border-bottom: 1px solid #ebeef5;
    }

    .mobile-hidden {
        display: none;
    }

    .interview-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 12px;
    }

    .control-buttons {
        display: flex;
        width: 100%;
        gap: 12px;
    }

    .control-buttons .el-button {
        flex: 1;
    }
}

/* 小屏幕进一步优化 */
@media (max-width: 576px) {
    .interview-info h1 {
        font-size: 18px;
    }

    .interview-meta {
        flex-direction: column;
        gap: 4px;
    }
}
</style>