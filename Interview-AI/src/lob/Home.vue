<template>
    <div class="home-container">
        <div class="welcome-card">
            <div class="card-left">
                <div class="logo-container">
                    <div class="logo">AI</div>
                </div>

                <h1 class="title">AI 面试助手</h1>
                <p class="description">智能面试辅助工具，帮助您高效完成面试<br />并自动生成专业分析报告</p>

                <div class="action-buttons">
                    <el-button type="primary" size="large" class="start-button" @click="startNewInterview">
                        <span class="button-icon">
                            <svg
                                viewBox="0 0 24 24"
                                width="20"
                                height="20"
                                stroke="currentColor"
                                stroke-width="2"
                                fill="none"
                            >
                                <path d="M5 12h14M12 5l7 7-7 7"></path>
                            </svg>
                        </span>
                        开始新面试
                    </el-button>
                </div>
            </div>

            <div class="card-right">
                <div class="feature-list">
                    <h3>主要功能</h3>

                    <div class="feature-item">
                        <div class="feature-icon microphone">
                            <Microphone />
                        </div>
                        <div class="feature-text">
                            <h4>实时录音监听对话</h4>
                            <p>自动记录面试全程对话，无需手动记录</p>
                        </div>
                    </div>

                    <div class="feature-item">
                        <div class="feature-icon document">
                            <Document />
                        </div>
                        <div class="feature-text">
                            <h4>问题总结与复盘</h4>
                            <p>智能分析面试表现，提供专业评估报告</p>
                        </div>
                    </div>

                    <div class="feature-item">
                        <div class="feature-icon upload">
                            <Upload />
                        </div>
                        <div class="feature-text">
                            <h4>简历导入</h4>
                            <p>快速导入简历，自动分析匹配度</p>
                        </div>
                    </div>

                    <div class="feature-item">
                        <div class="feature-icon chat">
                            <ChatDotRound />
                        </div>
                        <div class="feature-text">
                            <h4>智能追问建议</h4>
                            <p>根据应聘者回答提供相关的追问建议</p>
                        </div>
                    </div>

                    <div class="feature-item">
                        <div class="feature-icon connection">
                            <Connection />
                        </div>
                        <div class="feature-text">
                            <h4>关键词提取分析</h4>
                            <p>识别回答中的关键信息，辅助评估能力</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { useRouter } from "vue-router";
import { Microphone, Document, Upload, ChatDotRound, Connection } from "@element-plus/icons-vue";

const router = useRouter();

const startNewInterview = () => {
    router.push("/prepare");
};
</script>

<style scoped>
.home-container {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    background: linear-gradient(135deg, #f5f7fa 0%, #e4e8f0 100%);
    padding: 0 20px;
}

.welcome-card {
    display: flex;
    width: 100%;
    max-width: 1100px;
    background-color: white;
    border-radius: 20px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
    overflow: hidden;
}

.card-left {
    flex: 1;
    padding: 60px 50px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    position: relative;
}

.logo-container {
    margin-bottom: 30px;
}

.logo {
    width: 60px;
    height: 60px;
    border-radius: 16px;
    background: linear-gradient(135deg, #4a90e2 0%, #2c6ed1 100%);
    color: white;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 24px;
    font-weight: bold;
    box-shadow: 0 10px 20px rgba(74, 144, 226, 0.3);
}

.title {
    font-size: 42px;
    font-weight: 700;
    color: #303133;
    margin: 0 0 20px;
    background: linear-gradient(135deg, #4a90e2 0%, #2c6ed1 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
}

.description {
    font-size: 18px;
    color: #606266;
    line-height: 1.6;
    margin-bottom: 40px;
}

.action-buttons {
    display: flex;
}

.start-button {
    height: 50px;
    padding: 0 30px;
    font-size: 16px;
    font-weight: 500;
    border-radius: 25px;
    background: linear-gradient(135deg, #4a90e2 0%, #2c6ed1 100%);
    border: none;
    box-shadow: 0 10px 20px rgba(74, 144, 226, 0.3);
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
}

.start-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 15px 25px rgba(74, 144, 226, 0.4);
}

.button-icon {
    margin-right: 8px;
    display: flex;
    align-items: center;
}

.card-right {
    flex: 1.2;
    background-color: #f9fafc;
    padding: 60px 50px;
    border-left: 1px solid #eaeef3;
}

.feature-list {
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
}

.feature-list h3 {
    font-size: 24px;
    color: #303133;
    margin: 0 0 30px;
    position: relative;
    padding-bottom: 15px;
}

.feature-list h3::after {
    content: "";
    position: absolute;
    bottom: 0;
    left: 0;
    width: 40px;
    height: 3px;
    background: linear-gradient(135deg, #4a90e2 0%, #2c6ed1 100%);
    border-radius: 3px;
}

.feature-item {
    display: flex;
    margin-bottom: 25px;
}

.feature-icon {
    width: 48px;
    height: 48px;
    border-radius: 12px;
    display: flex;
    justify-content: center;
    align-items: center;
    margin-right: 16px;
    flex-shrink: 0;
}

.feature-icon svg {
    width: 24px;
    height: 24px;
    color: white;
}

.microphone {
    background: linear-gradient(135deg, #ff6b6b 0%, #ff4757 100%);
}

.document {
    background: linear-gradient(135deg, #2ed573 0%, #1db954 100%);
}

.upload {
    background: linear-gradient(135deg, #ffda79 0%, #ffbe76 100%);
}

.chat {
    background: linear-gradient(135deg, #5352ed 0%, #3742fa 100%);
}

.connection {
    background: linear-gradient(135deg, #a29bfe 0%, #6c5ce7 100%);
}

.feature-text {
    flex: 1;
}

.feature-text h4 {
    font-size: 18px;
    color: #303133;
    margin: 0 0 5px;
}

.feature-text p {
    font-size: 14px;
    color: #909399;
    margin: 0;
    line-height: 1.5;
}

/* 移动端适配 */
@media (max-width: 992px) {
    .welcome-card {
        flex-direction: column;
        max-width: 600px;
    }

    .card-left,
    .card-right {
        padding: 40px 30px;
    }

    .card-left {
        text-align: center;
        align-items: center;
    }

    .title {
        font-size: 32px;
    }

    .description {
        font-size: 16px;
    }

    .feature-list h3 {
        text-align: center;
    }

    .feature-list h3::after {
        left: 50%;
        transform: translateX(-50%);
    }
}

@media (max-width: 576px) {
    .card-left,
    .card-right {
        padding: 30px 20px;
    }

    .title {
        font-size: 28px;
    }

    .description {
        font-size: 14px;
    }

    .feature-item {
        margin-bottom: 20px;
    }

    .feature-icon {
        width: 40px;
        height: 40px;
    }

    .feature-text h4 {
        font-size: 16px;
    }

    .feature-text p {
        font-size: 12px;
    }

    .start-button {
        width: 100%;
        height: 46px;
        font-size: 15px;
    }
}
</style>
