import Mock from 'mockjs'

const interviews = Mock.mock({
    'list|10-20': [{
        'id|+1': 1,
        'title': '@ctitle(5, 20)',
        'type|1': ['screening', 'technical', 'hr', 'final'],
        'status|1': ['pending', 'completed', 'cancelled'],
        'candidateId': '@integer(1, 100)',
        'candidateName': '@cname',
        'position': '@pick(["前端开发工程师", "后端开发工程师", "全栈工程师", "产品经理", "UI设计师", "测试工程师", "DevOps工程师"])',
        'date': '@date("yyyy-MM-dd")',
        'time': '@time("HH:mm")',
        'duration|30-120': 60,
        'createdAt': '@datetime',
        'updatedAt': '@datetime',
        'description': '@cparagraph(1, 3)',
        'location|1': ['线上面试', '公司会议室', '咖啡厅'],
        'interviewer|1-3': ['@cname'],
        'tags|0-3': ['@ctitle(2, 4)'],
        'score|0-100': 0,
        'feedback': '@cparagraph(0, 3)',
        'questionIds|3-8': ['@integer(1, 100)']
    }]
})

// 获取面试列表
Mock.mock(/\/api\/interviews(\?.+)?$/, 'get', (config) => {
    const { url } = config
    const params = new URLSearchParams(url.split('?')[1] || '')
    const status = params.get('status')
    const type = params.get('type')
    const keyword = params.get('keyword')

    let list = [...interviews.list]

    if (status) {
        list = list.filter(item => item.status === status)
    }

    if (type) {
        list = list.filter(item => item.type === type)
    }

    if (keyword) {
        const regex = new RegExp(keyword, 'i')
        list = list.filter(item =>
            regex.test(item.title) ||
            regex.test(item.candidateName) ||
            regex.test(item.position)
        )
    }

    return {
        code: 0,
        message: 'success',
        data: {
            list,
            total: list.length
        }
    }
})

// 获取面试详情
Mock.mock(/\/api\/interviews\/\d+$/, 'get', (config) => {
    const id = config.url.match(/\/api\/interviews\/(\d+)/)[1]
    const interview = interviews.list.find(item => item.id.toString() === id)

    if (!interview) {
        return {
            code: 1,
            message: '面试不存在'
        }
    }

    return {
        code: 0,
        message: 'success',
        data: interview
    }
})

// 创建面试
Mock.mock(/\/api\/interviews$/, 'post', (config) => {
    const data = JSON.parse(config.body)
    const newId = interviews.list.length + 1

    const newInterview = {
        id: newId,
        ...data,
        createdAt: Mock.mock('@datetime'),
        updatedAt: Mock.mock('@datetime'),
        status: 'pending',
        score: 0
    }

    interviews.list.push(newInterview)

    return {
        code: 0,
        message: 'success',
        data: newInterview
    }
})

// 更新面试
Mock.mock(/\/api\/interviews\/\d+$/, 'put', (config) => {
    const id = config.url.match(/\/api\/interviews\/(\d+)/)[1]
    const data = JSON.parse(config.body)
    const index = interviews.list.findIndex(item => item.id.toString() === id)

    if (index === -1) {
        return {
            code: 1,
            message: '面试不存在'
        }
    }

    interviews.list[index] = {
        ...interviews.list[index],
        ...data,
        updatedAt: Mock.mock('@datetime')
    }

    return {
        code: 0,
        message: 'success',
        data: interviews.list[index]
    }
})

// 删除面试
Mock.mock(/\/api\/interviews\/\d+$/, 'delete', (config) => {
    const id = config.url.match(/\/api\/interviews\/(\d+)/)[1]
    const index = interviews.list.findIndex(item => item.id.toString() === id)

    if (index === -1) {
        return {
            code: 1,
            message: '面试不存在'
        }
    }

    interviews.list.splice(index, 1)

    return {
        code: 0,
        message: 'success'
    }
})

// 获取面试统计数据
Mock.mock(/\/api\/interviews\/statistics/, 'get', () => {
    return {
        code: 0,
        message: 'success',
        data: {
            total: interviews.list.length,
            pending: interviews.list.filter(item => item.status === 'pending').length,
            completed: interviews.list.filter(item => item.status === 'completed').length,
            cancelled: interviews.list.filter(item => item.status === 'cancelled').length,
            avgScore: 75,
            passRate: 0.8,
            typeDistribution: {
                screening: interviews.list.filter(item => item.type === 'screening').length,
                technical: interviews.list.filter(item => item.type === 'technical').length,
                hr: interviews.list.filter(item => item.type === 'hr').length,
                final: interviews.list.filter(item => item.type === 'final').length
            }
        }
    }
})

