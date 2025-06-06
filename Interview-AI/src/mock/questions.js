import Mock from 'mockjs'

// 模拟面试问题数据
const questions = [
    {
        id: 1,
        title: '请描述一下你的工作经历',
        description: '请详细描述您的工作经历，包括担任的职位、主要职责和成就。',
        category: '工作经验',
        difficulty: 'easy',
        tags: ['简历', '经历', '职业'],
        followUpQuestions: [
            { id: 101, text: '在这些经历中，你认为最大的挑战是什么？' },
            { id: 102, text: '你从这些经历中学到了什么？' }
        ],
        expectedAnswers: '<p>一个好的回答应该包含：</p><ul><li>清晰的时间线和职业发展</li><li>每个角色的主要职责</li><li>取得的成就和学到的技能</li><li>与应聘职位相关的经验</li></ul>',
        tips: [
            '注意候选人是否能够清晰地表达他们的职业路径',
            '观察他们是否强调与当前职位相关的技能和经验',
            '评估他们对过去工作的反思和学习能力'
        ]
    },
    {
        id: 2,
        title: '你为什么想加入我们公司？',
        description: '请解释为什么你对我们公司感兴趣，以及你认为自己能为公司带来什么价值。',
        category: '工作经验',
        difficulty: 'medium',
        tags: ['动机', '公司文化', '职业规划'],
        followUpQuestions: [
            { id: 201, text: '你对我们公司了解多少？' },
            { id: 202, text: '你的长期职业目标是什么？' }
        ],
        expectedAnswers: '<p>良好的回答应该：</p><ul><li>展示对公司的研究和了解</li><li>将自己的技能和价值观与公司使命联系起来</li><li>表达长期职业发展的愿景</li></ul>',
        tips: [
            '评估候选人对公司的了解程度',
            '观察他们的价值观是否与公司文化一致',
            '注意他们是否只关注个人利益而不考虑如何贡献'
        ]
    },
    {
        id: 3,
        title: '描述一个你成功解决的复杂技术问题',
        description: '请详细描述一个你面临的复杂技术挑战，以及你如何分析并解决这个问题。',
        category: '技术能力',
        difficulty: 'hard',
        tags: ['问题解决', '技术', '案例分析'],
        followUpQuestions: [
            { id: 301, text: '如果你有更多时间或资源，你会如何改进你的解决方案？' },
            { id: 302, text: '团队在这个过程中扮演了什么角色？' }
        ],
        expectedAnswers: '<p>优秀的回答应该包含：</p><ul><li>问题的清晰定义和背景</li><li>分析问题的方法和思考过程</li><li>解决方案的实施步骤</li><li>取得的结果和学到的经验</li></ul>',
        tips: [
            '关注候选人的分析能力和解决问题的系统性方法',
            '评估他们的技术深度和广度',
            '注意他们是否提到了团队协作和沟通'
        ]
    },
    {
        id: 4,
        title: '你如何处理工作中的压力和截止日期？',
        description: '请分享你如何在高压环境下工作，以及如何确保按时完成任务。',
        category: '软技能',
        difficulty: 'medium',
        tags: ['压力管理', '时间管理', '工作习惯'],
        followUpQuestions: [
            { id: 401, text: '你能分享一个你在压力下表现出色的例子吗？' },
            { id: 402, text: '当多个项目有冲突的截止日期时，你如何优先处理？' }
        ],
        expectedAnswers: '<p>好的回答应该：</p><ul><li>展示时间管理和优先级设置的方法</li><li>描述特定的压力管理技巧</li><li>提供实际案例</li><li>表明对工作生活平衡的理解</li></ul>',
        tips: [
            '评估候选人的自我认知和压力管理能力',
            '注意他们是否有具体的方法和工具来管理时间',
            '观察他们是否能在高压下保持质量和效率'
        ]
    },
    {
        id: 5,
        title: '解释快速排序算法的工作原理',
        description: '请详细解释快速排序算法的实现原理、时间复杂度和空间复杂度，并分析其优缺点。',
        category: '算法',
        difficulty: 'hard',
        tags: ['排序', '算法', '复杂度分析'],
        followUpQuestions: [
            { id: 501, text: '快速排序在什么情况下表现最差？如何改进？' },
            { id: 502, text: '与归并排序相比，快速排序有什么优势和劣势？' }
        ],
        expectedAnswers: '<p>完整的回答应包含：</p><ul><li>分治策略和枢轴选择的解释</li><li>平均O(nlogn)和最坏O(n²)时间复杂度的分析</li><li>空间复杂度O(logn)的讨论</li><li>实际应用中的优化方法</li></ul>',
        tips: [
            '评估候选人对算法基础的理解',
            '注意他们是否能清晰解释复杂概念',
            '观察他们是否了解理论与实践应用之间的差异'
        ]
    },
    {
        id: 6,
        title: '你如何确保代码质量？',
        description: '请描述你用来保证代码质量和可维护性的实践和工具。',
        category: '技术能力',
        difficulty: 'medium',
        tags: ['代码质量', '最佳实践', '软件工程'],
        followUpQuestions: [
            { id: 601, text: '你如何处理技术债务？' },
            { id: 602, text: '你如何平衡代码质量和快速交付之间的关系？' }
        ],
        expectedAnswers: '<p>良好的回答应该涵盖：</p><ul><li>编码标准和规范</li><li>代码审查实践</li><li>自动化测试策略</li><li>持续集成/持续部署</li><li>静态代码分析工具</li></ul>',
        tips: [
            '评估候选人对软件质量重要性的理解',
            '注意他们是否有实际使用质量保证工具的经验',
            '观察他们是否提到团队协作和知识共享的重要性'
        ]
    },
    {
        id: 7,
        title: '描述一次你与团队成员有不同意见的情况',
        description: '请分享一个你与同事或团队成员持不同意见的例子，以及你如何处理这种情况。',
        category: '软技能',
        difficulty: 'medium',
        tags: ['团队协作', '冲突解决', '沟通'],
        followUpQuestions: [
            { id: 701, text: '事后你认为有什么可以改进的地方吗？' },
            { id: 702, text: '你通常如何处理团队中的分歧？' }
        ],
        expectedAnswers: '<p>好的回答应该：</p><ul><li>客观描述冲突情况</li><li>展示积极的沟通技巧</li><li>强调以团队目标为重</li><li>反思经验教训</li></ul>',
        tips: [
            '评估候选人的冲突解决能力',
            '注意他们是否能理解并尊重不同观点',
            '观察他们是否能在保持专业的同时表达自己的立场'
        ]
    },
    {
        id: 8,
        title: '如何设计一个高并发的系统？',
        description: '请讨论设计高并发系统时需要考虑的关键因素和策略。',
        category: '技术能力',
        difficulty: 'hard',
        tags: ['系统设计', '高并发', '架构'],
        followUpQuestions: [
            { id: 801, text: '如何监控和排查高并发系统中的性能问题？' },
            { id: 802, text: '你认为扩展系统最具挑战性的方面是什么？' }
        ],
        expectedAnswers: '<p>全面的回答应该包括：</p><ul><li>水平和垂直扩展策略</li><li>缓存机制和策略</li><li>数据库优化和分片</li><li>负载均衡</li><li>异步处理</li><li>服务降级和熔断</li></ul>',
        tips: [
            '评估候选人的系统设计知识',
            '注意他们是否考虑到了可用性、一致性和性能之间的权衡',
            '观察他们是否能根据业务需求调整技术方案'
        ]
    },
    {
        id: 9,
        title: '你最近学习了什么新技术？',
        description: '请分享你最近学习的一项新技术或技能，以及你的学习过程和应用情况。',
        category: '专业知识',
        difficulty: 'easy',
        tags: ['学习能力', '技术趋势', '自我提升'],
        followUpQuestions: [
            { id: 901, text: '你为什么选择学习这项技术？' },
            { id: 902, text: '这项新技术如何改变了你的工作方式？' }
        ],
        expectedAnswers: '<p>好的回答应该：</p><ul><li>展示持续学习的动力</li><li>描述系统化的学习方法</li><li>解释如何将新知识应用到实际工作中</li><li>反思学习过程中的挑战和收获</li></ul>',
        tips: [
            '评估候选人的学习能力和好奇心',
            '注意他们是否能快速掌握新概念',
            '观察他们是否能将新技术与已有知识整合'
        ]
    },
    {
        id: 10,
        title: '你认为成功的团队有哪些特质？',
        description: '请分享你对高效团队的看法，以及你认为团队成功的关键因素是什么。',
        category: '软技能',
        difficulty: 'easy',
        tags: ['团队合作', '领导力', '组织文化'],
        followUpQuestions: [
            { id: 1001, text: '你如何促进团队内的知识共享？' },
            { id: 1002, text: '你认为团队领导的角色是什么？' }
        ],
        expectedAnswers: '<p>全面的回答应该涵盖：</p><ul><li>明确的目标和角色</li><li>开放和透明的沟通</li><li>相互信任和尊重</li><li>多元化的技能和观点</li><li>持续学习和适应能力</li></ul>',
        tips: [
            '评估候选人的团队意识',
            '注意他们是否强调个人贡献和集体成功的平衡',
            '观察他们对团队动态的理解深度'
        ]
    }
]

