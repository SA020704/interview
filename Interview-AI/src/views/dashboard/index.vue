<template>
    <div class="dashboard-container">
        <div class="dashboard-header">
            <h1>仪表盘</h1>
            <div class="date-info">{{ currentDate }}</div>
        </div>

        <!-- 数据概览区域 -->
        <div class="dashboard-section">
            <h2 class="section-title">数据概览</h2>
            <div class="data-overview">
                <el-row :gutter="20">
                    <el-col :xs="24" :sm="12" :md="6">
                        <el-card class="data-card">
                            <div class="data-card-content">
                                <div class="data-icon interview-icon">
                                    <el-icon>
                                        <Calendar />
                                    </el-icon>
                                </div>
                                <div class="data-info">
                                    <div class="data-value">{{ dashboardData.interviewCount }}</div>
                                    <div class="data-label">待进行面试</div>
                                </div>
                            </div>
                            <div class="data-footer">
                                <el-button link type="primary"
                                    @click="navigateTo('/interview/preparation')">查看详情</el-button>
                            </div>
                        </el-card>
                    </el-col>
                    <el-col :xs="24" :sm="12" :md="6">
                        <el-card class="data-card">
                            <div class="data-card-content">
                                <div class="data-icon candidate-icon">
                                    <el-icon>
                                        <User />
                                    </el-icon>
                                </div>
                                <div class="data-info">
                                    <div class="data-value">{{ dashboardData.candidateCount }}</div>
                                    <div class="data-label">候选人</div>
                                </div>
                            </div>
                            <div class="data-footer">
                                <el-button link type="primary"
                                    @click="navigateTo('/interview/preparation')">查看详情</el-button>
                            </div>
                        </el-card>
                    </el-col>
                    <el-col :xs="24" :sm="12" :md="6">
                        <el-card class="data-card">
                            <div class="data-card-content">
                                <div class="data-icon completed-icon">
                                    <el-icon>
                                        <Check />
                                    </el-icon>
                                </div>
                                <div class="data-info">
                                    <div class="data-value">{{ dashboardData.completedCount }}</div>
                                    <div class="data-label">已完成面试</div>
                                </div>
                            </div>
                            <div class="data-footer">
                                <span class="trend-info positive">
                                    <el-icon>
                                        <ArrowUp />
                                    </el-icon> 10% 较上周
                                </span>
                            </div>
                        </el-card>
                    </el-col>
                    <el-col :xs="24" :sm="12" :md="6">
                        <el-card class="data-card">
                            <div class="data-card-content">
                                <div class="data-icon pending-icon">
                                    <el-icon>
                                        <Document />
                                    </el-icon>
                                </div>
                                <div class="data-info">
                                    <div class="data-value">{{ dashboardData.pendingCount }}</div>
                                    <div class="data-label">待评估面试</div>
                                </div>
                            </div>
                            <div class="data-footer">
                                <el-button link type="warning"
                                    @click="navigateTo('/interview/analysis')">立即评估</el-button>
                            </div>
                        </el-card>
                    </el-col>
                </el-row>
            </div>

            <!-- 图表数据 -->
            <div class="chart-section">
                <el-row :gutter="20">
                    <el-col :xs="24" :sm="24" :md="12">
                        <el-card class="chart-card">
                            <template #header>
                                <div class="chart-header">
                                    <span>候选人状态分布</span>
                                    <el-select v-model="chartTimeRange" size="small" style="width: 120px">
                                        <el-option label="本周" value="week"></el-option>
                                        <el-option label="本月" value="month"></el-option>
                                        <el-option label="本季度" value="quarter"></el-option>
                                    </el-select>
                                </div>
                            </template>
                            <div class="chart-container">
                                <div ref="candidateChartRef" class="chart"></div>
                            </div>
                        </el-card>
                    </el-col>
                    <el-col :xs="24" :sm="24" :md="12">
                        <el-card class="chart-card">
                            <template #header>
                                <div class="chart-header">
                                    <span>面试评分趋势</span>
                                    <el-select v-model="scoreTimeRange" size="small" style="width: 120px">
                                        <el-option label="近3个月" value="3months"></el-option>
                                        <el-option label="近6个月" value="6months"></el-option>
                                        <el-option label="全年" value="year"></el-option>
                                    </el-select>
                                </div>
                            </template>
                            <div class="chart-container">
                                <div ref="scoreChartRef" class="chart"></div>
                            </div>
                        </el-card>
                    </el-col>
                </el-row>
            </div>
        </div>

        <!-- 快捷操作区域 -->
        <div class="dashboard-section">
            <h2 class="section-title">快捷操作</h2>
            <div class="quick-actions">
                <el-row :gutter="16">
                    <el-col :xs="12" :sm="6" :md="6" :lg="3" v-for="action in quickActions" :key="action.name">
                        <div class="action-card" @click="navigateTo(action.path)">
                            <el-icon class="action-icon" :size="32">
                                <component :is="action.icon"></component>
                            </el-icon>
                            <div class="action-name">{{ action.name }}</div>
                        </div>
                    </el-col>
                </el-row>
            </div>
        </div>

        <!-- 最近活动和待办事项 -->
        <div class="dashboard-section">
            <el-row :gutter="20">
                <el-col :xs="24" :sm="24" :md="16">
                    <el-card class="recent-activity-card">
                        <template #header>
                            <div class="card-header">
                                <h3>近期活动</h3>
                            </div>
                        </template>
                        <div class="timeline-container">
                            <el-timeline>
                                <el-timeline-item v-for="(activity, index) in recentActivities" :key="index"
                                    :type="activity.type" :color="activity.color" :timestamp="activity.time"
                                    :hollow="activity.hollow">
                                    <div class="timeline-content">
                                        <h4>{{ activity.title }}</h4>
                                        <p>{{ activity.content }}</p>
                                        <div v-if="activity.actions" class="timeline-actions">
                                            <el-button v-for="action in activity.actions" :key="action.text"
                                                :type="action.type" size="small" @click="navigateTo(action.path)">
                                                {{ action.text }}
                                            </el-button>
                                        </div>
                                    </div>
                                </el-timeline-item>
                            </el-timeline>
                        </div>
                    </el-card>
                </el-col>
                <el-col :xs="24" :sm="24" :md="8">
                    <el-card class="todo-card">
                        <template #header>
                            <div class="card-header">
                                <h3>待处理任务</h3>
                                <el-button type="primary" size="small" plain @click="addNewTask">新增</el-button>
                            </div>
                        </template>
                        <div class="todo-list">
                            <el-empty v-if="!todoItems.length" description="暂无待处理任务"></el-empty>
                            <div v-else>
                                <div v-for="(todo, index) in todoItems" :key="index" class="todo-item">
                                    <el-checkbox v-model="todo.completed" :disabled="todo.locked">
                                        <span :class="{ 'completed': todo.completed }">{{ todo.content }}</span>
                                    </el-checkbox>
                                    <div class="todo-info">
                                        <el-tag size="small" :type="todo.tagType">{{ todo.tag }}</el-tag>
                                        <span class="todo-date">{{ todo.date }}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </el-card>
                </el-col>
            </el-row>
        </div>
    </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/store/modules/user';
