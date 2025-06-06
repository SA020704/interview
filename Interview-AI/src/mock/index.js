// 导入所有mock数据
import './settings'
import './questions'
import './user'

// 其他mock数据可以在这里导入
// import './candidates'
// import './interviews'

// 设置延迟时间
import Mock from 'mockjs'
Mock.setup({
    timeout: '200-600' // 模拟请求延迟
})

console.log('Mock数据初始化成功')

export default Mock 