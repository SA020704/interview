<template>
    <div class="note-panel">
        <!-- 笔记列表 -->
        <div class="notes-list" v-if="notes.length > 0">
            <div v-for="(note, index) in sortedNotes" :key="note.id" class="note-item"
                :class="{ 'is-editing': editingNoteId === note.id }">
                <div v-if="editingNoteId === note.id" class="note-edit-form">
                    <el-input v-model="editNoteForm.content" type="textarea" :rows="3" placeholder="输入笔记内容"
                        resize="none" />

                    <div class="form-footer">
                        <div class="tag-selector">
                            <el-select v-model="editNoteForm.category" placeholder="选择分类" size="small">
                                <el-option v-for="category in noteCategories" :key="category.value"
                                    :label="category.label" :value="category.value" />
                            </el-select>
                        </div>

                        <div class="form-actions">
                            <el-button type="primary" size="small" @click="saveNote">保存</el-button>
                            <el-button size="small" @click="cancelEdit">取消</el-button>
                        </div>
                    </div>
                </div>

                <div v-else class="note-content">
                    <div class="note-header">
                        <div class="note-info">
                            <el-tag size="small" :type="getNoteTagType(note.category)">
                                {{ getNoteCategoryLabel(note.category) }}
                            </el-tag>
                            <span class="note-time">{{ formatTime(note.timestamp) }}</span>
                        </div>

                        <div class="note-actions">
                            <el-button type="text" size="small" @click="editNote(note)" title="编辑">
                                <el-icon>
                                    <Edit />
                                </el-icon>
                            </el-button>
                            <el-button type="text" size="small" @click="confirmDeleteNote(note.id)" title="删除">
                                <el-icon>
                                    <Delete />
                                </el-icon>
                            </el-button>
                        </div>
                    </div>

                    <div class="note-text">{{ note.content }}</div>

                    <div v-if="note.relatedQuestion" class="related-question">
                        <el-icon>
                            <Connection />
                        </el-icon>
                        <span>关联问题：{{ note.relatedQuestion }}</span>
                    </div>
                </div>
            </div>
        </div>

        <!-- 无笔记时的空状态 -->
        <div v-else class="empty-notes">
            <el-empty description="暂无笔记，点击下方按钮添加第一条笔记">
                <template #image>
                    <el-icon class="empty-icon">
                        <DocumentRemove />
                    </el-icon>
                </template>
            </el-empty>
        </div>

        <!-- 添加笔记按钮 -->
        <div class="add-note-button" v-if="!isAddingNote">
            <el-button type="primary" @click="showAddNoteForm">
                <el-icon>
                    <Plus />
                </el-icon> 添加笔记
            </el-button>
        </div>

        <!-- 添加笔记表单 -->
        <div class="add-note-form" v-if="isAddingNote">
            <el-input v-model="newNote.content" type="textarea" :rows="3" placeholder="输入笔记内容" resize="none" />

            <div class="form-footer">
                <div class="tag-selector">
                    <el-select v-model="newNote.category" placeholder="选择分类" size="small">
                        <el-option v-for="category in noteCategories" :key="category.value" :label="category.label"
                            :value="category.value" />
                    </el-select>

                    <el-checkbox v-model="newNote.important">重要</el-checkbox>
                </div>

                <div class="form-actions">
                    <el-button type="primary" size="small" @click="addNote">添加</el-button>
                    <el-button size="small" @click="cancelAddNote">取消</el-button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, reactive } from 'vue'
import { ElMessageBox } from 'element-plus'
import { Edit, Delete, Plus, Connection, DocumentRemove } from '@element-plus/icons-vue'

// 定义属性
const props = defineProps({
    notes: {
        type: Array,
        default: () => []
    }
})

// 定义事件
const emit = defineEmits([
    'add-note',
    'update-note',
    'delete-note'
])

// 内部状态
const isAddingNote = ref(false)
const editingNoteId = ref(null)
const editNoteForm = reactive({
    id: null,
    content: '',
    category: 'general',
    important: false
})

// 新笔记表单
const newNote = reactive({
    content: '',
    category: 'general',
    important: false,
    timestamp: new Date().toISOString()
})

// 笔记分类选项
const noteCategories = [
    { label: '一般笔记', value: 'general' },
    { label: '技术评估', value: 'technical' },
    { label: '行为观察', value: 'behavioral' },
    { label: '亮点', value: 'highlight' },
    { label: '疑点', value: 'concern' },
    { label: '跟进问题', value: 'followup' }
]

// 根据分类获取标签类型
const getNoteTagType = (category) => {
    const typeMap = {
        'general': '',
        'technical': 'info',
        'behavioral': 'warning',
        'highlight': 'success',
        'concern': 'danger',
        'followup': 'primary'
    }
    return typeMap[category] || ''
}

