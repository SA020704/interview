<template>
    <div class="interview-container">
        <!-- Interview Header -->
        <div class="interview-header">
            <div class="interview-info">
                <h2>
                    {{ interviewData.resumeInfo?.name || "应聘者" }} - {{ interviewData.settings?.position || "面试" }}
                </h2>
                <div class="interview-timer">
                    <el-icon><Timer /></el-icon>
                    <span>{{ formatTime(elapsedTime) }}</span>
                </div>
            </div>

            <div class="recording-status" :class="{ active: canclevice }">
                <span class="recording-indicator"></span>
                {{ isRecording ? "录音中..." : "录音已暂停" }}
            </div>

            <div class="interview-controls">
                <el-button :type="!canclevice ? 'danger' : 'primary'" @click="toggleRecording">
                    {{ !canclevice ? "结束录音" : "开始录音" }}
                </el-button>
                <!-- <el-button :type="isRecording ? 'danger' : 'primary'" @click="toggleRecording">
                    {{ isRecording ? "暂停录音" : "开始录音" }}
                </el-button> -->
                <el-button @click="viewInterviewRecord">
                   查看记录
                </el-button>
                <el-button type="warning" @click="endInterview"> 面试总结 </el-button>
                <el-button type="primary" @click="router.push('/')"> 下一场面试 </el-button>
            </div>
        </div>

        <div class="interview-main">
            <!-- Main Interview Content -->
            <div class="interview-content">
                <!-- AI 推荐问题区域 - 主要功能区 -->
                <div class="ai-questions-area">
                    <div class="area-header">
                        <div class="area-title">
                            <el-icon><Connection /></el-icon>
                            <span>AI 推荐问题</span>
                        </div>

                        <div class="area-actions">
                            <el-button-group>
                                <el-button
                                    size="small"
                                    :disabled="currentQuestionSetIndex <= 0"
                                    @click="showPreviousQuestionSet"
                                >
                                    <el-icon><ArrowLeft /></el-icon>
                                </el-button>

                                <el-button
                                    size="small"
                                    :disabled="currentQuestionSetIndex >= aiRecommendedHistoryQuestions.length - 1"
                                    @click="showNextQuestionSet"
                                >
                                    <el-icon><ArrowRight /></el-icon>
                                </el-button>
                            </el-button-group>

                            <el-button type="primary" size="small" @click="refreshRecommendations">
                                <el-icon><Refresh /></el-icon> 刷新
                            </el-button>
                        </div>
                    </div>

                    <div class="ai-questions">
                        <transition-group name="question-fade">
                            <div
                                v-for="(question, index) in aiRecommendedQuestions"
                                :key="index"
                                class="ai-question-card"
                            >
                                <div class="question-content">
                                    <div class="question-number">{{ index + 1 }}</div>
                                    <div class="question-text">{{ question }}</div>
                                </div>

                                <div class="question-actions">
                                    <el-tooltip content="使用此问题" placement="top">
                                        <el-button type="primary" circle size="small" @click="selectQuestion(question)">
                                            <el-icon><Select /></el-icon>
                                        </el-button>
                                    </el-tooltip>

                                    <el-tooltip
                                        :content="isQuestionFavorited(question) ? '取消收藏' : '收藏问题'"
                                        placement="top"
                                    >
                                        <el-button
                                            :type="isQuestionFavorited(question) ? 'warning' : 'info'"
                                            circle
                                            size="small"
                                            @click="toggleFavorite(question)"
                                        >
                                            <el-icon><Star /></el-icon>
                                        </el-button>
                                    </el-tooltip>
                                </div>
                            </div>
                        </transition-group>

                        <div
                            v-if="!aiRecommendedQuestions || aiRecommendedQuestions?.length === 0"
                            class="no-questions"
                        >
                            暂无推荐问题，请点击刷新获取新问题
                        </div>
                    </div>

                    <div class="pagination-indicator" v-if="aiRecommendedHistoryQuestions.length > 1">
                        <span
                            v-for="(_, index) in aiRecommendedHistoryQuestions"
                            :key="index"
                            :class="['indicator-dot', { active: index === currentQuestionSetIndex }]"
                            @click="setQuestionSetIndex(index)"
                        ></span>
                    </div>
                </div>

                <!-- 当前问题区域 -->
                <!-- <div class="current-question-area">
                    <div class="area-header">
                        <div class="area-title">
                            <el-icon><ChatLineRound /></el-icon>
                            <span>当前问题</span>
                        </div>

                        <el-button size="small" type="success" @click="nextQuestion" :disabled="!currentQuestion">
                            下一题 <el-icon class="el-icon--right"><ArrowRight /></el-icon>
                        </el-button>
                    </div>

                    <div class="current-question">
                        <el-empty v-if="!currentQuestion" description="请从AI推荐中选择一个问题追问"></el-empty>
                        <div v-else class="question-display">{{ currentQuestion }}</div>
                    </div>
                </div> -->

                <!-- 收藏问题区域 -->
                <!-- <div class="favorite-questions-area" v-if="favoriteQuestions.length > 0">
                    <div class="area-header">
                        <div class="area-title">
                            <el-icon><Star /></el-icon>
                            <span>收藏的问题</span>
                        </div>
                    </div>

                    <div class="favorite-questions">
                        <el-scrollbar max-height="150px">
                            <el-tag
                                v-for="(question, index) in favoriteQuestions"
                                :key="index"
                                closable
                                @close="removeFavorite(question)"
                                @click="selectQuestion(question)"
                                class="favorite-question-tag"
                            >
                                {{ question }}
                            </el-tag>
                        </el-scrollbar>
                    </div>
                </div> -->

                <!-- 关键词区域 -->
                <!-- <div class="keywords-area" v-if="extractedKeywords.length > 0">
                    <div class="area-header">
                        <div class="area-title">
                            <el-icon><Collection /></el-icon>
                            <span>关键词提取</span>
                        </div>
                    </div>

                    <div class="keywords-content">
                        <el-tag
                            v-for="(keyword, index) in extractedKeywords"
                            :key="index"
                            class="keyword-tag"
                            @click="focusOnKeyword(keyword)"
                        >
                            {{ keyword }}
                        </el-tag>
                    </div>
                </div> -->
            </div>

            <!-- Question Bank Sidebar - Collapsible on mobile -->
            <!-- <div class="questions-section" :class="{ collapsed: isQuestionBankCollapsed }">
                <div class="section-header">
                    <div class="section-title">面试题库</div>
                    <el-icon @click="toggleQuestionBank"><ArrowRight /></el-icon>
                </div>

                <el-tabs v-model="activeQuestionCategory" class="question-tabs">
                    <el-tab-pane
                        v-for="(category, index) in questionCategories"
                        :key="index"
                        :label="category.name"
                        :name="category.name"
                    >
                        <div class="questions-list">
                            <div
                                v-for="(question, qIndex) in category.questions"
                                :key="qIndex"
                                :class="['question-item', { active: currentQuestion === question }]"
                                @click="selectQuestion(question)"
                            >
                                {{ question }}
                            </div>
                        </div>
                    </el-tab-pane>
                </el-tabs>
            </div> -->
        </div>

        <!-- Mobile Question Bank Toggle Button -->
        <!-- <div class="mobile-question-bank-toggle" @click="toggleQuestionBank">
            <el-icon v-if="isQuestionBankCollapsed"><ArrowRight /></el-icon>
            <el-icon v-else><ArrowLeft /></el-icon>
            题库
        </div> -->

        <!-- Interview Record Dialog -->
        <el-dialog v-model="recordDialogVisible" title="面试记录" width="90%" fullscreen>
            <div class="interview-record">
                <div class="record-header">
                    <h2>{{ interviewData.resumeInfo?.name || "应聘者" }} - 面试记录</h2>
                    <p>面试时长: {{ formatTime(elapsedTime) }}</p>
                </div>

                <div class="record-tabs">
                    <!-- 总览标签页 -->
                    <div class="tab-content summary-tab">
                        <div v-if="interviewRecords.length === 0" class="empty-record">
                            <el-empty description="暂无面试记录"></el-empty>
                        </div>
                        <div v-else class="summary-list">
                            <div
                                v-for="(topic, index) in interviewRecords"
                                :key="index"
                                class="topic-card"
                                @click="showTopicDetails(index)"
                            >
                                <div class="topic-header">
                                    <span class="topic-index">{{ formatTimeRange(index) }}</span>
                                    <h3>{{ topic.title }}</h3>
                                </div>
                                <div class="topic-summary">
                                    <p>{{ topic.summary }}</p>
                                </div>
                                <div class="topic-keywords">
                                    <el-tag
                                        v-for="(keyword, kIndex) in topic.keywords"
                                        :key="kIndex"
                                        size="small"
                                        effect="light"
                                        class="keyword-tag"
                                    >
                                        {{ keyword }}
                                    </el-tag>
                                </div>
                                <div class="topic-actions">
                                    <el-button type="text" size="small">
                                        查看详情
                                        <i class="el-icon-arrow-right"></i>
                                    </el-button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 当前选中的话题详情对话框 -->
                <el-dialog
                    v-model="topicDialogVisible"
                    :title="currentTopic ? currentTopic.title : '话题详情'"
                    width="80%"
                    destroy-on-close
                    fullscreen
                >
                    <div v-if="currentTopic" class="topic-detail">
                        <div class="topic-summary-section">
                            <h4>总结</h4>
                            <p>{{ currentTopic.summary }}</p>

                            <div class="topic-keywords">
                                <!-- <span>关键词</span> -->
                                <div class="keywords-container">
                                    <el-tag
                                        v-for="(keyword, kIndex) in currentTopic.keywords"
                                        :key="kIndex"
                                        size="small"
                                        effect="dark"
                                        class="keyword-tag"
                                    >
                                        {{ keyword }}
                                    </el-tag>
                                </div>
                            </div>
                        </div>

                        <el-divider></el-divider>

                        <div class="topic-qa-section">
                            <h4>问答记录</h4>
                            <div class="topic-qa-list">
                                <div v-for="(qa, index) in currentTopic.details" :key="index" class="topic-qa-item">
                                    <div class="topic-question">
                                        <div class="question-icon">Q</div>
                                        <div class="question-content">{{ qa.question }}</div>
                                    </div>
                                    <div class="topic-answer">
                                        <div class="answer-icon">A</div>
                                        <div class="answer-content">{{ qa.answer }}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </el-dialog>

                <!-- <div class="record-actions">
                    <el-button @click="generateReport">生成完整报告</el-button>
                    <el-button type="primary" @click="exportRecord">导出记录</el-button>
                </div> -->
            </div>
        </el-dialog>

        <!-- End Interview Dialog -->
        <el-dialog v-model="endInterviewDialogVisible" title="结束面试" width="90%" :fullscreen="isMobile">
            <div class="end-interview-content">
                <p>确定要生成总结么，点击这场面试就会终止？</p>
            </div>
            <template #footer>
                <span class="dialog-footer">
                    <el-button @click="endInterviewDialogVisible = false">取消</el-button>
                    <el-button type="primary" @click="confirmEndInterview"> 确认 </el-button>
                </span>
            </template>
        </el-dialog>

        <!-- Interview Summary Dialog -->
        <el-dialog v-model="summaryDialogVisible" title="面试总结报告" width="90%" fullscreen>
            <div class="interview-summary" v-if="interviewSummary">
                <div class="summary-header">
                    <h2>{{ interviewData.resumeInfo?.name || "应聘者" }} - 面试总结报告</h2>
                    <p>面试时长: {{ formatTime(elapsedTime) }} | 面试日期: {{ new Date().toLocaleDateString() }}</p>
                </div>

                <el-divider />

                <div class="summary-content">
                    <el-row :gutter="20">
                        <el-col :xs="24" :sm="24" :md="16">
                            <div class="summary-main">
                                <div class="summary-section">
                                    <h3>整体评价</h3>
                                    <div class="overall-rating">
                                        <el-rate
                                            v-model="interviewSummary.overallEvaluation.score"
                                            disabled
                                            show-score
                                            text-color="#ff9900"
                                        />
                                    </div>
                                    <p class="overall-comment">{{ interviewSummary?.overallEvaluation?.summarize }}</p>
                                </div>

                                <el-divider />

                                <div class="summary-section">
                                    <h3>能力评估</h3>
                                    <div class="skill-assessment">
                                        <el-row :gutter="20">
                                            <el-col :xs="24" :sm="12">
                                                <div class="skill-item">
                                                    <span class="skill-name">技术能力</span>
                                                    <el-progress
                                                        :percentage="interviewSummary?.technicalAbility?.score * 20"
                                                        :color="
                                                            getSkillColor(
                                                                interviewSummary?.technicalAbility?.score * 20
                                                            )
                                                        "
                                                    ></el-progress>
                                                    <p class="skill-description">
                                                        {{ interviewSummary.technicalAbility.summarize }}
                                                    </p>
                                                </div>
                                            </el-col>
                                            <el-col :xs="24" :sm="12">
                                                <div class="skill-item">
                                                    <span class="skill-name">主动性</span>
                                                    <el-progress
                                                        :percentage="interviewSummary?.activeDrive?.score * 20"
                                                        :color="
                                                            getSkillColor(interviewSummary?.activeDrive?.score * 20)
                                                        "
                                                    ></el-progress>
                                                    <p class="skill-description">
                                                        {{ interviewSummary?.activeDrive?.summarize }}
                                                    </p>
                                                </div>
                                            </el-col>
                                        </el-row>

                                        <el-row :gutter="20" class="mt-4">
                                            <el-col :xs="24" :sm="12">
                                                <div class="skill-item">
                                                    <span class="skill-name">团队协作</span>
                                                    <el-progress
                                                        :percentage="interviewSummary?.teamCooperation?.score * 20"
                                                        :color="
                                                            getSkillColor(interviewSummary?.teamCooperation?.score * 20)
                                                        "
                                                    ></el-progress>
                                                    <p class="skill-description">
                                                        {{ interviewSummary?.teamCooperation?.summarize }}
                                                    </p>
                                                </div>
                                            </el-col>
                                            <el-col :xs="24" :sm="12">
                                                <div class="skill-item">
                                                    <span class="skill-name">产品思维</span>
                                                    <el-progress
                                                        :percentage="interviewSummary?.productThinking?.score * 20"
                                                        :color="
                                                            getSkillColor(interviewSummary?.productThinking?.score * 20)
                                                        "
                                                    ></el-progress>
                                                    <p class="skill-description">
                                                        {{ interviewSummary?.productThinking?.summarize }}
                                                    </p>
                                                </div>
                                            </el-col>
                                        </el-row>

                                        <el-row :gutter="20" class="mt-4">
                                            <el-col :xs="24" :sm="12">
                                                <div class="skill-item">
                                                    <span class="skill-name">架构思维</span>
                                                    <el-progress
                                                        :percentage="interviewSummary?.architectureThinking?.score * 20"
                                                        :color="
                                                            getSkillColor(
                                                                interviewSummary?.architectureThinking?.score * 20
                                                            )
                                                        "
                                                    ></el-progress>
                                                    <p class="skill-description">
                                                        {{ interviewSummary?.architectureThinking?.summarize }}
                                                    </p>
                                                </div>
                                            </el-col>
                                            <el-col :xs="24" :sm="12">
                                                <div class="skill-item">
                                                    <span class="skill-name">管理能力</span>
                                                    <el-progress
                                                        :percentage="interviewSummary?.managementAbility?.score * 20"
                                                        :color="
                                                            getSkillColor(
                                                                interviewSummary?.managementAbility?.score * 20
                                                            )
                                                        "
                                                    ></el-progress>
                                                    <p class="skill-description">
                                                        {{ interviewSummary?.managementAbility?.summarize }}
                                                    </p>
                                                </div>
                                            </el-col>
                                        </el-row>
                                    </div>
                                </div>
                            </div>
                        </el-col>

                        <el-col :xs="24" :sm="24" :md="8">
                            <div class="summary-sidebar">
                                <div class="summary-section">
                                    <h3>
                                        优势
                                        <el-tag type="success" size="small"
                                            >{{ interviewSummary.advantage.score }}/{{
                                                interviewSummary.advantage.fullMarks
                                            }}</el-tag
                                        >
                                    </h3>
                                    <div class="strength-content">
                                        <p>{{ interviewSummary.advantage.summarize }}</p>
                                    </div>
                                </div>

                                <el-divider />

                                <div class="summary-section">
                                    <h3>
                                        改进空间
                                        <el-tag type="warning" size="small"
                                            >{{ interviewSummary.disadvantage.score }}/{{
                                                interviewSummary.disadvantage.fullMarks
                                            }}</el-tag
                                        >
                                    </h3>
                                    <div class="weakness-content">
                                        <p>{{ interviewSummary.disadvantage.summarize }}</p>
                                    </div>
                                </div>

                                <el-divider />

                                <div class="summary-section">
                                    <h3>招聘建议</h3>
                                    <el-alert
                                        :title="getRecommendationTitle(interviewSummary.overallEvaluation.score)"
                                        :type="getRecommendationType(interviewSummary.overallEvaluation.score)"
                                        show-icon
                                        :closable="false"
                                        class="recommendation-alert"
                                    ></el-alert>

                                    <div class="recommendation-notes mt-3">
                                        <p>{{ getRecommendationNotes(interviewSummary.overallEvaluation) }}</p>
                                    </div>
                                </div>
                            </div>
                        </el-col>
                    </el-row>
                </div>
            </div>
            <template #footer>
                <span class="dialog-footer">
                    <el-button @click="viewInterviewRecord">查看记录</el-button>
                    <el-button @click="printSummary">打印报告</el-button>
                    <el-button type="primary" @click="exportSummary">导出PDF</el-button>
                    <el-button type="success" @click="finishInterview">完成</el-button>
                </span>
            </template>
        </el-dialog>
    </div>
