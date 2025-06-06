from app import db
from app.models.interview import Interview, Deleted


class InterviewDao:
    @staticmethod
    def get_interview(interview_id):
        return Interview.query.filter_by(id=interview_id, deleted=Deleted.NO.value).first()

    @staticmethod
    def get_all_interviews():
        return Interview.query.filter_by(deleted=Deleted.NO.value).all()

    @staticmethod
    def create_interview(user_id, resume=None):
        interview = Interview(user_id=user_id, resume=resume)
        db.session.add(interview)
        db.session.commit()
        return interview

    @staticmethod
    def delete_interview(interview_id):
        interview = InterviewDao.get_interview(interview_id)
        if interview:
            interview.deleted = Deleted.YES.value
            db.session.commit()
            return True
        return False

    @staticmethod
    def update_interview(interview):
        try:
            existing_interview = Interview.query.filter_by(
                id=interview.id,
                deleted=Deleted.NO.value
            ).first()

            if not existing_interview:
                return None

            # 更新字段
            existing_interview.user_id = interview.user_id
            existing_interview.resume = interview.resume
            existing_interview.interview_evaluation = interview.interview_evaluation

            # 提交更新
            db.session.commit()
            return existing_interview
        except Exception as e:
            db.session.rollback()
            raise e
