import json
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
        self.executor = concurrent.futures.ThreadPoolExecutor(max_workers=4)

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
            
            return result
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
