<template>
    <div class="visualization-charts">
        <div v-if="loading" class="chart-loading">
            <el-skeleton animated :rows="5" />
        </div>
        <div v-else>
            <!-- 根据类型渲染不同图表 -->
            <div v-if="chartType === 'radar'" class="chart-container" ref="radarChart"></div>
            <div v-if="chartType === 'pie'" class="chart-container" ref="pieChart"></div>
            <div v-if="chartType === 'bar'" class="chart-container" ref="barChart"></div>
            <div v-if="chartType === 'line'" class="chart-container" ref="lineChart"></div>
            <div v-if="chartType === 'wordcloud'" class="chart-container" ref="wordcloudChart"></div>
            <div v-if="chartType === 'heatmap'" class="chart-container" ref="heatmapChart"></div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, watch, nextTick } from 'vue'
import * as echarts from 'echarts'
import 'echarts-wordcloud'

const props = defineProps({
    // 图表类型: radar, pie, bar, line, wordcloud, heatmap
    chartType: {
        type: String,
        required: true,
        validator: (value) => ['radar', 'pie', 'bar', 'line', 'wordcloud', 'heatmap'].includes(value)
    },
    // 图表数据
    chartData: {
        type: Object,
        required: true
    },
    // 图表标题
    title: {
        type: String,
        default: ''
    },
    // 图表高度
    height: {
        type: String,
        default: '400px'
    },
    // 是否加载中
    loading: {
        type: Boolean,
        default: false
    }
})

// 图表引用对象
const radarChart = ref(null)
const pieChart = ref(null)
const barChart = ref(null)
const lineChart = ref(null)
const wordcloudChart = ref(null)
const heatmapChart = ref(null)

// echarts实例
const chartInstance = ref(null)

// 初始化图表
const initChart = () => {
    clearChart()

    nextTick(() => {
        // 根据图表类型获取对应DOM引用
        const chartRef = {
            'radar': radarChart.value,
            'pie': pieChart.value,
            'bar': barChart.value,
            'line': lineChart.value,
            'wordcloud': wordcloudChart.value,
            'heatmap': heatmapChart.value
        }[props.chartType]

        if (!chartRef) return

        // 初始化echarts实例
        chartInstance.value = echarts.init(chartRef)

        // 设置图表选项
        const option = getChartOption()
        chartInstance.value.setOption(option)

        // 设置自适应
        window.addEventListener('resize', handleResize)
    })
}

// 清除图表
const clearChart = () => {
    if (chartInstance.value) {
        chartInstance.value.dispose()
        chartInstance.value = null
    }
}

// 窗口大小变化处理
const handleResize = () => {
    if (chartInstance.value) {
        chartInstance.value.resize()
    }
}

// 根据图表类型获取不同的配置
const getChartOption = () => {
    switch (props.chartType) {
        case 'radar':
            return getRadarOption()
        case 'pie':
            return getPieOption()
        case 'bar':
            return getBarOption()
        case 'line':
            return getLineOption()
        case 'wordcloud':
            return getWordcloudOption()
        case 'heatmap':
            return getHeatmapOption()
        default:
            return {}
    }
}

// 雷达图配置
const getRadarOption = () => {
    const { indicator = [], data = [] } = props.chartData

    return {
        title: {
            text: props.title,
            left: 'center'
        },
        tooltip: {
            trigger: 'item'
        },
        radar: {
            indicator: indicator
        },
        series: [{
            type: 'radar',
            data: data
        }]
    }
}

// 饼图配置
const getPieOption = () => {
    const { data = [] } = props.chartData

    return {
        title: {
            text: props.title,
            left: 'center'
        },
        tooltip: {
            trigger: 'item',
            formatter: '{a} <br/>{b} : {c} ({d}%)'
        },
        legend: {
            orient: 'vertical',
            left: 'left',
            data: data.map(item => item.name)
        },
        series: [{
            name: props.title,
            type: 'pie',
            radius: '55%',
            center: ['50%', '60%'],
            data: data,
            emphasis: {
                itemStyle: {
                    shadowBlur: 10,
                    shadowOffsetX: 0,
                    shadowColor: 'rgba(0, 0, 0, 0.5)'
                }
            }
        }]
    }
}