// 面试记录模拟数据
const interviewRecords = {}

// 开始面试
Mock.mock(/\/api\/interviews\/\d+\/start/, 'post', (config) => {
    const id = config.url.match(/\/api\/interviews\/(\d+)\/start/)[1]
    const interview = interviews.list.find(item => item.id.toString() === id)

    if (!interview) {
        return {
            code: 1,
            message: '面试不存在'
        }
    }

    // 初始化面试记录
    interviewRecords[id] = {
        interviewId: id,
        startTime: new Date().toISOString(),
        endTime: null,
        status: 'in_progress',
        records: [],
        notes: [],
        duration: 0
    }

    return {
        code: 0,
        message: 'success',
        data: interviewRecords[id]
    }
})

// 暂停面试
Mock.mock(/\/api\/interviews\/\d+\/pause/, 'post', (config) => {
    const id = config.url.match(/\/api\/interviews\/(\d+)\/pause/)[1]

    if (!interviewRecords[id]) {
        return {
            code: 1,
            message: '面试记录不存在'
        }
    }

    interviewRecords[id].status = 'paused'

    return {
        code: 0,
        message: 'success',
        data: interviewRecords[id]
    }
})

// 恢复面试
Mock.mock(/\/api\/interviews\/\d+\/resume/, 'post', (config) => {
    const id = config.url.match(/\/api\/interviews\/(\d+)\/resume/)[1]

    if (!interviewRecords[id]) {
        return {
            code: 1,
            message: '面试记录不存在'
        }
    }

    interviewRecords[id].status = 'in_progress'

    return {
        code: 0,
        message: 'success',
        data: interviewRecords[id]
    }
})

// 完成面试
Mock.mock(/\/api\/interviews\/\d+\/complete/, 'post', (config) => {
    const id = config.url.match(/\/api\/interviews\/(\d+)\/complete/)[1]
    const data = JSON.parse(config.body)

    if (!interviewRecords[id]) {
        return {
            code: 1,
            message: '面试记录不存在'
        }
    }

    // 更新面试记录
    interviewRecords[id] = {
        ...interviewRecords[id],
        ...data,
        endTime: new Date().toISOString(),
        status: 'completed'
    }

    // 更新面试状态
    const interviewIndex = interviews.list.findIndex(item => item.id.toString() === id)
    if (interviewIndex !== -1) {
        interviews.list[interviewIndex].status = 'completed'
    }

    return {
        code: 0,
        message: 'success',
        data: interviewRecords[id]
    }
})

// 获取面试记录
Mock.mock(/\/api\/interviews\/\d+\/records/, 'get', (config) => {
    const id = config.url.match(/\/api\/interviews\/(\d+)\/records/)[1]

    if (!interviewRecords[id]) {
        return {
            code: 1,
            message: '面试记录不存在'
        }
    }

    return {
        code: 0,
        message: 'success',
        data: interviewRecords[id]
    }
})

// 添加面试记录
Mock.mock(/\/api\/interviews\/\d+\/records/, 'post', (config) => {
    const id = config.url.match(/\/api\/interviews\/(\d+)\/records/)[1]
    const data = JSON.parse(config.body)

    if (!interviewRecords[id]) {
        return {
            code: 1,
            message: '面试记录不存在'
        }
    }

    const newRecord = {
        id: interviewRecords[id].records.length + 1,
        ...data,
        timestamp: new Date().toISOString()
    }

    interviewRecords[id].records.push(newRecord)

    return {
        code: 0,
        message: 'success',
        data: newRecord
    }
})

// 添加面试笔记
Mock.mock(/\/api\/interviews\/\d+\/notes/, 'post', (config) => {
    const id = config.url.match(/\/api\/interviews\/(\d+)\/notes/)[1]
    const data = JSON.parse(config.body)

    if (!interviewRecords[id]) {
        return {
            code: 1,
            message: '面试记录不存在'
        }
    }

    const newNote = {
        id: interviewRecords[id].notes.length + 1,
        ...data,
        timestamp: new Date().toISOString()
    }

    interviewRecords[id].notes.push(newNote)

    return {
        code: 0,
        message: 'success',
        data: newNote
    }
})

// 获取AI推荐问题
Mock.mock(/\/api\/interviews\/\d+\/recommendations/, 'get', () => {
    // 随机生成推荐问题
    const recommendations = Mock.mock({
        'list|1-3': [{
            'id|+1': 1,
            'title': '@csentence(10, 30)',
            'reason': '@csentence(10, 20)',
            'confidence|0.6-0.95': 0.8
        }]
    })

    return {
        code: 0,
        message: 'success',
        data: recommendations.list
    }
})

