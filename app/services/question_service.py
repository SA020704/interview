from typing import List
from app import db
from app.dao.question_dao import QuestionDAO
import logging

logger = logging.getLogger(__name__)


class QuestionService:
    def __init__(self):
        self.question_dao = QuestionDAO()

    def create_question(self, question: str, interview_id: int) -> bool:
        """
        创建新问题
        :param question: 问题内容
        :param interview_id: 面试ID
        :return: 是否创建成功
        """
        try:
            self.question_dao.create(question, interview_id)
            return True
        except Exception as e:
            db.session.rollback()
            logger.error(f"创建问题失败: {str(e)}")
            return False

    def batch_create_questions(self, questions: List[str], interview_id: int) -> bool:
        """
        批量创建问题
        :param questions: 问题列表
        :param interview_id: 面试ID
        :return: 是否创建成功
        """
        try:
            return self.question_dao.batch_create(questions, interview_id)
        except Exception as e:
            logger.error(f"批量创建问题失败: {str(e)}")
            return False

    def delete_question(self, question_id: int) -> bool:
        """
        删除问题（软删除）
        :param question_id: 问题ID
        :return: 是否删除成功
        """
        try:
            return self.question_dao.delete(question_id)
        except Exception as e:
            db.session.rollback()
            logger.error(f"删除问题失败: {str(e)}")
            return False

    def get_questions_by_interview_id(self, interview_id: int) -> List[str]:
        """
        根据面试ID获取问题列表
        :param interview_id: 面试ID
        :return: 问题列表
        """
        try:
            return self.question_dao.get_by_interview_id(interview_id)
        except Exception as e:
            logger.error(f"获取问题列表失败: {str(e)}")
            return []

    def update_question(self, question_id: int, question_content: str) -> bool:
        """
        更新问题内容
        :param question_id: 问题ID
        :param question_content: 新的问题内容
        :return: 是否更新成功
        """
        try:
            return bool(self.question_dao.update(question_id, question_content))
        except Exception as e:
            db.session.rollback()
            logger.error(f"更新问题失败: {str(e)}")
            return False 