// 柱状图配置
const getBarOption = () => {
    const { xAxis = [], series = [] } = props.chartData

    return {
        title: {
            text: props.title,
            left: 'center'
        },
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'shadow'
            }
        },
        xAxis: {
            type: 'category',
            data: xAxis
        },
        yAxis: {
            type: 'value'
        },
        series: series.map(item => ({
            ...item,
            type: 'bar'
        }))
    }
}

// 折线图配置
const getLineOption = () => {
    const { xAxis = [], series = [] } = props.chartData

    return {
        title: {
            text: props.title,
            left: 'center'
        },
        tooltip: {
            trigger: 'axis'
        },
        xAxis: {
            type: 'category',
            data: xAxis
        },
        yAxis: {
            type: 'value'
        },
        series: series.map(item => ({
            ...item,
            type: 'line'
        }))
    }
}

// 词云图配置
const getWordcloudOption = () => {
    const { data = [] } = props.chartData

    return {
        title: {
            text: props.title,
            left: 'center'
        },
        tooltip: {
            show: true
        },
        series: [{
            type: 'wordCloud',
            shape: 'circle',
            left: 'center',
            top: 'center',
            width: '90%',
            height: '80%',
            right: null,
            bottom: null,
            sizeRange: [12, 60],
            rotationRange: [-90, 90],
            rotationStep: 45,
            gridSize: 8,
            drawOutOfBound: false,
            textStyle: {
                fontFamily: 'sans-serif',
                fontWeight: 'bold',
                color: function () {
                    return 'rgb(' + [
                        Math.round(Math.random() * 160),
                        Math.round(Math.random() * 160),
                        Math.round(Math.random() * 160)
                    ].join(',') + ')'
                }
            },
            emphasis: {
                textStyle: {
                    shadowBlur: 10,
                    shadowColor: '#333'
                }
            },
            data: data
        }]
    }
}

// 热力图配置
const getHeatmapOption = () => {
    const { xAxis = [], yAxis = [], data = [] } = props.chartData

    return {
        title: {
            text: props.title,
            left: 'center'
        },
        tooltip: {
            position: 'top'
        },
        grid: {
            height: '50%',
            top: '10%'
        },
        xAxis: {
            type: 'category',
            data: xAxis,
            splitArea: {
                show: true
            }
        },
        yAxis: {
            type: 'category',
            data: yAxis,
            splitArea: {
                show: true
            }
        },
        visualMap: {
            min: 0,
            max: 10,
            calculable: true,
            orient: 'horizontal',
            left: 'center',
            bottom: '15%'
        },
        series: [{
            name: props.title,
            type: 'heatmap',
            data: data,
            label: {
                show: true
            },
            emphasis: {
                itemStyle: {
                    shadowBlur: 10,
                    shadowColor: 'rgba(0, 0, 0, 0.5)'
                }
            }
        }]
    }
}

// 监听数据变化，重新渲染图表
watch(() => props.chartData, () => {
    if (!props.loading) {
        initChart()
    }
}, { deep: true })

// 监听图表类型变化，重新渲染
watch(() => props.chartType, () => {
    if (!props.loading) {
        initChart()
    }
})

// 组件挂载时初始化图表
onMounted(() => {
    if (!props.loading) {
        initChart()
    }
})

// 组件销毁时清除图表和事件监听
const onUnmounted = () => {
    window.removeEventListener('resize', handleResize)
    clearChart()
}
</script>

<style scoped>
.visualization-charts {
    width: 100%;
}

.chart-loading {
    padding: 20px;
}

.chart-container {
    height: v-bind('props.height');
    width: 100%;
}
</style>