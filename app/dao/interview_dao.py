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