// 获取AI分析
Mock.mock(/\/api\/interviews\/\d+\/analysis/, 'get', () => {
    const analysisTypes = ['语言表达', '专业能力', '沟通能力', '逻辑思维']
    const randomType = analysisTypes[Math.floor(Math.random() * analysisTypes.length)]

    const analysis = {
        type: randomType,
        content: Mock.mock('@cparagraph(1, 3)'),
        confidence: Mock.Random.float(0.5, 0.95, 2, 2),
        timestamp: new Date().toISOString(),
        highlights: Mock.mock({
            'list|0-3': ['@csentence(5, 15)']
        }).list,
        suggestions: Mock.mock({
            'list|0-2': ['@csentence(5, 15)']
        }).list
    }

    return {
        code: 0,
        message: 'success',
        data: analysis
    }
})

// 添加面试质量分析的模拟API
Mock.mock(/\/api\/interviews\/\d+\/quality-analysis/, 'get', () => {
    return {
        code: 0,
        message: 'success',
        data: {
            coverage: {
                dimensions: {
                    technical: 0.85,
                    communication: 0.75,
                    problemSolving: 0.8,
                    teamwork: 0.6,
                    cultureFit: 0.65,
                    learningAbility: 0.7
                },
                questionTypes: {
                    technical: 45,
                    behavioral: 25,
                    situational: 15,
                    experience: 10,
                    cultural: 5
                },
                timeAllocation: {
                    technical: 35,
                    experience: 25,
                    behavioral: 20,
                    problemSolving: 15,
                    cultural: 5
                },
                explanation: '此面试评估维度覆盖较为全面，各主要能力维度均有涉及。技术能力和问题解决能力的覆盖度最高，而文化匹配和团队协作方面的覆盖度较低，建议在后续面试中多关注这些方面。',
                suggestions: [
                    '增加团队协作相关的情景问题，了解候选人的协作能力',
                    '加入更多文化匹配度的讨论，确保候选人能融入团队',
                    '技术问题可以适当精简，为软技能评估留出更多时间',
                    '确保每个评估维度至少有2-3个深入问题'
                ]
            },
            interviewer: {
                performance: {
                    questionClarity: 0.9,
                    probing: 0.85,
                    listening: 0.8,
                    pacing: 0.7,
                    feedback: 0.65,
                    adaptability: 0.75
                },
                questionDistribution: {
                    time: ['0-10分钟', '10-20分钟', '20-30分钟', '30-40分钟', '40-50分钟', '50-60分钟'],
                    technical: [3, 5, 2, 1, 0, 0],
                    behavioral: [0, 1, 2, 3, 2, 0],
                    situational: [0, 0, 1, 2, 2, 1]
                },
                explanation: '面试官在问题清晰度和深入挖掘能力方面表现出色，能够引导面试向深层次进行。在控制节奏和总结反馈方面有提升空间，可以通过更好地掌控面试流程和提供及时反馈来提高面试效果。',
                suggestions: [
                    '在问题之间提供更多的过渡和引导，帮助候选人理解问题的连贯性',
                    '给予候选人更多即时反馈，特别是在答题表现良好时',
                    '控制单个问题的讨论时间，确保能够覆盖所有关键评估点',
                    '可以使用更多的开放性问题，让候选人充分展示能力'
                ]
            },
            efficiency: {
                infoGatheringRate: '85%',
                focusRate: '92%',
                timeUtilization: '78%',
                keyInfoCoverage: {
                    categories: ['技术背景', '项目经验', '问题解决', '团队协作', '学习能力', '职业规划'],
                    coverage: [90, 85, 80, 65, 70, 60]
                },
                inefficientQuestions: [
                    {
                        questionType: '技术问题',
                        question: '你熟悉哪些编程语言？',
                        reason: '过于宽泛，未获取深度信息',
                        suggestion: '询问特定语言的深度使用经验和解决的复杂问题'
                    },
                    {
                        questionType: '经验问题',
                        question: '讲讲你的项目经历',
                        reason: '没有具体方向，花费时间过多',
                        suggestion: '引导候选人讨论最相关的1-2个项目，深入技术细节'
                    },
                    {
                        questionType: '行为问题',
                        question: '你的优点和缺点是什么？',
                        reason: '标准化问题，获取信息有限',
                        suggestion: '询问特定情境下的行为表现，如"描述一次你克服技术挑战的经历"'
                    }
                ],
                suggestions: [
                    '使用更多结构化和有针对性的问题，减少开放性过大的问题',
                    '优化面试流程，将相关话题集中讨论，减少上下文切换',
                    '提前准备关键信息点检查表，确保重要信息都已获取',
                    '针对候选人简历中的关键项目和技能设计有深度的问题'
                ]
            },
            trends: {
                qualityTrend: {
                    date: ['2023-01', '2023-02', '2023-03', '2023-04', '2023-05'],
                    coverage: [65, 70, 75, 80, 85],
                    efficiency: [60, 65, 70, 75, 80],
                    consistency: [70, 75, 80, 85, 90]
                },
                consistencyData: {
                    interviewers: ['张三', '李四', '王五', '赵六', '团队平均'],
                    scores: [85, 80, 90, 75, 82.5]
                },
                explanation: '面试质量在过去几次面试中总体呈上升趋势，面试覆盖度和效率都有所提高。评估一致性分析显示，不同面试官对相似候选人的评估结果较为一致，表明团队内部的评估标准较为统一。',
                suggestions: [
                    '定期组织面试官校准会议，确保评估标准统一',
                    '建立面试问题库，持续优化问题质量',
                    '分析高效面试案例，总结最佳实践并在团队分享',
                    '面试后进行自我反思和同行评估，持续改进面试技巧'
                ]
            }
        }
    }
})

