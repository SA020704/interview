import { defineStore } from 'pinia'
import { getCandidateList, getCandidateDetail, createCandidate, updateCandidate, deleteCandidate } from '@/api/candidate'

export const useCandidateStore = defineStore('candidate', {
    state: () => ({
        // 候选人列表
        candidateList: [],
        // 当前候选人
        currentCandidate: null,
        // 候选人总数
        total: 0,
        // 加载状态
        loading: false
    }),

    getters: {
        // 按职位分组的候选人
        candidatesByPosition: (state) => {
            const result = {}
            state.candidateList.forEach(candidate => {
                const position = candidate.position || '未分类'
                if (!result[position]) {
                    result[position] = []
                }
                result[position].push(candidate)
            })
            return result
        },

        // 按状态分组的候选人数量
        candidateStatusCount: (state) => {
            const statusCount = {
                pending: 0,
                interviewing: 0,
                passed: 0,
                rejected: 0,
                onboarded: 0
            }

            state.candidateList.forEach(candidate => {
                if (statusCount[candidate.status] !== undefined) {
                    statusCount[candidate.status]++
                }
            })

            return statusCount
        }
    },

    actions: {
        // 获取候选人列表
        async fetchCandidateList(params) {
            this.loading = true
            try {
                const { data } = await getCandidateList(params)
                this.candidateList = data.list
                this.total = data.total
                return Promise.resolve(data)
            } catch (error) {
                return Promise.reject(error)
            } finally {
                this.loading = false
            }
        },

        // 获取候选人详情
        async fetchCandidateDetail(id) {
            this.loading = true
            try {
                const { data } = await getCandidateDetail(id)
                this.currentCandidate = data
                return Promise.resolve(data)
            } catch (error) {
                return Promise.reject(error)
            } finally {
                this.loading = false
            }
        },

        // 创建候选人
        async createCandidate(candidateData) {
            try {
                const { data } = await createCandidate(candidateData)
                this.candidateList.unshift(data)
                this.total++
                return Promise.resolve(data)
            } catch (error) {
                return Promise.reject(error)
            }
        },

        // 更新候选人
        async updateCandidate(id, candidateData) {
            try {
                const { data } = await updateCandidate(id, candidateData)
                // 更新候选人列表
                const index = this.candidateList.findIndex(item => item.id === id)
                if (index !== -1) {
                    this.candidateList[index] = { ...this.candidateList[index], ...data }
                }

                // 如果当前正在查看该候选人，也更新当前候选人
                if (this.currentCandidate && this.currentCandidate.id === id) {
                    this.currentCandidate = { ...this.currentCandidate, ...data }
                }

                return Promise.resolve(data)
            } catch (error) {
                return Promise.reject(error)
            }
        },

        // 删除候选人
        async deleteCandidate(id) {
            try {
                await deleteCandidate(id)
                // 从列表中移除
                const index = this.candidateList.findIndex(item => item.id === id)
                if (index !== -1) {
                    this.candidateList.splice(index, 1)
                    this.total--
                }

                // 如果当前正在查看该候选人，清空当前候选人
                if (this.currentCandidate && this.currentCandidate.id === id) {
                    this.currentCandidate = null
                }

                return Promise.resolve()
            } catch (error) {
                return Promise.reject(error)
            }
        },

        // 设置当前候选人
        setCurrentCandidate(candidate) {
            this.currentCandidate = candidate
        },

        // 清空当前候选人
        clearCurrentCandidate() {
            this.currentCandidate = null
        }
    }
}) 