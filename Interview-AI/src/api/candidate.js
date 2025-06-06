import request from '@/utils/request'

/**
 * 获取候选人列表
 * @param {Object} params - 查询参数
 */
export function getCandidateList(params) {
    return request({
        url: '/candidate/list',
        method: 'get',
        params
    })
}

/**
 * 获取候选人详情
 * @param {String} id - 候选人ID
 */
export function getCandidateDetail(id) {
    return request({
        url: `/candidate/${id}`,
        method: 'get'
    })
}

/**
 * 创建候选人
 * @param {Object} data - 候选人数据
 */
export function createCandidate(data) {
    return request({
        url: '/candidate',
        method: 'post',
        data
    })
}

/**
 * 更新候选人
 * @param {String} id - 候选人ID
 * @param {Object} data - 候选人数据
 */
export function updateCandidate(id, data) {
    return request({
        url: `/candidate/${id}`,
        method: 'put',
        data
    })
}

/**
 * 删除候选人
 * @param {String} id - 候选人ID
 */
export function deleteCandidate(id) {
    return request({
        url: `/candidate/${id}`,
        method: 'delete'
    })
}

/**
 * 上传候选人简历
 * @param {FormData} data - 包含文件的表单数据
 */
export function uploadResume(data) {
    return request({
        url: '/candidate/resume/upload',
        method: 'post',
        data,
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    })
}

/**
 * 解析简历内容
 * @param {String} id - 候选人ID
 */
export function parseResume(id) {
    return request({
        url: `/candidate/${id}/resume/parse`,
        method: 'post'
    })
}

/**
 * 获取候选人统计数据
 */
export function getCandidateStats() {
    return request({
        url: '/candidate/stats',
        method: 'get'
    })
}

/**
 * 批量导入候选人
 * @param {FormData} data - 包含批量导入文件的表单数据
 */
export function batchImportCandidates(data) {
    return request({
        url: '/candidate/batch-import',
        method: 'post',
        data,
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    })
}

/**
 * 导出候选人数据
 * @param {Object} params - 查询参数
 */
export function exportCandidates(params) {
    return request({
        url: '/candidate/export',
        method: 'get',
        params,
        responseType: 'blob'
    })
} 