import { useInterviewStore } from '@/store/modules/interview';
import * as echarts from 'echarts/core';
import { PieChart, LineChart } from 'echarts/charts';
import {
    TitleComponent,
    TooltipComponent,
    LegendComponent,
    GridComponent
} from 'echarts/components';
import { LabelLayout } from 'echarts/features';
import { CanvasRenderer } from 'echarts/renderers';
import {
    Calendar,
    User,
    Check,
    Document,
    ArrowUp,
    Plus,
    Setting,
    List,
    Search,
    Upload,
    VideoPlay
} from '@element-plus/icons-vue';

// 注册ECharts组件
echarts.use([
    TitleComponent,
    TooltipComponent,
    LegendComponent,
    GridComponent,
    PieChart,
    LineChart,
    LabelLayout,
    CanvasRenderer
]);

const router = useRouter();
const userStore = useUserStore();
const interviewStore = useInterviewStore();

// 图表引用
const candidateChartRef = ref(null);
const scoreChartRef = ref(null);
let candidateChart = null;
let scoreChart = null;

// 显示设置
const chartTimeRange = ref('month');
const scoreTimeRange = ref('3months');

// 计算当前日期
const currentDate = computed(() => {
    const now = new Date();
    return now.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long'
    });
});

// 仪表盘数据
const dashboardData = reactive({
    interviewCount: 8,
    candidateCount: 32,
    completedCount: 24,
    pendingCount: 5
});

// 快捷操作
const quickActions = [
    { name: '创建面试', icon: 'Plus', path: '/interview/preparation' },
    { name: '候选人管理', icon: 'User', path: '/interview/preparation' },
    { name: '问题库', icon: 'List', path: '/interview/execution/questions' },
    { name: '查看报告', icon: 'Document', path: '/interview/analysis' },
    { name: '系统设置', icon: 'Setting', path: '/settings' },
    { name: '搜索记录', icon: 'Search', path: '/interview/analysis' },
    { name: '导入简历', icon: 'Upload', path: '/interview/preparation' },
    { name: '开始面试', icon: 'VideoPlay', path: '/interview/execution/demo' }
];