// 添加面试摘要的模拟API
Mock.mock(/\/api\/interviews\/\d+\/summary/, 'get', () => {
    return {
        code: 0,
        message: 'success',
        data: {
            executiveSummary: '候选人在技术能力方面表现优秀，尤其是前端开发和React相关技术栈。沟通表达清晰，能够深入解释技术实现细节。团队合作和问题解决能力良好，与公司文化匹配度高。总体评估为强推荐录用。',
            detailedSummary: {
                overview: '此次面试共进行了60分钟，覆盖了技术能力、项目经验、团队协作、解决问题能力和文化匹配等多个维度。候选人整体表现出色，在大多数评估维度得分均在80分以上。',
                technical: '候选人在JavaScript、React、Vue等前端技术领域展示了扎实的基础和丰富的实践经验。特别在组件设计、状态管理和性能优化方面有独到见解。对后端技术也有基本了解，能够进行全栈开发。',
                experience: '拥有5年前端开发经验，参与过多个大型项目。最近负责的电商平台重构项目展示了其架构设计和技术选型能力。能够清晰描述项目挑战和解决方案。',
                softSkills: '沟通表达清晰流畅，能够准确理解问题并给出相应的回答。思路逻辑性强，对问题有自己的见解。展现出较强的学习能力和适应能力。',
                cultureFit: '价值观与公司文化高度匹配，注重团队协作、用户体验和代码质量。对技术创新持开放态度，愿意接受挑战。'
            },
            topicDistribution: {
                topics: ['技术能力', '项目经验', '问题解决', '团队协作', '学习能力', '文化匹配'],
                percentage: [40, 25, 15, 10, 5, 5]
            },
            keyHighlights: [
                '在React性能优化方面有丰富经验，熟练应用memo、useMemo和useCallback等技术',
                '解决过复杂的跨浏览器兼容性问题，包括IE11的特殊处理',
                '主导开发了组件库，提高了团队开发效率',
                '良好的代码审查习惯，注重代码质量和可维护性'
            ],
            concerns: [
                '后端技术经验相对有限，可能需要在全栈项目中提供支持',
                '大规模系统架构经验较少，可能需要在这方面提供指导'
            ],
            recommendations: {
                hiring: {
                    decision: 'strong_hire',
                    reason: '技术能力出色，经验丰富，文化匹配度高，可以立即为团队做出贡献'
                },
                nextSteps: [
                    '安排与技术团队负责人最终面试',
                    '准备具体的薪资和福利方案',
                    '设计入职培训计划，聚焦全栈开发技能提升'
                ]
            }
        }
    }
})

