from typing import List, Optional
from app.dao.interview_dao import InterviewDao
from app.models.interview import Interview


class InterviewService:
    def __init__(self):
        self.interview_dao = InterviewDao()

    def get_interview(self, interview_id: int) -> Optional[Interview]:
        return self.interview_dao.get_interview(interview_id)

    def get_all_interviews(self) -> List[Interview]:
        return self.interview_dao.get_all_interviews()

    def create_interview(self, user_id: int, resume: str = None) -> Interview:
        return self.interview_dao.create_interview(user_id, resume)

    def delete_interview(self, interview_id: int) -> bool:
        return self.interview_dao.delete_interview(interview_id)