// 近期活动数据
const recentActivities = [
    {
        title: '技术面试已完成',
        content: '候选人：李明 - 前端开发工程师',
        time: '今天 14:30',
        type: 'primary',
        color: '#409EFF',
        hollow: false,
        actions: [
            { text: '查看分析', type: 'primary', path: '/interview/analysis/1' }
        ]
    },
    {
        title: '新的面试计划已创建',
        content: '产品经理岗位，共5名候选人',
        time: '今天 10:15',
        type: 'success',
        color: '#67C23A',
        hollow: false,
        actions: [
            { text: '查看详情', type: 'success', path: '/interview/preparation' }
        ]
    },
    {
        title: '3份面试报告待评估',
        content: '请尽快完成评估以便进行下一步操作',
        time: '昨天 16:45',
        type: 'warning',
        color: '#E6A23C',
        hollow: true,
        actions: [
            { text: '去评估', type: 'warning', path: '/interview/analysis' }
        ]
    },
    {
        title: '系统更新通知',
        content: 'AI面试助手新增了简历智能匹配功能',
        time: '2天前',
        type: 'info',
        color: '#909399',
        hollow: true
    }
];

// 待办事项数据
const todoItems = ref([
    {
        content: '评估张三的面试结果',
        completed: false,
        tag: '面试评估',
        tagType: 'danger',
        date: '今天',
        locked: false
    },
    {
        content: '准备下周的面试问题',
        completed: false,
        tag: '准备工作',
        tagType: 'warning',
        date: '明天',
        locked: false
    },
    {
        content: '审核候选人简历',
        completed: true,
        tag: '简历筛选',
        tagType: 'success',
        date: '已完成',
        locked: true
    }
]);

// 添加新任务
const addNewTask = () => {
    todoItems.value.unshift({
        content: '新任务',
        completed: false,
        tag: '待处理',
        tagType: 'info',
        date: '今天',
        locked: false
    });
};

// 导航到指定路径
const navigateTo = (path) => {
    router.push(path);
};

// 初始化候选人状态分布图表
const initCandidateChart = () => {
    if (!candidateChartRef.value) return;

    candidateChart = echarts.init(candidateChartRef.value);

    const option = {
        tooltip: {
            trigger: 'item',
            formatter: '{a} <br/>{b}: {c} ({d}%)'
        },
        legend: {
            orient: 'horizontal',
            bottom: 'bottom'
        },
        series: [
            {
                name: '候选人状态',
                type: 'pie',
                radius: ['40%', '70%'],
                avoidLabelOverlap: false,
                itemStyle: {
                    borderRadius: 10,
                    borderColor: '#fff',
                    borderWidth: 2
                },
                label: {
                    show: false,
                    position: 'center'
                },
                emphasis: {
                    label: {
                        show: true,
                        fontSize: 16,
                        fontWeight: 'bold'
                    }
                },
                labelLine: {
                    show: false
                },
                data: [
                    { value: 15, name: '待面试' },
                    { value: 8, name: '面试中' },
                    { value: 12, name: '已通过' },
                    { value: 9, name: '未通过' },
                    { value: 6, name: '已入职' }
                ]
            }
        ]
    };

    candidateChart.setOption(option);
};

// 初始化面试评分趋势图表
const initScoreChart = () => {
    if (!scoreChartRef.value) return;

    scoreChart = echarts.init(scoreChartRef.value);

    const option = {
        tooltip: {
            trigger: 'axis'
        },
        legend: {
            data: ['技术能力', '沟通能力', '综合得分'],
            bottom: 'bottom'
        },
        grid: {
            left: '3%',
            right: '4%',
            bottom: '15%',
            top: '3%',
            containLabel: true
        },
        xAxis: {
            type: 'category',
            boundaryGap: false,
            data: ['1月', '2月', '3月', '4月', '5月', '6月']
        },
        yAxis: {
            type: 'value',
            max: 100,
            min: 0
        },
        series: [
            {
                name: '技术能力',
                type: 'line',
                stack: '总量',
                data: [78, 82, 85, 81, 90, 88],
                smooth: true
            },
            {
                name: '沟通能力',
                type: 'line',
                stack: '总量',
                data: [82, 80, 83, 84, 85, 90],
                smooth: true
            },
            {
                name: '综合得分',
                type: 'line',
                stack: '总量',
                data: [80, 81, 84, 83, 88, 89],
                smooth: true,
                lineStyle: {
                    width: 3
                },
                itemStyle: {
                    shadowColor: 'rgba(0, 0, 0, 0.3)',
                    shadowBlur: 10
                }
            }
        ]
    };

    scoreChart.setOption(option);
};

// 监听窗口大小变化，重绘图表
const handleResize = () => {
    if (candidateChart) candidateChart.resize();
    if (scoreChart) scoreChart.resize();
};

