import json
import logging
import pika

from app.services.question_service import QuestionService
from app.services.interview_service import InterviewService
from app.utils.chatgpt_utils import ChatGptUtils
from app.utils.prompt_utils import PromptUtils

log = logging.getLogger(__name__)


class InterviewAnalysisConsumer:
    def __init__(self):
        """初始化消费者"""
        self.connection = None
        self.channel = None
        self.queue_name = 'interview_analysis_queue'

        # 初始化服务类
        self.question_service = QuestionService()
        self.interview_service = InterviewService()
        self.chatgpt_utils = ChatGptUtils()

        # RabbitMQ连接参数
        self.connection_params = pika.ConnectionParameters(
            host='localhost',
            port=5672,
            virtual_host='/',
            credentials=pika.PlainCredentials('admin', 'admin123')
        )

    def connect(self):
        """建立连接"""
        try:
            self.connection = pika.BlockingConnection(self.connection_params)
            self.channel = self.connection.channel()

            # 声明队列（确保队列存在，参数与生产者一致）
            self.channel.queue_declare(
                queue=self.queue_name,
                durable=True,
                arguments={
                    'x-message-ttl': 3600000,  # 消息TTL 1小时
                    'x-max-length': 1000  # 队列最大长度
                }
            )

            # 设置QoS，一次只处理一条消息
            self.channel.basic_qos(prefetch_count=1)

            log.info("MQ连接建立成功")
            return True

        except Exception as e:
            log.error(f"MQ连接失败: {e}", exc_info=True)
            return False

    def callback(self, ch, method, properties, body):
        """消息处理回调函数"""
        try:
            log.info(f"进入MQ处理流程")
            # 解析消息
            message = json.loads(body.decode('utf-8'))

            interview_id = message.get('interview_id')
            user_id = message.get('user_id')
            accumulated_text = message.get('accumulated_text')

            # 打印消息信息
            print("=" * 60)
            print(f"📋 面试ID: {interview_id}")
            print(f"👤 用户ID: {user_id}")
            print(f"💬 文本内容: {accumulated_text}")
            print("=" * 60)

            self.process_interview_analysis(interview_id, user_id, accumulated_text)

            # 确认消息处理完成
            ch.basic_ack(delivery_tag=method.delivery_tag)

            log.info(f"消息处理完成 - interview_id: {interview_id}, user_id: {user_id}")

        except json.JSONDecodeError as e:
            log.error(f"消息JSON解析失败: {e}, 原始消息: {body}")
            ch.basic_nack(delivery_tag=method.delivery_tag, requeue=False)

        except Exception as e:
            log.error(f"消息处理失败: {e}", exc_info=True)
            ch.basic_nack(delivery_tag=method.delivery_tag, requeue=False)

    def process_interview_analysis(self, interview_id, user_id, accumulated_text):
        """处理面试分析逻辑"""
        try:
            log.info(f"MQ开启Ai音频分析: {interview_id}")
            # 1. 获取面试信息
            interview = self.interview_service.get_interview(interview_id)
            if not interview:
                log.warning(f"未找到面试记录: {interview_id}")
                return

            # 2. 使用AI分析对话
            audio_analysis_prompt = PromptUtils.get_audio_content_analysis_message(accumulated_text, interview.resume)
            audio_analysis_result = self.chatgpt_utils.proxy_ms_api(audio_analysis_prompt)

            # 4. 保存分析结果到数据库
            if audio_analysis_result:
                questions_list = [q.strip() for q in audio_analysis_result.split("/") if q.strip()]
                if questions_list:
                    self.question_service.batch_create_questions(
                        questions=questions_list,
                        interview_id=interview_id
                    )
                    log.info(f"为面试 {interview_id} 生成了 {len(questions_list)} 个新问题")

            log.info(f"面试分析处理完成 - interview_id: {interview_id}")

        except Exception as e:
            log.error(f"面试分析处理失败: {e}", exc_info=True)
            raise

    def start_consuming(self):
        """开始消费消息"""
        try:
            if not self.connect():
                log.error("无法建立连接，退出消费者")
                return

            # 设置消费者
            self.channel.basic_consume(
                queue=self.queue_name,
                on_message_callback=self.callback
            )

            log.info(f"🚀 开始监听队列: {self.queue_name}")
            log.info("等待消息中... 在Flask应用中运行")

            # 开始消费
            self.channel.start_consuming()

        except KeyboardInterrupt:
            log.info("接收到键盘中断信号")
            self.stop_consuming()
        except Exception as e:
            log.error(f"消费过程中出现错误: {e}", exc_info=True)
            self.stop_consuming()

    def stop_consuming(self):
        """停止消费"""
        try:
            if self.channel and not self.channel.is_closed:
                log.info("正在停止消费...")
                self.channel.stop_consuming()

            if self.connection and not self.connection.is_closed:
                log.info("正在关闭连接...")
                self.connection.close()

            log.info("消费者已安全关闭")

        except Exception as e:
            log.error(f"关闭消费者时出现错误: {e}", exc_info=True)
