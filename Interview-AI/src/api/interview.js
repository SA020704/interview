import request from '@/utils/request'

/**
 * 获取面试列表
 * @param {Object} params - 查询参数
 * @returns {Promise}
 */
export function getInterviewList(params) {
    return request({
        url: '/api/interviews',
        method: 'get',
        params
    })
}

/**
 * 获取面试详情
 * @param {String|Number} id - 面试ID
 * @returns {Promise}
 */
export function getInterviewDetail(id) {
    return request({
        url: `/api/interviews/${id}`,
        method: 'get'
    })
}

/**
 * 创建面试
 * @param {Object} data - 面试数据
 * @returns {Promise}
 */
export function createInterview(data) {
    return request({
        url: '/api/interviews',
        method: 'post',
        data
    })
}

/**
 * 更新面试
 * @param {String|Number} id - 面试ID
 * @param {Object} data - 面试数据
 * @returns {Promise}
 */
export function updateInterview(id, data) {
    return request({
        url: `/api/interviews/${id}`,
        method: 'put',
        data
    })
}

/**
 * 删除面试
 * @param {String|Number} id - 面试ID
 * @returns {Promise}
 */
export function deleteInterview(id) {
    return request({
        url: `/api/interviews/${id}`,
        method: 'delete'
    })
}

/**
 * 获取面试统计数据
 * @returns {Promise}
 */
export function getInterviewStatistics() {
    return request({
        url: '/api/interviews/statistics',
        method: 'get'
    })
}

/**
 * 开始面试
 * @param {String|Number} id - 面试ID
 * @returns {Promise}
 */
export function startInterview(id) {
    return request({
        url: `/api/interviews/${id}/start`,
        method: 'post'
    })
}

/**
 * 暂停面试
 * @param {String|Number} id - 面试ID
 * @returns {Promise}
 */
export function pauseInterview(id) {
    return request({
        url: `/api/interviews/${id}/pause`,
        method: 'post'
    })
}

/**
 * 恢复面试
 * @param {String|Number} id - 面试ID
 * @returns {Promise}
 */
export function resumeInterview(id) {
    return request({
        url: `/api/interviews/${id}/resume`,
        method: 'post'
    })
}

/**
 * 完成面试
 * @param {String|Number} id - 面试ID
 * @param {Object} data - 面试数据
 * @returns {Promise}
 */
export function completeInterview(id, data) {
    return request({
        url: `/api/interviews/${id}/complete`,
        method: 'post',
        data
    })
}

/**
 * 获取面试记录
 * @param {String|Number} id - 面试ID
 * @returns {Promise}
 */
export function getInterviewRecords(id) {
    return request({
        url: `/api/interviews/${id}/records`,
        method: 'get'
    })
}

/**
 * 添加面试记录
 * @param {String|Number} id - 面试ID
 * @param {Object} data - 记录数据
 * @returns {Promise}
 */
export function addInterviewRecord(id, data) {
    return request({
        url: `/api/interviews/${id}/records`,
        method: 'post',
        data
    })
}

/**
 * 添加面试笔记
 * @param {String|Number} id - 面试ID
 * @param {Object} data - 笔记数据
 * @returns {Promise}
 */
export function addInterviewNote(id, data) {
    return request({
        url: `/api/interviews/${id}/notes`,
        method: 'post',
        data
    })
}

/**
 * 获取AI推荐问题
 * @param {String|Number} id - 面试ID
 * @returns {Promise}
 */
export function getAIRecommendations(id) {
    return request({
        url: `/api/interviews/${id}/recommendations`,
        method: 'get'
    })
}

/**
 * 获取AI分析
 * @param {String|Number} id - 面试ID
 * @returns {Promise}
 */
export function getAIAnalysis(id) {
    return request({
        url: `/api/interviews/${id}/analysis`,
        method: 'get'
    })
}

/**
 * 提交面试评估
 * @param {String|Number} id - 面试ID
 * @param {Object} data - 评估数据
 * @returns {Promise}
 */
export function submitInterviewEvaluation(id, data) {
    return request({
        url: `/api/interviews/${id}/evaluation`,
        method: 'post',
        data
    })
}

/**
 * 获取面试评估
 * @param {String|Number} id - 面试ID
 * @returns {Promise}
 */
export function getInterviewEvaluation(id) {
    return request({
        url: `/api/interviews/${id}/evaluation`,
        method: 'get'
    })
}

/**
 * 导出面试记录
 * @param {String|Number} id - 面试ID
 * @param {Object} params - 导出参数
 * @returns {Promise}
 */
export function exportInterviewRecord(id, params) {
    return request({
        url: `/api/interviews/${id}/export`,
        method: 'get',
        params,
        responseType: 'blob'
    })
}

/**
 * 获取面试质量分析
 * @param {String|Number} id - 面试ID
 * @returns {Promise}
 */
export function getInterviewQualityAnalysis(id) {
    return request({
        url: `/api/interviews/${id}/quality-analysis`,
        method: 'get'
    })
}

/**
 * 获取面试摘要信息
 * @param {string|number} interviewId - 面试ID
 * @param {object} params - 请求参数
 * @param {string} params.type - 摘要类型 (executive, detailed, full)
 * @returns {Promise<Object>} 面试摘要数据
 */
export function getInterviewSummary(interviewId, params) {
    return request({
        url: `/api/interviews/${interviewId}/summary`,
        method: 'get',
        params
    })
}

/**
 * 获取团队评估数据
 * @param {String|Number} id - 面试ID
 * @returns {Promise}
 */
export function getTeamEvaluation(id) {
    return request({
        url: `/api/interviews/${id}/team-evaluation`,
        method: 'get'
    })
}

/**
 * 生成面试报告
 * @param {String|Number} id - 面试ID
 * @param {Object} data - 报告配置数据
 * @returns {Promise}
 */
export function generateInterviewReport(id, data) {
    return request({
        url: `/api/interviews/${id}/report`,
        method: 'post',
        data
    })
}

/**
 * 获取报告模板列表
 * @returns {Promise}
 */
export function getReportTemplates() {
    return request({
        url: '/api/report-templates',
        method: 'get'
    })
}

/**
 * 共享面试报告
 * @param {String|Number} id - 面试ID
 * @param {Object} data - 共享设置
 * @returns {Promise}
 */
export function shareInterviewReport(id, data) {
    return request({
        url: `/api/interviews/${id}/share`,
        method: 'post',
        data
    })
}

// 问题管理相关接口
export function getQuestionList(params) {
    return request({
        url: '/api/questions',
        method: 'get',
        params
    })
}

export function getQuestionDetail(id) {
    return request({
        url: `/api/questions/${id}`,
        method: 'get'
    })
} 