// 生命周期钩子
onMounted(() => {
    // 初始化图表
    setTimeout(() => {
        initCandidateChart();
        initScoreChart();
    }, 200);

    // 添加窗口调整监听
    window.addEventListener('resize', handleResize);

    // 注销前清理
    return () => {
        window.removeEventListener('resize', handleResize);
        if (candidateChart) candidateChart.dispose();
        if (scoreChart) scoreChart.dispose();
    };
});
</script>

<style scoped>
.dashboard-container {
    padding: 20px;
}

.dashboard-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
}

.dashboard-header h1 {
    margin: 0;
    font-size: 24px;
    font-weight: 500;
    color: #303133;
}

.date-info {
    color: #606266;
    font-size: 14px;
}

.dashboard-section {
    margin-bottom: 32px;
}

.section-title {
    margin: 0 0 16px 0;
    font-size: 18px;
    font-weight: 500;
    color: #303133;
    position: relative;
    padding-left: 12px;
}

.section-title::before {
    content: '';
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    width: 4px;
    height: 16px;
    background-color: #409EFF;
    border-radius: 2px;
}

.data-overview {
    margin-bottom: 24px;
}

.data-card {
    height: 100%;
    transition: all 0.3s;
    cursor: pointer;
    margin-bottom: 16px;
}

.data-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
}

.data-card-content {
    display: flex;
    align-items: center;
    padding: 8px 0;
}

.data-icon {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 16px;
}

.data-icon .el-icon {
    font-size: 24px;
    color: white;
}

.interview-icon {
    background-color: #409EFF;
}

.candidate-icon {
    background-color: #67C23A;
}

.completed-icon {
    background-color: #E6A23C;
}

.pending-icon {
    background-color: #F56C6C;
}

.data-info {
    flex: 1;
}

.data-value {
    font-size: 24px;
    font-weight: 600;
    color: #303133;
    line-height: 1.2;
}

.data-label {
    font-size: 14px;
    color: #909399;
}

.data-footer {
    margin-top: 8px;
    padding-top: 8px;
    border-top: 1px solid #EBEEF5;
    display: flex;
    justify-content: flex-end;
}

.trend-info {
    display: flex;
    align-items: center;
    font-size: 13px;
}

.trend-info.positive {
    color: #67C23A;
}

.trend-info.negative {
    color: #F56C6C;
}

.chart-section {
    margin-bottom: 8px;
}

.chart-card {
    margin-bottom: 16px;
}

.chart-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 16px;
    font-weight: 500;
}

.chart-container {
    height: 300px;
    width: 100%;
}

.chart {
    height: 100%;
    width: 100%;
}

.quick-actions {
    margin-bottom: 16px;
}

.action-card {
    background-color: white;
    padding: 16px;
    border-radius: 8px;
    text-align: center;
    cursor: pointer;
    transition: all 0.3s;
    margin-bottom: 16px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.action-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
    color: #409EFF;
}

.action-icon {
    font-size: 32px;
    color: #409EFF;
    margin-bottom: 8px;
}

.action-name {
    font-size: 14px;
    color: #606266;
}

.recent-activity-card,
.todo-card {
    height: 100%;
    margin-bottom: 16px;
}

.card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.card-header h3 {
    margin: 0;
    font-size: 16px;
    font-weight: 500;
}

.timeline-container {
    padding: 8px 0;
    max-height: 400px;
    overflow-y: auto;
}

.timeline-content h4 {
    margin: 0 0 8px 0;
    font-size: 15px;
    font-weight: 500;
}

.timeline-content p {
    margin: 0 0 12px 0;
    color: #606266;
}

.timeline-actions {
    display: flex;
    gap: 8px;
}

.todo-list {
    max-height: 350px;
    overflow-y: auto;
}

.todo-item {
    padding: 12px 0;
    border-bottom: 1px solid #EBEEF5;
}

.todo-item:last-child {
    border-bottom: none;
}

.todo-info {
    margin-top: 8px;
    margin-left: 24px;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.todo-date {
    font-size: 12px;
    color: #909399;
}

.completed {
    text-decoration: line-through;
    color: #909399;
}

/* 移动端适配 */
@media (max-width: 768px) {
    .dashboard-container {
        padding: 12px;
    }

    .dashboard-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 8px;
    }

    .section-title {
        font-size: 16px;
    }

    .data-card-content {
        flex-direction: column;
        text-align: center;
    }

    .data-icon {
        margin-right: 0;
        margin-bottom: 12px;
    }

    .chart-container {
        height: 250px;
    }
}

/* 小屏幕手机进一步优化 */
@media (max-width: 480px) {
    .dashboard-header h1 {
        font-size: 20px;
    }

    .date-info {
        font-size: 12px;
    }

    .chart-container {
        height: 200px;
    }

    .chart-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 8px;
    }

    .timeline-container {
        max-height: 300px;
    }

    .todo-info {
        flex-direction: column;
        align-items: flex-start;
        gap: 4px;
    }
}
</style>