// 模拟问题列表API
Mock.mock(/\/api\/questions(\?.+)?$/, 'get', (options) => {
    const url = options.url
    const params = new URLSearchParams(url.split('?')[1])

    const page = parseInt(params.get('page')) || 1
    const limit = parseInt(params.get('limit')) || 10
    const search = params.get('search') || ''
    const category = params.get('category') || ''
    const difficulty = params.get('difficulty') || ''

    // 根据参数筛选问题
    let filteredQuestions = [...questions]

    if (search) {
        const lcSearch = search.toLowerCase()
        filteredQuestions = filteredQuestions.filter(q =>
            q.title.toLowerCase().includes(lcSearch) ||
            q.description.toLowerCase().includes(lcSearch) ||
            (q.tags && q.tags.some(tag => tag.toLowerCase().includes(lcSearch)))
        )
    }

    if (category) {
        filteredQuestions = filteredQuestions.filter(q => q.category === category)
    }

    if (difficulty) {
        filteredQuestions = filteredQuestions.filter(q => q.difficulty === difficulty)
    }

    // 分页
    const total = filteredQuestions.length
    const start = (page - 1) * limit
    const end = start + limit
    const paginatedQuestions = filteredQuestions.slice(start, end)

    return {
        code: 200,
        data: {
            items: paginatedQuestions,
            total: total,
            page: page,
            limit: limit
        },
        message: '获取问题列表成功'
    }
})

// 获取问题详情API
Mock.mock(/\/api\/questions\/\d+$/, 'get', (options) => {
    const url = options.url
    const id = parseInt(url.match(/\/api\/questions\/(\d+)$/)[1])

    const question = questions.find(q => q.id === id)

    if (question) {
        return {
            code: 200,
            data: question,
            message: '获取问题详情成功'
        }
    } else {
        return {
            code: 404,
            data: null,
            message: '问题不存在'
        }
    }
})

export default questions 