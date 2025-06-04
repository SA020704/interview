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
    def create_interview(job, interview_type=None, resume=None):
        interview = Interview(job=job, interview_type=interview_type, resume=resume)
        db.session.add(interview)
        db.session.commit()
        return interview

    @staticmethod
    def update_interview(interview_id, job=None, interview_type=None, resume=None):
        interview = InterviewDao.get_interview(interview_id)
        if interview:
            if job is not None:
                interview.job = job
            if interview_type is not None:
                interview.interview_type = interview_type
            if resume is not None:
                interview.resume = resume
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
