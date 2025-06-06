import request from '@/utils/request'

/**
 * 获取问题列表
 * @param {Object} params - 查询参数
 * @returns {Promise}
 */
export function getQuestionList(params) {
    return request({
        url: '/questions',
        method: 'get',
        params
    })
}

/**
 * 获取问题详情
 * @param {String|Number} id - 问题ID
 * @returns {Promise}
 */
export function getQuestionDetail(id) {
    return request({
        url: `/questions/${id}`,
        method: 'get'
    })
}

/**
 * 创建问题
 * @param {Object} data - 问题数据
 * @returns {Promise}
 */
export function createQuestion(data) {
    return request({
        url: '/questions',
        method: 'post',
        data
    })
}

/**
 * 更新问题
 * @param {String|Number} id - 问题ID
 * @param {Object} data - 问题数据
 * @returns {Promise}
 */
export function updateQuestion(id, data) {
    return request({
        url: `/questions/${id}`,
        method: 'put',
        data
    })
}

/**
 * 删除问题
 * @param {String|Number} id - 问题ID
 * @returns {Promise}
 */
export function deleteQuestion(id) {
    return request({
        url: `/questions/${id}`,
        method: 'delete'
    })
}

/**
 * 获取问题分类列表
 * @returns {Promise}
 */
export function getQuestionCategories() {
    return request({
        url: '/questions/categories',
        method: 'get'
    })
}

/**
 * 获取问题标签列表
 * @returns {Promise}
 */
export function getQuestionTags() {
    return request({
        url: '/questions/tags',
        method: 'get'
    })
}

/**
 * 获取常用问题列表
 * @param {Number} limit - 限制返回数量
 * @returns {Promise}
 */
export function getFrequentlyUsedQuestions(limit = 10) {
    return request({
        url: '/questions/frequently-used',
        method: 'get',
        params: { limit }
    })
}

/**
 * 批量导入问题
 * @param {Array} data - 问题数据数组
 * @returns {Promise}
 */
export function batchImportQuestions(data) {
    return request({
        url: '/questions/batch',
        method: 'post',
        data
    })
}

/**
 * 导出问题
 * @param {Object} params - 查询参数
 * @returns {Promise}
 */
export function exportQuestions(params) {
    return request({
        url: '/questions/export',
        method: 'get',
        params,
        responseType: 'blob'
    })
} 