</template>
<script setup>
import { ref, onMounted, onBeforeUnmount, nextTick, computed } from "vue";
import { useRouter } from "vue-router";
import {
    Timer,
    Refresh,
    Document,
    Connection,
    Select,
    Star,
    ArrowRight,
    ArrowLeft,
    Close,
    ChatLineRound,
    Collection
} from "@element-plus/icons-vue";
import { singleAPI, getaAudioAnalysisResAPI, audioAnalysisAPI, getAiEvaluationAPI } from "@/api/api/api";
import { ElMessage, ElLoading } from "element-plus";

const router = useRouter();
// Add these new reactive references
const isQuestionBankCollapsed = ref(false); // Start with collapsed question bank on mobile
const canclevice = ref(true);
const voiceTimer = ref(null);
// Add this new computed property
const currentCategoryQuestions = computed(() => {
    const category = questionCategories.value.find((c) => c.name === activeQuestionCategory.value);
    return category ? category.questions : [];
});
let recognitionInstance = null;

// 添加处理状态锁
const isProcessing = ref(false);
// Add these new methods
const toggleQuestionBank = () => {
    isQuestionBankCollapsed.value = !isQuestionBankCollapsed.value;
};

const nextQuestion = () => {
    if (!currentQuestion.value) return;

    const category = questionCategories.value.find((c) => c.name === activeQuestionCategory.value);
    if (!category) return;

    const currentIndex = category.questions.indexOf(currentQuestion.value);
    if (currentIndex === -1 || currentIndex === category.questions.length - 1) {
        // If at the end of current category, try to move to next category
        const categoryIndex = questionCategories.value.findIndex((c) => c.name === activeQuestionCategory.value);
        if (categoryIndex < questionCategories.value.length - 1) {
            activeQuestionCategory.value = questionCategories.value[categoryIndex + 1].name;
            selectQuestion(questionCategories.value[categoryIndex + 1].questions[0]);
        } else {
            ElMessage.info("已经是最后一个问题了");
        }
    } else {
        // Move to next question in current category
        selectQuestion(category.questions[currentIndex + 1]);
    }

    // Generate new AI recommendations
    refreshRecommendations();
};
// 检测是否为移动设备
const isMobile = computed(() => {
    return window.innerWidth < 768;
});

// 获取面试数据
const interviewData = ref(JSON.parse(localStorage.getItem("currentInterview") || "{}"));

// 面试计时
const elapsedTime = ref(0);
let timerInterval = null;

// 录音状态 - 默认不开始录音
const isRecording = ref(false);
let mediaRecorder = null;
let audioChunks = [];
let recordingStream = null;

// 当前问题和转写内容
const currentQuestion = ref("");
const currentTranscription = ref("");
const transcriptionContent = ref(null);

// AI推荐问题 - 高亮显示的三个问题
const aiRecommendedQuestions = ref([]);
// 示例问题集合历史记录
const aiRecommendedHistoryQuestions = ref([]);

// 当前问题集索引
const currentQuestionSetIndex = ref(0);

// 切换到上一组问题
const showPreviousQuestionSet = () => {
    if (currentQuestionSetIndex.value > 0) {
        currentQuestionSetIndex.value--;
        aiRecommendedQuestions.value = aiRecommendedHistoryQuestions.value[currentQuestionSetIndex.value];
    }
};

// 切换到下一组问题
const showNextQuestionSet = () => {
    if (currentQuestionSetIndex.value < aiRecommendedHistoryQuestions.value.length - 1) {
        currentQuestionSetIndex.value++;
        aiRecommendedQuestions.value = aiRecommendedHistoryQuestions.value[currentQuestionSetIndex.value];
    }
};

// 直接设置问题集索引
const setQuestionSetIndex = (index) => {
    if (index >= 0 && index < aiRecommendedHistoryQuestions.value.length) {
        currentQuestionSetIndex.value = index;
    }
};

// 收藏的问题
const favoriteQuestions = ref([]);

// 提取的关键词
const extractedKeywords = ref([]);

// 问题分类
const activeQuestionCategory = ref("");
const questionCategories = ref([
    {
        name: "技术能力",
        questions: [
            "Vue 3的响应式原理是什么？",
            "谈谈你对虚拟DOM的理解",
            "如何优化前端性能？",
            "TypeScript相比JavaScript有哪些优势？",
            "Webpack的工作原理是什么？",
            "如何处理前端安全问题？",
            "谈谈你对微前端的理解"
        ]
    },
    {
        name: "项目经验",
        questions: [
            "描述一下你最近参与的项目",
            "你在项目中遇到的最大挑战是什么？",
            "如何进行技术选型？",
            "如何保证代码质量？",
            "你如何处理团队协作中的冲突？",
            "如何平衡产品需求和技术实现？"
        ]
    },
    {
        name: "个人发展",
        questions: [
            "你的职业规划是什么？",
            "你如何保持技术更新？",
            "你最近学习了哪些新技术？",
            "你认为前端未来的发展趋势是什么？",
            "你如何看待人工智能对前端开发的影响？"
        ]
    }
]);

const audioRecords = ref([]);

// 面试实时总结数据
const interviewProgress = ref(30);
const coveredAreas = ref(["Vue技术栈", "性能优化", "项目经验"]);
const performanceMetrics = ref([
    { name: "技术深度", score: 4 },
    { name: "沟通能力", score: 4.5 },
    { name: "解决问题", score: 3.5 },
    { name: "项目经验", score: 4 },
    { name: "学习能力", score: 4.5 },
    { name: "团队协作", score: 4 }
]);
const aiSummary = ref(
    "候选人在技术领域展示了扎实的基础知识，特别是在Vue框架和前端优化方面。沟通表达清晰，能够结合实际项目经验回答问题。建议进一步了解其在复杂项目中的实际解决方案和技术选型决策过程。"
);
const recommendedAreas = ref([
    "深入了解候选人在大型项目中的架构设计经验",
    "探讨前端与后端交互中遇到的挑战及解决方案",
    "了解候选人对新技术的学习方法和应用案例"
]);

// 对话框控制
const recordDialogVisible = ref(false);
const activeRecordTab = ref("text");
const endInterviewDialogVisible = ref(false);
const summaryDialogVisible = ref(false);
const interviewSummary = ref(null);

// 格式化时间
const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
};

// 进度格式化
const progressFormat = (percentage) => {
    return `${percentage}%`;
};

// 检查问题是否已收藏
const isQuestionFavorited = (question) => {
    return favoriteQuestions.value.includes(question);
};

