import Mock from 'mockjs'

// 生成候选人模拟数据
const candidates = Mock.mock({
    'list|30': [{
        'id|+1': 1,
        'name': '@cname',
        'email': '@email',
        'phone': /^1[3-9]\d{9}$/,
        'position': '@pick(["前端开发工程师", "后端开发工程师", "产品经理", "UI设计师", "测试工程师", "运维工程师", "数据分析师"])',
        'status': '@pick(["pending", "interviewing", "passed", "rejected", "onboarded"])',
        'experience|1-10': 0,
        'education': '@pick(["本科", "硕士", "博士", "大专"])',
        'skills|3-6': ['@pick(["JavaScript", "Python", "Java", "C++", "React", "Vue", "Angular", "Node.js", "Spring", "MySQL", "MongoDB", "Redis", "Docker", "Kubernetes", "AWS", "Azure", "GCP"])',],
        'resumeUrl': '@url',
        'createTime': '@datetime("yyyy-MM-dd")',
        'lastUpdate': '@datetime("yyyy-MM-dd")',
        'source': '@pick(["内部推荐", "招聘网站", "猎头", "校园招聘", "社交媒体"])',
        'interviewCount|0-3': 0,
        'expectedSalary|10-40': 0,
        'avatar': 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png'
    }]
})

// 生成候选人简历详情
const resumeDetails = {
    '1': {
        basicInfo: {
            name: '张三',
            gender: '男',
            age: 28,
            email: 'zhangsan@example.com',
            phone: '13800138001',
            address: '北京市海淀区',
            birthdate: '1995-05-15'
        },
        education: [
            {
                school: '北京大学',
                degree: '硕士',
                major: '计算机科学与技术',
                startDate: '2017-09',
                endDate: '2020-07',
                gpa: '3.8/4.0',
                achievements: '获得校级优秀毕业生，参与多项科研项目'
            },
            {
                school: '清华大学',
                degree: '本科',
                major: '软件工程',
                startDate: '2013-09',
                endDate: '2017-07',
                gpa: '3.7/4.0',
                achievements: '获得奖学金两次'
            }
        ],
        workExperience: [
            {
                company: '腾讯科技',
                position: '前端开发工程师',
                startDate: '2020-08',
                endDate: '至今',
                description: '负责企业微信PC端核心功能开发，主导了多个重要项目，提升了30%的用户体验满意度，技术栈包括React、TypeScript、Webpack等。'
            },
            {
                company: '百度',
                position: '前端开发实习生',
                startDate: '2019-06',
                endDate: '2019-12',
                description: '参与百度地图Web端开发，完成了多个页面的重构和性能优化，提升了页面加载速度20%。'
            }
        ],
        projects: [
            {
                name: '企业微信文档协作功能',
                role: '前端负责人',
                startDate: '2021-03',
                endDate: '2021-09',
                description: '设计并实现了企业微信中的文档实时协作功能，支持多人同时编辑、评论和版本控制，大大提高了团队协作效率。',
                technologies: ['React', 'WebSocket', 'Redux', 'TypeScript']
            },
            {
                name: '百度地图POI搜索优化',
                role: '开发工程师',
                startDate: '2019-07',
                endDate: '2019-10',
                description: '优化了百度地图POI搜索功能的前端实现，提升了搜索响应速度和结果准确性。',
                technologies: ['JavaScript', 'Baidu Map API', 'CSS3']
            }
        ],
        skills: [
            {
                category: '编程语言',
                items: ['JavaScript', 'TypeScript', 'HTML5', 'CSS3', 'Python']
            },
            {
                category: '框架',
                items: ['React', 'Vue.js', 'Node.js', 'Express']
            },
            {
                category: '工具',
                items: ['Git', 'Webpack', 'Docker', 'Jenkins', 'Jira']
            },
            {
                category: '其他',
                items: ['英语（流利）', '项目管理', 'UI/UX设计基础']
            }
        ],
        certifications: [
            {
                name: 'AWS 认证解决方案架构师',
                issuer: 'Amazon Web Services',
                issueDate: '2022-01',
                expirationDate: '2025-01'
            }
        ],
        personalStatement: '拥有5年前端开发经验，精通React、Vue等现代前端框架，对Web性能优化有深入研究。善于团队协作，注重代码质量和用户体验，希望加入贵公司，在更大的平台上发挥自己的技术特长。'
    }
}

