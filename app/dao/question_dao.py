from typing import List, Optional
from app import db
from app.models.question import Question, Deleted


class QuestionDAO:
    @staticmethod
    def create(question: str, interview_id: int) -> Question:
        """
        创建新问题
        :param question: 问题内容
        :param interview_id: 面试ID
        :return: Question对象
        """
        new_question = Question(
            question=question,
            interview_id=interview_id
        )
        db.session.add(new_question)
        db.session.commit()
        return new_question

    @staticmethod
    def batch_create(questions: List[str], interview_id: int) -> bool:
        """
        批量创建问题
        :param questions: 问题列表
        :param interview_id: 面试ID
        :return: 是否创建成功
        """
        try:
            question_objects = [
                Question(
                    question=question,
                    interview_id=interview_id
                )
                for question in questions
            ]
            db.session.bulk_save_objects(question_objects)
            db.session.commit()
            return True
        except Exception as e:
            db.session.rollback()
            return False

    @staticmethod
    def delete(question_id: int) -> bool:
        """
        软删除问题
        :param question_id: 问题ID
        :return: 是否删除成功
        """
        question = Question.query.get(question_id)
        if not question:
            return False
        
        question.deleted = Deleted.YES.value
        db.session.commit()
        return True

    @staticmethod
    def get_by_id(question_id: int) -> Optional[Question]:
        """
        根据ID获取问题
        :param question_id: 问题ID
        :return: Question对象或None
        """
        return Question.query.get(question_id)

    @staticmethod
    def get_by_interview_id(interview_id: int) -> List[str]:
        """
        根据面试ID获取问题列表
        :param interview_id: 面试ID
        :return: Question对象列表
        """
        return Question.query.filter_by(
            interview_id=interview_id,
            deleted=Deleted.NO.value
        ).with_entities(Question.question).all()

    @staticmethod
    def update(question_id: int, question_content: str) -> Optional[Question]:
        """
        更新问题内容
        :param question_id: 问题ID
        :param question_content: 新的问题内容
        :return: 更新后的Question对象或None
        """
        question = Question.query.get(question_id)
        if not question:
            return None
        
        question.question = question_content
        db.session.commit()
        return question 