// 获取分类显示名称
const getNoteCategoryLabel = (category) => {
    const found = noteCategories.find(item => item.value === category)
    return found ? found.label : '一般笔记'
}

// 格式化时间
const formatTime = (timestamp) => {
    if (!timestamp) return ''

    const date = new Date(timestamp)
    const hours = date.getHours().toString().padStart(2, '0')
    const minutes = date.getMinutes().toString().padStart(2, '0')

    return `${hours}:${minutes}`
}

// 排序后的笔记列表（按时间倒序、重要性）
const sortedNotes = computed(() => {
    return [...props.notes].sort((a, b) => {
        // 首先按重要性排序
        if (a.important && !b.important) return -1
        if (!a.important && b.important) return 1

        // 然后按时间戳倒序排序（新的在前）
        return new Date(b.timestamp) - new Date(a.timestamp)
    })
})

// 显示添加笔记表单
const showAddNoteForm = () => {
    isAddingNote.value = true
    // 重置表单
    newNote.content = ''
    newNote.category = 'general'
    newNote.important = false
}

// 取消添加笔记
const cancelAddNote = () => {
    isAddingNote.value = false
}

// 添加笔记
const addNote = () => {
    if (!newNote.content.trim()) {
        return
    }

    const note = {
        id: Date.now().toString(),
        content: newNote.content,
        category: newNote.category,
        important: newNote.important,
        timestamp: new Date().toISOString()
    }

    emit('add-note', note)
    isAddingNote.value = false

    // 重置表单
    newNote.content = ''
    newNote.category = 'general'
    newNote.important = false
}

// 编辑笔记
const editNote = (note) => {
    editingNoteId.value = note.id

    // 填充编辑表单
    editNoteForm.id = note.id
    editNoteForm.content = note.content
    editNoteForm.category = note.category
    editNoteForm.important = note.important || false
}

// 取消编辑
const cancelEdit = () => {
    editingNoteId.value = null
}

// 保存编辑的笔记
const saveNote = () => {
    if (!editNoteForm.content.trim()) {
        return
    }

    const updatedNote = {
        id: editNoteForm.id,
        content: editNoteForm.content,
        category: editNoteForm.category,
        important: editNoteForm.important,
        timestamp: new Date().toISOString()
    }

    emit('update-note', updatedNote)
    editingNoteId.value = null
}

// 确认删除笔记
const confirmDeleteNote = (noteId) => {
    ElMessageBox.confirm(
        '确定要删除这条笔记吗？',
        '删除笔记',
        {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
        }
    ).then(() => {
        emit('delete-note', noteId)
    }).catch(() => {
        // 用户取消删除
    })
}
</script>

<style scoped>
.note-panel {
    height: 100%;
    display: flex;
    flex-direction: column;

    .notes-list {
        flex: 1;
        overflow-y: auto;
        padding: 8px;
        margin-bottom: 16px;

        .note-item {
            background-color: white;
            border-radius: 8px;
            padding: 12px;
            margin-bottom: 16px;
            box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
            transition: all 0.3s ease;
            border-left: 3px solid transparent;

            &:last-child {
                margin-bottom: 0;
            }

            &.is-editing {
                border-left-color: #409EFF;
            }

            .note-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 8px;

                .note-info {
                    display: flex;
                    align-items: center;
                    gap: 8px;

                    .note-time {
                        font-size: 12px;
                        color: #909399;
                    }
                }

                .note-actions {
                    opacity: 0.5;
                    transition: opacity 0.2s;

                    .el-button {
                        margin-left: 0;
                        padding: 2px 5px;
                    }
                }
            }

            &:hover .note-actions {
                opacity: 1;
            }

            .note-text {
                margin-bottom: 8px;
                font-size: 14px;
                line-height: 1.5;
                color: #303133;
                white-space: pre-wrap;
            }

            .related-question {
                font-size: 12px;
                color: #909399;
                display: flex;
                align-items: center;
                gap: 4px;

                .el-icon {
                    font-size: 14px;
                }
            }

            .note-edit-form {
                .form-footer {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-top: 8px;

                    .tag-selector {
                        display: flex;
                        align-items: center;
                        gap: 8px;
                    }

                    .form-actions {
                        display: flex;
                        gap: 8px;
                    }
                }
            }
        }
    }

    .empty-notes {
        flex: 1;
        display: flex;
        justify-content: center;
        align-items: center;
        margin-bottom: 16px;

        .empty-icon {
            font-size: 60px;
            color: #C0C4CC;
        }
    }

    .add-note-button {
        padding: 12px 0;
        display: flex;
        justify-content: center;
    }

    .add-note-form {
        background-color: white;
        border-radius: 8px;
        padding: 16px;
        box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);

        .form-footer {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-top: 12px;

            .tag-selector {
                display: flex;
                align-items: center;
                gap: 12px;
            }

            .form-actions {
                display: flex;
                gap: 8px;
            }
        }
    }
}
</style>