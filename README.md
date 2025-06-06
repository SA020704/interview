# AI 面试助手系统

## 项目简介
这是一个基于 AI 的智能面试助手系统，可以帮助面试官进行简历分析、生成面试问题，并提供面试评估功能。

## 技术栈
- 后端：Python + Flask
- 数据库：MySQL
- 消息队列：RabbitMQ
- AI 服务：ChatGPT API
- 文件存储：AWS S3

## 项目结构
```
my_flask_app/
├── app/
│   ├── controllers/        # 控制器层
│   ├── services/          # 服务层
│   ├── dao/              # 数据访问层
│   ├── models/           # 数据模型
│   ├── utils/            # 工具类
│   ├── dto/              # 数据传输对象
│   └── consumer/         # 消息队列消费者
├── config.py             # 配置文件
├── requirements.txt      # 项目依赖
└── run.py                # 启动文件
└── worldai.sql           # 数据库结构
```

## 安装步骤

1. 克隆项目
```bash
git clone https://github.com/SA020704/interview.git
cd my_flask_app
```

2. 创建虚拟环境
```bash
python -m venv venv
source venv/bin/activate  # Linux/Mac
venv\Scripts\activate     # Windows
```

3. 安装依赖
```bash
pip install -r requirements.txt
```

4. 配置环境变量
创建 `.env` 文件并配置以下参数：
```
#亚马逊S3云存储
AWS_ACCESS_KEY_ID=xxx
AWS_SECRET_ACCESS_KEY=xxx
S3_BUCKET_NAME=xxx
S3_BASE_URL=xxx

#阿里云智能语音交互
ALIYUN_AK_ID=xxx
ALIYUN_AK_SECRET=xxx
NLS_APP_KEY=xxx

#RabbitMQ
MQ_QUEUE_NAME=xxx
MQ_LOCALHOST=xxx
MQ_PORT=xxx
MQ_USERNAME=xxx
MQ_PASSWORD=xxx

#Ffmpeg
WINDOWS_PATH=xxx
MAC_PATH=xxx

#Mysql
MYSQL_HOST=xxx
MYSQL_PORT=xxx
MYSQL_USERNAME=xxx
MYSQL_PASSWORD=xxx
MYSQL_DATABASE=xxx

#Gpt代理(这个是ms内部的gpt代理)
GPT_PROXY_KEY=xxx
GPT_API_URL=xxx
```

5. 初始化数据库
```
导入数据库表结构 my_flask_app/worldai.sql
```

## 启动项目

1. 启动 Flask 应用
```bash
python run.py
```


## 系统流程

### 1. 简历分析流程
![img.png](img.png)

### 2. 面试评估流程
![img_1.png](img_1.png)

## API 接口

### 1. 简历分析
- POST `/ai/ResumeAnalysis`
  - 功能：分析简历内容
  - 参数：简历文件
  - 返回：简历分析结果和面试问题

### 2. 面试管理
- GET `/interview/list`
  - 功能：获取面试列表
  - 参数：用户ID
  - 返回：面试记录列表

- POST `/interview/create`
  - 功能：创建面试记录
  - 参数：用户ID、简历内容
  - 返回：面试记录ID

- POST `/interview/answer`
  - 功能：提交面试回答
  - 参数：面试ID、录音文件
  - 返回：处理状态

- GET `/interview/result`
  - 功能：获取面试评估结果
  - 参数：面试ID
  - 返回：评估结果

### 3. 文件管理
- POST `/v1/files/single`
  - 功能：上传文件到S3
  - 参数：文件
  - 返回：文件URL

## 注意事项

1. 确保已安装并启动 MySQL 服务
2. 确保已安装并启动 RabbitMQ 服务
3. 配置正确的 AWS S3 凭证
4. 必须要.env文件，并且填好自己对应的信息