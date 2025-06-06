/**
 * 导出工具函数
 */
import { ElMessage } from 'element-plus'

/**
 * 保存文件到本地
 * @param {Blob} blob - 文件Blob对象
 * @param {string} filename - 文件名
 */
export function saveFile(blob, filename) {
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(link.href)
}

/**
 * 处理导出响应
 * @param {Object} response - axios响应对象
 * @param {string} filename - 导出文件名
 * @param {string} type - 文件类型
 */
export function handleExportResponse(response, filename, type) {
    try {
        // 确保有文件扩展名
        const extension = getFileExtension(type)
        if (!filename.endsWith(extension)) {
            filename = `${filename}${extension}`
        }

        const blob = new Blob([response.data], { type: getMimeType(type) })
        saveFile(blob, filename)
        ElMessage.success('导出成功')
    } catch (error) {
        console.error('导出文件处理失败', error)
        ElMessage.error('导出失败，请重试')
    }
}

/**
 * 获取文件扩展名
 * @param {string} type - 文件类型
 * @returns {string} 文件扩展名
 */
function getFileExtension(type) {
    const typeMap = {
        'excel': '.xlsx',
        'csv': '.csv',
        'pdf': '.pdf',
        'word': '.docx',
        'html': '.html'
    }
    return typeMap[type.toLowerCase()] || ''
}

/**
 * 获取文件MIME类型
 * @param {string} type - 文件类型
 * @returns {string} MIME类型
 */
function getMimeType(type) {
    const mimeMap = {
        'excel': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'csv': 'text/csv',
        'pdf': 'application/pdf',
        'word': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'html': 'text/html'
    }
    return mimeMap[type.toLowerCase()] || 'application/octet-stream'
}

/**
 * 导出面试记录为Excel
 * @param {Object} data - 记录数据
 * @param {string} filename - 文件名(不包含扩展名)
 */
export function exportToExcel(data, filename = 'interview-records') {
    try {
        import('xlsx').then(XLSX => {
            const worksheet = XLSX.utils.json_to_sheet(data)
            const workbook = XLSX.utils.book_new()
            XLSX.utils.book_append_sheet(workbook, worksheet, 'Records')

            // 生成Excel文件
            const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
            const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })

            saveFile(blob, `${filename}.xlsx`)
            ElMessage.success('导出Excel成功')
        }).catch(error => {
            console.error('Excel导出失败', error)
            ElMessage.error('导出Excel失败，请重试')
        })
    } catch (error) {
        console.error('导出Excel失败', error)
        ElMessage.error('导出Excel失败，请重试')
    }
}

/**
 * 导出为CSV格式
 * @param {Array} data - 数据数组
 * @param {Array} headers - 表头数组
 * @param {string} filename - 文件名(不包含扩展名)
 */
export function exportToCSV(data, headers, filename = 'export-data') {
    try {
        // 生成CSV内容
        let csvContent = ''

        // 添加表头
        if (headers && headers.length) {
            csvContent += headers.join(',') + '\r\n'
        }

        // 添加数据行
        data.forEach(item => {
            const row = headers.map(header => {
                // 处理包含逗号的字段，用双引号包裹
                const field = item[header] !== undefined ? item[header] : ''
                return typeof field === 'string' && field.includes(',')
                    ? `"${field}"`
                    : field
            })
            csvContent += row.join(',') + '\r\n'
        })

        // 创建Blob并下载
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
        saveFile(blob, `${filename}.csv`)
        ElMessage.success('导出CSV成功')
    } catch (error) {
        console.error('导出CSV失败', error)
        ElMessage.error('导出CSV失败，请重试')
    }
}

/**
 * 导出为PDF(基于html2pdf)
 * @param {string|Element} element - 要转换为PDF的HTML元素或ID
 * @param {string} filename - 文件名(不包含扩展名)
 * @param {Object} options - 配置选项
 */
export function exportToPDF(element, filename = 'export-document', options = {}) {
    try {
        // 默认配置
        const defaultOptions = {
            margin: [10, 10, 10, 10],
            filename: `${filename}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        }

        // 合并选项
        const mergedOptions = { ...defaultOptions, ...options }

        // 动态导入html2pdf
        import('html2pdf.js').then(html2pdf => {
            const elementToPrint = typeof element === 'string'
                ? document.getElementById(element)
                : element

            if (!elementToPrint) {
                throw new Error('找不到要导出的元素')
            }

            html2pdf.default()
                .set(mergedOptions)
                .from(elementToPrint)
                .save()
                .then(() => {
                    ElMessage.success('导出PDF成功')
                })
                .catch(error => {
                    console.error('PDF生成失败', error)
                    ElMessage.error('导出PDF失败，请重试')
                })
        }).catch(error => {
            console.error('加载html2pdf失败', error)
            ElMessage.error('导出组件加载失败，请重试')
        })
    } catch (error) {
        console.error('导出PDF失败', error)
        ElMessage.error('导出PDF失败，请重试')
    }
}

/**
 * 简单的文本导出为文件
 * @param {string} text - 要导出的文本内容
 * @param {string} filename - 文件名(包含扩展名)
 * @param {string} type - 文件类型
 */
export function exportTextFile(text, filename, type = 'text/plain') {
    try {
        const blob = new Blob([text], { type })
        saveFile(blob, filename)
        ElMessage.success('导出成功')
    } catch (error) {
        console.error('导出文件失败', error)
        ElMessage.error('导出失败，请重试')
    }
} 