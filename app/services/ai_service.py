import json
import os
import threading
from collections import defaultdict
from datetime import datetime

import pika

from app.utils.ALYAudioConversionUtil import ALYAudioConversionUtil
from app.utils.pdf_utils import extract_text_from_pdf
from app.utils.prompt_utils import PromptUtils
from app.utils.chatgpt_utils import ChatGptUtils
from app.services.question_service import QuestionService
from app.services.interview_service import InterviewService
import concurrent.futures
import logging

log = logging.getLogger(__name__)


class AIService:
    def __init__(self):
        self.chatgpt_utils = ChatGptUtils()
        self.question_service = QuestionService()
        self.interview_service = InterviewService()
        self.aLYAudioConversionUtil = ALYAudioConversionUtil()

        self.executor = concurrent.futures.ThreadPoolExecutor(max_workers=4)
        self.MIN_ANALYSIS_LENGTH = 150
        # 线程安全的面试对话文本累积集合
        self._user_text_accumulator = defaultdict(str)
        # 面试整场对话的文本积累结合
        self._user_text_accumulator = defaultdict(str)
        # 用于保护累积器的锁
        self._accumulator_lock = threading.RLock()
        # 初始化MQ连接
        self._init_mq_connection()

    def analyze_resume(self, file_content, user_id):
        """分析简历内容,得到初始化题目/简历关键信息"""
        try:
            # 从 PDF 中提取文本
            resume_content = extract_text_from_pdf(file_content)
            if not resume_content:
                return "无法从文件中提取文本内容"

            # 简历内容提取
            content_extraction_future = self.executor.submit(self._extract_resume_content, resume_content)

            # 根据简历生成初始三道题目
            question_prompt = PromptUtils.get_init_question_message(resume_content)
            question_result = self.chatgpt_utils.proxy_ms_api(question_prompt)

            current_questions = []
            if question_result and question_result.strip():
                # 按 "/" 分割问题
                current_questions = [q.strip() for q in question_result.split("/") if q.strip()]

            # 等待简历内容提取完成
            result = content_extraction_future.result()

            # 创建面试记录
            interview = self.interview_service.create_interview(
                user_id=user_id,
                resume=json.dumps(result, ensure_ascii=False),  # 将字典转换为JSON字符串
            )

            # 批量存储问题
            if interview and current_questions:
                self.question_service.batch_create_questions(
                    questions=current_questions,
                    interview_id=interview.id
                )
            return {"resume": result, "interview_id": interview.id}
        except Exception as e:
            return f"分析简历失败: {str(e)}"

    def _extract_resume_content(self, resume_content):
        try:
            prompt = PromptUtils.get_resume_extraction_prompt(resume_content)
            api_response = self.chatgpt_utils.proxy_ms_api(prompt)

            result = self.chatgpt_utils.parse_ai_response(
                api_response,
                regex_extractor=self.chatgpt_utils.extract_with_regex
            )

            return result if result else {}

        except Exception as e:
            log.error(f"简历内容提取失败: {e}", exc_info=True)
            return {}

    def analyze_audio(self, url, user_id, interview_id):
        """
        分析音频文件，累积用户文本，当达到最小长度时发送MQ

        Args:
            url: 音频文件URL
            user_id: 用户ID
            interview_id: 面试ID

        Returns:
            dict: 处理结果
        """
        try:
            # 音频转文字
            sentence = self.aLYAudioConversionUtil.file_trans(url)
            if not sentence or not sentence.strip():
                current_accumulated_length = len(self._user_text_accumulator[user_id])
                log.info(
                    f"文本累积中, interview_id: {interview_id}, 当前长度: {current_accumulated_length}, 需要长度: {self.MIN_ANALYSIS_LENGTH}")
                return f"文本累积中, interview_id: {interview_id},当前内容为:{sentence}"
            should_send_mq = False
            accumulated_text = ""
            with self._accumulator_lock:
                # 累积当前对话的文本
                self._user_text_accumulator[interview_id] += sentence.strip() + " "
                current_length = len(self._user_text_accumulator[interview_id])

                # 检查是否达到最小分析长度
                if current_length >= self.MIN_ANALYSIS_LENGTH:
                    should_send_mq = True
                    accumulated_text = self._user_text_accumulator[interview_id].strip()
                    # 清空累积的文本，准备下一轮累积
                    self._user_text_accumulator[interview_id] = ""

            # 如果达到累计最低阈值，则发送MQ队列等待分析
            if should_send_mq:
                self._send_to_mq(interview_id, user_id, accumulated_text)
                return accumulated_text
            else:
                current_accumulated_length = len(self._user_text_accumulator[interview_id])
                log.info(
                    f"文本累积中, interview_id: {interview_id}, 当前长度: {current_accumulated_length}, 需要长度: {self.MIN_ANALYSIS_LENGTH}")
                return f"文本累积中, interview_id: {interview_id},当前内容为:{sentence}"
        except Exception as e:
            log.error(f"音频分析失败: {e}", exc_info=True)
            return {}

    def _init_mq_connection(self):
        """初始化RabbitMQ连接"""
        try:
            self.queue_name = os.getenv('MQ_QUEUE_NAME')
            self.mq_localhost = os.getenv('MQ_LOCALHOST')
            self.mq_port = os.getenv('MQ_PORT')
            self.mq_username = os.getenv('MQ_USERNAME')
            self.mq_password = os.getenv('MQ_PASSWORD')
            self.connection_params = pika.ConnectionParameters(
                host=self.mq_localhost,
                port=self.mq_port,
                virtual_host='/',
                credentials=pika.PlainCredentials(self.mq_username, self.mq_password)
            )
            log.info("MQ连接参数初始化完成")

        except Exception as e:
            log.error(f"MQ连接初始化失败: {e}", exc_info=True)

    def _send_to_mq(self, interview_id, user_id, accumulated_text):
        """
        发送累积文本到MQ队列

        Args:
            interview_id: 面试ID
            user_id: 用户ID
            accumulated_text: 累积的文本内容
        """
        connection = None
        try:
            # 建立连接
            connection = pika.BlockingConnection(self.connection_params)
            channel = connection.channel()

            # 声明队列（简单队列，不需要交换机）
            channel.queue_declare(
                queue=self.queue_name,
                durable=True,  # 队列持久化
                arguments={
                    'x-message-ttl': 3600000,  # 消息TTL 1小时
                    'x-max-length': 1000  # 队列最大长度
                }
            )

            # 构造消息体
            message = {
                "interview_id": interview_id,
                "user_id": user_id,
                "accumulated_text": accumulated_text,
                "text_length": len(accumulated_text),
                "timestamp": datetime.now().isoformat(),
                "analysis_type": "speech_analysis",
                "version": "1.0"
            }

            # 发送消息到队列
            channel.basic_publish(
                exchange='',  # 使用默认交换机
                routing_key=self.queue_name,
                body=json.dumps(message, ensure_ascii=False),
                properties=pika.BasicProperties(
                    delivery_mode=2,  # 消息持久化
                    content_type='application/json',
                    timestamp=int(datetime.now().timestamp())
                )
            )

            log.info(f"消息发送成功 - interview_id: {interview_id}, user_id: {user_id}, "
                     f"队列: {self.queue_name}, 文本长度: {len(accumulated_text)}")

        except Exception as e:
            log.error(f"MQ消息发送失败: {e}, interview_id: {interview_id}, user_id: {user_id}",
                      exc_info=True)
            raise
        finally:
            if connection and not connection.is_closed:
                connection.close()