// ============= 录音相关状态和变量 =============
// 录音状态: 1-初始状态, 2-录音中, 3-录音完成可播放, 4-播放中
const voiceStatus = ref(1);
const isPlaying = ref(false);
const isUploading = ref(false);
const currentSegmentTime = ref(0);
const totalRecordingTime = ref(0);
const playStamp = ref(0);
const showRecordTime = ref(false);
const secondsTimer = ref(null);
const segmentTimer = ref(null);
const currentPlaybackUrl = ref(null);
const voiceBlobs = ref([]);
const uploadedSegments = ref([]);
const showRedo = ref(false);
const voiceAudio = ref(null);
const segments = ref([]);
// History state handling for back button
const setupBackButtonHandler = () => {
    // Push a dummy state to the history when component mounts
    history.pushState({ page: "interview" }, "");

    // Event handler for popstate (back button)
    const handlePopState = (event) => {
        // Prevent default behavior
        event.preventDefault();

        // Check if any dialog is open
        if (summaryDialogVisible.value) {
            // Close the summary dialog
            summaryDialogVisible.value = false;
            // Push state again to maintain history
            history.pushState({ page: "interview" }, "");
        } else if (recordDialogVisible.value) {
            // Close the record dialog
            recordDialogVisible.value = false;
            // Push state again to maintain history
            history.pushState({ page: "interview" }, "");
        } else {
            // If no dialogs are open, navigate back
            router.back();
        }
    };

    // Add event listener
    window.addEventListener("popstate", handlePopState);

    // Return cleanup function
    return () => {
        window.removeEventListener("popstate", handlePopState);
    };
};
// 初始化
onMounted(() => {
    const cleanupBackHandler = setupBackButtonHandler();

    onBeforeUnmount(() => {
        // Other cleanup code...

        // Clean up back button handler
        cleanupBackHandler();
    });
    // 开始计时
    timerInterval = setInterval(() => {
        elapsedTime.value++;
    }, 1000);

    // 初始化问题分类
    if (interviewData.value.questions && interviewData.value.questions.length > 0) {
        questionCategories.value = interviewData.value.questions;
    }
    activeQuestionCategory.value = questionCategories.value[0].name;

    // 添加窗口大小变化监听
    window.addEventListener("resize", handleResize);

    // 检查浏览器兼容性
    checkBrowserCompatibility();
});

// 清理
onBeforeUnmount(() => {
    if (timerInterval) {
        clearInterval(timerInterval);
    }

    // 停止录音
    if (isRecording.value) {
        stopRecording();
    }

    // 移除窗口大小变化监听
    window.removeEventListener("resize", handleResize);

    // 清理录音资源
    destroyRecorder();
    clearAllTimers();
    releaseAllResources();
});

// 处理窗口大小变化
const handleResize = () => {
    // 可以在这里添加响应式布局相关的逻辑
};

// ============= 录音功能实现 =============

// 检查浏览器兼容性
const checkBrowserCompatibility = () => {
    // 检查是否为安全上下文
    const isSecureContext = window.isSecureContext !== false;

    // 检查 MediaDevices API
    const hasMediaDevices = !!navigator.mediaDevices;

    // 检查 getUserMedia
    let hasGetUserMedia = false;

    if (hasMediaDevices) {
        hasGetUserMedia = !!navigator.mediaDevices.getUserMedia;
    } else if (
        navigator.getUserMedia ||
        navigator.webkitGetUserMedia ||
        navigator.mozGetUserMedia ||
        navigator.msGetUserMedia
    ) {
        hasGetUserMedia = true;
    }

    const compatibility = {
        isSecureContext,
        hasMediaDevices,
        hasGetUserMedia,
        isSafari: /^((?!chrome|android).)*safari/i.test(navigator.userAgent)
    };

    // 如果不支持录音，立即通知
    if (!compatibility.hasMediaDevices || !compatibility.hasGetUserMedia) {
        ElMessage.error("您的浏览器不支持录音功能，请使用最新版本的Chrome、Firefox或Safari");
    } else if (!compatibility.isSecureContext) {
        ElMessage.error("录音功能需要在安全上下文(HTTPS或localhost)中使用");
    }

    return compatibility;
};

// 安全获取用户媒体
const safeGetUserMedia = async (constraints) => {
    const compatibility = checkBrowserCompatibility();

    if (!compatibility.isSecureContext) {
        throw new Error("需要安全上下文(HTTPS或localhost)才能使用录音功能");
    }

    if (!compatibility.hasMediaDevices || !compatibility.hasGetUserMedia) {
        throw new Error("浏览器不支持 getUserMedia");
    }

    // Safari 特殊处理
    if (compatibility.isSafari) {
        // 确保 Safari 已启用媒体捕获
        if (!navigator.mediaDevices) {
            navigator.mediaDevices = {};
        }

        // Safari 旧版本的 polyfill
        if (!navigator.mediaDevices.getUserMedia) {
            navigator.mediaDevices.getUserMedia = (constraints) => {
                const getUserMedia = navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

                if (!getUserMedia) {
                    return Promise.reject(new Error("浏览器不支持 getUserMedia"));
                }

                return new Promise((resolve, reject) => {
                    getUserMedia.call(navigator, constraints, resolve, reject);
                });
            };
        }

        // Safari 需要特别处理音频约束
        const safariFriendlyConstraints = {
            ...constraints,
            audio: {
                ...constraints.audio,
                // 添加 Safari 特定设置
                echoCancellation: false, // Safari 有时对回声消除支持不好
                autoGainControl: false, // 自动增益可能导致问题
                noiseSuppression: true // 噪声抑制通常是安全的
            }
        };

        try {
            return await navigator.mediaDevices.getUserMedia(safariFriendlyConstraints);
        } catch (err) {
            // 如果失败，尝试最简单的约束
            if (
                err.name === "NotFoundError" ||
                err.name === "DevicesNotFoundError" ||
                err.name === "OverconstrainedError" ||
                err.name === "ConstraintNotSatisfiedError"
            ) {
                return await navigator.mediaDevices.getUserMedia({ audio: true });
            }
            throw err;
        }
    } else {
        // 非 Safari 浏览器正常处理
        return await navigator.mediaDevices.getUserMedia(constraints);
    }
};

// 清理所有计时器
const clearAllTimers = () => {
    if (secondsTimer.value) {
        clearInterval(secondsTimer.value);
        secondsTimer.value = null;
    }

    if (segmentTimer.value) {
        clearTimeout(segmentTimer.value);
        segmentTimer.value = null;
    }
};

// 释放所有资源
const releaseAllResources = () => {
    // 释放所有音频URL
    if (currentPlaybackUrl.value) {
        URL.revokeObjectURL(currentPlaybackUrl.value);
        currentPlaybackUrl.value = null;
    }

    // 清空Blob数组
    voiceBlobs.value = [];

    // 确保停止语音识别
    stopSpeechRecognition();

    // 确保停止录音
    if (mediaRecorder && mediaRecorder.state !== "inactive") {
        try {
            mediaRecorder.stop();
        } catch (e) {
            console.error("停止媒体录制器失败:", e);
        }
    }

    // 停止所有音轨
    if (recordingStream) {
        recordingStream.getTracks().forEach((track) => track.stop());
        recordingStream = null;
    }

    mediaRecorder = null;
    audioChunks = [];
};

// 开始录音
const startRecording = async () => {
    if (isRecording.value) return;

    try {
        // 使用安全的 getUserMedia 方法
        const stream = await safeGetUserMedia({
            audio: {
                sampleRate: 16000,
                echoCancellation: false,
                noiseSuppression: true,
                autoGainControl: false
            }
        });

        recordingStream = stream;

        // 创建 MediaRecorder 实例
        const options = { mimeType: "audio/wav" };
        try {
            mediaRecorder = new MediaRecorder(stream, options);
        } catch (e) {
            console.warn("WebM格式不受支持，尝试其他格式");
            mediaRecorder = new MediaRecorder(stream);
        }

        audioChunks = [];

        // 收集录音数据
        mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
                audioChunks.push(event.data);
            }
        };

        // 开始录音
        mediaRecorder.start(1000); // 每秒收集一次数据

        // 重置计时器和状态
        currentSegmentTime.value = 0;
        totalRecordingTime.value = 0;

        voiceStatus.value = 2;
        isRecording.value = true;
        showRedo.value = false;

        // 开始计时
        startTimers();

        // 开始语音识别
        startSpeechRecognition();
        canclevice.value = false;
        // ElMessage.success("录音已开始");
        setTimeout(() => {
            stopRecording();
        }, 15 * 1000);
    } catch (error) {
        console.error("开始录音失败:", error);

        // 提供更详细的错误信息
        let errorType = "start";
        let errorMessage = error.message || "未知错误";

        if (error.name === "NotAllowedError" || error.name === "PermissionDeniedError") {
            errorType = "permission";
            errorMessage = "麦克风访问被拒绝，请在浏览器设置中允许访问";
        } else if (error.name === "NotFoundError" || error.name === "DevicesNotFoundError") {
            errorType = "device";
            errorMessage = "未找到麦克风设备";
        } else if (error.name === "NotSupportedError") {
            errorType = "support";
            errorMessage = "浏览器不支持录音功能";
        } else if (error.name === "SecurityError") {
            errorType = "security";
            errorMessage = "安全限制阻止了录音功能";
        }

        ElMessage.error(`录音失败: ${errorMessage}`);

        // 确保状态重置
        isRecording.value = false;
        mediaRecorder = null;
        recordingStream = null;
    }
};

// 开始计时器
const startTimers = () => {
    // 每100毫秒更新一次当前时间
    secondsTimer.value = setInterval(() => {
        currentSegmentTime.value += 0.1;
        totalRecordingTime.value += 0.1;
    }, 100);
};

// 停止录音
const stopRecording = async (reason = "manual") => {
    if (!isRecording.value) return;

    try {
        // 清除所有计时器
        clearAllTimers();

        // 停止录音
        if (mediaRecorder && mediaRecorder.state !== "inactive") {
            mediaRecorder.stop();
        }

        // 停止所有音轨
        if (recordingStream) {
            recordingStream.getTracks().forEach((track) => track.stop());
            recordingStream = null;
        }

        isRecording.value = false;

        // 如果有当前段的录音数据，上传它
        if (audioChunks.length > 0) {
            await uploadFinalSegment();
        }

        // 更新状态
        voiceStatus.value = 3;
        showRedo.value = true;
        showRecordTime.value = true;

        // ElMessage.success(`录音完成，总时长: ${formatTime(totalRecordingTime.value)}`);
    } catch (error) {
        console.error("停止录音失败:", error);
        ElMessage.error("停止录音失败: " + error.message);
    }
};
const getaAudioAnalysisRes = () => {
    const data = {};
    getaAudioAnalysisResAPI(data).then((res) => {
        if (res.code === "200") {
            aiRecommendedQuestions.value = res.data.current?.length ? res.data.current : res.data.history[0];
            aiRecommendedHistoryQuestions.value = res.data.history;
            currentQuestionSetIndex.value = res.data.history.length - 1;
        }
    });
};
getaAudioAnalysisRes();
// 上传最后一段录音
const uploadFinalSegment = async () => {
    if (audioChunks.length === 0) return;

    try {
        // 创建当前段的音频Blob
        const audioBlob = new Blob(audioChunks, { type: mediaRecorder ? mediaRecorder.mimeType : "audio/wav" });
        console.log(audioBlob);

        // 保存到录音段数组
        voiceBlobs.value.push(audioBlob);

        // 标记上传开始
        isUploading.value = true;

        // 创建FormData对象
        const formData = new FormData();
        formData.append(
            "file",
            new File([audioBlob], `voice_segment_final_${Date.now()}.webm`, {
                type: audioBlob.type
            })
        );
        console.log(voiceBlobs.value, "formDataformDataformData");
        singleAPI(formData)
            .then((res) => {
                if (res.code === "200") {
                    const formData = new FormData();
                    formData.append("infoId", localStorage.getItem("infoid"));
                    formData.append("url", res.data);
                    // const res = singleAPI(formData);

                    audioAnalysisAPI(formData).then((res) => {
                        if (res.code === "200" && res.data.success) {
                            getaAudioAnalysisRes();
                        }
                    });
                }
            })
            .finally(() => {
                isUploading.value = false;
                if (canclevice.value) return;
                startRecording();
            });
        // 上传到服务器
        // try {
        // 模拟上传，实际项目中替换为真实API调用
        // const response = await fetch(uploadUrl, {
        //     method: 'POST',
        //     body: formData
        // });

        // 模拟成功响应
        // setTimeout(() => {
        //     // 模拟服务器返回的段ID
        //     const segmentId = `segment_final_${Date.now()}`;

        //     // 保存上传成功的段ID
        //     uploadedSegments.value.push(segmentId);

        //     // 添加到已上传片段列表
        //     segments.value.push({
        //         id: segmentId,
        //         index: voiceBlobs.value.length - 1,
        //         duration: currentSegmentTime.value,
        //         isFinal: true
        //     });

        //     ElMessage.success(`最终片段上传成功 (${formatTime(currentSegmentTime.value)})`);

        //     isUploading.value = false;
        // }, 1000); // 模拟1秒的上传时间
        // } catch (error) {
        //     console.error("上传最终录音段失败:", error);
        //     ElMessage.error(`最终片段上传失败: ${error.message}`);
        //     isUploading.value = false;
        // }
    } catch (error) {
        console.error("处理最终录音段失败:", error);
        ElMessage.error("处理最终录音段失败: " + error.message);
    }
};