// 获取候选人列表
Mock.mock(/\/api\/candidate\/list/, 'get', (options) => {
    const { url } = options
    const params = new URLSearchParams(url.split('?')[1])
    const pageSize = parseInt(params.get('pageSize') || '10')
    const currentPage = parseInt(params.get('currentPage') || '1')
    const status = params.get('status')
    const position = params.get('position')

    let list = [...candidates.list]

    // 按状态筛选
    if (status) {
        list = list.filter(item => item.status === status)
    }

    // 按职位筛选
    if (position) {
        list = list.filter(item => item.position === position)
    }

    // 计算分页
    const total = list.length
    const start = (currentPage - 1) * pageSize
    const end = Math.min(start + pageSize, total)
    const pageList = list.slice(start, end)

    return {
        code: 0,
        message: '获取候选人列表成功',
        data: {
            list: pageList,
            total,
            pageSize,
            currentPage
        }
    }
})

// 获取候选人详情
Mock.mock(/\/api\/candidate\/\d+$/, 'get', (options) => {
    const id = options.url.match(/\/api\/candidate\/(\d+)/)[1]
    const candidate = candidates.list.find(item => item.id.toString() === id)

    if (!candidate) {
        return {
            code: 1,
            message: '候选人不存在'
        }
    }

    // 合并基本信息和简历详情（如果有）
    const detail = {
        ...candidate,
        resume: resumeDetails[id] || null
    }

    return {
        code: 0,
        message: '获取候选人详情成功',
        data: detail
    }
})

// 创建候选人
Mock.mock(/\/api\/candidate$/, 'post', (options) => {
    const newCandidate = JSON.parse(options.body)
    const id = candidates.list.length + 1

    const createdCandidate = {
        id,
        ...newCandidate,
        createTime: Mock.mock('@datetime("yyyy-MM-dd")'),
        lastUpdate: Mock.mock('@datetime("yyyy-MM-dd")'),
        status: 'pending',
        interviewCount: 0
    }

    candidates.list.unshift(createdCandidate)

    return {
        code: 0,
        message: '创建候选人成功',
        data: createdCandidate
    }
})

// 更新候选人
Mock.mock(/\/api\/candidate\/\d+$/, 'put', (options) => {
    const id = options.url.match(/\/api\/candidate\/(\d+)/)[1]
    const updateData = JSON.parse(options.body)
    const index = candidates.list.findIndex(item => item.id.toString() === id)

    if (index === -1) {
        return {
            code: 1,
            message: '候选人不存在'
        }
    }

    // 更新数据
    candidates.list[index] = {
        ...candidates.list[index],
        ...updateData,
        lastUpdate: Mock.mock('@datetime("yyyy-MM-dd")')
    }

    return {
        code: 0,
        message: '更新候选人成功',
        data: candidates.list[index]
    }
})

// 删除候选人
Mock.mock(/\/api\/candidate\/\d+$/, 'delete', (options) => {
    const id = options.url.match(/\/api\/candidate\/(\d+)/)[1]
    const index = candidates.list.findIndex(item => item.id.toString() === id)

    if (index === -1) {
        return {
            code: 1,
            message: '候选人不存在'
        }
    }

    // 删除数据
    candidates.list.splice(index, 1)

    return {
        code: 0,
        message: '删除候选人成功'
    }
})

// 上传简历
Mock.mock(/\/api\/candidate\/resume\/upload/, 'post', () => {
    return {
        code: 0,
        message: '上传简历成功',
        data: {
            url: 'https://example.com/resume/12345.pdf'
        }
    }
})

// 解析简历
Mock.mock(/\/api\/candidate\/\d+\/resume\/parse/, 'post', (options) => {
    const id = options.url.match(/\/api\/candidate\/(\d+)\/resume\/parse/)[1]

    return {
        code: 0,
        message: '解析简历成功',
        data: resumeDetails['1'] // 使用示例简历数据
    }
})

// 获取候选人统计数据
Mock.mock(/\/api\/candidate\/stats/, 'get', () => {
    const statusCount = {
        pending: 0,
        interviewing: 0,
        passed: 0,
        rejected: 0,
        onboarded: 0
    }

    // 统计不同状态的候选人数量
    candidates.list.forEach(candidate => {
        if (statusCount[candidate.status] !== undefined) {
            statusCount[candidate.status]++
        }
    })

    // 按职位分组
    const positionGroups = {}
    candidates.list.forEach(candidate => {
        if (!positionGroups[candidate.position]) {
            positionGroups[candidate.position] = 0
        }
        positionGroups[candidate.position]++
    })

    return {
        code: 0,
        message: '获取统计数据成功',
        data: {
            total: candidates.list.length,
            statusCount,
            positionGroups,
            monthlyTrend: [
                { month: '1月', count: 3 },
                { month: '2月', count: 5 },
                { month: '3月', count: 8 },
                { month: '4月', count: 12 },
                { month: '5月', count: 10 },
                { month: '6月', count: 7 }
            ]
        }
    }
}) 