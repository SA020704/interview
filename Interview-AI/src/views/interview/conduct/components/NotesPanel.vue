<template>
    <div class="notes-panel">
        <div class="panel-header">
            <h3 class="panel-title">面试笔记</h3>
            <el-button type="primary" size="small" @click="showAddNoteDialog" :disabled="disabled">
                <el-icon>
                    <Edit />
                </el-icon> 添加笔记
            </el-button>
        </div>

        <el-dialog v-model="addNoteDialogVisible" title="添加面试笔记" width="500px">
            <el-form ref="noteFormRef" :model="noteForm" :rules="noteRules" label-position="top">
                <el-form-item label="标题" prop="title">
                    <el-input v-model="noteForm.title" placeholder="笔记标题" />
                </el-form-item>

                <el-form-item label="内容" prop="content">
                    <el-input v-model="noteForm.content" type="textarea" :rows="4" placeholder="笔记内容..." />
                </el-form-item>

                <el-form-item label="笔记类型" prop="type">
                    <el-select v-model="noteForm.type" placeholder="选择笔记类型" style="width: 100%">
                        <el-option label="一般笔记" value="general" />
                        <el-option label="重要笔记" value="important" />
                        <el-option label="观察记录" value="observation" />
                        <el-option label="问题记录" value="question" />
                        <el-option label="回答记录" value="answer" />
                    </el-select>
                </el-form-item>

                <el-form-item label="标签">
                    <el-tag v-for="tag in noteForm.tags" :key="tag" closable :disable-transitions="false"
                        @close="handleTagClose(tag)" class="note-tag">
                        {{ tag }}
                    </el-tag>

                    <el-input v-if="tagInputVisible" ref="tagInputRef" v-model="tagInputValue" class="tag-input"
                        size="small" @keyup.enter="handleTagInputConfirm" @blur="handleTagInputConfirm" />

                    <el-button v-else class="button-new-tag" size="small" @click="showTagInput">
                        <el-icon>
                            <Plus />
                        </el-icon> 添加标签
                    </el-button>
                </el-form-item>
            </el-form>

            <template #footer>
                <span>
                    <el-button @click="addNoteDialogVisible = false">取消</el-button>
                    <el-button type="primary" @click="handleAddNote(noteFormRef)">
                        保存笔记
                    </el-button>
                </span>
            </template>
        </el-dialog>
    </div>
</template>

<script setup>
import { ref, nextTick, defineProps, defineEmits } from 'vue'
import { Edit, Plus } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const props = defineProps({
    interviewId: {
        type: [String, Number],
        required: true
    },
    disabled: {
        type: Boolean,
        default: false
    }
})

const emit = defineEmits(['add-note'])

// 状态
const addNoteDialogVisible = ref(false)
const noteFormRef = ref(null)
const noteForm = ref({
    title: '',
    content: '',
    type: 'general',
    tags: []
})

// 标签相关
const tagInputVisible = ref(false)
const tagInputValue = ref('')
const tagInputRef = ref(null)

// 表单验证规则
const noteRules = {
    content: [
        { required: true, message: '请输入笔记内容', trigger: 'blur' },
        { min: 2, max: 500, message: '笔记内容长度在2到500个字符之间', trigger: 'blur' }
    ],
    type: [
        { required: true, message: '请选择笔记类型', trigger: 'change' }
    ]
}

// 显示添加笔记对话框
const showAddNoteDialog = () => {
    // 重置表单
    noteForm.value = {
        title: '',
        content: '',
        type: 'general',
        tags: []
    }

    addNoteDialogVisible.value = true
}

// 添加笔记
const handleAddNote = async (formEl) => {
    if (!formEl) return

    await formEl.validate((valid, fields) => {
        if (valid) {
            // 触发添加笔记事件
            emit('add-note', {
                title: noteForm.value.title,
                content: noteForm.value.content,
                type: noteForm.value.type,
                tags: noteForm.value.tags
            })

            // 关闭对话框
            addNoteDialogVisible.value = false

            ElMessage.success('笔记添加成功')
        } else {
            console.log('表单验证失败:', fields)
        }
    })
}

// 标签相关方法
const handleTagClose = (tag) => {
    noteForm.value.tags.splice(noteForm.value.tags.indexOf(tag), 1)
}

const showTagInput = () => {
    tagInputVisible.value = true
    nextTick(() => {
        tagInputRef.value?.focus()
    })
}

const handleTagInputConfirm = () => {
    if (tagInputValue.value) {
        // 检查是否已存在该标签
        if (!noteForm.value.tags.includes(tagInputValue.value)) {
            noteForm.value.tags.push(tagInputValue.value)
        }
    }
    tagInputVisible.value = false
    tagInputValue.value = ''
}
</script>

<style scoped>
.notes-panel {
    background-color: #fff;
    border-radius: 4px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
    padding: 16px;

    .panel-header {
        display: flex;
        justify-content: space-between;
        align-items: center;

        .panel-title {
            margin: 0;
            font-size: 16px;
            font-weight: 500;
        }
    }

    .note-tag {
        margin-right: 6px;
        margin-bottom: 6px;
    }

    .tag-input {
        width: 100px;
        margin-right: 6px;
        vertical-align: bottom;
    }

    .button-new-tag {
        margin-bottom: 6px;
    }
}
</style>