// 播放录制的音频
const playRecordedAudio = async () => {
    // 如果没有录音数据，无法播放
    if (voiceBlobs.value.length === 0) {
        ElMessage.error("没有可播放的录音数据");
        return;
    }

    try {
        // 如果有多个片段，使用最后一个片段播放
        // 注意：实际应用中可能需要合并所有片段
        const audioBlob = voiceBlobs.value[voiceBlobs.value.length - 1];

        // 创建音频URL
        if (currentPlaybackUrl.value) {
            URL.revokeObjectURL(currentPlaybackUrl.value);
        }
        currentPlaybackUrl.value = URL.createObjectURL(audioBlob);

        // 使用音频元素播放
        if (voiceAudio.value) {
            voiceAudio.value.src = currentPlaybackUrl.value;
            await voiceAudio.value.play();

            isPlaying.value = true;
            voiceStatus.value = 4;

            // 开始计时
            startPlaybackTimer();
        } else {
            // 如果音频元素不存在，创建一个临时的
            const audio = new Audio(currentPlaybackUrl.value);
            audio.onended = () => {
                isPlaying.value = false;
                voiceStatus.value = 3;
                playStamp.value = 0;
                if (secondsTimer.value) {
                    clearInterval(secondsTimer.value);
                }
            };
            await audio.play();

            isPlaying.value = true;
            voiceStatus.value = 4;
        }
    } catch (error) {
        console.error("播放录音失败:", error);
        ElMessage.error("播放录音失败: " + error.message);
    }
};

// 开始播放计时器
const startPlaybackTimer = () => {
    secondsTimer.value = setInterval(() => {
        if (voiceAudio.value) {
            playStamp.value = voiceAudio.value.currentTime;
        }
    }, 100);
};

// 停止播放
const stopPlayback = () => {
    if (!isPlaying.value) return;

    try {
        if (voiceAudio.value) {
            voiceAudio.value.pause();
            voiceAudio.value.currentTime = 0;
        }

        isPlaying.value = false;
        voiceStatus.value = 3;
        playStamp.value = 0;

        if (secondsTimer.value) {
            clearInterval(secondsTimer.value);
        }
    } catch (error) {
        console.error("停止播放失败:", error);
        ElMessage.error("停止播放失败: " + error.message);
    }
};

// 更新当前播放时间
const updateCurrentTime = (event) => {
    if (event && event.target) {
        playStamp.value = event.target.currentTime;

        // 检查是否播放结束
        if (event.target.ended) {
            isPlaying.value = false;
            voiceStatus.value = 3;
            playStamp.value = 0;

            if (secondsTimer.value) {
                clearInterval(secondsTimer.value);
            }
        }
    }
};

// 重新录制
const handleVoiceRedo = () => {
    ElMessage.warning("确定要重新录制吗？当前录音将被删除。");

    // 显示确认对话框 - 简化版，实际项目中可使用Element Plus的确认框
    if (confirm("确定要重新录制吗？当前录音将被删除。")) {
        redoRecording();
    }
};

// 执行重新录制
const redoRecording = () => {
    // 停止当前播放
    if (isPlaying.value) {
        stopPlayback();
    }

    // 释放之前的录音资源
    if (currentPlaybackUrl.value) {
        URL.revokeObjectURL(currentPlaybackUrl.value);
        currentPlaybackUrl.value = null;
    }

    // 重置状态
    voiceStatus.value = 1;
    currentSegmentTime.value = 0;
    totalRecordingTime.value = 0;
    playStamp.value = 0;
    showRecordTime.value = false;
    showRedo.value = false;
    voiceBlobs.value = [];
    uploadedSegments.value = [];
    segments.value = [];

    ElMessage.success("已重置录音");
};

// 销毁录音器
const destroyRecorder = () => {
    // 停止所有音轨
    if (recordingStream) {
        recordingStream.getTracks().forEach((track) => track.stop());
        recordingStream = null;
    }

    // 停止媒体录制器
    if (mediaRecorder && mediaRecorder.state !== "inactive") {
        try {
            mediaRecorder.stop();
        } catch (e) {
            console.error("停止媒体录制器失败:", e);
        }
    }

    mediaRecorder = null;
    audioChunks = [];
};
// 停止语音识别
const stopSpeechRecognition = () => {
    if (recognitionInstance) {
        try {
            recognitionInstance.stop();
        } catch (e) {
            console.log("停止语音识别时出错:", e);
        }
        recognitionInstance = null;
    }
};
// 开始语音识别
// 开始语音识别
const startSpeechRecognition = () => {
    // 确保先停止任何现有的识别实例
    stopSpeechRecognition();

    // 检查浏览器支持
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
        ElMessage.error("您的浏览器不支持语音识别功能");
        return;
    }

    recognitionInstance = new SpeechRecognition();
    recognitionInstance.continuous = true;
    recognitionInstance.interimResults = true;
    recognitionInstance.lang = "zh-CN"; // 设置为中文

    recognitionInstance.onresult = (event) => {
        let finalTranscript = "";
        let interimTranscript = "";

        for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
                finalTranscript += transcript;
            } else {
                interimTranscript += transcript;
            }
        }

        // 更新转写内容
        if (finalTranscript) {
            currentTranscription.value = finalTranscript;
            addTranscriptionToRecord(finalTranscript);
            extractKeywordsAndGenerateQuestions();
        } else if (interimTranscript) {
            currentTranscription.value = interimTranscript;
        }

        // 滚动到最新内容
        scrollToLatestTranscription();
    };

    recognitionInstance.onerror = (event) => {
        console.error("语音识别错误:", event.error);
        if (event.error === "not-allowed") {
            ElMessage.error("请允许麦克风访问权限以启用语音识别");
        } else if (event.error === "aborted") {
            console.log("语音识别已中止");
        } else {
            // ElMessage.error(`语音识别出现问题: ${event.error}`);
        }
    };

    recognitionInstance.onend = () => {
        // 如果还在录音状态，则重新开始识别
        if (isRecording.value) {
            try {
                recognitionInstance.start();
            } catch (e) {
                // console.error("重启语音识别失败:", e);
                // ElMessage.error("重启语音识别失败，请尝试重新开始录音");
            }
        }
    };

    try {
        recognitionInstance.start();
    } catch (error) {
        console.error("语音识别启动失败:", error);
        ElMessage.error(`语音识别启动失败: ${error.message}`);
    }
};

// 模拟转写（当实际语音识别不可用时）
const simulateTranscription = () => {
    let simulationInterval = null;

    // 模拟语音识别结果
    const responses = [
        "我认为Vue3的响应式原理主要是基于Proxy实现的，相比Vue2的Object.defineProperty有很大改进。",
        "Proxy可以拦截对象的所有操作，不仅仅是属性访问，还能监听数组变化和新增属性等。",
        "这使得Vue3的响应式系统更加强大和高效，性能也有很大提升。",
        "在我之前的项目中，我们使用了组件化开发方式，将页面拆分成多个可复用的组件。",
        "关于前端性能优化，我通常从减少HTTP请求、优化资源加载、代码层面优化和合理使用缓存等方面入手。",
        "我最近在学习WebAssembly和GraphQL技术，这些技术可以显著提升Web应用的性能和用户体验。"
    ];

    const simulateResponse = () => {
        if (!isRecording.value) {
            clearInterval(simulationInterval);
            return;
        }

        // 随机选择一段话作为当前转写内容
        const response = responses[Math.floor(Math.random() * responses.length)];
        currentTranscription.value = response;

        // 添加到面试记录
        addTranscriptionToRecord(response);

        // 提取关键词并生成推荐问题
        extractKeywordsAndGenerateQuestions();

        // 滚动到最新内容
        scrollToLatestTranscription();
    };

    // 开始模拟，每8秒生成一段新的转写内容
    simulationInterval = setInterval(simulateResponse, 8000);

    // 立即执行一次，避免等待
    simulateResponse();
};

// 添加转写内容到面试记录
const addTranscriptionToRecord = (transcription) => {
    if (!currentQuestion.value || !transcription) return;

    // 如果是新问题，先添加问题记录
    const lastRecord = interviewRecords.value[interviewRecords.value.length - 1];
    if (!lastRecord || lastRecord.content !== currentQuestion.value) {
        interviewRecords.value.push({
            type: "question",
            content: currentQuestion.value,
            time: new Date().toLocaleTimeString()
        });
    }

    // 添加回答记录
    interviewRecords.value.push({
        type: "answer",
        content: transcription,
        time: new Date().toLocaleTimeString()
    });
};

// 滚动到最新转写内容
const scrollToLatestTranscription = () => {
    nextTick(() => {
        if (transcriptionContent.value) {
            transcriptionContent.value.scrollTop = transcriptionContent.value.scrollHeight;
        }
    });
};

// 提取关键词并生成推荐问题
const extractKeywordsAndGenerateQuestions = () => {
    if (!currentTranscription.value) return;

    // 提取关键词 - 实际应用中可以使用NLP服务
    const text = currentTranscription.value;
    const stopWords = [
        "的",
        "了",
        "是",
        "在",
        "我",
        "有",
        "和",
        "就",
        "不",
        "人",
        "都",
        "一",
        "一个",
        "上",
        "也",
        "很",
        "到",
        "说",
        "要",
        "去",
        "你",
        "会",
        "着",
        "没有",
        "看",
        "好",
        "自己",
        "这"
    ];

    // 简单的关键词提取逻辑
    const words = text.split(/\s+|，|。|；|、/).filter((word) => word.length > 1 && !stopWords.includes(word));

    // 计算词频
    const wordFrequency = {};
    words.forEach((word) => {
        wordFrequency[word] = (wordFrequency[word] || 0) + 1;
    });

    // 按词频排序并取前5个
    const sortedWords = Object.keys(wordFrequency).sort((a, b) => wordFrequency[b] - wordFrequency[a]);
    extractedKeywords.value = sortedWords.slice(0, 5);

    // 生成推荐问题
    generateRecommendedQuestions();
};

// 生成推荐问题
const generateRecommendedQuestions = () => {
    if (!currentQuestion.value && !extractedKeywords.value.length) return;

    // 基于当前问题和关键词生成追问
    const baseQuestionText = currentQuestion.value ? currentQuestion.value.split("？")[0] : "这个话题";
    const keywords = extractedKeywords.value.length > 0 ? extractedKeywords.value : ["Vue", "性能优化", "项目经验"];

    const recommendedQuestions = [
        `您能详细解释一下${keywords[0] || "这个概念"}在${baseQuestionText}中的具体应用场景吗？`,
        `关于${keywords[1] || "这个技术"}，您在实际项目中是如何实现和优化的？`,
        `您提到了${keywords[2] || "这个方面"}，能结合您的经验谈谈它与${baseQuestionText}的关系吗？`
    ];

    // 设置推荐问题
    // aiRecommendedQuestions.value = recommendedQuestions;
};

// 刷新推荐问题
const refreshRecommendations = () => {
    getaAudioAnalysisRes();
    // if (extractedKeywords.value.length > 0) {
    //     ElMessage.success("已刷新推荐问题");
    // } else {
    //     ElMessage.warning("需要先有转写内容才能生成推荐问题");
    // }
};

// 收藏问题
const toggleFavorite = (question) => {
    if (isQuestionFavorited(question)) {
        // 如果已收藏，则取消收藏
        removeFavorite(question);
    } else {
        // 如果未收藏，则添加到收藏
        favoriteQuestions.value.push(question);
        ElMessage.success("问题已收藏");
    }
};

// 移除收藏
const removeFavorite = (question) => {
    const index = favoriteQuestions.value.indexOf(question);
    if (index !== -1) {
        favoriteQuestions.value.splice(index, 1);
        ElMessage.info("已取消收藏");
    }
};

// 选择问题
const selectQuestion = (question) => {
    currentQuestion.value = question;

    // 如果有转写内容，立即基于新问题生成推荐问题
    if (currentTranscription.value) {
        extractKeywordsAndGenerateQuestions();
    }

    ElMessage.success("已选择问题");
};

// 基于关键词生成问题
const focusOnKeyword = (keyword) => {
    const question = `能详细解释一下${keyword}的概念和应用吗？`;
    selectQuestion(question);
};

