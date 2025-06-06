<template>
    <div class="ai-suggestion-panel">
        <div class="panel-header">
            <h3 class="panel-title">AI问题建议</h3>
            <div class="panel-actions">
                <el-button type="primary" size="small" @click="generateSuggestions" :loading="loading"
                    :disabled="disabled">
                    <el-icon>
                        <RefreshRight />
                    </el-icon> 生成建议
                </el-button>
            </div>
        </div>

        <div v-if="loading" class="suggestion-loading">
            <el-skeleton :rows="3" animated />
        </div>

        <div v-else-if="suggestions.length === 0" class="empty-suggestions">
            <el-empty description="暂无AI推荐问题" :image-size="60">
                <template #extra v-if="!disabled">
                    <el-button type="primary" size="small" @click="generateSuggestions">
                        生成建议
                    </el-button>
                </template>
            </el-empty>
        </div>

        <div v-else class="suggestion-list">
            <el-scrollbar height="220px">
                <div v-for="(suggestion, index) in suggestions" :key="index" class="suggestion-item">
                    <div class="suggestion-content">
                        <div class="suggestion-text">{{ suggestion.text }}</div>
                        <div class="suggestion-meta">
                            <el-tag size="small" :type="getTypeTag(suggestion.type)" effect="plain">
                                {{ getTypeName(suggestion.type) }}
                            </el-tag>
                            <el-tag size="small" type="info" effect="plain" v-if="suggestion.reason">
                                <el-tooltip :content="suggestion.reason" placement="top">
                                    <span>查看原因</span>
                                </el-tooltip>
                            </el-tag>
                        </div>
                    </div>
                    <div class="suggestion-actions">
                        <el-button type="primary" size="small" @click="useAsSuggestion(suggestion.text)"
                            :disabled="disabled" plain>
                            使用
                        </el-button>
                    </div>
                </div>
            </el-scrollbar>
        </div>

        <div class="panel-footer" v-if="suggestions.length > 0">
            <el-alert title="AI建议是基于当前面试对话内容生成的，仅供参考" type="info" :closable="false" show-icon size="small" />
        </div>
    </div>
</template>

<script setup>
import { ref, defineProps, defineEmits, onMounted } from 'vue'
import { RefreshRight } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { getAIRecommendations } from '@/api/interview'

const props = defineProps({
    interviewId: {
        type: [String, Number],
        required: true
    },
    record: {
        type: Array,
        default: () => []
    },
    disabled: {
        type: Boolean,
        default: false
    }
})

const emit = defineEmits(['use-suggestion'])

// 状态
const loading = ref(false)
const suggestions = ref([])

// 获取类型标签
const getTypeTag = (type) => {
    const typeMap = {
        'technical': 'primary',
        'behavioral': 'success',
        'situational': 'warning',
        'followup': 'danger',
        'clarification': 'info'
    }
    return typeMap[type] || ''
}

// 获取类型名称
const getTypeName = (type) => {
    const typeMap = {
        'technical': '技术问题',
        'behavioral': '行为问题',
        'situational': '情景问题',
        'followup': '跟进问题',
        'clarification': '澄清问题'
    }
    return typeMap[type] || '建议问题'
}

// 使用AI建议
const useAsSuggestion = (suggestionText) => {
    emit('use-suggestion', suggestionText)

    // 标记该建议为已使用
    const index = suggestions.value.findIndex(s => s.text === suggestionText)
    if (index !== -1) {
        suggestions.value[index].used = true
    }

    ElMessage.success('已添加到问题列表')
}

// 生成AI建议
const generateSuggestions = async () => {
    if (props.disabled) return

    try {
        loading.value = true

        // 调用API获取建议
        const { data } = await getAIRecommendations(props.interviewId)

        // 如果没有记录，使用预设建议
        if (!data || data.length === 0) {
            // 模拟API响应
            suggestions.value = generateMockSuggestions()
        } else {
            suggestions.value = data.map(item => ({
                text: item.content,
                type: item.type,
                reason: item.reason,
                used: false
            }))
        }

        ElMessage.success('AI建议已更新')
    } catch (error) {
        ElMessage.error('获取AI建议失败: ' + error.message)
        suggestions.value = generateMockSuggestions()
    } finally {
        loading.value = false
    }
}

// 生成模拟建议（当API不可用时）
const generateMockSuggestions = () => {
    return [
        {
            text: '您能否描述一下您遇到的最具挑战性的技术问题，以及您是如何解决的？',
            type: 'behavioral',
            reason: '了解候选人的问题解决能力和技术深度',
            used: false
        },
        {
            text: '请详细解释您在简历中提到的最近项目中使用的核心技术和您的具体贡献。',
            type: 'technical',
            reason: '验证候选人技术经验的真实性和深度',
            used: false
        },
        {
            text: '您如何确保您的代码质量和项目可维护性？',
            type: 'technical',
            reason: '评估候选人的代码质量意识和最佳实践知识',
            used: false
        },
        {
            text: '您是如何学习新技术的？请分享一个您最近学习的新技术或工具的例子。',
            type: 'behavioral',
            reason: '评估候选人的学习能力和主动性',
            used: false
        },
        {
            text: '在团队合作中遇到意见分歧时，您通常如何处理？',
            type: 'situational',
            reason: '了解候选人的团队协作和沟通能力',
            used: false
        }
    ]
}

// 初始化时生成建议
onMounted(() => {
    if (!props.disabled && props.record.length > 0) {
        generateSuggestions()
    }
})
</script>

<style scoped>
.ai-suggestion-panel {
    background-color: #fff;
    border-radius: 4px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
    padding: 16px;

    .panel-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 16px;

        .panel-title {
            margin: 0;
            font-size: 16px;
            font-weight: 500;
        }
    }

    .suggestion-loading,
    .empty-suggestions {
        height: 200px;
        display: flex;
        justify-content: center;
        align-items: center;
    }

    .suggestion-list {
        .suggestion-item {
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
            padding: 12px 16px;
            border-bottom: 1px solid #ebeef5;
            transition: background-color 0.3s;

            &:hover {
                background-color: #f5f7fa;
            }

            &.is-used {
                opacity: 0.7;
            }

            .suggestion-content {
                flex: 1;

                .suggestion-text {
                    margin-bottom: 8px;
                    line-height: 1.5;
                }

                .suggestion-meta {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 12px;
                }
            }

            .suggestion-actions {
                margin-left: 16px;
            }
        }
    }

    .panel-footer {
        margin-top: 16px;
    }
}
</style>