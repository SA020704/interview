import { defineStore } from 'pinia'
import { getQuestionList, getQuestionDetail, createQuestion, updateQuestion, deleteQuestion } from '@/api/question'

export const useQuestionStore = defineStore('question', {
    state: () => ({
        // 问题列表
        questionList: [],
        // 当前问题
        currentQuestion: null,
        // 问题分类
        categories: [],
        // 问题标签
        tags: [],
        // 问题总数
        total: 0,
        // 加载状态
        loading: false
    }),

    getters: {
        // 按分类分组的问题
        questionsByCategory: (state) => {
            const result = {}
            state.questionList.forEach(question => {
                const category = question.category || '未分类'
                if (!result[category]) {
                    result[category] = []
                }
                result[category].push(question)
            })
            return result
        },

        // 按难度分组的问题
        questionsByDifficulty: (state) => {
            const result = {
                easy: [],
                medium: [],
                hard: []
            }

            state.questionList.forEach(question => {
                if (result[question.difficulty]) {
                    result[question.difficulty].push(question)
                }
            })

            return result
        },

        // 获取常用问题
        frequentlyUsedQuestions: (state) => {
            return state.questionList.filter(q => q.useCount > 5).sort((a, b) => b.useCount - a.useCount)
        }
    },

    actions: {
        // 获取问题列表
        async fetchQuestionList(params) {
            this.loading = true
            try {
                const { data } = await getQuestionList(params)
                this.questionList = data.list
                this.total = data.total
                return Promise.resolve(data)
            } catch (error) {
                return Promise.reject(error)
            } finally {
                this.loading = false
            }
        },

        // 获取问题详情
        async fetchQuestionDetail(id) {
            this.loading = true
            try {
                const { data } = await getQuestionDetail(id)
                this.currentQuestion = data
                return Promise.resolve(data)
            } catch (error) {
                return Promise.reject(error)
            } finally {
                this.loading = false
            }
        },

        // 创建问题
        async createQuestion(questionData) {
            try {
                const { data } = await createQuestion(questionData)
                this.questionList.unshift(data)
                this.total++
                return Promise.resolve(data)
            } catch (error) {
                return Promise.reject(error)
            }
        },

        // 更新问题
        async updateQuestion(id, questionData) {
            try {
                const { data } = await updateQuestion(id, questionData)
                // 更新问题列表
                const index = this.questionList.findIndex(item => item.id === id)
                if (index !== -1) {
                    this.questionList[index] = { ...this.questionList[index], ...data }
                }

                // 如果当前正在查看该问题，也更新当前问题
                if (this.currentQuestion && this.currentQuestion.id === id) {
                    this.currentQuestion = { ...this.currentQuestion, ...data }
                }

                return Promise.resolve(data)
            } catch (error) {
                return Promise.reject(error)
            }
        },

        // 删除问题
        async deleteQuestion(id) {
            try {
                await deleteQuestion(id)
                // 从列表中移除
                const index = this.questionList.findIndex(item => item.id === id)
                if (index !== -1) {
                    this.questionList.splice(index, 1)
                    this.total--
                }

                // 如果当前正在查看该问题，清空当前问题
                if (this.currentQuestion && this.currentQuestion.id === id) {
                    this.currentQuestion = null
                }

                return Promise.resolve()
            } catch (error) {
                return Promise.reject(error)
            }
        },

        // 获取问题分类
        async fetchCategories() {
            try {
                const { data } = await getQuestionCategories()
                this.categories = data
                return Promise.resolve(data)
            } catch (error) {
                return Promise.reject(error)
            }
        },

        // 获取问题标签
        async fetchTags() {
            try {
                const { data } = await getQuestionTags()
                this.tags = data
                return Promise.resolve(data)
            } catch (error) {
                return Promise.reject(error)
            }
        },

        // 设置当前问题
        setCurrentQuestion(question) {
            this.currentQuestion = question
        },

        // 清空当前问题
        clearCurrentQuestion() {
            this.currentQuestion = null
        }
    }
}) 