// 查看面试记录
const viewInterviewRecord = () => {
    recordDialogVisible.value = true;
};

// 生成报告
const generateReport = () => {
    ElMessage({
        message: "正在生成完整报告...",
        type: "info"
    });

    // 模拟生成报告
    setTimeout(() => {
        ElMessage.success("报告生成完成");
        // 这里可以添加实际的报告生成逻辑
    }, 2000);
};

// 导出记录
const exportRecord = () => {
    // 创建导出内容
    let exportContent = "# 面试记录\n\n";
    exportContent += `应聘者: ${interviewData.value.resumeInfo?.name || "未知"}\n`;
    exportContent += `职位: ${interviewData.value.settings?.position || "未知"}\n`;
    exportContent += `面试时长: ${formatTime(elapsedTime.value)}\n`;
    exportContent += `日期: ${new Date().toLocaleDateString()}\n\n`;

    exportContent += "## 问答记录\n\n";
    interviewRecords.value.forEach((record) => {
        exportContent += `### ${record.type === "question" ? "问题" : "回答"} (${record.time})\n`;
        exportContent += `${record.content}\n\n`;
    });

    // 创建并下载文件
    const blob = new Blob([exportContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `面试记录_${interviewData.value.resumeInfo?.name || "应聘者"}_${new Date().toLocaleDateString()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    ElMessage.success("面试记录已导出");
};

// 结束面试
const endInterview = () => {
    endInterviewDialogVisible.value = true;
};
const getSkillColor = (score) => {
    if (score >= 80) return "#67c23a"; // 优秀 - 绿色
    if (score >= 60) return "#409eff"; // 良好 - 蓝色
    if (score >= 40) return "#e6a23c"; // 一般 - 黄色
    return "#f56c6c"; // 较差 - 红色
};
const getRecommendationTitle = (score) => {
    if (score >= 4) return "强烈推荐";
    if (score >= 3) return "有条件推荐";
    if (score >= 2) return "需要再考虑";
    return "不推荐";
};
const getRecommendationNotes = (evaluation) => {
    return `基于总体评分 ${evaluation.score}/5：${evaluation.summarize}`;
};
const searchQuery = ref("");

const filteredData = computed(() => {
    if (!searchQuery.value) return interviewRecords.value;

    const query = searchQuery.value.toLowerCase();
    return interviewRecords.value.filter(
        (item) => item.question.toLowerCase().includes(query) || item.answer.toLowerCase().includes(query)
    );
});

const handleClear = () => {
    searchQuery.value = "";
};

// 确认结束面试
const confirmEndInterview = () => {
    endInterviewDialogVisible.value = false;

    // 暂停录音
    if (isRecording.value) {
        stopRecording();
    }

    // 显示全屏loading
    const loading = ElLoading.service({
        lock: true,
        text: "AI正在分析面试数据...",
        background: "rgba(0, 0, 0, 0.7)",
        customClass: "custom-loading"
    });
    const formData = new FormData();
    formData.append("infoId", localStorage.getItem("infoid"));
    getAiEvaluationAPI(formData).then((res) => {
        if (res.code === "200") {
            interviewSummary.value = res.data;
            interviewRecords.value = res.data.qa;
            summaryDialogVisible.value = true;
            canclevice.value = true;
            stopRecording();
            loading.close();
        }
    });
    // 模拟生成总结
    // setTimeout(() => {
    //     interviewSummary.value = {
    //         overallRating: 4.5,
    //         overallComment:
    //             "应聘者展示了扎实的技术基础和良好的沟通能力，能够清晰地表达自己的想法和经验。在回答技术问题时能够结合实际项目经验，表现出一定的问题解决能力。整体表现优秀，推荐进入下一轮面试。",
    //         skills: [
    //             { name: "Vue框架", score: 90 },
    //             { name: "前端性能优化", score: 85 },
    //             { name: "工程化工具", score: 80 },
    //             { name: "TypeScript", score: 75 },
    //             { name: "项目架构", score: 85 },
    //             { name: "团队协作", score: 90 }
    //         ],
    //         strengths: [
    //             "扎实的前端技术基础，特别是在Vue框架方面",
    //             "良好的项目经验和实践能力",
    //             "清晰的表达和沟通能力",
    //             "积极的学习态度和技术视野"
    //         ],
    //         weaknesses: [
    //             "在某些深入技术问题上回答不够详细",
    //             "可以提供更多具体的项目案例和数据",
    //             "对新兴技术的了解可以更加全面"
    //         ],
    //         recommendation: "推荐进入下一轮面试",
    //         recommendationNotes:
    //             "候选人整体素质较高，技术能力和沟通能力均表现优秀，建议在下一轮面试中着重考察其在复杂项目中的实际解决方案和技术选型决策过程。",
    //         questionAnswers: [
    //             {
    //                 question: "Vue 3的响应式原理是什么？",
    //                 answer: "Vue3的响应式原理主要是基于Proxy实现的，相比Vue2的Object.defineProperty有很大改进。Proxy可以拦截对象的所有操作，不仅仅是属性访问，还能监听数组变化和新增属性等，这使得Vue3的响应式系统更加强大和高效。",
    //                 evaluation: "回答准确全面，展示了对Vue3核心原理的理解，能够比较Vue2和Vue3的区别。"
    //             },
    //             {
    //                 question: "如何优化前端性能？",
    //                 answer: "关于前端性能优化，我通常从减少HTTP请求、优化资源加载、代码层面优化和合理使用缓存等方面入手。具体包括代码分割、懒加载、使用CDN、压缩资源、合理使用浏览器缓存等策略。",
    //                 evaluation: "回答涵盖了多个性能优化的维度，思路清晰，但可以提供更具体的实践案例。"
    //             },
    //             {
    //                 question: "你在项目中遇到的最大挑战是什么？",
    //                 answer: "在我之前的项目中，最大的挑战是处理大量数据的实时渲染问题。我们通过虚拟列表、数据分片处理和优化渲染策略等方式解决了这个问题，最终使页面渲染性能提升了约60%。",
    //                 evaluation: "回答具体，能够说明问题、解决方案和成果，展示了较强的问题解决能力。"
    //             }
    //         ]
    //     };

    //     // 关闭loading
    //     loading.close();

    //     // 显示总结对话框
    //     summaryDialogVisible.value = true;
    // }, 2000);
};

// 打印总结
const printSummary = () => {
    ElMessage.success("准备打印报告");
    window.print();
};

// 导出总结
const exportSummary = () => {
    // 1. 克隆当前的面试总结DOM
    const summaryElement = document.querySelector(".interview-summary").cloneNode(true);

    // 2. 创建一个基础样式，确保导出的HTML看起来正确
    const style = `
    <style>
      body {
        font-family: Arial, sans-serif;
        line-height: 1.6;
        color: #333;
        max-width: 1200px;
        margin: 0 auto;
        padding: 20px;
      }
      .interview-summary {
        padding: 20px;
      }
      .summary-header {
        text-align: center;
        margin-bottom: 20px;
      }
      .el-divider {
        height: 1px;
        background-color: #EBEEF5;
        margin: 20px 0;
      }
      .el-row {
        display: flex;
        flex-wrap: wrap;
        margin-right: -10px;
        margin-left: -10px;
      }
      .el-col {
        padding-left: 10px;
        padding-right: 10px;
        box-sizing: border-box;
      }
      .el-col-24 {
        flex: 0 0 100%;
        max-width: 100%;
      }
      .el-col-16 {
        flex: 0 0 66.6666%;
        max-width: 66.6666%;
      }
      .el-col-8 {
        flex: 0 0 33.3333%;
        max-width: 33.3333%;
      }
      .el-col-12 {
        flex: 0 0 50%;
        max-width: 50%;
      }
      .el-rate {
        display: inline-flex;
        align-items: center;
      }
      .el-rate__icon {
        font-size: 18px;
        color: #F7BA2A;
        margin-right: 5px;
      }
      .el-progress {
        margin-bottom: 15px;
      }
      .el-progress-bar {
        height: 6px;
        background-color: #EBEEF5;
        border-radius: 100px;
        position: relative;
        overflow: hidden;
      }
      .el-progress-bar__inner {
        position: absolute;
        left: 0;
        top: 0;
        height: 100%;
        border-radius: 100px;
      }
      .el-tag {
        display: inline-block;
        padding: 0 10px;
        height: 32px;
        line-height: 30px;
        font-size: 12px;
        color: #fff;
        border-radius: 4px;
        box-sizing: border-box;
        border: 1px solid transparent;
        white-space: nowrap;
      }
      .el-tag--success {
        background-color: #67C23A;
        border-color: #67C23A;
      }
      .el-tag--warning {
        background-color: #E6A23C;
        border-color: #E6A23C;
      }
      .el-alert {
        padding: 8px 16px;
        margin-bottom: 15px;
        border-radius: 4px;
        position: relative;
        display: flex;
        align-items: center;
      }
      .el-alert--success {
        background-color: #f0f9eb;
        color: #67c23a;
      }
      .el-alert--info {
        background-color: #f4f4f5;
        color: #909399;
      }
      .el-alert--warning {
        background-color: #fdf6ec;
        color: #e6a23c;
      }
      .el-alert--error {
        background-color: #fef0f0;
        color: #f56c6c;
      }
      @media (max-width: 768px) {
        .el-col-16, .el-col-8, .el-col-12 {
          flex: 0 0 100%;
          max-width: 100%;
        }
      }
    </style>
  `;

    // 3. 移除不需要的元素和属性
    // 移除按钮和交互元素
    const buttonsToRemove = summaryElement.querySelectorAll("button, .el-button, .dialog-footer");
    buttonsToRemove.forEach((button) => button.remove());

    // 替换Element Plus的评分组件为静态HTML
    const rateElements = summaryElement.querySelectorAll(".el-rate");
    rateElements.forEach((rateEl) => {
        const score = interviewSummary.value.overallEvaluation.score;
        const starsHtml = `
      <div class="static-rate">
        ${"★".repeat(Math.round(score))}${"☆".repeat(5 - Math.round(score))}
        <span style="margin-left: 10px; font-size: 16px;">${score}/5</span>
      </div>
    `;
        rateEl.outerHTML = starsHtml;
    });

    // 4. 创建完整的HTML文档
    const candidateName = interviewData.value.resumeInfo?.name || "应聘者";
    const htmlContent = `
    <!DOCTYPE html>
    <html lang="zh-CN">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${candidateName} - 面试总结报告</title>
      ${style}
    </head>
    <body>
      ${summaryElement.outerHTML}
    </body>
    </html>
  `;

    // 5. 创建Blob对象并下载
    const blob = new Blob([htmlContent], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;

    // 设置文件名
    const date = new Date().toISOString().split("T")[0]; // 格式: YYYY-MM-DD
    link.download = `${candidateName}_面试总结_${date}.html`;

    // 触发下载
    document.body.appendChild(link);
    link.click();

    // 清理
    setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }, 100);
};

// 完成面试
const finishInterview = () => {
    summaryDialogVisible.value = false;
    // router.push("/");
};

// 工具函数 - 获取推荐类型
const getRecommendationType = (score) => {
    if (score >= 4) return "success";
    if (score >= 3) return "info";
    if (score >= 2) return "warning";
    return "error";
};

// 切换录音状态
// 切换录音状态
const toggleRecording = async () => {
    // 防止重复点击或处理中状态
    if (isUploading.value || isProcessing.value) {
        ElMessage.warning("正在处理录音数据，请稍候...");
        return;
    }

    isProcessing.value = true;

    try {
        if (isRecording.value) {
            canclevice.value = true;
            stopRecording();
            // ElMessage.info("录音已暂停");
        } else {
            // 确保完全释放之前的资源
            releaseAllResources();

            // 添加延迟，确保资源完全释放
            await new Promise((resolve) => setTimeout(resolve, 300));

            await startRecording();
        }
    } catch (error) {
        ElMessage.error(`录音操作失败: ${error.message || "未知错误"}`);
        console.error("录音错误详情:", error);

        // 重置状态
        isRecording.value = false;
        mediaRecorder = null;
        recordingStream = null;
    } finally {
        isProcessing.value = false;
    }
};

// 提交录音
const submitRecording = () => {
    if (segments.value.length === 0) {
        ElMessage.warning("没有录音片段可提交");
        return;
    }

    // 这里可以将所有片段ID一起提交
    const segmentIds = segments.value.map((s) => s.id);

    // 创建提交数据
    const submitData = {
        segmentIds,
        totalDuration: totalRecordingTime.value,
        segmentCount: segments.value.length,
        interviewId: interviewData.value.id || Date.now(),
        candidateName: interviewData.value.resumeInfo?.name || "应聘者",
        position: interviewData.value.settings?.position || "未知职位"
    };
};
// 模拟数据
const topicDialogVisible = ref(false);
const currentTopicIndex = ref(null);

// 模拟面试记录数据
const interviewRecords = ref([
    // {
    //     title: "Vue与React框架的关键区别与使用场景对比",
    //     summary:
    //         "Vue和React在数据绑定、性能优化和使用场景上存在显著区别。Vue采用双向数据绑定机制，简化了开发者对视图更新的处理，而React则采用单向数据流，通过虚拟DOM和异步渲染等技术提高性能。",
    //     keywords: ["Vue", "React", "数据绑定", "双向数据绑定", "单项数据流", "性能优化", "虚拟DOM", "异步渲染"],
    //     details: [
    //         {
    //             question: "你能简单说一下Vue和React中数据绑定的区别吗？",
    //             answer: "Vue采用双向数据绑定机制，当数据变化时会自动更新模型，反之亦然，简化了开发者对视图手动更新的工作。而React则采用单向数据流，不允许直接更改组件的属性(props)，通常需要通过setState或其他事件方法来更新数据，这种设计虽然增加了开发复杂度，但有利于维护数据的一致性。"
    //         },
    //         {
    //             question: "Vue和React在性能优化方面有什么不同策略？",
    //             answer: "React通过虚拟DOM、异步渲染和Fiber架构等技术优化性能，支持懒加载和异步组件，有效提升用户体验，尤其是在大型应用中，React利用虚拟DOM减少页面操作次数，提高性能表现。相较于Vue，React在多线程渲染等方面的技术支持，使其在处理复杂应用时更为出色。Vue则提供了一种优化手段，比如懒加载异步组件以提升用户体验，但在大型应用程序中可能会遇到一些性能瓶颈。"
    //         },
    //         {
    //             question: "这两个框架分别适合什么样的项目场景？",
    //             answer: "Vue更适合中小型项目和快速原型开发，因其简单易用和快速响应；React则适用于大型应用和高交互的单页面应用，凭借其灵活性、强大的生态系统以及支持服务端渲染等技术，能处理更复杂的应用场景和数据流。Vue的学习曲线相对平缓，适合快速上手；而React则需要掌握更多概念，但能提供更强的可扩展性。"
    //         }
    //     ]
    // },
    // {
    //     title: "前端性能优化策略与实践",
    //     summary:
    //         "讨论了多种前端性能优化技术，包括资源加载优化、代码分割、缓存策略、服务端渲染和构建工具配置等方面的最佳实践。",
    //     keywords: ["性能优化", "懒加载", "代码分割", "缓存策略", "服务端渲染", "Webpack", "构建优化"],
    //     details: [
    //         {
    //             question: "你在项目中使用过哪些前端性能优化策略？",
    //             answer: "我在项目中应用了多层次的性能优化策略：首先是资源加载优化，包括图片懒加载、CSS/JS文件压缩合并、使用CDN加速资源分发；其次是代码层面优化，实现代码分割和按需加载，减少首屏加载时间；还有缓存策略优化，合理设置HTTP缓存头和使用Service Worker实现离线缓存；对于复杂应用，我们还实施了服务端渲染(SSR)来提高首屏加载速度和SEO表现。"
    //         },
    //         {
    //             question: "如何使用Webpack进行构建优化？",
    //             answer: "使用Webpack优化构建主要从几个方面入手：一是代码分割(Code Splitting)，将代码拆分为多个小块，实现按需加载；二是优化loader配置，使用include/exclude缩小处理范围；三是使用DllPlugin预编译不常变化的库；四是启用Tree Shaking移除未使用的代码；五是配置splitChunks提取公共代码；六是使用TerserPlugin进行代码压缩；七是利用缓存加速二次构建。这些措施显著减少了我们项目的打包体积和构建时间。"
    //         },
    //         {
    //             question: "你如何评估和监控前端性能？",
    //             answer: "我使用多种工具和方法评估和监控前端性能：开发阶段使用Chrome DevTools的Performance和Network面板分析加载和运行性能；集成Lighthouse进行综合性能评分；使用Web Vitals指标(LCP、FID、CLS等)衡量用户体验；在生产环境中，我们部署了性能监控系统，收集真实用户指标(RUM)，并设置性能预算和告警机制。这种多维度的监控使我们能够及时发现性能问题并进行针对性优化。"
    //         }
    //     ]
    // },
    // {
    //     title: "前端性能优化策略与实践",
    //     summary:
    //         "讨论了多种前端性能优化技术，包括资源加载优化、代码分割、缓存策略、服务端渲染和构建工具配置等方面的最佳实践。",
    //     keywords: ["性能优化", "懒加载", "代码分割", "缓存策略", "服务端渲染", "Webpack", "构建优化"],
    //     details: [
    //         {
    //             question: "你在项目中使用过哪些前端性能优化策略？",
    //             answer: "我在项目中应用了多层次的性能优化策略：首先是资源加载优化，包括图片懒加载、CSS/JS文件压缩合并、使用CDN加速资源分发；其次是代码层面优化，实现代码分割和按需加载，减少首屏加载时间；还有缓存策略优化，合理设置HTTP缓存头和使用Service Worker实现离线缓存；对于复杂应用，我们还实施了服务端渲染(SSR)来提高首屏加载速度和SEO表现。"
    //         },
    //         {
    //             question: "如何使用Webpack进行构建优化？",
    //             answer: "使用Webpack优化构建主要从几个方面入手：一是代码分割(Code Splitting)，将代码拆分为多个小块，实现按需加载；二是优化loader配置，使用include/exclude缩小处理范围；三是使用DllPlugin预编译不常变化的库；四是启用Tree Shaking移除未使用的代码；五是配置splitChunks提取公共代码；六是使用TerserPlugin进行代码压缩；七是利用缓存加速二次构建。这些措施显著减少了我们项目的打包体积和构建时间。"
    //         },
    //         {
    //             question: "你如何评估和监控前端性能？",
    //             answer: "我使用多种工具和方法评估和监控前端性能：开发阶段使用Chrome DevTools的Performance和Network面板分析加载和运行性能；集成Lighthouse进行综合性能评分；使用Web Vitals指标(LCP、FID、CLS等)衡量用户体验；在生产环境中，我们部署了性能监控系统，收集真实用户指标(RUM)，并设置性能预算和告警机制。这种多维度的监控使我们能够及时发现性能问题并进行针对性优化。"
    //         }
    //     ]
    // },
    // {
    //     title: "前端性能优化策略与实践",
    //     summary:
    //         "讨论了多种前端性能优化技术，包括资源加载优化、代码分割、缓存策略、服务端渲染和构建工具配置等方面的最佳实践。",
    //     keywords: ["性能优化", "懒加载", "代码分割", "缓存策略", "服务端渲染", "Webpack", "构建优化"],
    //     details: [
    //         {
    //             question: "你在项目中使用过哪些前端性能优化策略？",
    //             answer: "我在项目中应用了多层次的性能优化策略：首先是资源加载优化，包括图片懒加载、CSS/JS文件压缩合并、使用CDN加速资源分发；其次是代码层面优化，实现代码分割和按需加载，减少首屏加载时间；还有缓存策略优化，合理设置HTTP缓存头和使用Service Worker实现离线缓存；对于复杂应用，我们还实施了服务端渲染(SSR)来提高首屏加载速度和SEO表现。"
    //         },
    //         {
    //             question: "如何使用Webpack进行构建优化？",
    //             answer: "使用Webpack优化构建主要从几个方面入手：一是代码分割(Code Splitting)，将代码拆分为多个小块，实现按需加载；二是优化loader配置，使用include/exclude缩小处理范围；三是使用DllPlugin预编译不常变化的库；四是启用Tree Shaking移除未使用的代码；五是配置splitChunks提取公共代码；六是使用TerserPlugin进行代码压缩；七是利用缓存加速二次构建。这些措施显著减少了我们项目的打包体积和构建时间。"
    //         },
    //         {
    //             question: "你如何评估和监控前端性能？",
    //             answer: "我使用多种工具和方法评估和监控前端性能：开发阶段使用Chrome DevTools的Performance和Network面板分析加载和运行性能；集成Lighthouse进行综合性能评分；使用Web Vitals指标(LCP、FID、CLS等)衡量用户体验；在生产环境中，我们部署了性能监控系统，收集真实用户指标(RUM)，并设置性能预算和告警机制。这种多维度的监控使我们能够及时发现性能问题并进行针对性优化。"
    //         }
    //     ]
    // },
    // {
    //     title: "前端性能优化策略与实践",
    //     summary:
    //         "讨论了多种前端性能优化技术，包括资源加载优化、代码分割、缓存策略、服务端渲染和构建工具配置等方面的最佳实践。",
    //     keywords: ["性能优化", "懒加载", "代码分割", "缓存策略", "服务端渲染", "Webpack", "构建优化"],
    //     details: [
    //         {
    //             question: "你在项目中使用过哪些前端性能优化策略？",
    //             answer: "我在项目中应用了多层次的性能优化策略：首先是资源加载优化，包括图片懒加载、CSS/JS文件压缩合并、使用CDN加速资源分发；其次是代码层面优化，实现代码分割和按需加载，减少首屏加载时间；还有缓存策略优化，合理设置HTTP缓存头和使用Service Worker实现离线缓存；对于复杂应用，我们还实施了服务端渲染(SSR)来提高首屏加载速度和SEO表现。"
    //         },
    //         {
    //             question: "如何使用Webpack进行构建优化？",
    //             answer: "使用Webpack优化构建主要从几个方面入手：一是代码分割(Code Splitting)，将代码拆分为多个小块，实现按需加载；二是优化loader配置，使用include/exclude缩小处理范围；三是使用DllPlugin预编译不常变化的库；四是启用Tree Shaking移除未使用的代码；五是配置splitChunks提取公共代码；六是使用TerserPlugin进行代码压缩；七是利用缓存加速二次构建。这些措施显著减少了我们项目的打包体积和构建时间。"
    //         },
    //         {
    //             question: "你如何评估和监控前端性能？",
    //             answer: "我使用多种工具和方法评估和监控前端性能：开发阶段使用Chrome DevTools的Performance和Network面板分析加载和运行性能；集成Lighthouse进行综合性能评分；使用Web Vitals指标(LCP、FID、CLS等)衡量用户体验；在生产环境中，我们部署了性能监控系统，收集真实用户指标(RUM)，并设置性能预算和告警机制。这种多维度的监控使我们能够及时发现性能问题并进行针对性优化。"
    //         }
    //     ]
    // },
    // {
    //     title: "微前端架构设计与实践经验",
    //     summary:
    //         "探讨了微前端的核心概念、实现方式和实际应用场景，分析了不同微前端框架的优缺点以及在大型企业级应用中的落地经验。",
    //     keywords: [
    //         "微前端",
    //         "模块联邦",
    //         "应用集成",
    //         "独立部署",
    //         "技术栈无关",
    //         "Single-SPA",
    //         "Qiankun",
    //         "Module Federation"
    //     ],
    //     details: [
    //         {
    //             question: "什么是微前端架构，它解决了哪些问题？",
    //             answer: "微前端是一种将前端应用分解成独立的、可自治的小型应用的架构风格，每个应用可以独立开发、测试和部署。它主要解决了三类问题：一是大型前端应用的复杂度管理，通过拆分降低系统耦合度；二是技术栈统一与演进问题，允许不同团队使用不同技术栈，便于旧系统逐步现代化；三是团队协作效率问题，支持多团队并行开发，减少协作成本和上线风险。"
    //         },
    //         {
    //             question: "你使用过哪些微前端框架，它们各有什么特点？",
    //             answer: "我主要使用过Single-SPA、Qiankun和Module Federation三种微前端解决方案。Single-SPA是最早的微前端框架之一，提供了基础的应用加载和生命周期管理；Qiankun基于Single-SPA，增加了JS沙箱隔离、样式隔离和预加载等特性，是国内使用较广的方案；Webpack 5的Module Federation则提供了更底层的模块共享机制，支持应用间代码共享和运行时依赖加载。在选择时，我会根据项目需求、团队技术栈和现有系统架构来决定使用哪种方案。"
    //         },
    //         {
    //             question: "在实施微前端架构时，你遇到过哪些挑战及解决方案？",
    //             answer: "实施微前端时面临的主要挑战包括：应用间通信问题，我们通过建立统一的事件总线和状态管理方案解决；样式冲突问题，采用CSS Modules、BEM命名规范和动态样式前缀注入解决；公共依赖管理，使用外部共享库和运行时依赖注入避免重复加载；路由管理复杂性，实现了集中式路由注册和分发机制；开发体验问题，构建了统一的开发脚手架和调试工具链。此外，我们还建立了完善的微前端治理体系，包括应用注册中心、监控系统和标准化的CI/CD流程，确保整体系统的可维护性和稳定性。"
    //         }
    //     ]
    // }
]);
// 计算当前选中的话题
const currentTopic = computed(() => {
    if (
        currentTopicIndex.value !== null &&
        currentTopicIndex.value >= 0 &&
        currentTopicIndex.value < interviewRecords.value.length
    ) {
        return interviewRecords.value[currentTopicIndex.value];
    }
    return null;
});

// 计算所有问答记录（扁平化）
const allQA = computed(() => {
    const result = [];
    interviewRecords.value.forEach((topic) => {
        topic.details.forEach((qa) => {
            result.push(qa);
        });
    });
    return result;
});

// 过滤搜索结果
const filteredQA = computed(() => {
    if (!searchQuery.value) return allQA.value;

    const query = searchQuery.value.toLowerCase();
    return allQA.value.filter(
        (qa) => qa.question.toLowerCase().includes(query) || qa.answer.toLowerCase().includes(query)
    );
});

// 显示话题详情
const showTopicDetails = (index) => {
    currentTopicIndex.value = index;
    topicDialogVisible.value = true;
};

// 格式化时间范围（模拟）
const formatTimeRange = (index) => {
    const start = index * 2;
    const end = start + 2;
    return `${start.toString().padStart(2, "0")}:00 - ${end.toString().padStart(2, "0")}:00`;
};

// 清除搜索
</script>

<style scoped>
.interview-container {
    display: flex;
    flex-direction: column;
    height: 100vh;
    background-color: #f5f7fa;
    overflow: hidden;
    position: relative;
}

/* Interview Header */
.interview-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 20px;
    background-color: #fff;
    box-shadow: 0 2px 8px 0 rgba(0, 0, 0, 0.1);
    z-index: 10;
    flex-wrap: wrap;
}

.interview-info {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
}

.interview-info h2 {
    margin: 0;
    margin-right: 20px;
    font-size: 18px;
}

.interview-timer {
    display: flex;
    align-items: center;
    font-size: 14px;
    color: #606266;
}

.interview-timer .el-icon {
    margin-right: 5px;
}

.recording-status {
    display: flex;
    align-items: center;
    font-size: 14px;
    color: #909399;
    padding: 5px 12px;
    border-radius: 15px;
    background-color: #f5f7fa;
}

.recording-status.active {
    color: #f56c6c;
    background-color: #fef0f0;
}

.recording-indicator {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background-color: #909399;
    margin-right: 8px;
    display: inline-block;
}

.recording-status.active .recording-indicator {
    background-color: #f56c6c;
    animation: pulse 1.5s infinite;
}

@keyframes pulse {
    0% {
        opacity: 1;
    }
    50% {
        opacity: 0.4;
    }
    100% {
        opacity: 1;
    }
}

.interview-controls {
    display: flex;
    justify-content: space-around;
    /* gap: 10px; */
    /* flex-wrap: wrap; */
}

/* Main Interview Layout */
.interview-main {
    display: flex;
    flex: 1;
    overflow: hidden;
    position: relative;
}

/* Enhanced AI Questions Area - Main Feature */
.ai-questions-area {
    border: 3px solid #e6a23c;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(230, 162, 60, 0.2);
    margin-bottom: 20px;
    background-color: #fffbf5;
    position: relative;
    /* overflow: hidden; */
}

.ai-questions-area:before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 5px;
    background: linear-gradient(90deg, #e6a23c, #f8d48a, #e6a23c);
    animation: shimmer 2s infinite linear;
}

@keyframes shimmer {
    0% {
        background-position: -200px 0;
    }
    100% {
        background-position: 200px 0;
    }
}

.area-title {
    padding: 12px 15px;
    font-size: 16px;
    font-weight: bold;
    color: #303133;
    border-bottom: 1px solid #e4e7ed;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.ai-title {
    display: flex;
    align-items: center;
    color: #e6a23c;
    font-size: 18px;
    font-weight: bold;
}

.ai-title .el-icon {
    margin-right: 8px;
    font-size: 20px;
}

.ai-questions {
    padding: 15px;
    display: flex;
    flex-direction: column;
    gap: 15px;
}

.ai-question-card {
    position: relative;
    padding: 18px 18px 18px 50px;
    background-color: #fdf6ec;
    border-left: 5px solid #e6a23c;
    border-radius: 6px;
    transition: all 0.3s;
    font-size: 16px;
    font-weight: 500;
    display: flex;
    justify-content: space-between;
    align-items: center;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.ai-question-card:hover {
    box-shadow: 0 4px 15px rgba(230, 162, 60, 0.3);
    transform: translateY(-2px);
}

.question-number {
    position: absolute;
    top: 50%;
    left: 10px;
    transform: translateY(-50%);
    width: 28px;
    height: 28px;
    background-color: #e6a23c;
    color: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    font-size: 16px;
}

.question-text {
    flex: 1;
    padding-right: 15px;
    line-height: 1.5;
}

.question-actions {
    display: flex;
    gap: 10px;
}

.question-navigation {
    display: flex;
    align-items: center;
}

.current-question {
    /* padding: 20px; */
    font-size: 16px;
    font-weight: 500;
    color: #303133;
    /* background-color: #f5f7fa; */
    min-height: 60px;
    /* line-height: 1.6; */
}

/* Interview Content Area */
.interview-content {
    flex: 1;
    padding: 20px;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    justify-content: center;
    order: 1; /* Put content first on mobile */
}

/* Question Bank Sidebar */
.questions-section {
    width: 280px;
    background-color: #fff;
    border-left: 1px solid #e4e7ed;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    transition: all 0.3s ease;
    order: 2; /* Put sidebar second on mobile */
}

.section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 15px;
    border-bottom: 1px solid #e4e7ed;
}

.section-title {
    padding: 12px 0;
    font-size: 16px;
    font-weight: bold;
    color: #303133;
}

.collapse-btn {
    padding: 2px;
}

.questions-section.collapsed {
    width: 0;
    border: none;
    padding: 0;
    overflow: hidden;
}

.question-tabs {
    flex: 1;
    display: flex;
    flex-direction: column;
}

.questions-list {
    padding: 10px;
    overflow-y: auto;
    max-height: calc(100vh - 160px);
}

.question-item {
    padding: 12px 15px;
    margin-bottom: 10px;
    /* background-color: #f5f7fa; */
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.2s;
    font-size: 14px;
    border-left: 3px solid transparent;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
}

.question-item:hover {
    background-color: #ecf5ff;
    border-left-color: #409eff;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.question-item.active {
    background-color: #ecf5ff;
    border-left-color: #409eff;
    font-weight: bold;
}

/* Mobile Question Bank Toggle */
.mobile-question-bank-toggle {
    /* display: none; */
    position: fixed;
    right: 0;
    top: 50%;
    transform: translateY(-50%);
    background-color: #409eff;
    color: white;
    padding: 10px 5px;
    border-radius: 5px 0 0 5px;
    cursor: pointer;
    z-index: 100;
    box-shadow: -2px 0 5px rgba(0, 0, 0, 0.1);
    writing-mode: vertical-lr;
    text-orientation: upright;
    font-size: 14px;
    font-weight: bold;
}

.mobile-question-bank-toggle .el-icon {
    margin-bottom: 5px;
}

/* Favorite Questions Area */
.favorite-questions-area {
    background-color: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
    margin-bottom: 20px;
    overflow: auto;
}

.favorite-title {
    display: flex;
    align-items: center;
    color: #67c23a;
}

.favorite-title .el-icon {
    margin-right: 8px;
}

.favorite-questions {
    padding: 15px;
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
}

.favorite-question-tag {
    cursor: pointer;
    padding: 8px 12px;
    margin: 5px;
}

/* Transcription Area */
.transcription-area {
    background-color: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
    margin-bottom: 20px;
    overflow: hidden;
}

.transcription-content {
    padding: 15px;
    min-height: 100px;
    max-height: 200px;
    overflow-y: auto;
}

.transcription-placeholder {
    color: #909399;
    font-style: italic;
}

.transcription-text {
    line-height: 1.6;
}

/* Keywords Area */
.keywords-area {
    background-color: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
    margin-bottom: 20px;
    overflow: hidden;
}

.keywords-content {
    padding: 15px;
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
}

.keyword-tag {
    cursor: pointer;
    transition: all 0.2s;
}

.keyword-tag:hover {
    background-color: #409eff;
    color: white;
    transform: scale(1.05);
}

/* Interview Record Dialog Styles */
.interview-record {
    /* padding: 20px; */
}

.record-header {
    text-align: center;
    margin-bottom: 20px;
}

.record-tabs {
    margin-top: 20px;
}

.text-record,
.audio-record,
.summary-record {
    padding: 15px;
    min-height: 500px;
}

.empty-record {
    text-align: center;
    color: #909399;
    padding: 40px 0;
}

.record-card {
    margin-bottom: 15px;
}

.record-card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.record-type {
    font-weight: bold;
    color: #409eff;
}

.record-content {
    line-height: 1.6;
}

.audio-list {
    display: flex;
    flex-direction: column;
    gap: 15px;
}

.audio-card {
    padding: 15px;
}

.audio-info {
    display: flex;
    justify-content: space-between;
    margin-bottom: 10px;
}

.audio-title {
    font-weight: bold;
}

.audio-time {
    color: #909399;
}

.audio-player {
    margin: 10px 0;
    width: 100%;
}

.audio-player audio {
    width: 100%;
}

.audio-transcription {
    margin-top: 10px;
    background-color: #f5f7fa;
    padding: 10px;
    border-radius: 4px;
}

.transcription-title {
    font-weight: bold;
    margin-bottom: 5px;
}

.summary-section {
    margin-bottom: 25px;
}

.summary-section h3 {
    margin-bottom: 15px;
    color: #303133;
}

.covered-areas {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin-bottom: 20px;
}

.covered-area-tag {
    font-size: 14px;
}

.performance-metrics {
    margin-bottom: 20px;
}

.metric-card {
    background-color: #f5f7fa;
    padding: 15px;
    border-radius: 4px;
    text-align: center;
    margin-bottom: 15px;
}

.metric-name {
    margin-bottom: 10px;
    font-weight: bold;
}

.ai-summary {
    background-color: #f5f7fa;
    padding: 15px;
    border-radius: 4px;
    margin-bottom: 20px;
    line-height: 1.6;
}

.recommended-area {
    margin-bottom: 10px;
}

.record-actions {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
    gap: 10px;
}

/* Interview Summary Dialog Styles */
.interview-summary {
    padding: 20px;
}

.summary-header {
    text-align: center;
    margin-bottom: 20px;
}

.summary-content {
    margin-top: 20px;
}

.summary-main {
    padding-right: 20px;
}

.summary-sidebar {
    background-color: #f5f7fa;
    padding: 20px;
    border-radius: 8px;
}

.overall-rating {
    display: flex;
    justify-content: center;
    margin: 20px 0;
}

.overall-comment {
    text-align: center;
    font-size: 16px;
    color: #606266;
    line-height: 1.6;
}

.skill-assessment {
    margin: 20px 0;
}

.skill-item {
    margin-bottom: 15px;
}

.skill-name {
    display: block;
    margin-bottom: 5px;
    font-weight: bold;
}

.qa-summary {
    margin-top: 15px;
}

.qa-content {
    line-height: 1.6;
}

.strength-list,
.weakness-list {
    padding-left: 20px;
    line-height: 1.8;
}

.recommendation-alert {
    margin-bottom: 15px;
}

.recommendation-notes {
    line-height: 1.6;
    color: #606266;
    margin-top: 15px;
}

.end-interview-content {
    text-align: center;
    padding: 20px 0;
}

/* Mobile Responsive Styles */
@media (max-width: 768px) {
    .interview-header {
        padding: 10px;
    }

    .interview-info {
        width: 100%;
        margin-bottom: 10px;
    }

    .interview-info h2 {
        font-size: 16px;
        margin-bottom: 5px;
        margin-right: 0;
        width: 100%;
    }

    .interview-timer {
        margin-right: 10px;
    }

    .recording-status {
        margin-bottom: 10px;
    }

    .interview-controls {
        width: 100%;
        justify-content: space-between;
    }

    .interview-controls .el-button {
        padding: 8px 12px;
        font-size: 12px;
    }

    .interview-main {
        flex-direction: column-reverse;
    }

    .interview-content {
        padding: 10px;
        order: 2;
    }

    .questions-section {
        position: fixed;
        top: 0;
        right: 0;
        height: 100%;
        width: 80%;
        max-width: 300px;
        z-index: 1000;
        transform: translateX(100%);
        box-shadow: -2px 0 10px rgba(0, 0, 0, 0.1);
        order: 1;
    }

    .questions-section.collapsed {
        transform: translateX(0);
        width: 80%;
        max-width: 300px;
    }

    .mobile-question-bank-toggle {
        display: flex;
        flex-direction: column;
        align-items: center;
    }

    .ai-question-card {
        padding: 15px 15px 15px 40px;
        flex-direction: column;
        align-items: flex-start;
    }

    .question-number {
        width: 24px;
        height: 24px;
        font-size: 14px;
        left: 10px;
    }

    .question-text {
        width: 100%;
        margin-bottom: 10px;
        font-size: 14px;
    }

    .question-actions {
        align-self: flex-end;
    }

    .current-question {
        /* padding: 15px; */
        font-size: 14px;
    }

    .area-title {
        padding: 10px;
        font-size: 14px;
    }

    .ai-title {
        font-size: 16px;
    }

    .ai-title .el-icon {
        font-size: 18px;
    }

    .transcription-content {
        min-height: 80px;
        max-height: 150px;
    }

    .record-actions {
        flex-direction: column;
    }

    .record-actions .el-button {
        margin-bottom: 10px;
    }

    .summary-main {
        padding-right: 0;
        margin-bottom: 20px;
    }
}

/* Animation for AI Question Cards */
@keyframes highlight {
    0% {
        box-shadow: 0 0 0 rgba(230, 162, 60, 0);
    }
    50% {
        box-shadow: 0 0 15px rgba(230, 162, 60, 0.5);
    }
    100% {
        box-shadow: 0 0 0 rgba(230, 162, 60, 0);
    }
}

.ai-question-card {
    animation: highlight 3s infinite;
}

/* Print Styles */
@media print {
    .el-dialog__header,
    .el-dialog__footer {
        display: none !important;
    }

    .interview-summary {
        padding: 0;
    }
}
.interview-content {
    display: flex;
    flex-direction: column;
    gap: 20px;
    max-width: 900px;
    margin: 0 auto;
    padding: 20px;
    font-family: "PingFang SC", "Helvetica Neue", Arial, sans-serif;
}

.area-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;
    padding-bottom: 10px;
    border-bottom: 1px solid #ebeef5;
}

.area-title {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 16px;
    font-weight: 600;
    color: #303133;
}

.ai-questions-area,
.current-question-area,
.favorite-questions-area,
.keywords-area {
    background: #ffffff;
    border-radius: 8px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
    padding: 20px;
}

.ai-questions {
    display: flex;
    flex-direction: column;
    gap: 15px;
    min-height: 200px;
}

.ai-question-card {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 15px;
    background: #f9fafc;
    border-radius: 6px;
    border-left: 4px solid #409eff;
    transition: all 0.3s;
}

.ai-question-card:hover {
    background: #ecf5ff;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.question-content {
    display: flex;
    gap: 12px;
    align-items: center;
    flex: 1;
}

.question-number {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 24px;
    height: 24px;
    background: #409eff;
    color: white;
    border-radius: 50%;
    font-size: 14px;
    font-weight: bold;
}

.question-text {
    flex: 1;
    line-height: 1.5;
    margin-left: 25px;
}

.question-actions {
    display: flex;
    gap: 8px;
}

.current-question {
    min-height: 100px;
    display: flex;
    align-items: center;
    justify-content: center;
    /* background: #f9fafc; */
    border-radius: 6px;
    /* padding: 20px; */
}

.question-display {
    font-size: 16px;
    line-height: 1.6;
    color: #303133;
    font-weight: 500;
}

.favorite-questions {
    padding: 10px 0;
}

.favorite-question-tag {
    margin: 5px;
    cursor: pointer;
    padding: 8px 12px;
}

.keywords-content {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    padding: 10px 0;
}

.keyword-tag {
    cursor: pointer;
    padding: 6px 10px;
    background-color: #f0f9eb;
    color: #67c23a;
}

.keyword-tag:hover {
    /* background-color: #e1f3d8; */
}

.no-questions {
    text-align: center;
    color: #909399;
    padding: 30px 0;
}

.pagination-indicator {
    display: flex;
    justify-content: center;
    gap: 8px;
    margin-top: 15px;
}

.indicator-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background-color: #dcdfe6;
    cursor: pointer;
    transition: all 0.3s;
}

.indicator-dot.active {
    background-color: #409eff;
    transform: scale(1.2);
}

.question-fade-enter-active,
.question-fade-leave-active {
    transition: all 0.3s ease;
}

.question-fade-enter-from,
.question-fade-leave-to {
    opacity: 0;
    transform: translateY(10px);
}
</style>
<style scoped>
.interview-summary {
    padding: 20px;
}

.summary-header {
    text-align: center;
    margin-bottom: 20px;
}

.summary-header h2 {
    margin-bottom: 10px;
    color: #303133;
}

.summary-section {
    margin-bottom: 20px;
}

.summary-section h3 {
    margin-bottom: 15px;
    font-weight: 600;
    color: #303133;
    display: flex;
    align-items: center;
}

.summary-section h3 .el-tag {
    margin-left: 10px;
}

.overall-comment {
    margin-top: 15px;
    line-height: 1.6;
}

.skill-item {
    margin-bottom: 20px;
}

.skill-name {
    display: block;
    font-weight: 500;
    margin-bottom: 8px;
}

.skill-description {
    margin-top: 8px;
    font-size: 0.9em;
    color: #606266;
}

.strength-content,
.weakness-content {
    background-color: #f8f9fa;
    padding: 12px;
    border-radius: 4px;
    line-height: 1.6;
}

.recommendation-alert {
    margin-bottom: 15px;
}

.recommendation-notes {
    line-height: 1.6;
}

.mt-3 {
    margin-top: 15px;
}

.mt-4 {
    margin-top: 20px;
}

@media print {
    .el-dialog__footer {
        display: none;
    }
}
.container {
    max-width: 1000px;
    margin: 0 auto;
}
.header {
    text-align: center;
    margin-bottom: 30px;
    padding: 20px 0;
    background: linear-gradient(135deg, #409eff 0%, #67c23a 100%);
    color: white;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}
.header h1 {
    margin: 0;
    font-size: 28px;
}
.header p {
    margin: 10px 0 0;
    font-size: 16px;
    opacity: 0.9;
}
.qa-card {
    margin-bottom: 20px;
    border-radius: 8px;
    overflow: hidden;
    transition:
        transform 0.3s,
        box-shadow 0.3s;
}
.qa-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
}
.question {
    font-weight: bold;
    background-color: #ecf5ff;
    /* padding: 16px; */
    border-left: 4px solid #409eff;
}
.answer {
    padding: 16px;
    line-height: 1.6;
    background-color: #fff;
    border-top: 1px solid #ebeef5;
}
.qa-index {
    display: inline-block;
    width: 28px;
    height: 28px;
    line-height: 28px;
    text-align: center;
    background-color: #409eff;
    color: white;
    border-radius: 50%;
    margin-right: 10px;
    font-size: 14px;
}
/* Current Question Area */
.current-question-area {
    background-color: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
    padding: 0 20px;
    height: 40vh;
    /* margin-bottom: 20px; */
    /* overflow: hidden; */
}
.interview-record {
    /* padding: 24px; */
    background-color: #f5f7fa;
    border-radius: 8px;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
}

.record-header {
    text-align: center;
    margin-bottom: 24px;
}

.record-header h2 {
    margin-bottom: 8px;
    color: #303133;
    font-weight: 600;
}

.record-header p {
    color: #606266;
    margin: 0;
}

.record-tabs {
    background-color: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
    overflow: hidden;
}

.tab-header {
    display: flex;
    background-color: #f5f7fa;
    border-bottom: 1px solid #e4e7ed;
}

.tab-item {
    padding: 16px 24px;
    font-size: 16px;
    font-weight: 500;
    color: #606266;
    cursor: pointer;
    transition: all 0.3s;
    border-bottom: 2px solid transparent;
}

.tab-item.active {
    color: #409eff;
    border-bottom-color: #409eff;
    background-color: #fff;
}

.tab-content {
    padding: 24px;
    height: calc(100dvh - 16rem);
    overflow: auto;
}

/* 总览标签页样式 */
.summary-list {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.topic-card {
    background-color: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
    padding: 20px;
    transition: all 0.3s;
    cursor: pointer;
}

.topic-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 6px 16px 0 rgba(0, 0, 0, 0.1);
}

.topic-header {
    display: flex;
    align-items: center;
    margin-bottom: 12px;
}

.topic-index {
    background-color: #ecf5ff;
    color: #409eff;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 14px;
    margin-right: 12px;
    font-weight: 500;
}

.topic-header h3 {
    margin: 0;
    font-size: 18px;
    color: #303133;
    font-weight: 600;
}

.topic-summary {
    color: #606266;
    margin-bottom: 16px;
    line-height: 1.6;
}

.topic-keywords {
    margin-bottom: 0px !important;
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    align-items: center;
    margin-top: 16px;
}

.keyword-tag {
    border-radius: 16px;
}

.topic-actions {
    display: flex;
    justify-content: flex-end;
}

/* 问答详情标签页样式 */
.search-container {
    margin-bottom: 20px;
}

.qa-list {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.qa-card {
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
    transition: all 0.3s;
}

.qa-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px 0 rgba(0, 0, 0, 0.08);
}

.question {
    display: flex;
    align-items: center;
    font-weight: 500;
    color: #303133;
    padding: 4px 0;
}

.qa-index {
    display: inline-flex;
    justify-content: center;
    align-items: center;
    width: 28px;
    height: 28px;
    background-color: #409eff;
    color: white;
    border-radius: 50%;
    font-size: 14px;
    margin-right: 12px;
    flex-shrink: 0;
}

.answer {
    padding: 16px;
    background-color: #f9fafc;
}

.answer-header {
    margin-bottom: 12px;
}

.answer-label {
    font-weight: 500;
    color: #67c23a;
    border-left: 3px solid #67c23a;
    padding-left: 10px;
}

.answer p {
    margin: 0;
    color: #606266;
    line-height: 1.6;
}

.empty-record {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 300px;
}

/* 话题详情对话框样式 */
.topic-detail {
    padding: 16px;
}

.topic-summary-section {
    margin-bottom: 24px;
}

.topic-summary-section h4,
.topic-qa-section h4 {
    font-size: 16px;
    color: #303133;
    margin-top: 0;
    margin-bottom: 16px;
    font-weight: 600;
}

.keywords-container {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    /* margin-top: 12px; */
}

.topic-qa-list {
    display: flex;
    flex-direction: column;
    gap: 24px;
}

.topic-qa-item {
    background-color: #f9fafc;
    border-radius: 8px;
    overflow: hidden;
}

.topic-question,
.topic-answer {
    display: flex;
    padding: 16px;
}

.topic-question {
    background-color: #ecf5ff;
}

.question-icon,
.answer-icon {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
    font-weight: bold;
    margin-right: 16px;
    flex-shrink: 0;
}

.question-icon {
    background-color: #409eff;
    color: white;
}

.answer-icon {
    background-color: #67c23a;
    color: white;
}

.question-content,
.answer-content {
    flex: 1;
    line-height: 1.6;
}

.record-actions {
    margin-top: 24px;
    display: flex;
    justify-content: flex-end;
    gap: 12px;
}

/* 响应式设计 */
@media (max-width: 768px) {
    .interview-record {
        padding: 16px;
    }

    .tab-item {
        padding: 12px 16px;
        font-size: 14px;
    }

    .tab-content {
        padding: 16px;
    }

    .topic-header h3 {
        font-size: 16px;
    }

    .topic-index {
        font-size: 12px;
        padding: 2px 6px;
    }

    .topic-qa-item {
        flex-direction: column;
    }

    .question-icon,
    .answer-icon {
        width: 28px;
        height: 28px;
        font-size: 14px;
    }
}
</style>
