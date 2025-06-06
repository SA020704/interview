<template>
    <div class="recommendation-card" :class="{ 'is-highlighted': recommendation.highlighted }">
        <div class="card-header">
            <div class="recommendation-type">
                <el-tag :type="getRecommendationType(recommendation.type)" effect="plain" size="small">
                    {{ getRecommendationTypeText(recommendation.type) }}
                </el-tag>
                <el-tag v-if="recommendation.confidence" :type="getConfidenceType(recommendation.confidence)"
                    effect="light" size="small">
                    相关度 {{ Math.round(recommendation.confidence * 100) }}%
                </el-tag>
            </div>
            <div class="card-actions">
                <el-button type="primary" size="small" circle plain :title="isFavorite ? '取消收藏' : '收藏问题'"
                    @click="toggleFavorite">
                    <el-icon>
                        <Star :fill="isFavorite ? '#E6A23C' : ''" />
                    </el-icon>
                </el-button>
            </div>
        </div>

        <div class="card-content">
            <h4 class="recommendation-title">{{ recommendation.title }}</h4>

            <div class="recommendation-context" v-if="recommendation.context">
                <div class="context-header">推荐理由：</div>
                <div class="context-content">{{ recommendation.context }}</div>
            </div>

            <div class="recommendation-keywords" v-if="recommendation.keywords && recommendation.keywords.length">
                <span v-for="(keyword, index) in recommendation.keywords" :key="index" class="keyword">
                    {{ keyword }}
                </span>
            </div>
        </div>

        <div class="card-footer">
            <el-button type="primary" size="small" @click="useQuestion">直接使用</el-button>
            <el-button size="small" @click="editBeforeUse">编辑后使用</el-button>
        </div>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Star } from '@element-plus/icons-vue'

// 定义属性
const props = defineProps({
    recommendation: {
        type: Object,
        required: true
    }
})

// 定义事件
const emit = defineEmits(['use-question', 'edit-question', 'toggle-favorite'])

// 内部状态
const isFavorite = ref(props.recommendation.isFavorite || false)

// 根据推荐类型获取标签类型
const getRecommendationType = (type) => {
    const typeMap = {
        'followup': 'success',
        'deepdive': 'warning',
        'topic': 'primary',
        'assessment': 'danger',
        'clarification': 'info'
    }
    return typeMap[type] || 'info'
}

// 获取推荐类型文本
const getRecommendationTypeText = (type) => {
    const textMap = {
        'followup': '跟进问题',
        'deepdive': '深入探讨',
        'topic': '新话题',
        'assessment': '评估问题',
        'clarification': '澄清问题'
    }
    return textMap[type] || '推荐问题'
}

// 根据置信度获取类型
const getConfidenceType = (confidence) => {
    if (confidence >= 0.8) return 'success'
    if (confidence >= 0.6) return 'warning'
    return 'info'
}

// 切换收藏状态
const toggleFavorite = () => {
    isFavorite.value = !isFavorite.value
    emit('toggle-favorite', {
        id: props.recommendation.id,
        isFavorite: isFavorite.value
    })
}

// 直接使用问题
const useQuestion = () => {
    emit('use-question', props.recommendation)
}

// 编辑后使用
const editBeforeUse = () => {
    emit('edit-question', props.recommendation)
}
</script>

<style scoped>
.recommendation-card {
    position: relative;
    margin-bottom: 16px;
    padding: 16px;
    border-radius: 8px;
    background-color: #fff;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
    transition: all 0.3s ease;
    border-left: 3px solid transparent;

    &:hover {
        box-shadow: 0 4px 16px 0 rgba(0, 0, 0, 0.1);
    }

    &.is-highlighted {
        border-left-color: #409EFF;
        background-color: #ecf5ff;
    }

    .card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12px;

        .recommendation-type {
            display: flex;
            gap: 8px;
        }
    }

    .card-content {
        margin-bottom: 16px;

        .recommendation-title {
            font-size: 16px;
            font-weight: 500;
            line-height: 1.4;
            margin: 0 0 12px 0;
            color: #303133;
        }

        .recommendation-context {
            margin-bottom: 12px;
            font-size: 14px;
            color: #606266;

            .context-header {
                font-weight: 500;
                margin-bottom: 4px;
                color: #909399;
            }

            .context-content {
                line-height: 1.5;
            }
        }

        .recommendation-keywords {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
            margin-top: 8px;

            .keyword {
                padding: 4px 8px;
                background-color: #f5f7fa;
                border-radius: 4px;
                font-size: 12px;
                color: #606266;
            }
        }
    }

    .card-footer {
        display: flex;
        gap: 8px;
    }
}
</style>