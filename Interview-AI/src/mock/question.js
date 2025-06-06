import Mock from 'mockjs'

// 生成问题模拟数据
const questions = Mock.mock({
    'list|50': [{
        'id|+1': 1,
        'title': '@ctitle(10, 30)',
        'content': '@cparagraph(3, 7)',
        'category': '@pick(["技术基础", "算法", "前端开发", "后端开发", "数据库", "系统设计", "DevOps", "软技能", "项目管理"])',
        'difficulty': '@pick(["easy", "medium", "hard"])',
        'tags|1-3': ['@pick(["JavaScript", "React", "Vue", "Node.js", "Java", "Python", "SQL", "Docker", "Leadership", "Communication"])',],
        'sampleAnswer': '@cparagraph(2, 5)',
        'scorePoints': '@cparagraph(1, 3)',
        'useCount|0-20': 0,
        'createTime': '@datetime("yyyy-MM-dd")',
        'updateTime': '@datetime("yyyy-MM-dd")',
        'createdBy': '@cname',
        'isPublic': '@boolean'
    }]
})

// 问题分类
const categories = [
    { id: 1, name: '技术基础', count: 8 },
    { id: 2, name: '算法', count: 5 },
    { id: 3, name: '前端开发', count: 10 },
    { id: 4, name: '后端开发', count: 9 },
    { id: 5, name: '数据库', count: 6 },
    { id: 6, name: '系统设计', count: 4 },
    { id: 7, name: 'DevOps', count: 3 },
    { id: 8, name: '软技能', count: 3 },
    { id: 9, name: '项目管理', count: 2 }
]

// 问题标签
const tags = [
    { id: 1, name: 'JavaScript', count: 12 },
    { id: 2, name: 'React', count: 8 },
    { id: 3, name: 'Vue', count: 7 },
    { id: 4, name: 'Node.js', count: 5 },
    { id: 5, name: 'Java', count: 9 },
    { id: 6, name: 'Python', count: 8 },
    { id: 7, name: 'SQL', count: 6 },
    { id: 8, name: 'Docker', count: 4 },
    { id: 9, name: 'Leadership', count: 3 },
    { id: 10, name: 'Communication', count: 4 }
]

// 获取问题列表
Mock.mock(/\/api\/questions(\?.+)?$/, 'get', (options) => {
    const { url } = options
    const params = new URLSearchParams(url.split('?')[1] || '')
    const pageSize = parseInt(params.get('pageSize') || '10')
    const currentPage = parseInt(params.get('currentPage') || '1')
    const category = params.get('category')
    const difficulty = params.get('difficulty')
    const keyword = params.get('keyword')

    let list = [...questions.list]

    // 按分类筛选
    if (category) {
        list = list.filter(item => item.category === category)
    }

    // 按难度筛选
    if (difficulty) {
        list = list.filter(item => item.difficulty === difficulty)
    }

    // 按关键词搜索
    if (keyword) {
        const regex = new RegExp(keyword, 'i')
        list = list.filter(item => regex.test(item.title) || regex.test(item.content))
    }

    // 计算分页
    const total = list.length
    const start = (currentPage - 1) * pageSize
    const end = Math.min(start + pageSize, total)
    const pageList = list.slice(start, end)

    return {
        code: 0,
        message: '获取问题列表成功',
        data: {
            list: pageList,
            total,
            pageSize,
            currentPage
        }
    }
})

// 获取问题详情
Mock.mock(/\/api\/questions\/\d+$/, 'get', (options) => {
    const id = options.url.match(/\/api\/questions\/(\d+)/)[1]
    const question = questions.list.find(item => item.id.toString() === id)

    if (!question) {
        return {
            code: 1,
            message: '问题不存在'
        }
    }

    return {
        code: 0,
        message: '获取问题详情成功',
        data: question
    }
})

// 创建问题
Mock.mock(/\/api\/questions$/, 'post', (options) => {
    const newQuestion = JSON.parse(options.body)
    const id = questions.list.length + 1

    const createdQuestion = {
        id,
        ...newQuestion,
        createTime: Mock.mock('@datetime("yyyy-MM-dd")'),
        updateTime: Mock.mock('@datetime("yyyy-MM-dd")'),
        createdBy: '当前用户',
        useCount: 0
    }

    questions.list.unshift(createdQuestion)

    return {
        code: 0,
        message: '创建问题成功',
        data: createdQuestion
    }
})

// 更新问题
Mock.mock(/\/api\/questions\/\d+$/, 'put', (options) => {
    const id = options.url.match(/\/api\/questions\/(\d+)/)[1]
    const updateData = JSON.parse(options.body)
    const index = questions.list.findIndex(item => item.id.toString() === id)

    if (index === -1) {
        return {
            code: 1,
            message: '问题不存在'
        }
    }

    // 更新数据
    questions.list[index] = {
        ...questions.list[index],
        ...updateData,
        updateTime: Mock.mock('@datetime("yyyy-MM-dd")')
    }

    return {
        code: 0,
        message: '更新问题成功',
        data: questions.list[index]
    }
})

// 删除问题
Mock.mock(/\/api\/questions\/\d+$/, 'delete', (options) => {
    const id = options.url.match(/\/api\/questions\/(\d+)/)[1]
    const index = questions.list.findIndex(item => item.id.toString() === id)

    if (index === -1) {
        return {
            code: 1,
            message: '问题不存在'
        }
    }

    // 删除数据
    questions.list.splice(index, 1)

    return {
        code: 0,
        message: '删除问题成功'
    }
})

// 获取问题分类
Mock.mock(/\/api\/questions\/categories/, 'get', () => {
    return {
        code: 0,
        message: '获取问题分类成功',
        data: categories
    }
})

// 获取问题标签
Mock.mock(/\/api\/questions\/tags/, 'get', () => {
    return {
        code: 0,
        message: '获取问题标签成功',
        data: tags
    }
}) 