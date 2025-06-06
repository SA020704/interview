import { defineStore } from 'pinia'
import {
    getInterviewList,
    getInterviewDetail,
    createInterview,
    updateInterview,
    deleteInterview,
    getInterviewStatistics
} from '@/api/interview'

export const useInterviewStore = defineStore('interview', {
    state: () => ({
        // 面试列表
        interviewList: [],
        // 当前面试
        currentInterview: null,
        // 面试记录
        interviewRecord: [],
        // 面试问题列表
        questionList: [],
        // 面试状态：准备中、进行中、已结束
        status: 'pending',
        // 录音状态：开始、暂停、停止
        recordStatus: 'stopped',
        // 面试时长（秒）
        duration: 0,
        // 面试进度
        progress: 0,
        // AI分析结果
        analysis: null,
        // 面试评分
        score: null,
        statistics: null,
        loading: false,
        total: 0,
        listQuery: {
            page: 1,
            limit: 10,
            status: null,
            type: null,
            keyword: ''
        }
    }),

    getters: {
        // 获取进行中的面试
        activeInterviews: (state) => state.interviewList.filter(item => item.status === 'active'),
        // 获取已完成的面试
        completedInterviews: (state) => state.interviewList.filter(item => item.status === 'completed'),
        // 获取面试进度百分比
        progressPercent: (state) => Math.round(state.progress * 100) + '%',
        // 获取未使用的问题
        unusedQuestions: (state) => state.questionList.filter(q => !q.used),
        // 获取已使用的问题
        usedQuestions: (state) => state.questionList.filter(q => q.used),
        getInterviewById: (state) => (id) => {
            return state.interviewList.find(item => item.id === id) || null
        },

        pendingInterviewsCount: (state) => {
            return state.interviewList.filter(item => item.status === 'pending').length
        },

        completedInterviewsCount: (state) => {
            return state.interviewList.filter(item => item.status === 'completed').length
        }
    },

    actions: {
        // 获取面试列表
        async fetchInterviewList(query = {}) {
            this.loading = true
            try {
                // 合并查询参数
                const params = { ...this.listQuery, ...query }
                this.listQuery = params

                const response = await getInterviewList(params)
                this.interviewList = response.data.items
                this.total = response.data.total
                return response
            } catch (error) {
                console.error('获取面试列表失败:', error)
                throw error
            } finally {
                this.loading = false
            }
        },

        // 获取面试详情
        async fetchInterviewDetail(id) {
            this.loading = true
            try {
                const response = await getInterviewDetail(id)
                this.currentInterview = response.data
                this.questionList = response.data.questions || []
                this.interviewRecord = response.data.record || []
                return response
            } catch (error) {
                console.error('获取面试详情失败:', error)
                throw error
            } finally {
                this.loading = false
            }
        },

        // 创建面试
        async createInterview(data) {
            this.loading = true
            try {
                const response = await createInterview(data)

                // 如果请求成功，更新列表
                if (response.data) {
                    this.fetchInterviewList()
                }

                return response
            } catch (error) {
                console.error('创建面试失败:', error)
                throw error
            } finally {
                this.loading = false
            }
        },

        // 更新面试
        async updateInterview(id, data) {
            this.loading = true
            try {
                const response = await updateInterview(id, data)

                // 如果请求成功，更新当前面试和列表
                if (response.data) {
                    if (this.currentInterview && this.currentInterview.id === id) {
                        this.currentInterview = { ...this.currentInterview, ...data }
                    }

                    // 更新列表中的对应项
                    const index = this.interviewList.findIndex(item => item.id === id)
                    if (index !== -1) {
                        this.interviewList[index] = { ...this.interviewList[index], ...data }
                    }
                }

                return response
            } catch (error) {
                console.error('更新面试失败:', error)
                throw error
            } finally {
                this.loading = false
            }
        },

        // 删除面试
        async deleteInterview(id) {
            this.loading = true
            try {
                const response = await deleteInterview(id)

                // 如果请求成功，从列表中移除
                if (response.data) {
                    this.interviewList = this.interviewList.filter(item => item.id !== id)

                    // 如果当前面试是被删除的面试，清空当前面试
                    if (this.currentInterview && this.currentInterview.id === id) {
                        this.currentInterview = null
                    }
                }

                return response
            } catch (error) {
                console.error('删除面试失败:', error)
                throw error
            } finally {
                this.loading = false
            }
        },

        // 获取统计数据
        async fetchStatistics() {
            this.loading = true
            try {
                const response = await getInterviewStatistics()
                this.statistics = response.data
                return response
            } catch (error) {
                console.error('获取统计数据失败:', error)
                throw error
            } finally {
                this.loading = false
            }
        },

        // 重置当前面试
        resetCurrentInterview() {
            this.currentInterview = null
            this.questionList = []
            this.interviewRecord = []
            this.status = 'pending'
            this.recordStatus = 'stopped'
            this.duration = 0
            this.progress = 0
            this.analysis = null
            this.score = null
        },

        // 清空列表
        resetList() {
            this.interviewList = []
            this.total = 0
        },

        // 重置查询参数
        resetQuery() {
            this.listQuery = {
                page: 1,
                limit: 10,
                status: null,
                type: null,
                keyword: ''
            }
        },

        // 开始面试
        startInterview() {
            this.status = 'active'
            this.recordStatus = 'recording'
            this.duration = 0
        },

        // 暂停面试
        pauseInterview() {
            this.recordStatus = 'paused'
        },

        // 恢复面试
        resumeInterview() {
            this.recordStatus = 'recording'
        },

        // 结束面试
        endInterview() {
            this.status = 'completed'
            this.recordStatus = 'stopped'
        },

        // 添加面试记录
        addRecord(record) {
            this.interviewRecord.push({
                ...record,
                timestamp: new Date().toISOString()
            })
        },

        // 使用问题
        useQuestion(questionId) {
            const index = this.questionList.findIndex(q => q.id === questionId)
            if (index !== -1) {
                this.questionList[index].used = true
            }
        },

        // 更新面试时长
        updateDuration(seconds) {
            this.duration = seconds
        },

        // 更新面试进度
        updateProgress(progress) {
            this.progress = Math.min(1, Math.max(0, progress))
        },

        // 设置分析结果
        setAnalysis(analysis) {
            this.analysis = analysis
        },

        // 设置面试评分
        setScore(score) {
            this.score = score
        }
    }
}) 