// 添加团队评估的模拟API
Mock.mock(/\/api\/interviews\/\d+\/team-evaluation/, 'get', () => {
    return {
        code: 0,
        message: 'success',
        data: {
            evaluators: [
                {
                    id: 1,
                    name: '张三',
                    role: '技术负责人',
                    evaluation: {
                        overallScore: 85,
                        recommendation: 'hire',
                        comments: '技术功底扎实，项目经验丰富，推荐录用',
                        skillScores: {
                            technical: 4.5,
                            communication: 4,
                            problemSolving: 4.5,
                            teamwork: 4,
                            cultureFit: 4,
                            learningAbility: 4.5
                        }
                    }
                },
                {
                    id: 2,
                    name: '李四',
                    role: '前端负责人',
                    evaluation: {
                        overallScore: 90,
                        recommendation: 'hire',
                        comments: '前端技术特别出色，React和Vue都很精通，强烈推荐',
                        skillScores: {
                            technical: 5,
                            communication: 4.5,
                            problemSolving: 4.5,
                            teamwork: 4,
                            cultureFit: 4.5,
                            learningAbility: 4.5
                        }
                    }
                },
                {
                    id: 3,
                    name: '王五',
                    role: 'HR专员',
                    evaluation: {
                        overallScore: 80,
                        recommendation: 'hire',
                        comments: '沟通能力良好，文化匹配度高，建议录用',
                        skillScores: {
                            technical: 4,
                            communication: 4.5,
                            problemSolving: 4,
                            teamwork: 4.5,
                            cultureFit: 4.5,
                            learningAbility: 4
                        }
                    }
                }
            ],
            consensusScore: 85,
            varianceAnalysis: {
                technical: {
                    average: 4.5,
                    variance: 0.5,
                    comments: '评分较为一致，都认为技术能力出色'
                },
                communication: {
                    average: 4.3,
                    variance: 0.3,
                    comments: '评分一致，沟通能力被一致认可'
                },
                problemSolving: {
                    average: 4.3,
                    variance: 0.3,
                    comments: '评分一致，解决问题能力得到认可'
                },
                teamwork: {
                    average: 4.2,
                    variance: 0.3,
                    comments: '评分一致，团队合作能力良好'
                },
                cultureFit: {
                    average: 4.3,
                    variance: 0.3,
                    comments: '评分一致，文化匹配度较高'
                },
                learningAbility: {
                    average: 4.3,
                    variance: 0.3,
                    comments: '评分一致，学习能力被认可'
                }
            },
            finalRecommendation: {
                decision: 'hire',
                reason: '综合各评估人意见，候选人在技术能力、沟通表达和文化匹配等方面都表现出色，一致推荐录用',
                nextSteps: [
                    '准备offer',
                    '安排入职培训',
                    '准备团队介绍'
                ]
            }
        }
    }
})

// 添加报告模板列表的模拟API
Mock.mock(/\/api\/report-templates/, 'get', () => {
    return {
        code: 0,
        message: 'success',
        data: [
            {
                id: 1,
                name: '标准技术面试报告',
                description: '包含技术评估和基本能力评估的标准报告模板',
                type: 'technical',
                sections: ['basicInfo', 'evaluation', 'analysis', 'conversation', 'charts']
            },
            {
                id: 2,
                name: '详细评估报告',
                description: '包含所有评估维度和详细分析的完整报告',
                type: 'detailed',
                sections: ['basicInfo', 'evaluation', 'analysis', 'conversation', 'charts', 'notes']
            },
            {
                id: 3,
                name: '简洁摘要报告',
                description: '简短的面试结果摘要，适合管理层快速查阅',
                type: 'summary',
                sections: ['basicInfo', 'evaluation', 'charts']
            },
            {
                id: 4,
                name: 'HR面试报告',
                description: '侧重软技能和文化匹配的HR面试报告',
                type: 'hr',
                sections: ['basicInfo', 'evaluation', 'analysis', 'notes']
            }
        ]
    }
})

// 模拟导出面试记录的API
Mock.mock(/\/api\/interviews\/\d+\/export/, 'get', () => {
    // 实际项目中应该返回文件内容，这里为了模拟，返回空Blob
    return new Blob(['模拟的面试报告内容'], { type: 'application/pdf' })
})

// 模拟共享面试报告的API
Mock.mock(/\/api\/interviews\/\d+\/share/, 'post', (options) => {
    const data = JSON.parse(options.body)
    return {
        code: 0,
        message: 'success',
        data: {
            shareId: Mock.Random.guid(),
            shareUrl: `https://interview.example.com/share/${Mock.Random.guid()}`,
            expireTime: Mock.Random.datetime('yyyy-MM-dd HH:mm:ss', 'yyyy-MM-dd HH:mm:ss', new Date('2023-12-31')),
            recipients: data.recipients || [],
            permissions: data.permissions || ['view']
        }
    }
})

// 模拟生成面试报告的API
Mock.mock(/\/api\/interviews\/\d+\/report/, 'post', () => {
    return {
        code: 0,
        message: 'success',
        data: {
            reportId: Mock.Random.guid(),
            generatedAt: Mock.Random.datetime('yyyy-MM-dd HH:mm:ss'),
            downloadUrl: `https://interview.example.com/reports/${Mock.Random.guid()}`
        }
    }
})

export default {
    interviews,
    interviewRecords
} 