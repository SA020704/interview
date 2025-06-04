from collections import defaultdict
from typing import Dict, List
from app.utils.pdf_utils import extract_text_from_pdf
from app.utils.prompt_utils import PromptUtils
from app.utils.chatgpt_utils import ChatGptUtils
from app.res import Response
import threading
import concurrent.futures
import logging

log = logging.getLogger(__name__)


class AIService:
    def __init__(self):
        self.chatgpt_utils = ChatGptUtils()
        self.question_historys: Dict[str, List[List[str]]] = defaultdict(list)
        self.question_history_lock = threading.RLock()
        self.executor = concurrent.futures.ThreadPoolExecutor(max_workers=4)

    def analyze_resume(self, file_content, user_id):
        """分析简历内容,得到初始化题目/简历关键信息"""
        try:
            # 从 PDF 中提取文本
            resume_content = extract_text_from_pdf(file_content)
            if not resume_content:
                return Response.error("无法从文件中提取文本内容")

            # 获取或创建用户历史记录
            with self.question_history_lock:
                question_history = self.question_historys[user_id]

            # 简历内容提取 - 异步执行
            content_extraction_future = self.executor.submit(self._extract_resume_content, resume_content)

            # 根据简历生成初始三道题目
            question_prompt = PromptUtils.get_init_question_message(resume_content)
            question_result = self.chatgpt_utils.proxy_ms_api(question_prompt)

            if question_result and question_result.strip():
                # 按 "/" 分割问题
                current_questions = [q.strip() for q in question_result.split("/") if q.strip()]
                with self.question_history_lock:
                    question_history.append(current_questions)

            # 等待简历内容提取完成并返回结果
            return content_extraction_future.result()

        except Exception as e:
            log.error(f"简历分析失败: {e}", exc_info=True)
            return Response.ok({})

    def _extract_resume_content(self, resume_content):
        try:
            prompt = PromptUtils.get_resume_extraction_prompt(resume_content)
            api_response = self.chatgpt_utils.proxy_ms_api(prompt)

            result = self.chatgpt_utils.parse_ai_response(
                api_response,
                regex_extractor=self.chatgpt_utils.extract_with_regex
            )

            return Response.ok(result if result else {})

        except Exception as e:
            log.error(f"简历内容提取失败: {e}", exc_info=True)
            return Response.ok({})
